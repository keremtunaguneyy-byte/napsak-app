// Optional integration suite: build scripts/buildDetailBrowserFixture.cjs and serve its output.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.join(process.env.GEZEK_BROWSER_MODULES, 'playwright'));
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8771';
const output = process.env.GEZEK_BROWSER_OUTPUT || '/tmp/gezek-detail-browser';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.GEZEK_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const checks = [], errors = [];
  try {
    for (const viewport of [{ width: 393, height: 852 }, { width: 412, height: 915 }]) {
      const page = await browser.newPage({ viewport, reducedMotion: 'no-preference' });
      page.on('pageerror', error => errors.push(error.stack));
      const record = name => checks.push({ name, viewport, pass: true });
      const root = () => page.getByRole('heading', { name: 'Planın akışı', exact: true });
      const stop = () => page.getByRole('button', { name: /1\. durak:/ });
      const back = () => page.getByRole('button', { name: /^(Önceki detaya dön|Geri dön)$/ });
      const close = () => page.getByRole('button', { name: 'Detayı kapat ve başladığın ekrana dön' });
      await page.goto(`${base}/`);
      const card = page.getByRole('button', { name: /Planı incele$/ }).first();
      await card.click(); await root().waitFor();
      assert.doesNotMatch(await page.locator('body').innerText(), /\bxp-[a-z0-9-]+/);
      await stop().click(); await page.getByRole('heading', { name: 'Mekân hakkında' }).waitFor();
      await back().click(); await root().waitFor();
      await page.waitForTimeout(80);
      assert.ok(await stop().evaluate(node => node === document.activeElement));
      await back().click(); await card.waitFor();
      assert.equal(await root().count(), 0);
      record('Home → Plan A → Place X → Back → Plan A → Back → Home, focus restored');

      await card.click(); await root().waitFor();
      const parentTitle = (await page.getByRole('heading', { name: /GEZEK PLANI:/ }).getAttribute('aria-label')).replace('GEZEK PLANI: ', '');
      await stop().click();
      await page.getByRole('button', { name: `${parentTitle}. Planı incele`, exact: true }).click();
      await root().waitFor();
      assert.equal(await page.getByRole('button', { name: 'Geri dön', exact: true }).count(), 1);
      await page.waitForTimeout(80);
      assert.ok(await stop().evaluate(node => node === document.activeElement));
      await back().click(); await card.waitFor();
      assert.equal(await root().count(), 0);
      record('Home → Plan A → Place X → select Plan A truncates to root → Back → Home');

      await page.goto(`${base}/?fixture=cycle`);
      await root().waitFor();
      const originalId = await page.evaluate(() => window.__detailSession.history[0].id);
      assert.ok(!(await page.locator('body').innerText()).includes(originalId), 'technical Plan ID must never be visible');
      await stop().scrollIntoViewIfNeeded();
      await page.waitForTimeout(80); await stop().click();
      const parent = await page.evaluate(() => window.__detailSession.history[0]);
      await page.getByRole('button', { name: 'Test Plan B. Planı incele', exact: true }).click();
      await root().waitFor();
      assert.equal(await page.evaluate(() => window.__detailSession.history.length), 3);
      assert.equal(await page.evaluate(() => window.__detailSession.history.at(-1).id), 'test-plan-b');
      await stop().click();
      assert.equal(await page.evaluate(() => window.__detailSession.history.length), 2, 'existing Place is revisited');
      await page.getByRole('button', { name: /Kuğulu.*Planı incele$/ }).click();
      await root().waitFor();
      assert.deepEqual(await page.evaluate(() => window.__detailSession.history), [parent]);
      await page.waitForTimeout(80);
      assert.ok(await stop().evaluate(node => node === document.activeElement));
      await page.screenshot({ path: path.join(output, `plan-corrected-${viewport.width}.png`) });
      record('Distinct Plan B remains nested; revisiting Place/Plan truncates and preserves scroll/focus/reasons');
      await stop().click();
      await page.screenshot({ path: path.join(output, `place-corrected-${viewport.width}.png`) });
      await page.getByRole('button', { name: 'Test Plan B. Planı incele', exact: true }).click();
      await close().click();
      assert.equal(await page.evaluate(() => window.__detailSession), undefined);
      assert.equal(await root().count(), 0);
      record('Close exits the whole host from depth three');

      for (const kind of ['experience', 'place']) for (const fixture of ['default', 'saved', 'loading', 'unavailable']) {
        await page.goto(`${base}/?fixture=${fixture}&kind=${kind}`);
        const save = page.getByRole('button', { name: fixture === 'saved' ? 'Kayıttan çıkar' : 'Kaydet', exact: true });
        await save.waitFor();
        const box = await save.boundingBox();
        assert.ok(box.width >= 44 && box.height >= 44);
        assert.equal(await save.getAttribute('aria-selected') === 'true', fixture === 'saved');
        assert.equal(await save.getAttribute('aria-disabled') === 'true', ['loading', 'unavailable'].includes(fixture));
        assert.equal(await save.getAttribute('aria-busy') === 'true', fixture === 'loading');
        const glyph = save.locator('svg path');
        assert.equal(await glyph.getAttribute('d'), 'M6 3H16V19L11 15.5L6 19V3Z');
        assert.equal(await glyph.getAttribute('fill'), fixture === 'saved' ? '#3F65FC' : 'none');
        if (kind === 'experience') assert.doesNotMatch(await page.locator('body').innerText(), /\bxp-[a-z0-9-]+/);
        record(`${kind} ${fixture}: no visible ID, bookmark geometry, target and accessibility semantics`);
      }

      const chipLabels = () => page.getByTestId('detail-metadata-chips').evaluate(node => [...node.children].map(chip => chip.innerText));
      for (const kind of ['experience', 'place']) {
        await page.goto(`${base}/?fixture=default&kind=${kind}`);
        await page.getByTestId('detail-metadata-chips').waitFor();
        const expected = await page.evaluate(() => {
          const record = window.__detailRecord;
          return [record.category.toLocaleUpperCase('tr-TR'), record.district.toLocaleUpperCase('tr-TR'), '₺'.repeat(record.priceLevel) || 'Bedava'];
        });
        assert.deepEqual(await chipLabels(), expected);
        assert.doesNotMatch(await page.locator('body').innerText(), /\bxp-[a-z0-9-]+/);
        record(`${kind}: own catalog category/district/price chips render; no technical ID`);
      }
      for (const fixture of ['default', 'metadata-independent']) {
        await page.goto(`${base}/?fixture=${fixture}&plan=xp-eymir-halfday`);
        await page.getByTestId('detail-metadata-chips').waitFor();
        assert.deepEqual(await chipLabels(), ['DOĞA', 'GÖLBAŞI', 'Bedava']);
        assert.doesNotMatch(await page.locator('body').innerText(), /\bxp-[a-z0-9-]+/);
        await page.screenshot({ path: path.join(output, `plan-chips-${fixture}-${viewport.width}.png`) });
        record(`Free Eymir Plan ${fixture}: DOĞA/GÖLBAŞI/Bedava from Experience, independent of first Place`);
      }
      for (const kind of ['experience', 'place']) {
        await page.goto(`${base}/?fixture=long&kind=${kind}&scale=1.8`);
        await page.getByTestId('detail-metadata-chips').waitFor();
        const geometry = await page.getByTestId('detail-metadata-chips').evaluate(node => ({
          wrap: getComputedStyle(node).flexWrap,
          overflow: document.documentElement.scrollWidth > innerWidth,
          contained: [...node.children].every(chip => {
            const box = chip.getBoundingClientRect(), row = node.getBoundingClientRect();
            return box.left >= row.left && box.right <= row.right + 1 && box.bottom <= row.bottom + 1;
          }),
        }));
        assert.deepEqual(geometry, { wrap: 'wrap', overflow: false, contained: true });
        record(`${kind}: chip wrapping preserved at simulated fontScale 1.8`);
      }

      await page.clock.install();
      await page.goto(`${base}/?fixture=undo`);
      await page.getByRole('button', { name: 'Dismiss A', exact: true }).click();
      await page.clock.runFor(7900);
      assert.equal(await page.getByRole('button', { name: 'Undo', exact: true }).isEnabled(), true);
      await page.clock.runFor(100);
      await page.waitForFunction(() => window.__notice?.exiting);
      await new Promise(resolve => setTimeout(resolve, 40));
      await page.clock.runFor(64);
      const undo = page.getByRole('button', { name: 'Undo', exact: true });
      assert.equal(await undo.isDisabled(), true);
      const middle = await undo.evaluate(node => {
        const style = getComputedStyle(node.parentElement);
        return { opacity: Number(style.opacity), y: new DOMMatrix(style.transform).m42 };
      });
      assert.ok(middle.opacity > 0 && middle.opacity < 1, JSON.stringify(middle));
      assert.ok(middle.y > 0 && middle.y < 6, JSON.stringify(middle));
      await page.clock.runFor(140);
      assert.equal(await page.getByText('Undo notice', { exact: true }).count(), 0);
      assert.deepEqual(await page.evaluate(() => window.__restored), []);
      record('Eight-second deadline disables Undo; 180 ms native fade/down exit never restores dismissal');

      await page.getByRole('button', { name: 'Dismiss A', exact: true }).click();
      await page.clock.runFor(8000);
      await page.waitForFunction(() => window.__notice?.exiting);
      await new Promise(resolve => setTimeout(resolve, 40));
      await page.clock.runFor(64);
      await page.getByRole('button', { name: 'Dismiss B', exact: true }).click();
      await page.clock.runFor(200);
      assert.equal(await undo.isEnabled(), true);
      assert.equal(await undo.evaluate(node => getComputedStyle(node.parentElement).opacity), '1');
      await page.clock.runFor(7600);
      assert.equal(await undo.isEnabled(), true);
      await undo.click();
      assert.deepEqual(await page.evaluate(() => window.__restored), ['b']);
      await page.clock.runFor(500);
      assert.equal(await page.getByText('Undo notice', { exact: true }).count(), 0);
      record('New dismissal resets exit animation and eight-second timer; Undo consumes once');

      await page.getByRole('button', { name: 'Dismiss A', exact: true }).click();
      await page.clock.runFor(8000);
      await page.waitForFunction(() => window.__notice?.exiting);
      await new Promise(resolve => setTimeout(resolve, 40));
      await page.clock.runFor(64);
      await page.getByRole('button', { name: 'Navigate', exact: true }).click();
      await page.clock.runFor(9000);
      assert.equal(await page.getByText('Undo notice', { exact: true }).count(), 0);
      await page.getByRole('button', { name: 'Dismiss B', exact: true }).click();
      await page.getByRole('button', { name: 'Unmount', exact: true }).click();
      await page.clock.runFor(9000);
      assert.deepEqual(await page.evaluate(() => window.__restored), ['b']);
      record('Navigation and unmount clean active timers/animations and stale callbacks');

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`${base}/?fixture=undo`);
      await page.getByRole('button', { name: 'Dismiss A', exact: true }).click();
      await page.clock.runFor(8001);
      assert.equal(await page.getByText('Undo notice', { exact: true }).count(), 0);
      assert.deepEqual(await page.evaluate(() => window.__restored), []);
      record('Reduced-motion preference removes the notice immediately at expiry');
      await page.close();
    }
    assert.deepEqual(errors, []);
    const result = { surface: 'Actual App and DetailHost / RN Web, service stubs; synthetic Plan B only in cycle fixture; controlled browser clock', checks, errors };
    fs.writeFileSync(path.join(output, 'redmi-regression-results.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({ checks: checks.length, errors }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
