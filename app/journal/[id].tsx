import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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
  addJournalEntry,
  deleteJournalEntry,
  getMoodEmoji,
  loadJournalEntries,
  MOOD_OPTIONS,
  type JournalEntry,
} from '../../services/journalService';
import AnimatedCard from '../../components/ui/AnimatedCard';
import PressableScale from '../../components/ui/PressableScale';

export default function JournalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { theme } = useTheme();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood']>('good');
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState('');

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const reload = useCallback(async () => {
    if (!id) return;
    const data = await loadJournalEntries(id);
    setEntries(data);
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleAddEntry = async () => {
    if (!id || !title.trim()) {
      Alert.alert('Missing title', 'Please give your entry a title.');
      return;
    }
    await addJournalEntry(id, {
      title: title.trim(),
      content: content.trim(),
      mood,
      photos,
      location: location.trim() || undefined,
    });
    setTitle('');
    setContent('');
    setMood('good');
    setPhotos([]);
    setLocation('');
    setShowForm(false);
    reload();
  };

  const handleDelete = (entryId: string) => {
    Alert.alert('Delete entry', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!id) return;
          await deleteJournalEntry(id, entryId);
          reload();
        },
      },
    ]);
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 10));
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.hero, { backgroundColor: theme.primary }]}>
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.accent, opacity: 0.35 }]}
        />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>📔 Travel Journal</Text>
        <Text style={styles.heroSubtitle}>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Add entry button */}
        {!showForm && (
          <AnimatedCard delay={0}>
            <PressableScale onPress={() => setShowForm(true)}>
              <View
                style={[
                  styles.addCard,
                  { backgroundColor: theme.primaryMuted, borderColor: theme.border },
                ]}
              >
                <Ionicons name="add-circle" size={24} color={theme.primary} />
                <Text style={[styles.addCardText, { color: theme.primary }]}>
                  Write a new entry
                </Text>
              </View>
            </PressableScale>
          </AnimatedCard>
        )}

        {/* Entry form */}
        {showForm && (
          <AnimatedCard delay={0}>
            <View
              style={[
                styles.formCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.formTitle, { color: theme.textPrimary }]}>✍️ New Entry</Text>

              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceElevated, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="Entry title"
                placeholderTextColor={theme.textTertiary}
                value={title}
                onChangeText={setTitle}
              />

              <TextInput
                style={[styles.input, styles.inputMultiline, { backgroundColor: theme.surfaceElevated, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="What happened today? How do you feel?"
                placeholderTextColor={theme.textTertiary}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceElevated, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="📍 Location (optional)"
                placeholderTextColor={theme.textTertiary}
                value={location}
                onChangeText={setLocation}
              />

              {/* Mood selector */}
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>How was your day?</Text>
              <View style={styles.moodRow}>
                {MOOD_OPTIONS.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    style={[
                      styles.moodChip,
                      {
                        backgroundColor: mood === m.value ? theme.primary : theme.surfaceElevated,
                        borderColor: mood === m.value ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setMood(m.value)}
                  >
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    <Text
                      style={[
                        styles.moodLabel,
                        { color: mood === m.value ? '#FFF' : theme.textSecondary },
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Photo picker */}
              <TouchableOpacity
                style={[styles.photoBtn, { borderColor: theme.border }]}
                onPress={pickPhoto}
              >
                <Ionicons name="camera-outline" size={18} color={theme.primary} />
                <Text style={[styles.photoBtnText, { color: theme.primary }]}>
                  Add Photos ({photos.length}/10)
                </Text>
              </TouchableOpacity>

              {photos.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                  {photos.map((uri, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setPhotos(photos.filter((_, j) => j !== i))}
                    >
                      <Image source={{ uri }} style={styles.photoThumb} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Actions */}
              <View style={styles.formBtns}>
                <TouchableOpacity
                  style={[styles.formBtn, { backgroundColor: theme.surfacePressed }]}
                  onPress={() => setShowForm(false)}
                >
                  <Text style={[styles.formBtnSecondaryText, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formBtn, { backgroundColor: theme.primary }]}
                  onPress={handleAddEntry}
                >
                  <Text style={styles.formBtnText}>Save Entry</Text>
                </TouchableOpacity>
              </View>
            </View>
          </AnimatedCard>
        )}

        {/* Entries list */}
        {entries.length === 0 && !showForm ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No journal entries yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Start documenting your travel memories!
            </Text>
          </View>
        ) : (
          entries.map((entry, i) => (
            <AnimatedCard key={entry.id} delay={i * 60}>
              <View
                style={[
                  styles.entryCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View style={styles.entryHeader}>
                  <Text style={styles.entryMood}>{getMoodEmoji(entry.mood)}</Text>
                  <View style={styles.entryHeaderInfo}>
                    <Text style={[styles.entryTitle, { color: theme.textPrimary }]}>
                      {entry.title}
                    </Text>
                    <Text style={[styles.entryDate, { color: theme.textTertiary }]}>
                      {formatDate(entry.createdAt)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(entry.id)}>
                    <Ionicons name="trash-outline" size={18} color={theme.error} />
                  </TouchableOpacity>
                </View>

                {entry.location ? (
                  <View style={styles.entryLocationRow}>
                    <Ionicons name="location-outline" size={13} color={theme.textTertiary} />
                    <Text style={[styles.entryLocation, { color: theme.textSecondary }]}>
                      {entry.location}
                    </Text>
                  </View>
                ) : null}

                {entry.content ? (
                  <Text style={[styles.entryContent, { color: theme.textPrimary }]}>
                    {entry.content}
                  </Text>
                ) : null}

                {entry.photos.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.entryPhotos}>
                    {entry.photos.map((uri, j) => (
                      <Image key={j} source={{ uri }} style={styles.entryPhotoThumb} />
                    ))}
                  </ScrollView>
                )}
              </View>
            </AnimatedCard>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  addCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, padding: spacing.lg, borderRadius: radii.lg,
    borderWidth: 1, borderStyle: 'dashed', marginBottom: spacing.lg,
  },
  addCardText: { fontFamily: 'outfit-bold', fontSize: 15 },
  formCard: {
    borderRadius: radii.lg, padding: spacing.lg + 2,
    marginBottom: spacing.lg, borderWidth: 1,
  },
  formTitle: { ...typography.subtitle, fontFamily: 'outfit-bold', marginBottom: spacing.md },
  fieldLabel: { ...typography.bodySmall, fontFamily: 'outfit-medium', marginBottom: spacing.sm, marginTop: 4 },
  input: {
    borderWidth: 1, borderRadius: radii.sm + 2,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    ...typography.body, marginBottom: spacing.md,
  },
  inputMultiline: { minHeight: 100, textAlignVertical: 'top' },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  moodChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: radii.full, borderWidth: 1,
  },
  moodEmoji: { fontSize: 16 },
  moodLabel: { fontFamily: 'outfit-medium', fontSize: 12 },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingVertical: spacing.md,
    borderRadius: radii.md, borderWidth: 1, borderStyle: 'dashed', marginBottom: spacing.md,
  },
  photoBtnText: { fontFamily: 'outfit-medium', fontSize: 13 },
  photosScroll: { marginBottom: spacing.md },
  photoThumb: { width: 64, height: 64, borderRadius: 8, marginRight: 8 },
  formBtns: { flexDirection: 'row', gap: spacing.sm + 2 },
  formBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radii.sm + 2, alignItems: 'center' },
  formBtnText: { ...typography.buttonSmall, color: '#FFF' },
  formBtnSecondaryText: { ...typography.buttonSmall },
  emptyState: { alignItems: 'center', paddingVertical: spacing['5xl'], gap: spacing.sm },
  emptyTitle: { ...typography.subtitle, fontFamily: 'outfit-bold' },
  emptySubtext: { ...typography.body, textAlign: 'center' },
  entryCard: {
    borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1,
  },
  entryHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  entryMood: { fontSize: 28 },
  entryHeaderInfo: { flex: 1 },
  entryTitle: { ...typography.subtitle, fontFamily: 'outfit-bold' },
  entryDate: { ...typography.caption, marginTop: 2 },
  entryLocationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: spacing.sm,
  },
  entryLocation: { ...typography.bodySmall },
  entryContent: { ...typography.body, marginTop: spacing.md, lineHeight: 22 },
  entryPhotos: { marginTop: spacing.md },
  entryPhotoThumb: { width: 80, height: 80, borderRadius: 10, marginRight: 8 },
});
