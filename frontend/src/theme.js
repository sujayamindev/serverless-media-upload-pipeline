import { createTheme } from '@mui/material/styles';

// Design tokens for the Serverless Media Upload Pipeline.
// Light and dark schemes follow the OS setting (no toggle, no inline script:
// the CloudFront CSP only allows scripts from 'self').

const DISPLAY_FONT = '"Bricolage Grotesque Variable", "IBM Plex Sans", system-ui, sans-serif';
const BODY_FONT = '"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif';
export const MONO_FONT = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

const display = { fontFamily: DISPLAY_FONT, fontWeight: 600, letterSpacing: '-0.02em' };

const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'media' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#1f4fe0', dark: '#173bb0', light: '#5a7df0', contrastText: '#ffffff' },
        success: { main: '#187a4c' },
        error: { main: '#c4372c' },
        warning: { main: '#a86a0a' },
        background: { default: '#f2f4f3', paper: '#ffffff' },
        text: { primary: '#111a1f', secondary: '#56636b' },
        divider: '#d6dbdd',
      },
    },
    dark: {
      palette: {
        primary: { main: '#7b9cff', dark: '#5a7df0', light: '#a3b9ff', contrastText: '#0b1020' },
        success: { main: '#4cc48a' },
        error: { main: '#ff7a6e' },
        warning: { main: '#e5a93b' },
        background: { default: '#0e1417', paper: '#151d22' },
        text: { primary: '#e8edef', secondary: '#93a1a9' },
        divider: '#27333a',
      },
    },
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    h1: { ...display, fontSize: 'clamp(2rem, 1.4rem + 2vw, 2.75rem)', lineHeight: 1.1 },
    h2: { ...display, fontSize: 'clamp(1.5rem, 1.2rem + 1vw, 2rem)', lineHeight: 1.15 },
    h3: { ...display, fontSize: '1.375rem', lineHeight: 1.2 },
    h4: { ...display, fontSize: '1.125rem', lineHeight: 1.25 },
    h5: { ...display, fontSize: '1rem', lineHeight: 1.3 },
    h6: { ...display, fontSize: '0.9375rem', lineHeight: 1.3 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'a:focus-visible, button:focus-visible, [tabindex]:focus-visible': {
          outline: '2px solid var(--mui-palette-primary-main)',
          outlineOffset: 2,
        },
        code: {
          fontFamily: MONO_FONT,
          fontSize: '0.875em',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 6 },
        sizeLarge: { paddingBlock: 10, paddingInline: 22 },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 6 } },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 4, fontWeight: 500 } },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
      styleOverrides: { root: { fontWeight: 500 } },
    },
  },
});

export default theme;
