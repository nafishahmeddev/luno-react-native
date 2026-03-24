export const darkTheme = {
  background: '#030303', // Pitch Black
  card: 'rgba(255, 255, 255, 0.04)', // Frosted glass fallback
  surface: 'rgba(255, 255, 255, 0.08)',
  primary: '#00FFAA', // Neon Mint
  primaryLight: '#5CFFC6',
  primaryDark: '#00A870',
  secondary: '#00F0FF', // Neon Cyan
  text: '#FFFFFF',
  textMuted: '#A0A0A0',
  border: 'rgba(255, 255, 255, 0.12)',
  success: '#39FF14', // Neon Green
  danger: '#FF0055', // Neon Pink/Red
  warning: '#FFD700',
};

export const lightTheme = {
  background: '#F9FAFB', 
  card: 'rgba(0, 0, 0, 0.03)', 
  surface: 'rgba(0, 0, 0, 0.05)',
  primary: '#00C885', // Darker Mint
  primaryLight: '#5CFFC6',
  primaryDark: '#00A870',
  secondary: '#00C2CE', 
  text: '#111827', // Slate Black
  textMuted: '#6B7280', 
  border: 'rgba(0, 0, 0, 0.1)',
  success: '#2EBA13', 
  danger: '#DE004C', 
  warning: '#D4AF37',
};

export type ThemeColors = typeof darkTheme;
