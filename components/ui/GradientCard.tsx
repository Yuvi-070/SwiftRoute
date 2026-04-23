import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { radii } from '../../constants/theme';

interface GradientCardProps {
  children: React.ReactNode;
  colors?: [string, string];
  style?: ViewStyle;
}

/**
 * A card with a gradient background.
 * Uses a View overlay approach for the gradient effect.
 */
export default function GradientCard({
  children,
  colors,
  style,
}: GradientCardProps) {
  const { theme } = useTheme();
  const [startColor, endColor] = colors ?? theme.gradientPrimary;

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: startColor,
          ...Platform.select({
            ios: {
              shadowColor: startColor,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 14,
            },
            android: { elevation: 6 },
          }),
        },
        style,
      ]}
    >
      {/* Gradient overlay using a semi-transparent second color */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: endColor,
            opacity: 0.5,
            borderRadius: radii.xl,
          },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
  },
});
