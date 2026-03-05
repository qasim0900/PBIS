import { createTheme } from '@mui/material/styles';

// Color Palette
const colors = {
  primary: {
    main: '#A855F7',
    light: '#D8B4FE',
    dark: '#6B21A8',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#22D3EE',
    light: '#77E9F9',
    dark: '#0891B2',
    contrastText: '#1F2937',
  },
  accent: {
    magenta: '#EC4899',
    gold: '#FACC15',
    teal: '#22D3EE',
  },
  background: {
    default: '#F3F4F6',
    paper: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #6B21A8 0%, #A855F7 100%)',
    dark: '#6B21A8',
  },
  text: {
    primary: '#1F2937',
    secondary: '#9CA3AF',
    disabled: '#D1D5DB',
    onDark: '#EDE9FE',
  },
  error: {
    main: '#EC4899',
    light: '#FCE7F3',
  },
  success: {
    main: '#22D3EE',
    light: '#CFFAFE',
  },
  info: {
    main: '#D8B4FE',
    light: '#F5F3FF',
  },
};

// Create theme
const theme = createTheme({
  palette: colors,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      color: '#6B21A8',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      color: '#6B21A8',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#6B21A8',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#6B21A8',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#6B21A8',
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#6B21A8',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      color: '#1F2937',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      color: '#9CA3AF',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      color: '#9CA3AF',
      lineHeight: 1.4,
    },
  },
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    text: colors.text,
    error: colors.error,
    success: colors.success,
    info: colors.info,
    accent: colors.accent,
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    // Button Components
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          borderRadius: 12,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        containedPrimary: {
          backgroundColor: '#A855F7',
          color: '#FFFFFF',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            backgroundColor: '#C084FC',
            boxShadow: '0 10px 15px -3px rgba(168, 85, 247, 0.3)',
          },
        },
        containedSecondary: {
          backgroundColor: '#D8B4FE',
          color: '#6B21A8',
          '&:hover': {
            backgroundColor: '#E9D5FF',
            transform: 'scale(1.03)',
          },
        },
      },
    },
    // TextField Components
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': {
              borderColor: '#D8B4FE',
            },
            '&:hover fieldset': {
              borderColor: '#A855F7',
            },
            '&.Mui-focused': {
              transform: 'scale(1.02)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              '& fieldset': {
                borderColor: '#22D3EE',
              },
            },
          },
        },
      },
    },
    // Card Components
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease-in-out',
          backgroundColor: '#FFFFFF',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.03)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    // Table Components
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#6B21A8',
            color: '#FFFFFF',
            fontWeight: 700,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: '#D8B4FE15',
          },
          '&:hover': {
            backgroundColor: '#C084FC40 !important',
            cursor: 'pointer',
          },
        },
      },
    },
    // Dialog Components
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(107, 33, 168, 0.5)',
        },
      },
    },
  },
});

export default theme;
