import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import {
  generatePackingList,
  type PackingCategory,
  type PackingList,
  type TripDetails,
} from '../../services/aiService';
import {
  loadPackingList,
  loadTrip,
  loadWeather,
  savePackingList,
  type PackingItem,
} from '../../services/storageService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function packingListToItems(list: PackingList): PackingItem[] {
  const items: PackingItem[] = [];
  list.categories.forEach((cat: PackingCategory) => {
    cat.items.forEach((label: string) => {
      items.push({
        id: `${cat.category}:${label}`,
        label,
        category: cat.category,
        checked: false,
      });
    });
  });
  return items;
}

function groupByCategory(items: PackingItem[]): Record<string, PackingItem[]> {
  return items.reduce<Record<string, PackingItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PackingListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();

  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const loadOrGenerate = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      // Try loading from local storage first
      const cached = await loadPackingList(id);
      if (cached && cached.length > 0) {
        setItems(cached);
        setLoading(false);
        return;
      }

      // No cached list — generate one
      setGenerating(true);
      const trip = await loadTrip(id);
      if (!trip) {
        setError('Trip data not found. Cannot generate packing list.');
        return;
      }

      const weather = await loadWeather(id);
      const tripDetails = trip.tripDetails as unknown as TripDetails;
      const list = await generatePackingList(tripDetails, weather ?? undefined);
      const generated = packingListToItems(list);
      await savePackingList(id, generated);
      setItems(generated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate packing list.');
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrGenerate();
  }, [loadOrGenerate]);

  const toggleItem = async (itemId: string) => {
    const updated = items.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    setItems(updated);
    if (id) await savePackingList(id, updated);
  };

  const regenerate = async () => {
    if (!id) return;
    setGenerating(true);
    setError(null);
    try {
      const trip = await loadTrip(id);
      if (!trip) {
        setError('Trip data not found.');
        return;
      }
      const weather = await loadWeather(id);
      const tripDetails = trip.tripDetails as unknown as TripDetails;
      const list = await generatePackingList(tripDetails, weather ?? undefined);
      const generated = packingListToItems(list);
      await savePackingList(id, generated);
      setItems(generated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate packing list.');
    } finally {
      setGenerating(false);
    }
  };

  const checkedCount = items.filter((i) => i.checked).length;
  const grouped = groupByCategory(items);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.hero}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>🎒 Packing List</Text>
        {items.length > 0 && (
          <Text style={styles.heroSubtitle}>
            {checkedCount} / {items.length} packed
          </Text>
        )}
      </View>

      {/* Progress bar */}
      {items.length > 0 && (
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.round((checkedCount / items.length) * 100)}%` },
            ]}
          />
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>
            {generating ? 'Generating your packing list with AI…' : 'Loading…'}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.ERROR} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadOrGenerate}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(grouped).map(([category, catItems]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {catItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemRow}
                  onPress={() => toggleItem(item.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      item.checked && styles.checkboxChecked,
                    ]}
                  >
                    {item.checked && (
                      <Ionicons name="checkmark" size={14} color={Colors.WHITE} />
                    )}
                  </View>
                  <Text
                    style={[styles.itemLabel, item.checked && styles.itemLabelChecked]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* Regenerate button */}
          <TouchableOpacity
            style={styles.regenerateBtn}
            onPress={regenerate}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator size="small" color={Colors.WHITE} />
            ) : (
              <Ionicons name="refresh" size={18} color={Colors.WHITE} />
            )}
            <Text style={styles.regenerateBtnText}>
              {generating ? 'Generating…' : 'Regenerate with AI'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  hero: {
    backgroundColor: Colors.PRIMARY,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 26,
    color: Colors.WHITE,
  },
  heroSubtitle: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: Colors.SUCCESS,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: {
    fontFamily: 'outfit',
    fontSize: 15,
    color: Colors.GRAY,
    textAlign: 'center',
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
  scrollContent: {
    padding: 20,
  },
  categorySection: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  categoryTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 15,
    color: Colors.DARK,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.SUCCESS,
    borderColor: Colors.SUCCESS,
  },
  itemLabel: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: Colors.DARK,
    flex: 1,
  },
  itemLabelChecked: {
    color: Colors.GRAY,
    textDecorationLine: 'line-through',
  },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
  },
  regenerateBtnText: {
    fontFamily: 'outfit-bold',
    fontSize: 15,
    color: Colors.WHITE,
  },
});
