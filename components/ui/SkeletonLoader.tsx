import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  interpolateColor
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { radii } from '../../constants/theme';

interface SkeletonLoaderProps {
  style?: ViewStyle | ViewStyle[];
  rounded?: keyof typeof radii;
}

export default function SkeletonLoader({ style, rounded = 'md' }: SkeletonLoaderProps) {
  const { isDark } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const color1 = isDark ? '#1F2937' : '#E5E7EB';
    const color2 = isDark ? '#374151' : '#F3F4F6';
    
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [color1, color2]
      ),
    };
  });

  return (
    <Animated.View 
      style={[
        styles.skeleton, 
        { borderRadius: radii[rounded] }, 
        style, 
        animatedStyle
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});
