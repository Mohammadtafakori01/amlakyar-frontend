/**
 * Unified blue-first theme palette used across the app
 */

export const colors = {
  // Brand core
  brandPrimary: '#1F64FF',
  brandPrimaryLight: '#DCE7FF',
  brandPrimarySoft: '#EDF3FF',
  brandPrimaryDark: '#0F4ED6',
  brandPrimaryDeep: '#0A3CA5',
  brandSecondary: '#132042',
  brandAccent: '#20C3F9',
  brandAccentSoft: '#E0F7FF',

  // Neutral surfaces
  backgroundSoft: '#F4F7FB',
  backgroundMuted: '#E6ECF7',
  surface: '#FFFFFF',

  // Typography
  textPrimary: '#0B1120',
  textSecondary: '#4A566E',
  textMuted: '#7B88A8',

  // Borders
  borderSubtle: '#E2E8F0',

  gradients: {
    hero: 'linear-gradient(135deg, #0F4ED6 0%, #1F64FF 45%, #3FA0FF 100%)',
    surface: 'linear-gradient(145deg, rgba(31,100,255,0.12) 0%, rgba(10,60,165,0.08) 100%)',
  },

  // Semantic palette for Material-UI or other theming systems
  palette: {
    primary: {
      main: '#1F64FF',
      light: '#5B8BFF',
      dark: '#0C3ECC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#132042',
      light: '#2A365C',
      dark: '#080F23',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F4F7FB',
      paper: '#FFFFFF',
    },
    info: {
      main: '#20C3F9',
      light: '#73E0FF',
      dark: '#0A8EC7',
      contrastText: '#082032',
    },
    success: {
      main: '#22C55E',
      light: '#86EFAC',
      dark: '#15803D',
      contrastText: '#05290F',
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#B45309',
      contrastText: '#361600',
    },
    error: {
      main: '#EF4444',
      light: '#FCA5A5',
      dark: '#B91C1C',
      contrastText: '#290404',
    },
    text: {
      primary: '#0B1120',
      secondary: '#4A566E',
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
  },
} as const;

export const {
  brandPrimary,
  brandPrimaryLight,
  brandPrimarySoft,
  brandPrimaryDark,
  brandPrimaryDeep,
  brandSecondary,
  brandAccent,
  brandAccentSoft,
  backgroundSoft,
  backgroundMuted,
  surface,
  textPrimary,
  textSecondary,
  textMuted,
  borderSubtle,
  gradients,
} = colors;

export const { hero: heroGradient, surface: surfaceGradient } = gradients;

// Export palette for Material-UI theme consumers
export const themePalette = colors.palette;
