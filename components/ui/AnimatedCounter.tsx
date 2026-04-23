import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, type TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface AnimatedCounterProps {
  /** Target number to count up to */
  value: number;
  /** Duration in ms (default 1200) */
  duration?: number;
  /** Prefix (e.g. "$") */
  prefix?: string;
  /** Suffix (e.g. "%") */
  suffix?: string;
  /** Decimal places (default 0) */
  decimals?: number;
  /** Text style override */
  textStyle?: TextStyle;
}

/**
 * Animated number counter that smoothly counts from 0 to the target value.
 * Great for stats, expense totals, percentages.
 */
export default function AnimatedCounter({
  value,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  textStyle,
}: AnimatedCounterProps) {
  const { theme } = useTheme();
  const animValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = React.useState('0');

  useEffect(() => {
    animValue.setValue(0);
    const listener = animValue.addListener(({ value: v }) => {
      setDisplayValue(v.toFixed(decimals));
    });

    Animated.timing(animValue, {
      toValue: value,
      duration,
      useNativeDriver: false, // Can't use native driver for text updates
    }).start();

    return () => animValue.removeListener(listener);
  }, [value, duration, decimals, animValue]);

  return (
    <Text style={[styles.text, { color: theme.textPrimary }, textStyle]}>
      {prefix}{displayValue}{suffix}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'outfit-bold',
    fontSize: 28,
  },
});
