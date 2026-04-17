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
import { Colors } from '../constants/theme';

export interface MapboxPlace {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
  place_type: string[];
}

interface Props {
  placeholder?: string;
  onPlaceSelect: (place: MapboxPlace) => void;
}

const MAPBOX_BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export default function MapboxAutocomplete({
  placeholder = 'Search destination…',
  onPlaceSelect,
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MapboxPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    debounceRef.current = setTimeout(() => fetchPlaces(text), 350);
  };

  const handleSelect = (place: MapboxPlace) => {
    setQuery(place.place_name);
    setResults([]);
    onPlaceSelect(place);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Ionicons name="search" size={18} color={Colors.GRAY} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.GRAY}
          value={query}
          onChangeText={onChangeText}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color={Colors.PRIMARY} style={styles.icon} />}
        {!loading && query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery('');
              setResults([]);
            }}
            style={styles.icon}
          >
            <Ionicons name="close-circle" size={18} color={Colors.GRAY} />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          style={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
              <Ionicons name="location-outline" size={16} color={Colors.PRIMARY} />
              <View style={styles.resultText}>
                <Text style={styles.resultMain} numberOfLines={1}>
                  {item.text}
                </Text>
                <Text style={styles.resultSub} numberOfLines={1}>
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
    backgroundColor: Colors.WHITE,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
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
    color: Colors.DARK,
  },
  list: {
    marginTop: 6,
    backgroundColor: Colors.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  resultText: {
    flex: 1,
  },
  resultMain: {
    fontFamily: 'outfit-medium',
    fontSize: 15,
    color: Colors.DARK,
  },
  resultSub: {
    fontFamily: 'outfit',
    fontSize: 12,
    color: Colors.GRAY,
    marginTop: 1,
  },
  errorBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
  },
  errorText: {
    color: Colors.ERROR,
    fontFamily: 'outfit',
    fontSize: 13,
  },
});
