import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import StartNewTripCard from '../../components/MyTrips/StartNewTripCard';
import { db } from '../../configs/firebaseConfig';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing, typography } from '../../constants/theme';
import { loadAllTrips, deleteTrip as deleteLocalTrip } from '../../services/storageService';
import AnimatedCard from '../../components/ui/AnimatedCard';
import PressableScale from '../../components/ui/PressableScale';

export default function MyTrip() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrips = useCallback(async () => {
    try {
      const q = query(collection(db, 'trips'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTrips(data);
    } catch (err) {
      console.warn('[MyTrip] Firestore unavailable, loading from local storage:', err);
      try {
        const localTrips = await loadAllTrips();
        setTrips(localTrips);
      } catch (localErr) {
        console.warn('[MyTrip] Local storage also failed:', localErr);
        setTrips([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadTrips();
    }, [loadTrips])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTrips();
  };

  const handleDeleteTrip = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to delete this trip?")) {
        executeDelete(id);
      }
    } else {
      Alert.alert(
        "Delete Trip",
        "Are you sure you want to delete this trip?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => executeDelete(id) }
        ]
      );
    }
  };

  const executeDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'trips', id));
      await deleteLocalTrip(id);
      setTrips((prev) => prev.filter(t => t.id !== id));
    } catch(err) {
      console.warn('[MyTrip] Delete failed:', err);
      alert("Failed to delete trip");
    }
  };

  // Upcoming trip countdown
  const upcomingTrip = trips.find((t) => {
    const startDate = t.tripDetails?.startDate;
    if (!startDate) return false;
    return new Date(startDate) > new Date();
  });

  const daysUntil = upcomingTrip
    ? Math.ceil(
        (new Date(upcomingTrip.tripDetails.startDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={{ flex: 1, width: '100%', maxWidth: 800, alignSelf: 'center' }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>My Trips</Text>
          {trips.length > 0 && (
            <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
              {trips.length} {trips.length === 1 ? 'adventure' : 'adventures'} planned
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/create-trip')}
        >
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Countdown banner */}
      {upcomingTrip && daysUntil !== null && daysUntil > 0 && (
        <AnimatedCard delay={100}>
          <View style={[styles.countdownBanner, { backgroundColor: theme.primaryMuted }]}>
            <View style={[styles.countdownIcon, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="airplane" size={18} color={theme.primary} />
            </View>
            <View style={styles.countdownText}>
              <Text style={[styles.countdownTitle, { color: theme.primary }]}>
                {daysUntil} {daysUntil === 1 ? 'day' : 'days'} to go!
              </Text>
              <Text style={[styles.countdownDest, { color: theme.textSecondary }]} numberOfLines={1}>
                {upcomingTrip.itinerary?.destination || upcomingTrip.tripDetails?.destination}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.primary} />
          </View>
        </AnimatedCard>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading your trips…
          </Text>
        </View>
      ) : trips.length === 0 ? (
        <StartNewTripCard />
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
          renderItem={({ item, index }) => (
            <AnimatedCard delay={index * 80}>
              <TripCard trip={item} onDelete={handleDeleteTrip} />
            </AnimatedCard>
          )}
        />
      )}
      </View>
    </View>
  );
}

function TripCard({ trip, onDelete }) {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const itinerary = trip.itinerary;
  const details = trip.tripDetails;

  return (
    <PressableScale onPress={() => router.push(`/itinerary/${trip.id}`)}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            ...Platform.select({
              ios: {
                shadowColor: theme.shadowColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: theme.shadowOpacity,
                shadowRadius: 12,
              },
              android: { elevation: 3 },
            }),
          },
        ]}
      >
        <View style={[styles.cardLeft, { backgroundColor: theme.primary }]}>
          <View style={styles.cardIconBox}>
            <Ionicons name="airplane" size={24} color="#FFF" />
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]} numberOfLines={1}>
            {itinerary?.tripTitle ?? details?.destination ?? 'My Trip'}
          </Text>
          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={13} color={theme.primary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]} numberOfLines={1}>
                {itinerary?.destination ?? details?.destination}
              </Text>
            </View>
            {details?.totalDays && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color={theme.textTertiary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {details.totalDays} days
                </Text>
              </View>
            )}
          </View>
          {itinerary?.estimatedTotalCost && (
            <View style={[styles.costBadge, { backgroundColor: theme.primaryMuted }]}>
              <Text style={[styles.costText, { color: theme.primary }]}>
                {itinerary.estimatedTotalCost}
              </Text>
            </View>
          )}
          <Text style={[styles.cardDate, { color: theme.textTertiary }]}>
            {trip.createdAt
              ? new Date(trip.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : ''}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.cardDelete} 
          onPress={(e) => {
            if(Platform.OS === 'web') e.stopPropagation();
            onDelete(trip.id);
          }}
        >
          <Ionicons name="trash-outline" size={20} color={theme.error} />
        </TouchableOpacity>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    gap: spacing.md,
  },
  countdownIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    flex: 1,
  },
  countdownTitle: {
    ...typography.subtitle,
  },
  countdownDest: {
    ...typography.bodySmall,
    marginTop: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
  },
  listContent: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: 100,
  },
  card: {
    borderRadius: radii.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardLeft: {
    width: 70,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
    padding: spacing.md + 2,
    gap: 4,
  },
  cardTitle: {
    ...typography.subtitle,
    fontFamily: 'outfit-bold',
  },
  cardMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.bodySmall,
  },
  costBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  costText: {
    fontFamily: 'outfit-medium',
    fontSize: 12,
  },
  cardDate: {
    ...typography.caption,
    marginTop: 4,
  },
  cardDelete: {
    padding: spacing.md,
  },
});
