import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing, typography } from '../../constants/theme';
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
import AnimatedCard from '../../components/ui/AnimatedCard';

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

export default function PackingListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { theme } = useTheme();

  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newItemText, setNewItemText] = useState<{ [category: string]: string }>({});

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const loadOrGenerate = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const cached = await loadPackingList(id);
      if (cached && cached.length > 0) {
        setItems(cached);
        setLoading(false);
        return;
      }
      setGenerating(true);
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

  const deleteItem = async (itemId: string) => {
    const updated = items.filter((item) => item.id !== itemId);
    setItems(updated);
    if (id) await savePackingList(id, updated);
  };

  const addItem = async (category: string) => {
    const text = newItemText[category]?.trim();
    if (!text) return;
    
    const newItem: PackingItem = {
      id: `${category}:custom_${Date.now()}`,
      label: text,
      category,
      checked: false,
    };
    const updated = [...items, newItem];
    setItems(updated);
    setNewItemText((prev) => ({ ...prev, [category]: '' }));
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
      setError(err instanceof Error ? err.message : 'Failed to regenerate.');
    } finally {
      setGenerating(false);
    }
  };

  const checkedCount = items.filter((i) => i.checked).length;
  const grouped = groupByCategory(items);
  const progressPercent = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.hero, { backgroundColor: theme.primary }]}>
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.accent, opacity: 0.35 }]}
        />
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.editBtn, isEditing && { backgroundColor: theme.accent }]}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons name={isEditing ? 'checkmark' : 'create-outline'} size={18} color="#FFF" />
            <Text style={styles.editBtnText}>{isEditing ? 'Done' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.heroTitle}>🎒 Packing List</Text>
        {items.length > 0 && (
          <Text style={styles.heroSubtitle}>
            {checkedCount} / {items.length} packed ({progressPercent}%)
          </Text>
        )}
      </View>

      {/* Progress bar */}
      {items.length > 0 && (
        <View style={[styles.progressBarBg, { backgroundColor: theme.divider }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: progressPercent === 100 ? theme.success : theme.primary,
              },
            ]}
          />
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            {generating ? 'Generating your packing list with AI…' : 'Loading…'}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
          <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>Something went wrong</Text>
          <Text style={[styles.errorMsg, { color: theme.textSecondary }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary }]} onPress={loadOrGenerate}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {Object.entries(grouped).map(([category, catItems], catIndex) => (
            <AnimatedCard key={category} delay={catIndex * 60}>
              <View
                style={[
                  styles.categorySection,
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
                <View style={styles.categoryHeader}>
                  <Text style={[styles.categoryTitle, { color: theme.textPrimary }]}>
                    {category}
                  </Text>
                  <Text style={[styles.categoryCount, { color: theme.textTertiary }]}>
                    {catItems.filter((i) => i.checked).length}/{catItems.length}
                  </Text>
                </View>
                {catItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemRow, { borderBottomColor: theme.divider }]}
                    onPress={() => toggleItem(item.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: item.checked ? theme.success : theme.textTertiary,
                          backgroundColor: item.checked ? theme.success : 'transparent',
                        },
                      ]}
                    >
                      {item.checked && (
                        <Ionicons name="checkmark" size={14} color="#FFF" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.itemLabel,
                        { color: item.checked ? theme.textTertiary : theme.textPrimary },
                        item.checked && styles.itemLabelChecked,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isEditing && (
                      <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteItemBtn}>
                        <Ionicons name="trash-outline" size={18} color={theme.error} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
                
                {isEditing && (
                  <View style={[styles.addItemRow, { borderTopColor: theme.divider }]}>
                    <TextInput
                      style={[styles.addItemInput, { color: theme.textPrimary, backgroundColor: theme.background, borderColor: theme.border }]}
                      placeholder="Add custom item…"
                      placeholderTextColor={theme.textTertiary}
                      value={newItemText[category] || ''}
                      onChangeText={(text) => setNewItemText((prev) => ({ ...prev, [category]: text }))}
                      onSubmitEditing={() => addItem(category)}
                    />
                    <TouchableOpacity
                      style={[styles.addItemBtn, { backgroundColor: theme.primary }]}
                      onPress={() => addItem(category)}
                    >
                      <Ionicons name="add" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </AnimatedCard>
          ))}

          <TouchableOpacity
            style={[styles.regenerateBtn, { backgroundColor: theme.primary }]}
            onPress={regenerate}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="refresh" size={18} color="#FFF" />
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
  root: { flex: 1 },
  hero: {
    paddingTop: 56, paddingBottom: spacing.xl,
    paddingHorizontal: spacing['2xl'], overflow: 'hidden',
  },
  headerTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  editBtnText: { ...typography.buttonSmall, color: '#FFF' },
  heroTitle: { fontFamily: 'outfit-bold', fontSize: 26, color: '#FFF' },
  heroSubtitle: {
    fontFamily: 'outfit', fontSize: 14,
    color: 'rgba(255,255,255,0.8)', marginTop: 4,
  },
  progressBarBg: { height: 4 },
  progressBarFill: { height: 4 },
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: spacing['3xl'], gap: spacing.md,
  },
  loadingText: { ...typography.body, textAlign: 'center' },
  errorTitle: { ...typography.h2, textAlign: 'center' },
  errorMsg: { ...typography.body, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    paddingVertical: spacing.md, paddingHorizontal: spacing['2xl'] + 4,
    borderRadius: radii.md, marginTop: spacing.sm,
  },
  retryBtnText: { ...typography.buttonSmall, color: '#FFF' },
  scrollContent: { padding: spacing.xl },
  categorySection: {
    borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1,
  },
  categoryHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.sm + 2,
  },
  categoryTitle: { ...typography.subtitle, fontFamily: 'outfit-bold' },
  categoryCount: { ...typography.caption },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.md, paddingVertical: 9, borderBottomWidth: 1,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center',
  },
  itemLabel: { ...typography.body, flex: 1 },
  itemLabelChecked: { textDecorationLine: 'line-through' },
  regenerateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingVertical: spacing.md, borderRadius: radii.md + 2, marginTop: 6,
  },
  regenerateBtnText: { ...typography.buttonSmall, color: '#FFF' },
  deleteItemBtn: { padding: 4 },
  addItemRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingTop: spacing.md, marginTop: spacing.xs, borderTopWidth: 1,
  },
  addItemInput: {
    flex: 1, height: 40, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing.md, fontFamily: 'outfit', fontSize: 14,
  },
  addItemBtn: {
    width: 40, height: 40, borderRadius: radii.md, justifyContent: 'center', alignItems: 'center',
  },
});
