// Antimetal design tokens (see frontend/DESIGN.md). This is the only file that
// holds colour literals; components reference the CSS variables through `t`.

export const SANS = '"Geist Variable", Geist, ui-sans-serif, system-ui, sans-serif';
export const MONO = '"Geist Mono Variable", "Geist Mono", ui-monospace, Menlo, monospace';

export const EASE = 'cubic-bezier(.22, 1, .36, 1)';

const INK = '#1a1614';
const CREAM = '#f4f4e7';

// Text opacity ladder (DESIGN.md §2.1): ink in light, cream in dark.
const ladder = (hex) => ({
  '--ink-70': `${hex}b3`,
  '--ink-60': `${hex}99`,
  '--ink-42': `${hex}6b`,
  '--ink-20': `${hex}33`,
  '--ink-10': `${hex}1a`,
  '--ink-6': `${hex}0f`,
});

const shared = {
  '--color-accent': '#e2e67d',
  // Failed / rejected, in both schemes (fills, dots, icons). Text uses --orange,
  // which is lighter in dark mode.
  '--error': '#bd4a28',
  '--chart-amber': '#e5a700',
  // Approved / success, in both schemes (fills, dots, icons and the APPROVED tag).
  '--success': '#3d8378',
  '--shadow-nav': 'inset 0 0 10px rgba(0,0,0,.08)',
  '--ease': EASE,
};

export const SCHEME_VARS = {
  light: {
    ...shared,
    '--color-bg': '#f1f1f1',
    '--ink': INK,
    '--color-card': '#fdfcfa',
    '--color-border': '#1a16141a',
    '--rule': '#1a161457',
    '--mute': '#1a16148c',
    '--nav-capsule': 'rgba(232,232,232,.67)',
    '--nav-rim': '#fdfcfa8c', // card at 55%
    '--orange': '#bd4a28',
    '--success-text': '#3d8378',
    '--chart-ink': INK,
    '--chip-bg': CREAM,
    '--primary-bg': INK,
    '--primary-fg': CREAM,
    '--primary-hover': '#2a2724',
    // The architecture diagram has dark text on a light background, so it
    // always sits on a light surface.
    '--diagram-bg': '#fdfcfa',
    ...ladder(INK),
  },
  dark: {
    ...shared,
    '--color-bg': '#1f1f1f',
    '--ink': CREAM,
    '--color-card': '#262626',
    '--color-border': '#f4f4e71f',
    '--rule': '#f4f4e757',
    '--mute': '#f4f4e78c',
    '--nav-capsule': '#1f1f1fbd',
    '--nav-rim': '#f4f4e71f', // = --color-border; the capsule fill matches the page in dark
    '--orange': '#e0714f',
    // Lighter tint of --success so the small APPROVED chip text stays readable
    // on the dark chip (4.6:1); fills and dots keep #3d8378.
    '--success-text': '#81aea7',
    '--chart-ink': CREAM,
    '--chip-bg': '#f4f4e71a',
    '--primary-bg': CREAM,
    '--primary-fg': INK,
    // Derived: the light hover (#2a2724) lifts ink slightly toward cream; mirror
    // that (cream 88% / ink 12%).
    '--primary-hover': '#dad9ce',
    '--diagram-bg': CREAM,
    ...ladder(CREAM),
  },
};

// Raw palette values MUI needs to compute channels (it can't read CSS variables).
export const PALETTE = {
  light: {
    ink: INK,
    cream: CREAM,
    bg: '#f1f1f1',
    card: '#fdfcfa',
    border: '#1a16141a',
    mute: '#1a16148c',
    disabled: '#1a16146b',
    hover: '#1a16140f',
    selected: '#1a16141a',
    orange: '#bd4a28',
    success: '#3d8378',
    amber: '#e5a700',
    primaryHover: '#2a2724',
  },
  dark: {
    ink: CREAM,
    cream: INK,
    bg: '#1f1f1f',
    card: '#262626',
    border: '#f4f4e71f',
    mute: '#f4f4e78c',
    disabled: '#f4f4e76b',
    hover: '#f4f4e70f',
    selected: '#f4f4e71a',
    orange: '#e0714f',
    success: '#3d8378',
    amber: '#e5a700',
    primaryHover: '#dad9ce',
  },
};

const v = (name) => `var(${name})`;

// Token references for sx props.
export const t = {
  bg: v('--color-bg'),
  ink: v('--ink'),
  card: v('--color-card'),
  border: v('--color-border'),
  rule: v('--rule'),
  mute: v('--mute'),
  navCapsule: v('--nav-capsule'),
  navRim: v('--nav-rim'),
  shadowNav: v('--shadow-nav'),
  orange: v('--orange'),
  success: v('--success'),
  successText: v('--success-text'),
  accent: v('--color-accent'),
  error: v('--error'),
  chartAmber: v('--chart-amber'),
  chartInk: v('--chart-ink'),
  chipBg: v('--chip-bg'),
  primaryBg: v('--primary-bg'),
  primaryFg: v('--primary-fg'),
  primaryHover: v('--primary-hover'),
  diagramBg: v('--diagram-bg'),
  ink70: v('--ink-70'),
  ink60: v('--ink-60'),
  ink42: v('--ink-42'),
  ink20: v('--ink-20'),
  ink10: v('--ink-10'),
  ink6: v('--ink-6'),
};

/**
 * Corner-bracket ticks (⌜ ⌝ ⌞ ⌟) drawn as one pseudo-element with eight
 * gradient strokes. Spread into a `&::before` / `&::after` rule on a
 * `position: relative` element. They sit on top of a 1px border.
 */
export function bracketTicks({ color = t.ink, length = 8, width = '1.5px' } = {}) {
  const g = `linear-gradient(${color}, ${color})`;
  const corners = ['left top', 'right top', 'left bottom', 'right bottom'];
  return {
    content: '""',
    position: 'absolute',
    inset: -1,
    pointerEvents: 'none',
    background: corners
      .flatMap((pos) => [`${g} ${pos} / ${length}px ${width} no-repeat`, `${g} ${pos} / ${width} ${length}px no-repeat`])
      .join(', '),
  };
}

// Mono label styles (DESIGN.md §3).
export const eyebrowType = {
  fontFamily: MONO,
  fontSize: 10,
  lineHeight: 'normal',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontWeight: 400,
};

export const metaType = {
  fontFamily: MONO,
  fontSize: 11,
  lineHeight: '16.5px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  fontWeight: 400,
};

export const reducedMotion = '@media (prefers-reduced-motion: reduce)';
