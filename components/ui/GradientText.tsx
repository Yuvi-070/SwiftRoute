import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TextProps } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { useTheme } from '../../context/ThemeContext';

interface GradientTextProps extends TextProps {
  colors?: readonly [string, string, ...string[]] | [string, string, ...string[]];
}

export default function GradientText({ colors, style, children, ...props }: GradientTextProps) {
  const { theme } = useTheme();
  const activeColors = colors || theme.gradientPrimary;

  return (
    <MaskedView
      maskElement={
        <Text style={[style, { backgroundColor: 'transparent' }]} {...props}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={[...activeColors] as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[style, { opacity: 0 }]} {...props}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}
