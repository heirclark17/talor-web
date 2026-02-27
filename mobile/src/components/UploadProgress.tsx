/**
 * Upload Progress Component
 * Shows file upload progress with cancel option
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS, COLORS } from '../utils/constants';

interface UploadProgressProps {
  fileName: string;
  fileSize: number;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'success' | 'error';
  error?: string;
  onCancel?: () => void;
  onRetry?: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadProgress({
  fileName,
  fileSize,
  progress,
  status,
  error,
  onCancel,
  onRetry,
}: UploadProgressProps) {
  const { colors, isDark } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  useEffect(() => {
    if (status === 'processing') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [status, pulseAnim]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />;
      case 'error':
        return <Ionicons name="close-circle" size={24} color={COLORS.danger} />;
      case 'processing':
        return (
          <Animated.View style={{ opacity: pulseAnim }}>
            <Ionicons name="sync" size={24} color={COLORS.primary} />
          </Animated.View>
        );
      default:
        return <Ionicons name="cloud-upload" size={24} color={COLORS.primary} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return `Uploading... ${progress}%`;
      case 'processing':
        return 'Processing file...';
      case 'success':
        return 'Upload complete!';
      case 'error':
        return error || 'Upload failed';
      default:
        return 'Preparing...';
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const getProgressBarColor = () => {
    switch (status) {
      case 'success':
        return COLORS.success;
      case 'error':
        return COLORS.danger;
      default:
        return COLORS.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.header}>
        {getStatusIcon()}

        <View style={styles.fileInfo}>
          <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
            {fileName}
          </Text>
          <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
            {formatFileSize(fileSize)}
          </Text>
        </View>

        {status === 'uploading' && onCancel && (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cancel upload" onPress={onCancel} style={styles.cancelButton}>
            <Ionicons name="close" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        )}

        {status === 'error' && onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            style={[styles.retryButton, { backgroundColor: COLORS.primary }]}
          >
            <Ionicons name="refresh" size={16} color="#ffffff" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
              backgroundColor: getProgressBarColor(),
            },
          ]}
        />
      </View>

      <Text style={[styles.statusText, { color: colors.textSecondary }]}>
        {getStatusText()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  fileInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  fileName: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  fileSize: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  cancelButton: {
    padding: SPACING.xs,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: FONTS.semibold,
    marginLeft: 4,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  statusText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

export default UploadProgress;
