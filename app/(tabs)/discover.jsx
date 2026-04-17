import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/theme';

const TRENDING = [
  { emoji: '🗼', name: 'Paris', country: 'France', tag: 'Romance' },
  { emoji: '🏯', name: 'Kyoto', country: 'Japan', tag: 'Culture' },
  { emoji: '🏖️', name: 'Bali', country: 'Indonesia', tag: 'Beach' },
  { emoji: '🌉', name: 'New York', country: 'USA', tag: 'City' },
  { emoji: '🏔️', name: 'Queenstown', country: 'New Zealand', tag: 'Adventure' },
  { emoji: '🕌', name: 'Istanbul', country: 'Turkey', tag: 'History' },
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

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSub}>Inspiration for your next adventure</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Start planning CTA */}
        <TouchableOpacity
          style={styles.ctaCard}
          activeOpacity={0.88}
          onPress={() => router.push('/create-trip')}
        >
          <View style={styles.ctaTextCol}>
            <Text style={styles.ctaTitle}>Plan a new trip ✨</Text>
            <Text style={styles.ctaBody}>Let our AI build a personalised itinerary in seconds.</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={36} color={Colors.WHITE} />
        </TouchableOpacity>

        {/* Trending destinations */}
        <Text style={styles.sectionTitle}>🔥 Trending Destinations</Text>
        <View style={styles.grid}>
          {TRENDING.map((dest) => (
            <TouchableOpacity
              key={dest.name}
              style={styles.destCard}
              activeOpacity={0.82}
              onPress={() => router.push('/create-trip')}
            >
              <Text style={styles.destEmoji}>{dest.emoji}</Text>
              <Text style={styles.destName}>{dest.name}</Text>
              <Text style={styles.destCountry}>{dest.country}</Text>
              <View style={styles.destTag}>
                <Text style={styles.destTagText}>{dest.tag}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Travel tips */}
        <Text style={styles.sectionTitle}>💡 Smart Travel Tips</Text>
        {TRAVEL_TIPS.map((tip) => (
          <View key={tip.title} style={styles.tipCard}>
            <View style={styles.tipIconBox}>
              <Ionicons name={tip.icon} size={22} color={Colors.PRIMARY} />
            </View>
            <View style={styles.tipTextCol}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipBody}>{tip.body}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
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
  headerSub: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: Colors.GRAY,
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
  },
  ctaCard: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 20,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaTextCol: {
    flex: 1,
    marginRight: 12,
  },
  ctaTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 18,
    color: Colors.WHITE,
    marginBottom: 4,
  },
  ctaBody: {
    fontFamily: 'outfit',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  sectionTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 20,
    color: Colors.DARK,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  destCard: {
    width: '47%',
    backgroundColor: Colors.WHITE,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  destEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  destName: {
    fontFamily: 'outfit-bold',
    fontSize: 15,
    color: Colors.DARK,
  },
  destCountry: {
    fontFamily: 'outfit',
    fontSize: 12,
    color: Colors.GRAY,
    marginBottom: 8,
  },
  destTag: {
    backgroundColor: Colors.PRIMARY + '18',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  destTagText: {
    fontFamily: 'outfit-medium',
    fontSize: 11,
    color: Colors.PRIMARY,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tipIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.PRIMARY + '15',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  tipTextCol: {
    flex: 1,
  },
  tipTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 14,
    color: Colors.DARK,
    marginBottom: 3,
  },
  tipBody: {
    fontFamily: 'outfit',
    fontSize: 13,
    color: Colors.GRAY,
    lineHeight: 18,
  },
});