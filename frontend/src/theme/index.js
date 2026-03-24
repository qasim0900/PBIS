import { createTheme, responsiveFontSizes } from '@mui/material/styles';


const borderRadius = {
  small: 8,
  medium: 10,
  large: 12,
  extraLarge: 16,
};


const shadows = [
  'none',
  '0px 1px 2px rgba(0, 0, 0, 0.05)',
  '0px 1px 3px rgba(0, 0, 0, 0.1),0px 1px 2px rgba(0,0,0,0.06)',
  '0px 4px 6px -1px rgba(0,0,0,0.1),0px 2px 4px -1px rgba(0,0,0,0.06)',
  '0px 10px 15px -3px rgba(0,0,0,0.1),0px 4px 6px -2px rgba(0,0,0,0.05)',
  '0px 20px 25px -5px rgba(0,0,0,0.1),0px 10px 10px -5px rgba(0,0,0,0.04)',
  '0px 25px 50px -12px rgba(0,0,0,0.25)',
  ...Array(18).fill('none'),
];


const hoverBoxShadow = (color = 'rgba(99, 102, 241, 0.25)') => ({
  '&:hover': { boxShadow: `0px 4px 12px ${color}` },
});


let theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6d28d9', light: '#8b5cf6', dark: '#4c1d95', contrastText: '#fff' },
    secondary: { main: '#ffffff', light: '#f9fafb', dark: '#f3f4f6', contrastText: '#1f2937' },
    success: { main: '#10b981', light: '#34d399', dark: '#059669' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    error: { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
    info: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
    background: { default: '#f3f4f6', paper: '#ffffff' },
    text: { primary: '#111827', secondary: '#4b5563' },
    divider: '#e5e7eb',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
          backgroundImage: 'linear-gradient(to bottom right, #ffffff, #f9fafb)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          color: '#111827',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid #e5e7eb',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 768,
      md: 1024,
      lg: 1440,
      xl: 1920,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.3 },
    h3: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.4 },
    h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.5 },
    h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: borderRadius.large },
  shadows,
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.medium,
          padding: '10px 24px',
          fontSize: '0.9375rem',
          boxShadow: 'none',
          ...hoverBoxShadow(),
        },
        contained: { ...hoverBoxShadow('rgba(99,102,241,0.35)') },
        outlined: { borderWidth: 2, '&:hover': { borderWidth: 2 } },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.medium,
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2 },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.extraLarge,
          boxShadow: shadows[3],
          border: '1px solid #f1f5f9',
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { borderRadius: borderRadius.extraLarge } } },
    MuiChip: { styleOverrides: { root: { borderRadius: borderRadius.small, fontWeight: 500 } } },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
          color: '#64748b',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        },
        root: { borderColor: '#f1f5f9' },
      },
    },
    MuiTableRow: { styleOverrides: { root: { '&:hover': { backgroundColor: '#f8fafc' } } } },
    MuiDrawer: { styleOverrides: { paper: { borderRight: 'none', boxShadow: shadows[4] } } },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: shadows[2], backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.9)' },
      },
    },
    MuiAvatar: { styleOverrides: { root: { backgroundColor: '#6366f1', color: '#fff', fontWeight: 600 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20 } } },
    MuiFab: { styleOverrides: { root: { boxShadow: shadows[5] } } },
  },
});

theme = responsiveFontSizes(theme);

export default theme;