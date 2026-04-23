import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { radii, spacing, typography } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function Landing({ onGetStarted }) {
  const { theme, isDark } = useTheme();
  const isWeb = Platform.OS === 'web';

  return (
    <ScrollView style={[styles.root, { backgroundColor: theme.background }]} contentContainerStyle={styles.scroll}>
      
      {/* Navbar */}
      <View style={[styles.nav, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
        <View style={styles.logoRow}>
          <Ionicons name="airplane" size={24} color={theme.primary} />
          <Text style={[styles.logoText, { color: theme.textPrimary }]}>SwiftRoute</Text>
        </View>
        <TouchableOpacity style={[styles.navBtn, { backgroundColor: theme.primaryMuted }]} onPress={onGetStarted}>
          <Text style={[styles.navBtnText, { color: theme.primary }]}>Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={[styles.hero, isWeb && styles.heroWeb]}>
        <View style={[styles.heroTextContainer, isWeb && styles.heroTextWeb]}>
          <View style={[styles.badge, { backgroundColor: theme.primary + '15' }]}>
            <Text style={[styles.badgeText, { color: theme.primary }]}>AI-Powered Travel</Text>
          </View>
          <Text style={[styles.headline, { color: theme.textPrimary }]}>
            Your next great adventure, planned in seconds.
          </Text>
          <Text style={[styles.subheadline, { color: theme.textSecondary }]}>
            SwiftRoute uses AI to build highly personalised day-by-day itineraries, track expenses, and give you smart packing lists—all in one premium app.
          </Text>

          <View style={styles.imageContainer}>
            <Image 
              source={require('../assets/images/hero.png')} 
              style={styles.heroImage} 
              resizeMode="cover"
            />
            {/* LinearGradient overlay could be here if needed */}
          </View>

          <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: theme.primary }]} onPress={onGetStarted}>
            <Text style={styles.ctaText}>Get Started for Free</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Feature Grid */}
        <View style={[styles.featuresGrid, isWeb && styles.featuresGridWeb]}>
          <FeatureCard 
            icon="calendar-outline" 
            title="Smart Itineraries" 
            desc="Day-by-day scheduling with cost estimates and optimal routing." 
          />
          <FeatureCard 
            icon="wallet-outline" 
            title="Expense Tracking" 
            desc="Keep your budget in check with multi-currency tracking and analytics." 
          />
          <FeatureCard 
            icon="bag-check-outline" 
            title="Packing Lists" 
            desc="Never forget essentials again with AI-generated checklists." 
          />
          <FeatureCard 
            icon="cloudy-night-outline" 
            title="Weather Forecasts" 
            desc="Real-time 7-day weather outlooks to pack appropriately." 
          />
        </View>
      </View>
    </ScrollView>
  );
}

function FeatureCard({ icon, title, desc }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.featureCard, { backgroundColor: 'rgba(30, 41, 59, 0.6)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
      <View style={[styles.featureIconBox, { backgroundColor: theme.primaryMuted }]}>
        <Ionicons name={icon} size={24} color={theme.primary} />
      </View>
      <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 60,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontFamily: 'outfit-bold',
    fontSize: 20,
  },
  navBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  navBtnText: {
    fontFamily: 'outfit-bold',
    fontSize: 14,
  },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    alignItems: 'center',
  },
  heroWeb: {
    flexDirection: 'row',
    maxWidth: 1200,
    alignSelf: 'center',
    alignItems: 'flex-start',
    gap: 60,
    paddingTop: 100,
  },
  heroTextContainer: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 40,
  },
  heroTextWeb: {
    flex: 1,
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    marginBottom: spacing.lg,
  },
  badgeText: {
    fontFamily: 'outfit-bold',
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing['2xl'],
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
      android: { elevation: 10 },
    }),
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  headline: {
    ...typography.hero,
    textAlign: 'center',
    marginBottom: spacing.md,
    ...Platform.select({
      web: { textAlign: 'left', fontSize: 48, lineHeight: 56 },
    })
  },
  subheadline: {
    ...typography.subtitle,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    maxWidth: 600,
    ...Platform.select({
      web: { textAlign: 'left', fontSize: 18, lineHeight: 28 },
    })
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: radii.full,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 4 },
      web: { cursor: 'pointer' },
    }),
  },
  ctaText: {
    fontFamily: 'outfit-bold',
    fontSize: 16,
    color: '#FFF',
  },
  featuresGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featuresGridWeb: {
    flex: 1.2,
  },
  featureCard: {
    width: Platform.OS === 'web' ? '47%' : '100%',
    flexGrow: 1,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 18,
    marginBottom: 6,
  },
  featureDesc: {
    ...typography.body,
  },
});
