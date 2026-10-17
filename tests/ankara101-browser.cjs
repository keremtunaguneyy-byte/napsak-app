// Actual App/RN Web with local service adapters. This is not physical Android acceptance.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.join(process.env.GEZEK_BROWSER_MODULES, 'playwright'));
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8801';
const output = process.env.GEZEK_ANKARA101_EVIDENCE || 'docs/evidence/ankara101';
const configs = require('../src/design/ankara101Presentation.json');
fs.mkdirSync(output, { recursive: true });
const checks = [], errors = [];
const record = (name, details = {}) => { checks.push({ name, ...details, pass: true }); console.log(name, JSON.stringify(details)); };
const waitLayout = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const setScroll = async (locator, y) => { await locator.evaluate((el, offset) => { el.scrollTop = offset; }, y); await locator.page().waitForTimeout(80); };
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  try {
    for (const viewport of [{ width: 393, height: 852 }, { width: 412, height: 915 }]) for (const scale of [1, 1.8]) {
      const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(String(e)));
      const prefix = `${viewport.width}-${scale}`;
      await page.goto(`${base}/?top=24&scale=${scale}`);
      await page.getByRole('tab', { name: 'Ankara 101', exact: true }).click();
      await page.getByTestId('index-guide-ankara-kalesi').waitFor();
      await waitLayout(page);
      if (scale > 1) {
        const masthead = await page.getByRole('heading', { name: 'Ankara', exact: true }).boundingBox();
        const badge = await page.getByText('101', { exact: true }).boundingBox();
        assert.ok(masthead.y + masthead.height <= badge.y, 'large masthead and badge flow without overlap');
      }
      await page.screenshot({ path: `${output}/index-${prefix}.png` });
      const initialHome = await page.evaluate(() => ({ ids: window.__savedState.ids, seed: window.__savedState.seed, filter: window.__savedState.filter }));
      const catalog = await page.evaluate(() => window.__catalog);
      for (const [id, config] of Object.entries(configs)) {
        const guide = catalog.guides.find(g => g.id === id);
        const entry = page.getByTestId(`index-${id}`);
        await entry.scrollIntoViewIfNeeded();
        await waitLayout(page);
        let indexY = await page.getByTestId('ankara101-index-scroll').evaluate(el => el.scrollTop);
        await entry.click(id === 'guide-ankara-kalesi' ? { position: { x: 10, y: 100 } } : {});
        const reader = page.getByTestId(`reader-${id}`);
        await reader.waitFor();
        indexY = await page.evaluate(() => window.__savedState.readerSession.origin.scrollY);
        await waitLayout(page);
        assert.equal(await page.evaluate(() => window.__savedState.readerSession.guideId), id);
        assert.equal(await page.getByTestId('ankara101-reader-host').count(), 1);
        const bounds = await reader.boundingBox();
        assert.equal(bounds.width, 393);
        assert.equal(bounds.x, (viewport.width - 393) / 2);
        const scroller = page.getByTestId('ankara101-reader-scroll');
        const total = await scroller.evaluate(el => ({ height: el.scrollHeight, viewport: el.clientHeight }));
        await page.screenshot({ path: `${output}/${id}-${prefix}-top.png` });
        // Capture the complete normal-text body in consecutive real scroll viewports.
        if (scale === 1) {
          for (let tile = 1, y = total.viewport - 80; y < total.height - 80; tile++, y += total.viewport - 80) {
            await setScroll(scroller, y);
            await page.screenshot({ path: `${output}/${id}-${prefix}-body-${tile}.png` });
          }
        }
        await setScroll(scroller, 99999);
        const source = page.getByTestId('ankara101-source');
        const sourceBox = await source.boundingBox();
        const nav = await page.getByRole('tablist').boundingBox();
        assert.ok(sourceBox.height >= 44 && sourceBox.y + sourceBox.height <= nav.y, `${id} source clears navigation`);
        assert.ok(sourceBox.x >= 0 && sourceBox.x + sourceBox.width <= viewport.width);
        await page.screenshot({ path: `${output}/${id}-${prefix}-footer.png` });
        const readerY = await scroller.evaluate(el => el.scrollTop);
        await source.click();
        assert.equal(await page.evaluate(() => window.__maps.at(-1)), guide.sourceUrl);
        assert.equal(await scroller.evaluate(el => el.scrollTop), readerY);
        assert.equal(await page.evaluate(() => window.__savedState.readerSession.guideId), id);
        const text = await reader.innerText();
        assert.ok(text.includes(guide.practicalNote));
        for (const para of guide.paragraphs) assert.ok(text.replace(/\s+/g, ' ').includes(para.replace(/\s+/g, ' ')), `${id} exact catalog paragraphs`);
        for (const stop of guide.routeStops || []) assert.ok(text.includes(stop));
        // Independent save/unsave must never navigate.
        await setScroll(scroller, 0);
        await page.getByRole('button', { name: `${guide.title}: Kaydet`, exact: true }).click();
        await page.waitForFunction(id => window.__savedState.saved.includes(id), id);
        assert.equal(await page.evaluate(() => window.__savedState.readerSession.guideId), id);
        await page.getByRole('button', { name: `${guide.title}: Kaydı kaldır`, exact: true }).click();
        await page.waitForFunction(id => !window.__savedState.saved.includes(id), id);
        if (id === 'guide-ankara-kalesi') await page.getByRole('button', { name: 'Rehberi kapat', exact: true }).click();
        else if (id === 'guide-hamamonu') await page.evaluate(() => window.__hardwareBack());
        else await page.getByRole('button', { name: 'İçindekilere dön', exact: true }).click();
        await page.waitForFunction(() => !window.__savedState.readerSession);
        await waitLayout(page);
        const returnY = await page.getByTestId('ankara101-index-scroll').evaluate(el => el.scrollTop);
        assert.ok(Math.abs(returnY - indexY) < 2, `${id} index scroll ${returnY} vs ${indexY}`);
        await page.waitForFunction(id => document.activeElement?.getAttribute('data-testid') === `index-${id}`, id);
        assert.equal(await entry.evaluate(el => el === document.activeElement), true, `${id} restored index focus`);
        record('exact route/content/source/bookmark/origin/clearance', { id, viewport, scale, node: config.nodes[`mobile_${viewport.width}`], bodyHeight: total.height, sourceBottom: sourceBox.y + sourceBox.height, navTop: nav.y });
      }
      // The production index ends after its twelve approved Guides; Home stays stable.
      const indexScroll = page.getByTestId('ankara101-index-scroll');
      await setScroll(indexScroll, 940);
      const settingsY = await indexScroll.evaluate(el => el.scrollTop);
      await page.getByRole('button', { name: 'Ayarları aç', exact: true }).click();
      await page.waitForFunction(() => window.__savedState.step === 'settings');
      await page.evaluate(() => window.__hardwareBack());
      await page.waitForFunction(() => window.__savedState.step === 'guides');
      await page.waitForFunction(y => Math.abs(document.querySelector('[data-testid="ankara101-index-scroll"]').scrollTop - y) < 2, settingsY);
      await page.getByRole('button', { name: 'Ayarları aç', exact: true }).click();
      await page.getByRole('button', { name: 'Ankara 101’e dön', exact: true }).click();
      await page.waitForFunction(y => Math.abs(document.querySelector('[data-testid="ankara101-index-scroll"]').scrollTop - y) < 2, settingsY);
      record('cover Settings visible and hardware Back restore index viewport', { viewport, scale });
      assert.equal(await page.getByRole('button', { name: 'Bir Ankaralı Gibi rotalarını aç' }).count(), 0);
      assert.equal(await page.locator('[data-testid^="index-guide-"]').count(), 12);
      await page.getByRole('tab', { name: 'Ana Sayfa', exact: true }).click();
      assert.deepEqual(await page.evaluate(() => ({ ids: window.__savedState.ids, seed: window.__savedState.seed, filter: window.__savedState.filter })), initialHome);
      record('twelve-guide discovery and unchanged Home batch', { viewport, scale });
      await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 393, height: 852 } });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    const ids = Object.keys(configs);
    await page.goto(`${base}/?top=24&saved=${ids.join(',')},collection-ankara-classics,insider-kugulu-ayranci`);
    await page.getByRole('tab', { name: 'Kaydedilenler', exact: true }).click();
    for (const id of ids) {
      const row = page.getByTestId(`saved-open:${id}`);
      await row.scrollIntoViewIfNeeded(); await waitLayout(page);
      const y = await page.getByTestId('production-saved-scroll').evaluate(el => el.scrollTop);
      await row.click();
      await page.getByTestId(`reader-${id}`).waitFor();
      await page.screenshot({ path: `${output}/${id}-saved-origin.png` });
      await page.getByRole('button', { name: 'Rehberi kapat', exact: true }).click();
      await page.waitForFunction(() => window.__savedState.step === 'saved');
      await page.waitForFunction(id => document.activeElement?.getAttribute('data-testid') === `saved-open:${id}`, id);
      assert.ok(Math.abs(await page.getByTestId('production-saved-scroll').evaluate(el => el.scrollTop) - y) < 2);
      assert.ok(await row.evaluate(el => el === document.activeElement));
      record('Saved-origin exact Guide, Close, scroll and focus', { id });
    }
    await page.getByTestId('saved-open:collection-ankara-classics').click();
    await page.getByTestId('index-guide-ankara-kalesi').waitFor();
    assert.equal(await page.evaluate(() => window.__savedState.readerSession), undefined);
    await page.getByTestId('index-guide-hamamonu').click();
    await page.getByRole('button', { name: 'İçindekilere dön', exact: true }).click();
    await page.getByTestId('index-guide-hamamonu').waitFor();
    await page.getByTestId('index-guide-hamamonu').click();
    await page.getByRole('button', { name: 'Rehberi kapat', exact: true }).click();
    await page.waitForFunction(() => window.__savedState.step === 'saved');
    await page.getByTestId('saved-open:collection-ankara-classics').click();
    await page.evaluate(() => window.__hardwareBack());
    await page.waitForFunction(() => window.__savedState.step === 'saved');
    record('legacy collection opens index and hardware Back returns Saved');
    const first = ids[0];
    const firstGuide = await page.evaluate(id => window.__catalog.guides.find(g => g.id === id), first);
    await page.getByTestId(`saved-open:${first}`).click();
    await page.getByRole('button', { name: `${firstGuide.title}: Kaydı kaldır`, exact: true }).click();
    assert.equal(await page.evaluate(() => window.__savedState.readerSession.guideId), first);
    await page.evaluate(() => window.__hardwareBack());
    await page.waitForFunction(() => window.__savedState.step === 'saved');
    assert.equal(await page.getByTestId(`saved-open:${first}`).count(), 0);
    await page.reload();
    await page.getByRole('tab', { name: 'Kaydedilenler', exact: true }).click();
    assert.equal(await page.getByTestId(`saved-open:${first}`).count(), 0);
    record('Saved-origin Unsave never traps reader and survives actual fixture restart');
    await page.getByTestId(`saved-open:${ids[1]}`).click();
    const readerScroll = page.getByTestId('ankara101-reader-scroll');
    await setScroll(readerScroll, 99999);
    await page.evaluate(() => { window.__rejectExternal = true; });
    await page.getByTestId('ankara101-source').click();
    assert.equal(await page.evaluate(() => window.__alerts.at(-1)?.title), 'Bağlantı açılamadı');
    assert.equal(await page.evaluate(() => window.__savedState.readerSession.guideId), ids[1]);
    record('source open failure retains exact reader and scroll');
    await context.close();
    for (const mode of ['fontFail', 'fontHold']) {
      const context = await browser.newContext({ viewport: { width: 393, height: 852 } });
      const page = await context.newPage();
      await page.goto(`${base}/?top=24&${mode}=true`);
      await page.getByRole('tab', { name: 'Ankara 101', exact: true }).click();
      await page.getByTestId('ankara101-font-failed').waitFor({ timeout: 15000 });
      await page.screenshot({ path: `${output}/${mode}.png` });
      assert.equal(await page.getByTestId('ankara101-index').count(), 0);
      await page.evaluate(() => history.replaceState({}, '', '?top=24'));
      await page.getByRole('button', { name: 'Yeniden dene', exact: true }).click();
      await page.getByTestId('index-guide-ankara-kalesi').waitFor();
      await page.getByRole('tab', { name: 'Ana Sayfa', exact: true }).click();
      await page.getByRole('tab', { name: 'Ankara 101', exact: true }).waitFor();
      record('bounded font failure and safe exit', { mode });
      await context.close();
    }
    assert.deepEqual(errors, []);
  } finally {
    fs.writeFileSync(`${output}/browser-results.json`, JSON.stringify({ checks, errors }, null, 2) + '\n');
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
