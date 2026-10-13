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
      window.__paintFrames=[];window.__focusFrames=[];window.__actions=[];
      const sample=()=>{const node=document.querySelector('[data-testid="onboarding-scene"]');if(node&&window.__paintFrames.length<1500)window.__paintFrames.push({revision:window.__sceneRevision,time:performance.now(),x:new DOMMatrixReadOnly(getComputedStyle(node).transform).m41});requestAnimationFrame(sample)};
      requestAnimationFrame(sample);
      document.addEventListener('focusin',e=>{if(e.target.closest('[data-testid="onboarding-scene"]'))window.__focusFrames.push({revision:window.__sceneRevision,time:performance.now(),label:e.target.getAttribute('aria-label')})});
    });
    await page.goto(base);await page.getByTestId('production-onboarding').waitFor();
    await page.waitForFunction(value=>window.__onboardingReduced===value,reducedMotion==='reduce');
    await settle(page);return page;
  }
  async function snapshot(page) {return page.evaluate(()=>({commits:window.__transitionCommits,animations:window.__transitionAnimations,frames:window.__paintFrames,focus:window.__focusFrames,assets:window.__assetProfiles,actions:window.__actions}));}
  function evidenceTrace(trace) {
    // Keep first-commit asset work, not thousands of zero-cost timeline rerenders.
    return {...trace,assets:trace.assets.filter(asset=>trace.commits.some(commit=>commit.revision===asset.revision&&asset.time<=commit.time+1))};
  }
  async function action(page,label,callback) {
    await page.evaluate(label=>window.__actions.push({label,time:performance.now()}),label);
    await callback();await settle(page);
  }
  function measure(trace,revision,label) {
    const commit=trace.commits.find(c=>c.revision===revision), motion=trace.animations.find(a=>a.revision===revision);
    const action=trace.actions.find(a=>a.label===label);
    const assetMs=trace.assets.filter(a=>a.revision===revision&&a.time<=commit.time+1).reduce((sum,a)=>sum+a.duration,0);
    return {label,revision,commitX:commit.x,renderToCommitMs:commit.renderMs,actionToCommitMs:commit.time-action.time,commitToStartMs:motion.start-commit.time,animationMs:motion.end-motion.start,assetSubtreeMs:assetMs};
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
      if(!baseline) {
        assertTrace(measured,viewport);
        assert.ok(measured.commits.find(c=>c.revision===1).x>0);
        assert.ok(measured.commits.find(c=>c.revision===3).x<0);
        // Interrupt a real running animation, then rapidly alternate queued actions.
        await page.evaluate(()=>window.__onboardingAction({type:'back'}));
        await page.waitForFunction(()=>window.__transitionAnimations.some(a=>a.revision===5));
        await page.evaluate(()=>{window.__onboardingAction({type:'next'});window.__onboardingAction({type:'back'});window.__onboardingAction({type:'next'})});
        await page.waitForFunction(()=>window.__sceneRevision===8);await settle(page);
        assert.equal(await page.getByRole('checkbox',{name:/^Kahve:/}).count(),1);
        const trace=await snapshot(page);assertTrace(trace,viewport);
        assert.equal(trace.animations.find(a=>a.revision===5).finished,false);
        assert.ok(trace.focus.some(f=>f.revision===8&&f.label==='Neler ilgini çekiyor?'));
        assert.ok(!trace.focus.some(f=>[5,6,7].includes(f.revision)));
        await page.screenshot({path:path.join(output,`surviving-transition-${viewport.width}.png`)});
        // A live OS Reduced Motion change settles immediately; switching back never replays.
        await page.evaluate(()=>window.__onboardingAction({type:'back'}));
        await page.waitForFunction(()=>window.__transitionAnimations.some(a=>a.revision===9));
        await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>window.__onboardingReduced===true);await settle(page);
        assert.equal(await page.getByTestId('onboarding-scene').evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).m41),0);
        const count=await page.evaluate(()=>window.__transitionAnimations.length);
        await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>window.__onboardingReduced===false);await settle(page);
        assert.equal(await page.evaluate(()=>window.__transitionAnimations.length),count);
      }
      results.push({viewport,measurements,trace:evidenceTrace(await snapshot(page))});await page.close();
      if(!baseline) {
        const reduced=await newPage(viewport,'reduce');
        await action(reduced,'reduced-forward',()=>reduced.getByRole('button',{name:'Başlayalım',exact:true}).click());
        await action(reduced,'reduced-back',()=>back(reduced).click());
        const trace=await snapshot(reduced);
        assert.equal(trace.animations.length,0);assert.ok(trace.commits.every(c=>c.x===0));
        assert.ok(trace.focus.some(f=>f.revision===2&&f.label==='Bugün sana uyan bir plan bulalım.'));
        results.push({viewport,reducedMotion:true,trace:evidenceTrace(trace)});await reduced.close();
      }
    }
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(output,'transition-results.json'),JSON.stringify({passed:true,baseline,browserDiagnosticOnly:true,results,errors},null,2)+'\n');
    console.log(JSON.stringify({passed:true,baseline,measurements:results.filter(r=>r.measurements).map(r=>({viewport:r.viewport,measurements:r.measurements})),errors},null,2));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
