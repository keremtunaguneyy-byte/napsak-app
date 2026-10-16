const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.GEZEK_BROWSER_MODULES + '/playwright');
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8801';
const output = process.env.GEZEK_ANKARA101_EVIDENCE || 'docs/evidence/ankara101';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const checks = [], errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(base + '/?top=24&scale=1.8');
    await page.getByRole('tab', { name: 'Ankara 101', exact: true }).click();
    await page.getByTestId('index-guide-eymir').waitFor();
    await page.evaluate(() => {
      const guide = window.__catalog.guides.find(g => g.id === 'guide-eymir');
      guide.paragraphs = Array.from({ length: 8 }, () => guide.paragraphs).flat();
    });
    await page.getByTestId('index-guide-eymir').click();
    const scroller = page.getByTestId('ankara101-reader-scroll');
    const size = await scroller.evaluate(el => ({ total: el.scrollHeight, viewport: el.clientHeight }));
    assert.ok(size.total > 7000, JSON.stringify(size));
    await scroller.evaluate(el => { el.scrollTop = el.scrollHeight; });
    await page.waitForTimeout(100);
    const source = await page.getByTestId('ankara101-source').boundingBox();
    const nav = await page.getByRole('tablist').boundingBox();
    assert.ok(source.y + source.height <= nav.y && source.y >= 80);
    await page.screenshot({ path: `${output}/long-16-paragraphs-1.8-footer.png` });
    checks.push({ name: 'sixteen current-catalog paragraphs flow at 180% without height clipping', bodyHeight: size.total, pass: true });
    await page.getByRole('button', { name: 'Rehberi kapat', exact: true }).click();
    await page.evaluate(() => { window.__ankaraPresentations['guide-hamamonu'].mediaKey = 'missing-local-media'; });
    await page.getByTestId('index-guide-hamamonu').click();
    await page.getByTestId('reader-guide-hamamonu').waitFor();
    assert.ok(await page.getByTestId('ankara101-media-unavailable').count() >= 1);
    await page.screenshot({ path: `${output}/media-unavailable.png` });
    checks.push({ name: 'missing media retains neutral decorative slot and exact reader identity', pass: true });
    await page.evaluate(() => {
      const guides = window.__catalog.guides;
      guides.splice(guides.findIndex(g => g.id === 'guide-hamamonu'), 1);
    });
    await page.getByRole('button', { name: 'Hamamönü sokakları: Kaydet', exact: true }).click();
    await page.getByText('Bu rehber şu anda kullanılamıyor.', { exact: true }).waitFor();
    await page.screenshot({ path: `${output}/guide-unavailable.png` });
    await page.getByRole('button', { name: 'Rehberi kapat', exact: true }).click();
    await page.getByTestId('index-guide-ankara-kalesi').waitFor();
    checks.push({ name: 'catalog removal during a session fails safely with Close still available', pass: true });
    for (const mode of ['fontFail', 'fontHold']) {
      await page.goto(`${base}/?top=24&${mode}=true`);
      await page.getByRole('tab', { name: 'Ankara 101', exact: true }).click();
      await page.getByTestId('ankara101-font-failed').waitFor({ timeout: 15000 });
      await page.getByRole('button', { name: 'Geri dön', exact: true }).click();
      await page.waitForFunction(() => window.__savedState.step === 'results');
      assert.equal(await page.getByTestId('ankara101-index').count(), 0);
      checks.push({ name: 'failed font gate exits directly to Home without rendering editorial fallback', mode, pass: true });
    }
    assert.deepEqual(errors, []);
  } finally {
    fs.writeFileSync(`${output}/edge-browser-results.json`, JSON.stringify({ checks, errors }, null, 2) + '\n');
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
