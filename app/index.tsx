import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from "react-native";
import Login from "../components/Login";
import Landing from "../components/Landing";
import { auth } from "../configs/firebaseConfig";

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [showLogin, setShowLogin] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const user = auth.currentUser;
  const router = useRouter();

  React.useEffect(() => {
    async function checkOnboarding() {
      if (user) {
        (router as any).replace('/(tabs)/mytrip');
        return;
      }
      
      const hasSeenOnboarding = await AsyncStorage.getItem('@swiftroute:onboardingSeen');
      if (hasSeenOnboarding !== 'true') {
        (router as any).replace('/onboarding');
      } else {
        setIsReady(true);
      }
    }
    checkOnboarding();
  }, [user, router]);

  if (!isReady && !user) {
    return null; // Or a splash screen / loading spinner
  }

  return (
    <View style={{ flex: 1 }}>
      {!user && (
        showLogin ? <Login /> : <Landing onGetStarted={() => setShowLogin(true)} />
      )}
    </View>
  );
}
