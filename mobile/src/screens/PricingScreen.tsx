/**
 * Pricing Screen
 * Display subscription tiers and features
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Zap, Crown, Sparkles } from 'lucide-react-native';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { COLORS, SPACING, FONTS } from '../utils/constants';
import { useTheme } from '../hooks/useTheme';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  icon: any;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out Talor',
    icon: Sparkles,
    features: [
      '1 resume upload',
      '1 resume tailoring',
      'Basic ATS analysis',
      'Resume keyword matching',
      'Basic interview prep',
      'Application tracker (5 jobs)',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$15',
    period: 'per month',
    description: 'Everything you need to accelerate your job search',
    icon: Zap,
    highlighted: true,
    features: [
      'Unlimited resume uploads',
      'Unlimited resume tailoring',
      'Batch tailoring (10 jobs at once)',
      'Full ATS optimization',
      'Advanced keyword analysis',
      'Complete interview prep',
      'Company research & intelligence',
      '30 tailored practice questions',
      'STAR story builder with recording',
      'Cover letter generator (5 tones)',
      'Career path designer',
      'Certification recommendations',
      'Application tracker (unlimited)',
      'Side-by-side resume comparison',
      'Priority support',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$199',
    period: 'one-time',
    description: 'One-time payment, unlimited access forever',
    icon: Crown,
    features: [
      'Everything in Pro',
      'Lifetime access (no recurring fees)',
      'All future features included',
      'Priority feature requests',
      'VIP support',
      'Early access to new features',
    ],
  },
];

export default function PricingScreen() {
  const { colors, isDark } = useTheme();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>(
    'monthly'
  );

  const ds = useMemo(() => ({
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    billingToggle: { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
    billingOptionText: { color: colors.textSecondary },
    tierName: { color: colors.text },
    tierDescription: { color: colors.textSecondary },
    price: { color: colors.text },
    period: { color: colors.textSecondary },
    featureText: { color: colors.text },
    faqTitle: { color: colors.text },
    faqQuestion: { color: colors.text },
    faqAnswer: { color: colors.textSecondary },
  }), [colors, isDark]);

  const handleSubscribe = (tierId: string) => {
    if (tierId === 'free') {
      Alert.alert('Free Plan', 'You are already on the Free plan. Start using the app!');
      return;
    }
    Alert.alert(
      'Coming Soon',
      'In-app subscriptions are coming soon. Stay tuned!',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, ds.container]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, ds.title]}>Choose Your Plan</Text>
        </View>
        <Text style={[styles.subtitle, ds.subtitle]}>
          Unlock powerful features to accelerate your job search
        </Text>

        {/* Billing Period Toggle */}
        <View style={[styles.billingToggle, ds.billingToggle]}>
          <TouchableOpacity
            onPress={() => setBillingPeriod('monthly')}
            style={[
              styles.billingOption,
              billingPeriod === 'monthly' && styles.billingOptionActive,
            ]}
          >
            <Text
              style={[
                styles.billingOptionText,
                ds.billingOptionText,
                billingPeriod === 'monthly' && styles.billingOptionTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setBillingPeriod('annually')}
            style={[
              styles.billingOption,
              billingPeriod === 'annually' && styles.billingOptionActive,
            ]}
          >
            <Text
              style={[
                styles.billingOptionText,
                ds.billingOptionText,
                billingPeriod === 'annually' && styles.billingOptionTextActive,
              ]}
            >
              Annually
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save 45%</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Pricing Cards */}
        <View style={styles.pricingCards}>
          {pricingTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <GlassCard
                key={tier.id}
                style={[
                  styles.pricingCard,
                  tier.highlighted && styles.pricingCardHighlighted,
                ]}
              >
                {tier.highlighted && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>Most Popular</Text>
                  </View>
                )}

                <View style={styles.cardHeader}>
                  <Icon
                    size={32}
                    color={tier.highlighted ? colors.accent : colors.textSecondary}
                  />
                  <Text style={[styles.tierName, ds.tierName]}>{tier.name}</Text>
                  <Text style={[styles.tierDescription, ds.tierDescription]}>
                    {tier.description}
                  </Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={[styles.price, ds.price]}>
                    {tier.id === 'pro' && billingPeriod === 'annually' ? '$99' : tier.price}
                  </Text>
                  <Text style={[styles.period, ds.period]}>
                    {tier.id === 'pro'
                      ? billingPeriod === 'annually' ? '/year' : '/month'
                      : tier.period}
                  </Text>
                  {tier.id === 'pro' && billingPeriod === 'annually' && (
                    <Text style={[styles.savingsNote, { color: COLORS.success }]}>
                      Save $81/year vs monthly
                    </Text>
                  )}
                </View>

                <View style={styles.features}>
                  {tier.features.map((feature, index) => (
                    <View key={index} style={styles.feature}>
                      <Check size={18} color={COLORS.success} />
                      <Text style={[styles.featureText, ds.featureText]}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <GlassButton
                  onPress={() => handleSubscribe(tier.id)}
                  variant={tier.highlighted ? 'primary' : 'secondary'}
                  style={styles.subscribeButton}
                >
                  <Text
                    style={[
                      styles.subscribeButtonText,
                      tier.highlighted && styles.subscribeButtonTextPrimary,
                    ]}
                  >
                    {tier.id === 'free' ? 'Get Started' : 'Subscribe'}
                  </Text>
                </GlassButton>
              </GlassCard>
            );
          })}
        </View>

        {/* FAQ */}
        <GlassCard style={styles.faqCard}>
          <Text style={[styles.faqTitle, ds.faqTitle]}>Frequently Asked Questions</Text>

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, ds.faqQuestion]}>Can I cancel anytime?</Text>
            <Text style={[styles.faqAnswer, ds.faqAnswer]}>
              Yes, you can cancel your subscription at any time. No questions asked.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, ds.faqQuestion]}>
              What payment methods do you accept?
            </Text>
            <Text style={[styles.faqAnswer, ds.faqAnswer]}>
              Payments are handled securely through Apple's App Store.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, ds.faqQuestion]}>Is the Lifetime plan really lifetime?</Text>
            <Text style={[styles.faqAnswer, ds.faqAnswer]}>
              Yes! Pay once and get access to all current and future features forever. No recurring fees, ever.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, ds.faqQuestion]}>Can I upgrade or downgrade my plan?</Text>
            <Text style={[styles.faqAnswer, ds.faqAnswer]}>
              Absolutely. You can upgrade from Free to Pro or Lifetime anytime. Downgrades take effect at the end of your current billing cycle.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, ds.faqQuestion]}>How do I manage my subscription?</Text>
            <Text style={[styles.faqAnswer, ds.faqAnswer]}>
              You can manage or cancel your subscription anytime through your Apple ID settings in the App Store.
            </Text>
          </View>
        </GlassCard>

        {/* Trust Signals */}
        <View style={styles.trustSection}>
          <Text style={[styles.trustText, ds.faqAnswer]}>
            Trusted by professionals worldwide
          </Text>
          <Text style={[styles.trustText, ds.faqAnswer]}>
            Secure payments via the App Store
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: 0,
    paddingBottom: SPACING.xs,
  },
  title: {
    fontSize: 34,
    fontFamily: FONTS.semibold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    maxWidth: 320,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  billingToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  billingOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  billingOptionActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  billingOptionText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  billingOptionTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
  },
  saveBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: FONTS.semibold,
  },
  pricingCards: {
    gap: 16,
    marginBottom: 24,
  },
  pricingCard: {
    padding: 24,
    position: 'relative',
  },
  pricingCardHighlighted: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  popularBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: FONTS.semibold,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tierName: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    marginTop: 12,
    marginBottom: 8,
  },
  tierDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  price: {
    fontSize: 48,
    fontFamily: FONTS.bold,
  },
  period: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginTop: 4,
  },
  features: {
    gap: 12,
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  subscribeButton: {},
  subscribeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
  subscribeButtonTextPrimary: {
    color: '#FFF',
  },
  faqCard: {
    padding: 20,
  },
  faqTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  savingsNote: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginTop: 4,
  },
  trustSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  trustText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
