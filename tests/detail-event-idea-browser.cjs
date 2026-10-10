// Actual App/DetailHost integration through the optional RN Web fixture. Services are stubbed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.join(process.env.GEZEK_BROWSER_MODULES, 'playwright'));
const base = process.env.GEZEK_BROWSER_URL || 'http://127.0.0.1:8773';
const output = process.env.GEZEK_BROWSER_OUTPUT || '/tmp/gezek-detail-pr2-browser';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const checks = [], errors = [];
  try {
    for (const viewport of [{ width: 393, height: 852 }, { width: 412, height: 915 }]) {
      const page = await browser.newPage({ viewport });
      page.on('pageerror', e => errors.push(e.stack));
      const record = name => checks.push({ name, viewport, pass: true });
      for (const kind of ['event', 'idea']) {
        for (const fixture of ['default', 'saved', 'loading', 'unavailable', 'dismissed', 'noexternal', 'long']) {
          await page.goto(`${base}/?fixture=${fixture}&kind=${kind}${fixture === 'long' ? '&scale=1.8' : ''}`);
          const heading = fixture === 'dismissed' ? 'Bu öneriyi gizledin' : fixture === 'loading' ? 'Detay hazırlanıyor' : fixture === 'unavailable' ? 'Bu içerik şu anda kullanılamıyor' : kind === 'event' ? 'Etkinlik bilgisi' : 'Fikir notu';
          await page.getByRole('heading', { name: heading, exact: true }).waitFor();
          assert.deepEqual(await page.evaluate(() => window.__maps), []);
          assert.deepEqual(await page.evaluate(() => window.__alerts), []);
          assert.doesNotMatch(await page.locator('body').innerText(), /\b(?:event-|idea-|xp-)[a-z0-9-]+|\.svg|artwork_key|Fikri plana dönüştür/);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
          if (fixture === 'dismissed') {
            assert.equal(await page.getByRole('button', { name: 'Kaydet', exact: true }).count(), 0);
            await page.getByRole('button', { name: 'Geri getir', exact: true }).waitFor();
          } else {
            const save = page.getByRole('button', { name: fixture === 'saved' ? 'Kayıttan çıkar' : 'Kaydet', exact: true });
            const box = await save.boundingBox(); assert.ok(box.width >= 44 && box.height >= 44);
            assert.equal(await save.isDisabled(), ['loading', 'unavailable'].includes(fixture));
            assert.equal(await save.getAttribute('aria-busy') === 'true', fixture === 'loading');
            if (fixture === 'loading') assert.equal(await save.getByRole('progressbar').count(), 1);
            else assert.equal(await save.locator('svg path').getAttribute('fill'), fixture === 'saved' ? '#3F65FC' : 'none');
          }
          if (kind === 'event') assert.equal(await page.getByRole('link', { name: 'Haritada aç', exact: true }).count(), 0);
          if (fixture === 'noexternal' || kind === 'idea') assert.equal(await page.getByRole('link').count(), 0);
          if (fixture === 'long') {
            const geometry = await page.getByRole('heading', { name: heading, exact: true }).evaluate(node => {
              let scroller = node.parentElement; while (scroller && scroller.scrollHeight <= scroller.clientHeight + 1) scroller = scroller.parentElement;
              scroller.scrollTop = scroller.scrollHeight;
              return { scrollable: scroller.scrollHeight > scroller.clientHeight, bottom: node.parentElement.getBoundingClientRect().bottom };
            });
            assert.ok(geometry.scrollable);
            assert.ok(geometry.bottom <= viewport.height - 96 + 1);
          }
          if (['default', 'long', 'dismissed'].includes(fixture)) await page.screenshot({ path: path.join(output, `${kind}-${fixture}-${viewport.width}.png`) });
          record(`${kind} ${fixture}: internal, semantics, wrapping, artwork/ID and footer checks`);
        }
        await page.goto(`${base}/?fixture=default&kind=${kind}&url=yes`);
        const label = await page.evaluate(kind => kind === 'event' ? 'Bilet bilgisine git' : window.__detailRecord.actionLabel, kind);
        const url = await page.evaluate(kind => kind === 'event' ? window.__detailRecord.sourceUrl : window.__detailRecord.actionUrl, kind);
        const action = page.getByRole('link', { name: label, exact: true });
        await action.click(); assert.deepEqual(await page.evaluate(() => window.__maps), [url]);
        await page.evaluate(() => window.__activeListeners.forEach(callback => callback('active')));
        await page.waitForTimeout(100);
        assert.ok(await action.evaluate(node => node === document.activeElement));
        record(`${kind}: explicit exact URL and external-return focus`);
      }
      await page.goto(`${base}/?fixture=expired&kind=event`);
      await page.getByText('Etkinliğin başlangıç zamanı geçti.', { exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: 'Kaydet', exact: true }).isDisabled(), true);
      await page.getByRole('link', { name: 'Bilet bilgisine git', exact: true }).waitFor();
      record('Expired Event disables save/dismiss, retains exact source access');
      await page.goto(`${base}/?fixture=structured-map&kind=event`);
      await page.getByRole('link', { name: 'Haritada aç', exact: true }).click();
      assert.match((await page.evaluate(() => window.__maps))[0], /query=/);
      record('Event Maps appears only for a structured Place ID');

      // Actual Home with catalog-backed Event test preferences.
      await page.goto(`${base}/?home=event`);
      await page.getByRole('tab', { name: 'Etkinlik önerileri', exact: true }).click();
      const eventCard = page.getByRole('button', { name: /Bilet \/ detay|Etkinliği incele/i }).first();
      await eventCard.scrollIntoViewIfNeeded();
      const homeSnapshot = () => eventCard.evaluate(node => { let scroller = node.parentElement; while (scroller && scroller.scrollHeight <= scroller.clientHeight + 1) scroller = scroller.parentElement; return { scroll: scroller?.scrollTop, batches: window.__events.filter(e => e.name === 'recommendation_batch_viewed'), selected: [...document.querySelectorAll('[role=tab][aria-selected=true]')].map(n => n.getAttribute('aria-label')), title: node.getAttribute('aria-label') }; });
      const before = await homeSnapshot();
      await eventCard.click(); await page.getByRole('heading', { name: 'Etkinlik bilgisi', exact: true }).waitFor();
      assert.deepEqual(await page.evaluate(() => window.__maps), []);
      await page.getByRole('button', { name: 'Detayı kapat ve başladığın ekrana dön' }).click();
      await eventCard.waitFor(); assert.ok(await eventCard.evaluate(node => node === document.activeElement));
      assert.deepEqual(await homeSnapshot(), before);
      record('Actual Home Event opens internally, Close restores card focus, scroll, filter and unchanged recommendation batch');

      await page.goto(`${base}/?home=idea`);
      await page.getByRole('tab', { name: 'Fikir önerileri', exact: true }).click();
      const ideaCard = page.getByRole('button', { name: /Fikri (incele|dene)|Fikre göz at/i }).first();
      await ideaCard.click(); await page.getByRole('heading', { name: 'Fikir notu', exact: true }).waitFor();
      assert.deepEqual(await page.evaluate(() => window.__maps), []); assert.deepEqual(await page.evaluate(() => window.__alerts), []);
      await page.getByRole('button', { name: 'Geri dön', exact: true }).click(); await ideaCard.waitFor();
      record('Actual Home Idea opens internally with no native Alert');
      const ids = await page.evaluate(() => [window.__catalog.events[0].id, window.__catalog.ideas.find(i => !i.actionUrl).id]);
      await page.goto(`${base}/?saved=${ids.join(',')}`);
      await page.getByRole('tab', { name: /^Kaydedilenler/ }).click();
      for (const [label, heading] of [['Etkinliği incele', 'Bu içerik şu anda kullanılamıyor'], ['Fikri incele', 'Fikir notu']]) {
        const card = page.getByRole('button', { name: /detayını aç$/ }).filter({ hasText: label });
        await card.click(); await page.getByRole('heading', { name: heading, exact: true }).waitFor();
        await page.getByRole('button', { name: 'Detayı kapat ve başladığın ekrana dön' }).click();
        await card.waitFor(); await page.waitForTimeout(100); assert.ok(await card.evaluate(node => node === document.activeElement));
      }
      record('Actual Saved Event and URL-free Idea Close restores Saved control context');
      await page.getByRole('button', { name: /detayını aç$/ }).filter({ hasText: 'Fikri incele' }).click();
      await page.getByRole('button', { name: 'Bana göre değil', exact: true }).click();
      await page.getByRole('button', { name: 'Geri getir', exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: 'Kaydet', exact: true }).count(), 0);
      let writes = await page.evaluate(() => window.__writes);
      assert.ok(!writes.at(-1).saved.includes(ids[1]) && writes.at(-1).dismissed.includes(ids[1]));
      await page.getByRole('button', { name: 'Son gizlediğin öneriyi geri al', exact: true }).click();
      await page.getByRole('button', { name: 'Kaydet', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
      await page.getByRole('button', { name: 'Bana göre değil', exact: true }).click();
      await page.getByRole('button', { name: 'Geri getir', exact: true }).click();
      await page.getByRole('button', { name: 'Kaydet', exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: 'Son gizlediğin öneriyi geri al', exact: true }).count(), 0);
      record('Actual Idea dismissal removes Saved; Undo and Restore return unsaved and consume notice');
      await page.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'event-idea-results.json'), JSON.stringify({ checks, errors, limitations: 'RN Web with stubbed services; 1.8 font scale simulation, not native acceptance' }, null, 2));
    console.log(JSON.stringify({ checks: checks.length, errors }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
