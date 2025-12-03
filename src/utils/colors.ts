// Color palette for Speech Therapy App
// Modern, professional design with soft gradients and accessibility in mind

export const Colors = {
  // Primary colors - Modern teal/cyan
  primary: '#0891B2',
  primaryLight: '#22D3EE',
  primaryDark: '#0E7490',

  // Secondary colors - Fresh green
  secondary: '#10B981',
  secondaryLight: '#34D399',
  secondaryDark: '#059669',

  // Accent colors - Warm coral
  accent: '#F472B6',
  accentLight: '#F9A8D4',
  accentDark: '#DB2777',

  // Neutral colors - Clean, minimal
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Text colors - High contrast for readability
  text: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  textOnPrimary: '#FFFFFF',

  // Status colors - Vibrant but professional
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Response colors (for trials)
  correct: '#10B981',
  incorrect: '#EF4444',
  approximation: '#F59E0B',
  noResponse: '#94A3B8',

  // Border and divider - Subtle
  border: '#E2E8F0',
  divider: '#F1F5F9',

  // Shadows - Soft, modern
  shadow: 'rgba(15, 23, 42, 0.08)',
  shadowDark: 'rgba(15, 23, 42, 0.16)',

  // Overlay
  overlay: 'rgba(15, 23, 42, 0.5)',
};

// Goal category colors - Modern vibrant palette
export const GoalCategoryColors: Record<string, string> = {
  articulation: '#EF4444',
  language: '#3B82F6',
  fluency: '#8B5CF6',
  voice: '#14B8A6',
  pragmatics: '#F59E0B',
  phonology: '#EC4899',
  other: '#64748B',
};

// Cue level colors (from most to least independent) - Modern gradient
export const CueLevelColors: Record<string, string> = {
  independent: '#10B981',
  verbal_cue: '#34D399',
  visual_cue: '#FBBF24',
  model: '#F97316',
  partial_physical: '#EF4444',
  full_physical: '#DC2626',
};
