import { createTheme } from '@mui/material/styles';

// Centralized theme configuration for the Smart Media Upload Pipeline
// Modify these colors to change the entire application's appearance

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Primary blue - used for main actions, stepper active steps, icons
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e', // Secondary/accent color
      light: '#ff5983',
      dark: '#9a0036',
      contrastText: '#fff',
    },
    error: {
      main: '#d32f2f', // Error/rejection color
      light: '#ef5350',
      dark: '#c62828',
    },
    warning: {
      main: '#ed6c02', // Warning color - used for Clear button
      light: '#ff9800',
      dark: '#e65100',
    },
    info: {
      main: '#0288d1', // Info color - used for info alerts
      light: '#03a9f4',
      dark: '#01579b',
    },
    success: {
      main: '#2e7d32', // Success/approval color
      light: '#4caf50',
      dark: '#1b5e20',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  shape: {
    borderRadius: 8, // Default border radius for components
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Disable uppercase transformation
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;
