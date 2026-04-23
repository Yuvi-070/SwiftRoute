import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapboxAutocomplete, { type MapboxPlace } from '../../components/MapboxAutocomplete';
import { db } from '../../configs/firebaseConfig';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/theme';
import { generateItinerary, type TripDetails } from '../../services/aiService';
import { saveTrip, saveWeather } from '../../services/storageService';
import { fetchWeatherForecast } from '../../services/weatherService';

// ─── Types ────────────────────────────────────────────────────────────────────

type TravelerType = TripDetails['travelers'];
type BudgetType = TripDetails['budget'];

interface TripFormState {
  destination: string;
  destinationCoords: { lat: number; lng: number } | undefined;
  totalDays: number;
  startDate: Date;
  travelers: TravelerType;
  travelersCount: number;
  budget: BudgetType;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Destination', 'Duration', 'Travelers', 'Budget', 'Review'] as const;
const TOTAL_STEPS = STEPS.length;
const DEFAULT_START_DATE_OFFSET_DAYS = 7;

const TRAVELER_OPTIONS: { key: TravelerType; label: string; icon: string; desc: string }[] = [
  { key: 'solo', label: 'Solo', icon: 'person-outline', desc: 'Just you, total freedom' },
  { key: 'couple', label: 'Couple', icon: 'heart-outline', desc: 'Romantic getaway for 2' },
  { key: 'family', label: 'Family', icon: 'people-outline', desc: 'Fun for the whole family' },
  { key: 'friends', label: 'Friends', icon: 'beer-outline', desc: 'Squad adventures' },
];

const BUDGET_OPTIONS: { key: BudgetType; label: string; icon: string; desc: string; color: string }[] = [
  {
    key: 'budget',
    label: 'Budget',
    icon: 'wallet-outline',
    desc: 'Affordable stays & local eats',
    color: '#22C55E',
  },
  {
    key: 'moderate',
    label: 'Moderate',
    icon: 'card-outline',
    desc: 'Mix of comfort & value',
    color: Colors.PRIMARY,
  },
  {
    key: 'luxury',
    label: 'Luxury',
    icon: 'diamond-outline',
    desc: 'Premium everything',
    color: '#F5A623',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CreateTrip() {
  const navigation = useNavigation();
  const router = useRouter();
  const { theme } = useTheme();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const [form, setForm] = useState<TripFormState>({
    destination: '',
    destinationCoords: undefined,
    totalDays: 3,
    startDate: addDays(new Date(), DEFAULT_START_DATE_OFFSET_DAYS),
    travelers: 'solo',
    travelersCount: 1,
    budget: 'moderate',
  });

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: false,
      headerTitle: '',
      headerTintColor: theme.textPrimary,
      headerStyle: { backgroundColor: theme.background },
      headerShadowVisible: false,
    });
  }, [navigation, theme]);

  // Slide animation when step changes
  const animateStep = () => {
    slideAnim.setValue(60);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  };

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      animateStep();
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      animateStep();
    } else {
      router.back();
    }
  };

  const updateForm = (updates: Partial<TripFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = (): boolean => {
    if (step === 0) return form.destination.trim().length > 0;
    return true;
  };

  // ─── AI Generation ────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const endDate = addDays(form.startDate, form.totalDays - 1);
      const tripDetails: TripDetails = {
        destination: form.destination,
        destinationCoords: form.destinationCoords,
        startDate: form.startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalDays: form.totalDays,
        travelers: form.travelers,
        travelersCount: form.travelersCount,
        budget: form.budget,
      };

      // Fetch weather forecast (free, no API key) — non-blocking on failure
      let weather;
      try {
        weather = await fetchWeatherForecast(
          tripDetails.destination,
          tripDetails.startDate,
          tripDetails.endDate,
          tripDetails.destinationCoords
        );
      } catch (weatherErr) {
        console.warn('[CreateTrip] Weather fetch failed, continuing without it:', weatherErr);
      }

      const itinerary = await generateItinerary(tripDetails, weather);

      // Persist to Firestore (may fail if not configured)
      let tripId: string | null = null;
      try {
        const docRef = await addDoc(collection(db, 'trips'), {
          tripDetails,
          itinerary,
          createdAt: new Date().toISOString(),
        });
        tripId = docRef.id;
      } catch (firestoreErr) {
        console.warn('[CreateTrip] Firestore save failed, using local ID:', firestoreErr);
      }

      // Always save locally for offline access
      const localId = tripId ?? `local_${Date.now()}`;
      await saveTrip({
        id: localId,
        tripDetails: tripDetails as unknown as Record<string, unknown>,
        itinerary,
        createdAt: new Date().toISOString(),
      });
      if (weather) {
        await saveWeather(localId, weather);
      }

      router.replace(`/itinerary/${localId}` as never);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step Renderers ───────────────────────────────────────────────────────

  const renderDestinationStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepEmoji}>🗺️</Text>
      <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Where do you want to go?</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>Search for a city or country to start planning your adventure.</Text>
      <MapboxAutocomplete
        placeholder="Search destination…"
        onPlaceSelect={(place: MapboxPlace) => {
          updateForm({
            destination: place.place_name,
            destinationCoords: { lat: place.center[1], lng: place.center[0] },
          });
        }}
      />
      {form.destination ? (
        <View style={styles.selectedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.SUCCESS} />
          <Text style={styles.selectedBadgeText} numberOfLines={1}>
            {form.destination}
          </Text>
        </View>
      ) : null}
    </View>
  );

  const renderDurationStep = () => {
    const endDate = addDays(form.startDate, form.totalDays - 1);
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepEmoji}>📅</Text>
        <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>How long is your trip?</Text>
        <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>Choose the number of days and when you want to start.</Text>

        {/* Days selector */}
        <View style={[styles.card, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Number of days</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={[styles.counterBtn, form.totalDays <= 1 && styles.counterBtnDisabled]}
              onPress={() => form.totalDays > 1 && updateForm({ totalDays: form.totalDays - 1 })}
            >
              <Ionicons name="remove" size={22} color={form.totalDays <= 1 ? theme.textTertiary : '#FFF'} />
            </TouchableOpacity>
            <Text style={[styles.counterValue, { color: theme.textPrimary }]}>{form.totalDays}</Text>
            <TouchableOpacity
              style={[styles.counterBtn, form.totalDays >= 14 && styles.counterBtnDisabled]}
              onPress={() => form.totalDays < 14 && updateForm({ totalDays: form.totalDays + 1 })}
            >
              <Ionicons name="add" size={22} color={form.totalDays >= 14 ? Colors.GRAY : Colors.WHITE} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Start date selector */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Start date</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              onPress={() =>
                updateForm({ startDate: addDays(form.startDate, -1) })
              }
              style={styles.dateArrow}
            >
              <Ionicons name="chevron-back" size={20} color={Colors.PRIMARY} />
            </TouchableOpacity>
            <Text style={[styles.dateValue, { color: theme.textPrimary }]}>{formatDate(form.startDate)}</Text>
            <TouchableOpacity
              onPress={() =>
                updateForm({ startDate: addDays(form.startDate, 1) })
              }
              style={styles.dateArrow}
            >
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.dateSubText, { color: theme.textSecondary }]}>
            Returns: {formatDate(endDate)} · {form.totalDays} {form.totalDays === 1 ? 'day' : 'days'}
          </Text>
        </View>
      </View>
    );
  };

  const renderTravelersStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepEmoji}>👥</Text>
      <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Who{"'"}s travelling with you?</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>The AI will tailor activities to your travel party.</Text>

      {TRAVELER_OPTIONS.map((opt) => {
        const isSelected = form.travelers === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[styles.optionCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }, isSelected && { borderColor: theme.primary, backgroundColor: theme.primary + '08' }]}
            onPress={() => {
              const count = opt.key === 'solo' ? 1 : opt.key === 'couple' ? 2 : form.travelersCount || 3;
              updateForm({ travelers: opt.key, travelersCount: count });
            }}
          >
            <View style={[styles.optionIconBox, { backgroundColor: theme.primary + '20' }, isSelected && { backgroundColor: theme.primary }]}>
              <Ionicons name={opt.icon as never} size={22} color={isSelected ? '#FFF' : theme.primary} />
            </View>
            <View style={styles.optionTextBox}>
              <Text style={[styles.optionLabel, { color: theme.textPrimary }, isSelected && { color: theme.primary }]}>{opt.label}</Text>
              <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>{opt.desc}</Text>
            </View>
            {isSelected && <Ionicons name="checkmark-circle" size={22} color={Colors.PRIMARY} />}
          </TouchableOpacity>
        );
      })}

      {/* Group size for family/friends */}
      {(form.travelers === 'family' || form.travelers === 'friends') && (
        <View style={[styles.card, { marginTop: 12, backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Group size</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={[styles.counterBtn, form.travelersCount <= 2 && styles.counterBtnDisabled]}
              onPress={() => form.travelersCount > 2 && updateForm({ travelersCount: form.travelersCount - 1 })}
            >
              <Ionicons name="remove" size={22} color={form.travelersCount <= 2 ? theme.textTertiary : '#FFF'} />
            </TouchableOpacity>
            <Text style={[styles.counterValue, { color: theme.textPrimary }]}>{form.travelersCount}</Text>
            <TouchableOpacity
              style={[styles.counterBtn, form.travelersCount >= 20 && styles.counterBtnDisabled]}
              onPress={() => form.travelersCount < 20 && updateForm({ travelersCount: form.travelersCount + 1 })}
            >
              <Ionicons name="add" size={22} color={form.travelersCount >= 20 ? theme.textTertiary : '#FFF'} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderBudgetStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepEmoji}>💰</Text>
      <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>What{"'"}s your budget style?</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>The AI will recommend restaurants, hotels, and activities accordingly.</Text>

      {BUDGET_OPTIONS.map((opt) => {
        const isSelected = form.budget === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[styles.optionCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }, isSelected && { borderColor: opt.color, backgroundColor: opt.color + '08' }]}
            onPress={() => updateForm({ budget: opt.key })}
          >
            <View style={[styles.optionIconBox, { backgroundColor: isSelected ? opt.color : opt.color + '20' }]}>
              <Ionicons name={opt.icon as never} size={22} color={isSelected ? '#FFF' : opt.color} />
            </View>
            <View style={styles.optionTextBox}>
              <Text style={[styles.optionLabel, { color: theme.textPrimary }, isSelected && { color: opt.color }]}>{opt.label}</Text>
              <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>{opt.desc}</Text>
            </View>
            {isSelected && <Ionicons name="checkmark-circle" size={22} color={opt.color} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderReviewStep = () => {
    const endDate = addDays(form.startDate, form.totalDays - 1);
    const travelerOption = TRAVELER_OPTIONS.find((o) => o.key === form.travelers);
    const budgetOption = BUDGET_OPTIONS.find((o) => o.key === form.budget);
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepEmoji}>✨</Text>
        <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Your trip summary</Text>
        <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>Everything looks good? Let the AI build your personalised itinerary!</Text>

        <View style={[styles.reviewCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <ReviewRow theme={theme} icon="location" label="Destination" value={form.destination} />
          <ReviewRow
            theme={theme}
            icon="calendar"
            label="Dates"
            value={`${formatDate(form.startDate)} – ${formatDate(endDate)}`}
          />
          <ReviewRow theme={theme} icon="time" label="Duration" value={`${form.totalDays} days`} />
          <ReviewRow
            theme={theme}
            icon={travelerOption?.icon ?? 'people'}
            label="Travelers"
            value={
              form.travelers === 'solo' || form.travelers === 'couple'
                ? travelerOption?.label ?? ''
                : `${travelerOption?.label} · ${form.travelersCount} people`
            }
          />
          <ReviewRow theme={theme} icon={budgetOption?.icon ?? 'wallet'} label="Budget" value={budgetOption?.label ?? ''} last />
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={Colors.ERROR} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    );
  };

  const steps = [
    renderDestinationStep,
    renderDurationStep,
    renderTravelersStep,
    renderBudgetStep,
    renderReviewStep,
  ];

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Progress bar */}
      <View style={[styles.progressContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.progressItem}>
            <View style={[styles.progressDot, { backgroundColor: theme.divider }, i <= step && { backgroundColor: theme.primary }]}>
              {i < step ? (
                <Ionicons name="checkmark" size={12} color="#FFF" />
              ) : (
                <Text style={[styles.progressDotText, { color: theme.textTertiary }, i === step && { color: '#FFF' }]}>
                  {i + 1}
                </Text>
              )}
            </View>
            {i < TOTAL_STEPS - 1 && (
              <View style={[styles.progressLine, { backgroundColor: theme.divider }, i < step && { backgroundColor: theme.primary }]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          {steps[step]()}
        </Animated.View>
      </ScrollView>

      {/* Bottom buttons */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={goBack} disabled={loading}>
            <Ionicons name="arrow-back" size={20} color={theme.primary} />
            <Text style={[styles.backBtnText, { color: theme.primary }]}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextBtn,
            !canProceed() && styles.nextBtnDisabled,
            step === 0 && { marginLeft: 'auto' },
          ]}
          onPress={isLastStep ? handleGenerate : goNext}
          disabled={!canProceed() || loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.WHITE} />
          ) : (
            <>
              <Text style={styles.nextBtnText}>{isLastStep ? 'Generate Trip ✨' : 'Continue'}</Text>
              {!isLastStep && <Ionicons name="arrow-forward" size={18} color={Colors.WHITE} />}
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* AI loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingCard, { backgroundColor: theme.surfaceElevated }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingTitle, { color: theme.textPrimary }]}>Building your itinerary…</Text>
            <Text style={[styles.loadingSubtitle, { color: theme.textSecondary }]}>
              Our AI is crafting a personalised day-by-day plan just for you. This takes about 10 seconds.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── ReviewRow helper ─────────────────────────────────────────────────────────

function ReviewRow({
  icon,
  label,
  value,
  last,
  theme,
}: {
  icon: string;
  label: string;
  value: string;
  last?: boolean;
  theme: any;
}) {
  return (
    <View style={[reviewStyles.row, !last && { borderBottomWidth: 1, borderBottomColor: theme.divider }]}>
      <Ionicons name={icon as never} size={18} color={theme.primary} style={{ marginRight: 10 }} />
      <Text style={[reviewStyles.label, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[reviewStyles.value, { color: theme.textPrimary }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const reviewStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  label: {
    fontFamily: 'outfit-medium',
    fontSize: 14,
    color: Colors.GRAY,
    width: 90,
  },
  value: {
    flex: 1,
    fontFamily: 'outfit-medium',
    fontSize: 15,
    color: Colors.DARK,
    textAlign: 'right',
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotActive: {
    backgroundColor: Colors.PRIMARY,
  },
  progressDotText: {
    fontFamily: 'outfit-medium',
    fontSize: 12,
    color: Colors.GRAY,
  },
  progressDotTextActive: {
    color: Colors.WHITE,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.LIGHT_GRAY,
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: Colors.PRIMARY,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  stepContent: {
    gap: 16,
  },
  stepEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 26,
    color: Colors.DARK,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontFamily: 'outfit',
    fontSize: 15,
    color: Colors.GRAY,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.SUCCESS + '15',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  selectedBadgeText: {
    fontFamily: 'outfit-medium',
    fontSize: 14,
    color: Colors.SUCCESS,
    flex: 1,
  },
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardLabel: {
    fontFamily: 'outfit-medium',
    fontSize: 14,
    color: Colors.GRAY,
    marginBottom: 12,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnDisabled: {
    backgroundColor: Colors.LIGHT_GRAY,
  },
  counterValue: {
    fontFamily: 'outfit-bold',
    fontSize: 32,
    color: Colors.DARK,
    minWidth: 60,
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateArrow: {
    padding: 8,
  },
  dateValue: {
    fontFamily: 'outfit-bold',
    fontSize: 18,
    color: Colors.DARK,
  },
  dateSubText: {
    fontFamily: 'outfit',
    fontSize: 13,
    color: Colors.GRAY,
    marginTop: 8,
    textAlign: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  optionCardSelected: {
    borderColor: Colors.PRIMARY,
    backgroundColor: Colors.PRIMARY + '08',
  },
  optionIconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: Colors.PRIMARY + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIconBoxSelected: {
    backgroundColor: Colors.PRIMARY,
  },
  optionTextBox: {
    flex: 1,
  },
  optionLabel: {
    fontFamily: 'outfit-bold',
    fontSize: 16,
    color: Colors.DARK,
  },
  optionLabelSelected: {
    color: Colors.PRIMARY,
  },
  optionDesc: {
    fontFamily: 'outfit',
    fontSize: 13,
    color: Colors.GRAY,
    marginTop: 2,
  },
  reviewCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  errorText: {
    fontFamily: 'outfit',
    fontSize: 13,
    color: Colors.ERROR,
    flex: 1,
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: Colors.LIGHT_GRAY,
    gap: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  backBtnText: {
    fontFamily: 'outfit-medium',
    fontSize: 15,
    color: Colors.PRIMARY,
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: Colors.PRIMARY,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnDisabled: {
    backgroundColor: Colors.GRAY,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextBtnText: {
    fontFamily: 'outfit-bold',
    fontSize: 16,
    color: Colors.WHITE,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,46,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 32,
    alignItems: 'center',
    gap: 14,
  },
  loadingTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 20,
    color: Colors.DARK,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: Colors.GRAY,
    textAlign: 'center',
    lineHeight: 20,
  },
});
