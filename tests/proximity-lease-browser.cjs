// Actual App/controller/hooks with synthetic OS fixtures. Output is assertion
// names/counts only: no coordinate, accepted timestamp or lease payload evidence.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.join(process.env.GEZEK_BROWSER_MODULES, 'playwright'));
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8823';
const out = process.env.GEZEK_BROWSER_OUTPUT;
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  let page;
  const checks = [], errors = [];
  const record = name => { checks.push({ name, pass: true }); console.log(name); };
  const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const snap = () => page.evaluate(() => ({ filter: window.__homeContext.filter, batchFilter: window.__homeContext.batchFilter,
    state: window.__homeContext.proximity.status, seed: window.__homeContext.seed, ids: window.__homeContext.ids,
    history: window.__homeContext.previousBatch, gps: window.__gpsCalls, prompts: window.__permissionPromptCalls,
    reads: window.__serviceReadCalls, calls: window.__recommendationCalls, policy: window.__homeContext.proximityMode }));
  const control = () => page.getByRole('checkbox', { name: 'Yakına öncelik ver', exact: true });
  const toggle = () => control().evaluate(node => node.click());
  const clock = time => page.evaluate(value => { window.__leaseNow = value; }, time);
  const open = async () => {
    if (page) await page.close();
    page = await browser.newPage({ viewport: { width: 393, height: 852 } });
    page.on('pageerror', error => errors.push(String(error)));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(base + '/?budget=Fark%20etmez');
    await page.waitForFunction(() => window.__homeContext?.ids.length === 5);
    await settle();
  };
  const select = async label => {
    await page.getByRole('tab', { name: label + ' önerileri', exact: true }).evaluate(node => node.click());
    await page.waitForFunction(() => window.__homeContext.filter === window.__homeContext.batchFilter);
    await settle();
  };
  const grant = async () => {
    await page.waitForFunction(() => window.__permissions.length === 1);
    await page.evaluate(() => window.__permissions.shift().resolve({ status: 'granted' }));
    await page.waitForFunction(() => window.__positions.length === 1);
  };
  const finishGPS = async () => {
    await page.evaluate(() => window.__positions.shift().resolve({ coords: { latitude: 39.9208, longitude: 32.8541 } }));
    await page.waitForFunction(() => window.__homeContext.proximity.status === 'active');
    await settle();
  };
  const fresh = async () => { await toggle(); await grant(); await finishGPS(); };
  const off = async () => { await toggle(); await settle(); assert.equal((await snap()).state, 'off'); };
  try {
    for (const age of [0, 59_999, 60_000, 60_001]) {
      await open(); await fresh(); const original = await snap(); await off(); await clock(age); await toggle();
      if (age >= 60_000) { await grant(); await finishGPS(); }
      else await page.waitForFunction(() => window.__homeContext.proximity.status === 'active');
      await settle(); const next = await snap();
      assert.equal(next.gps, age < 60_000 ? 1 : 2); assert.equal(next.seed, original.seed);
      if (age < 60_000) { assert.deepEqual(next.ids, original.ids); assert.equal(next.calls, original.calls); assert.ok(next.reads > original.reads); }
      record(`strict ${age}ms boundary: validated reuse or fresh GPS, no seed rotation`);
    }
    await open(); await fresh(); await off(); await select('Mekân'); const cold = await snap(); await toggle();
    await page.waitForFunction(() => window.__homeContext.proximity.status === 'active' && window.__homeContext.proximityMode === 'nearby');
    await page.waitForFunction(n => window.__recommendationCalls === n + 1, cold.calls);
    assert.equal((await snap()).gps, 1); assert.equal((await snap()).seed, 0);
    record('valid lease without a Mekân B2 snapshot computes once without GPS or seed consumption');

    for (const sequence of [
      ['Gezek', 'Mekân'], ['Mekân', 'Gezek'], ['Gezek', 'Etkinlik', 'Gezek'], ['Mekân', 'Fikir', 'Mekân'],
      ['Gezek', 'Mekân', 'Etkinlik', 'Fikir', 'Gezek', 'Etkinlik', 'Mekân'],
      ['Mekân', 'Etkinlik'], ['Gezek', 'Fikir'],
    ]) {
      await open(); if (sequence[0] === 'Mekân') await select('Mekân');
      await toggle(); await grant();
      for (const label of sequence.slice(1)) {
        await select(label); assert.equal((await snap()).state, 'acquiring'); assert.equal((await snap()).gps, 1);
        if (['Gezek', 'Mekân'].includes(label)) assert.equal(await control().getAttribute('aria-busy'), 'true');
        else assert.equal(await control().count(), 0);
      }
      await finishGPS();
      if (!['Gezek', 'Mekân'].includes(sequence.at(-1))) { assert.equal(await control().count(), 0); await select('Gezek'); }
      await page.waitForFunction(() => window.__homeContext.proximityMode === 'nearby');
      assert.equal((await snap()).gps, 1); assert.equal((await snap()).prompts, 1); assert.equal((await snap()).seed, 0);
      await off(); assert.equal((await snap()).gps, 1);
      record(`one pending acquisition survives ${sequence.join(' → ')}; success and subsequent off preserve seeds`);
    }

    // Reproduce the Redmi cancellation path: old cached A coordinates trigger a
    // cold filter preflight while an explicit fresh permission result is pending.
    await open(); await page.evaluate(() => { void window.__requestLocation(); }); await grant();
    await page.evaluate(() => window.__positions.shift().resolve({ coords: { latitude: 39.9208, longitude: 32.8541 } }));
    await page.waitForFunction(() => !window.__homeContext.locating && !!window.__homeContext.coordinates);
    await clock(60_000); await page.evaluate(() => { window.__foregroundPermission = 'denied'; });
    await toggle(); await page.waitForFunction(() => window.__permissions.length === 1); await select('Mekân');
    await page.waitForFunction(() => !window.__homeContext.coordinates); assert.equal((await snap()).state, 'acquiring');
    await page.evaluate(() => { window.__foregroundPermission = 'granted'; }); await grant(); await finishGPS();
    assert.equal((await snap()).gps, 2); assert.equal((await snap()).seed, 0);
    record('cold A preflight invalidates only its older cache, preserving pending shared Home acquisition');

    await open(); await toggle(); await grant(); await select('Fikir');
    await page.evaluate(() => window.__positions.shift().reject(new Error('Synthetic GPS failure')));
    await page.waitForFunction(() => window.__homeContext.proximity.status === 'off'); await select('Mekân');
    assert.equal((await snap()).gps, 1); assert.equal(await control().getAttribute('aria-checked'), 'false');
    record('GPS failure after an unsupported filter switch safely returns off');

    for (const invalid of ['permission', 'services']) {
      await open(); await fresh(); await off(); await clock(1);
      await page.evaluate(kind => { if (kind === 'permission') window.__foregroundPermission = 'denied'; else window.__servicesEnabled = false; }, invalid);
      await toggle();
      if (invalid === 'permission') { await page.waitForFunction(() => window.__permissions.length === 1); await page.evaluate(() => window.__permissions.shift().resolve({ status: 'denied' })); }
      await page.waitForFunction(() => window.__homeContext.proximity.status === 'off'); assert.equal((await snap()).gps, 1);
      record(`${invalid} invalidation within lease cannot restore selected B2`);
    }
    await open(); await fresh(); await off(); await clock(30_000);
    await page.evaluate(() => { void window.__requestLocation(); }); await grant();
    await page.evaluate(() => window.__positions.shift().resolve({ coords: { latitude: 39.9208, longitude: 32.8541 } }));
    await page.waitForFunction(() => !window.__homeContext.locating); await clock(60_000); await toggle();
    await page.waitForFunction(() => window.__homeContext.proximity.status === 'active'); assert.equal((await snap()).gps, 2);
    await off(); await clock(90_000); await fresh(); assert.equal((await snap()).gps, 3);
    record('explicit Konumu güncelle forces fresh GPS inside lease and renews the strict boundary');

    await open(); await toggle(); await grant(); await select('Mekân');
    await page.getByRole('tab', { name: 'Kaydedilenler', exact: true }).click();
    await page.evaluate(() => window.__positions.shift().resolve({ coords: { latitude: 39.9208, longitude: 32.8541 } }));
    await page.getByRole('tab', { name: 'Ana Sayfa', exact: true }).click(); await settle(); assert.equal((await snap()).state, 'off');
    record('leaving complete Home cancels pending ownership and rejects late success');

    await open(); await toggle(); await grant();
    // Explicit refresh supersedes the old acquisition and is in turn superseded
    // by a newer activation. The two departed native callbacks cannot renew a lease.
    await page.evaluate(() => { void window.__requestLocation(); }); await page.waitForFunction(() => window.__permissions.length === 1);
    await toggle(); await page.waitForFunction(() => window.__permissions.length === 2);
    await page.evaluate(() => window.__permissions.pop().resolve({ status: 'granted' }));
    await page.waitForFunction(() => window.__positions.length === 2);
    await page.evaluate(() => window.__positions.pop().resolve({ coords: { latitude: 39.9208, longitude: 32.8541 } }));
    await page.waitForFunction(() => window.__homeContext.proximity.status === 'active'); const newer = await snap();
    await page.evaluate(() => { window.__positions.shift().resolve({ coords: { latitude: 40, longitude: 33 } }); window.__permissions.shift().resolve({ status: 'granted' }); });
    await settle(); assert.deepEqual(await snap(), newer); await off(); await clock(60_000); await fresh(); assert.equal((await snap()).gps, 3);
    record('newest explicit action wins; stale earlier callbacks cannot overwrite or renew newer provenance');

    await open(); await toggle(); await grant(); await page.evaluate(() => { window.__unmount(); window.__positions.shift().resolve({ coords: { latitude: 40, longitude: 33 } }); });
    await settle(); assert.equal(await control().count(), 0); record('Home unmount rejects a late native fix');
    await open(); await fresh(); await page.reload(); await page.waitForFunction(() => window.__homeContext?.ids.length === 5);
    assert.equal((await snap()).state, 'off'); await fresh(); assert.equal((await snap()).gps, 1);
    assert.ok(await page.evaluate(() => window.__writes.every(value => !/latitude|longitude|acceptedAt|acquiredAt|lease/i.test(JSON.stringify(value)))));
    record('restart has no reusable lease; ordinary persistence contains no location or lease timestamp');
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out, 'lease-results.json'), JSON.stringify({ checks, errors }, null, 2));
    console.log(JSON.stringify({ checks: checks.length, errors }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
