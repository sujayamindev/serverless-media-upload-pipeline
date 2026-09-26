// Antimetal design tokens (see frontend/DESIGN.md). This is the only file that
// holds colour literals; components reference the CSS variables through `t`.

export const SERIF = '"Newsreader Variable", "Signifier", "Noto Serif", Georgia, serif';
export const SANS = '"Geist Variable", Geist, ui-sans-serif, system-ui, sans-serif';
export const MONO = '"Geist Mono Variable", "Geist Mono", ui-monospace, Menlo, monospace';

export const EASE = 'cubic-bezier(.22, 1, .36, 1)';

const INK = '#1a1614';
const CREAM = '#f4f4e7';

// Text opacity ladder (DESIGN.md §2.1): ink in light, cream in dark.
const ladder = (hex) => ({
  '--ink-92': `${hex}eb`,
  '--ink-70': `${hex}b3`,
  '--ink-60': `${hex}99`,
  '--ink-42': `${hex}6b`,
  '--ink-20': `${hex}33`,
  '--ink-10': `${hex}1a`,
  '--ink-6': `${hex}0f`,
});

const shared = {
  '--color-accent': '#e2e67d',
  '--chart-orange': '#ff7733',
  '--chart-amber': '#e5a700',
  '--chart-olive': '#a89a1a',
  '--shadow-float': '0 10px 24px rgba(0,0,0,.18)',
  '--shadow-nav': 'inset 0 0 10px rgba(0,0,0,.08)',
  '--shadow-window': '0 20px 40px -20px rgba(26,22,20,.25)',
  '--ease': EASE,
};

export const SCHEME_VARS = {
  light: {
    ...shared,
    '--color-bg': '#d7d7d0',
    '--color-fg': INK,
    '--ink': INK,
    '--color-cream': CREAM,
    '--color-card': '#fdfcfa',
    '--color-border': '#1a16141a',
    '--rule': '#1a161457',
    '--mute': '#1a16148c',
    '--color-nav-bg': '#cfcfc8bd',
    '--nav-capsule': 'rgba(232,232,232,.67)',
    '--nav-rim': '#fdfcfa8c', // card at 55%
    '--inverse-bg': INK,
    '--inverse-fg': CREAM,
    '--orange': '#bd4a28',
    '--green': '#6e7a34',
    '--chart-ink': INK,
    '--chip-bg': CREAM,
    '--window-body': '#f7f6f3',
    '--primary-bg': INK,
    '--primary-fg': CREAM,
    '--primary-hover': '#2a2724',
    ...ladder(INK),
  },
  dark: {
    ...shared,
    '--color-bg': INK,
    '--color-fg': CREAM,
    '--ink': CREAM,
    '--color-cream': INK,
    '--color-card': '#211c19',
    '--color-border': '#f4f4e71f',
    '--rule': '#f4f4e757',
    '--mute': '#f4f4e78c',
    '--color-nav-bg': '#1a1614bd',
    '--nav-capsule': '#1a1614bd',
    '--nav-rim': '#f4f4e71f', // = --color-border; the capsule fill matches the page in dark
    '--inverse-bg': CREAM,
    '--inverse-fg': INK,
    '--orange': '#e0714f',
    '--green': '#a8b560',
    '--chart-ink': CREAM,
    '--chip-bg': '#f4f4e71a',
    '--window-body': '#211c19',
    '--primary-bg': CREAM,
    '--primary-fg': INK,
    // Derived: the light hover (#2a2724) is ink lifted ~6% toward cream; mirror that
    // (cream 88% / ink 12%).
    '--primary-hover': '#dad9ce',
    ...ladder(CREAM),
  },
};

// Raw palette values MUI needs to compute channels (it can't read CSS variables).
export const PALETTE = {
  light: {
    ink: INK,
    cream: CREAM,
    bg: '#d7d7d0',
    card: '#fdfcfa',
    border: '#1a16141a',
    mute: '#1a16148c',
    disabled: '#1a16146b',
    hover: '#1a16140f',
    selected: '#1a16141a',
    orange: '#bd4a28',
    green: '#6e7a34',
    amber: '#e5a700',
    primaryHover: '#2a2724',
  },
  dark: {
    ink: CREAM,
    cream: INK,
    bg: INK,
    card: '#211c19',
    border: '#f4f4e71f',
    mute: '#f4f4e78c',
    disabled: '#f4f4e76b',
    hover: '#f4f4e70f',
    selected: '#f4f4e71a',
    orange: '#e0714f',
    green: '#a8b560',
    amber: '#e5a700',
    primaryHover: '#dad9ce',
  },
};

const v = (name) => `var(${name})`;

// Token references for sx props.
export const t = {
  bg: v('--color-bg'),
  ink: v('--ink'),
  cream: v('--color-cream'),
  card: v('--color-card'),
  border: v('--color-border'),
  rule: v('--rule'),
  mute: v('--mute'),
  navBg: v('--color-nav-bg'),
  navCapsule: v('--nav-capsule'),
  navRim: v('--nav-rim'),
  inverseBg: v('--inverse-bg'),
  inverseFg: v('--inverse-fg'),
  orange: v('--orange'),
  green: v('--green'),
  accent: v('--color-accent'),
  chartOrange: v('--chart-orange'),
  chartAmber: v('--chart-amber'),
  chartOlive: v('--chart-olive'),
  chartInk: v('--chart-ink'),
  chipBg: v('--chip-bg'),
  windowBody: v('--window-body'),
  primaryBg: v('--primary-bg'),
  primaryFg: v('--primary-fg'),
  primaryHover: v('--primary-hover'),
  ink92: v('--ink-92'),
  ink70: v('--ink-70'),
  ink60: v('--ink-60'),
  ink42: v('--ink-42'),
  ink20: v('--ink-20'),
  ink10: v('--ink-10'),
  ink6: v('--ink-6'),
  shadowFloat: v('--shadow-float'),
  shadowNav: v('--shadow-nav'),
  shadowWindow: v('--shadow-window'),
};

/**
 * Corner-bracket ticks (⌜ ⌝ ⌞ ⌟) drawn as one pseudo-element with eight
 * gradient strokes. Spread into a `&::before` / `&::after` rule on a
 * `position: relative` element. They sit on top of a 1px border.
 */
export function bracketTicks({ color = t.ink, length = 8, width = '1.5px', inset = -1 } = {}) {
  const g = `linear-gradient(${color}, ${color})`;
  const corners = ['left top', 'right top', 'left bottom', 'right bottom'];
  return {
    content: '""',
    position: 'absolute',
    inset,
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
