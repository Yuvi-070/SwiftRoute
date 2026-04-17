/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#4A90D9';
const tintColorDark = '#fff';

export const Colors = {
  WHITE: '#FFFFFF',
  PRIMARY: '#4A90D9',       // Ocean blue – primary actions
  PRIMARY_DARK: '#2C6FAC',  // Deeper blue for pressed states
  SECONDARY: '#F5A623',     // Warm amber – accents / highlights
  DARK: '#1A1A2E',          // Near-black for headings
  GRAY: '#9CA3AF',          // Muted text
  LIGHT_GRAY: '#F3F4F6',    // Card / section backgrounds
  BACKGROUND: '#F8FAFF',    // Overall app background
  SUCCESS: '#22C55E',       // Green for confirmations
  ERROR: '#EF4444',         // Red for errors
  light: {
    text: '#11181C',
    background: '#F8FAFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
