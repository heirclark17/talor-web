import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import {
  Building2, Info, Newspaper, Package, TrendingUp, DollarSign,
  ThumbsUp, Star, ChevronUp, ChevronDown
} from 'lucide-react-native';
import { GlassCard } from '../glass/GlassCard';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../../utils/constants';
import { CompanyResearch, ThemeColors } from './types';

interface CompanyResearchCardProps {
  research: CompanyResearch;
  loading: boolean;
  colors: ThemeColors & { backgroundTertiary?: string; textTertiary?: string };
}

export const CompanyResearchCard: React.FC<CompanyResearchCardProps> = ({ research, loading, colors }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  const getFinancialStatusColor = (status: string) => {
    if (status === 'good') return COLORS.success;
    if (status === 'fair') return COLORS.warning;
    return COLORS.error;
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'positive') return COLORS.success;
    if (sentiment === 'neutral') return COLORS.warning;
    return COLORS.error;
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <GlassCard style={styles.companyResearchCard} material="regular">
        <View style={styles.companyResearchHeader}>
          <View style={[styles.companyResearchIcon, { backgroundColor: ALPHA_COLORS.info.bg }]}>
            <Building2 color={COLORS.info} size={24} />
          </View>
          <Text style={[styles.companyResearchTitle, { color: colors.text }]}>Company Research</Text>
        </View>
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.companyResearchLoader} />
      </GlassCard>
    );
  }

  if (!research) {
    return null;
  }

  return (
    <GlassCard style={styles.companyResearchCard} material="regular">
      <View style={styles.companyResearchHeader}>
        <View style={[styles.companyResearchIcon, { backgroundColor: ALPHA_COLORS.info.bg }]}>
          <Building2 color={COLORS.info} size={24} />
        </View>
        <Text style={[styles.companyResearchTitle, { color: colors.text }]}>Company Research</Text>
      </View>

      {/* Company Overview */}
      <View style={styles.companyResearchSection}>
        <TouchableOpacity
          style={styles.companyResearchSubheader}
          onPress={() => toggleSection('overview')}
          accessibilityRole="button"
        >
          <View style={styles.companyResearchSubheaderLeft}>
            <Info color={COLORS.info} size={16} />
            <Text style={[styles.companyResearchSubtitle, { color: colors.text }]}>Company Overview</Text>
          </View>
          {expandedSection === 'overview' ? (
            <ChevronUp color={colors.textSecondary} size={18} />
          ) : (
            <ChevronDown color={colors.textSecondary} size={18} />
          )}
        </TouchableOpacity>
        {expandedSection === 'overview' && research.company_overview && (
          <Text style={[styles.companyResearchText, { color: colors.textSecondary }]}>
            {research.company_overview}
          </Text>
        )}
      </View>

      {/* Recent News */}
      {research.recent_news && research.recent_news.length > 0 && (
        <View style={styles.companyResearchSection}>
          <TouchableOpacity
            style={styles.companyResearchSubheader}
            onPress={() => toggleSection('news')}
            accessibilityRole="button"
          >
            <View style={styles.companyResearchSubheaderLeft}>
              <Newspaper color={COLORS.purple} size={16} />
              <Text style={[styles.companyResearchSubtitle, { color: colors.text }]}>
                Recent News ({research.recent_news.length})
              </Text>
            </View>
            {expandedSection === 'news' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'news' && (
            <View style={styles.companyResearchList}>
              {research.recent_news.map((newsItem, index) => (
                <View
                  key={index}
                  style={[styles.companyResearchNewsItem, { backgroundColor: colors.backgroundTertiary }]}
                >
                  <Text style={[styles.companyResearchNewsHeadline, { color: colors.text }]}>
                    {newsItem.headline}
                  </Text>
                  {newsItem.date && (
                    <Text style={[styles.companyResearchNewsDate, { color: colors.textTertiary }]}>
                      {newsItem.date}
                    </Text>
                  )}
                  <Text style={[styles.companyResearchNewsSummary, { color: colors.textSecondary }]}>
                    {newsItem.summary}
                  </Text>
                  {newsItem.source && (
                    <Text style={[styles.companyResearchNewsSource, { color: colors.textTertiary }]}>
                      Source: {newsItem.source}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Key Products & Services */}
      {research.key_products_services && research.key_products_services.length > 0 && (
        <View style={styles.companyResearchSection}>
          <TouchableOpacity
            style={styles.companyResearchSubheader}
            onPress={() => toggleSection('products')}
            accessibilityRole="button"
          >
            <View style={styles.companyResearchSubheaderLeft}>
              <Package color={COLORS.success} size={16} />
              <Text style={[styles.companyResearchSubtitle, { color: colors.text }]}>
                Key Products & Services
              </Text>
            </View>
            {expandedSection === 'products' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'products' && (
            <View style={styles.companyResearchList}>
              {research.key_products_services.map((product, index) => (
                <View key={index} style={styles.companyResearchBulletItem}>
                  <View style={[styles.bulletDot, { backgroundColor: COLORS.success }]} />
                  <Text style={[styles.companyResearchBulletText, { color: colors.textSecondary }]}>
                    {product}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Competitors */}
      {research.competitors && research.competitors.length > 0 && (
        <View style={styles.companyResearchSection}>
          <TouchableOpacity
            style={styles.companyResearchSubheader}
            onPress={() => toggleSection('competitors')}
            accessibilityRole="button"
          >
            <View style={styles.companyResearchSubheaderLeft}>
              <TrendingUp color={COLORS.warning} size={16} />
              <Text style={[styles.companyResearchSubtitle, { color: colors.text }]}>
                Key Competitors
              </Text>
            </View>
            {expandedSection === 'competitors' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'competitors' && (
            <View style={styles.companyResearchList}>
              {research.competitors.map((competitor, index) => (
                <View
                  key={index}
                  style={[styles.companyResearchCompetitorItem, { backgroundColor: colors.backgroundTertiary }]}
                >
                  <Text style={[styles.companyResearchCompetitorName, { color: colors.text }]}>
                    {competitor.name}
                  </Text>
                  {competitor.context && (
                    <Text style={[styles.companyResearchCompetitorContext, { color: colors.textSecondary }]}>
                      {competitor.context}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Financial Health */}
      {research.financial_health && (
        <View style={styles.companyResearchSection}>
          <View style={styles.companyResearchInlineHeader}>
            <View style={styles.companyResearchSubheaderLeft}>
              <DollarSign color={getFinancialStatusColor(research.financial_health.status)} size={16} />
              <Text style={[styles.companyResearchSubtitle, { color: colors.text }]}>Financial Health</Text>
            </View>
            <View
              style={[
                styles.companyResearchStatusBadge,
                {
                  backgroundColor: `${getFinancialStatusColor(research.financial_health.status)}20`,
                  borderColor: getFinancialStatusColor(research.financial_health.status),
                },
              ]}
            >
              <Text
                style={[
                  styles.companyResearchStatusText,
                  { color: getFinancialStatusColor(research.financial_health.status) },
                ]}
              >
                {research.financial_health.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={[styles.companyResearchText, { color: colors.textSecondary, marginTop: SPACING.sm }]}>
            {research.financial_health.summary}
          </Text>
        </View>
      )}

      {/* Employee Sentiment */}
      {research.employee_sentiment && (
        <View style={styles.companyResearchSection}>
          <View style={styles.companyResearchInlineHeader}>
            <View style={styles.companyResearchSubheaderLeft}>
              <ThumbsUp color={getSentimentColor(research.employee_sentiment.sentiment)} size={16} />
              <Text style={[styles.companyResearchSubtitle, { color: colors.text }]}>Employee Sentiment</Text>
            </View>
            <View style={styles.companyResearchRatingContainer}>
              {research.employee_sentiment.rating && (
                <View style={styles.companyResearchRating}>
                  <Star
                    color={getSentimentColor(research.employee_sentiment.sentiment)}
                    size={14}
                    fill={getSentimentColor(research.employee_sentiment.sentiment)}
                  />
                  <Text
                    style={[
                      styles.companyResearchRatingText,
                      { color: getSentimentColor(research.employee_sentiment.sentiment) },
                    ]}
                  >
                    {research.employee_sentiment.rating.toFixed(1)}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.companyResearchStatusBadge,
                  {
                    backgroundColor: `${getSentimentColor(research.employee_sentiment.sentiment)}20`,
                    borderColor: getSentimentColor(research.employee_sentiment.sentiment),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.companyResearchStatusText,
                    { color: getSentimentColor(research.employee_sentiment.sentiment) },
                  ]}
                >
                  {research.employee_sentiment.sentiment.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          <Text style={[styles.companyResearchText, { color: colors.textSecondary, marginTop: SPACING.sm }]}>
            {research.employee_sentiment.summary}
          </Text>
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  companyResearchCard: {
    marginBottom: SPACING.lg,
  },
  companyResearchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  companyResearchIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  companyResearchTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  companyResearchLoader: {
    paddingVertical: SPACING.xl,
  },
  companyResearchSection: {
    marginBottom: SPACING.md,
  },
  companyResearchSubheader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  companyResearchSubheaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  companyResearchSubtitle: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
  },
  companyResearchInlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  companyResearchText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  companyResearchList: {
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  companyResearchNewsItem: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  companyResearchNewsHeadline: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  companyResearchNewsDate: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginBottom: 6,
  },
  companyResearchNewsSummary: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    marginBottom: 4,
  },
  companyResearchNewsSource: {
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  companyResearchBulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: SPACING.md,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: SPACING.sm,
  },
  companyResearchBulletText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  companyResearchCompetitorItem: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  companyResearchCompetitorName: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  companyResearchCompetitorContext: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  companyResearchStatusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  companyResearchStatusText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  companyResearchRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  companyResearchRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  companyResearchRatingText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
});
