// Actual App lifecycle integration; only native OS/service responses are controlled.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.join(process.env.GEZEK_BROWSER_MODULES, 'playwright'));
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8795';
const output = process.env.GEZEK_BROWSER_OUTPUT || '/private/tmp/gezek-validity-browser';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.GEZEK_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const checks = [], errors = [];
  try {
    for (const viewport of [{ width: 393, height: 852 }, { width: 412, height: 915 }]) for (const filter of ['experience', 'place']) {
      const page = await browser.newPage({ viewport });
      page.on('pageerror', error => errors.push(error.stack));
      const record = name => checks.push({ name, viewport, filter, pass: true });
      const snapshot = () => page.evaluate(() => ({ ...window.__homeContext, calls: window.__recommendationCalls, services: window.__serviceReadCalls, permissionReads: window.__permissionReadCalls, prompts: window.__permissionPromptCalls, gps: window.__gpsCalls }));
      const batch = s => ({ ids: s.ids, scores: s.scores, seed: s.seed, previousBatch: s.previousBatch, saved: s.saved, dismissed: s.dismissed, filter: s.filter, calls: s.calls });
      const readOnly = (before, after) => { assert.equal(after.prompts, before.prompts); assert.equal(after.gps, before.gps); };
      const absent = async () => { assert.doesNotMatch(await page.locator('body').innerText(), /\d+[.,]\d+\s*km/); assert.equal((await snapshot()).locating, false); assert.equal((await snapshot()).coordinates, undefined); };
      const start = async (viaButton = false) => {
        if (viaButton) await page.getByRole('button', { name: (await snapshot()).coordinates ? 'Konumu yeniden güncelle' : 'Konum izni iste', exact: true }).click();
        else await page.evaluate(() => { void window.__requestLocation(); });
        await page.waitForFunction(() => window.__permissions.length === 1);
        await page.evaluate(() => window.__permissions.shift().resolve({ status: 'granted', canAskAgain: true }));
        await page.waitForFunction(() => window.__positions.length === 1);
      };
      const acquire = async (latitude = 39.9208, longitude = 32.8541, viaButton = false) => {
        await page.evaluate(() => { window.__servicesEnabled = true; window.__foregroundPermission = 'granted'; window.__statusFailure = undefined; });
        await start(viaButton);
        await page.evaluate(coords => window.__positions.shift().resolve({ coords }), { latitude, longitude });
        await page.waitForFunction(() => !window.__homeContext.locating && !!window.__homeContext.coordinates);
        assert.match(await page.locator('body').innerText(), /\d+[.,]\d+\s*km/);
      };
      const signal = async (kind = 'active') => page.evaluate(kind => {
        if (kind === 'focus') { window.__emitAppState('blur'); window.__emitAppState('focus'); }
        else { window.__emitAppState('change', 'background'); window.__emitAppState('change', 'active'); window.__emitAppState('focus'); }
      }, kind);
      const settleCheck = async previous => { await page.waitForFunction(previous => window.__serviceReadCalls === previous + 1, previous); await page.waitForTimeout(40); };
      const resolveHeld = async (services, status) => page.evaluate(({ services, status }) => { const pending = window.__statusReads.splice(0); pending.forEach(p => p.resolve(p.kind === 'services' ? services : { status })); }, { services, status });
      const scroll = async y => page.evaluate(y => { const node = [...document.querySelectorAll('div')].find(n => /auto|scroll/.test(getComputedStyle(n).overflowY) && n.scrollHeight > n.clientHeight + 100); if (y !== undefined) node.scrollTop = y; return node.scrollTop; }, y);
      await page.goto(base);
      await page.waitForFunction(() => window.__homeContext?.ids.length === 5);
      if (filter === 'place') await page.getByRole('tab', { name: 'Mekân önerileri', exact: true }).click();
      await acquire(39.9208, 32.8541, true); record('Explicit acquisition displays valid distances');
      await page.getByRole('button', { name: /: Kaydet$/ }).first().click();
      await page.waitForFunction(() => window.__homeContext.saved.length === 1);
      await scroll(350); const initialScroll = await scroll();
      const valid = await snapshot();
      await signal(); await settleCheck(valid.services);
      const preserved = await snapshot(); assert.deepEqual(batch(preserved), batch(valid));
      assert.deepEqual(preserved.coordinates, valid.coordinates); readOnly(valid, preserved);
      assert.equal(preserved.permissionReads, valid.permissionReads + 1);
      assert.ok(Math.abs((await scroll()) - initialScroll) <= 1); record('Active+focus burst checks once; valid coordinate/batch/state/scroll preserved, no prompt/GPS');
      await page.evaluate(() => { window.__servicesEnabled = false; });
      await signal(); await settleCheck(preserved.services); await absent();
      const disabled = await snapshot(); assert.deepEqual(batch(disabled), batch(valid)); readOnly(valid, disabled);
      assert.ok(Math.abs((await scroll()) - initialScroll) <= 1); record('Disabled services on active return clear all labels and preserve scored batch/scroll');
      await page.getByRole('button', { name: filter === 'experience' ? 'Başka planlar göster' : 'Başka mekânlar göster', exact: true }).click();
      await page.waitForFunction(seed => window.__homeContext.seed === seed + 1, disabled.seed);
      const nextInput = await page.evaluate(() => window.__recommendationInputs.at(-1));
      assert.equal(nextInput.coordinates, undefined); assert.equal(nextInput.filter, filter);
      assert.deepEqual((await snapshot()).previousBatch, disabled.ids); await absent(); record('Next independent refresh receives no stale coordinate; normal rotation preserved');
      await page.evaluate(() => { window.__servicesEnabled = true; });
      const noFix = await snapshot(); await signal('focus'); await settleCheck(noFix.services); await absent(); readOnly(noFix, await snapshot()); record('Valid status alone never restores an invalidated fix');
      await acquire(39.93, 32.86, true);
      const focusBefore = await snapshot(); await page.evaluate(() => { window.__servicesEnabled = false; });
      await signal('focus'); await settleCheck(focusBefore.services); await absent();
      assert.deepEqual(batch(await snapshot()), batch(focusBefore)); readOnly(focusBefore, await snapshot()); record('Android blur/focus path clears stale distances without AppState change');
      await acquire(); const revokedBefore = await snapshot();
      await page.evaluate(() => { window.__foregroundPermission = 'denied'; });
      await signal(); await settleCheck(revokedBefore.services); await absent();
      assert.deepEqual(batch(await snapshot()), batch(revokedBefore)); readOnly(revokedBefore, await snapshot()); record('Permission revoked while away clears location without prompting');
      for (const failure of ['services', 'permission']) {
        await acquire(); const before = await snapshot(); await page.evaluate(failure => { window.__statusFailure = failure; }, failure);
        await signal('focus'); await settleCheck(before.services); await absent();
        assert.deepEqual(batch(await snapshot()), batch(before)); readOnly(before, await snapshot());
        await page.evaluate(() => { window.__statusFailure = undefined; }); const hidden = await snapshot();
        await signal(); await settleCheck(hidden.services); await absent();
        record(`${failure} status failure hides until a later explicit update; no batch/automatic fix`);
      }
      await acquire(); await page.evaluate(() => { window.__holdStatus = true; });
      await signal('focus'); await page.waitForFunction(() => window.__statusReads.length === 2);
      await acquire(40.02, 32.94); const newer = await snapshot();
      await resolveHeld(false, 'denied'); await page.waitForTimeout(180);
      assert.deepEqual((await snapshot()).coordinates, newer.coordinates); assert.deepEqual(batch(await snapshot()), batch(newer)); record('Old negative status response cannot clear a newer explicit location');
      const heldBefore = await snapshot(); await signal('focus'); await page.waitForFunction(() => window.__statusReads.length === 2);
      await page.evaluate(() => { for (let i = 0; i < 8; i++) { window.__emitAppState('change', 'active'); window.__emitAppState('focus'); } });
      await page.waitForTimeout(180); assert.equal((await snapshot()).services, heldBefore.services + 1); assert.equal(await page.evaluate(() => window.__statusReads.length), 2);
      await resolveHeld(true, 'granted'); await page.waitForTimeout(180);
      assert.equal((await snapshot()).services, heldBefore.services + 1); readOnly(heldBefore, await snapshot()); record('Duplicate in-flight active/focus events share one service/permission pair');
      const rapidBefore = await snapshot(); await signal('focus'); await page.waitForFunction(() => window.__statusReads.length === 2);
      await signal(); await signal(); assert.equal((await snapshot()).services, rapidBefore.services + 1);
      await resolveHeld(false, 'denied'); await page.waitForFunction(() => window.__statusReads.length === 2);
      assert.deepEqual((await snapshot()).coordinates, rapidBefore.coordinates);
      assert.equal((await snapshot()).services, rapidBefore.services + 2);
      await resolveHeld(true, 'granted'); await page.waitForTimeout(60); assert.deepEqual(batch(await snapshot()), batch(rapidBefore)); record('Rapid background/foreground cycles serialize a fresh check and reject obsolete result');
      await page.evaluate(() => { window.__holdStatus = false; });
      // Clear while a real explicit GPS promise is pending, then reject its late fix.
      await start(); await page.evaluate(() => { window.__servicesEnabled = false; });
      const loadingBefore = await snapshot(); await signal(); await settleCheck(loadingBefore.services); await absent();
      await page.evaluate(() => window.__positions.shift().resolve({ coords: { latitude: 40, longitude: 33 } }));
      await page.waitForTimeout(60); await absent(); assert.deepEqual(batch(await snapshot()), batch(loadingBefore)); record('Invalidation clears loading and prevents an in-flight late GPS result repopulating location');
      await acquire();
      const card = page.getByRole('button', { name: filter === 'experience' ? /Planı incele$/ : /Mekânı incele$/ }).first();
      await card.click();
      if (filter === 'experience') await page.getByRole('button', { name: /1\. durak:/ }).click();
      await page.getByRole('heading', { name: 'Mekân hakkında', exact: true }).waitFor();
      const related = () => page.getByRole('button', { name: /\. Planı incele$/ }).evaluateAll(nodes => nodes.map(n => n.getAttribute('aria-label')));
      const relatedBefore = await related(); const detailBefore = await snapshot();
      await page.evaluate(() => { window.__servicesEnabled = false; }); await signal(); await settleCheck(detailBefore.services); await absent();
      assert.deepEqual(await related(), relatedBefore); assert.deepEqual(batch(await snapshot()), batch(detailBefore)); record('Detail/related distances clear while visible related-plan ordering remains stable');
      await page.getByRole('button', { name: 'Detayı kapat ve başladığın ekrana dön', exact: true }).click();
      await acquire(); await page.evaluate(() => { window.__holdStatus = true; }); await signal('focus');
      await page.waitForFunction(() => window.__statusReads.length === 2); const unmounted = await snapshot();
      await page.evaluate(() => window.__unmount()); await resolveHeld(false, 'denied'); await page.waitForTimeout(180);
      assert.equal(await page.locator('#root').innerText(), ''); assert.equal((await snapshot()).services, unmounted.services);
      assert.deepEqual(await page.evaluate(() => Object.values(window.__lifecycleListeners).map(list => list.length)), [0, 0, 0]); record('Unmount removes all active/focus/blur subscriptions and rejects late status results');
      await page.close();
    }
    // Foreground-only location validation must not suppress real Event expiry.
    const expiry = await browser.newPage({ viewport: { width: 393, height: 852 } });
    expiry.on('pageerror', error => errors.push(error.stack));
    await expiry.goto(`${base}/?home=event`);
    await expiry.waitForFunction(() => window.__homeContext?.ids.length);
    await expiry.getByRole('tab', { name: 'Etkinlik önerileri', exact: true }).click();
    await expiry.waitForFunction(() => window.__homeContext.filter === 'event' && window.__homeContext.ids.length > 0);
    const afterAllStarts = await expiry.evaluate(() => Math.max(...window.__catalog.events.map(e => Date.parse(e.startsAt))) + 1000);
    await expiry.clock.install();
    await expiry.clock.setSystemTime(afterAllStarts); // Do not execute the suspended boundary timer.
    await expiry.evaluate(() => window.__emitAppState('change', 'active'));
    await expiry.waitForFunction(() => window.__homeContext.ids.length === 0);
    checks.push({ name: 'Actual elapsed Event boundary still refreshes eligibility on active', viewport: { width: 393, height: 852 }, filter: 'event', pass: true });
    await expiry.close();
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'lifecycle-browser-results.json'), JSON.stringify({ checks, errors }, null, 2) + '\n');
    console.log(`${checks.length} lifecycle checks passed; zero page errors`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
