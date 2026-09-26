import { createElement } from 'react';
import { createTheme } from '@mui/material/styles';
import { CheckCircleIcon, InfoIcon, WarningCircleIcon, WarningIcon } from '@phosphor-icons/react';
import {
  EASE,
  MONO,
  PALETTE,
  SANS,
  SCHEME_VARS,
  eyebrowType,
  metaType,
  t,
} from './lib/tokens';

// Antimetal theme (frontend/DESIGN.md). Light and dark follow the OS by default;
// the nav toggle overrides it through useColorScheme(). The attribute is also set
// before the bundle loads by public/color-scheme-init.js (no inline scripts: the
// CloudFront CSP is script-src 'self').

export { MONO as MONO_FONT };

const display = { fontFamily: SANS, fontWeight: 400 };

function scheme(p) {
  return {
    palette: {
      primary: { main: p.ink, dark: p.primaryHover, light: p.ink, contrastText: p.cream },
      secondary: { main: p.orange, contrastText: p.cream },
      error: { main: p.orange, contrastText: p.cream },
      success: { main: p.success, contrastText: p.cream },
      warning: { main: p.amber, contrastText: p.ink },
      info: { main: p.ink, contrastText: p.cream },
      background: { default: p.bg, paper: p.card },
      text: { primary: p.ink, secondary: p.mute, disabled: p.disabled },
      divider: p.border,
      action: {
        hover: p.hover,
        selected: p.selected,
        focus: p.selected,
        disabled: p.disabled,
        disabledBackground: p.selected,
      },
    },
  };
}

const focusRing = { outline: `1px solid ${t.ink}`, outlineOffset: 2 };
const transition = (...props) => props.map((prop) => `${prop} 250ms ${EASE}`).join(', ');

const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-mui-color-scheme' },
  colorSchemes: { light: scheme(PALETTE.light), dark: scheme(PALETTE.dark) },
  shape: { borderRadius: 0 },
  shadows: Array(25).fill('none'),
  transitions: {
    easing: { easeInOut: EASE, easeOut: EASE, easeIn: EASE, sharp: EASE },
  },
  typography: {
    fontFamily: SANS,
    fontSize: 14,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 500,
    h1: {
      ...display,
      fontSize: 'clamp(30px, 3.5vw, 40px)',
      lineHeight: 1.15,
      letterSpacing: '-0.03em',
    },
    h2: {
      ...display,
      fontSize: 'clamp(26px, 3vw, 32px)',
      lineHeight: 1.15,
      letterSpacing: '-0.02em',
    },
    h3: {
      ...display,
      fontSize: 'clamp(22px, 2.2vw, 26px)',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h4: { ...display, fontSize: 20, lineHeight: 1.3, letterSpacing: 0 },
    h5: { fontFamily: SANS, fontWeight: 500, fontSize: 16, lineHeight: '24px' },
    h6: { fontFamily: SANS, fontWeight: 500, fontSize: 14, lineHeight: '21px' },
    lede: {
      ...display,
      fontSize: 'clamp(16px, 1.4vw, 18px)',
      lineHeight: 1.5,
      color: t.ink70,
    },
    body1: { fontSize: 16, lineHeight: '24px' },
    body2: { fontSize: 14, lineHeight: '21px' },
    subtitle1: { fontSize: 16, lineHeight: '24px', fontWeight: 500 },
    subtitle2: { fontSize: 14, lineHeight: '21px', fontWeight: 500 },
    caption: { fontSize: 13, lineHeight: '19px' },
    button: { fontFamily: SANS, fontWeight: 500, fontSize: 14, textTransform: 'none', letterSpacing: 0 },
    overline: eyebrowType,
    eyebrow: eyebrowType,
    meta: { ...metaType, color: t.ink42 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root, [data-mui-color-scheme="light"]': SCHEME_VARS.light,
        // Before JS has resolved the scheme (or with JS off), follow the OS.
        '@media (prefers-color-scheme: dark)': { ':root:not([data-mui-color-scheme])': SCHEME_VARS.dark },
        'html[data-mui-color-scheme="dark"]': SCHEME_VARS.dark,
        body: {
          backgroundColor: t.bg,
          color: t.ink,
          fontFamily: SANS,
          WebkitFontSmoothing: 'antialiased',
          fontOpticalSizing: 'auto',
        },
        '::selection': { background: t.accent, color: '#1a1614' },
        'a:focus-visible, button:focus-visible, [tabindex]:focus-visible, summary:focus-visible': focusRing,
        code: {
          fontFamily: MONO,
          fontSize: '0.875em',
          padding: '1px 4px',
          backgroundColor: t.ink6,
        },
        strong: { fontWeight: 500 },
      },
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: { lede: 'p', eyebrow: 'span', meta: 'span' },
      },
    },
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          position: 'relative',
          borderRadius: 9999,
          minHeight: 46,
          padding: '0 24px',
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '21px',
          color: t.ink,
          whiteSpace: 'nowrap',
          transition: transition('background-color', 'color', 'border-color'),
          '&.Mui-focusVisible': focusRing,
          variants: [
            {
              props: { variant: 'contained' },
              style: {
                backgroundColor: t.primaryBg,
                color: t.primaryFg,
                boxShadow: 'none',
                '&:hover': { backgroundColor: t.primaryHover, boxShadow: 'none' },
                '&.Mui-focusVisible': { outline: `2px solid ${t.accent}`, outlineOffset: 2, boxShadow: 'none' },
                '&.Mui-disabled': { backgroundColor: t.ink20, color: t.ink42 },
              },
            },
            {
              // Secondary: dashed rounded outline (no corner ticks).
              props: { variant: 'outlined' },
              style: {
                border: `1px dashed ${t.rule}`,
                borderRadius: 24,
                backgroundColor: 'transparent',
                color: t.ink,
                '&:hover': { backgroundColor: t.ink6, border: `1px dashed ${t.rule}` },
                '&.Mui-disabled': { color: t.ink42, border: `1px dashed ${t.ink20}` },
              },
            },
            {
              props: { variant: 'text' },
              style: {
                minHeight: 32,
                padding: '0 6px',
                color: t.ink60,
                '&:hover': { backgroundColor: 'transparent', color: t.ink },
              },
            },
            {
              props: { size: 'small' },
              style: { minHeight: 32, padding: '0 14px' },
            },
          ],
        },
        startIcon: { marginLeft: -4, '& > *:nth-of-type(1)': { fontSize: 18 } },
        endIcon: { marginRight: -4, '& > *:nth-of-type(1)': { fontSize: 18 } },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: t.ink60,
          transition: transition('background-color', 'color'),
          '&:hover': { backgroundColor: t.ink6, color: t.ink },
          '&.Mui-focusVisible': focusRing,
        },
      },
    },
    MuiLink: {
      defaultProps: { underline: 'always' },
      styleOverrides: {
        root: {
          color: t.ink,
          textDecorationColor: t.rule,
          textUnderlineOffset: 3,
          transition: transition('color', 'text-decoration-color'),
          '&:hover': { color: t.orange, textDecorationColor: 'currentColor' },
          '&.Mui-focusVisible, &:focus-visible': focusRing,
        },
      },
    },
    // Inputs: editorial underline style with a mono eyebrow label above.
    MuiTextField: {
      defaultProps: { variant: 'standard', fullWidth: true },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          ...eyebrowType,
          color: t.ink60,
          '&.Mui-focused': { color: t.ink },
          '&.Mui-error': { color: t.orange },
        },
        asterisk: { color: t.ink42 },
      },
    },
    MuiInputLabel: {
      defaultProps: { shrink: true },
      styleOverrides: {
        root: {
          position: 'static',
          transform: 'none',
          marginBottom: 4,
          maxWidth: '100%',
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          fontSize: 16,
          color: t.ink,
          'label + &': { marginTop: 0 },
          '&::before': { borderBottom: `1px solid ${t.rule}` },
          '&:hover:not(.Mui-disabled, .Mui-error)::before': { borderBottom: `1px solid ${t.ink}` },
          '&::after': {
            borderBottom: `1px solid ${t.ink}`,
            transition: `transform 300ms ${EASE}`,
          },
          '&.Mui-error::after': { borderBottomColor: t.orange, transform: 'scaleX(1)' },
        },
        input: {
          padding: '10px 0 9px',
          height: 'auto',
          '&::placeholder': { color: t.ink42, opacity: 1 },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: 13,
          lineHeight: '19px',
          marginTop: 6,
          color: t.mute,
          '&.Mui-error': { color: t.orange },
        },
      },
    },
    // Eyebrow chip.
    MuiChip: {
      styleOverrides: {
        root: {
          ...eyebrowType,
          height: 'auto',
          borderRadius: 0,
          backgroundColor: t.chipBg,
          color: t.ink60,
          border: 0,
        },
        label: { padding: '5px 9px' },
        outlined: { border: 0 },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none', backgroundColor: t.card, color: t.ink, borderRadius: 0 },
      },
    },
    // Collapsible rows: hairline dividers, no card chrome.
    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0, square: true },
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          borderTop: `1px solid ${t.border}`,
          borderBottom: `1px solid ${t.border}`,
          '&::before': { display: 'none' },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: 0,
          '&.Mui-focusVisible': { backgroundColor: 'transparent', ...focusRing },
        },
        content: { margin: '16px 0', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' },
        expandIconWrapper: { color: t.ink60 },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: { root: { padding: '0 0 24px' } },
    },
    MuiAlert: {
      // Phosphor icons in place of MUI's built-in Material ones.
      defaultProps: {
        iconMapping: {
          success: createElement(CheckCircleIcon),
          info: createElement(InfoIcon),
          warning: createElement(WarningIcon),
          error: createElement(WarningCircleIcon),
        },
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1px dashed ${t.rule}`,
          backgroundColor: t.card,
          color: t.ink,
          fontSize: 14,
          lineHeight: '21px',
          padding: '8px 16px',
          alignItems: 'flex-start',
        },
        icon: { opacity: 1, padding: '9px 0', marginRight: 12, fontSize: 18 },
        message: { padding: '8px 0' },
        action: { paddingTop: 2, marginRight: -6 },
        standardError: { '& .MuiAlert-icon': { color: t.error } },
        standardSuccess: { '& .MuiAlert-icon': { color: t.success } },
        standardWarning: { '& .MuiAlert-icon': { color: t.chartAmber } },
        standardInfo: { '& .MuiAlert-icon': { color: t.ink60 } },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 2, borderRadius: 0, backgroundColor: t.ink10 },
        bar: { backgroundColor: t.chartAmber, borderRadius: 0 },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: t.border } },
    },
  },
});

export default theme;
