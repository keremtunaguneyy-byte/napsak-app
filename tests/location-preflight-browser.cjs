// Actual App actions with services changed silently: no active/focus signal.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.join(process.env.GEZEK_BROWSER_MODULES, 'playwright'));
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8796';
const output = process.env.GEZEK_BROWSER_OUTPUT || '/private/tmp/gezek-preflight-browser';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.GEZEK_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const checks = [], errors = [];
  try {
    for (const viewport of [{ width: 393, height: 852 }, { width: 412, height: 915 }]) for (const filter of ['experience', 'place']) {
      const page = await browser.newPage({ viewport });
      page.on('pageerror', error => errors.push(error.stack));
      const record = name => { checks.push({ name, viewport, filter, pass: true }); console.log(viewport.width, filter, name); };
      const snapshot = () => page.evaluate(() => ({ ...window.__homeContext, calls: window.__recommendationCalls, services: window.__serviceReadCalls, permissions: window.__permissionReadCalls, prompts: window.__permissionPromptCalls, gps: window.__gpsCalls }));
      const readOnly = (a, b) => { assert.equal(b.prompts, a.prompts); assert.equal(b.gps, a.gps); };
      const rotate = () => page.getByRole('button', { name: filter === 'experience' ? 'Başka planlar göster' : 'Başka mekânlar göster', exact: true }).click();
      const clearStatus = () => page.evaluate(() => { window.__holdStatus = false; window.__statusFailure = undefined; window.__servicesEnabled = true; window.__foregroundPermission = 'granted'; });
      const acquire = async (coords = { latitude: 39.9208, longitude: 32.8541 }) => {
        await clearStatus(); const before = await snapshot();
        await page.evaluate(() => { void window.__requestLocation(); });
        await page.waitForFunction(() => window.__permissions.length === 1);
        await page.evaluate(() => window.__permissions.shift().resolve({ status: 'granted', canAskAgain: true }));
        await page.waitForFunction(() => window.__positions.length === 1);
        await page.evaluate(coords => window.__positions.shift().resolve({ coords }), coords);
        await page.waitForFunction(() => !window.__homeContext.locating && !!window.__homeContext.coordinates);
        if (before.filter === 'place') await page.waitForFunction(calls => window.__recommendationCalls > calls, before.calls);
      };
      const freshInput = async before => {
        await page.waitForFunction(calls => window.__recommendationCalls > calls && window.__homeContext.batchSeed === window.__homeContext.seed && window.__homeContext.batchFilter === window.__homeContext.filter, before.calls);
        return page.evaluate(() => window.__recommendationInputs.at(-1));
      };
      const absent = async () => { assert.equal((await snapshot()).coordinates, undefined); assert.doesNotMatch(await page.locator('body').innerText(), /\d+[.,]\d+\s*km/); };
      const resolveHeld = () => page.evaluate(() => window.__statusReads.splice(0).forEach(read => read.resolve(read.kind === 'services' ? true : { status: 'granted' })));
      await page.goto(base); await page.waitForFunction(() => window.__homeContext?.ids.length === 5);
      if (filter === 'place') await page.getByRole('tab', { name: 'Mekân önerileri', exact: true }).click();
      const noFix = await snapshot(); await rotate(); assert.equal((await freshInput(noFix)).coordinates, undefined);
      assert.equal((await snapshot()).services, noFix.services); record('No cache: next batch runs immediately with zero native reads');
      await acquire(); const visible = await snapshot();
      await page.evaluate(() => { window.__servicesEnabled = false; });
      await page.waitForTimeout(250);
      assert.deepEqual(await snapshot(), visible); assert.match(await page.locator('body').innerText(), /\d+[.,]\d+\s*km/);
      record('Silent Quick Settings change leaves the accepted visible snapshot intact, with no polling');
      await rotate(); assert.equal((await freshInput(visible)).coordinates, undefined); await absent();
      const disabled = await snapshot(); assert.equal(disabled.services, visible.services + 1); assert.equal(disabled.permissions, visible.permissions + 1);
      assert.equal(disabled.seed, visible.seed + 1); assert.deepEqual(disabled.previousBatch, visible.ids); readOnly(visible, disabled);
      record('Silent services disable + refresh clears cache/labels and scores one locationless replacement with normal seed/previous IDs');
      await clearStatus(); const restoredStatus = await snapshot(); await rotate();
      assert.equal((await freshInput(restoredStatus)).coordinates, undefined); await absent();
      assert.equal((await snapshot()).services, restoredStatus.services); record('Re-enabled services cannot resurrect a discarded coordinate');
      for (const invalid of ['denied', 'services-error', 'permission-error']) {
        await acquire(); const before = await snapshot();
        await page.evaluate(invalid => { if (invalid === 'denied') window.__foregroundPermission = 'denied'; else window.__statusFailure = invalid.split('-')[0]; }, invalid);
        await rotate(); assert.equal((await freshInput(before)).coordinates, undefined); await absent(); readOnly(before, await snapshot());
        record(`${invalid}: refresh fails closed without permission prompts or GPS`);
      }
      await acquire(); let before = await snapshot();
      await rotate(); const validInput = await freshInput(before); assert.deepEqual(validInput.coordinates, before.coordinates);
      assert.equal((await snapshot()).services, before.services + 1); readOnly(before, await snapshot());
      before = await snapshot(); await rotate(); await freshInput(before); assert.equal((await snapshot()).services, before.services + 1);
      record('Each successive valid batch freshly checks both statuses and preserves the cached fix');
      await page.evaluate(() => { window.__holdStatus = true; }); before = await snapshot();
      await rotate(); await page.waitForFunction(() => window.__statusReads.length === 2);
      assert.equal((await snapshot()).calls, before.calls); assert.deepEqual((await snapshot()).ids, before.ids);
      await rotate(); await page.waitForFunction(() => window.__statusReads.length === 4); assert.equal((await snapshot()).services, before.services + 2);
      await resolveHeld(); const latestInput = await freshInput(before);
      assert.equal(latestInput.seed, before.seed + 2); assert.equal((await snapshot()).calls, before.calls + 1);
      assert.deepEqual(latestInput.coordinates, before.coordinates); record('Rapid actions start fresh pairs; obsolete batch never computes/publishes');
      await clearStatus(); await acquire(); before = await snapshot();
      await page.evaluate(() => { window.__holdStatus = 'permission'; }); await rotate();
      await page.waitForFunction(() => window.__statusReads.length === 1);
      await page.evaluate(() => { window.__holdStatus = false; window.__servicesEnabled = false; }); await rotate();
      assert.equal((await freshInput(before)).coordinates, undefined); await absent();
      assert.equal((await snapshot()).services, before.services + 2);
      await resolveHeld(); await page.waitForTimeout(80); await absent(); assert.equal((await snapshot()).calls, before.calls + 1);
      record('Second action after silent disable cannot reuse the first pair\'s settled services read');
      await clearStatus(); await acquire(); before = await snapshot();
      await page.evaluate(() => { window.__holdStatus = true; }); await rotate(); await page.waitForFunction(() => window.__statusReads.length === 2);
      assert.equal((await freshInput(before)).coordinates, undefined); await absent(); readOnly(before, await snapshot());
      await resolveHeld(); await page.waitForTimeout(80); await absent(); assert.equal((await snapshot()).calls, before.calls + 1);
      record('Hung pair times out once, completes locationless and ignores late success');
      await acquire(); await page.evaluate(() => { window.__holdStatus = true; }); await rotate();
      await page.waitForFunction(() => window.__statusReads.length === 2);
      await acquire({ latitude: 40, longitude: 33 });
      const newer = await snapshot();
      await page.evaluate(() => window.__statusReads.splice(0).forEach(read => read.resolve(read.kind === 'services' ? false : { status: 'denied' })));
      await page.waitForTimeout(80);
      assert.deepEqual((await snapshot()).coordinates, newer.coordinates); assert.equal((await snapshot()).calls, newer.calls);
      record('Old failed preflight cannot discard a newer explicit fix or publish a late replacement');
      // Other public mutation paths all enter the same scoring boundary.
      await acquire(); before = await snapshot(); await page.evaluate(() => { window.__servicesEnabled = false; });
      await page.getByRole('button', { name: /: Bana göre değil$/ }).first().click();
      assert.equal((await freshInput(before)).coordinates, undefined); await absent(); record('Dismiss replacement cannot score using a silently invalidated fix');
      await acquire(); before = await snapshot(); await page.evaluate(() => { window.__servicesEnabled = false; });
      await page.getByRole('button', { name: 'Son gizlenen öneriyi geri al', exact: true }).click();
      assert.equal((await freshInput(before)).coordinates, undefined); await absent(); record('Undo replacement preflights cached location');
      for (const restore of ['single', 'all']) {
        await page.getByRole('button', { name: /: Bana göre değil$/ }).first().click();
        await page.getByRole('button', { name: /Gizlediğim \d+ öneriyi göster/ }).click();
        await acquire(); before = await snapshot(); await page.evaluate(() => { window.__servicesEnabled = false; });
        await page.getByRole('button', { name: restore === 'all' ? 'Tüm gizlenen önerileri geri getir' : / önerisini geri getir$/, exact: restore === 'all' }).first().click();
        assert.equal((await freshInput(before)).coordinates, undefined); await absent();
        await page.getByRole('button', { name: 'Önerilere dön', exact: true }).last().click();
        record(`${restore} restore preflights before regenerating Home recommendations`);
      }
      await acquire(); before = await snapshot(); await page.evaluate(() => { window.__servicesEnabled = false; });
      await page.getByRole('button', { name: /Bugünkü tercihler:/ }).click();
      await page.getByRole('button', { name: /^Ruh hâli:/ }).click(); await page.getByRole('radio', { name: 'Enerjik', exact: true }).click();
      await page.getByRole('button', { name: 'Uygula', exact: true }).click(); await page.getByRole('button', { name: 'Değişiklikleri kaydet', exact: true }).click();
      assert.equal((await freshInput(before)).coordinates, undefined); await absent(); record('Preference Apply replacement preflights cached location');
      await acquire(); before = await snapshot(); await page.evaluate(() => { window.__servicesEnabled = false; });
      await page.getByRole('tab', { name: filter === 'experience' ? 'Mekân önerileri' : 'Gezek önerileri', exact: true }).click();
      assert.equal((await freshInput(before)).coordinates, undefined); await absent(); record('Filter switch preflights before the new kind is scored');
      // Newly entering a Place also creates a related-plan batch.
      await acquire(); await page.evaluate(() => { window.__servicesEnabled = false; });
      await page.getByRole('button', { name: filter === 'experience' ? /Mekânı incele$/ : /Planı incele$/ }).first().click();
      if (filter === 'place') await page.getByRole('button', { name: /1\. durak:/ }).click();
      await page.waitForFunction(() => window.__relatedInputs?.length > 0 && !window.__homeContext.coordinates);
      assert.equal(await page.evaluate(() => window.__relatedInputs.at(-1).coordinates), undefined); await absent();
      record('New Place detail related-plan batch uses the same mandatory preflight');
      await page.getByRole('button', { name: 'Detayı kapat ve başladığın ekrana dön', exact: true }).click();
      await acquire(); before = await snapshot(); await page.evaluate(() => { window.__holdStatus = true; });
      // Use the current filter's actual refresh button after switching above.
      await page.getByRole('button', { name: filter === 'experience' ? 'Başka mekânlar göster' : 'Başka planlar göster', exact: true }).click();
      await page.waitForFunction(() => window.__statusReads.length === 2);
      await page.evaluate(() => window.__unmount()); await resolveHeld(); await page.waitForTimeout(80);
      assert.equal(await page.locator('#root').innerText(), ''); assert.equal((await snapshot()).calls, before.calls);
      record('Unmount during preflight cancels deadline and prevents late computation/publication');
      await page.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'preflight-browser-results.json'), JSON.stringify({ checks, errors }, null, 2) + '\n');
    console.log(`${checks.length} preflight checks passed; zero page errors`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
