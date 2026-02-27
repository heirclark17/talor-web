import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { GlassCard } from '../glass/GlassCard';
import { useTheme } from '../../context/ThemeContext';
import { FONTS } from '../../utils/constants';
import { mediumImpact } from '../../utils/haptics';
import { DashboardFeature } from '../../constants/dashboardFeatures';
import { MainStackParamList } from '../../navigation/AppNavigator';

interface FeatureCardProps {
  feature: DashboardFeature;
  style?: ViewStyle;
}

export function FeatureCard({ feature, style }: FeatureCardProps) {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const { colors } = useTheme();

  const handlePress = () => {
    mediumImpact();
    navigation.navigate(feature.screen as any);
  };

  const IconComponent = feature.icon;
  const iconBgColor = feature.iconColor + '26'; // 15% opacity

  return (
    <View style={[{ flex: 1 }, style]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={feature.label}>
        <GlassCard
          variant="elevated"
          bordered
          tintColor={feature.iconColor + '1A'}
          style={styles.card}
          padding={14}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
              <IconComponent size={22} color={feature.iconColor} />
            </View>
            <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
              {feature.label}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
              {feature.subtitle}
            </Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 132,
  },
  cardContent: {
    flex: 1,
    width: '100%',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontFamily: FONTS.semibold,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16,
  },
});
