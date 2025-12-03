// Color palette for Speech Therapy App

export const Colors = {
  // Primary colors
  primary: '#4A90A4',
  primaryLight: '#7BB5C7',
  primaryDark: '#2D6A7A',

  // Secondary colors
  secondary: '#6B8E23',
  secondaryLight: '#8FBC3C',
  secondaryDark: '#4A6B10',

  // Accent colors
  accent: '#FF6B6B',
  accentLight: '#FF9999',
  accentDark: '#CC4444',

  // Neutral colors
  background: '#F5F7FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Text colors
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  textLight: '#BDC3C7',
  textOnPrimary: '#FFFFFF',

  // Status colors
  success: '#27AE60',
  successLight: '#A9DFBF',
  warning: '#F39C12',
  warningLight: '#FCE4BB',
  error: '#E74C3C',
  errorLight: '#F5B7B1',
  info: '#3498DB',
  infoLight: '#AED6F1',

  // Response colors (for trials)
  correct: '#27AE60',
  incorrect: '#E74C3C',
  approximation: '#F39C12',
  noResponse: '#95A5A6',

  // Border and divider
  border: '#E0E6ED',
  divider: '#ECF0F1',

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Goal category colors
export const GoalCategoryColors: Record<string, string> = {
  articulation: '#E74C3C',
  language: '#3498DB',
  fluency: '#9B59B6',
  voice: '#1ABC9C',
  pragmatics: '#F39C12',
  phonology: '#E91E63',
  other: '#95A5A6',
};

// Cue level colors (from most to least independent)
export const CueLevelColors: Record<string, string> = {
  independent: '#27AE60',
  verbal_cue: '#2ECC71',
  visual_cue: '#F1C40F',
  model: '#E67E22',
  partial_physical: '#E74C3C',
  full_physical: '#C0392B',
};
