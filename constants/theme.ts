/**
 * Tema do AutoCuidado
 * Paleta de cores, tipografia e espaçamentos do aplicativo
 */

export const Themes = {
  // Tema Primário (Vencedor da Enquete: Azul / Verde / Branco Gelo)
  primary: {
    name: 'primary',
    primary: '#1E56A0',
    primaryDark: '#1B4980',
    primaryLight: '#4A90D9',

    secondary: '#1E7F55',
    secondaryDark: '#186A46',

    accent: '#F5A623',

    background: '#F5F7FA', // Branco Gelo
    surface: '#FFFFFF',
    card: '#FFFFFF',

    text: '#1C1C1C',
    textSecondary: '#555555',
    textLight: '#B2BEC3',
    textOnPrimary: '#FFFFFF',

    border: '#E2E8F0',
    divider: '#EAEEF1',

    success: '#1E7F55',
    warning: '#F5A623',
    error: '#E74C3C',
    info: '#1E56A0',

    tabBar: '#FFFFFF',
    tabBarInactive: '#B2BEC3',
    tabBarActive: '#1E56A0',
    tagBackground: '#E8F1F5',
  },

  // Tema Secundário (SMS Fortaleza: Verde #25696A / Laranja #E9601C)
  secondary: {
    name: 'secondary',
    primary: '#25696A',       // Verde Oficial SMS
    primaryDark: '#1B4D4E',
    primaryLight: '#348687',

    secondary: '#E9601C',     // Laranja de Destaque
    secondaryDark: '#C84D12',

    accent: '#E9601C',        // Laranja de Destaque

    background: '#F4F7F6',    // Cinza/Verde Suave
    surface: '#FFFFFF',
    card: '#FFFFFF',

    text: '#1A1A1A',
    textSecondary: '#4A5568',
    textLight: '#718096',
    textOnPrimary: '#FFFFFF',

    border: '#E2E8F0',
    divider: '#EDF2F7',

    success: '#25696A',
    warning: '#E9601C',       // Alertas em Laranja
    error: '#D9381E',
    info: '#25696A',

    tabBar: '#FFFFFF',
    tabBarInactive: '#718096',
    tabBarActive: '#E9601C',   // Ícones do rodapé
    tagBackground: '#FDEEE7', // Fundo Laranja Suave do Banner
  },
};

export type ThemeType = 'primary' | 'secondary';

// Mantido para compatibilidade com partes antigas do código
export const Colors = Themes.primary;

export const Fonts = {
  family: {
    regular: 'OpenDyslexic-Regular',
    bold: 'OpenDyslexic-Bold',
    italic: 'OpenDyslexic-Italic',
    boldItalic: 'OpenDyslexic-BoldItalic',
  },
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
    shadowColor: '#E9601C',   // <--- MUDADO PARA LARANJA
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};