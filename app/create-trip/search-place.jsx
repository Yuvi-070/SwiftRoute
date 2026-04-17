import { useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapboxAutocomplete from '../../components/MapboxAutocomplete';
import { Colors } from '../../constants/theme';

export default function SearchPlace() {
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: false,
      headerTitle: 'Search Destination',
      headerTintColor: Colors.DARK,
      headerStyle: { backgroundColor: Colors.WHITE },
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Search for a city or country to start your trip.</Text>
      <MapboxAutocomplete
        placeholder="e.g. Paris, Tokyo, New York…"
        onPlaceSelect={(place) => {
          // Navigate to the create-trip flow with the selected destination
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
    backgroundColor: Colors.BACKGROUND,
    padding: 24,
    paddingTop: 20,
  },
  hint: {
    fontFamily: 'outfit',
    fontSize: 15,
    color: Colors.GRAY,
    marginBottom: 16,
  },
});
