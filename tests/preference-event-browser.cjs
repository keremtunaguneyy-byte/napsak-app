// Real App / RN Web browser evidence. Native, catalog-loader and persistence services are fixture adapters.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, devices } = require(path.join(process.env.GEZEK_BROWSER_MODULES, 'playwright'));
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8776';
const output = process.env.GEZEK_BROWSER_OUTPUT || 'docs/evidence/preference-event';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const checks = [], errors = [];
  fs.mkdirSync(output, { recursive: true });
  const check = (name, extra = {}) => checks.push({ name, ...extra });
  const assertCloseIcon = async (page, scenario) => {
    const button = page.getByRole('button', { name: 'Tercih düzenleyiciyi kapat', exact: true }).last();
    const metrics = await button.evaluate(element => {
      const box = element.getBoundingClientRect(), svg = element.querySelector('svg'), path = svg?.querySelector('path');
      if (!svg || !path) return { missing: true, text: element.textContent };
      const icon = svg.getBoundingClientRect(), mark = path.getBBox(), matrix = path.getScreenCTM();
      const center = new DOMPoint(mark.x + mark.width / 2, mark.y + mark.height / 2).matrixTransform(matrix);
      const style = getComputedStyle(element);
      return { text: element.textContent.trim(), width: box.width, height: box.height, svgWidth: icon.width, svgHeight: icon.height,
        dx: center.x - (box.x + box.width / 2), dy: center.y - (box.y + box.height / 2),
        path: path.getAttribute('d'), stroke: path.getAttribute('stroke'), caps: path.getAttribute('stroke-linecap'),
        background: style.backgroundColor, radius: style.borderRadius, shadow: style.boxShadow };
    });
    assert.equal(metrics.text, '', 'Close control must contain no text glyph');
    assert.equal(metrics.width, 44); assert.equal(metrics.height, 44);
    assert.equal(metrics.svgWidth, 24); assert.equal(metrics.svgHeight, 24);
    assert.ok(Math.abs(metrics.dx) < 0.1 && Math.abs(metrics.dy) < 0.1, 'Symmetric SVG mark centered in the touch target');
    assert.equal(metrics.path, 'M6 6L18 18M18 6L6 18'); assert.equal(metrics.stroke, '#102452'); assert.equal(metrics.caps, 'round');
    if (scenario === 'overview') { assert.equal(metrics.background, 'rgb(255, 255, 255)'); assert.equal(metrics.radius, '22px'); assert.notEqual(metrics.shadow, 'none'); }
    check('centered approved Close SVG: ' + scenario, metrics);
    return button;
  };
  const shot = async (page, name) => {
    const close = page.getByRole('button', { name: 'Tercih düzenleyiciyi kapat', exact: true }).last();
    if (await close.count()) await page.waitForFunction(element => {
      for (let node = element; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.opacity === '0' || style.visibility === 'hidden' || style.display === 'none') return false;
      }
      return true;
    }, await close.elementHandle());
    // Wait for browser paint only; no runtime loading or motion delay is introduced.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    return page.screenshot({ path: path.join(output, name + '.png') });
  };
  const snapshot = page => page.evaluate(() => ({ writes: structuredClone(window.__writes), context: structuredClone(window.__homeContext), scroll: document.querySelector('[data-testid="production-home-scroll"]').scrollTop }));
  const open = async (page, query = '') => { await page.goto(base + '/?' + query); await page.getByRole('tab', { name: 'Etkinlik önerileri', exact: true }).waitFor(); };
  const event = async page => page.getByRole('tab', { name: 'Etkinlik önerileri', exact: true }).click();
  try {
    for (const viewport of [{ width: 393, height: 852 }, { width: 412, height: 915 }]) {
      const page = await browser.newPage({ ...devices['Pixel 7'], viewport, deviceScaleFactor: 1 });
      page.on('pageerror', e => errors.push(e.message));
      assert.match(await page.evaluate(() => navigator.userAgent), /Android/);
      check('Android mobile browser emulation', viewport);
      await page.clock.setFixedTime(new Date('2026-10-13T12:00:00+03:00'));
      await open(page, 'budget=Ücretsiz&saved=ankara-kalesi'); await event(page);
      await page.getByTestId('event-empty-budget_no_match').waitFor();
      assert.equal(await page.getByRole('button', { name: /Etkinliği incele$/ }).count(), 0);
      assert.equal(await page.getByText('Yarın', { exact: true }).count(), 0);
      assert.equal(await page.getByText('Hafta sonu', { exact: true }).count(), 0);
      assert.equal(await page.getByRole('button', { name: 'Bugün', exact: true }).count(), 0);
      await shot(page, `budget-no-match-${viewport.width}`); check('free budget has no paid cards or date chip row', viewport);
      const budgetAction = page.getByRole('button', { name: 'Bütçeyi değiştir', exact: true });
      await budgetAction.scrollIntoViewIfNeeded(); const before = await snapshot(page);
      await budgetAction.click();
      await page.getByRole('heading', { name: 'Bugünkü bütçen' }).waitFor();
      assert.equal(await page.getByRole('heading', { name: 'Bugünkü tercihlerin' }).count(), 0);
      await assertCloseIcon(page, 'budget_only');
      await shot(page, `budget-sheet-${viewport.width}`);
      await page.getByRole('radio', { name: '₺', exact: true }).click();
      await page.getByRole('button', { name: 'Vazgeç', exact: true }).click();
      await budgetAction.waitFor(); const cancelled = await snapshot(page);
      assert.deepEqual(cancelled.writes, before.writes); assert.deepEqual(cancelled.context, before.context);
      assert.equal(cancelled.scroll, before.scroll); await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Bütçeyi değiştir');
      check('budget Cancel writes nothing, preserves seed/batch/filter/scroll and returns focus', viewport);
      await budgetAction.click(); await page.getByRole('radio', { name: '₺', exact: true }).click(); await page.getByRole('button', { name: 'Uygula', exact: true }).click();
      await page.getByRole('button', { name: /Etkinliği incele$/ }).first().waitFor();
      const applied = await snapshot(page), prev = before.writes.at(-1), next = applied.writes.at(-1);
      assert.deepEqual(next, { ...prev, budget: '₺' }); assert.equal(applied.context.seed, before.context.seed); assert.deepEqual(applied.context.previousBatch, before.context.previousBatch); assert.equal(applied.context.filter, 'event');
      await page.waitForFunction(() => /Etkinliği incele$/.test(document.activeElement?.getAttribute('aria-label') || ''));
      check('budget Apply writes budget only and focuses populated Event', viewport);
      await page.getByRole('button', { name: /Bugünkü tercihler:/ }).click(); await page.getByRole('heading', { name: 'Bugünkü tercihlerin', exact: true }).waitFor();
      await assertCloseIcon(page, 'overview');
      await page.evaluate(() => document.fonts.ready);
      assert.ok(await page.evaluate(() => document.fonts.check('18px PlusJakartaSans_800ExtraBold')));
      await shot(page, `preference-overview-${viewport.width}`);
      assert.equal(await page.getByText('Tercihlerin hazırlanıyor…', { exact: true }).count(), 0);
      const writesBeforeField = await page.evaluate(() => window.__writes.length);
      await page.getByRole('button', { name: /^Ruh hâli:/ }).click(); await page.getByRole('radio', { name: 'Enerjik', exact: true }).click();
      await page.keyboard.press('Escape'); await page.getByRole('heading', { name: 'Bugünkü tercihlerin', exact: true }).waitFor();
      assert.equal(await page.evaluate(() => window.__writes.length), writesBeforeField);
      await page.getByRole('button', { name: /^Ruh hâli:/ }).click(); await page.getByRole('radio', { name: 'Enerjik', exact: true }).click(); await page.getByRole('button', { name: 'Uygula', exact: true }).click();
      assert.equal(await page.evaluate(() => window.__writes.length), writesBeforeField);
      await page.getByRole('button', { name: 'İlgi alanlarını düzenle', exact: true }).click(); await shot(page, `interest-field-${viewport.width}`); await page.getByRole('checkbox', { name: /^Kahve:/ }).click(); await page.getByRole('button', { name: 'Uygula', exact: true }).click();
      await page.getByRole('button', { name: 'Değişiklikleri kaydet', exact: true }).click(); await page.getByRole('tab', { name: 'Etkinlik önerileri', exact: true }).waitFor();
      const overviewApplied = await snapshot(page);
      assert.equal(overviewApplied.writes.length, writesBeforeField + 1); assert.equal(overviewApplied.writes.at(-1).mood, 'Enerjik'); assert.ok(overviewApplied.writes.at(-1).interests.includes('Kahve')); assert.equal(overviewApplied.writes.at(-1).onboardingCompleted, true); assert.equal(overviewApplied.context.seed, applied.context.seed);
      check('overview fields remain drafts until one save; Back discards field; onboarding stays complete', viewport);
      await page.getByRole('button', { name: /Bugünkü tercihler:/ }).click(); await page.getByRole('button', { name: /^Bütçe:/ }).click(); await page.getByRole('radio', { name: 'Bedava', exact: true }).click(); await page.getByRole('button', { name: 'Tercih düzenleyiciyi kapat', exact: true }).last().click();
      assert.equal((await snapshot(page)).writes.length, overviewApplied.writes.length); check('Close exits full editor and discards unapplied draft', viewport);
      for (const field of ['Ruh hâli', 'Süre', 'Bütçe', 'Kişi sayısı', 'İlgi alanları']) {
        await page.getByRole('button', { name: /Bugünkü tercihler:/ }).click();
        const control = field === 'İlgi alanları' ? page.getByRole('button', { name: 'İlgi alanlarını düzenle', exact: true }) : page.getByRole('button', { name: new RegExp('^' + field + ':') });
        await control.click(); const close = await assertCloseIcon(page, field); await close.click();
      }
      const ids = await page.evaluate(() => window.__catalog.events.map(e => e.id));
      await open(page, 'budget=Fark etmez&dismissed=' + ids.concat(['place-hidden','xp-hidden','idea-hidden']).join(',') + '&saved=saved-place,saved-idea'); await event(page);
      await page.getByTestId('event-empty-all_dismissed').waitFor(); await shot(page, `all-dismissed-${viewport.width}`);
      const dismissedBefore = (await snapshot(page)).writes.at(-1);
      await page.getByRole('button', { name: 'Etkinlikleri geri getir', exact: true }).click(); await page.getByRole('button', { name: /Etkinliği incele$/ }).first().waitFor();
      const restored = (await snapshot(page)).writes.at(-1);
      assert.deepEqual(restored, { ...dismissedBefore, dismissed: ['place-hidden','xp-hidden','idea-hidden'] });
      await page.waitForFunction(() => /Etkinliği incele$/.test(document.activeElement?.getAttribute('aria-label') || ''));
      check('restore removes only all nine eligible Event dismissals and preserves saved/preferences', viewport);
      await open(page, 'state=no_current_catalog'); await event(page); await page.getByTestId('event-empty-no_current_catalog').waitFor(); await shot(page, `no-current-catalog-${viewport.width}`);
      for (const name of ['Bütçeyi değiştir','Etkinlikleri geri getir','Tekrar dene']) assert.equal(await page.getByRole('button', { name, exact: true }).count(), 0);
      check('globally empty usable catalog has information and no primary CTA', viewport);
      await open(page, 'state=load_error&budget=Fark etmez'); await event(page); await page.getByTestId('event-empty-load_error').waitFor(); await shot(page, `load-error-${viewport.width}`);
      const retryBefore = await snapshot(page); await page.getByRole('button', { name: 'Tekrar dene', exact: true }).click(); await page.getByTestId('event-empty-loading').waitFor();
      const busy = page.getByRole('button', { name: 'Yükleniyor…', exact: true }); assert.equal(await busy.getAttribute('aria-disabled'), 'true'); assert.equal(await busy.getAttribute('aria-busy'), 'true'); await shot(page, `loading-${viewport.width}`);
      assert.equal(await page.evaluate(() => window.__loadCalls), 1); await page.evaluate(() => window.__rejectCatalog()); await page.getByTestId('event-empty-load_error').waitFor();
      await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Tekrar dene'); assert.deepEqual((await snapshot(page)).writes, retryBefore.writes);
      check('real pending retry exposes busy/disabled; failure returns error action without writes', viewport);
      await page.getByRole('button', { name: 'Tekrar dene', exact: true }).click(); await page.getByTestId('event-empty-loading').waitFor(); const settled = Date.now(); await page.evaluate(() => window.__resolveCatalog()); await page.getByRole('button', { name: /Etkinliği incele$/ }).first().waitFor(); assert.ok(Date.now() - settled < 900);
      await page.waitForFunction(() => /Etkinliği incele$/.test(document.activeElement?.getAttribute('aria-label') || ''));
      assert.deepEqual((await snapshot(page)).writes, retryBefore.writes); check('retry success focuses Event with no artificial 0.9-second delay or preference writes', viewport);
      await page.close();
    }
    for (const scenario of [{ width:393,height:852,scale:1,long:true }, { width:412,height:915,scale:1.6,long:false }]) {
      const page = await browser.newPage({ viewport: { width: scenario.width, height: scenario.height }, reducedMotion: 'reduce' }); page.on('pageerror', e=>errors.push(e.message));
      await open(page, `budget=Ücretsiz&scale=${scenario.scale}&long=${scenario.long}`); await event(page); await page.getByTestId('event-empty-budget_no_match').waitFor();
      await page.getByRole('button', { name: 'Bütçeyi değiştir', exact: true }).scrollIntoViewIfNeeded();
      const action = await page.getByRole('button', { name: 'Bütçeyi değiştir', exact: true }).boundingBox(), footer = await page.getByRole('tab', { name: /^Ana Sayfa/ }).boundingBox();
      assert.ok(action.height >= 44 && action.width >= 44); assert.ok(action.y + action.height <= footer.y); assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth), false);
      await shot(page, scenario.long?'long-copy-393':'large-text-412');
      await page.getByRole('button', { name: 'Bütçeyi değiştir', exact: true }).click(); const apply = page.getByRole('button', { name: 'Uygula', exact: true }); await apply.waitFor(); await assertCloseIcon(page, 'large-text-budget'); await apply.scrollIntoViewIfNeeded(); const box=await apply.boundingBox(); assert.ok(box.y+box.height<=scenario.height); await shot(page, `budget-sheet-large-${scenario.width}`);
      await page.getByRole('button', { name: 'Vazgeç', exact: true }).click(); check('large text/long Turkish copy keeps action clear of footer and instant reduced-motion return', scenario); await page.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify({ evidence:'React Native Web with Android mobile browser emulation and Plus Jakarta Sans; stubbed native/backend services, not native-device or TalkBack proof', checks, errors }, null, 2)+'\n');
    console.log(JSON.stringify({ checks:checks.length, errors },null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exit(1)});
