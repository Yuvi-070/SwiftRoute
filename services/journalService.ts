/**
 * Journal Service — Travel journal/diary storage.
 * Uses AsyncStorage (free, no API needed).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const JOURNAL_KEY = (tripId: string) => `@swiftroute:journal:${tripId}`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JournalEntry {
  id: string;
  tripId: string;
  title: string;
  content: string;
  mood: 'amazing' | 'good' | 'okay' | 'tired' | 'bad';
  photos: string[];       // local URIs from expo-image-picker
  location?: string;
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}

// ─── CRUD operations ──────────────────────────────────────────────────────────

export async function loadJournalEntries(
  tripId: string
): Promise<JournalEntry[]> {
  const raw = await AsyncStorage.getItem(JOURNAL_KEY(tripId));
  return raw ? (JSON.parse(raw) as JournalEntry[]) : [];
}

export async function saveJournalEntries(
  tripId: string,
  entries: JournalEntry[]
): Promise<void> {
  await AsyncStorage.setItem(JOURNAL_KEY(tripId), JSON.stringify(entries));
}

export async function addJournalEntry(
  tripId: string,
  entry: Omit<JournalEntry, 'id' | 'tripId' | 'createdAt' | 'updatedAt'>
): Promise<JournalEntry> {
  const entries = await loadJournalEntries(tripId);
  const now = new Date().toISOString();
  const newEntry: JournalEntry = {
    ...entry,
    id: `journal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    tripId,
    createdAt: now,
    updatedAt: now,
  };
  const updated = [newEntry, ...entries];
  await saveJournalEntries(tripId, updated);
  return newEntry;
}

export async function updateJournalEntry(
  tripId: string,
  entryId: string,
  updates: Partial<Pick<JournalEntry, 'title' | 'content' | 'mood' | 'photos' | 'location'>>
): Promise<void> {
  const entries = await loadJournalEntries(tripId);
  const idx = entries.findIndex((e) => e.id === entryId);
  if (idx === -1) return;
  entries[idx] = {
    ...entries[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await saveJournalEntries(tripId, entries);
}

export async function deleteJournalEntry(
  tripId: string,
  entryId: string
): Promise<void> {
  const entries = await loadJournalEntries(tripId);
  const filtered = entries.filter((e) => e.id !== entryId);
  await saveJournalEntries(tripId, filtered);
}

// ─── Mood helpers ─────────────────────────────────────────────────────────────

export const MOOD_OPTIONS = [
  { value: 'amazing' as const, emoji: '🤩', label: 'Amazing' },
  { value: 'good' as const, emoji: '😊', label: 'Good' },
  { value: 'okay' as const, emoji: '😐', label: 'Okay' },
  { value: 'tired' as const, emoji: '😴', label: 'Tired' },
  { value: 'bad' as const, emoji: '😞', label: 'Bad' },
];

export function getMoodEmoji(mood: JournalEntry['mood']): string {
  return MOOD_OPTIONS.find((m) => m.value === mood)?.emoji ?? '😊';
}
