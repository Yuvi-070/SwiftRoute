
// Import the functions you need from the SDKs you need
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD9FyDtAmyuJ1RE2c2OafJorUYy9-g6k5w",
  authDomain: "ai-travel-planner-beb9e.firebaseapp.com",
  projectId: "ai-travel-planner-beb9e",
  storageBucket: "ai-travel-planner-beb9e.firebasestorage.app",
  messagingSenderId: "871333085607",
  appId: "1:871333085607:web:827fb9a3468167c774b682",
  measurementId: "G-SXWQM0W61W"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Try to initialize Auth with React Native AsyncStorage persistence.
// If AsyncStorage isn't available, fall back to getAuth which uses memory persistence.
let _auth;
try {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (_e) {
  // If initializeAuth fails (for example, native AsyncStorage not linked), fall back.
  _auth = getAuth(app);
}

export const auth = _auth;
