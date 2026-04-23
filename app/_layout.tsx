import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TripProvider } from "../context/TripContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { NetworkProvider } from "../context/NetworkContext";
import { View, Platform } from "react-native";

function InnerLayout() {
  const { theme } = useTheme();
  const isWeb = Platform.OS === 'web';

  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="create-trip"
          options={{ headerShown: true, animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="itinerary/[id]" />
        <Stack.Screen name="packing-list/[id]" />
        <Stack.Screen name="expense-tracker/[id]" />
        <Stack.Screen
          name="chat/[id]"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="currency"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="weather/[id]"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="onboarding"
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name="journal/[id]" />
        <Stack.Screen
          name="insights"
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useFonts({
    'outfit': require('../assets/fonts/Outfit-Regular.ttf'),
    'outfit-bold': require('../assets/fonts/Outfit-Bold.ttf'),
    'outfit-medium': require('../assets/fonts/Outfit-Medium.ttf'),
  });

  return (
    <ThemeProvider>
      <NetworkProvider>
        <TripProvider>
          <InnerLayout />
        </TripProvider>
      </NetworkProvider>
    </ThemeProvider>
  );
}
