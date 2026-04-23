import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing, typography } from '../constants/theme';

export default function Login() {
  const router = useRouter();
  const { theme } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background, flexDirection: isWeb ? 'row' : 'column' }]}>
      <View style={isWeb ? styles.webImageContainer : null}>
        <Image
          source={require('./../assets/images/login.jpg')}
          style={isWeb ? styles.webHeroImage : styles.heroImage}
          resizeMode="cover"
        />
      </View>

      <Animated.View
        style={[
          styles.card,
          isWeb ? styles.webCard : null,
          {
            backgroundColor: theme.surface,
            opacity: fadeAnim,
            transform: [{ translateY: isWeb ? 0 : slideAnim }],
          },
        ]}
      >
        {/* Pill handle */}
        {!isWeb && <View style={[styles.handle, { backgroundColor: theme.divider }]} />}

        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Welcome to SwiftRoute
        </Text>

        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Discover your next adventure effortlessly. Personalized
          itineraries at your fingertips. Travel smarter with
          AI-driven insights.
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          activeOpacity={0.85}
          onPress={() => router.push('/auth/sign-in')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInLink}
          onPress={() => router.push('/auth/sign-in')}
        >
          <Text style={[styles.signInText, { color: theme.textSecondary }]}>
            Already have an account?{' '}
            <Text style={[styles.signInTextBold, { color: theme.primary }]}>
              Sign In
            </Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  webImageContainer: {
    flex: 1.2,
  },
  webHeroImage: {
    width: '100%',
    height: '100%',
  },
  heroImage: {
    width: '100%',
    height: 480,
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 40,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  webCard: {
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: 60,
    maxWidth: 600,
    elevation: 0,
    shadowOpacity: 0,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing['3xl'],
  },
  button: {
    paddingVertical: spacing.lg,
    borderRadius: radii.full,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonText: {
    color: '#FFF',
    ...typography.button,
    letterSpacing: 0.5,
  },
  signInLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  signInText: {
    ...typography.body,
    fontSize: 14,
  },
  signInTextBold: {
    fontFamily: 'outfit-bold',
  },
});