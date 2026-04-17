import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';

export default function StartNewTripCard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="airplane-outline" size={48} color={Colors.PRIMARY} />
      </View>

      <Text style={styles.title}>No Trips Planned Yet</Text>

      <Text style={styles.subtitle}>
        Looks like it{"'"}s time to plan a new adventure! Let our AI build a personalised itinerary for you.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/create-trip')}
        activeOpacity={0.85}
      >
        <Ionicons name="add-circle-outline" size={20} color={Colors.WHITE} />
        <Text style={styles.buttonText}>Start Planning</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.PRIMARY + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'outfit-bold',
    fontSize: 24,
    color: Colors.DARK,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'outfit',
    fontSize: 15,
    color: Colors.GRAY,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontFamily: 'outfit-bold',
    fontSize: 17,
    color: Colors.WHITE,
  },
});
