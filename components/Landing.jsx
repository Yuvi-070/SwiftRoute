import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { radii, spacing, typography } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import AnimatedCard from './ui/AnimatedCard';
import PressableScale from './ui/PressableScale';

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
        <PressableScale style={[styles.navBtn, { backgroundColor: theme.primaryMuted }]} onPress={onGetStarted}>
          <Text style={[styles.navBtnText, { color: theme.primary }]}>Sign In</Text>
        </PressableScale>
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

          <PressableScale style={[styles.ctaBtn, { backgroundColor: theme.primary }]} onPress={onGetStarted}>
            <Text style={styles.ctaText}>Get Started for Free</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </PressableScale>
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

      {/* How it works */}
      <View style={[styles.section, { borderTopColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>How it works</Text>
        <View style={[styles.stepsRow, isWeb && styles.stepsRowWeb]}>
          <StepCard index="01" title="Tell us your trip" desc="Destination, dates, travelers, and budget." />
          <StepCard index="02" title="Generate with AI" desc="A day‑by‑day plan with costs, tips, and packing." />
          <StepCard index="03" title="Customize & go" desc="Edit, move activities across days, and add places you love." />
        </View>
      </View>

      {/* Social proof */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Loved by planners</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          A premium-feeling travel workflow: plan, pack, track, and share.
        </Text>
        <View style={[styles.testimonialsRow, isWeb && styles.testimonialsRowWeb]}>
          <TestimonialCard quote="The itinerary editor is a game changer. I moved spots between days in seconds." name="Aarav" role="Weekend traveler" />
          <TestimonialCard quote="Packing list + expenses in one place made our group trip so smooth." name="Meera" role="Group organizer" />
          <TestimonialCard quote="Fast AI results and a clean UI. Feels like a real product." name="Kabir" role="Frequent flyer" />
        </View>
      </View>

      {/* Footer CTA */}
      <View style={[styles.footerCta, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <View style={styles.footerInner}>
          <Text style={[styles.footerTitle, { color: theme.textPrimary }]}>Ready to plan your next trip?</Text>
          <Text style={[styles.footerSubtitle, { color: theme.textSecondary }]}>
            Create a beautiful itinerary, refine it your way, then share it with your friends.
          </Text>
          <PressableScale style={[styles.ctaBtn, { backgroundColor: theme.primary }]} onPress={onGetStarted}>
            <Text style={styles.ctaText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </PressableScale>
        </View>
      </View>
    </ScrollView>
  );
}

function FeatureCard({ icon, title, desc }) {
  const { theme } = useTheme();
  return (
    <AnimatedCard delay={100} style={Platform.OS === 'web' ? { width: '47%', flexGrow: 1 } : { width: '100%' }}>
      <View style={[styles.featureCard, { backgroundColor: 'rgba(30, 41, 59, 0.6)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
        <View style={[styles.featureIconBox, { backgroundColor: theme.primaryMuted }]}>
          <Ionicons name={icon} size={24} color={theme.primary} />
        </View>
        <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>{desc}</Text>
      </View>
    </AnimatedCard>
  );
}

function StepCard({ index, title, desc }) {
  const { theme } = useTheme();
  return (
    <AnimatedCard delay={200} style={{ flex: 1 }}>
      <View style={[styles.stepCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.stepIndex, { color: theme.primary }]}>{index}</Text>
        <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>{desc}</Text>
      </View>
    </AnimatedCard>
  );
}

function TestimonialCard({ quote, name, role }) {
  const { theme } = useTheme();
  return (
    <AnimatedCard delay={300} style={{ flex: 1 }}>
      <View style={[styles.testimonialCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.testimonialQuote, { color: theme.textPrimary }]}>“{quote}”</Text>
        <View style={styles.testimonialMeta}>
          <View style={[styles.testimonialAvatar, { backgroundColor: theme.primaryMuted }]}>
            <Ionicons name="person" size={16} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.testimonialName, { color: theme.textPrimary }]}>{name}</Text>
            <Text style={[styles.testimonialRole, { color: theme.textTertiary }]}>{role}</Text>
          </View>
        </View>
      </View>
    </AnimatedCard>
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
    width: '100%',
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
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: 28,
    marginTop: 16,
    borderTopWidth: 1,
  },
  sectionTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
    ...Platform.select({ web: { textAlign: 'left' } }),
  },
  sectionSubtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: 760,
    alignSelf: 'center',
    ...Platform.select({ web: { textAlign: 'left', alignSelf: 'flex-start' } }),
  },
  stepsRow: {
    width: '100%',
    gap: 14,
  },
  stepsRowWeb: {
    flexDirection: 'row',
  },
  stepCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.xl,
    flex: 1,
    width: '100%',
  },
  stepIndex: {
    fontFamily: 'outfit-bold',
    letterSpacing: 1,
    fontSize: 12,
    marginBottom: 8,
  },
  stepTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 18,
    marginBottom: 6,
  },
  stepDesc: {
    ...typography.body,
  },
  testimonialsRow: {
    width: '100%',
    gap: 14,
  },
  testimonialsRowWeb: {
    flexDirection: 'row',
  },
  testimonialCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.xl,
    flex: 1,
    width: '100%',
  },
  testimonialQuote: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  testimonialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: spacing.lg,
  },
  testimonialAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialName: {
    fontFamily: 'outfit-bold',
    fontSize: 14,
  },
  testimonialRole: {
    ...typography.caption,
  },
  footerCta: {
    marginTop: 28,
    paddingHorizontal: spacing.xl,
    paddingVertical: 34,
    borderTopWidth: 1,
  },
  footerInner: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 10,
  },
  footerTitle: {
    ...typography.h2,
    textAlign: 'center',
  },
  footerSubtitle: {
    ...typography.body,
    textAlign: 'center',
    maxWidth: 760,
    marginBottom: spacing.md,
  },
});
