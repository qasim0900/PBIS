import { createTheme, responsiveFontSizes } from '@mui/material/styles';


//---------------------------------------
// :: Border radius scale
//---------------------------------------

/*
Defines a set of standard border-radius values for consistent styling across the app.
*/

const borderRadius = {
  small: 8,
  medium: 10,
  large: 12,
  extraLarge: 16,
};


//---------------------------------------
// :: Standard shadows 
//---------------------------------------

/*
Defines an array of elevation shadows for consistent UI styling, with additional slots filled as `'none'` for unused levels.
*/

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


//---------------------------------------
// :: hoverBoxShadow
//---------------------------------------

/*
Creates a reusable hover style that adds a customizable box-shadow when an element is hovered.
*/

const hoverBoxShadow = (color = 'rgba(99, 102, 241, 0.25)') => ({
  '&:hover': { boxShadow: `0px 4px 12px ${color}` },
});


//---------------------------------------
// :: Base MUI theme
//---------------------------------------

/*
Creates a custom MUI theme with a light palette, defining primary, secondary,
success, warning, error, info colors, background, text, and divider styles.
*/

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5', contrastText: '#fff' },
    secondary: { main: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed', contrastText: '#fff' },
    success: { main: '#10b981', light: '#34d399', dark: '#059669' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    error: { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
    info: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
    background: { default: '#f8fafc', paper: '#fff' },
    text: { primary: '#1e293b', secondary: '#64748b' },
    divider: '#e2e8f0',
  },


  //---------------------------------------
  // :: Typography Design
  //---------------------------------------

  /*
  Sets custom typography for the theme, defining fonts, heading sizes, body text, and button styles with consistent weights and line heights.
  */


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


  //---------------------------------------
  // :: Configures theme shape
  //---------------------------------------

  /*
  Configures theme shape with a large border radius, applies predefined shadows, and sets spacing unit to 8px.
  */


  shape: { borderRadius: borderRadius.large },
  shadows,
  spacing: 8,


  //---------------------------------------
  // :: Components Design
  //---------------------------------------

  /*
  Customizes MUI Button styles: sets border radius, padding, font size, removes default shadow, 
  adds hover shadow, and adjusts contained/outlined variants.
  */

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


    //---------------------------------------
    // :: MuiTextField Design
    //---------------------------------------

    /*
    Customizes MUI TextField: sets medium border radius, changes outline color on hover, and thickens border when focused.
    */


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


    //---------------------------------------
    // :: Customizes MuiCard
    //---------------------------------------

    /*
    Customizes MUI Card: applies extra-large border radius, sets shadow level 3, and adds a light border.
    */


    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.extraLarge,
          boxShadow: shadows[3],
          border: '1px solid #f1f5f9',
        },
      },
    },


    //---------------------------------------
    // :: Customizes MuiPaper 
    //---------------------------------------

    /*
    Customizes MUI Paper with extra-large border radius and MUI Chip with small border radius and medium font weight.
    */


    MuiPaper: { styleOverrides: { root: { borderRadius: borderRadius.extraLarge } } },
    MuiChip: { styleOverrides: { root: { borderRadius: borderRadius.small, fontWeight: 500 } } },


    //---------------------------------------
    // :: MUI TableCell styles
    //---------------------------------------

    /*
    MUI TableCell styles: bold uppercase header with custom colours, small font, spaced letters; root with light border.
    */


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


    //---------------------------------------
    // :: MuiTableRow Design
    //---------------------------------------

    /*
    MUI styles: TableRow highlights on hover; Drawer with no right border and shadow; AppBar 
    with subtle shadow, blur effect, and semi-transparent white background.
    */


    MuiTableRow: { styleOverrides: { root: { '&:hover': { backgroundColor: '#f8fafc' } } } },
    MuiDrawer: { styleOverrides: { paper: { borderRight: 'none', boxShadow: shadows[4] } } },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: shadows[2], backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.9)' },
      },
    },

    //---------------------------------------
    // :: MUI styles
    //---------------------------------------

    /*
    MUI styles: Avatar with purple background, white bold text; Dialog with rounded corners; Fab button with shadow.
    */


    MuiAvatar: { styleOverrides: { root: { backgroundColor: '#6366f1', color: '#fff', fontWeight: 600 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20 } } },
    MuiFab: { styleOverrides: { root: { boxShadow: shadows[5] } } },
  },
});


//---------------------------------------
// :: Enable responsive typography
//---------------------------------------

/*
Applies responsive font sizing to the theme so typography scales smoothly across different screen sizes.
*/

theme = responsiveFontSizes(theme);


//---------------------------------------
// :: Export Theme
//---------------------------------------

/*
Exports the configured MUI theme for use throughout the application.
*/

export default theme;
