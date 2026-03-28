/**
 * Tema do AutoCuidado
 * Paleta de cores e tipografia do aplicativo
 */

export const Colors = {
  primary: '#4A90D9',
  primaryDark: '#3A7BC8',
  primaryLight: '#6BA3E0',

  secondary: '#5CB85C',
  secondaryDark: '#4A9A4A',

  accent: '#F5A623',

  background: '#F5F7FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  text: '#2D3436',
  textSecondary: '#636E72',
  textLight: '#B2BEC3',
  textOnPrimary: '#FFFFFF',

  border: '#DFE6E9',
  divider: '#EAEEF1',

  success: '#5CB85C',
  warning: '#F5A623',
  error: '#E74C3C',
  info: '#4A90D9',

  tabBar: '#FFFFFF',
  tabBarInactive: '#B2BEC3',
  tabBarActive: '#4A90D9',
};

export const Fonts = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    title: 32,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};

