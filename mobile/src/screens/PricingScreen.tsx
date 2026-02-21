/**
 * Pricing Screen
 * Display subscription tiers and features
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Zap, Crown, Sparkles } from 'lucide-react-native';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';

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
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>(
    'monthly'
  );

  const handleSubscribe = (tierId: string) => {
    // TODO: Implement subscription flow
    console.log('Subscribe to:', tierId);
    // For now, link to web version
    Linking.openURL('https://yourapp.com/pricing');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Unlock powerful features to accelerate your job search
          </Text>
        </View>

        {/* Billing Period Toggle */}
        <View style={styles.billingToggle}>
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
                    color={tier.highlighted ? '#3B82F6' : '#9CA3AF'}
                  />
                  <Text style={styles.tierName}>{tier.name}</Text>
                  <Text style={styles.tierDescription}>{tier.description}</Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{tier.price}</Text>
                  <Text style={styles.period}>
                    {tier.period === 'per month' && billingPeriod === 'annually'
                      ? 'per year'
                      : tier.period}
                  </Text>
                </View>

                <View style={styles.features}>
                  {tier.features.map((feature, index) => (
                    <View key={index} style={styles.feature}>
                      <Check size={18} color="#10B981" />
                      <Text style={styles.featureText}>{feature}</Text>
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
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
            <Text style={styles.faqAnswer}>
              Yes, you can cancel your subscription at any time. No questions asked.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What payment methods do you accept?</Text>
            <Text style={styles.faqAnswer}>
              We accept all major credit cards, debit cards, and PayPal.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Is there a free trial?</Text>
            <Text style={styles.faqAnswer}>
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
    backgroundColor: '#000',
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
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: 320,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  billingOptionTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  saveBadge: {
    backgroundColor: '#10B981',
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
    borderColor: '#3B82F6',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#3B82F6',
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
    color: '#FFF',
    marginTop: 12,
    marginBottom: 8,
  },
  tierDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
  },
  period: {
    fontSize: 14,
    color: '#9CA3AF',
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
    color: '#FFF',
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
    color: '#FFF',
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
});
