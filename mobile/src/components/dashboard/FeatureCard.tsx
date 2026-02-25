import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Animated, {
  AnimatedStyle,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { GlassCard } from '../glass/GlassCard';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SPACING, ANIMATION } from '../../utils/constants';
import { mediumImpact } from '../../utils/haptics';
import { DashboardFeature } from '../../constants/dashboardFeatures';
import { MainStackParamList } from '../../navigation/AppNavigator';

interface FeatureCardProps {
  feature: DashboardFeature;
  animatedStyle: AnimatedStyle;
}

export function FeatureCard({ feature, animatedStyle }: FeatureCardProps) {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const { colors } = useTheme();
  const pressScale = useSharedValue(1);

  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePress = () => {
    mediumImpact();
    pressScale.value = withSequence(
      withSpring(0.96, ANIMATION.glassSpring),
      withSpring(1, ANIMATION.glassSpring)
    );
    // Navigate after a short delay for the animation
    setTimeout(() => {
      navigation.navigate(feature.screen as any);
    }, 100);
  };

  const IconComponent = feature.icon;
  const iconBgColor = feature.iconColor + '26'; // 15% opacity

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <Animated.View style={pressAnimatedStyle}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
          <GlassCard
            variant="elevated"
            bordered
            tintColor={feature.iconColor + '1A'}
            style={styles.card}
          >
            <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
              <IconComponent size={22} color={feature.iconColor} />
            </View>
            <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
              {feature.label}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {feature.subtitle}
            </Text>
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 104,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: FONTS.semibold,
    fontSize: 14,
    lineHeight: 18,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
  },
});
