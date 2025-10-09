import Ionicons from '@expo/vector-icons/Ionicons';

import { Tabs } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function TabLayout() {

  return (
    <Tabs screenOptions={{
        headerShown:false,
        tabBarActiveTintColor:Colors.PRIMARY,
        }}>
        <Tabs.Screen name="mytrip" 
        options={{
          tabBarLabel:'My Trip',
          tabBarIcon: ({color, size})=><Ionicons name="location-sharp" 
          size={24} color={color} />
        }}
        />
        <Tabs.Screen name="discover"
        options={{
          tabBarLabel:'Discover',
          tabBarIcon: ({color, size})=><Ionicons name="globe-outline" 
          size={24} color={color} />
        }}
        />
        <Tabs.Screen name="profile" 
        options={{
          tabBarLabel:'Profile',
          tabBarIcon: ({color, size})=><Ionicons name="people-circle-sharp" 
          size={24} color={color} />
        }}
        />
        
    </Tabs>
  )
} 