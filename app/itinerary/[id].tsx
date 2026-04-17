import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../configs/firebaseConfig';
import { Colors } from '../../constants/theme';
import type { DayItinerary, GeneratedItinerary } from '../../services/aiService';

const TIME_COLORS: Record<string, string> = {
  Morning: '#F5A623',
  Afternoon: Colors.PRIMARY,
  Evening: '#6366F1',
};

const TIME_ICONS: Record<string, string> = {
  Morning: 'sunny-outline',
  Afternoon: 'partly-sunny-outline',
  Evening: 'moon-outline',
};

export default function ItineraryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();

  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number>(1);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const docRef = doc(db, 'trips', id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          setError('Trip not found.');
          return;
        }
        const data = snap.data();
        setItinerary(data.itinerary as GeneratedItinerary);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load itinerary.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={styles.loadingText}>Loading your trip…</Text>
      </View>
    );
  }

  if (error || !itinerary) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.ERROR} />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMsg}>{error ?? 'Unknown error'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Hero header */}
      <View style={styles.hero}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)/mytrip' as never)}>
          <Ionicons name="arrow-back" size={22} color={Colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.heroTitle} numberOfLines={2}>
          {itinerary.tripTitle}
        </Text>
        <View style={styles.heroBadgeRow}>
          <View style={styles.heroBadge}>
            <Ionicons name="location" size={13} color={Colors.WHITE} />
            <Text style={styles.heroBadgeText}>{itinerary.destination}</Text>
          </View>
          <View style={styles.heroBadge}>
            <Ionicons name="time-outline" size={13} color={Colors.WHITE} />
            <Text style={styles.heroBadgeText}>{itinerary.duration} days</Text>
          </View>
          <View style={styles.heroBadge}>
            <Ionicons name="cash-outline" size={13} color={Colors.WHITE} />
            <Text style={styles.heroBadgeText}>{itinerary.estimatedTotalCost}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{itinerary.summary}</Text>
        </View>

        {/* Day-by-day */}
        <Text style={styles.sectionTitle}>📅 Day-by-Day Itinerary</Text>
        {itinerary.itinerary.map((day: DayItinerary) => (
          <DayCard
            key={day.day}
            day={day}
            expanded={expandedDay === day.day}
            onToggle={() => setExpandedDay(expandedDay === day.day ? -1 : day.day)}
          />
        ))}

        {/* Packing tips */}
        {itinerary.packingTips?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🎒 Packing Tips</Text>
            <View style={styles.tipsCard}>
              {itinerary.packingTips.map((tip: string, i: number) => (
                <View key={i} style={[styles.tipRow, i < itinerary.packingTips.length - 1 && styles.tipRowBorder]}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.SUCCESS} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Travel tips */}
        {itinerary.travelTips?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>💡 Travel Tips</Text>
            <View style={styles.tipsCard}>
              {itinerary.travelTips.map((tip: string, i: number) => (
                <View key={i} style={[styles.tipRow, i < itinerary.travelTips.length - 1 && styles.tipRowBorder]}>
                  <Ionicons name="bulb-outline" size={16} color={Colors.SECONDARY} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── DayCard ─────────────────────────────────────────────────────────────────

function DayCard({
  day,
  expanded,
  onToggle,
}: {
  day: DayItinerary;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={dayStyles.card}>
      <TouchableOpacity style={dayStyles.header} onPress={onToggle} activeOpacity={0.8}>
        <View style={dayStyles.dayBadge}>
          <Text style={dayStyles.dayNumber}>Day {day.day}</Text>
        </View>
        <Text style={dayStyles.theme} numberOfLines={1}>
          {day.theme}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.GRAY}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={dayStyles.body}>
          {day.activities.map((act, i) => {
            const color = TIME_COLORS[act.time] ?? Colors.PRIMARY;
            const icon = TIME_ICONS[act.time] ?? 'time-outline';
            return (
              <View key={i} style={dayStyles.activityRow}>
                {/* Timeline line */}
                <View style={dayStyles.timelineCol}>
                  <View style={[dayStyles.timelineDot, { backgroundColor: color }]}>
                    <Ionicons name={icon as never} size={12} color={Colors.WHITE} />
                  </View>
                  {i < day.activities.length - 1 && (
                    <View style={[dayStyles.timelineLine, { backgroundColor: color + '40' }]} />
                  )}
                </View>

                {/* Content */}
                <View style={dayStyles.activityContent}>
                  <View style={dayStyles.activityHeader}>
                    <Text style={[dayStyles.activityTime, { color }]}>{act.time}</Text>
                    <View style={[dayStyles.costBadge, { backgroundColor: color + '15' }]}>
                      <Text style={[dayStyles.costText, { color }]}>{act.estimatedCost}</Text>
                    </View>
                  </View>
                  <Text style={dayStyles.activityName}>{act.activity}</Text>
                  <View style={dayStyles.locationRow}>
                    <Ionicons name="location-outline" size={13} color={Colors.GRAY} />
                    <Text style={dayStyles.locationText}>{act.location}</Text>
                  </View>
                  <Text style={dayStyles.activityDesc}>{act.description}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const dayStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  dayBadge: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dayNumber: {
    fontFamily: 'outfit-bold',
    fontSize: 13,
    color: Colors.WHITE,
  },
  theme: {
    flex: 1,
    fontFamily: 'outfit-medium',
    fontSize: 15,
    color: Colors.DARK,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.LIGHT_GRAY,
    paddingTop: 12,
    gap: 0,
  },
  activityRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  timelineCol: {
    alignItems: 'center',
    width: 28,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    marginTop: 4,
  },
  activityContent: {
    flex: 1,
    paddingBottom: 16,
    gap: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityTime: {
    fontFamily: 'outfit-bold',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  costBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  costText: {
    fontFamily: 'outfit-medium',
    fontSize: 12,
  },
  activityName: {
    fontFamily: 'outfit-bold',
    fontSize: 15,
    color: Colors.DARK,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontFamily: 'outfit',
    fontSize: 13,
    color: Colors.GRAY,
  },
  activityDesc: {
    fontFamily: 'outfit',
    fontSize: 13,
    color: Colors.GRAY,
    lineHeight: 18,
    marginTop: 2,
  },
});

// ─── Main styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
    backgroundColor: Colors.BACKGROUND,
  },
  loadingText: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: Colors.GRAY,
    marginTop: 8,
  },
  errorTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 20,
    color: Colors.DARK,
    textAlign: 'center',
  },
  errorMsg: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: Colors.GRAY,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 8,
  },
  retryBtnText: {
    fontFamily: 'outfit-bold',
    fontSize: 15,
    color: Colors.WHITE,
  },
  hero: {
    backgroundColor: Colors.PRIMARY,
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 26,
    color: Colors.WHITE,
    marginBottom: 12,
    lineHeight: 32,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontFamily: 'outfit-medium',
    fontSize: 12,
    color: Colors.WHITE,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  summaryText: {
    fontFamily: 'outfit',
    fontSize: 15,
    color: Colors.DARK,
    lineHeight: 22,
  },
  sectionTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 18,
    color: Colors.DARK,
    marginBottom: 12,
    marginTop: 4,
  },
  tipsCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
  },
  tipRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  tipText: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: Colors.DARK,
    flex: 1,
    lineHeight: 20,
  },
});
