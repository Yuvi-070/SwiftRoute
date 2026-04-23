import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing, typography } from '../../constants/theme';
import { computeInsights, type TripInsights } from '../../services/insightsService';
import AnimatedCard from '../../components/ui/AnimatedCard';
import AnimatedCounter from '../../components/ui/AnimatedCounter';

export default function InsightsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { theme } = useTheme();

  const [insights, setInsights] = useState<TripInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      try {
        const data = await computeInsights();
        setInsights(data);
      } catch (err) {
        console.error('Failed to compute insights:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.hero, { backgroundColor: theme.primary }]}>
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.accent, opacity: 0.35 }]}
        />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>📊 Travel Insights</Text>
        <Text style={styles.heroSubtitle}>Your journey at a glance</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Crunching your travel data…
          </Text>
        </View>
      ) : !insights || insights.totalTrips === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="analytics-outline" size={48} color={theme.textTertiary} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No trips yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Create some trips to see your travel insights here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <AnimatedCard delay={0}>
              <StatCard
                icon="airplane-outline"
                label="Total Trips"
                value={insights.totalTrips}
                color={theme.primary}
              />
            </AnimatedCard>
            <AnimatedCard delay={60}>
              <StatCard
                icon="calendar-outline"
                label="Days Traveled"
                value={insights.totalDays}
                color="#14B8A6"
              />
            </AnimatedCard>
            <AnimatedCard delay={120}>
              <StatCard
                icon="location-outline"
                label="Cities Visited"
                value={insights.totalCitiesVisited.length}
                color="#F59E0B"
              />
            </AnimatedCard>
            <AnimatedCard delay={180}>
              <StatCard
                icon="cash-outline"
                label="Total Spent"
                value={insights.totalExpenses}
                prefix="$"
                color="#F43F5E"
              />
            </AnimatedCard>
          </View>

          {/* Averages */}
          <AnimatedCard delay={240}>
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                📈 Averages
              </Text>
              <View style={styles.avgRow}>
                <View style={styles.avgItem}>
                  <Text style={[styles.avgValue, { color: theme.primary }]}>
                    {insights.averageTripDuration}
                  </Text>
                  <Text style={[styles.avgLabel, { color: theme.textSecondary }]}>
                    days / trip
                  </Text>
                </View>
                <View style={[styles.avgDivider, { backgroundColor: theme.divider }]} />
                <View style={styles.avgItem}>
                  <Text style={[styles.avgValue, { color: theme.primary }]}>
                    ${insights.averageTripCost}
                  </Text>
                  <Text style={[styles.avgLabel, { color: theme.textSecondary }]}>
                    spent / trip
                  </Text>
                </View>
              </View>
            </View>
          </AnimatedCard>

          {/* Cities list */}
          {insights.totalCitiesVisited.length > 0 && (
            <AnimatedCard delay={300}>
              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                  🌍 Cities Explored
                </Text>
                <View style={styles.citiesWrap}>
                  {insights.totalCitiesVisited.map((city) => (
                    <View
                      key={city}
                      style={[styles.cityChip, { backgroundColor: theme.primaryMuted }]}
                    >
                      <Ionicons name="location" size={12} color={theme.primary} />
                      <Text style={[styles.cityChipText, { color: theme.primary }]}>
                        {city}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </AnimatedCard>
          )}

          {/* Expense breakdown */}
          {Object.keys(insights.expensesByCategory).length > 0 && (
            <AnimatedCard delay={360}>
              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                  💰 Spending Breakdown
                </Text>
                {Object.entries(insights.expensesByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const pct =
                      insights.totalExpenses > 0
                        ? (amount / insights.totalExpenses) * 100
                        : 0;
                    return (
                      <View key={category} style={styles.breakdownRow}>
                        <Text style={[styles.breakdownLabel, { color: theme.textPrimary }]}>
                          {category}
                        </Text>
                        <View
                          style={[
                            styles.breakdownBarBg,
                            { backgroundColor: theme.divider },
                          ]}
                        >
                          <View
                            style={[
                              styles.breakdownBarFill,
                              {
                                width: `${pct}%`,
                                backgroundColor: theme.primary,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.breakdownValue, { color: theme.textSecondary }]}>
                          ${amount.toFixed(0)}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            </AnimatedCard>
          )}

          {/* Favorite category */}
          <AnimatedCard delay={420}>
            <View
              style={[
                styles.card,
                { backgroundColor: theme.primaryMuted, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.favoriteLabel, { color: theme.primary }]}>
                ⭐ Your Favorite Travel Style
              </Text>
              <Text style={[styles.favoriteValue, { color: theme.primary }]}>
                {insights.mostVisitedCategory}
              </Text>
            </View>
          </AnimatedCard>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  prefix = '',
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  prefix?: string;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          ...Platform.select({
            ios: {
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme.shadowOpacity,
              shadowRadius: 6,
            },
            android: { elevation: 1 },
          }),
        },
      ]}
    >
      <View style={[styles.statIconBox, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.textPrimary }]}>
        {prefix}
        <AnimatedCounter value={value} />
      </Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    paddingTop: 56,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing['2xl'],
    overflow: 'hidden',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  heroTitle: { fontFamily: 'outfit-bold', fontSize: 26, color: '#FFF' },
  heroSubtitle: {
    fontFamily: 'outfit', fontSize: 14,
    color: 'rgba(255,255,255,0.8)', marginTop: 4,
  },
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: spacing['3xl'], gap: spacing.md,
  },
  loadingText: { ...typography.body },
  emptyTitle: { ...typography.h2, textAlign: 'center' },
  emptySubtext: { ...typography.body, textAlign: 'center' },
  scrollContent: { padding: spacing.xl },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '47%',
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  statIconBox: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  statValue: { fontFamily: 'outfit-bold', fontSize: 24 },
  statLabel: { ...typography.caption, textAlign: 'center' },
  card: {
    borderRadius: radii.lg,
    padding: spacing.lg + 2,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  cardTitle: { ...typography.subtitle, fontFamily: 'outfit-bold', marginBottom: spacing.md },
  avgRow: { flexDirection: 'row', alignItems: 'center' },
  avgItem: { flex: 1, alignItems: 'center' },
  avgValue: { fontFamily: 'outfit-bold', fontSize: 28 },
  avgLabel: { ...typography.bodySmall, marginTop: 2 },
  avgDivider: { width: 1, height: 40, alignSelf: 'center' },
  citiesWrap: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
  },
  cityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: radii.full,
  },
  cityChipText: { fontFamily: 'outfit-medium', fontSize: 13 },
  breakdownRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm + 2,
  },
  breakdownLabel: { fontFamily: 'outfit-medium', fontSize: 13, width: 100 },
  breakdownBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  breakdownBarFill: { height: 8, borderRadius: 4 },
  breakdownValue: { fontFamily: 'outfit-bold', fontSize: 13, width: 50, textAlign: 'right' },
  favoriteLabel: { fontFamily: 'outfit-medium', fontSize: 14, marginBottom: spacing.sm },
  favoriteValue: { fontFamily: 'outfit-bold', fontSize: 32 },
});
