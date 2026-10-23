// Real App + RN Web; native Alerts/persistence/location use explicit fixture adapters.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require(path.join(process.env.GEZEK_BROWSER_MODULES, 'playwright'));
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8808';
const output = process.env.GEZEK_BROWSER_OUTPUT || 'docs/evidence/settings-hidden';
const ids = ['xp-kugulu-segmenler','erimtan','event-cso-iki-keman-bir-miras-2026-10-16','idea-stromae-racine-carree'];
(async () => {
 const browser = await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const checks=[], errors=[]; fs.mkdirSync(output,{recursive:true});
 const record=(name,details={})=>{checks.push({name,...details});console.log(name)};
 const state=p=>p.evaluate(()=>window.__managementState);
 const frame=p=>p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const shot=async(p,name)=>{await frame(p);await p.waitForFunction(()=>[...document.querySelectorAll('[data-testid="production-settings"] button,[data-testid="production-hidden"] button')].slice(0,3).every(n=>Number(getComputedStyle(n).opacity)>=0.99));await p.screenshot({path:path.join(output,name+'.png')})};
 const openSettings=async p=>{await p.getByRole('button',{name:'Ayarları aç',exact:true}).click();await p.getByTestId('production-settings').waitFor();await frame(p)};
 const openHidden=async p=>{await p.getByRole('button',{name:'Gizlediğim öneriler',exact:true}).click();await p.getByTestId('production-hidden').waitFor();await frame(p)};
 const fresh=async(p,params='')=>{await p.goto(base);await p.waitForFunction(()=>window.__managementState?.step==='results');await frame(p);await p.evaluate(()=>localStorage.clear());await p.goto(base+'/?top=24&'+params);await p.waitForFunction(()=>window.__managementState?.step==='results');await p.evaluate(()=>document.fonts.ready)};
 const back=async p=>{await p.evaluate(()=>window.__hardwareBack());await frame(p)};
 try {
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
   await page.evaluate(()=>{window.__lateEditor=window.__managementCallbacks.applyEditor;window.__lateEditor();window.__lateEditor()});await frame(page);
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
   await page.evaluate(id=>{window.__lateRestore=()=>window.__managementCallbacks.restoreHidden({id,kind:'experience',item:window.__catalog.experiences.find(i=>i.id===id)});const button=document.querySelector('[data-testid="hidden-restore:'+id+'"]');button.click();button.click()},ids[0]);await frame(page);
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
  for(const outcome of ['cancel','failure','local','connected','partial']){
   await fresh(page);await openSettings(page);
   await page.getByRole('button',{name:'Tüm kullanıcı verilerimi kalıcı olarak sil',exact:true}).click();
   assert.equal(await page.evaluate(()=>window.__alerts.at(-1).title),'Tüm verilerini sil?');
   assert.deepEqual(await page.evaluate(()=>window.__alerts.at(-1).buttons.map(b=>[b.text,b.style])),[['Vazgeç','cancel'],['Verilerimi sil','destructive']]);
   if(outcome==='cancel'){await page.evaluate(()=>window.__alerts.at(-1).buttons[0].onPress());assert.equal(await page.evaluate(()=>window.__deleteCalls),0);continue}
   await page.evaluate(()=>{window.__confirm=window.__alerts.at(-1).buttons[1].onPress;window.__confirm();window.__confirm()});await frame(page);
   assert.equal(await page.evaluate(()=>window.__deleteCalls),1);assert.equal(await page.getByRole('button',{name:'Bugünkü tercihlerin',exact:true}).getAttribute('aria-disabled'),'true');
   await back(page);assert.equal((await state(page)).step,'results');
   if(outcome==='failure')await page.evaluate(()=>window.__deleteReject());else await page.evaluate(o=>window.__deleteResolve({remoteUserStateDeleted:o!=='local',anonymousAccountDeleted:o==='connected',anonymousAccountDeletionFailed:o==='partial'}),outcome);
   await frame(page);
   assert.equal(await page.evaluate(()=>window.__alerts.at(-1).title),outcome==='failure'?'Silme tamamlanamadı':outcome==='partial'?'Anonim oturum silinemedi':'Verilerin silindi');
   assert.equal((await state(page)).onboardingCompleted,outcome==='failure');
   await page.evaluate(()=>{window.__confirm();window.__lateEditor?.();window.__lateRestore?.()});assert.equal(await page.evaluate(()=>window.__deleteCalls),1);
   record('Native Alert contract / real busy / duplicate and late callbacks / root completes after Back',{outcome});
  }
  await page.close();assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({checks,errors,evidence:'RN Web with native/service adapters; no physical Android/TalkBack/system-font acceptance'},null,2)+'\n');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
