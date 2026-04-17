import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../configs/FirebaseConfig';
import { Colors } from '../../constants/theme';
import { loadAllTrips } from '../../services/storageService';

export default function Profile() {
  const router = useRouter();
  const user = auth.currentUser;
  const [tripCount, setTripCount] = useState(0);

  useEffect(() => {
    loadAllTrips()
      .then((trips) => setTripCount(trips.length))
      .catch(() => setTripCount(0));
  }, []);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace('/');
          } catch (err) {
            console.error('[Profile] Sign-out error:', err);
          }
        },
      },
    ]);
  };

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??';

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar & email */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.emailText}>{user?.email ?? 'Guest'}</Text>
          <View style={styles.statBadge}>
            <Ionicons name="airplane-outline" size={14} color={Colors.PRIMARY} />
            <Text style={styles.statText}>{tripCount} {tripCount === 1 ? 'trip' : 'trips'} planned</Text>
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menuCard}>
          <MenuItem
            icon="map-outline"
            label="My Trips"
            onPress={() => router.push('/(tabs)/mytrip')}
          />
          <MenuItem
            icon="compass-outline"
            label="Discover"
            onPress={() => router.push('/(tabs)/discover')}
            last
          />
        </View>

        <View style={styles.menuCard}>
          <MenuItem
            icon="information-circle-outline"
            label="About SwiftRoute"
            onPress={() =>
              Alert.alert(
                'SwiftRoute',
                'AI-powered travel planner.\nVersion 1.0.0\n\nBuilt with Expo, Firebase, Groq AI & Mapbox.'
              )
            }
            last
          />
        </View>

        {/* Sign-out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={Colors.ERROR} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function MenuItem({ icon, label, onPress, last }) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, !last && styles.menuItemBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconBox}>
        <Ionicons name={icon} size={20} color={Colors.PRIMARY} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.GRAY} />
    </TouchableOpacity>
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
  scrollContent: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInitials: {
    fontFamily: 'outfit-bold',
    fontSize: 28,
    color: Colors.WHITE,
  },
  emailText: {
    fontFamily: 'outfit-medium',
    fontSize: 16,
    color: Colors.DARK,
    marginBottom: 10,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.PRIMARY + '15',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statText: {
    fontFamily: 'outfit-medium',
    fontSize: 13,
    color: Colors.PRIMARY,
  },
  menuCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.PRIMARY + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontFamily: 'outfit-medium',
    fontSize: 15,
    color: Colors.DARK,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: Colors.ERROR,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  signOutText: {
    fontFamily: 'outfit-bold',
    fontSize: 15,
    color: Colors.ERROR,
  },
});