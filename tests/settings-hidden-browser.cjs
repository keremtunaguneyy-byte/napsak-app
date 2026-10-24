// Real App + RN Web; native Alerts/persistence/location use explicit fixture adapters.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require(path.join(process.env.GEZEK_BROWSER_MODULES, 'playwright'));
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8808';
const staleOnly = process.env.GEZEK_SETTINGS_HIDDEN_CASE === 'stale';
const output = process.env.GEZEK_BROWSER_OUTPUT || 'docs/evidence/settings-hidden';
const ids = ['xp-kugulu-segmenler','erimtan','event-cso-iki-keman-bir-miras-2026-10-16','idea-stromae-racine-carree'];
(async () => {
 const browser = await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const checks=[], errors=[]; fs.mkdirSync(output,{recursive:true});
 const record=(name,details={})=>{checks.push({name,...details});console.log(name)};
 const state=p=>p.evaluate(()=>window.__managementState);
 const frame=p=>p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const shot=async(p,name)=>{if(process.env.GEZEK_BROWSER_SCREENSHOTS==='false')return;await frame(p);await p.waitForFunction(()=>[...document.querySelectorAll('[data-testid="production-settings"] button,[data-testid="production-hidden"] button')].slice(0,3).every(n=>Number(getComputedStyle(n).opacity)>=0.99));await p.screenshot({path:path.join(output,name+'.png')})};
 const openSettings=async p=>{await p.getByRole('button',{name:'Ayarları aç',exact:true}).click();await p.getByTestId('production-settings').waitFor();await frame(p)};
 const openHidden=async p=>{await p.getByRole('button',{name:'Gizlediğim öneriler',exact:true}).click();await p.getByTestId('production-hidden').waitFor();await frame(p)};
 const fresh=async(p,params='')=>{await p.goto(base);await p.waitForFunction(()=>window.__managementState?.step==='results');await frame(p);await p.evaluate(()=>localStorage.clear());await p.goto(base+'/?top=24&'+params);await p.waitForFunction(()=>window.__managementState?.step==='results');await p.evaluate(()=>document.fonts.ready)};
 const back=async p=>{await p.evaluate(()=>window.__hardwareBack());await frame(p)};
 try {
  if(!staleOnly){
  for(const width of [393,412])for(const scale of [1,1.8]){
   const page=await browser.newPage({viewport:{width,height:width===393?852:915},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(String(e)));
   await fresh(page,`scale=${scale}&dismissed=${ids.join(',')},stale-record&saved=ankara-kalesi`);
   await openSettings(page);
   assert.equal(await page.getByRole('button').count(),6);
   assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Ayarlar');
   assert.ok(!(await page.locator('#root').ariaSnapshot()).match(/Profil|Bildirim|Sürüm|Yardım|Gizlilik politikası/));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   if(scale===1)await shot(page,`settings-${width}`);else if(width===393)await shot(page,'settings-large');
   const settingsWrites=await page.evaluate(()=>window.__writes.length);
   await page.getByRole('button',{name:'Bugünkü tercihlerin',exact:true}).click();
   await page.getByRole('heading',{name:'Bugünkü tercihlerin',exact:true}).waitFor();
   assert.equal((await state(page)).preferenceSession.origin.source,'settings');
   await page.getByRole('button',{name:/^Bütçe:/}).click();
   await page.getByRole('button',{name:'Vazgeç',exact:true}).click();
   await page.getByRole('button',{name:'Tercih düzenleyiciyi kapat',exact:true}).click();
   await frame(page);
   assert.equal(await page.evaluate(()=>window.__writes.length),settingsWrites);
   assert.equal((await state(page)).onboardingCompleted,true);
   assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Bugünkü tercihlerin');
   await page.getByRole('button',{name:'Bugünkü tercihlerin',exact:true}).click();
   await page.getByRole('button',{name:/^Bütçe:/}).click();
   await page.getByRole('radio',{name:'₺₺',exact:true}).click();await page.getByRole('button',{name:'Uygula',exact:true}).click();
   await page.evaluate(()=>{const apply=window.__managementCallbacks.applyEditor;if(typeof apply!=='function')throw Error('Missing Apply callback');apply();apply()});await frame(page);
   assert.equal(await page.evaluate(()=>window.__writes.length),settingsWrites+1);
   assert.equal(await page.evaluate(()=>window.__writes.at(-1).budget),'₺₺');
   assert.equal((await state(page)).step,'settings');
   record('Settings exact actions / editor Cancel and coherent Save / completion / duplicate Save',{width,scale});
   await openHidden(page);
   assert.equal(await page.locator('[data-testid^="hidden-row:"]').count(),4);
   assert.equal(await page.getByRole('tab',{name:'Ana Sayfa',exact:true}).getAttribute('aria-selected'),'true');
   assert.ok(!(await page.locator('#root').ariaSnapshot()).includes('stale-record'));
   assert.ok((await page.locator('#root').ariaSnapshot()).includes('Etkinlik sona erdi'));
   for(const id of ids){const row=page.getByTestId('hidden-row:'+id);assert.equal(await row.getByRole('button').count(),1);await row.locator('[data-testid^="hidden-restore:"]').scrollIntoViewIfNeeded();const box=await row.getByRole('button').boundingBox();assert.ok(box.width>=44&&box.height>=44)}
   await page.getByTestId('production-hidden-scroll').evaluate(n=>n.scrollTop=0);await frame(page);
   if(scale===1)await shot(page,`hidden-${width}`);else if(width===393)await shot(page,'hidden-large');
   await page.getByTestId('hidden-row:'+ids[0]).locator('div').first().click();assert.equal((await state(page)).step,'hidden');
   const before=await state(page);
   await page.evaluate(id=>{const button=document.querySelector('[data-testid="hidden-restore:'+id+'"]');button.click();button.click()},ids[0]);await frame(page);
   assert.equal(await page.getByTestId('hidden-row:'+ids[0]).count(),0);
   assert.equal((await state(page)).saved.includes(ids[0]),false);
   assert.deepEqual((await state(page)).filterRuns,before.filterRuns);assert.deepEqual((await state(page)).nearbyRuns,before.nearbyRuns);
   assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-testid')),'hidden-restore:'+ids[1]);
   assert.equal(await page.evaluate(()=>window.__announcements.filter(s=>s==='Öneri gizlenenlerden çıkarıldı.').length),1);
   await page.getByRole('button',{name:'Tüm gizlenen önerileri geri getir',exact:true}).click();await frame(page);
   assert.deepEqual((await state(page)).dismissed,[]);assert.deepEqual((await state(page)).saved,['ankara-kalesi']);
   await page.getByTestId('hidden-empty').waitFor();
   assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Görüntülenecek gizli öneri yok');
   if(width===393&&scale===1)await shot(page,'hidden-empty');
   await page.reload();await openSettings(page);await openHidden(page);await page.getByTestId('hidden-empty').waitFor();
   await back(page);assert.equal((await state(page)).step,'settings');await back(page);assert.equal((await state(page)).step,'results');
   record('Four kinds / static bodies / stale omission / individual and bulk / once-only focus / restart / hardware Back',{width,scale});
   await fresh(page,`scale=${scale}&dismissed=stale-only`);await openSettings(page);await openHidden(page);
   assert.equal(await page.getByRole('button',{name:'Tüm gizlenen önerileri geri getir',exact:true}).count(),0);assert.deepEqual((await state(page)).dismissed,['stale-only']);
   await fresh(page,`scale=${scale}&dismissed=${ids.join(',')}&long=true&inactive=true`);await openSettings(page);await openHidden(page);
   assert.ok((await page.locator('#root').ariaSnapshot()).includes('Şu an önerilmiyor'));
   for(const id of ids){await page.getByTestId('hidden-restore:'+id).scrollIntoViewIfNeeded();const clipped=await page.getByTestId('hidden-row:'+id).evaluate(n=>[...n.querySelectorAll('div')].some(c=>c.scrollWidth>c.clientWidth+1));assert.equal(clipped,false)}
   await page.getByTestId('production-hidden-scroll').evaluate(n=>n.scrollTop=n.scrollHeight);await frame(page);
   const end=await page.getByRole('button',{name:'Önerilere dön',exact:true}).last().boundingBox(), nav=await page.getByRole('tablist').boundingBox();assert.ok(end.y+end.height<=nav.y-23);
   record('Stale-only / inactive fixture / long Turkish title / reachable footer / no clipping',{width,scale});
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:393,height:852}});page.on('pageerror',e=>errors.push(String(e)));
  for(const origin of ['results','saved','guides']){
   await fresh(page,`dismissed=${ids.join(',')}&saved=${ids.join(',')},ankara-kalesi`);
   if(origin!=='results')await page.getByRole('tab',{name:origin==='saved'?'Kaydedilenler':'Ankara 101',exact:true}).click();
   const scroll=page.getByTestId(origin==='saved'?'production-saved-scroll':origin==='guides'?'ankara101-index-scroll':'production-home-scroll');
   // Capture native scroll callbacks as well as DOM position.
   if(await scroll.count()) {await scroll.evaluate(n=>n.scrollTop=200);await frame(page)}
   const callerY=await scroll.count()?await scroll.evaluate(n=>n.scrollTop):0;
   const caller=await state(page);
   await openSettings(page);await openHidden(page);
   const tab=origin==='results'?'Ana Sayfa':origin==='saved'?'Kaydedilenler':'Ankara 101';assert.equal(await page.getByRole('tab',{name:tab,exact:true}).getAttribute('aria-selected'),'true');
   await back(page);assert.equal((await state(page)).step,'settings');await openHidden(page);
   await page.getByRole('button',{name:'Gizlediğim önerileri kapat',exact:true}).click();await frame(page);
   assert.equal((await state(page)).step,origin);await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Ayarları aç');
   if(origin!=='results'&&await scroll.count())await page.waitForFunction(({testid,y})=>Math.abs(document.querySelector('[data-testid="'+testid+'"]').scrollTop-y)<2,{testid:origin==='saved'?'production-saved-scroll':'ankara101-index-scroll',y:callerY});assert.equal((await state(page)).filter,caller.filter);assert.deepEqual((await state(page)).filterRuns,caller.filterRuns);
   if(origin==='saved')await shot(page,'origin-return');
   record('Typed caller / Hidden Back to Settings / full Close and gear focus',{origin});
  }
  await fresh(page,`dismissed=${ids[1]}`);
  await page.getByRole('button',{name:'Gizlediğim 1 öneriyi göster',exact:true}).click();await frame(page);const direct=await state(page);await back(page);assert.equal((await state(page)).step,'results');assert.deepEqual((await state(page)).filterRuns,direct.filterRuns);record('Direct Home Hidden entry / hardware Back / no seed or history consumption');
  await fresh(page,`dismissed=${ids[1]}`);await openSettings(page);await openHidden(page);
  await page.evaluate(()=>window.__diskFailure=true);await page.getByTestId('hidden-restore:'+ids[1]).click();await frame(page);
  assert.deepEqual((await state(page)).dismissed,[]);assert.equal(await page.evaluate(()=>window.__alerts.at(-1).title),'Kayıt yapılamadı');
  await page.evaluate(()=>window.__alerts.at(-1).buttons[0].onPress());await frame(page);assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Görüntülenecek gizli öneri yok');
  record('Actual failed persistence adapter: optimistic empty remains, Alert acknowledgement restores focus');
  await fresh(page);await openSettings(page);
  await page.getByRole('button',{name:'Tüm kullanıcı verilerimi kalıcı olarak sil',exact:true}).click();
  assert.deepEqual(await page.evaluate(()=>window.__alerts.at(-1).buttons.map(b=>[b.text,b.style])),[['Vazgeç','cancel'],['Verilerimi sil','destructive']]);
  await page.evaluate(()=>window.__alerts.at(-1).buttons[0].onPress());assert.equal(await page.evaluate(()=>window.__deleteCalls),0);
  record('Native Alert Cancel writes nothing');
  await page.close();
  }

  const origins=process.env.GEZEK_STALE_ORIGIN?[process.env.GEZEK_STALE_ORIGIN]:['results','saved','guides'];
  const outcomes=process.env.GEZEK_STALE_OUTCOME?[process.env.GEZEK_STALE_OUTCOME]:['failure','local','connected','partial'];
  const callbackNames=['applyEditor','navigatePreferenceEditor','restoreHidden','restoreAllHidden'];
  for(const origin of origins)for(const outcome of outcomes){
   const page=await browser.newPage({viewport:{width:393,height:852}});page.on('pageerror',e=>errors.push(String(e)));
   await fresh(page);
   const savedIds=await page.evaluate(hidden=>window.__catalog.places.filter(item=>!hidden.includes(item.id)).slice(0,12).map(item=>item.id),ids);
   await fresh(page,`dismissed=${ids.join(',')},stale-record&saved=${savedIds.join(',')}`);
   if(origin!=='results')await page.getByRole('tab',{name:origin==='saved'?'Kaydedilenler':'Ankara 101',exact:true}).click();
   const callerScroll=page.getByTestId(origin==='saved'?'production-saved-scroll':origin==='guides'?'ankara101-index-scroll':'production-home-scroll');
   await callerScroll.waitFor();
   if(origin!=='results'){await callerScroll.evaluate(n=>n.scrollTop=200);await frame(page)}
   await openSettings(page);
   const caller=(await state(page)).navigation.management.origin;
   assert.equal(caller.screen,origin);
   if(origin!=='results')assert.ok(caller.scrollY>0,'exercise a nonzero Saved/Ankara caller viewport');
   await page.getByRole('button',{name:'Bugünkü tercihlerin',exact:true}).click();
   await page.getByRole('button',{name:/^Bütçe:/}).click();
   await page.getByRole('radio',{name:'₺₺',exact:true}).click();await page.getByRole('button',{name:'Uygula',exact:true}).click();
   // Retain actual function objects with a live, unapplied draft; never look up a newer callback on invocation.
   const documentId=await page.evaluate(()=>{
    window.__staleDocumentId=crypto.randomUUID();
    window.__captured=Object.freeze({applyEditor:window.__managementCallbacks.applyEditor,navigatePreferenceEditor:window.__managementCallbacks.navigatePreferenceEditor});
    return window.__staleDocumentId;
   });
   assert.equal((await state(page)).preferenceSession.draft.budget,'₺₺');
   await page.getByRole('button',{name:'Tercih düzenleyiciyi kapat',exact:true}).click();await frame(page);
   assert.notEqual((await state(page)).preferences.budget,'₺₺','stale Apply would have a real observable preference effect');
   await openHidden(page);
   await page.evaluate(id=>{
    const entry={id,kind:'experience',item:window.__catalog.experiences.find(item=>item.id===id)};
    if(!entry.item)throw Error('Missing stale restore fixture');
    window.__captured=Object.freeze({...window.__captured,restoreHidden:window.__managementCallbacks.restoreHidden,restoreAllHidden:window.__managementCallbacks.restoreAllHidden});
    window.__capturedIdentity=window.__captured;
    window.__capturedRestoreEntry=entry;
   },ids[0]);
   const assertCaptured=async()=>{
    const capture=await page.evaluate(names=>({documentId:window.__staleDocumentId,types:names.map(name=>typeof window.__captured[name]),sameIdentity:window.__captured===window.__capturedIdentity}),callbackNames);
    assert.equal(capture.documentId,documentId,'captured callbacks must stay in the same document');
    assert.deepEqual(capture.types,callbackNames.map(()=> 'function'),'every historical function must exist and be callable');
    assert.equal(capture.sameIdentity,true,'never replace captured historical callback objects');
   };
   await assertCaptured();
   await back(page);assert.equal((await state(page)).step,'settings');
   assert.deepEqual(await page.evaluate(names=>names.map(name=>window.__captured[name]!==window.__managementCallbacks[name]),callbackNames),callbackNames.map(()=>true),'invoke historical objects, never the current callback lookup');
   assert.deepEqual((await state(page)).dismissed,[...ids,'stale-record']);assert.deepEqual((await state(page)).saved,savedIds);
   assert.equal((await state(page)).preferenceSession,undefined);
   // Capture both current state and the actual cache. Each invocation must leave all categories unchanged.
   const invariant=()=>page.evaluate(()=>({
    state:structuredClone(window.__managementState),cache:structuredClone(window.__managementSnapshots()),
    localWrites:structuredClone(window.__writes),remoteWrites:structuredClone(window.__remoteWrites),
    durable:localStorage.getItem('gezek-management-browser'),deleteCalls:window.__deleteCalls,
    scrolls:['production-home-scroll','production-saved-scroll','ankara101-index-scroll','production-settings-scroll','production-hidden-scroll'].map(id=>({id,positions:[...document.querySelectorAll('[data-testid="'+id+'"]')].map(n=>n.scrollTop)}))
   }));
   const invokeStale=async phase=>{
    for(const name of callbackNames){
     await assertCaptured();const before=await invariant();
     const returned=await page.evaluate(name=>{
      const captured=window.__captured;
      if(typeof captured[name]!=='function')throw Error('Missing captured callback: '+name);
      if(name==='navigatePreferenceEditor')return captured[name]({type:'field',field:'budget'});
      if(name==='restoreHidden')return captured[name](window.__capturedRestoreEntry);
      return captured[name]();
     },name);
     await frame(page);const after=await invariant();
     for(const key of Object.keys(before.state))assert.ok(JSON.stringify(after.state[key])===JSON.stringify(before.state[key]),`${origin}/${outcome}/${phase}/${name} changed state.${key}`);
     for(const key of Object.keys(before).filter(key=>key!=='state'))assert.ok(JSON.stringify(after[key])===JSON.stringify(before[key]),`${origin}/${outcome}/${phase}/${name} changed ${key}`);
     if(name.startsWith('restore'))assert.equal(returned,false,`${phase}: stale restore must be rejected`);
    }
   };
   await page.getByRole('button',{name:'Tüm kullanıcı verilerimi kalıcı olarak sil',exact:true}).click();
   assert.equal(await page.evaluate(()=>window.__alerts.at(-1).title),'Tüm verilerini sil?');
   await assertCaptured(); // Required before the destructive confirmation, not after a reload.
   await page.evaluate(()=>{
    window.__confirm=window.__alerts.at(-1).buttons[1].onPress;
    if(typeof window.__confirm!=='function')throw Error('Missing deletion confirmation');
    window.__confirm();window.__confirm();
   });await frame(page);
   assert.equal(await page.evaluate(()=>window.__deleteCalls),1);assert.equal((await state(page)).deletionBusy,true);
   assert.equal(await page.getByRole('button',{name:'Bugünkü tercihlerin',exact:true}).getAttribute('aria-disabled'),'true');
   await invokeStale('busy-settings');
   await back(page);assert.equal((await state(page)).step,origin);await frame(page);
   await invokeStale('busy-caller');
   if(origin!=='results')assert.ok(Math.abs(await callerScroll.evaluate(n=>n.scrollTop)-caller.scrollY)<2,'busy caller keeps captured scroll');
   if(outcome==='failure')await page.evaluate(()=>window.__deleteReject());else await page.evaluate(o=>window.__deleteResolve({remoteUserStateDeleted:o!=='local',anonymousAccountDeleted:o==='connected',anonymousAccountDeletionFailed:o==='partial'}),outcome);
   await page.waitForFunction(()=>window.__managementState.deletionBusy===false);await frame(page);
   assert.equal(await page.evaluate(()=>window.__alerts.at(-1).title),outcome==='failure'?'Silme tamamlanamadı':outcome==='partial'?'Anonim oturum silinemedi':'Verilerin silindi');
   const completed=await state(page);
   assert.equal(completed.onboardingCompleted,outcome==='failure');assert.equal(completed.step,outcome==='failure'?origin:'welcome');
   if(outcome==='failure'){
    assert.deepEqual(completed.dismissed,[...ids,'stale-record']);assert.deepEqual(completed.saved,savedIds);
    assert.deepEqual(completed.navigation.management.origin,caller);
    if(origin!=='results')assert.ok(Math.abs(await callerScroll.evaluate(n=>n.scrollTop)-caller.scrollY)<2,'failure does not reset the caller viewport');
   }else{assert.deepEqual(completed.dismissed,[]);assert.deepEqual(completed.saved,[])}
   await invokeStale(outcome==='failure'?'after-failure-no-reset':'after-completed-reset');
   await page.evaluate(()=>window.__alerts.at(-1).buttons[0].onPress());await frame(page);
   await invokeStale('after-result-acknowledgement');
   await page.evaluate(()=>window.__confirm());assert.equal(await page.evaluate(()=>window.__deleteCalls),1);
   record('Retained historical editor/restore callbacks are inert in one document while busy and after result',{origin,outcome,phases:4,callbacks:callbackNames.length});
   await page.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({checks,errors,evidence:'RN Web with native/service adapters; no physical Android/TalkBack/system-font acceptance'},null,2)+'\n');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
