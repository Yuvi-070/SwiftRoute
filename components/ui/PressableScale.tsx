import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  type ViewStyle,
} from 'react-native';

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  scale?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

/**
 * Wrapper that adds a micro-animation scale-down effect on press.
 * Use instead of TouchableOpacity for premium-feeling interactions.
 */
export default function PressableScale({
  children,
  onPress,
  scale = 0.97,
  style,
  disabled,
}: PressableScaleProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: scale,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
