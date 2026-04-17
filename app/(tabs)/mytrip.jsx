import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import StartNewTripCard from '../../components/MyTrips/StartNewTripCard';
import { db } from '../../configs/firebaseConfig';
import { Colors } from '../../constants/theme';
import { loadAllTrips } from '../../services/storageService';

export default function MyTrip() {
  const router = useRouter();
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
      // Firestore may not be configured yet – fall back to local AsyncStorage
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

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Trips</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/create-trip')}
        >
          <Ionicons name="add" size={22} color={Colors.WHITE} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Loading your trips…</Text>
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
              tintColor={Colors.PRIMARY}
            />
          }
          renderItem={({ item }) => <TripCard trip={item} />}
        />
      )}
    </View>
  );
}

function TripCard({ trip }) {
  const router = useRouter();
  const itinerary = trip.itinerary;
  const details = trip.tripDetails;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/itinerary/${trip.id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.cardLeft}>
        <View style={styles.cardIconBox}>
          <Ionicons name="airplane" size={28} color={Colors.WHITE} />
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {itinerary?.tripTitle ?? details?.destination ?? 'My Trip'}
        </Text>
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={Colors.PRIMARY} />
            <Text style={styles.metaText} numberOfLines={1}>
              {itinerary?.destination ?? details?.destination}
            </Text>
          </View>
          {details?.totalDays && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={Colors.GRAY} />
              <Text style={styles.metaText}>{details.totalDays} days</Text>
            </View>
          )}
        </View>
        {itinerary?.estimatedTotalCost && (
          <View style={styles.costBadge}>
            <Text style={styles.costText}>{itinerary.estimatedTotalCost}</Text>
          </View>
        )}
        <Text style={styles.cardDate}>
          {trip.createdAt
            ? new Date(trip.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.GRAY} style={styles.cardChevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  headerTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 30,
    color: Colors.DARK,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: 'outfit',
    fontSize: 15,
    color: Colors.GRAY,
  },
  listContent: {
    padding: 20,
    gap: 14,
  },
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    width: 70,
    alignSelf: 'stretch',
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  cardTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 16,
    color: Colors.DARK,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'outfit',
    fontSize: 13,
    color: Colors.GRAY,
  },
  costBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.PRIMARY + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  costText: {
    fontFamily: 'outfit-medium',
    fontSize: 12,
    color: Colors.PRIMARY,
  },
  cardDate: {
    fontFamily: 'outfit',
    fontSize: 11,
    color: Colors.GRAY,
    marginTop: 4,
  },
  cardChevron: {
    marginRight: 14,
  },
});
