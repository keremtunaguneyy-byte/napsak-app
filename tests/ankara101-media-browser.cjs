// Real App + RN Web, with Android source-size defaults and controlled decode timing.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.GEZEK_BROWSER_MODULES + '/playwright');
const configs = require('../src/design/ankara101Presentation.json');
const output = process.env.GEZEK_ANKARA101_EVIDENCE;
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8801';
const checks = [], errors = [];
const wait = page => page.waitForTimeout(100);
const rgb = hex => hex.match(/\w\w/g).map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
const contrast = (a, b) => { const x = rgb(a), y = rgb(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
(async () => {
 const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
 try {
  for (const width of [393, 412]) for (const scale of [1, 1.8]) {
   const context = await browser.newContext({ viewport: { width, height: width === 393 ? 852 : 915 }, reducedMotion: 'reduce' });
   const page = await context.newPage(); page.on('pageerror', e => errors.push(String(e)));
   await page.goto(`${base}/?top=24&scale=${scale}`);
   await page.getByRole('tab', { name: 'Ankara 101', exact: true }).click();
   await page.getByTestId('index-guide-hamamonu').waitFor(); await wait(page);
   assert.equal(await page.locator('[data-testid="ankara101-media-warmup"]').count(), 0);
   assert.ok(await page.locator('[data-testid="ankara101-index"] [data-testid="ankara101-image-ready"], [data-testid="ankara101-index"] [data-testid="ankara101-image-loading"]').count() <= 5);
   for (const [id, config] of Object.entries(configs)) {
    const card = page.getByTestId(`index-${id}`); await card.scrollIntoViewIfNeeded(); await wait(page);
    if (id !== 'guide-ankara-kalesi') {
     const media = page.getByTestId(`index-media-${id}`), panel = page.getByTestId(`index-panel-${id}`);
     await media.locator('[data-testid="ankara101-image-ready"]').waitFor();
     const geometry = await card.evaluate(el => {
      const rect = node => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; };
      const m = el.querySelector('[data-testid^="index-media-"]'), p = el.querySelector('[data-testid^="index-panel-"]'), t = el.querySelector('[data-testid^="index-title-"]'), a = el.querySelector('[data-testid^="index-arrow-"]'), image = m.querySelector('[data-testid="ankara101-image-ready"]');
      return { card: rect(el), media: rect(m), panel: rect(p), title: rect(t), arrow: rect(a), image: rect(image), overflow: getComputedStyle(m).overflow, background: getComputedStyle(p).backgroundColor, opacity: getComputedStyle(p).opacity, titleOverflow: t.scrollWidth > t.clientWidth, radius: getComputedStyle(el).borderBottomRightRadius };
     });
     assert.equal(geometry.media.width, 112); assert.equal(geometry.overflow, 'hidden');
     assert.equal(geometry.panel.x, geometry.media.right); assert.equal(geometry.image.width, 112);
     assert.ok(geometry.image.height <= geometry.media.height + .1);
     assert.equal(geometry.opacity, '1'); assert.ok(!geometry.background.includes('rgba') && geometry.background !== 'transparent');
     assert.equal(geometry.titleOverflow, false); assert.ok(geometry.title.right <= geometry.panel.right);
     assert.ok(geometry.arrow.width >= 44 && geometry.arrow.height >= 44 && geometry.arrow.right <= geometry.panel.right);
     assert.equal(geometry.radius, '28px'); assert.ok(contrast(config.top, config.ink) >= 4.5);
     checks.push({ id, width, scale, geometry, contrast: contrast(config.top, config.ink), pass: true });
    }
    await card.screenshot({ path: `${output}/card-${id}-${width}-${scale}.png` });
   }
   const insider = page.getByTestId('ankara101-insider-continuation'); await insider.scrollIntoViewIfNeeded();
   const position = await insider.evaluate(el => ({ follows: !!(el.previousElementSibling?.querySelector('[data-testid="index-guide-tunali-kugulu"]')), label: el.textContent }));
   assert.ok(position.follows && position.label.includes('REHBERLERDEN SONRA'));
   await page.screenshot({ path: `${output}/insider-${width}-${scale}.png` });
   await context.close();
  }
  // A cold selected decode exceeds the bounded hold: palette/motif remains until onLoad.
  const context = await browser.newContext({ viewport: { width: 393, height: 852 }, reducedMotion: 'reduce' });
  const page = await context.newPage(); page.on('pageerror', e => errors.push(String(e)));
  await page.goto(base + '/?top=24&decodeDelay=1200');
  await page.getByRole('tab', { name: 'Ankara 101', exact: true }).click();
  const entry = page.getByTestId('index-guide-hamamonu'); await entry.scrollIntoViewIfNeeded();
  await entry.click(); await page.getByTestId('ankara101-media-warmup').waitFor();
  assert.equal(await page.getByTestId('ankara101-media-warmup').count(), 1);
  await page.getByTestId('reader-guide-hamamonu').waitFor();
  const hero = page.getByTestId('ankara101-hero'); const before = await hero.boundingBox();
  await hero.getByTestId('ankara101-image-placeholder').waitFor();
  assert.ok(await hero.locator('svg').count() > 0);
  await page.screenshot({ path: `${output}/cold-placeholder.png` });
  await hero.getByTestId('ankara101-image-ready').waitFor();
  assert.deepEqual(await hero.boundingBox(), before);
  await page.screenshot({ path: `${output}/cold-loaded.png` });
  await page.getByRole('button', { name: 'İçindekilere dön', exact: true }).click();
  const warmStart = await page.evaluate(() => performance.now()); await entry.click();
  await page.getByTestId('reader-guide-hamamonu').waitFor(); await hero.getByTestId('ankara101-image-ready').waitFor();
  const warmMs = await page.evaluate(() => performance.now()) - warmStart;
  checks.push({ name: 'cold placeholder is motif-backed, fixed geometry, atomic; recent warm entry', warmMs, pass: true });
  await page.getByRole('button', { name: 'Rehberi kapat', exact: true }).click();
  await page.getByTestId('index-guide-gordion').scrollIntoViewIfNeeded();
  await page.getByTestId('index-guide-gordion').click();
  await page.getByRole('tab', { name: 'Ana Sayfa', exact: true }).click();
  await page.waitForTimeout(1500);
  assert.equal(await page.evaluate(() => window.__savedState.step), 'results');
  assert.equal(await page.getByTestId('ankara101-reader-host').count(), 0);
  assert.equal(await page.getByTestId('ankara101-media-warmup').count(), 0);
  checks.push({ name: 'navigation cancels pending decode; late completion cannot reopen reader', pass: true });
  await page.getByRole('tab', { name: 'Ankara 101', exact: true }).click();
  await page.getByTestId('index-guide-anadolu-medeniyetleri').scrollIntoViewIfNeeded();
  await page.getByTestId('index-guide-anadolu-medeniyetleri').click();
  await page.getByTestId('ankara101-media-warmup').waitFor();
  await page.evaluate(() => window.__unmount()); await page.waitForTimeout(1500);
  assert.equal(await page.getByTestId('ankara101-reader-host').count(), 0);
  checks.push({ name: 'unmount cancels selected decode and its timer without late routing', pass: true });
  await page.evaluate(() => localStorage.clear());
  await page.goto(base + '/?top=24&decodeDelay=1200&saved=guide-eymir,ankara-kalesi');
  await page.getByRole('tab', { name: 'Kaydedilenler', exact: true }).click();
  await page.getByTestId('saved-open:guide-eymir').waitFor();
  await page.evaluate(() => {
    document.querySelector('[data-testid="saved-open:guide-eymir"]').click();
    document.querySelector('[data-testid="saved-open:ankara-kalesi"]').click();
  });
  await page.waitForTimeout(1500);
  const detail = await page.evaluate(() => window.__savedState);
  assert.equal(detail.step, 'saved'); assert.equal(detail.readerSession, undefined);
  assert.equal(detail.detailSession.origin.screen, 'saved');
  assert.equal(await page.getByTestId('ankara101-media-warmup').count(), 0);
  checks.push({ name: 'Saved catalog Detail overlay cancels pending Guide decode without changing its origin', pass: true });
  await context.close(); assert.deepEqual(errors, []);
 } finally { fs.writeFileSync(`${output}/media-browser-results.json`, JSON.stringify({ checks, errors }, null, 2) + '\n'); await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
