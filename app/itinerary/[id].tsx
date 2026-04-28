import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, interpolate, Extrapolation } from 'react-native-reanimated';
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { db } from '../../configs/firebaseConfig';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing, typography } from '../../constants/theme';
import type { DayItinerary, GeneratedItinerary } from '../../services/aiService';
import { loadTrip, saveTrip } from '../../services/storageService';
import { exportToPdf, generateShareText } from '../../services/exportService';
import { Share, Alert } from 'react-native';
import AnimatedCard from '../../components/ui/AnimatedCard';
import PressableScale from '../../components/ui/PressableScale';
import MapboxAutocomplete, { type MapboxPlace } from '../../components/MapboxAutocomplete';

const TIME_COLORS: Record<string, string> = {
  Morning: '#F59E0B',
  Afternoon: '#6366F1',
  Evening: '#8B5CF6',
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
  const { theme, isDark } = useTheme();

  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number>(1);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addPlaceOpen, setAddPlaceOpen] = useState(false);
  const [addPlaceDay, setAddPlaceDay] = useState<number>(1);
  const [addPlaceTime, setAddPlaceTime] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const heroAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(scrollY.value, [-100, 0, 100], [-25, 0, 0], Extrapolation.CLAMP),
        },
        {
          scale: interpolate(scrollY.value, [-100, 0], [1.5, 1], Extrapolation.CLAMP),
        }
      ]
    };
  });

  const deleteTrip = async () => {
    try {
      if (!id.startsWith('local_')) {
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'trips', id));
      }
      const { deleteTrip: deleteLocal } = await import('../../services/storageService');
      await deleteLocal(id);
      router.replace('/(tabs)/mytrip' as never);
    } catch (err) {
      Alert.alert('Error', 'Failed to delete trip.');
    }
  };

  const handleSave = async () => {
    if (!itinerary) return;
    setSaving(true);
    try {
      if (id.startsWith('local_')) {
        const local = await loadTrip(id);
        if (local) {
          await saveTrip({ ...local, itinerary });
        }
      } else {
        const docRef = doc(db, 'trips', id);
        await updateDoc(docRef, { itinerary });
        const local = await loadTrip(id);
        if (local) {
          await saveTrip({ ...local, itinerary });
        }
      }
      setIsEditing(false);
      Alert.alert('Success', 'Itinerary updated!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const addCustomPlaceToDay = (place: MapboxPlace) => {
    if (!itinerary) return;
    const targetDay = Math.min(Math.max(addPlaceDay, 1), itinerary.itinerary.length || 1);
    const newItinerary = itinerary.itinerary.map((d) => {
      if (d.day !== targetDay) return d;
      const activityName = place.text ? `Visit ${place.text}` : 'Visit';
      return {
        ...d,
        activities: [
          ...d.activities,
          {
            time: addPlaceTime,
            activity: activityName,
            location: place.place_name,
            description: 'Added by you.',
            estimatedCost: '',
          },
        ],
      };
    });
    setItinerary({ ...itinerary, itinerary: newItinerary });
    setAddPlaceOpen(false);
  };

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const docRef = doc(db, 'trips', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setItinerary(data.itinerary as GeneratedItinerary);
          setLoading(false);
          return;
        }
      } catch {
        // Firestore unavailable
      }

      try {
        const local = await loadTrip(id);
        if (local) {
          setItinerary(local.itinerary);
        } else {
          setError('Trip not found.');
        }
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
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading your trip…
        </Text>
      </View>
    );
  }

  if (error || !itinerary) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
        <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
          Something went wrong
        </Text>
        <Text style={[styles.errorMsg, { color: theme.textSecondary }]}>
          {error ?? 'Unknown error'}
        </Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.retryBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Hero header with gradient */}
      <Animated.View style={[styles.hero, { backgroundColor: theme.primary }, heroAnimatedStyle]}>
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: theme.accent, opacity: 0.35 },
          ]}
        />
        <View style={styles.heroHeaderRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace('/(tabs)/mytrip' as never)}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => {
              if (Platform.OS === 'web') {
                if (window.confirm("Are you sure you want to delete this trip?")) {
                  deleteTrip();
                }
              } else {
                Alert.alert("Delete Trip", "Are you sure you want to delete this trip?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: deleteTrip }
                ]);
              }
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <TextInput
            style={[styles.heroTitle, { borderBottomWidth: 1, borderBottomColor: '#FFF', paddingBottom: 2 }]}
            value={itinerary.tripTitle}
            onChangeText={(t) => setItinerary({ ...itinerary, tripTitle: t })}
            placeholderTextColor="#CCC"
          />
        ) : (
          <Text style={styles.heroTitle} numberOfLines={2}>
            {itinerary.tripTitle}
          </Text>
        )}
        <View style={styles.heroBadgeRow}>
          <View style={styles.heroBadge}>
            <Ionicons name="location" size={13} color="#FFF" />
            <Text style={styles.heroBadgeText}>{itinerary.destination}</Text>
          </View>
          <View style={styles.heroBadge}>
            <Ionicons name="time-outline" size={13} color="#FFF" />
            <Text style={styles.heroBadgeText}>{itinerary.duration} days</Text>
          </View>
          <View style={styles.heroBadge}>
            <Ionicons name="cash-outline" size={13} color="#FFF" />
            <Text style={styles.heroBadgeText}>{itinerary.estimatedTotalCost}</Text>
          </View>
        </View>

        {/* Quick-action buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.heroActionsScroll}
          contentContainerStyle={styles.heroActions}
        >
          {isEditing ? (
             <TouchableOpacity style={styles.heroActionBtn} onPress={handleSave} disabled={saving}>
               <Ionicons name="save-outline" size={16} color={theme.success} />
               <Text style={[styles.heroActionText, { color: theme.success }]}>{saving ? 'Saving...' : 'Save'}</Text>
             </TouchableOpacity>
          ) : (
             <TouchableOpacity style={styles.heroActionBtn} onPress={() => setIsEditing(true)}>
               <Ionicons name="create-outline" size={16} color={theme.primary} />
               <Text style={[styles.heroActionText, { color: theme.primary }]}>Edit</Text>
             </TouchableOpacity>
          )}
          {isEditing && (
            <TouchableOpacity style={styles.heroActionBtn} onPress={() => {
              setAddPlaceDay(expandedDay > 0 ? expandedDay : 1);
              setAddPlaceTime('Morning');
              setAddPlaceOpen(true);
            }}>
              <Ionicons name="add-circle-outline" size={16} color={theme.primary} />
              <Text style={[styles.heroActionText, { color: theme.primary }]}>Add Place</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.heroActionBtn}
            onPress={() => router.push(`/chat/${id}` as never)}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={theme.primary} />
            <Text style={[styles.heroActionText, { color: theme.primary }]}>Ask AI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroActionBtn}
            onPress={() => router.push(`/packing-list/${id}` as never)}
          >
            <Ionicons name="bag-outline" size={16} color={theme.primary} />
            <Text style={[styles.heroActionText, { color: theme.primary }]}>Packing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroActionBtn}
            onPress={() => router.push(`/journal/${id}` as never)}
          >
            <Ionicons name="book-outline" size={16} color={theme.primary} />
            <Text style={[styles.heroActionText, { color: theme.primary }]}>Journal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroActionBtn}
            onPress={() => router.push(`/expense-tracker/${id}` as never)}
          >
            <Ionicons name="wallet-outline" size={16} color={theme.primary} />
            <Text style={[styles.heroActionText, { color: theme.primary }]}>Expenses</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroActionBtn}
            onPress={() => router.push('/currency' as never)}
          >
            <Ionicons name="swap-horizontal-outline" size={16} color={theme.primary} />
            <Text style={[styles.heroActionText, { color: theme.primary }]}>Currency</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroActionBtn}
            onPress={() => router.push(`/weather/${id}` as never)}
          >
            <Ionicons name="cloudy-outline" size={16} color={theme.primary} />
            <Text style={[styles.heroActionText, { color: theme.primary }]}>Weather</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroActionBtn}
            onPress={async () => {
              try {
                const text = generateShareText(itinerary);
                await Share.share({ message: text, title: itinerary.tripTitle });
              } catch {}
            }}
          >
            <Ionicons name="share-social-outline" size={16} color={theme.primary} />
            <Text style={[styles.heroActionText, { color: theme.primary }]}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroActionBtn}
            onPress={async () => {
              try {
                await exportToPdf(itinerary);
              } catch (err) {
                Alert.alert('Export failed', err instanceof Error ? err.message : 'Unknown error');
              }
            }}
          >
            <Ionicons name="document-outline" size={16} color={theme.primary} />
            <Text style={[styles.heroActionText, { color: theme.primary }]}>PDF</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <AnimatedCard delay={0}>
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                ...Platform.select({
                  ios: {
                    shadowColor: theme.shadowColor,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: theme.shadowOpacity,
                    shadowRadius: 8,
                  },
                  android: { elevation: 2 },
                }),
              },
            ]}
          >
            {isEditing ? (
              <TextInput
                style={[styles.summaryText, { color: theme.textPrimary }]}
                value={itinerary.summary}
                onChangeText={(t) => setItinerary({ ...itinerary, summary: t })}
                multiline
              />
            ) : (
              <Text style={[styles.summaryText, { color: theme.textPrimary }]}>
                {itinerary.summary}
              </Text>
            )}
          </View>
        </AnimatedCard>

        {/* Day-by-day */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          📅 Day-by-Day Itinerary
        </Text>
        {itinerary.itinerary.map((day: DayItinerary, index: number) => (
          <AnimatedCard key={day.day} delay={100 + index * 60}>
            <DayCard
              day={day}
              expanded={expandedDay === day.day}
              onToggle={() => setExpandedDay(expandedDay === day.day ? -1 : day.day)}
              isEditing={isEditing}
              onUpdateDay={(updated) => {
                const newItinerary = [...itinerary.itinerary];
                const idx = newItinerary.findIndex((d) => d.day === updated.day);
                if (idx !== -1) newItinerary[idx] = updated;
                setItinerary({ ...itinerary, itinerary: newItinerary });
              }}
              onMoveActivity={(activityIndex, direction) => {
                const newItinerary = [...itinerary.itinerary];
                const currentDayIndex = index;
                if (direction === 'prevDay' && currentDayIndex > 0) {
                  const targetDayIndex = currentDayIndex - 1;
                  const act = newItinerary[currentDayIndex].activities.splice(activityIndex, 1)[0];
                  newItinerary[targetDayIndex].activities.push(act);
                } else if (direction === 'nextDay' && currentDayIndex < newItinerary.length - 1) {
                  const targetDayIndex = currentDayIndex + 1;
                  const act = newItinerary[currentDayIndex].activities.splice(activityIndex, 1)[0];
                  newItinerary[targetDayIndex].activities.push(act);
                }
                setItinerary({ ...itinerary, itinerary: newItinerary });
              }}
            />
          </AnimatedCard>
        ))}

        {/* Packing tips */}
        {itinerary.packingTips?.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              🎒 Packing Tips
            </Text>
            <AnimatedCard delay={400}>
              <View
                style={[
                  styles.tipsCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                {itinerary.packingTips.map((tip: string, i: number) => (
                  <View
                    key={i}
                    style={[
                      styles.tipRow,
                      i < itinerary.packingTips.length - 1 && [
                        styles.tipRowBorder,
                        { borderBottomColor: theme.divider },
                      ],
                    ]}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                    <Text style={[styles.tipText, { color: theme.textPrimary }]}>{tip}</Text>
                  </View>
                ))}
              </View>
            </AnimatedCard>
          </>
        )}

        {/* Travel tips */}
        {itinerary.travelTips?.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              💡 Travel Tips
            </Text>
            <AnimatedCard delay={500}>
              <View
                style={[
                  styles.tipsCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                {itinerary.travelTips.map((tip: string, i: number) => (
                  <View
                    key={i}
                    style={[
                      styles.tipRow,
                      i < itinerary.travelTips.length - 1 && [
                        styles.tipRowBorder,
                        { borderBottomColor: theme.divider },
                      ],
                    ]}
                  >
                    <Ionicons name="bulb-outline" size={16} color={theme.secondary} />
                    <Text style={[styles.tipText, { color: theme.textPrimary }]}>{tip}</Text>
                  </View>
                ))}
              </View>
            </AnimatedCard>
          </>
        )}

        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      {addPlaceOpen && isEditing && (
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add a location</Text>
              <TouchableOpacity onPress={() => setAddPlaceOpen(false)}>
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Search</Text>
            <MapboxAutocomplete
              placeholder="Search a place…"
              onPlaceSelect={(place: MapboxPlace) => addCustomPlaceToDay(place)}
            />

            <View style={styles.modalRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Day</Text>
                <View style={styles.pillRow}>
                  {itinerary.itinerary.map((d) => (
                    <TouchableOpacity
                      key={d.day}
                      style={[
                        styles.pill,
                        { borderColor: theme.border, backgroundColor: theme.background },
                        addPlaceDay === d.day && { backgroundColor: theme.primaryMuted, borderColor: theme.primary },
                      ]}
                      onPress={() => setAddPlaceDay(d.day)}
                    >
                      <Text style={[styles.pillText, { color: addPlaceDay === d.day ? theme.primary : theme.textSecondary }]}>
                        Day {d.day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Time slot</Text>
            <View style={styles.pillRow}>
              {(['Morning', 'Afternoon', 'Evening'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.pill,
                    { borderColor: theme.border, backgroundColor: theme.background },
                    addPlaceTime === t && { backgroundColor: theme.primaryMuted, borderColor: theme.primary },
                  ]}
                  onPress={() => setAddPlaceTime(t)}
                >
                  <Text style={[styles.pillText, { color: addPlaceTime === t ? theme.primary : theme.textSecondary }]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalHint, { color: theme.textTertiary }]}>
              Pick a place from search results to add it to your itinerary.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── DayCard ─────────────────────────────────────────────────────────────────

function DayCard({
  day,
  expanded,
  onToggle,
  isEditing,
  onUpdateDay,
  onMoveActivity,
}: {
  day: DayItinerary;
  expanded: boolean;
  onToggle: () => void;
  isEditing?: boolean;
  onUpdateDay?: (d: DayItinerary) => void;
  onMoveActivity?: (activityIndex: number, direction: 'prevDay' | 'nextDay') => void;
}) {
  const { theme } = useTheme();

  const updateActivity = (index: number, field: keyof typeof day.activities[0], value: string) => {
    if (!onUpdateDay) return;
    const newActs = [...day.activities];
    newActs[index] = { ...newActs[index], [field]: value };
    onUpdateDay({ ...day, activities: newActs });
  };

  const deleteActivity = (index: number) => {
    if (!onUpdateDay) return;
    const newActs = [...day.activities];
    newActs.splice(index, 1);
    onUpdateDay({ ...day, activities: newActs });
  };

  const addActivity = () => {
    if (!onUpdateDay) return;
    const newActs = [...day.activities, {
      time: 'New',
      activity: 'New Activity',
      location: '',
      description: '',
      estimatedCost: ''
    }];
    onUpdateDay({ ...day, activities: newActs as any });
  };

  return (
    <View
      style={[
        dayStyles.card,
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
      <PressableScale onPress={onToggle}>
        <View style={dayStyles.header}>
          <View style={[dayStyles.dayBadge, { backgroundColor: theme.primary }]}>
            <Text style={dayStyles.dayNumber}>Day {day.day}</Text>
          </View>
          {isEditing ? (
             <TextInput 
               style={[dayStyles.theme, { color: theme.textPrimary, borderBottomWidth: 1, borderBottomColor: theme.border }]}
               value={day.theme}
               onChangeText={(t) => onUpdateDay?.({ ...day, theme: t })}
             />
          ) : (
             <Text style={[dayStyles.theme, { color: theme.textPrimary }]} numberOfLines={1}>
               {day.theme}
             </Text>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.textTertiary}
          />
        </View>
      </PressableScale>

      {expanded && (
        <View style={[dayStyles.body, { borderTopColor: theme.divider }]}>
          {day.activities.map((act, i) => {
            const color = TIME_COLORS[act.time] ?? theme.primary;
            const icon = TIME_ICONS[act.time] ?? 'time-outline';
            return (
              <View key={i} style={dayStyles.activityRow}>
                <View style={dayStyles.timelineCol}>
                  <View style={[dayStyles.timelineDot, { backgroundColor: color }]}>
                    <Ionicons name={icon as never} size={12} color="#FFF" />
                  </View>
                  {i < day.activities.length - 1 && (
                    <View
                      style={[dayStyles.timelineLine, { backgroundColor: color + '30' }]}
                    />
                  )}
                </View>
                <View style={dayStyles.activityContent}>
                  <View style={dayStyles.activityHeader}>
                    {isEditing ? (
                      <TextInput 
                        style={[dayStyles.activityTime, { color, borderBottomWidth: 1, borderBottomColor: theme.border }]} 
                        value={act.time} 
                        onChangeText={(t) => updateActivity(i, 'time', t)} 
                      />
                    ) : (
                      <Text style={[dayStyles.activityTime, { color }]}>{act.time}</Text>
                    )}
                    <View style={[dayStyles.costBadge, { backgroundColor: color + '15' }]}>
                      {isEditing ? (
                        <TextInput 
                          style={[dayStyles.costText, { color, borderBottomWidth: 1, borderBottomColor: theme.border }]} 
                          value={act.estimatedCost} 
                          onChangeText={(t) => updateActivity(i, 'estimatedCost', t)} 
                        />
                      ) : (
                        <Text style={[dayStyles.costText, { color }]}>{act.estimatedCost}</Text>
                      )}
                    </View>
                  </View>
                  {isEditing ? (
                    <TextInput 
                      style={[dayStyles.activityName, { color: theme.textPrimary, borderBottomWidth: 1, borderBottomColor: theme.border }]} 
                      value={act.activity} 
                      onChangeText={(t) => updateActivity(i, 'activity', t)} 
                    />
                  ) : (
                    <Text style={[dayStyles.activityName, { color: theme.textPrimary }]}>
                      {act.activity}
                    </Text>
                  )}
                  <View style={dayStyles.locationRow}>
                    <Ionicons name="location-outline" size={13} color={theme.textTertiary} />
                    {isEditing ? (
                      <TextInput 
                        style={[dayStyles.locationText, { color: theme.textSecondary, flex: 1, borderBottomWidth: 1, borderBottomColor: theme.border }]} 
                        value={act.location} 
                        onChangeText={(t) => updateActivity(i, 'location', t)} 
                      />
                    ) : (
                      <TouchableOpacity onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.location)}`)} style={{ flex: 1 }}>
                        <Text style={[dayStyles.locationText, { color: theme.primary, textDecorationLine: 'underline' }]}>
                          {act.location}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {isEditing ? (
                    <TextInput 
                      style={[dayStyles.activityDesc, { color: theme.textSecondary, borderBottomWidth: 1, borderBottomColor: theme.border }]} 
                      value={act.description} 
                      onChangeText={(t) => updateActivity(i, 'description', t)} 
                      multiline
                    />
                  ) : (
                    <Text style={[dayStyles.activityDesc, { color: theme.textSecondary }]}>
                      {act.description}
                    </Text>
                  )}
                  {isEditing && (
                    <View style={dayStyles.editControls}>
                      <TouchableOpacity onPress={() => onMoveActivity?.(i, 'prevDay')} style={dayStyles.controlBtn}>
                        <Ionicons name="arrow-up" size={16} color={theme.primary} />
                        <Text style={[dayStyles.controlText, { color: theme.primary }]}>Move Prev Day</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => onMoveActivity?.(i, 'nextDay')} style={dayStyles.controlBtn}>
                        <Ionicons name="arrow-down" size={16} color={theme.primary} />
                        <Text style={[dayStyles.controlText, { color: theme.primary }]}>Move Next Day</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteActivity(i)} style={dayStyles.controlBtn}>
                        <Ionicons name="trash-outline" size={16} color={theme.error} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
          {isEditing && (
            <TouchableOpacity style={[dayStyles.addActivityBtn, { backgroundColor: theme.primaryMuted }]} onPress={addActivity}>
              <Ionicons name="add" size={18} color={theme.primary} />
              <Text style={[dayStyles.addActivityText, { color: theme.primary }]}>Add Activity</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const dayStyles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  dayBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dayNumber: {
    fontFamily: 'outfit-bold',
    fontSize: 13,
    color: '#FFF',
  },
  theme: {
    flex: 1,
    ...typography.label,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    gap: spacing.md,
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
    paddingBottom: spacing.lg,
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
    ...typography.subtitle,
    fontFamily: 'outfit-bold',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    ...typography.bodySmall,
  },
  activityDesc: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  editControls: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
  },
  controlText: {
    fontFamily: 'outfit-medium',
    fontSize: 12,
  },
  addActivityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: spacing.sm,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  addActivityText: {
    fontFamily: 'outfit-bold',
    fontSize: 14,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.sm,
  },
  errorTitle: {
    ...typography.h2,
    textAlign: 'center',
  },
  errorMsg: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'] + 4,
    borderRadius: radii.md,
    marginTop: spacing.sm,
  },
  retryBtnText: {
    ...typography.buttonSmall,
    color: '#FFF',
  },
  hero: {
    paddingTop: 56,
    paddingBottom: spacing['2xl'] + 4,
    paddingHorizontal: spacing['2xl'],
    overflow: 'hidden',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 26,
    color: '#FFF',
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.full,
  },
  heroBadgeText: {
    fontFamily: 'outfit-medium',
    fontSize: 12,
    color: '#FFF',
  },
  heroActionsScroll: {
    marginTop: spacing.lg,
  },
  heroActions: {
    gap: spacing.sm + 2,
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radii.full,
  },
  heroActionText: {
    fontFamily: 'outfit-medium',
    fontSize: 13,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  summaryCard: {
    borderRadius: radii.lg,
    padding: spacing.lg + 2,
    marginBottom: spacing.xl,
    borderWidth: 1,
  },
  summaryText: {
    ...typography.body,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    marginTop: 4,
  },
  tipsCard: {
    borderRadius: radii.lg,
    padding: spacing.lg + 2,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 2,
    paddingVertical: spacing.sm + 2,
  },
  tipRowBorder: {
    borderBottomWidth: 1,
  },
  tipText: {
    ...typography.body,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    zIndex: 999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 560,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
  },
  modalLabel: {
    ...typography.caption,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  modalRow: {
    marginTop: spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  pillText: {
    fontFamily: 'outfit-medium',
    fontSize: 13,
  },
  modalHint: {
    ...typography.bodySmall,
    marginTop: spacing.md,
  },
});
