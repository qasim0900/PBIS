import { createTheme } from '@mui/material/styles';

// Color Palette
const colors = {
  primary: {
    main: '#6B46C1',
    light: '#D6BCFA',
    dark: '#553C9A',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#D6BCFA',
    light: '#E9D5FF',
    dark: '#C084FC',
    contrastText: '#1F2937',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#1F2937',
    secondary: '#4B5563',
    disabled: '#9CA3AF',
  },
  error: {
    main: '#EF4444',
    light: '#FEE2E2',
  },
  warning: {
    main: '#F59E0B',
    light: '#FEF3C7',
  },
  success: {
    main: '#10B981',
    light: '#D1FAE5',
  },
  info: {
    main: '#3B82F6',
    light: '#DBEAFE',
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
      color: colors.text.primary,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      color: colors.text.primary,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: colors.text.primary,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: colors.text.primary,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: colors.text.primary,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: colors.text.primary,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      color: colors.text.primary,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      color: colors.text.secondary,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      color: colors.text.disabled,
      lineHeight: 1.4,
    },
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
          fontWeight: 500,
          padding: '8px 16px',
          borderRadius: 8,
          transition: 'all 0.2s ease-in-out',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(107, 70, 193, 0.3)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
          },
        },
        containedSecondary: {
          backgroundColor: colors.secondary.main,
          color: colors.text.primary,
          '&:hover': {
            backgroundColor: colors.primary.main,
            color: colors.primary.contrastText,
          },
        },
        outlinedPrimary: {
          borderColor: colors.primary.main,
          color: colors.primary.main,
          '&:hover': {
            borderColor: colors.primary.dark,
            backgroundColor: colors.primary.main,
            color: colors.primary.contrastText,
          },
        },
        outlinedSecondary: {
          borderColor: colors.secondary.main,
          color: colors.secondary.main,
          '&:hover': {
            borderColor: colors.primary.main,
            backgroundColor: colors.primary.main,
            color: colors.primary.contrastText,
          },
        },
      },
    },
    // TextField Components
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: colors.secondary.main,
            },
            '&.Mui-focused': {
              borderColor: colors.primary.main,
              boxShadow: `0 0 0 2px ${colors.primary.light}40`,
            },
          },
          '& .MuiInputLabel-root': {
            color: colors.text.secondary,
            '&.Mui-focused': {
              color: colors.primary.main,
            },
          },
        },
      },
    },
    // Select Components
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: colors.secondary.main,
            },
            '&.Mui-focused': {
              borderColor: colors.primary.main,
              boxShadow: `0 0 0 2px ${colors.primary.light}40`,
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
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(107, 70, 193, 0.15)',
          },
        },
      },
    },
    // Table Components
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: colors.primary.main,
            color: colors.primary.contrastText,
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: colors.secondary.light,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#E5E7EB',
          padding: '12px 16px',
        },
      },
    },
    // Dialog Components
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: colors.primary.main,
          color: colors.primary.contrastText,
          fontWeight: 600,
          fontSize: '1.125rem',
          padding: '20px 24px',
        },
      },
    },
    // Chip Components
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
        colorPrimary: {
          backgroundColor: colors.primary.main,
          color: colors.primary.contrastText,
        },
        colorSecondary: {
          backgroundColor: colors.secondary.main,
          color: colors.text.primary,
        },
      },
    },
    // AppBar Components
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.primary.main,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    // Drawer Components
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E5E7EB',
          backgroundColor: colors.background.paper,
        },
      },
    },
    // ListItem Components
    MuiListItem: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: colors.secondary.light,
          },
          '&.Mui-selected': {
            backgroundColor: colors.primary.main,
            color: colors.primary.contrastText,
            '&:hover': {
              backgroundColor: colors.primary.dark,
            },
          },
        },
      },
    },
    // IconButton Components
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: colors.secondary.light,
            transform: 'scale(1.1)',
          },
        },
      },
    },
  },
});

export default theme;
