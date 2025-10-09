import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { useRouter } from 'expo-router';

export default function StartNewTripCard() {


    const router = useRouter();


  return (
    <View 
    style={{
        padding:20,
        marginTop:50,
        display:'flex',
        // justifyContent:'center',
        alignItems:'center',
        gap:25,
    }}
    >
        
      <Ionicons name="location-sharp" size={30} color="black" />
      
      <Text style={{
        fontFamily:'outfit-medium',
        fontSize:25
    }}
        >
        No Trips Planned Yet
      </Text>

      <Text style={{
        fontFamily:'outfit',
        fontSize:20,
        textAlign:'center',
        color:Colors.GRAY

    }}
        >
        Look like its time to plan a new travel experience! Get Started below
      </Text>

      <TouchableOpacity 
      onPress={()=>router.push('/create-trip/search-place')}
      style={{
        backgroundColor:Colors.PRIMARY,
        padding:15,
        borderRadius:15,
        paddingHorizontal:30
      }}>
        <Text style={{
            color:Colors.WHITE,
            fontFamily:'outfit-medium',
            fontSize:18
        }}>Start a new trip</Text>
        </TouchableOpacity>
        


    </View>
  )
}