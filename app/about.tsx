import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing, typography } from '../constants/theme';
import AnimatedCard from '../components/ui/AnimatedCard';
import { Canvas } from '@react-three/fiber';
import FloatingGem from '../components/ui/FloatingGem';

export default function AboutScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>About SwiftRoute</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 3D Header Section */}
        <AnimatedCard delay={0}>
          <View style={[styles.heroCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <View style={styles.canvasContainer}>
              <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <FloatingGem />
              </Canvas>
            </View>
            <Text style={[styles.appName, { color: theme.primary }]}>SwiftRoute AI</Text>
            <Text style={[styles.versionText, { color: theme.textTertiary }]}>Version 2.0.0 (Premium)</Text>
          </View>
        </AnimatedCard>

        <AnimatedCard delay={100}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Our Mission</Text>
          <View style={[styles.infoCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              SwiftRoute is your ultimate AI travel companion. By leveraging cutting-edge generative AI, we craft hyper-personalized, day-by-day itineraries tailored to your exact budget, travel style, and group dynamics. 
              {'\n\n'}
              Our goal is to eliminate the stress of travel planning. With our premium iOS-first design, interactive 3D elements, and real-time data integrations (like live weather and Mapbox geocoding), discovering your next adventure is as thrilling as the journey itself.
            </Text>
          </View>
        </AnimatedCard>

        <AnimatedCard delay={200}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Features</Text>
          <View style={[styles.infoCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <FeatureRow icon="sparkles" title="Smart Itineraries" desc="AI-generated day-by-day plans." />
            <FeatureRow icon="cloudy-night" title="Live Weather" desc="14-day graphical weather forecasting." />
            <FeatureRow icon="wallet" title="Expense Tracker" desc="Manage travel budgets easily." />
            <FeatureRow icon="document-text" title="PDF Exports" desc="Beautifully formatted PDF itineraries." />
          </View>
        </AnimatedCard>

        <AnimatedCard delay={300}>
          <TouchableOpacity 
            style={[styles.linkBtn, { backgroundColor: theme.primaryMuted }]}
            onPress={() => Linking.openURL('https://github.com/swiftroute')}
          >
            <Ionicons name="logo-github" size={20} color={theme.primary} />
            <Text style={[styles.linkBtnText, { color: theme.primary }]}>View Source Code</Text>
          </TouchableOpacity>
        </AnimatedCard>
        
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function FeatureRow({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.featureRow}>
      <View style={[styles.featureIcon, { backgroundColor: theme.primary + '15' }]}>
        <Ionicons name={icon as any} size={18} color={theme.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  backBtn: { padding: 4 },
  headerTitle: { ...typography.h2 },
  scrollContent: { padding: spacing.xl },
  heroCard: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  canvasContainer: {
    width: 200,
    height: 200,
    marginBottom: spacing.md,
  },
  appName: {
    fontFamily: 'outfit-bold',
    fontSize: 28,
    marginBottom: 4,
  },
  versionText: {
    fontFamily: 'outfit-medium',
    fontSize: 14,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  infoCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  infoText: {
    fontFamily: 'outfit',
    fontSize: 15,
    lineHeight: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 16,
    marginBottom: 2,
  },
  featureDesc: {
    fontFamily: 'outfit',
    fontSize: 14,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  linkBtnText: {
    fontFamily: 'outfit-bold',
    fontSize: 16,
  },
});
