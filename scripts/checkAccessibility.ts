import { readFileSync } from 'node:fs';

const sources = ['App.tsx', 'src/components/PlaceDetails.tsx', 'src/components/AppErrorBoundary.tsx'];
const failures: string[] = [];

for (const path of sources) {
  const source = readFileSync(path, 'utf8');
  const touchables = source.match(/<TouchableOpacity\b[\s\S]*?>/g) ?? [];
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

if (!app.includes('accessibilityRole="progressbar"') || !app.includes('accessibilityValue={{ min: 0, max: 100')) {
  failures.push('App.tsx: reading progress is missing progressbar semantics');
}

if (failures.length) {
  console.error('Accessibility source contract failed:\n' + failures.map(item => `- ${item}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Accessibility source contract passed', { files: sources.length, minimumTargetStyles: minimumTargetStyles.length });
}
