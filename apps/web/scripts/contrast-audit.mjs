/**
 * CLI: print WCAG AA contrast audit for Navy/Gold pairs.
 * Usage: pnpm --filter @rivet/web contrast
 */

const BRAND = {
  navy: '#002F54',
  gold: '#D69A2E',
  ink: '#1E1E1E',
  white: '#FFFFFF',
  muted: '#64748B',
};

function luminance(hex) {
  const raw = hex.replace('#', '');
  const n =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  const toLin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

function contrastRatio(fg, bg) {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function passesAA(fg, bg, level = 'normal') {
  const ratio = contrastRatio(fg, bg);
  return level === 'normal' ? ratio >= 4.5 : ratio >= 3;
}

const PAIRS = [
  { name: 'Navy on white', fg: BRAND.navy, bg: BRAND.white, level: 'normal' },
  { name: 'Ink on white', fg: BRAND.ink, bg: BRAND.white, level: 'normal' },
  { name: 'Muted on white', fg: BRAND.muted, bg: BRAND.white, level: 'normal' },
  { name: 'White on navy', fg: BRAND.white, bg: BRAND.navy, level: 'normal' },
  { name: 'Gold on navy (large/eyebrow)', fg: BRAND.gold, bg: BRAND.navy, level: 'large' },
  { name: 'Navy on gold (primary CTA)', fg: BRAND.navy, bg: BRAND.gold, level: 'normal' },
  { name: 'Gold on white (NOT for body)', fg: BRAND.gold, bg: BRAND.white, level: 'large' },
];

console.log('\nRIVET contrast audit (WCAG 2.1 AA)\n');
const results = PAIRS.map((p) => {
  const ratio = Math.round(contrastRatio(p.fg, p.bg) * 100) / 100;
  const pass = passesAA(p.fg, p.bg, p.level);
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${p.name} — ${ratio}:1 (${p.level})`);
  return { ...p, ratio, pass };
});

const critical = results.filter((r) => !r.pass && r.name !== 'Gold on white (NOT for body)');
console.log('');
if (critical.length > 0) {
  console.error(`Failed ${critical.length} required pair(s).`);
  process.exit(1);
}
console.log('All required contrast pairs pass AA.\n');
