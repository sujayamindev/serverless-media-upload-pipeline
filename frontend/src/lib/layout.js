import { t } from './tokens';

// Content inset (DESIGN.md §5): 120px on desktop, 16px on mobile.
export const inset = {
  width: '100%',
  maxWidth: 1440,
  mx: 'auto',
  px: { xs: 2, sm: 4, md: 8, lg: 15 },
  boxSizing: 'border-box',
};

// Full-width dotted section rule.
export const dottedRule = {
  border: 0,
  borderTop: `1px dotted ${t.rule}`,
  m: 0,
  height: 0,
};

// Visually hidden but announced by screen readers.
export const srOnly = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};
