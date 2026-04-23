import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing, typography } from '../../constants/theme';
import PressableScale from '../ui/PressableScale';
import AnimatedCard from '../ui/AnimatedCard';

export default function StartNewTripCard() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <AnimatedCard delay={0}>
        <View style={[styles.illustrationBox, { backgroundColor: theme.primaryMuted }]}>
          <Ionicons name="airplane" size={64} color={theme.primary} />
        </View>
      </AnimatedCard>

      <AnimatedCard delay={100}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          No trips yet
        </Text>
      </AnimatedCard>

      <AnimatedCard delay={200}>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Start planning your dream vacation with our AI travel assistant.
        </Text>
      </AnimatedCard>

      <AnimatedCard delay={300}>
        <PressableScale onPress={() => router.push('/create-trip')}>
          <View style={[styles.button, { backgroundColor: theme.primary }]}>
            <Ionicons name="add-circle-outline" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Create Your First Trip</Text>
          </View>
        </PressableScale>
      </AnimatedCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
    gap: spacing.md,
  },
  illustrationBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['3xl'],
    borderRadius: radii.full,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  buttonText: {
    ...typography.button,
    color: '#FFF',
  },
});
