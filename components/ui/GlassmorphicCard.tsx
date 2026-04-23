import React from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../constants/theme';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
}

/**
 * Card with glassmorphism effect — translucent background with subtle border.
 * On Android where BackdropFilter isn't supported, falls back to semi-transparent bg.
 */
export default function GlassmorphicCard({
  children,
  style,
  intensity = 'medium',
}: GlassmorphicCardProps) {
  const { theme, isDark } = useTheme();

  const bgOpacity = intensity === 'light' ? 0.04 : intensity === 'strong' ? 0.14 : 0.08;

  const glassStyle: ViewStyle = {
    backgroundColor: isDark
      ? `rgba(255,255,255,${bgOpacity})`
      : `rgba(255,255,255,${0.65 + bgOpacity})`,
    borderWidth: 1,
    borderColor: isDark
      ? `rgba(255,255,255,${bgOpacity + 0.02})`
      : `rgba(255,255,255,${0.4})`,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: theme.shadowOpacity,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  };

  return (
    <View style={[styles.base, glassStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    overflow: 'hidden',
  },
});
