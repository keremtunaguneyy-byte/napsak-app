// Actual App + RN Web; native services stubbed only by buildDetailBrowserFixture.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.join(process.env.GEZEK_BROWSER_MODULES, 'playwright'));
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8794';
const output = process.env.GEZEK_BROWSER_OUTPUT || '/private/tmp/gezek-distance-browser';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.GEZEK_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const checks = [], errors = [];
  const coordinates = { latitude: 39.9208, longitude: 32.8541 };
  try {
    for (const viewport of [{ width: 393, height: 852 }, { width: 412, height: 915 }]) for (const scale of [1, 1.8]) {
      const page = await browser.newPage({ viewport });
      page.on('pageerror', error => errors.push(error.stack));
      const record = name => checks.push({ name, viewport, scale, pass: true });
      const labels = () => page.getByTestId('experience-start-distance');
      const snapshot = () => page.evaluate(() => ({ ...window.__homeContext, calls: window.__recommendationCalls }));
      const stable = state => ({ filter: state.filter, seed: state.seed, previousBatch: state.previousBatch, ids: state.ids, scores: state.scores, saved: state.saved, dismissed: state.dismissed, calls: state.calls });
      // Start without awaiting the deferred OS promise.
      const start = async () => { await page.evaluate(() => { void window.__requestLocation(); }); await page.waitForFunction(() => window.__permissions.length > 0); };
      const permit = async () => { await page.evaluate(() => window.__permissions.shift().resolve({ status: 'granted', canAskAgain: true })); await page.waitForFunction(() => window.__positions.length > 0); };
      const finish = async coords => { await page.evaluate(coords => window.__positions.shift().resolve({ coords }), coords); await page.waitForFunction(() => !window.__homeContext.locating); };
      const scroll = async y => page.evaluate(y => { const node = [...document.querySelectorAll('div')].find(n => /auto|scroll/.test(getComputedStyle(n).overflowY) && n.scrollHeight > n.clientHeight + 100); if (y !== undefined) node.scrollTop = y; return node.scrollTop; }, y);
      await page.goto(`${base}/?scale=${scale}`);
      await page.waitForFunction(() => window.__homeContext?.ids.length === 5 && !window.__homeContext.locating);
      assert.equal(await labels().count(), 0); record('Unavailable: no distance or placeholder');
      await page.getByRole('button', { name: /: Kaydet$/ }).first().click();
      await page.waitForFunction(() => window.__homeContext.saved.length === 1);
      const before = await snapshot();
      await start(); assert.equal(await labels().count(), 0);
      await permit(); assert.equal(await labels().count(), 0); record('Permission and position pending: no distance');
      await scroll(350); const originalScroll = await scroll();
      await finish(coordinates);
      assert.equal(await labels().count(), 5);
      assert.deepEqual(stable(await snapshot()), stable(before));
      const scrollAfter = await scroll();
      assert.ok(Math.abs(scrollAfter - originalScroll) <= 1, `Home scroll changed ${originalScroll} → ${scrollAfter}`);
      assert.equal(await labels().first().innerText(), 'Başlangıca 2,1 km');
      assert.equal(await page.getByRole('button', { name: /Başlangıca/ }).count(), 0);
      const ax = await page.locator('#root').ariaSnapshot();
      assert.equal((ax.match(/Başlangıca/g) || []).length, 5);
      for (const label of await labels().all()) {
        assert.match(await label.innerText(), /^Başlangıca \d+,\d km$/);
        const geometry = await label.evaluate(node => {
          const box = node.getBoundingClientRect(); const parent = node.parentElement.getBoundingClientRect();
          return { contained: box.left >= parent.left && box.right <= parent.right + 1, clipped: node.scrollHeight > node.clientHeight + 1, buttonAncestor: !!node.closest('[role="button"]') };
        });
        assert.deepEqual(geometry, { contained: true, clipped: false, buttonAncestor: false });
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await scroll(250); await page.screenshot({ path: path.join(output, `home-${viewport.width}-scale-${scale}.png`) });
      await labels().nth(4).scrollIntoViewIfNeeded(); await page.screenshot({ path: path.join(output, `alternatives-${viewport.width}-scale-${scale}.png`) });
      record('Valid: all five labels, single text announcement, no button duplication/overflow; batch/seed/state/scroll stable');
      const located = await snapshot(); const firstLabels = await labels().allTextContents();
      await start(); assert.equal(await labels().count(), 0); await permit();
      await finish({ latitude: 40.02, longitude: 32.94 });
      assert.notDeepEqual(await labels().allTextContents(), firstLabels);
      assert.deepEqual(stable(await snapshot()), stable(located)); record('Live update changes labels only');
      await start(); await page.evaluate(() => window.__permissions.shift().resolve({ status: 'denied', canAskAgain: true }));
      await page.waitForFunction(() => !window.__homeContext.locating);
      assert.equal(await labels().count(), 0); assert.deepEqual(stable(await snapshot()), stable(located)); record('Denied refresh clears labels without changing batch');
      await start(); await permit(); await finish({ latitude: NaN, longitude: 32.85 });
      assert.equal(await labels().count(), 0); assert.deepEqual(stable(await snapshot()), stable(located)); record('Invalid OS response clears labels without fake zero');
      await start(); await permit(); await page.evaluate(() => window.__positions.shift().reject(new Error('Test unavailable')));
      await page.waitForFunction(() => !window.__homeContext.locating); assert.equal(await labels().count(), 0); record('Location error omits labels');
      await start(); await permit(); await finish(coordinates);
      const card = page.getByRole('button', { name: /Planı incele$/ }).first();
      await card.scrollIntoViewIfNeeded(); const homeScroll = await scroll();
      await card.click(); await page.getByRole('heading', { name: 'Planın akışı', exact: true }).waitFor();
      assert.ok((await page.locator('body').innerText()).includes('Başlangıca'));
      await page.getByRole('button', { name: /1\. durak:/ }).click(); await page.getByRole('heading', { name: 'Mekân hakkında', exact: true }).waitFor();
      assert.ok((await page.locator('body').innerText()).includes('Başlangıca'));
      await page.getByRole('button', { name: 'Önceki detaya dön', exact: true }).click();
      await page.getByRole('button', { name: 'Geri dön', exact: true }).click(); await card.waitFor();
      await page.waitForTimeout(100); assert.ok(Math.abs((await scroll()) - homeScroll) <= 1); record('Plan/Place/related metadata and Back preserve Home scroll');
      const dismissedId = (await snapshot()).ids[0];
      await page.getByRole('button', { name: /: Bana göre değil$/ }).first().click();
      await page.getByRole('button', { name: 'Son gizlenen öneriyi geri al', exact: true }).waitFor();
      assert.ok((await snapshot()).dismissed.includes(dismissedId));
      await page.getByRole('button', { name: 'Son gizlenen öneriyi geri al', exact: true }).click();
      await page.waitForFunction(id => !window.__homeContext.dismissed.includes(id), dismissedId); record('Independent Save/Dismiss/Undo remains functional');
      // Dismiss/Undo intentionally removes a save under the existing exclusivity contract.
      if (!(await snapshot()).saved.length) { await page.getByRole('button', { name: /: Kaydet$/ }).first().click(); await page.waitForFunction(() => window.__homeContext.saved.length === 1); }
      // Supersede a pending position request, then finish the newer one before the old one.
      await start(); await permit(); await start(); await permit();
      await page.evaluate(() => window.__positions.pop().resolve({ coords: { latitude: 40, longitude: 33 } }));
      await page.waitForFunction(() => !window.__homeContext.locating);
      await page.evaluate(() => window.__positions.shift().resolve({ coords: { latitude: 38, longitude: 31 } }));
      await page.waitForTimeout(80); assert.equal((await snapshot()).coordinates.latitude, 40); record('Superseded response cannot overwrite newer location');
      await start(); await permit();
      await page.getByRole('tab', { name: /Kaydedilenler,/ }).click(); await page.getByRole('heading', { name: 'Kaydedilenler', exact: true }).waitFor();
      const eventsBefore = await page.evaluate(() => window.__events.length);
      await page.evaluate(() => window.__positions.shift().resolve({ coords: { latitude: 38, longitude: 31 } }));
      await page.waitForTimeout(80); assert.equal((await snapshot()).coordinates.latitude, 40);
      assert.equal(await page.evaluate(() => window.__events.length), eventsBefore);
      assert.ok((await page.locator('body').innerText()).includes('Başlangıca')); record('Saved metadata renders; departed Home response ignored');
      await page.getByRole('tab', { name: 'Ana Sayfa', exact: true }).click();
      // A permission response arriving after a filter departure must not start GPS.
      await start();
      await page.getByRole('tab', { name: 'Mekân önerileri', exact: true }).click();
      await page.waitForFunction(() => window.__homeContext.filter === 'place');
      const positionCount = await page.evaluate(() => window.__positions.length);
      await page.evaluate(() => window.__permissions.shift().resolve({ status: 'granted', canAskAgain: true }));
      await page.waitForTimeout(80); assert.equal(await page.evaluate(() => window.__positions.length), positionCount);
      record('Obsolete permission response after filter departure cannot start GPS');
      const placeBefore = await snapshot();
      await start(); await permit(); await finish(coordinates);
      const placeAfter = await snapshot(); assert.ok(placeAfter.calls > placeBefore.calls);
      assert.equal(placeAfter.seed, placeBefore.seed);
      assert.ok((await page.locator('body').innerText()).match(/\d+\.\d km/));
      assert.equal(await labels().count(), 0); record('Place retains immediate location-driven recomputation and existing decimal precision');
      await start(); await permit(); await page.evaluate(() => window.__unmount());
      const afterUnmountEvents = await page.evaluate(() => window.__events.length);
      await page.evaluate(coords => window.__positions.shift().resolve({ coords }), coordinates);
      await page.waitForTimeout(80); assert.equal(await page.evaluate(() => window.__events.length), afterUnmountEvents);
      assert.equal(await page.locator('#root').innerText(), ''); record('Unmounted App rejects late response');
      await page.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify({ checks, errors }, null, 2) + '\n');
    console.log(`${checks.length} checks passed; zero page errors`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
