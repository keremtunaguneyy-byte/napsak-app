// Actual App and RN Web, with controlled local service adapters; no native acceptance claim.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.join(process.env.GEZEK_BROWSER_MODULES, 'playwright'));
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8798';
const output = process.env.GEZEK_BROWSER_OUTPUT || '/private/tmp/gezek-saved-browser';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const checks = [], errors = [];
  try {
    for (const viewport of [{ width: 393, height: 852 }, { width: 412, height: 915 }]) for (const scale of [1, 1.8]) {
      if(process.env.GEZEK_SAVED_BROWSER_CASE && process.env.GEZEK_SAVED_BROWSER_CASE !== `${viewport.width}-${scale}`)continue;
      const page = await browser.newPage({ viewport });
      page.on('pageerror', e => errors.push(e.stack));
      const record = name => { checks.push({ viewport, scale, name, pass: true }); console.log(viewport.width, scale, name); };
      await page.goto(base);
      await page.waitForFunction(() => window.__catalog && window.__savedState?.step === 'results');
      const catalog = await page.evaluate(() => window.__catalog);
      const plan = catalog.experiences.find(p => p.id === 'xp-kugulu-segmenler'), place = catalog.places.find(p => p.id === 'erimtan'), idea = catalog.ideas.find(i => i.id === 'idea-stromae-racine-carree') || catalog.ideas[0];
      const event = catalog.events.find(e => e.id === 'event-cso-iki-keman-bir-miras-2026-10-16') || catalog.events[0];
      const guide = catalog.guides[0];
      const visible = [plan.id, place.id, event.id, idea.id, guide.id, 'collection-ankara-classics', 'insider-kugulu-ayranci'];
      const load = async (ids, params = '') => {
        await page.evaluate(() => localStorage.clear());
        await page.goto(`${base}/?scale=${scale}&saved=${encodeURIComponent(ids.slice().reverse().join(','))}${params}`);
        await page.getByRole('tab', { name: 'Kaydedilenler', exact: true }).click();
        await page.getByTestId('production-saved').waitFor();
        await page.evaluate(() => document.fonts.ready);
      };
      const scroll = page.getByTestId('production-saved-scroll');
      const getY = () => scroll.evaluate(n => n.scrollTop);
      const row = id => page.getByTestId(`saved-row:${id}`);
      const open = id => page.getByTestId(`saved-open:${id}`);
      const focusId = () => page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      const state = () => page.evaluate(() => window.__savedState);
      await load([...visible, 'missing-record']);
      assert.deepEqual(await page.locator('[data-testid^="saved-row:"]').evaluateAll(ns => ns.map(n => n.dataset.testid.slice(10))), visible);
      assert.equal(await page.getByRole('tab', { name: 'Kaydedilenler', exact: true }).getAttribute('aria-selected'), 'true');
      const ax = await page.locator('#root').ariaSnapshot();
      assert.ok(!/Kaydedilenler, \d+ kayıt/.test(ax));
      assert.equal((ax.match(/img|image:/g) || []).length, 0);
      record('Seven mixed entry shapes, resolved order, no count/tombstone or decorative image announcement');
      await page.screenshot({ path: path.join(output, `mixed-${viewport.width}-scale-${scale}.png`) });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      for (const id of visible) {
        const body = open(id);
        await body.scrollIntoViewIfNeeded();
        const geometry = await row(id).evaluate(n => {
          const buttons = [...n.querySelectorAll('[role=button]')].map(b => { const r = b.getBoundingClientRect(); return { w: r.width, h: r.height }; });
          return { buttons, overflow: [...n.querySelectorAll('div')].some(c => c.scrollWidth > c.clientWidth + 1) };
        });
        assert.equal(geometry.buttons.length, 2);
        assert.ok(geometry.buttons.every(b => b.w >= 44 && b.h >= 44));
        assert.equal(geometry.overflow, false);
      }
      await scroll.evaluate(n => { n.scrollTop = n.scrollHeight; }); await page.waitForTimeout(100);
      const navTop = await page.getByRole('tablist').evaluate(n => n.getBoundingClientRect().top);
      const lastBottom = await row(visible.at(-1)).evaluate(n => n.getBoundingClientRect().bottom);
      assert.ok(lastBottom <= navTop - 23);
      record('Wrapping, two independent 44px actions per row, last row clears fixed navigation by 24px');
      await page.screenshot({ path: path.join(output, `mixed-end-${viewport.width}-scale-${scale}.png`) });
      for (const id of [plan.id, place.id, event.id, idea.id]) for (const exit of ['back', 'close']) {
        await open(id).scrollIntoViewIfNeeded(); await page.waitForTimeout(80); const y = await getY(); await page.waitForFunction(y => Math.abs(window.__savedOffset() - y) <= 1, y);
        const before = await state();
        await open(id).click(); await page.getByRole('button', { name: 'Detayı kapat ve başladığın ekrana dön', exact: true }).waitFor();
        assert.equal((await state()).detailSession.origin.screen, 'saved');
        assert.equal((await state()).detailSession.origin.scrollY, y);
        await page.getByRole('button', { name: exit === 'close' ? 'Detayı kapat ve başladığın ekrana dön' : 'Geri dön', exact: true }).click();
        await page.waitForTimeout(140);
        assert.ok(Math.abs(await getY() - y) <= 1);
        assert.equal(await focusId(), `saved-open:${id}`);
        const after = await state(); assert.equal(after.filter, before.filter); assert.equal(after.seed, before.seed); assert.deepEqual(after.ids, before.ids);
      }
      record('All four recommendation kinds Back/Close restore exact Saved scroll/focus and Home context');
      await open(plan.id).scrollIntoViewIfNeeded(); await open(plan.id).click();
      await page.getByRole('button', { name: /1\. durak:/ }).click();
      await page.getByRole('button', { name: 'Önceki detaya dön', exact: true }).click();
      await page.getByRole('heading', { name: 'Planın akışı', exact: true }).waitFor();
      await page.getByRole('button', { name: /1\. durak:/ }).click();
      await page.getByRole('button', { name: 'Detayı kapat ve başladığın ekrana dön', exact: true }).click(); await page.waitForTimeout(140);
      assert.equal(await focusId(), `saved-open:${plan.id}`); record('Nested Plan → Place Back pops Plan; Close exits entire host to Saved');
      for (const id of visible.slice(4)) for (const hardware of [false, true]) {
        await open(id).scrollIntoViewIfNeeded(); await page.waitForTimeout(80); const y = await getY(); await page.waitForFunction(y => Math.abs(window.__savedOffset() - y) <= 1, y);
        await open(id).click(); await page.getByRole('button', { name: 'Kaydedilenlere dön', exact: true }).waitFor();
        if (id === guide.id) { await page.waitForTimeout(150); assert.ok(await page.getByRole('heading', { name: 'Kale’den Ulus’a: Şehrin ilk katmanı bölümü', exact: true }).isVisible()); }
        if (hardware) assert.equal(await page.evaluate(() => window.__hardwareBack()), true);
        else await page.getByRole('button', { name: 'Kaydedilenlere dön', exact: true }).click();
        await page.waitForTimeout(180);
        assert.equal((await state()).step, 'saved'); assert.ok(Math.abs(await getY() - y) <= 1, JSON.stringify({id,hardware,before:y,after:await getY(),active:await focusId(),state:await state()})); await page.waitForFunction(id => document.activeElement?.getAttribute('data-testid') === `saved-open:${id}`, id);
      }
      record('Guide exact chapter, collection and route reader visible/hardware Back restore Saved scroll/focus');
      await load([plan.id, place.id]);
      await page.getByTestId(`saved-unsave:${plan.id}`).click(); await page.waitForTimeout(150);
      assert.equal((await state()).detailSession, undefined); assert.equal(await focusId(), `saved-open:${place.id}`);
      assert.deepEqual((await state()).saved, [place.id]);
      await page.screenshot({ path: path.join(output, `after-unsave-${viewport.width}-scale-${scale}.png`) });
      await page.reload(); await page.getByRole('tab', { name: 'Kaydedilenler', exact: true }).click();
      assert.deepEqual(await page.locator('[data-testid^="saved-row:"]').evaluateAll(ns => ns.map(n => n.dataset.testid.slice(10))), [place.id]);
      await page.getByTestId(`saved-unsave:${place.id}`).click();
      await page.getByTestId('saved-empty').waitFor(); await page.waitForTimeout(150);
      assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Henüz bir şey kaydetmedin');
      await page.screenshot({ path: path.join(output, `empty-${viewport.width}-scale-${scale}.png`) });
      await page.getByRole('button', { name: 'Önerilere dön', exact: true }).click();
      await page.getByRole('heading', { name: 'Bugün bunlar olur.', exact: true }).waitFor();
      record('Independent Unsave moves focus, persists across browser restart, last removal focuses Empty, CTA reaches Home');
      await load([event.id], '&expired=true');
      assert.ok((await row(event.id).innerText()).includes('Başlangıç zamanı geçti'));
      await page.screenshot({ path: path.join(output, `expired-${viewport.width}-scale-${scale}.png`) });
      await open(event.id).click();
      await page.getByRole('heading', { name: 'Bu içerik şu anda kullanılamıyor', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Detayı kapat ve başladığın ekrana dön', exact: true }).click();
      record('Expired Event remains Saved, announces textual state and opens existing unavailable Detail');
      await load([plan.id, place.id], '&long=true');
      await page.screenshot({ path: path.join(output, `long-title-${viewport.width}-scale-${scale}.png`) });
      await load([plan.id]);
      await page.screenshot({ path: path.join(output, `one-item-${viewport.width}-scale-${scale}.png`) });
      await load([...catalog.experiences.slice(0, 12).map(i => i.id), ...catalog.places.slice(0, 12).map(i => i.id), ...visible.slice(2)]);
      await page.locator('[data-testid^="saved-open:"]').last().scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `long-list-${viewport.width}-scale-${scale}.png`) });
      const longIds = await page.locator('[data-testid^="saved-row:"]').evaluateAll(ns => ns.map(n => n.dataset.testid.slice(10)));
      await scroll.evaluate(n => { n.scrollTop = n.scrollHeight; }); await page.waitForTimeout(150);
      const oldY = await getY(), last = longIds.at(-1), previous = longIds.at(-2), lastHeight = await row(last).evaluate(n => n.getBoundingClientRect().height);
      await page.getByTestId(`saved-unsave:${last}`).click(); await page.waitForTimeout(180);
      assert.equal(await focusId(), `saved-open:${previous}`);
      assert.ok(await getY() >= oldY - lastHeight - 14);
      await page.screenshot({ path: path.join(output, `long-list-after-unsave-${viewport.width}-scale-${scale}.png`) });
      record('Controlled long-title, one-item and long mixed list; last-row Unsave focuses predecessor without jumping to top');
      await page.getByRole('tab', { name: 'Ana Sayfa', exact: true }).click();
      const home = page.getByRole('button', { name: /Planı incele$/ }).first(); await home.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100); const before = await state(); await home.click();
      assert.equal((await state()).detailSession.origin.screen, 'results');
      await page.getByRole('button', { name: 'Detayı kapat ve başladığın ekrana dön', exact: true }).click(); await page.waitForTimeout(100);
      assert.equal((await state()).step, 'results'); assert.deepEqual((await state()).ids, before.ids); assert.equal((await state()).seed, before.seed);
      record('Home-origin Detail remains Home without seed/filter/recommendation changes');
      await page.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ checks, errors }, null, 2));
    console.log(JSON.stringify({ checks: checks.length, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
