import React from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { TYPOGRAPHY, FONTS } from '../../utils/constants';

interface GreetingViewProps {
  greeting: string;
  userName: string;
  animatedStyle: AnimatedStyle;
  onDismiss: () => void;
}

export function GreetingView({ greeting, userName, animatedStyle, onDismiss }: GreetingViewProps) {
  const { colors } = useTheme();

  return (
    <TouchableWithoutFeedback onPress={onDismiss}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.content}>
          <Animated.Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {greeting}
          </Animated.Text>
          <Animated.Text style={[styles.name, { color: colors.text }]}>
            {userName}
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { color: colors.textTertiary }]}>
            Your career tools are ready.
          </Animated.Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  greeting: {
    ...TYPOGRAPHY.title2,
    marginBottom: 4,
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: 34,
    lineHeight: 41,
    marginBottom: 12,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
  },
});
