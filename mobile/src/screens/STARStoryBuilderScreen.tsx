import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  Trash2,
  X,
  Play,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';
import PracticeSession from '../components/PracticeSession';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type STARStoryBuilderRouteProp = RouteProp<RootStackParamList, 'STARStoryBuilder'>;

interface Experience {
  header?: string;
  title?: string;
  position?: string;
  company?: string;
  bullets?: string[];
  description?: string;
}

interface STARStory {
  id: string | number;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  key_themes?: string[];
  talking_points?: string[];
  video_recording_url?: string | null;
  created_at?: string;
}

// Tone options for story generation
const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional & Formal', description: 'Corporate, structured, polished language' },
  { value: 'conversational', label: 'Conversational & Authentic', description: 'Natural, approachable, genuine tone' },
  { value: 'confident', label: 'Confident & Assertive', description: 'Strong, decisive, leadership-focused' },
  { value: 'technical', label: 'Technical & Detailed', description: 'Precise, methodical, technical depth' },
  { value: 'strategic', label: 'Strategic & Visionary', description: 'Big-picture, forward-thinking, executive-level' },
];

const DEFAULT_THEMES = [
  'Leadership Challenge',
  'Problem Solving',
  'Team Collaboration',
  'Handling Ambiguity',
  'Delivering Under Pressure',
  'Conflict Resolution',
  'Innovation & Creativity',
  'Customer Focus',
];

export default function STARStoryBuilderScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<STARStoryBuilderRouteProp>();
  const { colors, isDark } = useTheme();
  const { tailoredResumeId, interviewPrepId } = route.params;

  // Context
  const [companyName, setCompanyName] = useState<string>('');
  const [companyContext, setCompanyContext] = useState<string>('');

  // Data
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);
  const [stories, setStories] = useState<STARStory[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [storyThemes, setStoryThemes] = useState<string[]>(DEFAULT_THEMES);

  // Selection
  const [selectedExperiences, setSelectedExperiences] = useState<Set<number>>(new Set());
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('professional');
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showToneDropdown, setShowToneDropdown] = useState(false);

  // Generation
  const [generating, setGenerating] = useState(false);

  // Story display
  const [collapsedStories, setCollapsedStories] = useState<Set<string>>(new Set());
  const [editingStoryId, setEditingStoryId] = useState<string | number | null>(null);
  const [editedStory, setEditedStory] = useState<STARStory | null>(null);
  const [savingStory, setSavingStory] = useState(false);
  const [deletingStoryId, setDeletingStoryId] = useState<string | number | null>(null);

  // Practice
  const [practicingStory, setPracticingStory] = useState<STARStory | null>(null);

  useEffect(() => {
    loadInterviewPrepContext();
    loadExperiences();
    loadStoriesFromAPI();
  }, []);

  useEffect(() => {
    if (storyThemes.length > 0 && !selectedTheme) {
      setSelectedTheme(storyThemes[0]);
    }
  }, [storyThemes]);

  const loadInterviewPrepContext = async () => {
    try {
      const result = await api.getInterviewPrep(interviewPrepId);
      if (result.success && result.data) {
        const prepData = result.data.prep_data || result.data;
        const name = prepData.company_profile?.name || prepData.company_name || '';
        const title = prepData.role_analysis?.job_title || prepData.job_title || '';
        setCompanyName(name);
        setCompanyContext(name && title ? `${name} - ${title}` : name || '');

        const coreResponsibilities = prepData.role_analysis?.core_responsibilities || [];
        if (coreResponsibilities.length > 0) {
          const combinedThemes = [...coreResponsibilities, ...DEFAULT_THEMES];
          const uniqueThemes = [...new Set(combinedThemes)];
          setStoryThemes(uniqueThemes);
        }
      }
    } catch (error) {
      console.error('Error loading interview prep context:', error);
    }
  };

  const loadExperiences = async () => {
    setLoadingExperiences(true);
    try {
      const result = await api.getTailoredResume(tailoredResumeId);
      if (result.success && result.data) {
        const resumeData = result.data.tailored_data || result.data;
        setExperiences(resumeData.experience || resumeData.experiences || []);
      } else {
        const baseResult = await api.getResume(tailoredResumeId);
        if (baseResult.success && baseResult.data) {
          setExperiences(baseResult.data.experience || baseResult.data.experiences || []);
        }
      }
    } catch (error) {
      console.error('Error loading experiences:', error);
    } finally {
      setLoadingExperiences(false);
    }
  };

  const loadStoriesFromAPI = async () => {
    setLoadingStories(true);
    try {
      const result = await api.listStarStories(tailoredResumeId);
      if (result.success && result.data) {
        const loadedStories = (Array.isArray(result.data) ? result.data : []).map((s: any) => ({
          id: s.id?.toString() || `story_${Date.now()}`,
          title: s.title,
          situation: s.situation,
          task: s.task,
          action: s.action,
          result: s.result,
          key_themes: s.key_themes || [],
          talking_points: s.talking_points || [],
          video_recording_url: s.video_recording_url || null,
        }));
        setStories(loadedStories);
      }
    } catch (error) {
      console.error('Error loading stories from API:', error);
    } finally {
      setLoadingStories(false);
    }
  };

  const toggleExperience = (index: number) => {
    const newSet = new Set(selectedExperiences);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedExperiences(newSet);
  };

  const toggleCollapse = (storyId: string) => {
    const newSet = new Set(collapsedStories);
    if (newSet.has(storyId)) {
      newSet.delete(storyId);
    } else {
      newSet.add(storyId);
    }
    setCollapsedStories(newSet);
  };

  const getExperienceTitle = (exp: Experience) => {
    return exp.header || exp.title || exp.position || 'Experience';
  };

  const generateStory = async () => {
    if (selectedExperiences.size === 0) {
      Alert.alert('Selection Required', 'Please select at least one experience.');
      return;
    }
    if (!selectedTheme) {
      Alert.alert('Theme Required', 'Please select a story theme.');
      return;
    }

    setGenerating(true);
    try {
      const generateResult = await api.generateStarStory({
        tailoredResumeId,
        experienceIndices: [...selectedExperiences],
        storyTheme: selectedTheme,
        tone: selectedTone,
        companyContext: companyContext || undefined,
      });

      if (generateResult.success && generateResult.data) {
        // Save to database
        const saveResult = await api.createStarStory({
          tailored_resume_id: tailoredResumeId,
          experience_indices: [...selectedExperiences],
          title: generateResult.data.title || `${selectedTheme} Story`,
          situation: generateResult.data.situation || '',
          task: generateResult.data.task || '',
          action: generateResult.data.action || '',
          result: generateResult.data.result || '',
          key_themes: generateResult.data.key_themes || [],
          talking_points: generateResult.data.talking_points || [],
        });

        if (saveResult.success && saveResult.data) {
          const newStory: STARStory = {
            id: saveResult.data.id?.toString() || `story_${Date.now()}`,
            title: saveResult.data.title || generateResult.data.title || `${selectedTheme} Story`,
            situation: saveResult.data.situation || generateResult.data.situation || '',
            task: saveResult.data.task || generateResult.data.task || '',
            action: saveResult.data.action || generateResult.data.action || '',
            result: saveResult.data.result || generateResult.data.result || '',
            key_themes: saveResult.data.key_themes || generateResult.data.key_themes || [],
            talking_points: saveResult.data.talking_points || generateResult.data.talking_points || [],
          };
          setStories([...stories, newStory]);
          setSelectedExperiences(new Set());
          setSelectedTheme(storyThemes[0] || '');
          setSelectedTone('professional');
          Alert.alert('Success', 'STAR story generated and saved!');
        } else {
          // Generated but save failed
          const newStory: STARStory = {
            id: `story_${Date.now()}`,
            title: generateResult.data.title || `${selectedTheme} Story`,
            situation: generateResult.data.situation || '',
            task: generateResult.data.task || '',
            action: generateResult.data.action || '',
            result: generateResult.data.result || '',
            key_themes: generateResult.data.key_themes || [],
            talking_points: generateResult.data.talking_points || [],
          };
          setStories([...stories, newStory]);
          setSelectedExperiences(new Set());
          Alert.alert('Warning', 'Story generated but could not be saved to server.');
        }
      } else {
        Alert.alert('Error', generateResult.error || 'Failed to generate STAR story');
      }
    } catch (error) {
      console.error('Error generating story:', error);
      Alert.alert('Error', 'Failed to generate STAR story');
    } finally {
      setGenerating(false);
    }
  };

  const startEditing = (story: STARStory) => {
    setEditingStoryId(story.id);
    setEditedStory({ ...story });
  };

  const saveEdit = async () => {
    if (!editedStory || !editingStoryId) return;

    setSavingStory(true);
    try {
      if (typeof editingStoryId === 'number' || !String(editingStoryId).startsWith('story_')) {
        const numId = typeof editingStoryId === 'number' ? editingStoryId : parseInt(String(editingStoryId));
        if (!isNaN(numId)) {
          const result = await api.updateStarStory(numId, {
            title: editedStory.title,
            situation: editedStory.situation,
            task: editedStory.task,
            action: editedStory.action,
            result: editedStory.result,
            key_themes: editedStory.key_themes,
            talking_points: editedStory.talking_points,
          });
          if (!result.success) {
            Alert.alert('Error', result.error || 'Failed to save story');
            return;
          }
        }
      }

      setStories(stories.map(s => s.id === editingStoryId ? editedStory : s));
      setEditingStoryId(null);
      setEditedStory(null);
      Alert.alert('Success', 'STAR story updated');
    } catch (error) {
      console.error('Error saving story:', error);
      Alert.alert('Error', 'Failed to save story');
    } finally {
      setSavingStory(false);
    }
  };

  const cancelEdit = () => {
    setEditingStoryId(null);
    setEditedStory(null);
  };

  const deleteStory = async (storyId: string | number) => {
    Alert.alert(
      'Delete Story',
      'Are you sure you want to delete this STAR story? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingStoryId(storyId);
            try {
              const numId = typeof storyId === 'number' ? storyId : parseInt(String(storyId));
              if (!isNaN(numId) && !String(storyId).startsWith('story_')) {
                const result = await api.deleteStarStory(numId);
                if (!result.success) {
                  Alert.alert('Error', result.error || 'Failed to delete story');
                  return;
                }
              }
              setStories(stories.filter(s => s.id !== storyId));
            } catch (error) {
              console.error('Error deleting story:', error);
              Alert.alert('Error', 'Failed to delete story');
            } finally {
              setDeletingStoryId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>STAR Story Builder</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Header Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Select experiences from your resume and let AI generate compelling interview stories
        </Text>

        {/* Step 1: Select Experiences */}
        <GlassCard material="thin" style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Select Your Experiences</Text>
          <View style={styles.experiencesList}>
            {loadingExperiences ? (
              <View style={styles.loadingSection}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading resume experiences...
                </Text>
              </View>
            ) : experiences.length === 0 ? (
              <View style={[styles.warningBanner, { backgroundColor: `${COLORS.warning}20`, borderColor: `${COLORS.warning}50` }]}>
                <Text style={{ color: COLORS.warning, fontSize: 14, fontFamily: FONTS.medium }}>
                  Loading resume experiences...
                </Text>
                <Text style={{ color: COLORS.warning, fontSize: 13, fontFamily: FONTS.regular, marginTop: 4 }}>
                  Your resume experiences will appear here once the interview prep data is loaded. If this persists, please go back and try again.
                </Text>
              </View>
            ) : (
              experiences.map((exp, index) => {
                const isSelected = selectedExperiences.has(index);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.experienceCard,
                      {
                        backgroundColor: isSelected ? ALPHA_COLORS.primary.bg : colors.glass,
                        borderColor: isSelected ? COLORS.primary : colors.glassBorder,
                      },
                    ]}
                    onPress={() => toggleExperience(index)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={getExperienceTitle(exp)}
                  >
                    <View style={styles.experienceCheckbox}>
                      {isSelected ? (
                        <View style={[styles.checkboxChecked, { backgroundColor: COLORS.primary }]}>
                          <CheckCircle color="#fff" size={16} />
                        </View>
                      ) : (
                        <View style={[styles.checkboxUnchecked, { borderColor: colors.textTertiary }]} />
                      )}
                    </View>
                    <View style={styles.experienceContent}>
                      <Text style={[styles.experienceTitle, { color: colors.text }]}>
                        {getExperienceTitle(exp)}
                      </Text>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <View style={styles.experienceBullets}>
                          {exp.bullets.slice(0, 2).map((bullet, i) => (
                            <Text key={i} style={[styles.experienceBullet, { color: colors.textTertiary }]} numberOfLines={1}>
                              • {bullet.substring(0, 100)}{bullet.length > 100 ? '...' : ''}
                            </Text>
                          ))}
                          {exp.bullets.length > 2 && (
                            <Text style={[styles.experienceMore, { color: colors.textTertiary }]}>
                              +{exp.bullets.length - 2} more achievements
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </GlassCard>

        {/* Step 2: Choose Theme */}
        <GlassCard material="thin" style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Choose Story Theme</Text>
          <TouchableOpacity
            style={[styles.dropdown, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            onPress={() => setShowThemeDropdown(!showThemeDropdown)}
            accessibilityRole="button"
            accessibilityLabel={`Selected theme: ${selectedTheme || 'None'}`}
            accessibilityState={{ expanded: showThemeDropdown }}
          >
            <Text style={[styles.dropdownText, { color: selectedTheme ? colors.text : colors.textTertiary }]}>
              {selectedTheme || 'Select a theme...'}
            </Text>
            {showThemeDropdown ? (
              <ChevronUp color={colors.textSecondary} size={20} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={20} />
            )}
          </TouchableOpacity>

          {showThemeDropdown && (
            <View style={[styles.dropdownList, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              {storyThemes.map((theme, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    selectedTheme === theme && { backgroundColor: ALPHA_COLORS.primary.bg },
                  ]}
                  onPress={() => {
                    setSelectedTheme(theme);
                    setShowThemeDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, { color: selectedTheme === theme ? COLORS.primary : colors.text }]}>
                    {theme}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </GlassCard>

        {/* Step 3: Choose Tone */}
        <GlassCard material="thin" style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Choose Tone</Text>
          <TouchableOpacity
            style={[styles.dropdown, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            onPress={() => setShowToneDropdown(!showToneDropdown)}
            accessibilityRole="button"
            accessibilityLabel={`Selected tone: ${TONE_OPTIONS.find(t => t.value === selectedTone)?.label || 'None'}`}
            accessibilityState={{ expanded: showToneDropdown }}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.dropdownText, { color: colors.text }]}>
                {TONE_OPTIONS.find(t => t.value === selectedTone)?.label || 'Select a tone...'}
              </Text>
            </View>
            {showToneDropdown ? (
              <ChevronUp color={colors.textSecondary} size={20} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={20} />
            )}
          </TouchableOpacity>
          <Text style={[styles.toneDescription, { color: colors.textSecondary }]}>
            {TONE_OPTIONS.find(t => t.value === selectedTone)?.description}
          </Text>

          {showToneDropdown && (
            <View style={[styles.dropdownList, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              {TONE_OPTIONS.map((tone) => (
                <TouchableOpacity
                  key={tone.value}
                  style={[
                    styles.dropdownItem,
                    selectedTone === tone.value && { backgroundColor: ALPHA_COLORS.primary.bg },
                  ]}
                  onPress={() => {
                    setSelectedTone(tone.value);
                    setShowToneDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, { color: selectedTone === tone.value ? COLORS.primary : colors.text }]}>
                    {tone.label}
                  </Text>
                  <Text style={[styles.dropdownItemSubtext, { color: colors.textTertiary }]}>
                    {tone.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </GlassCard>

        {/* Info Banner */}
        {stories.length > 0 && (
          <View style={[styles.infoBanner, { backgroundColor: `${COLORS.primary}20`, borderColor: '#3b82f650' }]}>
            <Text style={{ color: COLORS.dark.accent, fontSize: 14, fontFamily: FONTS.medium }}>
              Ready to create another story? Select different experiences and a new theme, then tap Generate again.
            </Text>
          </View>
        )}

        {/* Generate Button */}
        <GlassButton
          label={generating ? 'Generating STAR Story...' : stories.length > 0 ? 'Generate Another STAR Story' : 'Generate STAR Story'}
          variant="primary"
          onPress={generateStory}
          disabled={generating || selectedExperiences.size === 0}
          loading={generating}
          icon={!generating ? <Sparkles color="#fff" size={20} /> : undefined}
          fullWidth
          style={styles.generateButton}
          accessibilityLabel={generating ? 'Generating STAR story' : 'Generate STAR story'}
        />

        {/* Generated Stories */}
        {loadingStories ? (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading saved stories...</Text>
          </View>
        ) : stories.length > 0 ? (
          <View style={styles.storiesSection}>
            <View style={styles.storiesHeader}>
              <Text style={[styles.storiesSectionTitle, { color: colors.text }]}>
                Your STAR Stories ({stories.length})
              </Text>
              <Text style={[styles.storiesSubtitle, { color: colors.textSecondary }]}>
                All stories are automatically saved
              </Text>
            </View>

            {stories.map((story) => {
              const storyKey = String(story.id);
              const isCollapsed = collapsedStories.has(storyKey);
              const isEditing = editingStoryId === story.id;
              const isDeleting = deletingStoryId === story.id;

              return (
                <GlassCard key={storyKey} material="thin" style={styles.storyCard}>
                  {isEditing && editedStory ? (
                    // Edit Mode
                    <View style={styles.editMode}>
                      <TextInput
                        style={[styles.editTitleInput, { color: colors.text, backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
                        value={editedStory.title}
                        onChangeText={(text) => setEditedStory({ ...editedStory, title: text })}
                        placeholder="Story Title"
                        placeholderTextColor={colors.textTertiary}
                      />

                      <View style={styles.editSection}>
                        <Text style={[styles.editLabel, { color: colors.textSecondary }]}>Situation (150-250 words)</Text>
                        <TextInput
                          style={[styles.editInput, { color: colors.text, backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
                          value={editedStory.situation}
                          onChangeText={(text) => setEditedStory({ ...editedStory, situation: text })}
                          multiline
                          textAlignVertical="top"
                          placeholder="Detailed context and background..."
                          placeholderTextColor={colors.textTertiary}
                        />
                      </View>

                      <View style={styles.editSection}>
                        <Text style={[styles.editLabel, { color: colors.textSecondary }]}>Task (100-150 words)</Text>
                        <TextInput
                          style={[styles.editInput, { color: colors.text, backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
                          value={editedStory.task}
                          onChangeText={(text) => setEditedStory({ ...editedStory, task: text })}
                          multiline
                          textAlignVertical="top"
                          placeholder="What needed to be accomplished..."
                          placeholderTextColor={colors.textTertiary}
                        />
                      </View>

                      <View style={styles.editSection}>
                        <Text style={[styles.editLabel, { color: colors.textSecondary }]}>Action (300-500 words) - Most Important!</Text>
                        <TextInput
                          style={[styles.editInput, styles.editInputLarge, { color: colors.text, backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
                          value={editedStory.action}
                          onChangeText={(text) => setEditedStory({ ...editedStory, action: text })}
                          multiline
                          textAlignVertical="top"
                          placeholder="Step-by-step breakdown of what YOU did..."
                          placeholderTextColor={colors.textTertiary}
                        />
                      </View>

                      <View style={styles.editSection}>
                        <Text style={[styles.editLabel, { color: colors.textSecondary }]}>Result (150-250 words)</Text>
                        <TextInput
                          style={[styles.editInput, { color: colors.text, backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
                          value={editedStory.result}
                          onChangeText={(text) => setEditedStory({ ...editedStory, result: text })}
                          multiline
                          textAlignVertical="top"
                          placeholder="Specific, quantifiable outcomes..."
                          placeholderTextColor={colors.textTertiary}
                        />
                      </View>

                      <View style={styles.editButtons}>
                        <TouchableOpacity
                          style={[styles.editButton, { backgroundColor: COLORS.success }]}
                          onPress={saveEdit}
                          disabled={savingStory}
                        >
                          {savingStory ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <Save color="#fff" size={16} />
                              <Text style={styles.editButtonTextWhite}>Save Changes</Text>
                            </>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.editButton, { backgroundColor: isDark ? ALPHA_COLORS.white[5] : ALPHA_COLORS.black[3] }]}
                          onPress={cancelEdit}
                        >
                          <X color={colors.textSecondary} size={16} />
                          <Text style={[styles.editButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    // View Mode
                    <View>
                      {/* Story Header with Actions */}
                      <View style={styles.storyHeader}>
                        <Text style={[styles.storyTitle, { color: colors.text }]} numberOfLines={2}>
                          {story.title}
                        </Text>
                        <View style={styles.storyActions}>
                          <TouchableOpacity
                            style={styles.storyActionBtn}
                            onPress={() => toggleCollapse(storyKey)}
                            accessibilityLabel={isCollapsed ? 'Expand story' : 'Collapse story'}
                          >
                            {isCollapsed ? (
                              <ChevronDown color={colors.textSecondary} size={20} />
                            ) : (
                              <ChevronUp color={colors.textSecondary} size={20} />
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.storyActionBtn}
                            onPress={() => setPracticingStory(story)}
                            accessibilityLabel="Practice this story"
                          >
                            <Play color={COLORS.semanticColors.successStrong} size={20} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.storyActionBtn}
                            onPress={() => startEditing(story)}
                            accessibilityLabel="Edit story"
                          >
                            <Edit3 color={colors.textSecondary} size={20} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.storyActionBtn}
                            onPress={() => deleteStory(story.id)}
                            disabled={isDeleting}
                            accessibilityLabel="Delete story"
                          >
                            {isDeleting ? (
                              <ActivityIndicator size="small" color={COLORS.error} />
                            ) : (
                              <Trash2 color={COLORS.error} size={20} />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Collapsed hint */}
                      {isCollapsed && (
                        <Text style={[styles.collapsedHint, { color: colors.textTertiary }]}>
                          Story collapsed - tap arrow to expand
                        </Text>
                      )}

                      {/* Expanded Content */}
                      {!isCollapsed && (
                        <View style={[styles.storyContent, { borderTopColor: colors.border }]}>
                          {/* STAR Sections */}
                          <View style={styles.starSection}>
                            <Text style={[styles.starLabel, { color: COLORS.semanticColors.successStrong }]}>Situation</Text>
                            <Text style={[styles.starText, { color: colors.textSecondary }]}>{story.situation}</Text>
                          </View>

                          <View style={styles.starSection}>
                            <Text style={[styles.starLabel, { color: COLORS.dark.accent }]}>Task</Text>
                            <Text style={[styles.starText, { color: colors.textSecondary }]}>{story.task}</Text>
                          </View>

                          <View style={styles.starSection}>
                            <Text style={[styles.starLabel, { color: COLORS.purple }]}>Action</Text>
                            <Text style={[styles.starText, { color: colors.textSecondary }]}>{story.action}</Text>
                          </View>

                          <View style={styles.starSection}>
                            <Text style={[styles.starLabel, { color: COLORS.warning }]}>Result</Text>
                            <Text style={[styles.starText, { color: colors.textSecondary }]}>{story.result}</Text>
                          </View>

                          {/* Key Themes */}
                          {story.key_themes && story.key_themes.length > 0 && (
                            <View style={styles.metaSection}>
                              <Text style={[styles.metaTitle, { color: colors.textSecondary }]}>Key Themes</Text>
                              <View style={styles.chipContainer}>
                                {story.key_themes.map((theme, i) => (
                                  <View key={i} style={[styles.chip, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                                    <Text style={[styles.chipText, { color: colors.text }]}>{theme}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}

                          {/* Talking Points */}
                          {story.talking_points && story.talking_points.length > 0 && (
                            <View style={styles.metaSection}>
                              <Text style={[styles.metaTitle, { color: colors.textSecondary }]}>Talking Points</Text>
                              {story.talking_points.map((point, i) => (
                                <View key={i} style={styles.bulletRow}>
                                  <Text style={[styles.bulletDot, { color: colors.text }]}>•</Text>
                                  <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{point}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  )}
                </GlassCard>
              );
            })}
          </View>
        ) : null}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* Practice Session Modal */}
      {practicingStory && (
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setPracticingStory(null)}
        >
          <PracticeSession
            story={{
              title: practicingStory.title,
              situation: practicingStory.situation,
              task: practicingStory.task,
              action: practicingStory.action,
              result: practicingStory.result,
              key_themes: practicingStory.key_themes || [],
              talking_points: practicingStory.talking_points || [],
            }}
            onClose={() => setPracticingStory(null)}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: 0,
    paddingBottom: SPACING.xs,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -SPACING.sm,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: 34,
    fontFamily: FONTS.semibold,
  },
  headerPlaceholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
  },
  description: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  sectionCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.md,
  },
  loadingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.lg,
  },
  loadingText: {
    ...TYPOGRAPHY.subhead,
  },
  warningBanner: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  infoBanner: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  experiencesList: {
    gap: SPACING.sm,
  },
  experienceCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 2,
  },
  experienceCheckbox: {
    marginRight: SPACING.md,
    paddingTop: 2,
  },
  checkboxUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  checkboxChecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  experienceContent: {
    flex: 1,
  },
  experienceTitle: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  experienceBullets: {
    marginTop: SPACING.xs,
  },
  experienceBullet: {
    ...TYPOGRAPHY.caption1,
    marginBottom: 2,
  },
  experienceMore: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    fontStyle: 'italic',
    marginTop: 4,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 2,
  },
  dropdownText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
  },
  toneDescription: {
    ...TYPOGRAPHY.caption1,
    marginTop: SPACING.sm,
  },
  dropdownList: {
    marginTop: SPACING.xs,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: SPACING.md,
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  dropdownItemSubtext: {
    ...TYPOGRAPHY.caption1,
    marginTop: 2,
  },
  generateButton: {
    marginBottom: SPACING.xl,
  },
  storiesSection: {
    marginTop: SPACING.md,
  },
  storiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  storiesSectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  storiesSubtitle: {
    ...TYPOGRAPHY.caption1,
    flex: 1,
    textAlign: 'right',
    marginLeft: SPACING.sm,
  },
  storyCard: {
    marginBottom: SPACING.md,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  storyTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONTS.semibold,
    marginRight: SPACING.sm,
  },
  storyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  storyActionBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collapsedHint: {
    ...TYPOGRAPHY.caption1,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
  },
  storyContent: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  starSection: {
    marginBottom: SPACING.md,
  },
  starLabel: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  starText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 22,
  },
  metaSection: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  metaTitle: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  bulletDot: {
    fontSize: 14,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  // Edit mode
  editMode: {
    gap: SPACING.md,
  },
  editTitleInput: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  editSection: {
    gap: SPACING.xs,
  },
  editLabel: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
  },
  editInput: {
    minHeight: 120,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  editInputLarge: {
    minHeight: 200,
  },
  editButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  editButtonTextWhite: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
});
