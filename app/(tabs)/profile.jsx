import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../configs/firebaseConfig';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing, typography } from '../../constants/theme';
import { loadAllTrips } from '../../services/storageService';
import AnimatedCard from '../../components/ui/AnimatedCard';

export default function Profile() {
  const router = useRouter();
  const { theme, isDark, toggleTheme, preference, setPreference } = useTheme();
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
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={{ flex: 1, width: '100%', maxWidth: 800, alignSelf: 'center' }}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar & email */}
        <AnimatedCard delay={0}>
          <View
            style={[
              styles.avatarSection,
              {
                backgroundColor: theme.surface,
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
            <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <Text style={[styles.emailText, { color: theme.textPrimary }]}>
              {user?.email ?? 'Guest'}
            </Text>
            <View style={[styles.statBadge, { backgroundColor: theme.primaryMuted }]}>
              <Ionicons name="airplane-outline" size={14} color={theme.primary} />
              <Text style={[styles.statText, { color: theme.primary }]}>
                {tripCount} {tripCount === 1 ? 'trip' : 'trips'} planned
              </Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Appearance */}
        <AnimatedCard delay={80}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>APPEARANCE</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.menuItem, styles.menuItemBorder, { borderBottomColor: theme.divider }]}>
              <View style={[styles.menuIconBox, { backgroundColor: theme.primaryMuted }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={theme.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>Dark Mode</Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.primary + '60' }}
                thumbColor={isDark ? theme.primary : '#FFF'}
              />
            </View>
            <ThemeOption
              label="System"
              selected={preference === 'system'}
              onPress={() => setPreference('system')}
              icon="phone-portrait-outline"
            />
          </View>
        </AnimatedCard>

        {/* Navigation */}
        <AnimatedCard delay={160}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>NAVIGATION</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <MenuItem
              icon="map-outline"
              label="My Trips"
              onPress={() => router.push('/(tabs)/mytrip')}
            />
            <MenuItem
              icon="compass-outline"
              label="Discover"
              onPress={() => router.push('/(tabs)/discover')}
            />
            <MenuItem
              icon="analytics-outline"
              label="Travel Insights"
              onPress={() => router.push('/insights')}
            />
            <MenuItem
              icon="swap-horizontal-outline"
              label="Currency Converter"
              onPress={() => router.push('/currency')}
              last
            />
          </View>
        </AnimatedCard>

        {/* About */}
        <AnimatedCard delay={240}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>ABOUT</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <MenuItem
              icon="information-circle-outline"
              label="About SwiftRoute"
              onPress={() =>
                Alert.alert(
                  'SwiftRoute',
                  'AI-powered travel planner.\nVersion 2.0.0\n\nBuilt with Expo, Firebase, Groq AI & Mapbox.'
                )
              }
              last
            />
          </View>
        </AnimatedCard>

        {/* Sign out */}
        <AnimatedCard delay={320}>
          <TouchableOpacity
            style={[styles.signOutBtn, { borderColor: theme.error }]}
            onPress={handleSignOut}
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.error} />
            <Text style={[styles.signOutText, { color: theme.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </AnimatedCard>

        <View style={{ height: 100 }} />
      </ScrollView>
      </View>
    </View>
  );
}

function MenuItem({ icon, label, onPress, last }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        !last && styles.menuItemBorder,
        !last && { borderBottomColor: theme.divider },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconBox, { backgroundColor: theme.primaryMuted }]}>
        <Ionicons name={icon} size={18} color={theme.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
    </TouchableOpacity>
  );
}

function ThemeOption({ label, selected, onPress, icon }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconBox, { backgroundColor: theme.primaryMuted }]}>
        <Ionicons name={icon} size={18} color={theme.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>{label}</Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
      )}
    </TouchableOpacity>
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
  scrollContent: {
    padding: spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    borderRadius: radii.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  avatarInitials: {
    fontFamily: 'outfit-bold',
    fontSize: 28,
    color: '#FFF',
  },
  emailText: {
    ...typography.subtitle,
    marginBottom: spacing.sm + 2,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  statText: {
    fontFamily: 'outfit-medium',
    fontSize: 13,
  },
  sectionLabel: {
    fontFamily: 'outfit-bold',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: 4,
    marginTop: spacing.sm,
  },
  menuCard: {
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    ...typography.label,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm + 2,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    borderWidth: 1.5,
    marginTop: spacing.sm,
  },
  signOutText: {
    ...typography.buttonSmall,
  },
});