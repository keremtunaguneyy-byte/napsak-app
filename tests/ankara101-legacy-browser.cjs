// Production App with local service adapters. Legacy data is seeded as an existing saved record.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.GEZEK_BROWSER_MODULES + '/playwright');
const configs = require('../src/design/ankara101Presentation.json');
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8801';
const output = process.env.GEZEK_ANKARA101_EVIDENCE;
const legacyId = 'insider-kugulu-ayranci';
const checks = [], errors = [];
(async () => {
 const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
 try {
  for (const width of [393, 412]) for (const scale of [1, 1.8]) {
   const context = await browser.newContext({ viewport: { width, height: width === 393 ? 852 : 915 }, reducedMotion: 'reduce' });
   const page = await context.newPage(); page.on('pageerror', e => errors.push(String(e)));
   await page.goto(`${base}/?top=24&scale=${scale}`);
   await page.getByRole('tab', { name: 'Ankara 101', exact: true }).click();
   await page.getByTestId('index-guide-tunali-kugulu').waitFor();
   assert.deepEqual(await page.locator('[data-testid^="index-guide-"]').evaluateAll(nodes => nodes.map(n => n.dataset.testid.slice(6))), Object.keys(configs));
   const index = page.getByTestId('ankara101-index');
   assert.doesNotMatch(await index.innerText(), /Bir Ankaralı Gibi|REHBERLERDEN SONRA|YEREL ROTALAR/i);
   assert.equal(await page.getByTestId('ankara101-insider-continuation').count(), 0);
   await page.getByTestId('ankara101-index-scroll').evaluate(el => { el.scrollTop = el.scrollHeight; });
   await page.getByTestId('index-media-guide-tunali-kugulu').getByTestId('ankara101-image-ready').waitFor();
   const end = await page.getByTestId('ankara101-index-lane').evaluate(lane => {
    const contents = lane.lastElementChild, last = contents.lastElementChild;
    return { lastSection: contents.dataset.testid, lastEntry: last.dataset.testid, clearance: lane.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom };
   });
   assert.equal(end.lastSection, 'ankara101-contents'); assert.equal(end.lastEntry, 'index-guide-tunali-kugulu');
   assert.ok(Math.abs(end.clearance - 48) < 1, JSON.stringify(end));
   const final = await page.getByTestId('index-guide-tunali-kugulu').boundingBox(), nav = await page.getByRole('tablist').boundingBox();
   assert.ok(final.y + final.height <= nav.y - 47);
   await page.screenshot({ path: `${output}/index-end-${width}-${scale}.png` });
   checks.push({ name: 'exactly twelve approved IDs; no Insider subtree; final card and original 48px clearance', width, scale, end, pass: true });

   await page.evaluate(() => localStorage.clear());
   await page.goto(`${base}/?top=24&scale=${scale}&saved=${legacyId},${Object.keys(configs).join(',')}`);
   await page.getByRole('tab', { name: 'Kaydedilenler', exact: true }).click();
   const row = page.getByTestId(`saved-open:${legacyId}`), savedScroll = page.getByTestId('production-saved-scroll');
   for (const exit of ['back', 'close', 'hardware']) {
    await row.scrollIntoViewIfNeeded(); await page.waitForTimeout(100);
    const y = await savedScroll.evaluate(el => el.scrollTop);
    await row.click(); await page.getByRole('heading', { name: 'BİR ANKARALI GİBİ', exact: true }).waitFor();
    assert.equal((await page.evaluate(() => window.__savedState)).editorialOrigin.id, legacyId);
    assert.ok(await page.getByRole('heading', { name: 'Kuğulu’dan Ayrancı’ya yavaş bir öğleden sonra', exact: true }).isVisible());
    if (exit === 'back') await page.screenshot({ path: `${output}/legacy-saved-reader-${width}-${scale}.png` });
    if (exit === 'hardware') assert.equal(await page.evaluate(() => window.__hardwareBack()), true);
    else await page.getByRole('button', { name: exit === 'close' ? 'Rehberi kapat' : 'Kaydedilenlere dön', exact: true }).click();
    await page.waitForFunction(id => document.activeElement?.getAttribute('data-testid') === `saved-open:${id}`, legacyId);
    assert.ok(Math.abs(await savedScroll.evaluate(el => el.scrollTop) - y) < 2);
    assert.equal(await page.evaluate(() => window.__savedState.step), 'saved');
   }
   checks.push({ name: 'pre-existing Insider record opens unchanged Reader; Back/Close/Android Back restore Saved scroll/focus', width, scale, pass: true });
   await row.click(); await page.getByRole('button', { name: 'Bir Ankaralı Gibi rotası kaydını kaldır', exact: true }).click();
   assert.equal(await page.getByRole('heading', { name: 'BİR ANKARALI GİBİ', exact: true }).count(), 1);
   await page.getByRole('button', { name: 'Rehberi kapat', exact: true }).click();
   await page.waitForFunction(id => !window.__savedState.saved.includes(id), legacyId);
   assert.equal(await page.getByTestId(`saved-row:${legacyId}`).count(), 0);
   await page.reload(); await page.getByRole('tab', { name: 'Kaydedilenler', exact: true }).click();
   assert.equal(await page.getByTestId(`saved-row:${legacyId}`).count(), 0);
   assert.equal(await page.locator('[data-testid^="saved-row:"]').count(), 12);
   // Row-level Unsave also preserves the existing persistence contract.
   await page.evaluate(() => localStorage.clear());
   await page.goto(`${base}/?top=24&saved=${legacyId}`);
   await page.getByRole('tab', { name: 'Kaydedilenler', exact: true }).click();
   await page.getByTestId(`saved-unsave:${legacyId}`).click();
   await page.getByTestId('saved-empty').waitFor();
   await page.reload(); await page.getByRole('tab', { name: 'Kaydedilenler', exact: true }).click();
   await page.getByTestId('saved-empty').waitFor();
   checks.push({ name: 'legacy Reader and Saved-row Unsave persist across restart without removing other Guide records', width, scale, pass: true });
   await context.close();
  }
  assert.deepEqual(errors, []);
 } finally { fs.writeFileSync(`${output}/legacy-browser-results.json`, JSON.stringify({ checks, errors }, null, 2) + '\n'); await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
