import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing, typography } from '../../constants/theme';
import { loadTrip, loadWeather } from '../../services/storageService';
import { fetchWeatherForecast, type DailyWeather, type WeatherForecast } from '../../services/weatherService';
import AnimatedCard from '../../components/ui/AnimatedCard';

const WEATHER_ICONS: Record<string, string> = {
  Clear: 'sunny',
  'Partly Cloudy': 'partly-sunny',
  Cloudy: 'cloud',
  Overcast: 'cloud',
  Rain: 'rainy',
  'Light Rain': 'rainy-outline',
  'Heavy Rain': 'thunderstorm',
  Snow: 'snow',
  Thunderstorm: 'thunderstorm',
  Fog: 'water-outline',
  Drizzle: 'rainy-outline',
};

const WEATHER_COLORS: Record<string, string> = {
  Clear: '#F59E0B',
  'Partly Cloudy': '#6366F1',
  Cloudy: '#6B7280',
  Overcast: '#4B5563',
  Rain: '#3B82F6',
  'Light Rain': '#60A5FA',
  'Heavy Rain': '#2563EB',
  Snow: '#93C5FD',
  Thunderstorm: '#7C3AED',
  Fog: '#9CA3AF',
  Drizzle: '#60A5FA',
};

export default function WeatherScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { theme } = useTheme();

  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [destination, setDestination] = useState('');

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        // Try cached weather first
        const cached = await loadWeather(id);
        if (cached) {
          setWeather(cached);
          setLoading(false);
        }
        // Get destination for title
        const trip = await loadTrip(id);
        if (trip) {
          const dest = trip.itinerary?.destination ?? trip.tripDetails?.destination ?? '';
          setDestination(typeof dest === 'string' ? dest : '');
        }
        // Try fresh fetch if we have trip data
        if (trip?.tripDetails?.destination) {
          try {
            const destStr = typeof trip.tripDetails.destination === 'string'
              ? trip.tripDetails.destination
              : '';
            const today = new Date();
            const sdStr = today.toISOString().split('T')[0];
            const nextWeek = new Date(today.getTime() + 7 * 86400000);
            const edStr = nextWeek.toISOString().split('T')[0];
            const fresh = await fetchWeatherForecast(destStr, sdStr, edStr);
            setWeather(fresh);
          } catch { /* use cached */ }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load weather.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading weather data…
        </Text>
      </View>
    );
  }

  if (error || !weather || weather.daily.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Ionicons name="cloud-offline-outline" size={48} color={theme.textTertiary} />
        <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
          No weather data available
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
          {error ?? 'Weather data could not be fetched for this trip.'}
        </Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.retryBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const today = weather.daily[0];
  const upcomingDays = weather.daily.slice(1);
  const weekMin = Math.min(...weather.daily.map(d => d.minTempC));
  const weekMax = Math.max(...weather.daily.map(d => d.maxTempC));

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
        <Text style={styles.heroTitle}>🌤️ Weather Forecast</Text>
        {destination ? (
          <Text style={styles.heroSubtitle}>{destination}</Text>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today card */}
        <AnimatedCard delay={0}>
          <TodayCard day={today} />
        </AnimatedCard>

        {/* Forecast */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          📅 Upcoming Days
        </Text>
        {upcomingDays.map((day, i) => (
          <AnimatedCard key={day.date} delay={100 + i * 50}>
            <DayRow day={day} weekMin={weekMin} weekMax={weekMax} />
          </AnimatedCard>
        ))}

        {/* Packing tip */}
        <AnimatedCard delay={400}>
          <View style={[styles.tipCard, { backgroundColor: theme.primaryMuted }]}>
            <Ionicons name="shirt-outline" size={20} color={theme.primary} />
            <Text style={[styles.tipText, { color: theme.primary }]}>
              {getWeatherTip(weather.daily)}
            </Text>
          </View>
        </AnimatedCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function TodayCard({ day }: { day: DailyWeather }) {
  const { theme } = useTheme();
  const iconName = WEATHER_ICONS[day.description] ?? 'cloud-outline';
  const color = WEATHER_COLORS[day.description] ?? theme.primary;

  return (
    <View
      style={[
        styles.todayCard,
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
      <Text style={[styles.todayLabel, { color: theme.textSecondary }]}>TODAY</Text>
      <View style={styles.todayRow}>
        <View style={[styles.todayIconBox, { backgroundColor: color + '18' }]}>
          <Ionicons name={iconName as any} size={40} color={color} />
        </View>
        <View style={styles.todayInfo}>
          <Text style={[styles.todayTemp, { color: theme.textPrimary }]}>
            {day.maxTempC}°C
          </Text>
          <Text style={[styles.todayDesc, { color: theme.textSecondary }]}>
            {day.description}
          </Text>
          <Text style={[styles.todayRange, { color: theme.textTertiary }]}>
            Low: {day.minTempC}°C  ·  {day.description}
          </Text>
        </View>
      </View>
      <View style={[styles.todayDetails, { borderTopColor: theme.divider }]}>
        <DetailChip icon="water-outline" label="Precip" value={`${day.precipitationMm ?? 0} mm`} />
        <DetailChip icon="thermometer-outline" label="Feels" value={`${day.maxTempC}°`} />
        <DetailChip icon="umbrella-outline" label="Rain" value={day.isRainy ? 'Yes' : 'No'} />
      </View>
    </View>
  );
}

function DetailChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.detailChip}>
      <Ionicons name={icon as any} size={16} color={theme.textTertiary} />
      <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

function DayRow({ day, weekMin, weekMax }: { day: DailyWeather; weekMin: number; weekMax: number }) {
  const { theme } = useTheme();
  const iconName = WEATHER_ICONS[day.description] ?? 'cloud-outline';
  const color = WEATHER_COLORS[day.description] ?? theme.primary;

  const dateStr = new Date(day.date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
  });

  // Calculate graphical bar dimensions
  const range = weekMax - weekMin || 1; // avoid div by 0
  const leftPercent = ((day.minTempC - weekMin) / range) * 100;
  const widthPercent = ((day.maxTempC - day.minTempC) / range) * 100;
  
  // Gradient colors based on temp
  const getGradient = (min: number, max: number) => {
    if (max <= 5) return ['#93C5FD', '#3B82F6']; // very cold
    if (min >= 25) return ['#F59E0B', '#EF4444']; // hot
    return ['#60A5FA', '#F59E0B']; // mild transition
  };

  return (
    <View style={[styles.dayRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.dayDate, { color: theme.textPrimary }]}>{dateStr}</Text>
      
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 28, alignItems: 'center' }}>
          <Ionicons name={iconName as any} size={20} color={color} />
        </View>
        
        <Text style={[styles.dayTempLow, { color: theme.textTertiary, width: 24, textAlign: 'right' }]}>
          {day.minTempC}°
        </Text>

        {/* Graphical Temperature Bar */}
        <View style={{ flex: 1, height: 6, backgroundColor: theme.divider, borderRadius: 3, overflow: 'hidden' }}>
          <LinearGradient
            colors={getGradient(day.minTempC, day.maxTempC)}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{
              position: 'absolute',
              left: `${leftPercent}%`,
              width: `${Math.max(widthPercent, 5)}%`,
              height: '100%',
              borderRadius: 3,
            }}
          />
        </View>

        <Text style={[styles.dayTemp, { color: theme.textPrimary, width: 24, textAlign: 'left' }]}>
          {day.maxTempC}°
        </Text>
      </View>
    </View>
  );
}

function getWeatherTip(days: DailyWeather[]): string {
  const hasRain = days.some((d) =>
    d.description.toLowerCase().includes('rain') ||
    d.description.toLowerCase().includes('drizzle')
  );
  const hasCold = days.some((d) => d.minTempC < 10);
  const hasHot = days.some((d) => d.maxTempC > 32);

  if (hasRain && hasCold) return 'Pack a waterproof jacket and warm layers!';
  if (hasRain) return 'Don\'t forget an umbrella or rain jacket!';
  if (hasCold) return 'Bring warm layers — some days will be chilly.';
  if (hasHot) return 'Stay hydrated! Bring sunscreen and light clothes.';
  return 'Looks like pleasant weather — pack comfortably!';
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: spacing['3xl'], gap: spacing.md,
  },
  loadingText: { ...typography.body },
  emptyTitle: { ...typography.h2, textAlign: 'center' },
  emptySubtext: { ...typography.body, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    paddingVertical: spacing.md, paddingHorizontal: spacing['2xl'],
    borderRadius: radii.md, marginTop: spacing.sm,
  },
  retryBtnText: { ...typography.buttonSmall, color: '#FFF' },
  hero: {
    paddingTop: 56, paddingBottom: spacing.xl,
    paddingHorizontal: spacing['2xl'], overflow: 'hidden',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  heroTitle: { fontFamily: 'outfit-bold', fontSize: 26, color: '#FFF' },
  heroSubtitle: { fontFamily: 'outfit', fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  scrollContent: { padding: spacing.xl },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md, marginTop: spacing.lg },
  todayCard: {
    borderRadius: radii.xl, padding: spacing.xl, borderWidth: 1, marginBottom: spacing.sm,
  },
  todayLabel: {
    fontFamily: 'outfit-bold', fontSize: 12, letterSpacing: 1, marginBottom: spacing.md,
  },
  todayRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  todayIconBox: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  todayInfo: { flex: 1 },
  todayTemp: { fontFamily: 'outfit-bold', fontSize: 42 },
  todayDesc: { fontFamily: 'outfit-medium', fontSize: 16, marginTop: 2 },
  todayRange: { ...typography.bodySmall, marginTop: 4 },
  todayDetails: {
    flexDirection: 'row', justifyContent: 'space-around',
    borderTopWidth: 1, marginTop: spacing.lg, paddingTop: spacing.lg,
  },
  detailChip: { alignItems: 'center', gap: 4 },
  detailLabel: { ...typography.caption },
  detailValue: { fontFamily: 'outfit-bold', fontSize: 14 },
  dayRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radii.md + 2, padding: spacing.md,
    marginBottom: spacing.sm, borderWidth: 1, gap: spacing.sm + 2,
  },
  dayDate: { fontFamily: 'outfit-medium', fontSize: 13, width: 80 },
  dayIconSmall: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  dayDesc: { ...typography.bodySmall, flex: 1 },
  dayTemp: { fontFamily: 'outfit-bold', fontSize: 16 },
  dayTempLow: { fontFamily: 'outfit', fontSize: 14, width: 30 },
  tipCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.lg, borderRadius: radii.lg, marginTop: spacing.lg,
  },
  tipText: { ...typography.body, flex: 1, fontFamily: 'outfit-medium' },
});
