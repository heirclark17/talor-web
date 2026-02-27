import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Sparkles, Trash2, Briefcase, Calendar, Eye, AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';

interface StarStory {
  id: number;
  title: string;
  story_theme: string | null;
  company_context: string | null;
  situation: string;
  task: string;
  action: string;
  result: string;
  key_themes: string[];
  talking_points: string[];
  created_at: string;
  updated_at: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STAR_COLORS = {
  situation: { bg: 'rgba(34, 197, 94, 0.2)', text: COLORS.semanticColors.successStrong },
  task: { bg: 'rgba(59, 130, 246, 0.2)', text: COLORS.primary },
  action: { bg: 'rgba(168, 85, 247, 0.2)', text: COLORS.purple },
  result: { bg: 'rgba(234, 179, 8, 0.2)', text: COLORS.warning },
};

export default function StarStoriesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const [stories, setStories] = useState<StarStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedStory, setSelectedStory] = useState<StarStory | null>(null);

  const fetchStarStories = async () => {
    try {
      setError(null);
      const result = await api.listStarStories();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load STAR stories');
      }

      const storyList = Array.isArray(result.data) ? result.data : (result.data?.stories || []);
      setStories(storyList);
    } catch (err) {
      console.error('Error fetching STAR stories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load STAR stories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStarStories();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStarStories();
  };

  const handleDelete = (storyId: number) => {
    Alert.alert(
      'Delete STAR Story',
      'Are you sure you want to delete this STAR story? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(storyId);
            try {
              const result = await api.deleteStarStory(storyId);
              if (result.success) {
                setStories((prev) => prev.filter((s) => s.id !== storyId));
                if (selectedStory?.id === storyId) {
                  setSelectedStory(null);
                }
              } else {
                Alert.alert('Error', result.error || 'Failed to delete STAR story');
              }
            } catch {
              Alert.alert('Error', 'Failed to delete STAR story');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const getWordCount = (text: string) => {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStoryCard = ({ item }: { item: StarStory }) => {
    const isSelected = selectedStory?.id === item.id;
    const wordCount = getWordCount(
      (item.situation || '') + (item.task || '') + (item.action || '') + (item.result || '')
    );

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.glass,
            borderColor: isSelected ? COLORS.primary : colors.glassBorder,
          },
          isSelected && styles.cardSelected,
        ]}
        onPress={() => setSelectedStory(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title || 'Untitled Story'}
            </Text>

            {item.story_theme && (
              <View style={styles.themeBadge}>
                <Text style={styles.themeBadgeText}>{item.story_theme}</Text>
              </View>
            )}

            {item.company_context && (
              <View style={styles.companyRow}>
                <Briefcase color={colors.textSecondary} size={14} />
                <Text style={[styles.companyText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.company_context}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
            disabled={deletingId === item.id}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {deletingId === item.id ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <Trash2 color={COLORS.error} size={18} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Calendar color={colors.textTertiary} size={12} />
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>
              {formatDate(item.created_at)}
            </Text>
          </View>
          <Text style={[styles.metaDot, { color: colors.textTertiary }]}>·</Text>
          <Text style={[styles.metaText, { color: colors.textTertiary }]}>
            {wordCount} words
          </Text>
        </View>

        {item.key_themes && item.key_themes.length > 0 && (
          <View style={styles.themesRow}>
            {item.key_themes.slice(0, 3).map((theme, i) => (
              <View key={i} style={[styles.themeChip, { backgroundColor: colors.backgroundTertiary }]}>
                <Text style={[styles.themeChipText, { color: colors.textSecondary }]}>{theme}</Text>
              </View>
            ))}
            {item.key_themes.length > 3 && (
              <View style={[styles.themeChip, { backgroundColor: colors.backgroundTertiary }]}>
                <Text style={[styles.themeChipText, { color: colors.textSecondary }]}>
                  +{item.key_themes.length - 3} more
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.glass }]}>
        <Sparkles color={colors.textTertiary} size={48} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No STAR Stories Yet</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Create interview prep from a tailored resume to generate STAR stories, or create a new tailored resume to get started.
      </Text>
      <TouchableOpacity
        style={[styles.ctaButton, { backgroundColor: COLORS.primary }]}
        onPress={() => navigation.navigate('TailorMain')}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaButtonText}>Create Tailored Resume →</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <View style={styles.errorCard}>
        <AlertCircle color={COLORS.error} size={40} />
        <Text style={styles.errorTitle}>Error Loading STAR Stories</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: COLORS.primary }]}
          onPress={fetchStarStories}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading your STAR stories...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkles color={COLORS.primary} size={28} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>My STAR Stories</Text>
        </View>
      </View>
      <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
        Your saved interview stories using the STAR method (Situation, Task, Action, Result)
      </Text>

      {error && !loading ? (
        renderErrorState()
      ) : (
        <>
          {stories.length > 0 && (
            <Text style={[styles.storyCount, { color: colors.textSecondary }]}>
              {stories.length} {stories.length === 1 ? 'story' : 'stories'} saved
            </Text>
          )}

          <FlatList
            data={stories}
            renderItem={renderStoryCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.primary}
              />
            }
          />
        </>
      )}

      {/* Story Detail Modal */}
      <Modal
        visible={selectedStory !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedStory(null)}
      >
        {selectedStory && (
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setSelectedStory(null)}
              >
                <Text style={[styles.modalCloseText, { color: COLORS.primary }]}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentInner}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.detailTitle, { color: colors.text }]}>
                {selectedStory.title}
              </Text>

              {/* STAR Sections */}
              <View style={styles.starSections}>
                {/* Situation */}
                <View style={styles.starSection}>
                  <View style={styles.starLabelRow}>
                    <View style={[styles.starBadge, { backgroundColor: STAR_COLORS.situation.bg }]}>
                      <Text style={[styles.starBadgeLetter, { color: STAR_COLORS.situation.text }]}>S</Text>
                    </View>
                    <Text style={[styles.starLabel, { color: STAR_COLORS.situation.text }]}>SITUATION</Text>
                  </View>
                  <Text style={[styles.starText, { color: colors.textSecondary }]}>
                    {selectedStory.situation}
                  </Text>
                </View>

                {/* Task */}
                <View style={styles.starSection}>
                  <View style={styles.starLabelRow}>
                    <View style={[styles.starBadge, { backgroundColor: STAR_COLORS.task.bg }]}>
                      <Text style={[styles.starBadgeLetter, { color: STAR_COLORS.task.text }]}>T</Text>
                    </View>
                    <Text style={[styles.starLabel, { color: STAR_COLORS.task.text }]}>TASK</Text>
                  </View>
                  <Text style={[styles.starText, { color: colors.textSecondary }]}>
                    {selectedStory.task}
                  </Text>
                </View>

                {/* Action */}
                <View style={styles.starSection}>
                  <View style={styles.starLabelRow}>
                    <View style={[styles.starBadge, { backgroundColor: STAR_COLORS.action.bg }]}>
                      <Text style={[styles.starBadgeLetter, { color: STAR_COLORS.action.text }]}>A</Text>
                    </View>
                    <Text style={[styles.starLabel, { color: STAR_COLORS.action.text }]}>ACTION</Text>
                  </View>
                  <Text style={[styles.starText, { color: colors.textSecondary }]}>
                    {selectedStory.action}
                  </Text>
                </View>

                {/* Result */}
                <View style={styles.starSection}>
                  <View style={styles.starLabelRow}>
                    <View style={[styles.starBadge, { backgroundColor: STAR_COLORS.result.bg }]}>
                      <Text style={[styles.starBadgeLetter, { color: STAR_COLORS.result.text }]}>R</Text>
                    </View>
                    <Text style={[styles.starLabel, { color: STAR_COLORS.result.text }]}>RESULT</Text>
                  </View>
                  <Text style={[styles.starText, { color: colors.textSecondary }]}>
                    {selectedStory.result}
                  </Text>
                </View>
              </View>

              {/* Key Themes */}
              {selectedStory.key_themes && selectedStory.key_themes.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionLabel, { color: colors.textSecondary }]}>
                    KEY THEMES
                  </Text>
                  <View style={styles.detailChips}>
                    {selectedStory.key_themes.map((theme, i) => (
                      <View key={i} style={[styles.detailChip, { backgroundColor: colors.glass }]}>
                        <Text style={[styles.detailChipText, { color: colors.text }]}>{theme}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Talking Points */}
              {selectedStory.talking_points && selectedStory.talking_points.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionLabel, { color: colors.textSecondary }]}>
                    TALKING POINTS
                  </Text>
                  {selectedStory.talking_points.map((point, i) => (
                    <View key={i} style={styles.talkingPoint}>
                      <Text style={[styles.talkingPointBullet, { color: colors.text }]}>•</Text>
                      <Text style={[styles.talkingPointText, { color: colors.textSecondary }]}>
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 34,
    fontFamily: FONTS.semibold,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    paddingHorizontal: SPACING.screenMargin,
    paddingBottom: SPACING.md,
    lineHeight: 20,
  },
  storyCount: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    paddingHorizontal: SPACING.screenMargin,
    paddingBottom: 4,
  },

  // List
  list: {
    paddingHorizontal: SPACING.screenMargin,
    paddingTop: SPACING.sm,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.xl,
  },

  // Card
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardSelected: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: FONTS.semibold,
    marginBottom: 6,
    lineHeight: 22,
  },
  themeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  themeBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.purple,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  companyText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    flex: 1,
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  metaDot: {
    fontSize: 12,
  },
  themesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  themeChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  themeChipText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: FONTS.semibold,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  ctaButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },

  // Error State
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
    color: COLORS.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },

  // Modal
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalCloseButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalCloseText: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
  modalContent: {
    flex: 1,
  },
  modalContentInner: {
    padding: 20,
    paddingBottom: 40,
  },
  detailTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    marginBottom: 24,
    lineHeight: 30,
  },

  // STAR Sections
  starSections: {
    gap: 20,
    marginBottom: 28,
  },
  starSection: {},
  starLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  starBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starBadgeLetter: {
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  starLabel: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    letterSpacing: 0.5,
  },
  starText: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    lineHeight: 23,
  },

  // Detail sections
  detailSection: {
    marginBottom: 24,
  },
  detailSectionLabel: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  detailChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  detailChipText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  talkingPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  talkingPointBullet: {
    fontSize: 15,
    marginRight: 8,
    marginTop: 1,
  },
  talkingPointText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 21,
  },
});
