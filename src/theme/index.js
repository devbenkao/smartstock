import { Platform } from 'react-native';

export const getColors = (isDark) => ({
  // Backgrounds
  background: isDark ? '#141210' : '#F5F2EC',
  surface: isDark ? '#201C18' : '#FFFFFF',
  surfaceWarm: isDark ? '#2A2320' : '#EEEBE3',
  surfaceAccent: isDark ? '#332A24' : '#E6E0D4',

  // Brand — warm cognac/honey
  primary: isDark ? '#D4A060' : '#C4844A',
  primaryLight: isDark ? '#3A2810' : '#F8EED8',
  primaryDark: isDark ? '#A87030' : '#8A5C28',

  // Wood tones
  wood: isDark ? '#C4A070' : '#7A5C3C',
  woodLight: isDark ? '#2E2010' : '#EEE0CC',

  // Deep anchor (walnut / matte black)
  anchor: isDark ? '#F5EEE5' : '#1E1A16',
  anchorMuted: isDark ? '#C0AE9C' : '#3A3028',

  // Text
  text: isDark ? '#F5EEE5' : '#1E1A16',
  textSecondary: isDark ? '#A89880' : '#6B5C4C',
  textTertiary: isDark ? '#6A5848' : '#A89880',

  // Borders
  border: isDark ? '#302820' : '#E2D8C8',
  borderLight: isDark ? '#261E18' : '#EDE6DA',

  // UI surfaces
  tabBar: isDark ? 'rgba(20,18,16,0.97)' : 'rgba(245,242,236,0.97)',
  searchBg: isDark ? '#2A2320' : '#EEEBE3',
  inputBg: isDark ? '#2A2320' : '#F5F2EC',

  // Status
  warning: '#C87818',
  danger: '#C44040',
  success: '#508040',

  // Status backgrounds
  expired: isDark ? '#3C1010' : '#FCEAEA',
  expiredText: '#C44040',
  critical: isDark ? '#3C2204' : '#FEF4E4',
  criticalText: '#C87818',
  good: isDark ? '#102010' : '#EDF7EC',
  goodText: '#508040',

  // Inventory mode colors
  fridge: {
    gradient: isDark
      ? ['#0A1828', '#112238', '#162C48']
      : ['#EAF2FC', '#D0E2F8', '#B8D0EE'],
    accent: isDark ? '#5898E0' : '#2C62AA',
    accentLight: isDark ? '#1A3054' : '#DCE8F8',
    textPrimary: isDark ? '#C8DCF5' : '#0D2848',
    textSecondary: isDark ? '#5888C8' : '#2050A0',
    chipBg: isDark ? 'rgba(88,152,224,0.18)' : 'rgba(44,98,170,0.12)',
    itemTint: isDark ? 'rgba(88,152,224,0.1)' : 'rgba(210,230,248,0.7)',
  },
  pantry: {
    gradient: isDark
      ? ['#1E1508', '#2C1E0C', '#3A2812']
      : ['#FBF4E4', '#F4E4B4', '#EAD08C'],
    accent: isDark ? '#D4A834' : '#A87824',
    accentLight: isDark ? '#302010' : '#F8ECD8',
    textPrimary: isDark ? '#F0E0B0' : '#281400',
    textSecondary: isDark ? '#A88030' : '#7A5018',
    chipBg: isDark ? 'rgba(212,168,52,0.18)' : 'rgba(168,120,36,0.12)',
    itemTint: isDark ? 'rgba(212,168,52,0.1)' : 'rgba(248,240,208,0.7)',
  },
  supply: {
    gradient: isDark
      ? ['#181614', '#221E1C', '#2C2824']
      : ['#F0ECEC', '#E4DCDA', '#D4CCCB'],
    accent: isDark ? '#A89888' : '#6C5C54',
    accentLight: isDark ? '#281E1C' : '#EEE4E0',
    textPrimary: isDark ? '#E4D8D4' : '#201412',
    textSecondary: isDark ? '#806870' : '#504440',
    chipBg: isDark ? 'rgba(168,152,136,0.18)' : 'rgba(108,92,84,0.12)',
    itemTint: isDark ? 'rgba(168,152,136,0.1)' : 'rgba(236,228,224,0.7)',
  },
});

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  card: 20,
  full: 999,
};

export const FONT = {
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    xxxl: 32,
    display: 42,
  },
};

export const SHADOW = {
  card: Platform.select({
    ios: {
      shadowColor: '#6B4020',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 3 },
    default: {},
  }),
  float: Platform.select({
    ios: {
      shadowColor: '#4A2810',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 20,
    },
    android: { elevation: 10 },
    default: {},
  }),
  tab: Platform.select({
    ios: {
      shadowColor: '#2A1808',
      shadowOffset: { width: 0, height: -1 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 12 },
    default: {},
  }),
};
