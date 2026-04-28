import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { radii } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  rounded?: keyof typeof radii;
}

export default function GlassCard({ children, intensity = 40, tint, rounded = 'xl', style, ...props }: GlassCardProps) {
  const { theme, isDark } = useTheme();
  
  // Dynamic tint based on current theme if not explicitly provided
  const activeTint = tint || (isDark ? 'dark' : 'light');

  return (
    <View style={[styles.container, { borderRadius: radii[rounded] }, style]} {...props}>
      <BlurView
        intensity={intensity}
        tint={activeTint}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.glass }
        ]}
      />
      <View style={[styles.inner, { borderColor: theme.glassBorder, borderRadius: radii[rounded] }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    borderWidth: 1,
    padding: 16,
  },
});
