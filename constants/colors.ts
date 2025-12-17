/**
 * App Theme Constants
 * กำหนดค่าสีและ theme สำหรับแอป Blood Pressure Tracker
 */

/**
 * สี Primary ของแอป (Health App Style)
 */
export const Colors = {
  // Primary Colors
  primary: '#E53935',         // Red - สีหลักสำหรับ health app
  primaryLight: '#FF6F60',
  primaryDark: '#AB000D',

  // Secondary Colors
  secondary: '#1976D2',       // Blue
  secondaryLight: '#63A4FF',
  secondaryDark: '#004BA0',

  // BP Status Colors
  bpNormal: '#4CAF50',        // Green
  bpElevated: '#FFC107',      // Yellow
  bpHypertension1: '#FF9800', // Orange
  bpHypertension2: '#F44336', // Red
  bpCrisis: '#9C27B0',        // Purple
  bpLow: '#2196F3',           // Blue

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Semantic Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

/**
 * Light Theme
 */
export const LightTheme = {
  colors: {
    // Backgrounds
    background: '#F5F5F5',
    surface: '#FFFFFF',
    card: '#FFFFFF',

    // Text
    text: '#212121',
    textSecondary: '#757575',
    textDisabled: '#BDBDBD',
    textOnPrimary: '#FFFFFF',

    // Borders
    border: '#E0E0E0',
    divider: '#EEEEEE',

    // Primary
    primary: Colors.primary,
    primaryLight: Colors.primaryLight,
    primaryDark: Colors.primaryDark,

    // BP Status Colors
    bpNormal: Colors.bpNormal,
    bpElevated: Colors.bpElevated,
    bpHypertension1: Colors.bpHypertension1,
    bpHypertension2: Colors.bpHypertension2,
    bpCrisis: Colors.bpCrisis,
    bpLow: Colors.bpLow,

    // Semantic
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
    info: Colors.info,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 24,
      xxxl: 32,
      display: 48,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
  },
};

/**
 * Dark Theme
 */
export const DarkTheme = {
  colors: {
    // Backgrounds
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2D2D2D',

    // Text
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textDisabled: '#6B6B6B',
    textOnPrimary: '#FFFFFF',

    // Borders
    border: '#3D3D3D',
    divider: '#2D2D2D',

    // Primary (slightly lighter in dark mode)
    primary: '#FF5252',
    primaryLight: '#FF867F',
    primaryDark: '#C50E29',

    // BP Status Colors
    bpNormal: Colors.bpNormal,
    bpElevated: Colors.bpElevated,
    bpHypertension1: Colors.bpHypertension1,
    bpHypertension2: Colors.bpHypertension2,
    bpCrisis: Colors.bpCrisis,
    bpLow: Colors.bpLow,

    // Semantic
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
    info: Colors.info,
  },
  spacing: LightTheme.spacing,
  borderRadius: LightTheme.borderRadius,
  typography: LightTheme.typography,
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 6,
    },
  },
};

export type ThemeType = typeof LightTheme;

/**
 * Get theme based on color scheme
 */
export function getTheme(colorScheme: 'light' | 'dark'): ThemeType {
  return colorScheme === 'dark' ? DarkTheme : LightTheme;
}

export default {
  Colors,
  LightTheme,
  DarkTheme,
  getTheme,
};
