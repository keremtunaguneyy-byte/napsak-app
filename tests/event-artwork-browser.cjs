// Optional real App/RN Web preview; native/backend services are stubbed by the harness.
// GEZEK_BROWSER_MODULES, GEZEK_BROWSER_URL and GEZEK_BROWSER_OUTPUT select the local fixture.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.join(process.env.GEZEK_BROWSER_MODULES, 'playwright'));
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8775';
const output = process.env.GEZEK_BROWSER_OUTPUT;
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const checks = [], errors = [];
  fs.mkdirSync(output, { recursive: true });
  try {
    for (const viewport of [{ width: 393, height: 852 }, { width: 412, height: 915 }]) {
      const page = await browser.newPage({ viewport });
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(`${base}/?home=event`);
      await page.getByRole('tab', { name: 'Etkinlik önerileri', exact: true }).click();
      const ids = await page.evaluate(() => window.__catalog.events.map(e => e.id));
      const cases = [
        { name: 'supply', ids, mood: 'Sakin' },
        { name: 'acoustic', ids: ids.filter(id => /cso-iki|sempre|ataturke-saygi/.test(id)), mood: 'Sakin' },
        { name: 'family', ids: ids.filter(id => /magic-bubbles/.test(id)), mood: 'Sosyal' },
      ];
      for (const scenario of cases) {
        await page.goto(`${base}/?home=event&mood=${scenario.mood}&dismissed=${ids.filter(id => !scenario.ids.includes(id)).join(',')}`);
        await page.getByRole('tab', { name: 'Etkinlik önerileri', exact: true }).click();
        const cards = page.getByRole('button', { name: /Etkinliği incele$/ });
        await cards.first().waitFor();
        const cardCount = await cards.count();
        assert.ok(cardCount > 0);
        assert.equal(await page.getByText('gezek', { exact: true }).count(), 1, 'Only the header wordmark; no neutral Event artwork');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        const saves = page.getByRole('button', { name: /: Kaydet$/ });
        const dismisses = page.getByRole('button', { name: /: Bana göre değil$/ });
        for (const action of [saves.first(), dismisses.first()]) {
          const box = await action.boundingBox();
          assert.ok(box.width >= 44 && box.height >= 44);
        }
        await saves.first().scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(output, `${scenario.name}-hero-${viewport.width}.png`) });
        if (await saves.count() > 1) {
          await saves.nth(1).evaluate(node => {
            let scroller = node.parentElement;
            while (scroller && (!['auto', 'scroll'].includes(getComputedStyle(scroller).overflowY) || scroller.scrollHeight <= scroller.clientHeight + 1)) scroller = scroller.parentElement;
            if (scroller) scroller.scrollTop += node.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 100;
          });
          await page.screenshot({ path: path.join(output, `${scenario.name}-square-${viewport.width}.png`) });
        }
        await saves.first().click();
        await page.getByRole('button', { name: /: Kayıttan çıkar$/ }).first().waitFor();
        assert.equal(await page.getByRole('heading', { name: 'Etkinlik bilgisi', exact: true }).count(), 0);
        await dismisses.first().click();
        await page.getByText('Öneri gizlendi.', { exact: true }).waitFor();
        assert.equal(await page.getByRole('heading', { name: 'Etkinlik bilgisi', exact: true }).count(), 0);
        checks.push({ viewport, scenario: scenario.name, cards: cardCount, neutralFallbacks: 0, quickActionsIndependent: true });
      }
      await page.goto(`${base}/?assets=yes`);
      await page.getByRole('heading', { name: 'Magic Bubbles', exact: true }).waitFor();
      assert.equal(await page.locator('svg').count(), 27);
      await page.screenshot({ path: path.join(output, `responsive-assets-${viewport.width}.png`), fullPage: true });
      await page.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify({ checks, errors, evidence: 'RN Web; not physical-device acceptance' }, null, 2) + '\n');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
