import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export interface MapboxPlace {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
  place_type: string[];
}

const MAPBOX_BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const DEBOUNCE_DELAY_MS = 350;

interface Props {
  placeholder?: string;
  onPlaceSelect: (place: MapboxPlace) => void;
}

export default function MapboxAutocomplete({
  placeholder = 'Search destination…',
  onPlaceSelect,
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MapboxPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { theme } = useTheme();

  const fetchPlaces = useCallback(async (text: string) => {
    if (!text.trim() || text.length < 2) {
      setResults([]);
      return;
    }

    const apiKey = process.env.EXPO_PUBLIC_MAPBOX_KEY;
    if (!apiKey) {
      setError('Mapbox API key missing. Add EXPO_PUBLIC_MAPBOX_KEY to your .env file.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const encoded = encodeURIComponent(text);
      const url = `${MAPBOX_BASE}/${encoded}.json?access_token=${apiKey}&types=place,district,region,country&limit=6&language=en`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResults(json.features ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to fetch places: ${msg}`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPlaces(text), DEBOUNCE_DELAY_MS);
  };

  const handleSelect = (place: MapboxPlace) => {
    setQuery(place.place_name);
    setResults([]);
    onPlaceSelect(place);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
        <Ionicons name="search" size={18} color={theme.textTertiary} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: theme.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textTertiary}
          value={query}
          onChangeText={onChangeText}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color={theme.primary} style={styles.icon} />}
        {!loading && query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery('');
              setResults([]);
            }}
            style={styles.icon}
          >
            <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: theme.errorLight }]}>
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        </View>
      ) : null}

      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          style={[styles.list, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.resultItem, { borderBottomColor: theme.divider }]} onPress={() => handleSelect(item)}>
              <Ionicons name="location-outline" size={16} color={theme.primary} />
              <View style={styles.resultText}>
                <Text style={[styles.resultMain, { color: theme.textPrimary }]} numberOfLines={1}>
                  {item.text}
                </Text>
                <Text style={[styles.resultSub, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.place_name}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  icon: {
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'outfit',
  },
  list: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1,
    maxHeight: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  resultText: {
    flex: 1,
  },
  resultMain: {
    fontFamily: 'outfit-medium',
    fontSize: 15,
  },
  resultSub: {
    fontFamily: 'outfit',
    fontSize: 12,
    marginTop: 1,
  },
  errorBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    fontFamily: 'outfit',
    fontSize: 13,
  },
});
