export type ThemePalette = {
  background: string;
  card: string;
  surface: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  danger: string;
  warning: string;
};

export const darkTheme: ThemePalette = {
  background: '#000100',
  card: 'rgba(255, 255, 255, 0.02)', // Extremely subtle phantom bounds
  surface: 'rgba(255, 255, 255, 0.05)',
  primary: '#B8D641',
  primaryLight: '#cae560',
  primaryDark: '#a0c119',
  secondary: '#F3FFF8',
  text: '#F3FFF8',
  textMuted: '#8AB7A0',
  border: 'transparent', // Edgeless UI implies no literal borders
  success: '#6BD498',
  danger: '#EF4444', // Red
  warning: '#F59E0B',
};

export const lightTheme: ThemePalette = {
  background: '#F6FFF9',
  card: 'rgba(0, 0, 0, 0.02)', 
  surface: 'rgba(0, 0, 0, 0.05)',
  primary: '#B8D641',
  primaryLight: '#cae560',
  primaryDark: '#a0c119',
  secondary: '#000100',
  text: '#000100', 
  textMuted: '#5F7A6B', 
  border: 'transparent',
  success: '#43B875', 
  danger: '#DC2626', 
  warning: '#D97706',
};

export type ThemeColors = ThemePalette;
