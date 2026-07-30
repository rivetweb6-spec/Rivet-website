/**
 * P6-6 — Contrast validation for RIVET Navy / Gold combinations.
 *
 * WCAG 2.1 AA: normal text ≥ 4.5:1 · large text (≥18pt / 14pt bold) ≥ 3:1 · UI ≥ 3:1
 *
 * Usage policy (enforced in components + globals):
 * - Body / UI copy: navy or ink on white/canvas; white on navy.
 * - Gold is accent-only on light surfaces (underlines, icons, focus rings) — never body/eyebrow text on white.
 * - Gold eyebrows/labels: only on navy backgrounds (large/eyebrow AA).
 * - Muted (#64748B) on white: body-sized OK (~4.6:1).
 * - White at <70% opacity on navy is decorative; meaningful text uses ≥70%.
 */

export const BRAND = {
  navy: '#002F54',
  gold: '#D69A2E',
  goldSoft: '#E3B658',
  ink: '#1E1E1E',
  white: '#FFFFFF',
  muted: '#64748B',
  canvas: '#FFFFFF',
  bg: '#F7F8FA',
} as const;

function luminance(hex: string): number {
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
  const toLin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

export function contrastRatio(fg: string, bg: string): number {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function passesAA(
  fg: string,
  bg: string,
  level: 'normal' | 'large' | 'ui' = 'normal',
): boolean {
  const ratio = contrastRatio(fg, bg);
  if (level === 'normal') return ratio >= 4.5;
  return ratio >= 3;
}

/** Documented pairs — run via `pnpm --filter @rivet/web contrast` or unit tests. */
export const CONTRAST_PAIRS = [
  { name: 'Navy on white', fg: BRAND.navy, bg: BRAND.white, level: 'normal' as const },
  { name: 'Ink on white', fg: BRAND.ink, bg: BRAND.white, level: 'normal' as const },
  { name: 'Muted on white', fg: BRAND.muted, bg: BRAND.white, level: 'normal' as const },
  { name: 'White on navy', fg: BRAND.white, bg: BRAND.navy, level: 'normal' as const },
  { name: 'Gold on navy (large/eyebrow)', fg: BRAND.gold, bg: BRAND.navy, level: 'large' as const },
  { name: 'Navy on gold (primary CTA)', fg: BRAND.navy, bg: BRAND.gold, level: 'normal' as const },
  { name: 'Gold on white (NOT for body)', fg: BRAND.gold, bg: BRAND.white, level: 'large' as const },
] as const;

export function auditContrast(): { name: string; ratio: number; pass: boolean; level: string }[] {
  return CONTRAST_PAIRS.map((p) => {
    const ratio = contrastRatio(p.fg, p.bg);
    return {
      name: p.name,
      ratio: Math.round(ratio * 100) / 100,
      pass: passesAA(p.fg, p.bg, p.level),
      level: p.level,
    };
  });
}
