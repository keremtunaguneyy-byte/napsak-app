// Commit/RAF diagnostics of the actual onboarding scene in RN Web, not native timing.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, devices } = require(path.join(process.env.GEZEK_BROWSER_MODULES, 'playwright'));
const output = process.env.GEZEK_BROWSER_EVIDENCE;
const baseline = process.env.GEZEK_TRANSITION_BASELINE === 'true';
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8778';
(async () => {
  const browser = await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  fs.mkdirSync(output,{recursive:true});
  const results=[], errors=[];
  const next = page => page.getByRole('button',{name:'Devam et',exact:true});
  const back = page => page.getByRole('button',{name:'Önceki adıma dön',exact:true});
  async function settle(page) {
    await page.waitForFunction(() => window.__onboardingReduced || window.__sceneRevision===0 || window.__transitionAnimations.some(a=>a.revision===window.__sceneRevision));
    await page.waitForFunction(() => {
      const last=window.__transitionAnimations.at(-1);
      return !last || last.end;
    });
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r)))));
  }
  async function newPage(viewport,reducedMotion) {
    const page=await browser.newPage({...devices['Pixel 7'],viewport,deviceScaleFactor:1,reducedMotion});
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(() => {
      window.__paintFrames=[];window.__focusFrames=[];window.__actions=[];window.__frameNumber=0;
      const nativeRAF=window.requestAnimationFrame.bind(window);let timestamp=-1;
      window.requestAnimationFrame=callback=>nativeRAF(time=>{if(time!==timestamp){timestamp=time;window.__frameNumber++;}callback(time)});
      const channel=new MessageChannel();
      // Read after this RAF batch so an earlier observer callback cannot count a
      // still-offscreen value before Animated's update in the same rendered frame.
      const sampleScene=()=>{
        const node=document.querySelector('[data-testid="onboarding-scene"]');
        if(!node||window.__paintFrames.length>=1500)return;
        const viewportWidth=window.visualViewport?.width||innerWidth;
        const visible=[...node.querySelectorAll('[role="heading"], [role="button"], [role="radio"], [role="checkbox"], [aria-label="Gezek"]')].some(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&r.left<viewportWidth-1&&r.right>1&&r.top<innerHeight&&r.bottom>0});
        window.__paintFrames.push({revision:window.__sceneRevision,frame:window.__frameNumber,time:performance.now(),x:new DOMMatrixReadOnly(getComputedStyle(node).transform).m41,visible});
      };
      channel.port1.onmessage=sampleScene;
      window.__sampleNativeProperty=sampleScene;
      const sample=()=>{channel.port2.postMessage(null);requestAnimationFrame(sample)};
      requestAnimationFrame(sample);
      document.addEventListener('click',()=>{if(window.__pendingAction){window.__actions.push({label:window.__pendingAction,time:performance.now(),frame:window.__frameNumber});window.__pendingAction=undefined;}},true);
      document.addEventListener('focusin',e=>{if(e.target.closest('[data-testid="onboarding-scene"]'))window.__focusFrames.push({revision:window.__sceneRevision,time:performance.now(),label:e.target.getAttribute('aria-label')})});
    });
    await page.goto(base);await page.getByTestId('production-onboarding').waitFor();
    await page.waitForFunction(value=>window.__onboardingReduced===value,reducedMotion==='reduce');
    await settle(page);return page;
  }
  async function snapshot(page) {return page.evaluate(()=>({commits:window.__transitionCommits,animations:window.__transitionAnimations,frames:window.__paintFrames,focus:window.__focusFrames,assets:window.__assetProfiles,actions:window.__actions,decorations:window.__decorativeDiagnostics||[]}));}
  function evidenceTrace(trace) {
    // Keep first-commit asset work, not thousands of zero-cost timeline rerenders.
    return {...trace,assets:trace.assets.filter(asset=>trace.commits.some(commit=>commit.revision===asset.revision&&asset.time<=commit.time+1))};
  }
  async function action(page,label,callback) {
    await page.evaluate(label=>{window.__pendingAction=label},label);
    await callback();await settle(page);
  }
  function measure(trace,revision,label) {
    const commit=trace.commits.find(c=>c.revision===revision), motion=trace.animations.find(a=>a.revision===revision);
    const action=trace.actions.find(a=>a.label===label);
    const assetMs=trace.assets.filter(a=>a.revision===revision&&a.time<=commit.time+1).reduce((sum,a)=>sum+a.duration,0);
    const frames=trace.frames.filter(f=>f.revision===revision&&f.time>=commit.time);
    const first=frames.find(f=>f.visible&&Math.abs(f.x)<Math.abs(commit.x)-1);
    const settled=frames.find(f=>Math.abs(f.x)<.1);
    assert.ok(first&&settled,JSON.stringify({label,frames}));
    const measurement={label,revision,commitX:commit.x,renderToCommitMs:commit.renderMs,pressToCommitMs:commit.time-action.time,commitToFirstVisibleMs:first.time-commit.time,firstVisibleToSettledMs:settled.time-first.time,pressToFirstVisibleFrames:first.frame-action.frame,firstVisibleFrame:first.frame,pressFrame:action.frame,commitToStartMs:motion.start-commit.time,animationMs:motion.end-motion.start,configuredDurationMs:motion.duration,firstFrameProgress:motion.firstFrameProgress,assetSubtreeMs:assetMs};
    const during=trace.decorations.filter(e=>e.revision===revision&&e.time>=action.time&&e.time<motion.end);
    measurement.slideCounts=Object.fromEntries(['scene-render','background-render','route-render','route-recompose','timeline-update'].map(kind=>[kind,during.filter(e=>e.kind===kind).length]));
    const intervals=times=>times.slice(1).map((t,i)=>t-times[i]);
    const summary=values=>values.length?{samples:values.length,min:Math.min(...values),median:[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)],max:Math.max(...values)}:null;
    measurement.timelineUpdateIntervalsMs=summary(intervals(during.filter(e=>e.kind==='timeline-update').map(e=>e.time)));
    measurement.jsFrameIntervalsMs=summary(intervals([...new Map(frames.filter(f=>f.time<motion.end).map(f=>[f.frame,f.time])).values()]));
    if(!baseline) {
      assert.ok(measurement.slideCounts['scene-render']<=2,JSON.stringify(measurement));
      assert.equal(measurement.slideCounts['timeline-update'],0);
      assert.equal(measurement.slideCounts['route-recompose'],0);
      if(measurement.pressToFirstVisibleFrames>2)fs.writeFileSync(path.join(output,'failed-frame-trace.json'),JSON.stringify(trace,null,2)+'\n');
      assert.ok(measurement.pressToFirstVisibleFrames<=2,JSON.stringify(measurement));
      assert.ok(motion.duration<=(commit.x<0?280:320));
      assert.ok(measurement.animationMs<=(commit.x<0?280:320),JSON.stringify(measurement));
      assert.equal(motion.nativeDriver,true);
      assert.ok(motion.firstFrameProgress>.15);
    }
    return measurement;
  }
  function assertTrace(trace,viewport) {
    for(const commit of trace.commits.filter(c=>c.revision>0&&!c.reduced)) {
      assert.equal(Math.abs(commit.x),viewport.width,JSON.stringify(commit));
      assert.equal(commit.value,commit.x);
      const motion=trace.animations.find(a=>a.revision===commit.revision);
      if(motion) {assert.ok(motion.start>=commit.time);assert.equal(motion.x,commit.x);}
      for(const frame of trace.frames.filter(f=>f.revision===commit.revision&&motion&&f.time<motion.start))assert.equal(frame.x,commit.x);
    }
    for(const focus of trace.focus.filter(f=>f.revision>0)) {
      const motion=trace.animations.find(a=>a.revision===focus.revision);
      if(motion&&motion.finished) assert.ok(focus.time>=motion.end,JSON.stringify({focus,motion}));
      if(motion&&!motion.finished) assert.fail('Interrupted scene stole focus: '+JSON.stringify(focus));
    }
  }
  try {
    for(const viewport of [{width:393,height:852},{width:412,height:915}]) {
      const page=await newPage(viewport,'no-preference');
      await action(page,'cold-forward',()=>page.getByRole('button',{name:'Başlayalım',exact:true}).click());
      await page.getByRole('radio',{name:/^Sakin:/}).click();
      await action(page,'first-interests',()=>next(page).click());
      await action(page,'warm-back',()=>back(page).click());
      await action(page,'warm-forward',()=>next(page).click());
      const measured=await snapshot(page);
      const measurements=[measure(measured,1,'cold-forward'),measure(measured,3,'warm-back'),measure(measured,4,'warm-forward')];
      const idleStart=await page.evaluate(()=>performance.now());
      await page.waitForTimeout(1600); // Observe settled decoration, not a production delay.
      const idleTrace=await snapshot(page);
      const idleEvents=idleTrace.decorations.filter(e=>e.revision===4&&e.time>=idleStart);
      const idleCounts=Object.fromEntries(['scene-render','background-render','route-recompose','timeline-update'].map(kind=>[kind,idleEvents.filter(e=>e.kind===kind).length]));
      const quietStart=await page.evaluate(()=>performance.now());await page.waitForTimeout(1200);
      const quietTrace=await snapshot(page);
      const quietEvents=quietTrace.decorations.filter(e=>e.revision===4&&e.time>=quietStart);
      const quietCounts=Object.fromEntries(['scene-render','background-render','route-recompose','timeline-update'].map(kind=>[kind,quietEvents.filter(e=>e.kind===kind).length]));
      if(!baseline) {
        assert.equal(idleCounts['scene-render'],0);
        assert.equal(idleCounts['background-render'],0);
        assert.ok(idleCounts['timeline-update']>0&&idleCounts['route-recompose']>0); // Approved decoration still runs, locally.
        assert.ok(Object.values(quietCounts).every(count=>count===0),JSON.stringify(quietCounts));
        assert.equal(await page.getByRole('progressbar').evaluate(el=>el.firstElementChild.style.width),'30%');
        for(const motion of quietTrace.animations) {
          const starts=quietTrace.decorations.filter(e=>e.revision===motion.revision&&e.kind==='timeline-start');
          assert.ok(starts.every(e=>motion.finished&&e.time>=motion.end),JSON.stringify({motion,starts}));
        }
        assertTrace(measured,viewport);
        assert.ok(measured.commits.find(c=>c.revision===1).x>0);
        assert.ok(measured.commits.find(c=>c.revision===3).x<0);
        // Interrupt a real running animation, then rapidly alternate queued actions.
        assert.equal(await page.evaluate(()=>window.__hardwareBack()),true);
        await page.waitForFunction(()=>window.__transitionAnimations.some(a=>a.revision===5));
        await page.evaluate(()=>{window.__onboardingAction({type:'next'});window.__onboardingAction({type:'back'});window.__onboardingAction({type:'next'})});
        await page.waitForFunction(()=>window.__sceneRevision===8);await settle(page);
        assert.equal(await page.getByRole('checkbox',{name:/^Kahve:/}).count(),1);
        const trace=await snapshot(page);assertTrace(trace,viewport);
        assert.equal(trace.animations.find(a=>a.revision===5).finished,false);
        assert.ok(trace.focus.some(f=>f.revision===8&&f.label==='Neler ilgini çekiyor?'));
        assert.ok(!trace.focus.some(f=>[5,6,7].includes(f.revision)));
        assert.ok(!trace.decorations.some(e=>[5,6,7].includes(e.revision)&&e.kind==='timeline-start'));
        for(const kind of ['timeline','shimmer','spinner']) {
          const old=trace.decorations.filter(e=>e.revision<8);
          assert.equal(old.filter(e=>e.kind===kind+'-start').length,old.filter(e=>e.kind===kind+'-stop').length,kind+' cleanup');
        }
        assert.equal(await page.getByTestId('onboarding-scene').evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).m41),0);
        await page.screenshot({path:path.join(output,`surviving-transition-${viewport.width}.png`)});
        // A live OS Reduced Motion change settles immediately; switching back never replays.
        await page.evaluate(()=>window.__onboardingAction({type:'back'}));
        await page.waitForFunction(()=>window.__transitionAnimations.some(a=>a.revision===9));
        await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>window.__onboardingReduced===true);await settle(page);
        const reducedAt=await page.evaluate(()=>performance.now());await page.waitForTimeout(150);
        assert.ok(!(await snapshot(page)).decorations.some(e=>e.time>reducedAt&&e.kind.endsWith('-start')));
        assert.equal(await page.getByTestId('onboarding-scene').evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).m41),0);
        const count=await page.evaluate(()=>window.__transitionAnimations.length);
        await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>window.__onboardingReduced===false);await settle(page);
        assert.equal(await page.evaluate(()=>window.__transitionAnimations.length),count);
      }
      results.push({viewport,measurements,idleObservationMs:1600,idleCounts,quietObservationMs:1200,quietCounts,trace:evidenceTrace(await snapshot(page))});await page.close();
      if(!baseline) {
        const reduced=await newPage(viewport,'reduce');
        await action(reduced,'reduced-forward',()=>reduced.getByRole('button',{name:'Başlayalım',exact:true}).click());
        await action(reduced,'reduced-back',()=>back(reduced).click());
        const trace=await snapshot(reduced);
        assert.equal(trace.animations.length,0);assert.ok(trace.commits.every(c=>c.x===0));
        assert.ok(!trace.decorations.some(e=>e.kind.endsWith('-start')||e.kind==='timeline-update'));
        assert.ok(trace.focus.some(f=>f.revision===2&&f.label==='Bugün sana uyan bir plan bulalım.'));
        results.push({viewport,reducedMotion:true,trace:evidenceTrace(trace)});await reduced.close();

        const preparing=await newPage(viewport,'no-preference');
        await action(preparing,'prepare-mood',()=>preparing.getByRole('button',{name:'Başlayalım',exact:true}).click());
        await preparing.getByRole('radio',{name:/^Sakin:/}).click();await action(preparing,'prepare-interest',()=>next(preparing).click());
        await preparing.getByRole('checkbox',{name:/^Kahve:/}).click();await action(preparing,'prepare-budget',()=>next(preparing).click());
        await preparing.getByRole('radio',{name:/^Bedava:/}).click();await action(preparing,'prepare-group',()=>next(preparing).click());
        await preparing.getByRole('radio',{name:/^2:/}).click();await action(preparing,'prepare-duration',()=>next(preparing).click());
        await preparing.getByRole('radio',{name:/^1–2 saat:/}).click();
        await action(preparing,'prepare',()=>preparing.getByRole('button',{name:'Planımı hazırla',exact:true}).click());
        const stageStart=await preparing.evaluate(()=>performance.now());
        for(const text of ['Seçimlerin eşleştiriliyor','Sana uygun rotalar taranıyor','Planın dengeleniyor','Son dokunuşlar yapılıyor'])await preparing.getByText(text,{exact:true}).waitFor();
        await preparing.screenshot({path:path.join(output,`preparing-isolated-${viewport.width}.png`)});
        await preparing.getByRole('button',{name:'Planı Gör',exact:true}).waitFor();
        await preparing.waitForTimeout(100);
        const preparedTrace=await snapshot(preparing);
        const preparingRenders=preparedTrace.decorations.filter(e=>e.revision===6&&e.kind==='scene-render'&&e.time>=stageStart);
        assert.ok(preparingRenders.every(e=>e.prepared)); // Ready publication/footer measurement only.
        assert.ok(preparingRenders.length<=2);
        assert.ok(preparedTrace.decorations.some(e=>e.revision===6&&e.kind==='spinner-start'));
        assert.ok(preparedTrace.decorations.some(e=>e.revision===6&&e.kind==='spinner-stop'));
        await preparing.screenshot({path:path.join(output,`ready-isolated-${viewport.width}.png`)});
        await preparing.evaluate(()=>{window.__departedFinish=window.__finishOnboarding;window.__finishOnboarding();window.__finishOnboarding()});
        await preparing.getByRole('button',{name:/^Bugünkü tercihler:/}).waitFor();await preparing.evaluate(()=>window.__departedFinish());
        assert.equal(await preparing.evaluate(()=>window.__writes.length),1);
        assert.equal(await preparing.evaluate(()=>window.__events.filter(e=>e.name==='preference_flow_completed').length),1);
        const completedTrace=await snapshot(preparing);
        for(const kind of ['timeline','shimmer','spinner'])assert.equal(completedTrace.decorations.filter(e=>e.kind===kind+'-start').length,completedTrace.decorations.filter(e=>e.kind===kind+'-stop').length,kind+' completion cleanup');
        results.push({viewport,preparingReady:true,singleWriteSingleEvent:true,trace:evidenceTrace(completedTrace)});await preparing.close();
      }
    }
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(output,'transition-results.json'),JSON.stringify({passed:true,baseline,browserDiagnosticOnly:true,results,errors},null,2)+'\n');
    console.log(JSON.stringify({passed:true,baseline,measurements:results.filter(r=>r.measurements).map(r=>({viewport:r.viewport,measurements:r.measurements})),errors},null,2));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
