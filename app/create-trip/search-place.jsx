import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

// import { useRouter } from 'expo-router'
// import Ionicons from '@expo/vector-icons/Ionicons'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Colors } from '../../constants/theme';


export default function SearchPlace() {

    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({ 
            headerShown: true,
            headerTransparent: true,
            headerTitle:'Search',
            headerTintColor:'black',
         });
    }, [navigation]);
  const [error, setError] = React.useState(null);

  return (
    <View
      style={{
        padding: 25,
        paddingTop: 75,
        backgroundColor: Colors.WHITE,
        height: '100%'
      }}
    >
      {/* ...existing code... */}
      <GooglePlacesAutocomplete
        placeholder='Search'
        onPress={(data, details = null) => {
          // 'details' is provided when fetchDetails = true
          setError(null);
          console.log(data, details);
        }}
        query={{
          key: 'AlzaSyAxOzax99f80187YCgbOHRs3RpfE2o',
          language: 'en',
        }}
        onFail={(error) => {
          setError('Failed to fetch places. Please check your API key and network connection.');
          console.error('GooglePlacesAutocomplete error:', error);
          
        }}
      />
      {error && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#ffe6e6', borderRadius: 8 }}>
          <Text style={{ color: '#d32f2f', textAlign: 'center' }}>{error}</Text>
        </View>
      )}
    </View>
  );
}