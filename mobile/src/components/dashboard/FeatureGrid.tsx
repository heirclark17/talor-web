import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SPACING } from '../../utils/constants';
import { DASHBOARD_FEATURES, FEATURE_CATEGORIES } from '../../constants/dashboardFeatures';
import { FeatureCard } from './FeatureCard';

export function FeatureGrid() {
  const { colors } = useTheme();

  // Group features by category
  const groupedFeatures = FEATURE_CATEGORIES.map((category) => ({
    category,
    features: DASHBOARD_FEATURES.filter((f) => f.category === category),
  }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {groupedFeatures.map(({ category, features }) => {
        // Chunk features into rows of 2
        const rows: typeof features[] = [];
        for (let i = 0; i < features.length; i += 2) {
          rows.push(features.slice(i, i + 2));
        }

        return (
          <View key={category} style={styles.section}>
            <Text style={[styles.categoryHeader, { color: colors.textTertiary }]}>
              {category.toUpperCase()}
            </Text>
            {rows.map((row, rowIdx) => {
              const cards = row.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} />
              ));

              // Add spacer if odd number in last row
              if (row.length === 1) {
                cards.push(<View key="spacer" style={{ flex: 1 }} />);
              }

              return (
                <View key={rowIdx} style={styles.row}>
                  {cards}
                </View>
              );
            })}
          </View>
        );
      })}
      {/* Bottom padding for safe area */}
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.screenMargin,
    paddingTop: 8,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  categoryHeader: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.cardGap,
    marginBottom: SPACING.cardGap,
  },
});
