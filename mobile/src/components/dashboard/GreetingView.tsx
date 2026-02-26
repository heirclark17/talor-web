import React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { TYPOGRAPHY, FONTS } from '../../utils/constants';

interface GreetingViewProps {
  greeting: string;
  userName: string;
  animatedStyle?: ViewStyle;
  onDismiss: () => void;
}

export function GreetingView({ greeting, userName, animatedStyle, onDismiss }: GreetingViewProps) {
  const { colors } = useTheme();

  return (
    <TouchableWithoutFeedback onPress={onDismiss}>
      <View style={[styles.container, animatedStyle]}>
        <View style={styles.content}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {greeting}
          </Text>
          <Text style={[styles.name, { color: colors.text }]}>
            {userName}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
            Your career tools are ready.
          </Text>
        </View>
      </View>
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
