/**
 * Theme Color Palette
 * Based on autumn-inspired color scheme
 */

export const colors = {
  // Primary colors
  goldenYellow: '#E8B600',
  burntOrange: '#D98326',
  
  // Neutral colors
  creamyWhite: '#F1ECE6',
  
  // Accent colors
  lightSkyBlue: '#BADBE6',
  mediumBlue: '#76B7CD',
  
  // Semantic color mappings for Material-UI
  palette: {
    primary: {
      main: '#E8B600', // Golden Yellow
      light: '#F5D04A',
      dark: '#B89000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#D98326', // Burnt Orange
      light: '#E8A55A',
      dark: '#A8661D',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F1ECE6', // Creamy White
      paper: '#FFFFFF',
    },
    info: {
      main: '#76B7CD', // Medium Blue
      light: '#BADBE6', // Light Sky Blue
      dark: '#5A8FA0',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#2C2C2C',
      secondary: '#666666',
      disabled: '#999999',
    },
    divider: '#E0E0E0',
  },
} as const;

// Export individual colors for direct use
export const {
  goldenYellow,
  burntOrange,
  creamyWhite,
  lightSkyBlue,
  mediumBlue,
} = colors;

// Export palette for Material-UI theme
export const themePalette = colors.palette;


