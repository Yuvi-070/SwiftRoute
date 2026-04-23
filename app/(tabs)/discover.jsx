import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing, typography } from '../../constants/theme';
import AnimatedCard from '../../components/ui/AnimatedCard';
import PressableScale from '../../components/ui/PressableScale';

const TRENDING = [
  { emoji: '🗼', name: 'Paris', country: 'France', tag: 'Romance', gradient: ['#6366F1', '#8B5CF6'] },
  { emoji: '🏯', name: 'Kyoto', country: 'Japan', tag: 'Culture', gradient: ['#F43F5E', '#FB7185'] },
  { emoji: '🏖️', name: 'Bali', country: 'Indonesia', tag: 'Beach', gradient: ['#14B8A6', '#2DD4BF'] },
  { emoji: '🌉', name: 'New York', country: 'USA', tag: 'City', gradient: ['#F59E0B', '#FBBF24'] },
  { emoji: '🏔️', name: 'Queenstown', country: 'New Zealand', tag: 'Adventure', gradient: ['#10B981', '#34D399'] },
  { emoji: '🕌', name: 'Istanbul', country: 'Turkey', tag: 'History', gradient: ['#8B5CF6', '#A78BFA'] },
];

const CATEGORIES = [
  { icon: 'sunny-outline', label: 'Beach', color: '#14B8A6' },
  { icon: 'snow-outline', label: 'Winter', color: '#6366F1' },
  { icon: 'restaurant-outline', label: 'Food', color: '#F43F5E' },
  { icon: 'walk-outline', label: 'Adventure', color: '#F59E0B' },
  { icon: 'camera-outline', label: 'Culture', color: '#8B5CF6' },
  { icon: 'heart-outline', label: 'Romance', color: '#FB7185' },
];

const TRAVEL_TIPS = [
  { icon: 'shield-checkmark-outline', title: 'Book early, save more', body: 'Flights booked 6–8 weeks out are typically 20–30% cheaper.' },
  { icon: 'cloudy-outline', title: 'Pack a light layer', body: 'Even tropical destinations can have cold evenings or AC-heavy hotels.' },
  { icon: 'card-outline', title: 'Notify your bank', body: 'Avoid blocked transactions abroad by informing your bank before departure.' },
  { icon: 'wifi-outline', title: 'Get an e-SIM', body: 'Affordable data in 180+ countries without swapping physical SIM cards.' },
  { icon: 'camera-outline', title: 'Shoot in golden hour', body: 'The hour after sunrise and before sunset gives magical travel photos.' },
  { icon: 'nutrition-outline', title: 'Eat where locals eat', body: 'Street food and neighbourhood restaurants beat tourist traps every time.' },
];

export default function Discover() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={{ flex: 1, width: '100%', maxWidth: 1000, alignSelf: 'center' }}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Discover</Text>
        <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
          Inspiration for your next adventure
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CTA Card */}
        <AnimatedCard delay={0}>
          <PressableScale onPress={() => router.push('/create-trip')}>
            <View style={[styles.ctaCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, borderWidth: 1 }]}>
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  { backgroundColor: theme.primary, opacity: 0.15, borderRadius: radii.xl },
                ]}
              />
              <View style={styles.ctaTextCol}>
                <Text style={[styles.ctaTitle, { color: theme.textPrimary }]}>Plan a new trip ✨</Text>
                <Text style={[styles.ctaBody, { color: theme.textSecondary }]}>
                  Let our AI build a personalised itinerary in seconds.
                </Text>
              </View>
              <View style={[styles.ctaArrow, { backgroundColor: theme.primary }]}>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </View>
            </View>
          </PressableScale>
        </AnimatedCard>

        {/* Category chips */}
        <AnimatedCard delay={80}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {CATEGORIES.map((cat) => (
              <PressableScale
                key={cat.label}
                onPress={() => router.push('/create-trip')}
              >
                <View
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isDark
                        ? cat.color + '18'
                        : cat.color + '12',
                      borderColor: isDark ? cat.color + '30' : cat.color + '20',
                    },
                  ]}
                >
                  <Ionicons name={cat.icon} size={18} color={cat.color} />
                  <Text style={[styles.categoryLabel, { color: cat.color }]}>
                    {cat.label}
                  </Text>
                </View>
              </PressableScale>
            ))}
          </ScrollView>
        </AnimatedCard>

        {/* Trending destinations */}
        <AnimatedCard delay={160}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            🔥 Trending Destinations
          </Text>
        </AnimatedCard>
        <View style={styles.grid}>
          {TRENDING.map((dest, i) => (
            <AnimatedCard key={dest.name} delay={200 + i * 60}>
              <PressableScale onPress={() => router.push('/create-trip')}>
                <View
                  style={[
                    styles.destCard,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.border,
                      ...Platform.select({
                        ios: {
                          shadowColor: theme.shadowColor,
                          shadowOffset: { width: 0, height: 3 },
                          shadowOpacity: theme.shadowOpacity,
                          shadowRadius: 10,
                        },
                        android: { elevation: 2 },
                      }),
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.destEmojiBox,
                      { backgroundColor: dest.gradient[0] + '15' },
                    ]}
                  >
                    <Text style={styles.destEmoji}>{dest.emoji}</Text>
                  </View>
                  <Text style={[styles.destName, { color: theme.textPrimary }]}>
                    {dest.name}
                  </Text>
                  <Text style={[styles.destCountry, { color: theme.textSecondary }]}>
                    {dest.country}
                  </Text>
                  <View
                    style={[
                      styles.destTag,
                      { backgroundColor: dest.gradient[0] + '15' },
                    ]}
                  >
                    <Text style={[styles.destTagText, { color: dest.gradient[0] }]}>
                      {dest.tag}
                    </Text>
                  </View>
                </View>
              </PressableScale>
            </AnimatedCard>
          ))}
        </View>

        {/* Travel tips */}
        <AnimatedCard delay={500}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            💡 Smart Travel Tips
          </Text>
        </AnimatedCard>
        {TRAVEL_TIPS.map((tip, i) => (
          <AnimatedCard key={tip.title} delay={540 + i * 60}>
            <View
              style={[
                styles.tipCard,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                  ...Platform.select({
                    ios: {
                      shadowColor: theme.shadowColor,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: theme.shadowOpacity * 0.6,
                      shadowRadius: 6,
                    },
                    android: { elevation: 1 },
                  }),
                },
              ]}
            >
              <View style={[styles.tipIconBox, { backgroundColor: theme.primaryMuted }]}>
                <Ionicons name={tip.icon} size={20} color={theme.primary} />
              </View>
              <View style={styles.tipTextCol}>
                <Text style={[styles.tipTitle, { color: theme.textPrimary }]}>
                  {tip.title}
                </Text>
                <Text style={[styles.tipBody, { color: theme.textSecondary }]}>
                  {tip.body}
                </Text>
              </View>
            </View>
          </AnimatedCard>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: 60,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...typography.h1,
  },
  headerSub: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  ctaCard: {
    borderRadius: radii.xl,
    padding: spacing.xl + 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  ctaTextCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  ctaTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 19,
    color: '#FFF',
    marginBottom: 4,
  },
  ctaBody: {
    fontFamily: 'outfit',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 19,
  },
  ctaArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryRow: {
    gap: spacing.sm + 2,
    paddingBottom: spacing.lg,
    marginBottom: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  categoryLabel: {
    fontFamily: 'outfit-medium',
    fontSize: 13,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  destCard: {
    width: Platform.OS === 'web' ? '31%' : '100%',
    minWidth: 280,
    flexGrow: 1,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  destEmojiBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  destEmoji: {
    fontSize: 28,
  },
  destName: {
    ...typography.subtitle,
    fontFamily: 'outfit-bold',
  },
  destCountry: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  destTag: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  destTagText: {
    fontFamily: 'outfit-medium',
    fontSize: 11,
  },
  tipCard: {
    flexDirection: 'row',
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  tipIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  tipTextCol: {
    flex: 1,
  },
  tipTitle: {
    ...typography.label,
    fontFamily: 'outfit-bold',
    marginBottom: 3,
  },
  tipBody: {
    ...typography.bodySmall,
  },
});