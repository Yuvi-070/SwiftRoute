import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ShimmerLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Shimmer / skeleton loader that replaces ActivityIndicator.
 * Shows a pulsing gradient placeholder while content loads.
 */
export default function ShimmerLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: ShimmerLoaderProps) {
  const { theme, isDark } = useTheme();
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const bgColor = isDark ? 'rgba(255,255,255,0.06)' : theme.borderLight;

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: bgColor,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}

/** A pre-built card shimmer with title + body lines */
export function CardShimmer({ style }: { style?: ViewStyle }) {
  return (
    <View style={[shimmerStyles.card, style]}>
      <ShimmerLoader width="60%" height={18} borderRadius={6} />
      <ShimmerLoader width="100%" height={14} borderRadius={6} style={{ marginTop: 12 }} />
      <ShimmerLoader width="85%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
      <ShimmerLoader width="40%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
    </View>
  );
}

const shimmerStyles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 16,
  },
});
