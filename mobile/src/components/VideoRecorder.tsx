import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Video,
  Circle,
  Square,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Trash2,
  Camera,
  AlertCircle,
} from 'lucide-react-native';
import { GlassCard } from './glass/GlassCard';
import { GlassButton } from './glass/GlassButton';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';

interface Props {
  questionText: string;
  maxDuration?: number; // in seconds
  onSaveRecording?: (videoUri: string, duration: number) => void;
  onCancel?: () => void;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'completed';

export default function VideoRecorder({
  questionText,
  maxDuration = 120, // 2 minutes default
  onSaveRecording,
  onCancel,
}: Props) {
  const { colors } = useTheme();
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  // NOTE: This component requires expo-camera for full functionality
  // Install with: npx expo install expo-camera
  // Uncomment the following imports when ready:
  // import { CameraView, useCameraPermissions } from 'expo-camera';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    // TODO: Implement camera permission check and recording start
    // Example with expo-camera:
    // const { status } = await Camera.requestCameraPermissionsAsync();
    // if (status !== 'granted') {
    //   Alert.alert('Permission Denied', 'Camera access is required to record video.');
    //   return;
    // }

    Alert.alert(
      'Camera Integration Required',
      'Video recording requires expo-camera package. Install with: npx expo install expo-camera',
      [{ text: 'OK' }]
    );

    // When implemented:
    // setRecordingState('recording');
    // Start recording timer
  };

  const handlePauseRecording = () => {
    // TODO: Implement pause functionality
    setRecordingState('paused');
  };

  const handleResumeRecording = () => {
    // TODO: Implement resume functionality
    setRecordingState('recording');
  };

  const handleStopRecording = () => {
    // TODO: Implement stop and save recording
    setRecordingState('completed');
    // setVideoUri(recordedVideoUri);
  };

  const handleRetake = () => {
    setRecordingState('idle');
    setRecordedDuration(0);
    setVideoUri(null);
  };

  const handleSave = () => {
    if (onSaveRecording && videoUri) {
      onSaveRecording(videoUri, recordedDuration);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleRetake,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Question Card */}
      <GlassCard material="regular" shadow="subtle" style={styles.questionCard}>
        <Text style={[styles.questionLabel, { color: colors.textSecondary }]}>
          Practice Question:
        </Text>
        <Text style={[styles.questionText, { color: colors.text }]}>{questionText}</Text>
      </GlassCard>

      {/* Camera/Video Preview Area */}
      <GlassCard material="regular" shadow="elevated" style={styles.videoCard}>
        {recordingState === 'idle' || recordingState === 'recording' || recordingState === 'paused' ? (
          <View style={[styles.cameraPlaceholder, { backgroundColor: colors.backgroundTertiary }]}>
            <Camera color={colors.textTertiary} size={64} />
            <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
              {recordingState === 'idle'
                ? 'Camera preview will appear here'
                : recordingState === 'recording'
                ? 'Recording in progress...'
                : 'Recording paused'}
            </Text>
            {/* When expo-camera is integrated, replace with CameraView */}
            {/* <CameraView
              style={styles.camera}
              facing="front"
              mode="video"
            /> */}
          </View>
        ) : (
          <View style={[styles.videoPreview, { backgroundColor: colors.backgroundTertiary }]}>
            <Video color={colors.textSecondary} size={48} />
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              Video preview will appear here
            </Text>
            {/* When recording is saved, show video player */}
            {/* <VideoPlayer source={{ uri: videoUri }} /> */}
          </View>
        )}

        {/* Recording Timer */}
        {recordingState !== 'idle' && (
          <View style={[styles.timerOverlay, { backgroundColor: ALPHA_COLORS.danger.bg }]}>
            {recordingState === 'recording' && (
              <Circle color={COLORS.danger} size={12} fill={COLORS.danger} />
            )}
            <Text style={[styles.timerText, { color: COLORS.danger }]}>
              {formatTime(recordedDuration)} / {formatTime(maxDuration)}
            </Text>
          </View>
        )}

        {/* Recording Warning */}
        {recordingState === 'recording' && recordedDuration > maxDuration * 0.8 && (
          <View style={[styles.warningBanner, { backgroundColor: ALPHA_COLORS.warning.bg }]}>
            <AlertCircle color={COLORS.warning} size={16} />
            <Text style={[styles.warningText, { color: COLORS.warning }]}>
              {formatTime(maxDuration - recordedDuration)} remaining
            </Text>
          </View>
        )}
      </GlassCard>

      {/* Recording Controls */}
      <GlassCard material="regular" style={styles.controlsCard}>
        {recordingState === 'idle' && (
          <View style={styles.controls}>
            <GlassButton
              label="Start Recording"
              variant="primary"
              icon={<Circle size={20} color="#ffffff" />}
              onPress={handleStartRecording}
              style={styles.primaryButton}
            />
            {onCancel && (
              <GlassButton
                label="Cancel"
                variant="secondary"
                onPress={onCancel}
                style={styles.secondaryButton}
              />
            )}
          </View>
        )}

        {recordingState === 'recording' && (
          <View style={styles.controls}>
            <GlassButton
              label="Pause"
              variant="secondary"
              icon={<Pause color={colors.text} size={24} />}
              onPress={handlePauseRecording}
              style={styles.recordControlButton}
            />
            <GlassButton
              label="Stop"
              variant="danger"
              icon={<Square color="#ffffff" size={20} />}
              onPress={handleStopRecording}
              style={styles.recordControlButton}
            />
          </View>
        )}

        {recordingState === 'paused' && (
          <View style={styles.controls}>
            <GlassButton
              label="Resume"
              variant="primary"
              icon={<Play color="#ffffff" size={24} />}
              onPress={handleResumeRecording}
              style={styles.recordControlButton}
            />
            <GlassButton
              label="Stop"
              variant="danger"
              icon={<Square color="#ffffff" size={20} />}
              onPress={handleStopRecording}
              style={styles.recordControlButton}
            />
          </View>
        )}

        {recordingState === 'completed' && (
          <View style={styles.controls}>
            <GlassButton
              label="Retake"
              variant="secondary"
              icon={<RotateCcw size={18} color={colors.text} />}
              onPress={handleRetake}
              style={styles.actionButton}
            />
            <GlassButton
              label="Delete"
              variant="danger"
              icon={<Trash2 size={18} color="#ffffff" />}
              onPress={handleDelete}
              style={styles.actionButton}
            />
            <GlassButton
              label="Save"
              variant="primary"
              icon={<Upload size={18} color="#ffffff" />}
              onPress={handleSave}
              disabled={!videoUri}
              style={styles.actionButton}
            />
          </View>
        )}
      </GlassCard>

      {/* Tips */}
      <GlassCard material="thin" style={styles.tipsCard}>
        <Text style={[styles.tipsTitle, { color: colors.text }]}>Recording Tips:</Text>
        <View style={styles.tipItem}>
          <Text style={[styles.bullet, { color: COLORS.info }]}>•</Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            Position camera at eye level in a well-lit area
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={[styles.bullet, { color: COLORS.info }]}>•</Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            Speak clearly and maintain eye contact with camera
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={[styles.bullet, { color: COLORS.info }]}>•</Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            Keep answers concise: aim for {formatTime(maxDuration * 0.6)} - {formatTime(maxDuration)}
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={[styles.bullet, { color: COLORS.info }]}>•</Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            Use STAR format: Situation, Task, Action, Result
          </Text>
        </View>
      </GlassCard>

      {/* Integration Note */}
      <View style={[styles.integrationNote, { backgroundColor: ALPHA_COLORS.info.bg }]}>
        <AlertCircle color={COLORS.info} size={16} />
        <Text style={[styles.integrationText, { color: COLORS.info }]}>
          Note: Full video recording requires expo-camera package installation
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  questionCard: {
    padding: SPACING.lg,
  },
  questionLabel: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  questionText: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    lineHeight: 24,
  },
  videoCard: {
    position: 'relative',
    overflow: 'hidden',
  },
  cameraPlaceholder: {
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  videoPreview: {
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  timerOverlay: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  timerText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  warningBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
  },
  warningText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
  },
  controlsCard: {
    padding: SPACING.lg,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  recordControlButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
  },
  actionButton: {
    flex: 1,
  },
  tipsCard: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.xs,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  integrationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  integrationText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
});
