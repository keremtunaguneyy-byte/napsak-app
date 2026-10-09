import { readFileSync } from 'node:fs';

const sources = [
  'App.tsx', 'src/components/gezek/DetailHost.tsx', 'src/components/gezek/UndoNoticeTransition.tsx', 'src/components/AppErrorBoundary.tsx',
  'src/components/gezek/GezekHome.tsx', 'src/components/gezek/BrandLogo.tsx', 'src/components/gezek/GezekArtwork.tsx', 'src/components/gezek/ProductionArtwork.tsx',
];
const failures: string[] = [];

for (const path of sources) {
  const source = readFileSync(path, 'utf8');
  const touchables = source.match(/<(?:TouchableOpacity|Pressable)\b[\s\S]*?>/g) ?? [];
  touchables.forEach((tag, index) => {
    if (!tag.includes('accessibilityRole=')) failures.push(`${path}: TouchableOpacity ${index + 1} has no accessibilityRole`);
  });

  const images = source.match(/<Image(?:Background)?\b[\s\S]*?>/g) ?? [];
  images.forEach((tag, index) => {
    if (!tag.includes('accessibilityLabel=') && !tag.includes('accessible={false}')) {
      failures.push(`${path}: Image ${index + 1} has no label or decorative marker`);
    }
  });
}

const app = readFileSync('App.tsx', 'utf8');
const headingStyles = [
  'title', 'resultName', 'emptyTitle', 'editorialLandingTitle',
  'classicsHeroTitle', 'classicChapterTitle', 'insiderTitle',
];
for (const style of headingStyles) {
  const tags = app.match(new RegExp(`<Text\\b[^>]*style=\\{s\\.${style}\\}[^>]*>`, 'g')) ?? [];
  tags.forEach((tag, index) => {
    if (!tag.includes('accessibilityRole="header"')) failures.push(`App.tsx: ${style} heading ${index + 1} has no header role`);
  });
}

const minimumTargetStyles = ['headerHit', 'backHit', 'filterChip', 'actionHit', 'undoAction', 'emptyAction', 'navTab'];
for (const style of minimumTargetStyles) {
  const declaration = app.match(new RegExp(`${style}: \\{[^}]+\\}`))?.[0];
  if (!declaration?.includes('minHeight: 44') && !declaration?.match(/minHeight: (?:4[5-9]|[5-9]\d)/)) {
    failures.push(`App.tsx: ${style} does not declare a minimum 44 px target`);
  }
}

const home = readFileSync('src/components/gezek/GezekHome.tsx', 'utf8');
const homeTargets = ['settings', 'tab', 'contextAction', 'primaryAction', 'quickAction', 'refresh', 'utilityHit', 'secondaryAction', 'bottomTab'];
for (const style of homeTargets) {
  const declaration = home.match(new RegExp(`${style}: \\{[^}]+\\}`))?.[0];
  if (!declaration?.match(/(?:minHeight|height): 44/)) failures.push(`GezekHome.tsx: ${style} has no declared 44 px target`);
}
for (const style of ['title', 'mainTitle', 'heading', 'sectionTitle', 'stateTitle']) {
  const tags = home.match(new RegExp(`<Text\\b[^>]*style=\\{s\\.${style}\\}[^>]*>`, 'g')) ?? [];
  if (tags.some(tag => !tag.includes('accessibilityRole="header"'))) failures.push(`GezekHome.tsx: ${style} is missing header semantics`);
}

if (!app.includes('accessibilityRole="progressbar"') || !app.includes('accessibilityValue={{ min: 0, max: 100')) {
  failures.push('App.tsx: reading progress is missing progressbar semantics');
}

const detail = readFileSync('src/components/gezek/DetailHost.tsx', 'utf8');
for (const required of [
  'accessibilityViewIsModal', 'accessibilityState={{ selected, busy, disabled }}',
  'accessibilityElementsHidden importantForAccessibility="no-hide-descendants"',
  'focusDetailControl', 'DETAIL_CONTENT_CLEARANCE', 'footerHeight + 16',
]) {
  if (!detail.includes(required)) failures.push(`DetailHost.tsx: missing ${required}`);
}
for (const style of ['button', 'row', 'undo']) {
  const declaration = detail.match(new RegExp(`${style}: \\{[^}]+\\}`))?.[0];
  if (!declaration?.match(/minHeight: (?:44|60)/) || !declaration.includes('minWidth: 44')) failures.push(`DetailHost.tsx: ${style} has no 44 × 44 target`);
}
if (!detail.includes('DETAIL_ASSET_XML[icon].xml')) failures.push('DetailHost.tsx: local control assets are missing');

const transition = readFileSync('src/components/gezek/UndoNoticeTransition.tsx', 'utf8');
for (const required of ['isReduceMotionEnabled', 'reduceMotionChanged', 'notice.exiting && reducedMotion', 'subscription.remove()']) {
  if (!transition.includes(required)) failures.push(`UndoNoticeTransition.tsx: missing ${required}`);
}
for (const [name, source] of [['DetailHost', detail], ['GezekHome', home]]) {
  if (!source.includes('disabled={!!p.undoNotice.exiting}')) failures.push(`${name}: expired Undo must be disabled during exit`);
}

if (failures.length) {
  console.error('Accessibility source contract failed:\n' + failures.map(item => `- ${item}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Accessibility source contract passed', { files: sources.length, minimumTargetStyles: minimumTargetStyles.length + homeTargets.length });
}
