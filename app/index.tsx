import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from "react-native";
import Login from "../components/Login";
import Landing from "../components/Landing";
import { auth } from "../configs/firebaseConfig";

export default function Index() {
  const [showLogin, setShowLogin] = useState(false);

  const user = auth.currentUser;
  const router = useRouter();

  React.useEffect(() => {
    // Cast to any here because the generated router types in this project
    // don't currently include the grouped tab paths; this preserves the
    // runtime redirect while avoiding a compile error.
    if (user) (router as any).replace('/(tabs)/mytrip');
  }, [user, router]);

  return (
    <View style={{ flex: 1 }}>
      {!user && (
        showLogin ? <Login /> : <Landing onGetStarted={() => setShowLogin(true)} />
      )}
    </View>
  );
}
