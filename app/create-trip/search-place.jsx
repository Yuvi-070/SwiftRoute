import { useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapboxAutocomplete from '../../components/MapboxAutocomplete';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../constants/theme';

export default function SearchPlace() {
  const navigation = useNavigation();
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: false,
      headerTitle: 'Search Destination',
      headerTintColor: theme.textPrimary,
      headerStyle: { backgroundColor: theme.surface },
    });
  }, [navigation, theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.hint, { color: theme.textSecondary }]}>
        Search for a city or country to start your trip.
      </Text>
      <MapboxAutocomplete
        placeholder="e.g. Paris, Tokyo, New York…"
        onPlaceSelect={(place) => {
          router.replace({
            pathname: '/create-trip',
            params: {
              destination: place.place_name,
              lat: place.center[1],
              lng: place.center[0],
            },
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  hint: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
});
