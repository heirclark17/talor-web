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
import { COLORS } from '../utils/constants';
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
    description: 'Perfect for getting started',
    icon: Sparkles,
    features: [
      '3 resume uploads',
      '5 tailored resumes per month',
      'Basic ATS optimization',
      'Standard templates',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'For serious job seekers',
    icon: Zap,
    highlighted: true,
    features: [
      'Unlimited resume uploads',
      'Unlimited tailored resumes',
      'Advanced ATS optimization',
      'Premium templates',
      'Interview prep with AI',
      'Cover letter generation',
      'Priority support',
      'Export to PDF/DOCX',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For teams and organizations',
    icon: Crown,
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'Advanced analytics',
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
    if (tierId === 'enterprise') {
      Alert.alert('Enterprise', 'Contact us at support@talor.app for enterprise pricing and custom solutions.');
      return;
    }
    Alert.alert(
      'Upgrade to Pro',
      billingPeriod === 'annually'
        ? 'Pro plan: $182/year ($15.20/mo). In-app purchases coming soon.'
        : 'Pro plan: $19/month. In-app purchases coming soon.',
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
          <Text style={[styles.subtitle, ds.subtitle]}>
            Unlock powerful features to accelerate your job search
          </Text>
        </View>

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
              <Text style={styles.saveBadgeText}>Save 20%</Text>
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
                  <Text style={[styles.price, ds.price]}>{tier.price}</Text>
                  <Text style={[styles.period, ds.period]}>
                    {tier.period === 'per month' && billingPeriod === 'annually'
                      ? 'per year'
                      : tier.period}
                  </Text>
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
              We accept all major credit cards, debit cards, and PayPal.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, ds.faqQuestion]}>Is there a free trial?</Text>
            <Text style={[styles.faqAnswer, ds.faqAnswer]}>
              Yes! Pro plan includes a 7-day free trial. No credit card required.
            </Text>
          </View>
        </GlassCard>
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
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 320,
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
    fontWeight: '500',
  },
  billingOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '600',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  tierDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  period: {
    fontSize: 14,
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
  },
  subscribeButton: {},
  subscribeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  subscribeButtonTextPrimary: {
    color: '#FFF',
  },
  faqCard: {
    padding: 20,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
});
