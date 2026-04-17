import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { TripProvider } from "../context/TripContext";


export default function RootLayout() {
  useFonts({
    'outfit': require('../assets/fonts/Outfit-Regular.ttf'),
    'outfit-bold': require('../assets/fonts/Outfit-Bold.ttf'),
    'outfit-medium': require('../assets/fonts/Outfit-Medium.ttf'),
  });

  return (
    <TripProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="create-trip" options={{ headerShown: true }} />
        <Stack.Screen name="itinerary/[id]" />
        <Stack.Screen name="packing-list/[id]" />
        <Stack.Screen name="expense-tracker/[id]" />
      </Stack>
    </TripProvider>
  );
}
