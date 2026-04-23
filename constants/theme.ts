/**
 * SwiftRoute v2.0 — Design Token System
 * Complete dark / light theme with gradients, glassmorphism, spacing & typography.
 */

// ─── Palette ──────────────────────────────────────────────────────────────────

const palette = {
  // Primary spectrum (indigo → violet)
  indigo50: '#EEF2FF',
  indigo100: '#E0E7FF',
  indigo200: '#C7D2FE',
  indigo400: '#818CF8',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  indigo700: '#4338CA',

  // Violet accent
  violet400: '#A78BFA',
  violet500: '#8B5CF6',
  violet600: '#7C3AED',

  // Teal highlights
  teal400: '#2DD4BF',
  teal500: '#14B8A6',

  // Amber / warm
  amber400: '#FBBF24',
  amber500: '#F59E0B',

  // Rose / error
  rose400: '#FB7185',
  rose500: '#F43F5E',

  // Emerald / success
  emerald400: '#34D399',
  emerald500: '#10B981',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  gray950: '#030712',

  // Dark-mode surface tones
  darkBase: '#0A0E1A',
  darkSurface1: '#111627',
  darkSurface2: '#181D30',
  darkSurface3: '#1E2438',
  darkBorder: 'rgba(255,255,255,0.08)',
} as const;

// ─── Light Theme ──────────────────────────────────────────────────────────────

export const lightTheme = {
  mode: 'light' as const,

  // Backgrounds
  background: '#F5F7FF',
  surface: palette.white,
  surfaceElevated: palette.white,
  surfacePressed: palette.gray100,

  // Text
  textPrimary: palette.gray900,
  textSecondary: palette.gray500,
  textTertiary: palette.gray400,
  textInverse: palette.white,

  // Brand
  primary: palette.indigo500,
  primaryDark: palette.indigo700,
  primaryLight: palette.indigo100,
  primaryMuted: palette.indigo50,
  accent: palette.violet500,
  accentLight: 'rgba(139,92,246,0.12)',
  secondary: palette.amber500,

  // Semantic
  success: palette.emerald500,
  successLight: 'rgba(16,185,129,0.12)',
  error: palette.rose500,
  errorLight: 'rgba(244,63,94,0.12)',
  warning: palette.amber500,
  warningLight: 'rgba(245,158,11,0.12)',
  info: palette.indigo500,

  // Borders
  border: palette.gray200,
  borderLight: palette.gray100,
  divider: palette.gray100,

  // Glassmorphism
  glass: 'rgba(255,255,255,0.75)',
  glassBorder: 'rgba(255,255,255,0.3)',

  // Tab bar
  tabBar: 'rgba(255,255,255,0.92)',
  tabBarBorder: palette.gray200,
  tabIconDefault: palette.gray400,
  tabIconSelected: palette.indigo500,

  // Shadows
  shadowColor: '#000',
  shadowOpacity: 0.06,

  // Gradients
  gradientPrimary: [palette.indigo500, palette.violet500] as [string, string],
  gradientHero: [palette.indigo600, palette.violet600] as [string, string],
  gradientCard: [palette.indigo50, palette.violet400 + '08'] as [string, string],
  gradientSunset: [palette.amber400, palette.rose400] as [string, string],
  gradientSuccess: [palette.teal400, palette.emerald400] as [string, string],

  // Status bar
  statusBarStyle: 'dark-content' as 'dark-content' | 'light-content',
};

// ─── Dark Theme ───────────────────────────────────────────────────────────────

export const darkTheme: AppTheme = {
  mode: 'dark' as const,

  // Backgrounds
  background: palette.darkBase,
  surface: palette.darkSurface1,
  surfaceElevated: palette.darkSurface2,
  surfacePressed: palette.darkSurface3,

  // Text
  textPrimary: palette.gray50,
  textSecondary: palette.gray400,
  textTertiary: palette.gray500,
  textInverse: palette.gray900,

  // Brand
  primary: palette.indigo400,
  primaryDark: palette.indigo500,
  primaryLight: 'rgba(99,102,241,0.18)',
  primaryMuted: 'rgba(99,102,241,0.08)',
  accent: palette.violet400,
  accentLight: 'rgba(167,139,250,0.14)',
  secondary: palette.amber400,

  // Semantic
  success: palette.emerald400,
  successLight: 'rgba(52,211,153,0.14)',
  error: palette.rose400,
  errorLight: 'rgba(251,113,133,0.14)',
  warning: palette.amber400,
  warningLight: 'rgba(251,191,36,0.14)',
  info: palette.indigo400,

  // Borders
  border: palette.darkBorder,
  borderLight: 'rgba(255,255,255,0.05)',
  divider: 'rgba(255,255,255,0.06)',

  // Glassmorphism
  glass: 'rgba(17,22,39,0.65)',
  glassBorder: 'rgba(255,255,255,0.08)',

  // Tab bar
  tabBar: 'rgba(10,14,26,0.88)',
  tabBarBorder: 'rgba(255,255,255,0.06)',
  tabIconDefault: palette.gray500,
  tabIconSelected: palette.indigo400,

  // Shadows
  shadowColor: '#000',
  shadowOpacity: 0.3,

  // Gradients
  gradientPrimary: [palette.indigo500, palette.violet500] as [string, string],
  gradientHero: ['#1a1040', '#0f1428'] as [string, string],
  gradientCard: ['rgba(99,102,241,0.08)', 'rgba(139,92,246,0.04)'] as [string, string],
  gradientSunset: [palette.amber400, palette.rose400] as [string, string],
  gradientSuccess: [palette.teal400, palette.emerald400] as [string, string],

  // Status bar
  statusBarStyle: 'light-content' as const,
};

// ─── Theme Type ───────────────────────────────────────────────────────────────

export type AppTheme = {
  mode: 'light' | 'dark';
  background: string;
  surface: string;
  surfaceElevated: string;
  surfacePressed: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryMuted: string;
  accent: string;
  accentLight: string;
  secondary: string;
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;
  info: string;
  border: string;
  borderLight: string;
  divider: string;
  glass: string;
  glassBorder: string;
  tabBar: string;
  tabBarBorder: string;
  tabIconDefault: string;
  tabIconSelected: string;
  shadowColor: string;
  shadowOpacity: number;
  gradientPrimary: [string, string];
  gradientHero: [string, string];
  gradientCard: [string, string];
  gradientSunset: [string, string];
  gradientSuccess: [string, string];
  statusBarStyle: 'dark-content' | 'light-content';
};

// ─── Spacing & Radii ──────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const typography = {
  hero: { fontFamily: 'outfit-bold', fontSize: 32, lineHeight: 40 },
  h1: { fontFamily: 'outfit-bold', fontSize: 28, lineHeight: 36 },
  h2: { fontFamily: 'outfit-bold', fontSize: 22, lineHeight: 30 },
  h3: { fontFamily: 'outfit-bold', fontSize: 18, lineHeight: 26 },
  subtitle: { fontFamily: 'outfit-medium', fontSize: 16, lineHeight: 24 },
  body: { fontFamily: 'outfit', fontSize: 15, lineHeight: 22 },
  bodySmall: { fontFamily: 'outfit', fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: 'outfit', fontSize: 12, lineHeight: 16 },
  label: { fontFamily: 'outfit-medium', fontSize: 14, lineHeight: 20 },
  button: { fontFamily: 'outfit-bold', fontSize: 16, lineHeight: 22 },
  buttonSmall: { fontFamily: 'outfit-bold', fontSize: 14, lineHeight: 20 },
  tabLabel: { fontFamily: 'outfit-medium', fontSize: 11, lineHeight: 14 },
} as const;

// ─── Legacy Colors export (backwards compat during migration) ─────────────────
// Remove once all screens are migrated to useTheme().

export const Colors = {
  WHITE: '#FFFFFF',
  PRIMARY: palette.indigo500,
  PRIMARY_DARK: palette.indigo700,
  SECONDARY: palette.amber500,
  DARK: palette.gray900,
  GRAY: palette.gray500,
  LIGHT_GRAY: palette.gray100,
  BACKGROUND: '#F5F7FF',
  SUCCESS: palette.emerald500,
  ERROR: palette.rose500,
  light: {
    text: palette.gray900,
    background: '#F5F7FF',
    tint: palette.indigo500,
    icon: palette.gray500,
    tabIconDefault: palette.gray400,
    tabIconSelected: palette.indigo500,
  },
  dark: {
    text: palette.gray50,
    background: palette.darkBase,
    tint: palette.indigo400,
    icon: palette.gray500,
    tabIconDefault: palette.gray500,
    tabIconSelected: palette.indigo400,
  },
};

// ─── Backwards-compatible Colors (legacy support for .jsx screens) ──────────

export const Colors1 = {
  PRIMARY: palette.indigo500,
  WHITE: '#FFFFFF',
  DARK: palette.gray900,
  GRAY: palette.gray500,
  LIGHT_GRAY: palette.gray200,
  BACKGROUND: '#F5F7FF',
} as const;
