// Actual App/OnboardingHost rendered through RN Web with native/backend/storage fixture adapters.
// This evidence is not a native device, TalkBack or signed-release result.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, devices } = require(path.join(process.env.GEZEK_BROWSER_MODULES, 'playwright'));
const output = process.env.GEZEK_BROWSER_EVIDENCE || 'docs/evidence/onboarding';
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8778';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  fs.mkdirSync(output, { recursive: true });
  const checks = [], errors = [];
  const check = (name, data = {}) => checks.push({ name, ...data });
  const next = page => page.getByRole('button', { name: 'Devam et', exact: true });
  const heading = (page, name) => page.getByRole('heading', { name, exact: true });
  const back = page => page.getByRole('button', { name: 'Önceki adıma dön', exact: true });
  const selected = (page, name) => page.getByRole('radio', { name: new RegExp('^' + name + ':') });
  const interest = (page, name) => page.getByRole('checkbox', { name: new RegExp('^' + name + ':') });
  const paint = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const shot = async (page, name) => { await page.waitForTimeout(520); await paint(page); await page.screenshot({ path: path.join(output, name + '.png') }); };
  const writes = page => page.evaluate(() => structuredClone(window.__writes));
  const targets = async page => {
    const metrics = await page.locator('[role="button"], [role="radio"], [role="checkbox"]').evaluateAll(elements => elements.filter(e => e.getClientRects().length).map(e => { const r=e.getBoundingClientRect();return { label:e.getAttribute('aria-label'),width:r.width,height:r.height }; }));
    for (const m of metrics) assert.ok(m.width >= 44 && m.height >= 44, JSON.stringify(m));
  };
  const layout = async page => {
    const actual = await page.getByTestId('production-onboarding').evaluate(el => ({ width:el.clientWidth,height:el.clientHeight,scrollWidth:el.scrollWidth,bg:getComputedStyle(el).backgroundColor }));
    assert.equal(actual.scrollWidth, actual.width); assert.equal(actual.bg, 'rgb(250, 249, 245)');
    const cta = page.getByRole('button', { name: /^(Devam et|Planımı hazırla|Başlayalım|Planı Gör)$/ });
    if (await cta.count()) { const r=await cta.boundingBox(), v=page.viewportSize(); assert.ok(r.y >= 0 && r.y+r.height <= v.height, JSON.stringify(r)); }
    await targets(page);
  };
  const pageFor = async (viewport, query = '', reducedMotion = 'reduce') => {
    const page = await browser.newPage({ ...devices['Pixel 7'], viewport, deviceScaleFactor:1, reducedMotion });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base+'/?'+query); await page.getByTestId('production-onboarding').waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.ok(await page.evaluate(() => document.fonts.check('16px PlusJakartaSans_800ExtraBold')));
    return page;
  };
  async function fill(page, width) {
    const initialWrites = (await writes(page)).length;
    await page.getByRole('button', { name:'Başlayalım', exact:true }).click();
    await heading(page,'Bugün nasıl bir plan iyi gider?').waitFor();
    await selected(page,'Sakin').click(); await next(page).click();
    await heading(page,'Neler ilgini çekiyor?').waitFor();
    assert.equal(await next(page).isDisabled(), true); assert.equal(await next(page).getAttribute('aria-disabled'), 'true');
    assert.equal(await next(page).evaluate(e=>Number(getComputedStyle(e).opacity)), .4);
    await layout(page); if(width) await shot(page,`interests-disabled-${width}`);
    await interest(page,'Kahve').click(); assert.equal(await next(page).isEnabled(), true);
    if(width) await shot(page,`interests-one-${width}`);
    await interest(page,'Kahve').click(); assert.equal(await next(page).isDisabled(), true);
    await interest(page,'Kahve').click(); await interest(page,'Sanat').click();
    assert.equal(await interest(page,'Kahve').getAttribute('aria-checked'), 'true');
    if(width) await shot(page,`interests-selected-${width}`);
    await next(page).click(); await heading(page,'Bugün için bütçen ne?').waitFor();
    await back(page).click(); await heading(page,'Neler ilgini çekiyor?').waitFor();
    assert.equal(await interest(page,'Sanat').getAttribute('aria-checked'),'true');await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Neler ilgini çekiyor?');
    if(width) await shot(page,`interests-back-${width}`);
    await next(page).click(); await selected(page,'Bedava').click();
    if(width) await shot(page,`budget-selected-${width}`); await layout(page); await next(page).click();
    await heading(page,'Bugün kaç kişisiniz?').waitFor(); await selected(page,'2').click();
    if(width) await shot(page,`group-selected-${width}`); await layout(page); await next(page).click();
    await heading(page,'Bugün ne kadar vaktin var?').waitFor(); await selected(page,'1–2 saat').click();
    if(width) await shot(page,`duration-selected-${width}`); await layout(page);
    assert.equal((await writes(page)).length,initialWrites);
    await page.getByRole('button',{name:'Planımı hazırla',exact:true}).click();
    await heading(page,'Senin için bugünün planını hazırlıyoruz.').waitFor();
    assert.equal((await writes(page)).length,initialWrites);
    if(width) await shot(page,`preparing-${width}`);
    await page.getByRole('button',{name:'Planı Gör',exact:true}).waitFor();
    if(width) await shot(page,`ready-${width}`);
    return page.getByRole('button',{name:'Planı Gör',exact:true});
  }
  try {
    for (const viewport of [{width:393,height:852},{width:412,height:915}]) {
      const page = await pageFor(viewport);
      await heading(page,'Bugün sana uyan bir plan bulalım.').waitFor(); await layout(page); await shot(page,`welcome-${viewport.width}`);
      await page.getByRole('button',{name:'Başlayalım',exact:true}).click(); await heading(page,'Bugün nasıl bir plan iyi gider?').waitFor();
      assert.equal(await next(page).isDisabled(),true); await shot(page,`mood-unselected-${viewport.width}`);
      await selected(page,'Sakin').click(); await shot(page,`mood-selected-${viewport.width}`); await layout(page);
      await back(page).click(); await heading(page,'Bugün sana uyan bir plan bulalım.').waitFor();
      const complete = await fill(page,viewport.width);
      assert.equal((await writes(page)).length,0);
      await page.evaluate(() => { window.__departedFinish=window.__finishOnboarding; });
      await complete.click();
      await page.getByRole('button',{name:/^Bugünkü tercihler:/}).waitFor();
      const stored = await writes(page); assert.equal(stored.length,1); assert.equal(stored[0].onboardingCompleted,true); assert.equal(stored[0].budget,'Ücretsiz'); assert.deepEqual(stored[0].interests,['Kahve','Sanat']); assert.deepEqual(stored[0].saved,[]); assert.deepEqual(stored[0].dismissed,[]);assert.deepEqual(await page.evaluate(()=>window.__alerts),[]);assert.equal(await page.evaluate(()=>window.__events.filter(e=>e.name==='preference_flow_completed').length),1);assert.equal(await page.evaluate(()=>window.__events.filter(e=>e.name==='screen_viewed'&&e.properties.screen==='duration').length),1);
      await page.evaluate(() => window.__departedFinish());
      assert.equal((await writes(page)).length,1);
      assert.equal(await page.evaluate(()=>window.__events.filter(e=>e.name==='preference_flow_completed').length),1);
      await shot(page,`first-home-${viewport.width}`);
      assert.equal(await page.getByTestId('production-onboarding').count(),0);
      await page.reload(); await page.getByRole('button',{name:/^Bugünkü tercihler:/}).waitFor(); assert.equal(await page.getByTestId('production-onboarding').count(),0);
      await page.getByRole('button',{name:/^Bugünkü tercihler:/}).click(); await heading(page,'Bugünkü tercihlerin').waitFor();
      assert.equal(await page.getByTestId('production-onboarding').count(),0);
      check('complete first run, disabled/selected states, Back, one atomic commit, restart Home and independent editor',viewport);
      await page.close();
    }
    const legacy = await browser.newPage({viewport:{width:393,height:852}}); await legacy.goto(base+'/?legacy=true'); await legacy.getByRole('button',{name:/^Bugünkü tercihler:/}).waitFor(); assert.equal(await legacy.getByTestId('production-onboarding').count(),0);
    await legacy.getByRole('button',{name:'Plan tercihlerini baştan seç',exact:true}).click(); await heading(legacy,'Bugünkü tercihlerin').waitFor(); assert.equal(await legacy.getByTestId('production-onboarding').count(),0); check('completed empty-interest legacy bypass and Baştan başla uses editor'); await legacy.close();
    const resume = await pageFor({width:393,height:852},'resume=true'); await heading(resume,'Neler ilgini çekiyor?').waitFor(); assert.equal(await next(resume).isDisabled(),true);
    await interest(resume,'Doğa').click(); assert.equal(await next(resume).isEnabled(),true); await next(resume).click();
    assert.equal(await resume.evaluate(()=>window.__hardwareBack()),true); await heading(resume,'Neler ilgini çekiyor?').waitFor(); assert.equal(await interest(resume,'Doğa').getAttribute('aria-checked'),'true');
    assert.equal((await writes(resume)).length,0); await resume.reload(); await heading(resume,'Neler ilgini çekiyor?').waitFor(); assert.equal(await next(resume).isDisabled(),true); check('incomplete legacy resumes safely, hardware Back preserves drafts, unfinished new drafts never persist'); await resume.close();
    const failure=await pageFor({width:393,height:852},'hold=true');const done=await fill(failure);
    await failure.evaluate(() => { window.__departedFinish=window.__finishOnboarding; window.__pendingCompletion=Promise.all([window.__departedFinish(),window.__departedFinish(),window.__departedFinish()]); });
    await failure.waitForFunction(()=>typeof window.__rejectWrite==='function'); assert.equal(await failure.evaluate(()=>window.__writeAttempts.length),1); assert.equal(await done.isDisabled(),true); assert.equal(await done.getAttribute('aria-busy'),'true'); assert.equal((await writes(failure)).length,0); assert.equal(await failure.getByTestId('production-onboarding').count(),1);
    await failure.evaluate(()=>window.__rejectWrite()); await failure.waitForFunction(()=>window.__alerts.length===1); await failure.waitForFunction(el=>el.getAttribute('aria-disabled')!=='true',await done.elementHandle()); assert.equal(await done.isEnabled(),true); assert.equal((await writes(failure)).length,0);
    await failure.evaluate(() => { window.__pendingRetry=Promise.all([window.__finishOnboarding(),window.__finishOnboarding(),window.__finishOnboarding()]); });
    await failure.waitForFunction(()=>window.__writeAttempts.length===2); await failure.evaluate(()=>window.__releaseWrite()); await failure.getByRole('button',{name:/^Bugünkü tercihler:/}).waitFor(); assert.equal((await writes(failure)).length,1);
    await failure.evaluate(()=>window.__departedFinish());
    assert.equal(await failure.evaluate(()=>window.__writeAttempts.length),2);
    assert.equal(await failure.evaluate(()=>window.__events.filter(e=>e.name==='preference_flow_completed').length),1);
    await failure.getByRole('button',{name:'Ayarları aç',exact:true}).click();
    await failure.getByRole('button',{name:'Tüm kullanıcı verilerimi kalıcı olarak sil',exact:true}).click();
    await failure.evaluate(()=>window.__alerts.find(a=>a.title==='Tüm verilerini sil?').buttons.find(b=>b.text==='Verilerimi sil').onPress());
    await heading(failure,'Bugün sana uyan bir plan bulalım.').waitFor();
    await failure.evaluate(()=>window.__departedFinish());
    assert.equal(await failure.evaluate(()=>window.__writeAttempts.length),2);
    const future=await fill(failure);await future.click();await failure.waitForFunction(()=>window.__writeAttempts.length===3);await failure.evaluate(()=>window.__releaseWrite());await failure.getByRole('button',{name:/^Bugünkü tercihler:/}).waitFor();
    assert.equal((await writes(failure)).length,2);assert.equal(await failure.evaluate(()=>window.__events.filter(e=>e.name==='preference_flow_completed').length),2);
    check('rapid repeated calls write once; failure unlocks Retry; success rejects departed callbacks; real deletion resets guard and permits future completion');await failure.close();
    for(const [name,query,viewport] of [['large-text','resume=true&scale=1.8',{width:393,height:852}],['long-turkish','resume=true&long=true',{width:412,height:915}],['short-safe-areas','resume=true&top=24&bottom=24',{width:393,height:667}]]) {
      const page=await pageFor(viewport,query); await layout(page);await shot(page,name); await interest(page,'Etkinlik').scrollIntoViewIfNeeded();await interest(page,'Etkinlik').click(); await layout(page);await next(page).click();await selected(page,'Bedava').scrollIntoViewIfNeeded();await selected(page,'Bedava').click();await layout(page);await shot(page,name+'-budget');check('scalable/long/short layout, reachable controls and anchored CTA',{name,...viewport});await page.close();
    }
    const largeFlow=await pageFor({width:393,height:852},'scale=1.8');const largeComplete=await fill(largeFlow);await layout(largeFlow);await shot(largeFlow,'large-text-ready');await largeFlow.getByText('Planın hazır. Ankara seni bekliyor.',{exact:true}).scrollIntoViewIfNeeded();await shot(largeFlow,'large-text-ready-scrolled');const note=await largeFlow.getByText('Planın hazır. Ankara seni bekliyor.',{exact:true}).boundingBox();const action=await largeComplete.boundingBox();assert.ok(note.y+note.height<action.y);await largeComplete.click();await largeFlow.getByRole('button',{name:/^Bugünkü tercihler:/}).waitFor();check('full large-text flow, dynamic rows/summary/footer, completion');await largeFlow.close();
    const motion=await pageFor({width:393,height:852},'', 'no-preference');await motion.getByRole('button',{name:'Başlayalım',exact:true}).click();await motion.waitForTimeout(600);await selected(motion,'Sakin').click();await next(motion).click();await interest(motion,'Kahve').click();await next(motion).click();await selected(motion,'Bedava').click();await next(motion).click();await selected(motion,'2').click();await next(motion).click();await selected(motion,'1–2 saat').click();await motion.getByRole('button',{name:'Planımı hazırla',exact:true}).click();await shot(motion,'preparing-motion');await motion.getByRole('button',{name:'Planı Gör',exact:true}).waitFor();assert.equal((await writes(motion)).length,0);check('normal motion and reduced motion keep the same preparation/completion semantics');await motion.close();
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify({passed:true,checks,errors},null,2)+'\n');console.log(JSON.stringify({passed:true,checks:checks.length,errors},null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exit(1)});
