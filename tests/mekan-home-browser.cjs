// Reuses buildDetailBrowserFixture.cjs with SNAPSHOT + PROXIMITY fixtures.
// Optional baseline URL compares the actual pre-change card trees, not Figma sample data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { chromium } = require(path.join(process.env.GEZEK_BROWSER_MODULES, 'playwright'));
const base = process.env.GEZEK_BROWSER_URL;
const before = process.env.GEZEK_BROWSER_BASELINE_URL;
const out = process.env.GEZEK_BROWSER_OUTPUT;
const checks = [], measurements = [], evidence = [];
const configs = [
  { width: 393, scale: 1 }, { width: 412, scale: 1 },
  { width: 393, scale: 1.5, controlOnly: true }, { width: 412, scale: 1.5, controlOnly: true },
  { width: 393, scale: 1.8 }, { width: 412, scale: 1.8 },
];
const batch = s => ({ ids: s.ids, scores: s.scores, seed: s.seed, history: s.history });
function sameTree(actual, expected, label = 'card') {
  if (typeof actual === 'number' && typeof expected === 'number') {
    assert.ok(Math.abs(actual - expected) <= 0.01, `${label}: ${actual} vs ${expected}`);
  } else if (actual && typeof actual === 'object') {
    assert.deepEqual(Object.keys(actual), Object.keys(expected), label);
    for (const key of Object.keys(actual)) sameTree(actual[key], expected[key], `${label}.${key}`);
  } else assert.equal(actual, expected, label);
}
const click = node => node.evaluate(n => n.click());
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const snap = page => page.evaluate(() => ({ ids: window.__homeContext.ids, scores: window.__homeContext.scores,
  seed: window.__homeContext.seed, history: window.__homeContext.previousBatch, calls: window.__recommendationCalls,
  gps: window.__gpsCalls, prompts: window.__permissionPromptCalls }));
const control = page => page.getByRole('checkbox', { name: 'Yakına öncelik ver', exact: true });
async function select(page, label) {
  await click(page.getByRole('tab', { name: label + ' önerileri', exact: true }));
  await page.waitForFunction(() => window.__homeContext.filter === window.__homeContext.batchFilter);
  await settle(page);
}
async function geometry(page) {
  return page.evaluate(() => {
    const scroll = document.querySelector('[data-testid="production-home-scroll"]');
    const rect = node => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y + scroll.scrollTop, width: r.width, height: r.height }; };
    const bodies = [...scroll.querySelectorAll('[role="button"]')].filter(n => n.getAttribute('aria-label')?.endsWith('Mekânı incele'));
    const cards = bodies.map(n => n.parentElement);
    // Compare all descendants, including artwork paths, text, quick actions and internal geometry.
    const trees = cards.map(card => {
      const origin = card.getBoundingClientRect();
      const ids = new Map([...card.querySelectorAll('[id]')].map((n, i) => [n.id, String(i)]));
      function tree(n) {
        const r = n.getBoundingClientRect(), css = getComputedStyle(n);
        const attrs = [...n.attributes].filter(a => !['class', 'style', 'id', 'tabindex'].includes(a.name)).map(a => [a.name,
          a.value.replace(/url\(#([^)]*)\)/g, (_, id) => `url(#${ids.get(id) ?? id})`)]);
        return { tag: n.tagName, attrs, text: n.children.length ? undefined : n.textContent,
          box: [r.x - origin.x, r.y - origin.y, r.width, r.height].map(v => Math.round(v * 1000) / 1000),
          css: ['color', 'backgroundColor', 'fontFamily', 'fontSize', 'lineHeight', 'borderRadius', 'borderWidth', 'padding', 'gap', 'boxShadow'].map(k => css[k]),
          children: [...n.children].map(tree) };
      }
      return tree(card);
    });
    return { cards: cards.map(rect), trees, control: rect(document.querySelector('[data-testid="proximity-control"]')),
      nav: rect(document.querySelector('[role="tab"][aria-label="Ana Sayfa"]').parentElement),
      heading: [...scroll.querySelectorAll('[role="heading"]')].filter(n => n.textContent === 'BUGÜNÜN MEKÂNI').map(rect) };
  });
}
async function open(browser, url, config, errors) {
  const page = await browser.newPage({ viewport: { width: config.width, height: config.width === 393 ? 852 : 915 } });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(`${url}/?budget=Fark%20etmez&scale=${config.scale}&controlOnly=${!!config.controlOnly}`);
  await page.waitForFunction(() => window.__homeContext?.ids.length === 5);
  await page.evaluate(() => document.fonts.ready);
  await select(page, 'Mekân');
  return page;
}
async function advance(page, state) {
  if (state === 'pending') {
    await click(control(page));
    await page.waitForFunction(() => window.__permissions.length === 1);
  } else if (state === 'active') {
    await page.evaluate(() => window.__permissions.shift().resolve({ status: 'granted' }));
    await page.waitForFunction(() => window.__positions.length === 1);
    await page.evaluate(() => window.__positions.shift().resolve({ coords: { latitude: 39.9208, longitude: 32.8541 } }));
    await page.waitForFunction(() => window.__homeContext.proximity.status === 'active' && window.__homeContext.proximityMode === 'nearby');
  } else if (state === 'fallback') {
    await page.evaluate(() => { window.__servicesEnabled = false; window.__emitAppState('change', 'background'); window.__emitAppState('change', 'active'); });
    await page.waitForFunction(() => window.__homeContext.proximity.status === 'off');
    await page.getByTestId('proximity-feedback').waitFor();
  }
  await settle(page);
}
(async () => {
  assert.ok(base && out, 'Set GEZEK_BROWSER_URL and GEZEK_BROWSER_OUTPUT');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const errors = [];
  try {
    for (const config of configs) {
      const page = await open(browser, base, config, errors);
      const baseline = before ? await open(browser, before, config, errors) : undefined;
      const a = await snap(page);
      let nearby;
      for (const state of ['off', 'pending', 'active', 'fallback']) {
        await advance(page, state);
        if (baseline) await advance(baseline, state);
        const current = await snap(page), g = await geometry(page);
        assert.equal(await page.getByText('Kahve', { exact: true }).count(), 0);
        assert.equal(await page.getByText('Sanat', { exact: true }).count(), 0);
        assert.equal(await page.getByRole('button', { name: /^(Kahve|Sanat)$/ }).count(), 0);
        assert.equal(await control(page).count(), 1);
        assert.equal(g.cards.length, 5);
        assert.equal(g.heading.length, 1);
        assert.ok(g.heading[0].x + g.heading[0].width <= g.control.x);
        assert.equal(await control(page).getAttribute('aria-busy'), state === 'pending' ? 'true' : 'false');
        assert.equal(await control(page).getAttribute('aria-checked'), state === 'active' ? 'true' : 'false');
        if (state === 'pending') { assert.deepEqual(batch(current), batch(a)); assert.equal(current.calls, a.calls); }
        if (state === 'active') nearby = current;
        if (config.scale === 1 || config.controlOnly) {
          assert.equal(g.control.x, config.width === 393 ? 184 : 193.5);
          assert.equal(g.control.y, 318);
          assert.equal(g.cards[0].y, config.controlOnly ? 394 : 374);
        }
        const hashes = g.trees.map(t => createHash('sha256').update(JSON.stringify(t)).digest('hex'));
        let old;
        if (baseline) {
          old = await geometry(baseline);
          assert.deepEqual(batch(current), batch(await snap(baseline)));
          sameTree(g.trees, old.trees); // Browser SVG transforms can differ by subpixel rounding after a translation.
          if (config.scale === 1 || config.controlOnly) {
            assert.deepEqual(g.control, old.control);
            for (let i = 0; i < 5; i++) assert.equal(old.cards[i].y - g.cards[i].y, 26);
          }
          assert.deepEqual(g.nav, old.nav);
        }
        measurements.push({ ...config, state, control: g.control, cards: g.cards, baselineCards: old?.cards, cardHashes: hashes });
        checks.push({ ...config, state, pass: true });
        const shot = config.scale === 1 && (state === 'off' || (config.width === 393 && state === 'active')) || config.width === 393 && config.controlOnly && state === 'off';
        if (shot) {
          const file = `${config.width}-${config.controlOnly ? 'large' : 'normal'}-${state}.png`;
          await page.evaluate(() => document.activeElement?.blur());
          if (!fs.existsSync(path.join(out, file))) await page.screenshot({ path: path.join(out, file) });
          evidence.push(file);
        }
      }
      // Restore the valid service state; warm A/B2 returns preserve IDs/order/seed and scroll.
      await page.evaluate(() => { window.__servicesEnabled = true; });
      const fallback = await snap(page);
      await select(page, 'Gezek'); await select(page, 'Mekân');
      assert.deepEqual(batch(await snap(page)), batch(fallback));
      assert.equal((await snap(page)).seed, a.seed);
      const savedBefore = await snap(page);
      await click(page.getByRole('button', { name: /: Kaydet$/ }).first()); await settle(page);
      assert.deepEqual(batch(await snap(page)), batch(savedBefore));
      assert.equal((await snap(page)).calls, savedBefore.calls);
      await click(page.getByRole('button', { name: /: Kayıttan çıkar$/ }).first()); await settle(page);
      const scroll = page.getByTestId('production-home-scroll');
      await scroll.evaluate(n => { n.scrollTop = 180; });
      await page.waitForTimeout(100); // Let RN Web's 32ms scroll throttle publish the origin.
      const offset = await scroll.evaluate(n => n.scrollTop);
      await click(page.getByRole('button', { name: /Mekânı incele$/ }).first());
      await page.getByRole('button', { name: 'Geri dön', exact: true }).click(); await settle(page);
      assert.equal(await scroll.evaluate(n => n.scrollTop), offset);
      assert.deepEqual(batch(await snap(page)), batch(savedBefore));
      const hidden = (await snap(page)).ids[0];
      await click(page.getByRole('button', { name: /: Bana göre değil$/ }).first());
      await page.waitForFunction(id => !window.__homeContext.ids.includes(id), hidden);
      await click(page.getByRole('button', { name: 'Son gizlenen öneriyi geri al', exact: true }));
      await page.waitForFunction(id => !window.__homeContext.dismissed.includes(id), hidden);
      for (const label of ['Gezek', 'Etkinlik', 'Fikir', 'Mekân']) {
        await select(page, label);
        assert.equal(await control(page).count(), ['Gezek', 'Mekân'].includes(label) ? 1 : 0);
      }
      await scroll.evaluate(n => { n.scrollTop = n.scrollHeight; }); await settle(page);
      const refresh = await page.getByRole('button', { name: 'Başka mekânlar göster', exact: true }).boundingBox();
      const nav = await page.getByRole('tab', { name: 'Ana Sayfa', exact: true }).boundingBox();
      assert.ok(refresh.y + refresh.height <= nav.y, 'Scroll end leaves actions clear of fixed navigation');
      const seed = (await snap(page)).seed;
      await click(page.getByRole('button', { name: 'Başka mekânlar göster', exact: true }));
      await page.waitForFunction(n => window.__homeContext.seed === n + 1 && window.__homeContext.batchSeed === n + 1, seed);
      assert.equal(nearby.seed, a.seed);
      checks.push({ ...config, name: 'Save/unsave, dismiss/Undo, Detail/Back scroll, filters, refresh and footer', pass: true });
      await page.close(); if (baseline) await baseline.close();
    }
    assert.deepEqual(errors, []);
    assert.equal(evidence.length, 4);
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ checks, measurements, evidence, errors }, null, 2));
    console.log(JSON.stringify({ checks: checks.length, cardComparisons: before ? 120 : 0, screenshots: evidence.length, errors }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
