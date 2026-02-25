import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
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
import { BookOpen, Trash2, X, Plus, ArrowLeft, BarChart3, Lightbulb, Copy, TrendingUp, Search } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';
import { STARStoryBuilder } from '../components';

interface StarStory {
  id: number;
  title: string;
  story_theme?: string;
  company_context?: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  key_themes?: string[];
  talking_points?: string[];
  created_at: string;
  updated_at: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function StarStoriesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const [stories, setStories] = useState<StarStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedStory, setSelectedStory] = useState<StarStory | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingStory, setEditingStory] = useState<StarStory | null>(null);

  // Feature #18: Story Analysis
  const [storyAnalysis, setStoryAnalysis] = useState<any>(null);
  const [analyzingStoryId, setAnalyzingStoryId] = useState<number | null>(null);

  // Feature #19: Story Suggestions
  const [storySuggestions, setStorySuggestions] = useState<any>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Feature #20: Story Variations
  const [storyVariations, setStoryVariations] = useState<any>(null);
  const [generatingVariations, setGeneratingVariations] = useState(false);
  const [showVariationsModal, setShowVariationsModal] = useState(false);

  // AI Generation
  const [showAIInputModal, setShowAIInputModal] = useState(false);
  const [aiExperienceText, setAIExperienceText] = useState('');
  const [aiGenerating, setAIGenerating] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  // Derive unique themes from all stories
  const allThemes = useMemo(() => {
    const themes = new Set<string>();
    stories.forEach(s => {
      if (s.key_themes) s.key_themes.forEach(t => themes.add(t));
      if (s.story_theme) themes.add(s.story_theme);
    });
    return Array.from(themes).sort();
  }, [stories]);

  // Filtered stories
  const filteredStories = useMemo(() => {
    let result = stories;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        (s.title || '').toLowerCase().includes(q) ||
        (s.story_theme || '').toLowerCase().includes(q) ||
        (s.situation || '').toLowerCase().includes(q) ||
        (s.task || '').toLowerCase().includes(q) ||
        (s.action || '').toLowerCase().includes(q) ||
        (s.result || '').toLowerCase().includes(q) ||
        (s.key_themes || []).some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedTheme) {
      result = result.filter(s =>
        s.story_theme === selectedTheme ||
        (s.key_themes || []).includes(selectedTheme)
      );
    }
    return result;
  }, [stories, searchQuery, selectedTheme]);

  const loadStories = async () => {
    try {
      const result = await api.listStarStories();
      if (result.success && result.data) {
        const storyList = Array.isArray(result.data) ? result.data : (result.data.stories || []);
        setStories(storyList);
      } else {
        console.error('Failed to load STAR stories:', result.error);
        setStories([]);
      }
    } catch (error) {
      console.error('Error loading STAR stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStories();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadStories();
  };

  const handleDelete = (storyId: number) => {
    Alert.alert(
      'Delete STAR Story',
      'Are you sure you want to delete this story? This action cannot be undone.',
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
            } catch (error) {
              Alert.alert('Error', 'Failed to delete STAR story');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSaveStory = async (story: any) => {
    try {
      const result = await api.createStarStory({
        title: story.title,
        situation: story.situation,
        task: story.task,
        action: story.action,
        result: story.result,
        key_themes: story.key_themes,
        talking_points: story.talking_points,
      });

      if (result.success) {
        setShowBuilder(false);
        setEditingStory(null);
        loadStories();
        Alert.alert('Success', 'STAR story saved successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to save STAR story');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save STAR story');
    }
  };

  const handleGenerateAI = async (title: string) => {
    setShowAIInputModal(true);
    return null;
  };

  const handleAIGenerate = async () => {
    if (!aiExperienceText.trim()) {
      Alert.alert('Input Required', 'Please describe your experience or accomplishment.');
      return;
    }

    setAIGenerating(true);
    try {
      const genResult = await api.generateStarStoryFromExperience({
        experienceText: aiExperienceText.trim(),
      });

      if (genResult.success && genResult.data) {
        const story = genResult.data;
        const saveResult = await api.createStarStory({
          title: story.title || 'AI Generated Story',
          situation: story.situation,
          task: story.task,
          action: story.action,
          result: story.result,
          key_themes: story.key_themes || [],
          talking_points: story.talking_points || [],
        });

        if (saveResult.success) {
          setShowAIInputModal(false);
          setShowBuilder(false);
          setAIExperienceText('');
          loadStories();
          Alert.alert('Success', 'AI-generated STAR story saved!');
        } else {
          Alert.alert('Save Failed', saveResult.error || 'Could not save generated story');
        }
      } else {
        Alert.alert('Generation Failed', genResult.error || 'Could not generate STAR story');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate story');
    } finally {
      setAIGenerating(false);
    }
  };

  // Feature #18: Analyze STAR Story
  const handleAnalyzeStory = async (storyId: number) => {
    setAnalyzingStoryId(storyId);
    setStoryAnalysis(null);

    try {
      const result = await api.analyzeStarStory(storyId);

      if (result.success && result.data) {
        setStoryAnalysis(result.data);
      } else {
        Alert.alert('Analysis Failed', result.error || 'Could not analyze STAR story');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze story');
    } finally {
      setAnalyzingStoryId(null);
    }
  };

  // Feature #19: Get Story Suggestions
  const handleGetSuggestions = async (storyId: number) => {
    setLoadingSuggestions(true);
    setStorySuggestions(null);

    try {
      const result = await api.getStorySuggestions(storyId);

      if (result.success && result.data) {
        setStorySuggestions(result.data);
      } else {
        Alert.alert('Suggestions Failed', result.error || 'Could not get story suggestions');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to get suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Feature #20: Generate Story Variations
  const handleGenerateVariations = async (storyId: number) => {
    setGeneratingVariations(true);
    setStoryVariations(null);

    try {
      const result = await api.generateStoryVariations({
        storyId: storyId,
        contexts: ['technical_interview', 'behavioral_interview', 'executive_presentation', 'networking'],
        tones: ['professional', 'conversational', 'enthusiastic'],
      });

      if (result.success && result.data) {
        setStoryVariations(result.data);
        setShowVariationsModal(true);
      } else {
        Alert.alert('Generation Failed', result.error || 'Could not generate story variations');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate variations');
    } finally {
      setGeneratingVariations(false);
    }
  };

  const renderStoryCard = ({ item }: { item: StarStory }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
      onPress={() => setSelectedStory(item)}
      accessibilityRole="button"
      accessibilityLabel={`STAR story: ${item.title || 'Untitled'}`}
      accessibilityHint={`Theme: ${item.story_theme || 'No theme'}. Created ${formatDate(item.created_at)}`}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: colors.backgroundTertiary }]}>
          <BookOpen color={COLORS.primary} size={24} />
        </View>
        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title || 'Untitled Story'}
          </Text>
          {item.story_theme && (
            <Text style={[styles.cardTheme, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.story_theme}
            </Text>
          )}
          <Text style={[styles.cardDate, { color: colors.textTertiary }]}>{formatDate(item.created_at)}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          handleDelete(item.id);
        }}
        disabled={deletingId === item.id}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${item.title || 'story'}`}
        accessibilityHint="Permanently removes this STAR story"
        accessibilityState={{ disabled: deletingId === item.id, busy: deletingId === item.id }}
      >
        {deletingId === item.id ? (
          <ActivityIndicator size="small" color={COLORS.danger} />
        ) : (
          <Trash2 color={COLORS.danger} size={18} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <BookOpen color={colors.textTertiary} size={64} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No STAR Stories</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Create behavioral interview stories using the Situation, Task, Action, Result framework.
      </Text>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.text }]}
        onPress={() => {
          setEditingStory(null);
          setShowBuilder(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="Create new STAR story"
        accessibilityHint="Opens the story builder to create a behavioral interview story"
      >
        <Plus color={colors.background} size={20} />
        <Text style={[styles.createButtonText, { color: colors.background }]}>Create Story</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading STAR stories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>STAR Stories</Text>
        {stories.length > 0 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingStory(null);
              setShowBuilder(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Add new STAR story"
            accessibilityHint="Opens the story builder to create a new behavioral interview story"
          >
            <Plus color={COLORS.primary} size={24} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      {stories.length > 0 && (
        <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
          <View style={[styles.searchBar, { backgroundColor: colors.backgroundTertiary }]}>
            <Search color={colors.textTertiary} size={18} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search stories..."
              placeholderTextColor={colors.textTertiary}
              style={[styles.searchInput, { color: colors.text }]}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X color={colors.textTertiary} size={16} />
              </TouchableOpacity>
            )}
          </View>

          {/* Theme Filter Chips */}
          {allThemes.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsContent}
              style={styles.filterChips}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.backgroundTertiary },
                  !selectedTheme && { backgroundColor: COLORS.primary },
                ]}
                onPress={() => setSelectedTheme(null)}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: colors.textSecondary },
                  !selectedTheme && { color: '#fff' },
                ]}>All</Text>
              </TouchableOpacity>
              {allThemes.map(theme => (
                <TouchableOpacity
                  key={theme}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.backgroundTertiary },
                    selectedTheme === theme && { backgroundColor: COLORS.primary },
                  ]}
                  onPress={() => setSelectedTheme(selectedTheme === theme ? null : theme)}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: colors.textSecondary },
                    selectedTheme === theme && { color: '#fff' },
                  ]} numberOfLines={1}>{theme}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      <FlatList
        data={filteredStories}
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

      {/* STAR Story Builder Modal */}
      <Modal
        visible={showBuilder}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowBuilder(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowBuilder(false)}
            >
              <ArrowLeft color={colors.text} size={24} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingStory ? 'Edit STAR Story' : 'New STAR Story'}
            </Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <STARStoryBuilder
            initialStory={editingStory ? {
              id: editingStory.id.toString(),
              title: editingStory.title,
              situation: editingStory.situation,
              task: editingStory.task,
              action: editingStory.action,
              result: editingStory.result,
              key_themes: editingStory.key_themes || [],
              talking_points: editingStory.talking_points || [],
            } : undefined}
            onSave={handleSaveStory}
            onCancel={() => setShowBuilder(false)}
            onGenerateAI={handleGenerateAI}
          />
        </SafeAreaView>
      </Modal>

      {/* Story Detail Modal */}
      <Modal
        visible={selectedStory !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedStory(null)}
      >
        {selectedStory && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedStory(null)}
              >
                <X color={colors.text} size={24} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>STAR Story</Text>
              <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
              <Text style={[styles.storyTitle, { color: colors.text }]}>{selectedStory.title || 'Untitled Story'}</Text>

              {selectedStory.story_theme && (
                <View style={[styles.themeBadge, { backgroundColor: colors.backgroundTertiary }]}>
                  <Text style={styles.themeBadgeText}>{selectedStory.story_theme}</Text>
                </View>
              )}

              {/* Feature #18, #19, #20: Action buttons */}
              <View style={styles.storyActions}>
                <TouchableOpacity
                  style={[styles.storyActionButton, { backgroundColor: colors.backgroundTertiary }]}
                  onPress={() => handleAnalyzeStory(selectedStory.id)}
                  disabled={analyzingStoryId === selectedStory.id}
                >
                  {analyzingStoryId === selectedStory.id ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <>
                      <BarChart3 color={COLORS.primary} size={18} />
                      <Text style={[styles.storyActionText, { color: COLORS.primary }]}>Analyze</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.storyActionButton, { backgroundColor: colors.backgroundTertiary }]}
                  onPress={() => handleGetSuggestions(selectedStory.id)}
                  disabled={loadingSuggestions}
                >
                  {loadingSuggestions ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <>
                      <Lightbulb color={COLORS.primary} size={18} />
                      <Text style={[styles.storyActionText, { color: COLORS.primary }]}>Suggest</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.storyActionButton, { backgroundColor: colors.backgroundTertiary }]}
                  onPress={() => handleGenerateVariations(selectedStory.id)}
                  disabled={generatingVariations}
                >
                  {generatingVariations ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <>
                      <Copy color={COLORS.primary} size={18} />
                      <Text style={[styles.storyActionText, { color: COLORS.primary }]}>Variations</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Feature #18: Story Analysis Results */}
              {storyAnalysis && (
                <View style={[styles.analysisSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <View style={styles.analysisSectionHeader}>
                    <BarChart3 color={COLORS.primary} size={24} />
                    <Text style={[styles.analysisSectionTitle, { color: colors.text }]}>STAR Analysis</Text>
                  </View>

                  <View style={styles.scoreCard}>
                    <Text style={[styles.overallScoreLabel, { color: colors.textSecondary }]}>Overall Score</Text>
                    <Text style={[styles.overallScore, { color: COLORS.primary }]}>{storyAnalysis.overall_score}/100</Text>
                  </View>

                  {storyAnalysis.component_scores && (
                    <View style={styles.componentScores}>
                      {Object.entries(storyAnalysis.component_scores).map(([key, value]: [string, any]) => (
                        <View key={key} style={styles.componentRow}>
                          <Text style={[styles.componentLabel, { color: colors.text }]}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </Text>
                          <View style={styles.componentRight}>
                            <Text style={[styles.componentScore, { color: value.score >= 80 ? COLORS.success : value.score >= 60 ? COLORS.warning : COLORS.danger }]}>
                              {value.score}
                            </Text>
                            <Text style={[styles.componentFeedback, { color: colors.textSecondary }]}>
                              {value.feedback}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {storyAnalysis.strengths && storyAnalysis.strengths.length > 0 && (
                    <View style={styles.feedbackSection}>
                      <Text style={[styles.feedbackTitle, { color: COLORS.success }]}>Strengths</Text>
                      {storyAnalysis.strengths.map((strength: string, index: number) => (
                        <Text key={index} style={[styles.feedbackText, { color: colors.text }]}>• {strength}</Text>
                      ))}
                    </View>
                  )}

                  {storyAnalysis.areas_for_improvement && storyAnalysis.areas_for_improvement.length > 0 && (
                    <View style={styles.feedbackSection}>
                      <Text style={[styles.feedbackTitle, { color: COLORS.warning }]}>Areas for Improvement</Text>
                      {storyAnalysis.areas_for_improvement.map((area: string, index: number) => (
                        <Text key={index} style={[styles.feedbackText, { color: colors.text }]}>• {area}</Text>
                      ))}
                    </View>
                  )}

                  {storyAnalysis.impact_assessment && (
                    <View style={styles.impactAssessment}>
                      <Text style={[styles.feedbackTitle, { color: colors.text }]}>Impact Assessment</Text>
                      <View style={styles.impactRow}>
                        <Text style={[styles.impactLabel, { color: colors.textSecondary }]}>Quantifiable Results:</Text>
                        <Text style={[styles.impactValue, { color: storyAnalysis.impact_assessment.quantifiable_results ? COLORS.success : COLORS.danger }]}>
                          {storyAnalysis.impact_assessment.quantifiable_results ? 'Yes' : 'No'}
                        </Text>
                      </View>
                      <View style={styles.impactRow}>
                        <Text style={[styles.impactLabel, { color: colors.textSecondary }]}>Leadership Demonstrated:</Text>
                        <Text style={[styles.impactValue, { color: storyAnalysis.impact_assessment.leadership_demonstrated ? COLORS.success : COLORS.danger }]}>
                          {storyAnalysis.impact_assessment.leadership_demonstrated ? 'Yes' : 'No'}
                        </Text>
                      </View>
                      <View style={styles.impactRow}>
                        <Text style={[styles.impactLabel, { color: colors.textSecondary }]}>Problem Solving:</Text>
                        <Text style={[styles.impactValue, { color: storyAnalysis.impact_assessment.problem_solving_shown ? COLORS.success : COLORS.danger }]}>
                          {storyAnalysis.impact_assessment.problem_solving_shown ? 'Yes' : 'No'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Feature #19: Story Suggestions Results */}
              {storySuggestions && (
                <View style={[styles.analysisSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <View style={styles.analysisSectionHeader}>
                    <Lightbulb color={COLORS.primary} size={24} />
                    <Text style={[styles.analysisSectionTitle, { color: colors.text }]}>Improvement Suggestions</Text>
                  </View>

                  {storySuggestions.improvement_tips && storySuggestions.improvement_tips.length > 0 && (
                    <View style={styles.suggestionsGroup}>
                      <Text style={[styles.suggestionsGroupTitle, { color: colors.text }]}>Component Improvements</Text>
                      {storySuggestions.improvement_tips.map((tip: any, index: number) => (
                        <View key={index} style={[styles.suggestionCard, { backgroundColor: colors.backgroundTertiary }]}>
                          <Text style={[styles.suggestionComponent, { color: COLORS.primary }]}>
                            {tip.component.toUpperCase()}
                          </Text>
                          <Text style={[styles.suggestionText, { color: colors.text }]}>{tip.suggestion}</Text>
                          <Text style={[styles.suggestionReason, { color: colors.textSecondary }]}>
                            {tip.reasoning}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {storySuggestions.alternative_framings && storySuggestions.alternative_framings.length > 0 && (
                    <View style={styles.suggestionsGroup}>
                      <Text style={[styles.suggestionsGroupTitle, { color: colors.text }]}>Alternative Framings</Text>
                      {storySuggestions.alternative_framings.map((framing: any, index: number) => (
                        <View key={index} style={[styles.framingCard, { backgroundColor: colors.backgroundTertiary }]}>
                          <Text style={[styles.framingPerspective, { color: COLORS.primary }]}>
                            {framing.perspective}
                          </Text>
                          <Text style={[styles.framingLabel, { color: colors.textSecondary }]}>Situation:</Text>
                          <Text style={[styles.framingText, { color: colors.text }]}>{framing.reframed_story.situation}</Text>
                          <Text style={[styles.framingLabel, { color: colors.textSecondary }]}>Result:</Text>
                          <Text style={[styles.framingText, { color: colors.text }]}>{framing.reframed_story.result}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {storySuggestions.impact_enhancements && storySuggestions.impact_enhancements.length > 0 && (
                    <View style={styles.suggestionsGroup}>
                      <Text style={[styles.suggestionsGroupTitle, { color: colors.text }]}>Impact Enhancements</Text>
                      {storySuggestions.impact_enhancements.map((enhancement: any, index: number) => (
                        <View key={index} style={styles.enhancementRow}>
                          <TrendingUp color={COLORS.success} size={16} />
                          <View style={styles.enhancementContent}>
                            <Text style={[styles.enhancementType, { color: COLORS.success }]}>
                              {enhancement.type.toUpperCase()}
                            </Text>
                            <Text style={[styles.enhancementText, { color: colors.text }]}>
                              {enhancement.enhancement}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {storySuggestions.keyword_recommendations && storySuggestions.keyword_recommendations.length > 0 && (
                    <View style={styles.suggestionsGroup}>
                      <Text style={[styles.suggestionsGroupTitle, { color: colors.text }]}>Recommended Keywords</Text>
                      <View style={styles.keywordsContainer}>
                        {storySuggestions.keyword_recommendations.map((keyword: string, index: number) => (
                          <View key={index} style={[styles.keywordChip, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                            <Text style={[styles.keywordText, { color: COLORS.primary }]}>{keyword}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {selectedStory.company_context && (
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Company Context</Text>
                  <Text style={[styles.sectionText, { color: colors.text }]}>{selectedStory.company_context}</Text>
                </View>
              )}

              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Situation</Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>{selectedStory.situation}</Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Task</Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>{selectedStory.task}</Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Action</Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>{selectedStory.action}</Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Result</Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>{selectedStory.result}</Text>
              </View>

              {selectedStory.key_themes && selectedStory.key_themes.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Key Themes</Text>
                  <View style={styles.tagsList}>
                    {selectedStory.key_themes.map((theme, index) => (
                      <View key={index} style={[styles.tag, { backgroundColor: colors.backgroundTertiary }]}>
                        <Text style={[styles.tagText, { color: colors.text }]}>{theme}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {selectedStory.talking_points && selectedStory.talking_points.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Talking Points</Text>
                  {selectedStory.talking_points.map((point, index) => (
                    <View key={index} style={styles.bulletPoint}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={[styles.bulletText, { color: colors.text }]}>{point}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.section}>
                <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                  Created: {formatDate(selectedStory.created_at)}
                </Text>
                {selectedStory.updated_at !== selectedStory.created_at && (
                  <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                    Updated: {formatDate(selectedStory.updated_at)}
                  </Text>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* Feature #20: Story Variations Modal */}
      <Modal
        visible={showVariationsModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowVariationsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowVariationsModal(false)}
            >
              <X color={colors.text} size={24} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Story Variations</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          {storyVariations && (
            <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
              {storyVariations.variations && storyVariations.variations.length > 0 && (
                <>
                  {storyVariations.variations.map((variation: any, index: number) => (
                    <View key={index} style={[styles.variationCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                      <View style={styles.variationHeader}>
                        <View style={[styles.variationBadge, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                          <Text style={[styles.variationContext, { color: COLORS.primary }]}>
                            {(variation.name || '').replace(/_/g, ' ').toUpperCase()}
                          </Text>
                        </View>
                        <View style={[styles.variationBadge, { backgroundColor: colors.backgroundTertiary }]}>
                          <Text style={[styles.variationTone, { color: colors.text }]}>
                            {variation.emphasis}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.variationContent}>
                        <Text style={[styles.variationLabel, { color: colors.textSecondary }]}>Situation</Text>
                        <Text style={[styles.variationText, { color: colors.text }]}>
                          {variation.story.situation}
                        </Text>
                      </View>

                      <View style={styles.variationContent}>
                        <Text style={[styles.variationLabel, { color: colors.textSecondary }]}>Task</Text>
                        <Text style={[styles.variationText, { color: colors.text }]}>
                          {variation.story.task}
                        </Text>
                      </View>

                      <View style={styles.variationContent}>
                        <Text style={[styles.variationLabel, { color: colors.textSecondary }]}>Action</Text>
                        <Text style={[styles.variationText, { color: colors.text }]}>
                          {variation.story.action}
                        </Text>
                      </View>

                      <View style={styles.variationContent}>
                        <Text style={[styles.variationLabel, { color: colors.textSecondary }]}>Result</Text>
                        <Text style={[styles.variationText, { color: colors.text }]}>
                          {variation.story.result}
                        </Text>
                      </View>

                      {variation.key_phrases && variation.key_phrases.length > 0 && (
                        <View style={styles.variationContent}>
                          <Text style={[styles.variationLabel, { color: colors.textSecondary }]}>Key Phrases</Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                            {variation.key_phrases.map((phrase: string, pi: number) => (
                              <View key={pi} style={[styles.variationBadge, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                                <Text style={{ color: COLORS.primary, fontSize: 12, fontFamily: FONTS.medium }}>{phrase}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {variation.when_to_use && (
                        <View style={[styles.useCaseBox, { backgroundColor: colors.backgroundTertiary }]}>
                          <Text style={[styles.useCaseLabel, { color: colors.textSecondary }]}>Best For:</Text>
                          <Text style={[styles.useCaseText, { color: colors.text }]}>
                            {variation.when_to_use}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </>
              )}

              {storyVariations.usage_guide && (
                <View style={[styles.usageGuideCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.usageGuideTitle, { color: colors.text }]}>Usage Guide</Text>

                  {Object.entries(storyVariations.usage_guide).map(([key, value]: [string, any]) => (
                    <View key={key} style={styles.guideSection}>
                      <Text style={[styles.guideLabel, { color: COLORS.primary }]}>
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </Text>
                      <Text style={[styles.guideText, { color: colors.text }]}>{value}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* AI Experience Input Modal */}
      <Modal
        visible={showAIInputModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAIInputModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => { setShowAIInputModal(false); setAIExperienceText(''); }}
            >
              <X color={colors.text} size={24} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>AI Story Generator</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginBottom: 8 }]}>
              Describe an experience, accomplishment, or challenge from your career. AI will structure it into a STAR story.
            </Text>
            <TextInput
              style={[styles.aiInput, { color: colors.text, borderColor: colors.glassBorder, backgroundColor: colors.glass }]}
              value={aiExperienceText}
              onChangeText={setAIExperienceText}
              placeholder="e.g., Led a team of 5 engineers to migrate our authentication system from legacy LDAP to OAuth 2.0, reducing login failures by 40%..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.generateButton, { backgroundColor: COLORS.primary, opacity: aiGenerating || !aiExperienceText.trim() ? 0.6 : 1 }]}
              onPress={handleAIGenerate}
              disabled={aiGenerating || !aiExperienceText.trim()}
            >
              {aiGenerating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Plus color="#fff" size={18} />
              )}
              <Text style={styles.generateButtonText}>
                {aiGenerating ? 'Generating...' : 'Generate STAR Story'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filterChips: {
    marginTop: 8,
    maxHeight: 36,
  },
  filterChipsContent: {
    gap: 8,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    ...TYPOGRAPHY.callout,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenMargin,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.extralight,
  },
  addButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    minHeight: 80,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardTheme: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginBottom: 4,
  },
  cardDate: {
    ...TYPOGRAPHY.caption1,
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl * 2,
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: FONTS.extralight,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TYPOGRAPHY.callout,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 48,
  },
  createButtonText: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    ...TYPOGRAPHY.headline,
  },
  headerPlaceholder: {
    width: 44,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: SPACING.lg,
  },
  storyTitle: {
    fontSize: 24,
    fontFamily: FONTS.extralight,
    marginBottom: SPACING.md,
  },
  themeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  themeBadgeText: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionText: {
    ...TYPOGRAPHY.callout,
    lineHeight: 24,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  tagText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  bullet: {
    ...TYPOGRAPHY.callout,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    lineHeight: 24,
  },
  bulletText: {
    flex: 1,
    ...TYPOGRAPHY.subhead,
    lineHeight: 24,
  },
  metaText: {
    ...TYPOGRAPHY.caption1,
    marginBottom: 4,
  },
  // Story Actions (Features #18, #19, #20)
  storyActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  storyActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    minHeight: 40,
  },
  storyActionText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
  },
  // Analysis Section (Feature #18)
  analysisSection: {
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  analysisSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  analysisSectionTitle: {
    ...TYPOGRAPHY.headline,
  },
  scoreCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  overallScoreLabel: {
    ...TYPOGRAPHY.subhead,
    marginBottom: 4,
  },
  overallScore: {
    fontSize: 48,
    fontFamily: FONTS.extralight,
  },
  componentScores: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  componentLabel: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    flex: 1,
  },
  componentRight: {
    flex: 2,
  },
  componentScore: {
    fontSize: 20,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  componentFeedback: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  feedbackSection: {
    marginBottom: SPACING.md,
  },
  feedbackTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  feedbackText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
    marginBottom: 4,
  },
  impactAssessment: {
    marginTop: SPACING.md,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  impactLabel: {
    ...TYPOGRAPHY.subhead,
  },
  impactValue: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
  },
  // Suggestions Section (Feature #19)
  suggestionsGroup: {
    marginBottom: SPACING.xl,
  },
  suggestionsGroupTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  suggestionCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  suggestionComponent: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  suggestionReason: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  framingCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  framingPerspective: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  framingLabel: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '600',
    marginTop: SPACING.xs,
    marginBottom: 2,
  },
  framingText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  enhancementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  enhancementContent: {
    flex: 1,
  },
  enhancementType: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    marginBottom: 2,
  },
  enhancementText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  keywordChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  keywordText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
  },
  // Variations Section (Feature #20)
  variationCard: {
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  variationHeader: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  variationBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  variationContext: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
  },
  variationTone: {
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  variationContent: {
    marginBottom: SPACING.md,
  },
  variationLabel: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  variationText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  useCaseBox: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  useCaseLabel: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '600',
    marginBottom: 4,
  },
  useCaseText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  usageGuideCard: {
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  usageGuideTitle: {
    fontSize: 20,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.md,
  },
  guideSection: {
    marginBottom: SPACING.md,
  },
  guideLabel: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '600',
    marginBottom: 4,
  },
  guideText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  aiInput: {
    borderWidth: 1,
    borderRadius: SPACING.radiusMD,
    padding: SPACING.md,
    fontSize: 15,
    fontFamily: FONTS.regular,
    minHeight: 150,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: SPACING.radiusMD,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
});
