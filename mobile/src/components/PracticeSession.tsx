import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Play, Pause, RotateCcw, X, Clock, CheckCircle } from 'lucide-react-native';
import { GlassCard } from './glass/GlassCard';
import { GlassButton } from './glass/GlassButton';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';

interface STARStory {
  id?: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  key_themes: string[];
  talking_points: string[];
}

interface Props {
  story: STARStory;
  onClose: () => void;
}

type Section = 'situation' | 'task' | 'action' | 'result' | 'complete';

export default function PracticeSession({ story, onClose }: Props) {
  const { colors } = useTheme();
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentSection, setCurrentSection] = useState<Section>('situation');
  const [showInstructions, setShowInstructions] = useState(true);

  // Estimated time per section (in seconds)
  const sectionTime = {
    situation: 60, // 1 minute
    task: 45, // 45 seconds
    action: 150, // 2.5 minutes
    result: 60, // 1 minute
  };

  const targetTime = 300; // 5 minutes total

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          const newSeconds = prevSeconds + 1;

          // Auto-advance sections
          if (newSeconds === sectionTime.situation && currentSection === 'situation') {
            setCurrentSection('task');
          } else if (
            newSeconds === sectionTime.situation + sectionTime.task &&
            currentSection === 'task'
          ) {
            setCurrentSection('action');
          } else if (
            newSeconds === sectionTime.situation + sectionTime.task + sectionTime.action &&
            currentSection === 'action'
          ) {
            setCurrentSection('result');
          } else if (newSeconds >= targetTime && currentSection === 'result') {
            setCurrentSection('complete');
            setIsRunning(false);
          }

          return newSeconds;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, currentSection]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    if (seconds === 0) {
      setCurrentSection('situation');
      setShowInstructions(false);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setCurrentSection('situation');
    setShowInstructions(true);
  };

  const getSectionContent = (section: Section) => {
    switch (section) {
      case 'situation':
        return story.situation;
      case 'task':
        return story.task;
      case 'action':
        return story.action;
      case 'result':
        return story.result;
      default:
        return '';
    }
  };

  const getSectionColor = (section: Section) => {
    if (section === currentSection) return COLORS.primary;
    if (sections.indexOf(section) < sections.indexOf(currentSection)) return COLORS.success;
    return colors.textTertiary;
  };

  const sections: Section[] = ['situation', 'task', 'action', 'result'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{story.title}</Text>
        <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close practice session">
          <X color={colors.textSecondary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Timer */}
        <GlassCard material="regular" shadow="subtle" style={styles.timerCard}>
          <View style={styles.timerContent}>
            <Clock color={colors.textSecondary} size={24} />
            <Text style={[styles.timerText, { color: colors.text }]}>{formatTime(seconds)}</Text>
            <Text style={[styles.targetTime, { color: colors.textTertiary }]}>
              / {formatTime(targetTime)}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {!isRunning ? (
              <GlassButton
                label={seconds === 0 ? 'Start' : 'Resume'}
                variant="primary"
                icon={<Play color="#ffffff" size={20} />}
                onPress={handleStart}
              />
            ) : (
              <GlassButton
                label="Pause"
                variant="secondary"
                icon={<Pause color={colors.text} size={20} />}
                onPress={handlePause}
              />
            )}

            <GlassButton
              label="Reset"
              variant="danger"
              icon={<RotateCcw color="#ffffff" size={20} />}
              onPress={handleReset}
            />
          </View>
        </GlassCard>

        {/* Progress */}
        <GlassCard material="thin" style={styles.progressCard}>
          <View style={styles.sectionsProgress}>
            {sections.map((section, index) => (
              <View key={section} style={styles.sectionProgress}>
                <View
                  style={[
                    styles.sectionDot,
                    {
                      backgroundColor:
                        section === currentSection
                          ? COLORS.primary
                          : sections.indexOf(section) < sections.indexOf(currentSection)
                          ? COLORS.success
                          : colors.backgroundTertiary,
                    },
                  ]}
                >
                  {sections.indexOf(section) < sections.indexOf(currentSection) && (
                    <CheckCircle color="#fff" size={12} />
                  )}
                </View>
                <Text
                  style={[
                    styles.sectionLabel,
                    { color: getSectionColor(section) },
                    section === currentSection && styles.activeSectionLabel,
                  ]}
                >
                  {section.toUpperCase()}
                </Text>
                {index < sections.length - 1 && (
                  <View
                    style={[
                      styles.sectionLine,
                      {
                        backgroundColor:
                          sections.indexOf(section) < sections.indexOf(currentSection)
                            ? COLORS.success
                            : colors.border,
                      },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Instructions or Current Section */}
        {showInstructions ? (
          <GlassCard material="regular" shadow="subtle" style={styles.instructionsCard}>
            <Text style={[styles.instructionsTitle, { color: colors.text }]}>
              Practice Instructions
            </Text>
            <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
              1. Press Start when ready to begin practicing{'\n'}
              2. The timer will guide you through each STAR section{'\n'}
              3. Speak out loud as if in a real interview{'\n'}
              4. Aim to complete your story in 3-5 minutes{'\n'}
              5. Focus on being concise and impactful
            </Text>
          </GlassCard>
        ) : (
          <GlassCard material="regular" shadow="subtle" style={styles.contentCard}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: COLORS.primary }]}>
                {currentSection.toUpperCase()}
              </Text>
              <Text style={[styles.sectionTime, { color: colors.textTertiary }]}>
                ~{Math.floor(sectionTime[currentSection as keyof typeof sectionTime] / 60)}m
              </Text>
            </View>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              {currentSection === 'complete' ? (
                <Text style={{ color: COLORS.success }}>
                  Practice Complete! Great job. Review your talking points and try again if
                  needed.
                </Text>
              ) : (
                getSectionContent(currentSection)
              )}
            </Text>
          </GlassCard>
        )}

        {/* Talking Points */}
        {story.talking_points && story.talking_points.length > 0 && (
          <GlassCard material="thin" style={styles.talkingPointsCard}>
            <Text style={[styles.talkingPointsTitle, { color: colors.text }]}>
              Key Talking Points
            </Text>
            {story.talking_points.map((point, index) => (
              <View key={index} style={styles.talkingPoint}>
                <Text style={[styles.bullet, { color: COLORS.primary }]}>•</Text>
                <Text style={[styles.talkingPointText, { color: colors.textSecondary }]}>
                  {point}
                </Text>
              </View>
            ))}
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  timerCard: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  timerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  timerText: {
    fontSize: 48,
    fontFamily: FONTS.bold,
  },
  targetTime: {
    fontSize: 18,
    fontFamily: FONTS.regular,
  },
  controls: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  progressCard: {
    padding: SPACING.md,
  },
  sectionsProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionProgress: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  sectionDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
    textAlign: 'center',
  },
  activeSectionLabel: {
    fontFamily: FONTS.bold,
  },
  sectionLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
  },
  instructionsCard: {
    padding: SPACING.lg,
  },
  instructionsTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
  },
  instructionsText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  contentCard: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  sectionTime: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  sectionContent: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  talkingPointsCard: {
    padding: SPACING.lg,
  },
  talkingPointsTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  talkingPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 20,
  },
  talkingPointText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
});
