import { appendFileSync } from 'node:fs';
import { events } from '../src/data/events';
import { analyzeEventCatalog } from '../src/eventOperations';

const health = analyzeEventCatalog(events);
const issueSummary = health.issues.length
  ? health.issues.map((issue) => issue.code).join(', ')
  : 'yok';

console.log(`Etkinlik katalog sağlığı: ${health.healthy ? 'SAĞLIKLI' : 'GÜNCELLEME GEREKİYOR'}`);
console.log(`Toplam: ${health.totalCount}`);
console.log(`Yaklaşan: ${health.upcomingCount}`);
console.log(`Süresi geçmiş: ${health.expiredCount}`);
console.log(`Katalog ufku: ${health.horizonDays ?? 'yok'} gün`);
console.log(`Eski doğrulama: ${health.staleVerificationCount}`);
console.log(`Sorunlar: ${issueSummary}`);

if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = [
    '## Etkinlik katalog sağlığı',
    '',
    `**${health.healthy ? 'Sağlıklı' : 'Güncelleme gerekiyor'}**`,
    '',
    '| Ölçüm | Değer |',
    '|---|---:|',
    `| Yaklaşan etkinlik | ${health.upcomingCount} |`,
    `| Süresi geçmiş etkinlik | ${health.expiredCount} |`,
    `| Katalog ufku | ${health.horizonDays ?? 'yok'} gün |`,
    `| Eski doğrulama | ${health.staleVerificationCount} |`,
    '',
    `Sorun kodları: ${issueSummary}`,
    '',
  ];
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, rows.join('\n'));
}

if (!health.healthy) process.exitCode = 1;
