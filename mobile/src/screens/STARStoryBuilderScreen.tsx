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
  HelpCircle,
  BarChart3,
  Lightbulb,
  Copy,
  TrendingUp,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';

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
  experience_indices?: number[];
  probing_questions?: {
    situation: string[];
    action: string[];
    result: string[];
  };
  challenge_questions?: {
    situation: string[];
    action: string[];
    result: string[];
  };
  created_at?: string;
}

interface StoryPrompt {
  title: string;
  description: string;
  star_hint?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

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

  // Context states
  const [companyName, setCompanyName] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('');

  // Data states
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);
  const [stories, setStories] = useState<STARStory[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);

  // Job-derived data
  const [storyThemes, setStoryThemes] = useState<string[]>(DEFAULT_THEMES);
  const [storyPrompts, setStoryPrompts] = useState<StoryPrompt[]>([]);

  // Selection states
  const [selectedExperiences, setSelectedExperiences] = useState<Set<number>>(new Set());
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('professional');
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showToneDropdown, setShowToneDropdown] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<StoryPrompt | null>(null);
  const [showPromptsDropdown, setShowPromptsDropdown] = useState(false);

  // Generation states
  const [generating, setGenerating] = useState(false);

  // Story display states
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());
  const [editingStoryId, setEditingStoryId] = useState<string | number | null>(null);
  const [editingStory, setEditingStory] = useState<STARStory | null>(null);
  const [savingStory, setSavingStory] = useState(false);
  const [deletingStoryId, setDeletingStoryId] = useState<string | number | null>(null);

  // Guidance states
  const [showGuide, setShowGuide] = useState(false);
  const [expandedGuideSections, setExpandedGuideSections] = useState<Set<string>>(new Set(['situation']));

  // Analysis / Suggestions / Variations states
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [suggestionsResult, setSuggestionsResult] = useState<any>(null);
  const [variationsResult, setVariationsResult] = useState<any>(null);
  const [selectedStoryForAnalysis, setSelectedStoryForAnalysis] = useState<STARStory | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | number | null>(null);
  const [loadingSuggestionsId, setLoadingSuggestionsId] = useState<string | number | null>(null);
  const [generatingVariationsId, setGeneratingVariationsId] = useState<string | number | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [showVariationsModal, setShowVariationsModal] = useState(false);

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

        // Set company and job context
        setCompanyName(prepData.company_profile?.name || prepData.company_name || '');
        setJobTitle(prepData.role_analysis?.job_title || prepData.job_title || '');

        // Extract story themes from job's core responsibilities
        const coreResponsibilities = prepData.role_analysis?.core_responsibilities || [];
        if (coreResponsibilities.length > 0) {
          // Combine job responsibilities with default themes for more options
          const combinedThemes = [...coreResponsibilities, ...DEFAULT_THEMES];
          // Remove duplicates
          const uniqueThemes = [...new Set(combinedThemes)];
          setStoryThemes(uniqueThemes);
        }

        // Extract story prompts from candidate positioning (with STAR hints)
        const prompts = prepData.candidate_positioning?.story_prompts || [];
        if (prompts.length > 0) {
          setStoryPrompts(prompts);
        }
      }
    } catch (error) {
      console.error('Error loading interview prep context:', error);
    }
  };

  const loadExperiences = async () => {
    setLoadingExperiences(true);
    try {
      // First try to get tailored resume data
      const result = await api.getTailoredResume(tailoredResumeId);
      if (result.success && result.data) {
        const resumeData = result.data.tailored_data || result.data;
        setExperiences(resumeData.experience || resumeData.experiences || []);
      } else {
        // Fallback to base resume
        const baseResult = await api.getResume(tailoredResumeId);
        if (baseResult.success && baseResult.data) {
          const resumeData = baseResult.data;
          setExperiences(resumeData.experience || resumeData.experiences || []);
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
        setStories(result.data);
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

  const handleGenerateStory = async () => {
    if (selectedExperiences.size === 0) {
      Alert.alert('Selection Required', 'Please select at least one experience to generate a STAR story.');
      return;
    }

    if (!selectedTheme) {
      Alert.alert('Theme Required', 'Please select a story theme.');
      return;
    }

    setGenerating(true);
    try {
      // Generate the STAR story via AI
      const generateResult = await api.generateStarStory({
        tailoredResumeId,
        experienceIndices: [...selectedExperiences],
        storyTheme: selectedTheme,
        tone: selectedTone,
        companyContext: companyName && jobTitle ? `${companyName} - ${jobTitle}` : undefined,
      });

      if (generateResult.success && generateResult.data) {
        // Add probing and challenge questions based on STAR guidance
        const probingQuestions = {
          situation: [
            'What made this situation significant? What were you trying to achieve?',
            'What was the scope and what obstacles existed?',
            'What would have happened if no action was taken?',
          ],
          action: [
            'Demonstrate your expertise in the relevant skill area.',
            'Were you leading the effort or supporting?',
            'What was your unique contribution? What value did you add?',
            'What obstacles did you face and how did you overcome them?',
          ],
          result: [
            'Why highlight these specific results? What other outcomes were notable?',
            'Can you quantify that impact as a percentage or dollar amount?',
            'What trade-offs were necessary? (speed vs quality vs cost)',
          ],
        };

        const challengeQuestions = {
          situation: [
            'Why is this the best example to demonstrate this competency?',
            'Can you think of alternative examples that show similar skills?',
            'Do you have a more recent example?',
          ],
          action: [
            'What was your individual contribution versus the team\'s?',
            'How did you prioritize, handle setbacks, or secure stakeholder support?',
            'Did you push back on any decisions? How did you drive the right outcome?',
          ],
          result: [
            'What did you learn? What would you do differently?',
            companyName ? `How would you adapt this approach at ${companyName}?` : 'How would you adapt this approach at your target company?',
            'Did the results meet your original objectives from the Situation?',
          ],
        };

        // Save the story to the API
        const saveResult = await api.createStarStory({
          tailored_resume_id: tailoredResumeId,
          experience_indices: [...selectedExperiences],
          title: generateResult.data.title || `${selectedTheme} Story`,
          situation: generateResult.data.situation || '',
          task: generateResult.data.task || '',
          action: generateResult.data.action || '',
          result: generateResult.data.result || '',
          key_themes: generateResult.data.key_themes || [selectedTheme],
          talking_points: generateResult.data.talking_points || [],
          probing_questions: probingQuestions,
          challenge_questions: challengeQuestions,
        });

        if (saveResult.success && saveResult.data) {
          // Add the saved story to state
          const newStory: STARStory = {
            id: saveResult.data.id || `story_${Date.now()}`,
            title: saveResult.data.title || generateResult.data.title || `${selectedTheme} Story`,
            situation: saveResult.data.situation || generateResult.data.situation || '',
            task: saveResult.data.task || generateResult.data.task || '',
            action: saveResult.data.action || generateResult.data.action || '',
            result: saveResult.data.result || generateResult.data.result || '',
            key_themes: saveResult.data.key_themes || generateResult.data.key_themes || [selectedTheme],
            talking_points: saveResult.data.talking_points || generateResult.data.talking_points || [],
            experience_indices: [...selectedExperiences],
            probing_questions: probingQuestions,
            challenge_questions: challengeQuestions,
            created_at: new Date().toISOString(),
          };

          setStories([newStory, ...stories]);
          setSelectedExperiences(new Set());
          setSelectedPrompt(null);
          Alert.alert('Success', 'STAR story generated and saved successfully!');
        } else {
          // Story generated but save failed - still show it
          const newStory: STARStory = {
            id: `story_${Date.now()}`,
            title: generateResult.data.title || `${selectedTheme} Story`,
            situation: generateResult.data.situation || '',
            task: generateResult.data.task || '',
            action: generateResult.data.action || '',
            result: generateResult.data.result || '',
            key_themes: generateResult.data.key_themes || [selectedTheme],
            talking_points: generateResult.data.talking_points || [],
            experience_indices: [...selectedExperiences],
            probing_questions: probingQuestions,
            challenge_questions: challengeQuestions,
            created_at: new Date().toISOString(),
          };

          setStories([newStory, ...stories]);
          setSelectedExperiences(new Set());
          Alert.alert('Warning', 'Story generated but could not be saved to server. It will be saved locally.');
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

  const toggleStoryExpanded = (storyId: string | number) => {
    const storyKey = String(storyId);
    const newSet = new Set(expandedStories);
    if (newSet.has(storyKey)) {
      newSet.delete(storyKey);
    } else {
      newSet.add(storyKey);
    }
    setExpandedStories(newSet);
  };

  const startEditingStory = (story: STARStory) => {
    setEditingStoryId(story.id);
    setEditingStory({ ...story });
  };

  const cancelEditing = () => {
    setEditingStoryId(null);
    setEditingStory(null);
  };

  const saveEditedStory = async () => {
    if (!editingStory || !editingStoryId) return;

    setSavingStory(true);
    try {
      // Update via API if it's a numeric ID (from server)
      if (typeof editingStoryId === 'number') {
        const result = await api.updateStarStory(editingStoryId, {
          situation: editingStory.situation,
          task: editingStory.task,
          action: editingStory.action,
          result: editingStory.result,
        });

        if (!result.success) {
          Alert.alert('Error', result.error || 'Failed to save story');
          return;
        }
      }

      // Update local state
      const updatedStories = stories.map(s =>
        s.id === editingStoryId ? editingStory : s
      );
      setStories(updatedStories);
      cancelEditing();
    } catch (error) {
      console.error('Error saving story:', error);
      Alert.alert('Error', 'Failed to save story');
    } finally {
      setSavingStory(false);
    }
  };

  const deleteStory = async (storyId: string | number) => {
    Alert.alert(
      'Delete Story',
      'Are you sure you want to delete this STAR story?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingStoryId(storyId);
            try {
              // Delete via API if it's a numeric ID (from server)
              if (typeof storyId === 'number') {
                const result = await api.deleteStarStory(storyId);
                if (!result.success) {
                  Alert.alert('Error', result.error || 'Failed to delete story');
                  return;
                }
              }

              // Update local state
              const updatedStories = stories.filter(s => s.id !== storyId);
              setStories(updatedStories);
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

  // Analyze / Suggestions / Variations handlers
  const handleAnalyzeStory = async (story: STARStory) => {
    if (typeof story.id !== 'number') {
      Alert.alert('Save Required', 'Please save the story first before analyzing.');
      return;
    }
    setAnalyzingId(story.id);
    setAnalysisResult(null);
    setSelectedStoryForAnalysis(story);
    try {
      const result = await api.analyzeStarStory(story.id);
      if (result.success && result.data) {
        setAnalysisResult(result.data);
        setShowAnalysisModal(true);
      } else {
        Alert.alert('Analysis Failed', result.error || 'Could not analyze story');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze story');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleGetSuggestions = async (story: STARStory) => {
    if (typeof story.id !== 'number') {
      Alert.alert('Save Required', 'Please save the story first before getting suggestions.');
      return;
    }
    setLoadingSuggestionsId(story.id);
    setSuggestionsResult(null);
    setSelectedStoryForAnalysis(story);
    try {
      const result = await api.getStorySuggestions(story.id);
      if (result.success && result.data) {
        setSuggestionsResult(result.data);
        setShowSuggestionsModal(true);
      } else {
        Alert.alert('Suggestions Failed', result.error || 'Could not get suggestions');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to get suggestions');
    } finally {
      setLoadingSuggestionsId(null);
    }
  };

  const handleGenerateVariations = async (story: STARStory) => {
    if (typeof story.id !== 'number') {
      Alert.alert('Save Required', 'Please save the story first before generating variations.');
      return;
    }
    setGeneratingVariationsId(story.id);
    setVariationsResult(null);
    setSelectedStoryForAnalysis(story);
    try {
      const result = await api.generateStoryVariations({
        storyId: story.id,
        contexts: ['technical_interview', 'behavioral_interview', 'executive_presentation', 'networking'],
        tones: ['professional', 'conversational', 'enthusiastic'],
      });
      if (result.success && result.data) {
        setVariationsResult(result.data);
        setShowVariationsModal(true);
      } else {
        Alert.alert('Generation Failed', result.error || 'Could not generate variations');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate variations');
    } finally {
      setGeneratingVariationsId(null);
    }
  };

  const getExperienceTitle = (exp: Experience) => {
    return exp.header || exp.title || exp.position || 'Experience';
  };

  const toggleGuideSection = (section: string) => {
    const newSet = new Set(expandedGuideSections);
    if (newSet.has(section)) {
      newSet.delete(section);
    } else {
      newSet.add(section);
    }
    setExpandedGuideSections(newSet);
  };

  // STAR Method Guidance Data
  const STAR_GUIDANCE = {
    situation: {
      letter: 'S',
      title: 'SITUATION/TASK',
      subtitle: 'Set the scene and provide context for your story',
      keyQuestions: 'Address: where it happened, when it occurred, and why it mattered',
      probingQuestions: [
        'What made this situation significant? What were you trying to achieve?',
        'What was the scope and what obstacles existed?',
        'What would have happened if no action was taken?',
      ],
      challengeQuestions: [
        'Why is this the best example to demonstrate this competency?',
        'Can you think of alternative examples that show similar skills?',
        'Do you have a more recent example?',
      ],
      color: COLORS.success,
    },
    action: {
      letter: 'A',
      title: 'ACTION',
      subtitle: 'Detail the specific steps you took',
      keyQuestions: 'Address: what you personally owned, your approach, and who was involved',
      probingQuestions: [
        'Demonstrate your expertise in the relevant skill area.',
        'Were you leading the effort or supporting?',
        'What was your unique contribution? What value did you add?',
        'What obstacles did you face and how did you overcome them?',
      ],
      challengeQuestions: [
        'What was your individual contribution versus the team\'s?',
        'How did you prioritize, handle setbacks, or secure stakeholder support?',
        'Did you push back on any decisions? How did you drive the right outcome?',
      ],
      color: COLORS.purple,
    },
    result: {
      letter: 'R',
      title: 'RESULTS',
      subtitle: 'Quantify success and demonstrate impact',
      keyQuestions: '',
      resultTypes: [
        '$ Financial impact: cost savings or revenue generated',
        '# Scale metrics: volume, size, or scope',
        '% Improvement rates: year-over-year or before/after changes',
        '⏱ Time savings: faster delivery, reduced cycle time',
        '👥 People impact: customer satisfaction, team morale',
        '✓ Quality gains: error reduction, process improvements',
      ],
      probingQuestions: [
        'Why highlight these specific results? What other outcomes were notable?',
        'Can you quantify that impact as a percentage or dollar amount?',
        'What trade-offs were necessary? (speed vs quality vs cost)',
        'Tell me more about any concerns around timeline, scope, or impact...',
      ],
      challengeQuestions: [
        'What did you learn? What would you do differently?',
        'How would you adapt this approach at your target company?',
        'Did the results meet your original objectives from the Situation?',
      ],
      color: COLORS.warning,
    },
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
        >
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>STAR Story Builder</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Intro Card */}
        <GlassCard material="thin" style={styles.introCard}>
          <View style={styles.introHeader}>
            <Sparkles color={COLORS.purple} size={28} />
            <Text style={[styles.introTitle, { color: colors.text }]}>AI STAR Story Generator</Text>
          </View>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            Select experiences from your resume, choose a theme and tone, and let AI generate compelling STAR stories for your interviews.
          </Text>
          {companyName && (
            <View style={[styles.contextBadge, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
              <Text style={[styles.contextBadgeText, { color: COLORS.primary }]}>
                Tailored for: {companyName} {jobTitle ? `- ${jobTitle}` : ''}
              </Text>
            </View>
          )}
        </GlassCard>

        {/* STAR Method Guide */}
        <GlassCard material="thin" style={styles.guideCard}>
          <TouchableOpacity
            style={styles.guideHeader}
            onPress={() => setShowGuide(!showGuide)}
            accessibilityRole="button"
            accessibilityLabel="Toggle STAR method guide"
            accessibilityState={{ expanded: showGuide }}
          >
            <View style={styles.guideHeaderLeft}>
              <HelpCircle color={COLORS.info} size={24} />
              <View>
                <Text style={[styles.guideTitle, { color: colors.text }]}>STAR Method Guide</Text>
                <Text style={[styles.guideSubtitle, { color: colors.textSecondary }]}>
                  Learn how to craft compelling interview stories
                </Text>
              </View>
            </View>
            {showGuide ? (
              <ChevronUp color={colors.textSecondary} size={20} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={20} />
            )}
          </TouchableOpacity>

          {showGuide && (
            <View style={[styles.guideContent, { borderTopColor: colors.border }]}>
              {/* Situation Section */}
              <View style={[styles.guideSection, { borderBottomColor: isDark ? ALPHA_COLORS.white[10] : ALPHA_COLORS.black[10] }]}>
                <TouchableOpacity
                  style={styles.guideSectionHeader}
                  onPress={() => toggleGuideSection('situation')}
                  accessibilityRole="button"
                  accessibilityLabel="Situation and Task section"
                  accessibilityHint={expandedGuideSections.has('situation') ? "Collapse to hide details" : "Expand to view probing and challenge questions"}
                  accessibilityState={{ expanded: expandedGuideSections.has('situation') }}
                >
                  <View style={styles.guideSectionLeft}>
                    <View style={[styles.guideLetter, { backgroundColor: STAR_GUIDANCE.situation.color }]}>
                      <Text style={styles.guideLetterText}>{STAR_GUIDANCE.situation.letter}</Text>
                    </View>
                    <View style={styles.guideSectionTitleContainer}>
                      <Text style={[styles.guideSectionTitle, { color: colors.text }]}>
                        {STAR_GUIDANCE.situation.title}
                      </Text>
                      <Text style={[styles.guideSectionSubtitle, { color: colors.textSecondary }]}>
                        {STAR_GUIDANCE.situation.subtitle}
                      </Text>
                    </View>
                  </View>
                  {expandedGuideSections.has('situation') ? (
                    <ChevronUp color={colors.textTertiary} size={18} />
                  ) : (
                    <ChevronDown color={colors.textTertiary} size={18} />
                  )}
                </TouchableOpacity>

                {expandedGuideSections.has('situation') && (
                  <View style={styles.guideSectionContent}>
                    <View style={[styles.guideKeyQuestions, { borderBottomColor: isDark ? ALPHA_COLORS.white[10] : ALPHA_COLORS.black[10] }]}>
                      <Text style={[styles.guideKeyQuestionsText, { color: colors.text }]}>
                        {STAR_GUIDANCE.situation.keyQuestions}
                      </Text>
                    </View>

                    <View style={styles.guideQuestionGroup}>
                      <Text style={[styles.guideQuestionGroupTitle, { color: colors.textSecondary }]}>
                        Probing Questions:
                      </Text>
                      {STAR_GUIDANCE.situation.probingQuestions.map((q, i) => (
                        <View key={i} style={styles.guideQuestionItem}>
                          <Text style={[styles.guideQuestionBullet, { color: colors.textTertiary }]}>•</Text>
                          <Text style={[styles.guideQuestionText, { color: colors.textSecondary }]}>{q}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={[styles.guideQuestionGroup, styles.challengeGroup, { backgroundColor: ALPHA_COLORS.warning.bg }]}>
                      <Text style={[styles.guideQuestionGroupTitle, { color: COLORS.warning }]}>
                        ⚡ Challenge Questions:
                      </Text>
                      {STAR_GUIDANCE.situation.challengeQuestions.map((q, i) => (
                        <View key={i} style={styles.guideQuestionItem}>
                          <Text style={[styles.guideQuestionBullet, { color: COLORS.warning }]}>•</Text>
                          <Text style={[styles.guideQuestionText, { color: colors.text }]}>{q}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Action Section */}
              <View style={[styles.guideSection, { borderBottomColor: isDark ? ALPHA_COLORS.white[10] : ALPHA_COLORS.black[10] }]}>
                <TouchableOpacity
                  style={styles.guideSectionHeader}
                  onPress={() => toggleGuideSection('action')}
                  accessibilityRole="button"
                  accessibilityLabel="Action section - most important"
                  accessibilityHint={expandedGuideSections.has('action') ? "Collapse to hide details" : "Expand to view probing and challenge questions about your specific contributions"}
                  accessibilityState={{ expanded: expandedGuideSections.has('action') }}
                >
                  <View style={styles.guideSectionLeft}>
                    <View style={[styles.guideLetter, { backgroundColor: STAR_GUIDANCE.action.color }]}>
                      <Text style={styles.guideLetterText}>{STAR_GUIDANCE.action.letter}</Text>
                    </View>
                    <View style={styles.guideSectionTitleContainer}>
                      <Text style={[styles.guideSectionTitle, { color: colors.text }]}>
                        {STAR_GUIDANCE.action.title}
                      </Text>
                      <Text style={[styles.guideSectionSubtitle, { color: colors.textSecondary }]}>
                        {STAR_GUIDANCE.action.subtitle}
                      </Text>
                    </View>
                  </View>
                  {expandedGuideSections.has('action') ? (
                    <ChevronUp color={colors.textTertiary} size={18} />
                  ) : (
                    <ChevronDown color={colors.textTertiary} size={18} />
                  )}
                </TouchableOpacity>

                {expandedGuideSections.has('action') && (
                  <View style={styles.guideSectionContent}>
                    <View style={[styles.guideHighlight, { backgroundColor: ALPHA_COLORS.purple.bg }]}>
                      <Text style={[styles.guideHighlightText, { color: COLORS.purple }]}>
                        ⭐ This is the MOST IMPORTANT section! Focus on YOUR specific contributions.
                      </Text>
                    </View>

                    <View style={[styles.guideKeyQuestions, { borderBottomColor: isDark ? ALPHA_COLORS.white[10] : ALPHA_COLORS.black[10] }]}>
                      <Text style={[styles.guideKeyQuestionsText, { color: colors.text }]}>
                        {STAR_GUIDANCE.action.keyQuestions}
                      </Text>
                    </View>

                    <View style={styles.guideQuestionGroup}>
                      <Text style={[styles.guideQuestionGroupTitle, { color: colors.textSecondary }]}>
                        Probing Questions:
                      </Text>
                      {STAR_GUIDANCE.action.probingQuestions.map((q, i) => (
                        <View key={i} style={styles.guideQuestionItem}>
                          <Text style={[styles.guideQuestionBullet, { color: colors.textTertiary }]}>•</Text>
                          <Text style={[styles.guideQuestionText, { color: colors.textSecondary }]}>{q}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={[styles.guideQuestionGroup, styles.challengeGroup, { backgroundColor: ALPHA_COLORS.warning.bg }]}>
                      <Text style={[styles.guideQuestionGroupTitle, { color: COLORS.warning }]}>
                        ⚡ Challenge Questions:
                      </Text>
                      {STAR_GUIDANCE.action.challengeQuestions.map((q, i) => (
                        <View key={i} style={styles.guideQuestionItem}>
                          <Text style={[styles.guideQuestionBullet, { color: COLORS.warning }]}>•</Text>
                          <Text style={[styles.guideQuestionText, { color: colors.text }]}>{q}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Result Section */}
              <View style={[styles.guideSection, { borderBottomWidth: 0, borderBottomColor: isDark ? ALPHA_COLORS.white[10] : ALPHA_COLORS.black[10] }]}>
                <TouchableOpacity
                  style={styles.guideSectionHeader}
                  onPress={() => toggleGuideSection('result')}
                  accessibilityRole="button"
                  accessibilityLabel="Results section"
                  accessibilityHint={expandedGuideSections.has('result') ? "Collapse to hide details" : "Expand to view types of results to include and probing questions"}
                  accessibilityState={{ expanded: expandedGuideSections.has('result') }}
                >
                  <View style={styles.guideSectionLeft}>
                    <View style={[styles.guideLetter, { backgroundColor: STAR_GUIDANCE.result.color }]}>
                      <Text style={styles.guideLetterText}>{STAR_GUIDANCE.result.letter}</Text>
                    </View>
                    <View style={styles.guideSectionTitleContainer}>
                      <Text style={[styles.guideSectionTitle, { color: colors.text }]}>
                        {STAR_GUIDANCE.result.title}
                      </Text>
                      <Text style={[styles.guideSectionSubtitle, { color: colors.textSecondary }]}>
                        {STAR_GUIDANCE.result.subtitle}
                      </Text>
                    </View>
                  </View>
                  {expandedGuideSections.has('result') ? (
                    <ChevronUp color={colors.textTertiary} size={18} />
                  ) : (
                    <ChevronDown color={colors.textTertiary} size={18} />
                  )}
                </TouchableOpacity>

                {expandedGuideSections.has('result') && (
                  <View style={styles.guideSectionContent}>
                    {/* Result Types */}
                    <View style={styles.guideQuestionGroup}>
                      <Text style={[styles.guideQuestionGroupTitle, { color: STAR_GUIDANCE.result.color }]}>
                        Types of Results to Include:
                      </Text>
                      {STAR_GUIDANCE.result.resultTypes.map((type, i) => (
                        <View key={i} style={styles.guideQuestionItem}>
                          <Text style={[styles.guideQuestionText, { color: colors.text }]}>{type}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.guideQuestionGroup}>
                      <Text style={[styles.guideQuestionGroupTitle, { color: colors.textSecondary }]}>
                        Probing Questions:
                      </Text>
                      {STAR_GUIDANCE.result.probingQuestions.map((q, i) => (
                        <View key={i} style={styles.guideQuestionItem}>
                          <Text style={[styles.guideQuestionBullet, { color: colors.textTertiary }]}>•</Text>
                          <Text style={[styles.guideQuestionText, { color: colors.textSecondary }]}>{q}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={[styles.guideQuestionGroup, styles.challengeGroup, { backgroundColor: ALPHA_COLORS.warning.bg }]}>
                      <Text style={[styles.guideQuestionGroupTitle, { color: COLORS.warning }]}>
                        ⚡ Challenge Questions:
                      </Text>
                      {STAR_GUIDANCE.result.challengeQuestions.map((q, i) => (
                        <View key={i} style={styles.guideQuestionItem}>
                          <Text style={[styles.guideQuestionBullet, { color: COLORS.warning }]}>•</Text>
                          <Text style={[styles.guideQuestionText, { color: colors.text }]}>{q}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </GlassCard>

        {/* Step 1: Select Experiences */}
        <View style={styles.stepSection}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumber, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Select Your Experiences</Text>
          </View>

          {loadingExperiences ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading resume experiences...
              </Text>
            </View>
          ) : experiences.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No experiences found in your resume.
              </Text>
            </View>
          ) : (
            <View style={styles.experiencesList}>
              {experiences.map((exp, index) => {
                const isSelected = selectedExperiences.has(index);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.experienceCard,
                      { backgroundColor: colors.glass, borderColor: isSelected ? COLORS.primary : (isDark ? colors.glassBorder : 'transparent') },
                      isSelected && styles.experienceCardSelected,
                    ]}
                    onPress={() => toggleExperience(index)}
                    accessibilityRole="checkbox"
                    accessibilityLabel={`${getExperienceTitle(exp)}${exp.company ? `, ${exp.company}` : ''}`}
                    accessibilityHint={isSelected ? "Selected. Tap to deselect this experience" : "Not selected. Tap to select this experience for your story"}
                    accessibilityState={{ checked: isSelected }}
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
                      {exp.company && (
                        <Text style={[styles.experienceCompany, { color: colors.textSecondary }]}>
                          {exp.company}
                        </Text>
                      )}
                      {exp.bullets && exp.bullets.length > 0 && (
                        <View style={styles.experienceBullets}>
                          {exp.bullets.slice(0, 2).map((bullet, bulletIndex) => (
                            <Text
                              key={bulletIndex}
                              style={[styles.experienceBullet, { color: colors.textTertiary }]}
                              numberOfLines={1}
                            >
                              • {bullet}
                            </Text>
                          ))}
                          {exp.bullets.length > 2 && (
                            <Text style={[styles.experienceMore, { color: COLORS.primary }]}>
                              +{exp.bullets.length - 2} more achievements
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Step 2: Choose Theme */}
        <View style={styles.stepSection}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumber, { backgroundColor: COLORS.success }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Choose Story Theme</Text>
          </View>

          <TouchableOpacity
            style={[styles.dropdown, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
            onPress={() => setShowThemeDropdown(!showThemeDropdown)}
            accessibilityRole="button"
            accessibilityLabel={`Selected theme: ${selectedTheme || 'None selected'}`}
            accessibilityHint={showThemeDropdown ? "Collapse theme list" : "Expand to select a story theme"}
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
              {storyThemes.map((theme: string, index: number) => (
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
                  accessibilityRole="button"
                  accessibilityLabel={theme}
                  accessibilityHint="Select this theme for your story"
                  accessibilityState={{ selected: selectedTheme === theme }}
                >
                  <Text style={[styles.dropdownItemText, { color: selectedTheme === theme ? COLORS.primary : colors.text }]}>
                    {theme}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Story Prompts from Job (Optional) */}
        {storyPrompts.length > 0 && (
          <View style={styles.stepSection}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNumber, { backgroundColor: COLORS.info }]}>
                <Text style={styles.stepNumberText}>💡</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Story Prompts from Job</Text>
                <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
                  Pre-built prompts based on this job's requirements
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.dropdown, { backgroundColor: colors.glass, borderColor: selectedPrompt ? COLORS.info : colors.glassBorder }]}
              onPress={() => setShowPromptsDropdown(!showPromptsDropdown)}
              accessibilityRole="button"
              accessibilityLabel={`Selected prompt: ${selectedPrompt?.title || 'None selected'}`}
              accessibilityHint={showPromptsDropdown ? "Collapse prompt list" : "Expand to select a pre-built story prompt based on job requirements"}
              accessibilityState={{ expanded: showPromptsDropdown }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.dropdownText, { color: selectedPrompt ? colors.text : colors.textTertiary }]}>
                  {selectedPrompt?.title || 'Select a story prompt (optional)...'}
                </Text>
                {selectedPrompt && (
                  <Text style={[styles.dropdownSubtext, { color: colors.textSecondary }]} numberOfLines={2}>
                    {selectedPrompt.description}
                  </Text>
                )}
              </View>
              {showPromptsDropdown ? (
                <ChevronUp color={colors.textSecondary} size={20} />
              ) : (
                <ChevronDown color={colors.textSecondary} size={20} />
              )}
            </TouchableOpacity>

            {showPromptsDropdown && (
              <View style={[styles.dropdownList, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                {/* Clear selection option */}
                <TouchableOpacity
                  style={[styles.dropdownItem, !selectedPrompt && { backgroundColor: ALPHA_COLORS.info.bg }]}
                  onPress={() => {
                    setSelectedPrompt(null);
                    setShowPromptsDropdown(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="No prompt, use custom theme only"
                  accessibilityHint="Clears the selected prompt"
                  accessibilityState={{ selected: !selectedPrompt }}
                >
                  <Text style={[styles.dropdownItemText, { color: !selectedPrompt ? COLORS.info : colors.textTertiary }]}>
                    No prompt (custom theme only)
                  </Text>
                </TouchableOpacity>

                {storyPrompts.map((prompt, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      selectedPrompt?.title === prompt.title && { backgroundColor: ALPHA_COLORS.info.bg },
                    ]}
                    onPress={() => {
                      setSelectedPrompt(prompt);
                      // Also set the theme based on the prompt title
                      setSelectedTheme(prompt.title);
                      setShowPromptsDropdown(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${prompt.title}. ${prompt.description}`}
                    accessibilityHint="Select this pre-built story prompt"
                    accessibilityState={{ selected: selectedPrompt?.title === prompt.title }}
                  >
                    <Text style={[styles.dropdownItemText, { color: selectedPrompt?.title === prompt.title ? COLORS.info : colors.text }]}>
                      {prompt.title}
                    </Text>
                    <Text style={[styles.dropdownItemSubtext, { color: colors.textTertiary }]} numberOfLines={2}>
                      {prompt.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Show STAR Hints if a prompt is selected */}
            {selectedPrompt?.star_hint && (
              <GlassCard material="thin" style={styles.starHintCard}>
                <Text style={[styles.starHintTitle, { color: COLORS.info }]}>💡 STAR Hints for This Story</Text>
                <View style={styles.starHintContent}>
                  <View style={styles.starHintItem}>
                    <Text style={[styles.starHintLabel, { color: COLORS.success }]}>S - Situation:</Text>
                    <Text style={[styles.starHintText, { color: colors.textSecondary }]}>{selectedPrompt.star_hint.situation}</Text>
                  </View>
                  <View style={styles.starHintItem}>
                    <Text style={[styles.starHintLabel, { color: COLORS.info }]}>T - Task:</Text>
                    <Text style={[styles.starHintText, { color: colors.textSecondary }]}>{selectedPrompt.star_hint.task}</Text>
                  </View>
                  <View style={styles.starHintItem}>
                    <Text style={[styles.starHintLabel, { color: COLORS.purple }]}>A - Action:</Text>
                    <Text style={[styles.starHintText, { color: colors.textSecondary }]}>{selectedPrompt.star_hint.action}</Text>
                  </View>
                  <View style={styles.starHintItem}>
                    <Text style={[styles.starHintLabel, { color: COLORS.warning }]}>R - Result:</Text>
                    <Text style={[styles.starHintText, { color: colors.textSecondary }]}>{selectedPrompt.star_hint.result}</Text>
                  </View>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* Step 3: Choose Tone */}
        <View style={styles.stepSection}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumber, { backgroundColor: COLORS.purple }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Choose Tone</Text>
          </View>

          <TouchableOpacity
            style={[styles.dropdown, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
            onPress={() => setShowToneDropdown(!showToneDropdown)}
            accessibilityRole="button"
            accessibilityLabel={`Selected tone: ${TONE_OPTIONS.find(t => t.value === selectedTone)?.label || 'None'}`}
            accessibilityHint={showToneDropdown ? "Collapse tone list" : "Expand to select a tone for your story"}
            accessibilityState={{ expanded: showToneDropdown }}
          >
            <View>
              <Text style={[styles.dropdownText, { color: colors.text }]}>
                {TONE_OPTIONS.find(t => t.value === selectedTone)?.label || 'Select a tone...'}
              </Text>
              <Text style={[styles.dropdownSubtext, { color: colors.textSecondary }]}>
                {TONE_OPTIONS.find(t => t.value === selectedTone)?.description}
              </Text>
            </View>
            {showToneDropdown ? (
              <ChevronUp color={colors.textSecondary} size={20} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={20} />
            )}
          </TouchableOpacity>

          {showToneDropdown && (
            <View style={[styles.dropdownList, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              {TONE_OPTIONS.map((tone, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    selectedTone === tone.value && { backgroundColor: ALPHA_COLORS.purple.bg },
                  ]}
                  onPress={() => {
                    setSelectedTone(tone.value);
                    setShowToneDropdown(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${tone.label}. ${tone.description}`}
                  accessibilityHint="Select this tone for your story"
                  accessibilityState={{ selected: selectedTone === tone.value }}
                >
                  <Text style={[styles.dropdownItemText, { color: selectedTone === tone.value ? COLORS.purple : colors.text }]}>
                    {tone.label}
                  </Text>
                  <Text style={[styles.dropdownItemSubtext, { color: colors.textTertiary }]}>
                    {tone.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Generate Button */}
        <GlassButton
          label={generating ? 'Generating...' : stories.length > 0 ? 'Generate Another Story' : 'Generate STAR Story'}
          variant="primary"
          onPress={handleGenerateStory}
          disabled={generating || selectedExperiences.size === 0}
          loading={generating}
          icon={!generating ? <Sparkles color="#fff" size={20} /> : undefined}
          fullWidth
          style={styles.generateButton}
          accessibilityLabel={generating ? 'Generating STAR story' : `Generate STAR story from ${selectedExperiences.size} selected experience${selectedExperiences.size !== 1 ? 's' : ''}`}
          accessibilityHint={selectedExperiences.size === 0 ? "Select at least one experience to continue" : "Uses AI to create a behavioral interview story"}
        />

        {/* Generated Stories */}
        {loadingStories ? (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading saved stories...
            </Text>
          </View>
        ) : stories.length > 0 ? (
          <View style={styles.storiesSection}>
            <Text style={[styles.storiesSectionTitle, { color: colors.text }]}>
              Your STAR Stories ({stories.length})
            </Text>

            {stories.map((story) => {
              const storyId = story.id;
              const storyKey = String(storyId);
              const isExpanded = expandedStories.has(storyKey);
              const isEditing = editingStoryId === storyId;
              const isDeleting = deletingStoryId === storyId;

              return (
                <GlassCard key={storyKey} material="thin" style={styles.storyCard}>
                  {/* Story Header */}
                  <TouchableOpacity
                    style={styles.storyHeader}
                    onPress={() => toggleStoryExpanded(storyId)}
                    accessibilityRole="button"
                    accessibilityLabel={story.title}
                    accessibilityHint={isExpanded ? "Collapse to hide story details" : "Expand to view situation, task, action, and results"}
                    accessibilityState={{ expanded: isExpanded }}
                  >
                    <Text style={[styles.storyTitle, { color: colors.text }]} numberOfLines={1}>
                      {story.title}
                    </Text>
                    <View style={styles.storyActions}>
                      {isExpanded ? (
                        <ChevronUp color={colors.textSecondary} size={20} />
                      ) : (
                        <ChevronDown color={colors.textSecondary} size={20} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <View style={[styles.storyContent, { borderTopColor: colors.border }]}>
                      {isEditing && editingStory ? (
                        // Edit Mode
                        <View style={styles.editMode}>
                          {(['situation', 'task', 'action', 'result'] as const).map((section) => (
                            <View key={section} style={styles.editSection}>
                              <Text style={[styles.editLabel, { color: colors.text }]}>
                                {section.charAt(0).toUpperCase() + section.slice(1)}
                                {section === 'action' && ' (Most Important!)'}
                              </Text>
                              <TextInput
                                style={[styles.editInput, { color: colors.text, backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
                                value={editingStory[section]}
                                onChangeText={(text) => setEditingStory({ ...editingStory, [section]: text })}
                                multiline
                                textAlignVertical="top"
                                accessibilityLabel={`Edit ${section}`}
                                accessibilityHint={`Enter your ${section} content for the STAR story`}
                              />
                            </View>
                          ))}
                          <View style={styles.editButtons}>
                            <TouchableOpacity
                              style={[styles.editButton, styles.cancelButton, { backgroundColor: isDark ? ALPHA_COLORS.white[5] : ALPHA_COLORS.black[3] }]}
                              onPress={cancelEditing}
                              accessibilityRole="button"
                              accessibilityLabel="Cancel editing"
                              accessibilityHint="Discards changes and returns to view mode"
                            >
                              <X color={colors.textSecondary} size={16} />
                              <Text style={[styles.editButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.editButton, styles.saveButton, { backgroundColor: COLORS.success }]}
                              onPress={saveEditedStory}
                              disabled={savingStory}
                              accessibilityRole="button"
                              accessibilityLabel={savingStory ? "Saving changes" : "Save changes"}
                              accessibilityHint="Saves the edited story content"
                            >
                              {savingStory ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <>
                                  <Save color="#fff" size={16} />
                                  <Text style={styles.saveButtonText}>Save</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        // View Mode
                        <View>
                          {/* STAR Sections with Probing Questions */}
                          {[
                            { key: 'situation', label: 'Situation', color: COLORS.success, questionsKey: 'situation' as const },
                            { key: 'task', label: 'Task', color: COLORS.info, questionsKey: null },
                            { key: 'action', label: 'Action', color: COLORS.purple, questionsKey: 'action' as const },
                            { key: 'result', label: 'Result', color: COLORS.warning, questionsKey: 'result' as const },
                          ].map(({ key, label, color, questionsKey }) => (
                            <View key={key} style={styles.starSection}>
                              <View style={[styles.starSectionHeader, { borderLeftColor: color }]}>
                                <Text style={[styles.starSectionLabel, { color }]}>{label}</Text>
                              </View>
                              <Text style={[styles.starSectionText, { color: colors.textSecondary }]}>
                                {story[key as keyof STARStory] as string}
                              </Text>

                              {/* Probing Questions for this section */}
                              {questionsKey && story.probing_questions?.[questionsKey] && (
                                <View style={[styles.storyQuestionsContainer, { backgroundColor: colors.glass }]}>
                                  <Text style={[styles.storyQuestionsTitle, { color: colors.textSecondary }]}>
                                    🎯 Practice Questions:
                                  </Text>
                                  {story.probing_questions[questionsKey].map((q, qi) => (
                                    <View key={qi} style={styles.storyQuestionItem}>
                                      <Text style={[styles.storyQuestionBullet, { color: color }]}>•</Text>
                                      <Text style={[styles.storyQuestionText, { color: colors.textTertiary }]}>{q}</Text>
                                    </View>
                                  ))}
                                </View>
                              )}

                              {/* Challenge Questions for this section */}
                              {questionsKey && story.challenge_questions?.[questionsKey] && (
                                <View style={[styles.storyChallengeContainer, { backgroundColor: ALPHA_COLORS.warning.bg }]}>
                                  <Text style={[styles.storyQuestionsTitle, { color: COLORS.warning }]}>
                                    ⚡ Challenge Questions:
                                  </Text>
                                  {story.challenge_questions[questionsKey].map((q, qi) => (
                                    <View key={qi} style={styles.storyQuestionItem}>
                                      <Text style={[styles.storyQuestionBullet, { color: COLORS.warning }]}>•</Text>
                                      <Text style={[styles.storyQuestionText, { color: colors.text }]}>{q}</Text>
                                    </View>
                                  ))}
                                </View>
                              )}
                            </View>
                          ))}

                          {/* Key Themes */}
                          {story.key_themes && story.key_themes.length > 0 && (
                            <View style={styles.themesSection}>
                              <Text style={[styles.themesSectionTitle, { color: colors.text }]}>Key Themes</Text>
                              <View style={styles.themesContainer}>
                                {story.key_themes.map((theme, themeIndex) => (
                                  <View key={themeIndex} style={[styles.themeChip, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                                    <Text style={[styles.themeChipText, { color: COLORS.primary }]}>{theme}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}

                          {/* Talking Points */}
                          {story.talking_points && story.talking_points.length > 0 && (
                            <View style={styles.talkingPointsSection}>
                              <Text style={[styles.talkingPointsTitle, { color: colors.text }]}>Talking Points</Text>
                              {story.talking_points.map((point, pointIndex) => (
                                <View key={pointIndex} style={styles.talkingPointItem}>
                                  <View style={[styles.talkingPointDot, { backgroundColor: COLORS.purple }]} />
                                  <Text style={[styles.talkingPointText, { color: colors.textSecondary }]}>{point}</Text>
                                </View>
                              ))}
                            </View>
                          )}

                          {/* Action Buttons */}
                          <View style={styles.storyActionButtons}>
                            <TouchableOpacity
                              style={[styles.actionButton, { backgroundColor: ALPHA_COLORS.primary.bg }]}
                              onPress={() => startEditingStory(story)}
                              accessibilityRole="button"
                              accessibilityLabel="Edit story"
                              accessibilityHint="Enables editing of situation, task, action, and results"
                            >
                              <Edit3 color={COLORS.primary} size={16} />
                              <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionButton, { backgroundColor: ALPHA_COLORS.danger.bg }]}
                              onPress={() => deleteStory(storyId)}
                              disabled={isDeleting}
                              accessibilityRole="button"
                              accessibilityLabel={isDeleting ? "Deleting story" : "Delete story"}
                              accessibilityHint="Permanently removes this STAR story"
                            >
                              {isDeleting ? (
                                <ActivityIndicator size="small" color={COLORS.error} />
                              ) : (
                                <>
                                  <Trash2 color={COLORS.error} size={16} />
                                  <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Delete</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          </View>

                          {/* Analyze / Suggest / Variations Buttons */}
                          {typeof story.id === 'number' && (
                            <View style={[styles.storyActionButtons, { marginTop: 8 }]}>
                              <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: ALPHA_COLORS.primary.bg }]}
                                onPress={() => handleAnalyzeStory(story)}
                                disabled={analyzingId === story.id}
                              >
                                {analyzingId === story.id ? (
                                  <ActivityIndicator size="small" color={COLORS.primary} />
                                ) : (
                                  <>
                                    <BarChart3 color={COLORS.primary} size={16} />
                                    <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Analyze</Text>
                                  </>
                                )}
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: ALPHA_COLORS.primary.bg }]}
                                onPress={() => handleGetSuggestions(story)}
                                disabled={loadingSuggestionsId === story.id}
                              >
                                {loadingSuggestionsId === story.id ? (
                                  <ActivityIndicator size="small" color={COLORS.primary} />
                                ) : (
                                  <>
                                    <Lightbulb color={COLORS.primary} size={16} />
                                    <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Suggest</Text>
                                  </>
                                )}
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: ALPHA_COLORS.primary.bg }]}
                                onPress={() => handleGenerateVariations(story)}
                                disabled={generatingVariationsId === story.id}
                              >
                                {generatingVariationsId === story.id ? (
                                  <ActivityIndicator size="small" color={COLORS.primary} />
                                ) : (
                                  <>
                                    <Copy color={COLORS.primary} size={16} />
                                    <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Variations</Text>
                                  </>
                                )}
                              </TouchableOpacity>
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

      {/* Analysis Modal */}
      <Modal
        visible={showAnalysisModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAnalysisModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowAnalysisModal(false)}>
              <X color={colors.text} size={24} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>STAR Analysis</Text>
            <View style={{ width: 44 }} />
          </View>

          {analysisResult && (
            <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
              <View style={[styles.modalCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <View style={styles.modalCardHeader}>
                  <BarChart3 color={COLORS.primary} size={24} />
                  <Text style={[styles.modalCardTitle, { color: colors.text }]}>Overall Score</Text>
                </View>
                <Text style={[styles.scoreText, { color: COLORS.primary }]}>{analysisResult.overall_score}/100</Text>
              </View>

              {analysisResult.component_scores && (
                <View style={[styles.modalCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.modalCardTitle, { color: colors.text, marginBottom: 12 }]}>Component Scores</Text>
                  {Object.entries(analysisResult.component_scores).map(([key, value]: [string, any]) => (
                    <View key={key} style={styles.componentRow}>
                      <Text style={[styles.componentLabel, { color: colors.text }]}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                      <Text style={[styles.componentScore, { color: value.score >= 80 ? COLORS.success : value.score >= 60 ? COLORS.warning : COLORS.error }]}>
                        {value.score}
                      </Text>
                      <Text style={[styles.componentFeedback, { color: colors.textSecondary }]} numberOfLines={2}>
                        {value.feedback}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {analysisResult.strengths?.length > 0 && (
                <View style={[styles.modalCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.modalCardTitle, { color: COLORS.success }]}>Strengths</Text>
                  {analysisResult.strengths.map((s: string, i: number) => (
                    <Text key={i} style={[styles.bulletItem, { color: colors.text }]}>• {s}</Text>
                  ))}
                </View>
              )}

              {analysisResult.areas_for_improvement?.length > 0 && (
                <View style={[styles.modalCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.modalCardTitle, { color: COLORS.warning }]}>Areas for Improvement</Text>
                  {analysisResult.areas_for_improvement.map((a: string, i: number) => (
                    <Text key={i} style={[styles.bulletItem, { color: colors.text }]}>• {a}</Text>
                  ))}
                </View>
              )}

              {analysisResult.impact_assessment && (
                <View style={[styles.modalCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.modalCardTitle, { color: colors.text }]}>Impact Assessment</Text>
                  <View style={styles.impactRow}>
                    <Text style={[styles.impactLabel, { color: colors.textSecondary }]}>Quantifiable Results:</Text>
                    <Text style={{ color: analysisResult.impact_assessment.quantifiable_results ? COLORS.success : COLORS.error, fontFamily: FONTS.semibold }}>
                      {analysisResult.impact_assessment.quantifiable_results ? 'Yes' : 'No'}
                    </Text>
                  </View>
                  <View style={styles.impactRow}>
                    <Text style={[styles.impactLabel, { color: colors.textSecondary }]}>Leadership:</Text>
                    <Text style={{ color: analysisResult.impact_assessment.leadership_demonstrated ? COLORS.success : COLORS.error, fontFamily: FONTS.semibold }}>
                      {analysisResult.impact_assessment.leadership_demonstrated ? 'Yes' : 'No'}
                    </Text>
                  </View>
                  <View style={styles.impactRow}>
                    <Text style={[styles.impactLabel, { color: colors.textSecondary }]}>Problem Solving:</Text>
                    <Text style={{ color: analysisResult.impact_assessment.problem_solving_shown ? COLORS.success : COLORS.error, fontFamily: FONTS.semibold }}>
                      {analysisResult.impact_assessment.problem_solving_shown ? 'Yes' : 'No'}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Suggestions Modal */}
      <Modal
        visible={showSuggestionsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSuggestionsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowSuggestionsModal(false)}>
              <X color={colors.text} size={24} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Improvement Suggestions</Text>
            <View style={{ width: 44 }} />
          </View>

          {suggestionsResult && (
            <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
              {suggestionsResult.improvement_tips?.length > 0 && (
                <View style={[styles.modalCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.modalCardTitle, { color: colors.text }]}>Component Improvements</Text>
                  {suggestionsResult.improvement_tips.map((tip: any, i: number) => (
                    <View key={i} style={[styles.suggestionCard, { backgroundColor: colors.backgroundTertiary }]}>
                      <Text style={[styles.suggestionComponent, { color: COLORS.primary }]}>{tip.component.toUpperCase()}</Text>
                      <Text style={[styles.suggestionText, { color: colors.text }]}>{tip.suggestion}</Text>
                      <Text style={[styles.suggestionReason, { color: colors.textSecondary }]}>{tip.reasoning}</Text>
                    </View>
                  ))}
                </View>
              )}

              {suggestionsResult.alternative_framings?.length > 0 && (
                <View style={[styles.modalCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.modalCardTitle, { color: colors.text }]}>Alternative Framings</Text>
                  {suggestionsResult.alternative_framings.map((framing: any, i: number) => (
                    <View key={i} style={[styles.suggestionCard, { backgroundColor: colors.backgroundTertiary }]}>
                      <Text style={[styles.suggestionComponent, { color: COLORS.primary }]}>{framing.perspective}</Text>
                      <Text style={[styles.framingLabel, { color: colors.textSecondary }]}>Situation:</Text>
                      <Text style={[styles.suggestionText, { color: colors.text }]}>{framing.reframed_story.situation}</Text>
                      <Text style={[styles.framingLabel, { color: colors.textSecondary }]}>Result:</Text>
                      <Text style={[styles.suggestionText, { color: colors.text }]}>{framing.reframed_story.result}</Text>
                    </View>
                  ))}
                </View>
              )}

              {suggestionsResult.impact_enhancements?.length > 0 && (
                <View style={[styles.modalCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.modalCardTitle, { color: colors.text }]}>Impact Enhancements</Text>
                  {suggestionsResult.impact_enhancements.map((e: any, i: number) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                      <TrendingUp color={COLORS.success} size={16} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.suggestionComponent, { color: COLORS.success }]}>{e.type.toUpperCase()}</Text>
                        <Text style={[styles.suggestionText, { color: colors.text }]}>{e.enhancement}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {suggestionsResult.keyword_recommendations?.length > 0 && (
                <View style={[styles.modalCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.modalCardTitle, { color: colors.text }]}>Recommended Keywords</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {suggestionsResult.keyword_recommendations.map((kw: string, i: number) => (
                      <View key={i} style={[styles.keywordChip, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                        <Text style={{ color: COLORS.primary, fontSize: 12, fontFamily: FONTS.medium }}>{kw}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Variations Modal */}
      <Modal
        visible={showVariationsModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowVariationsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowVariationsModal(false)}>
              <X color={colors.text} size={24} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Story Variations</Text>
            <View style={{ width: 44 }} />
          </View>

          {variationsResult && (
            <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
              {variationsResult.variations?.map((variation: any, index: number) => (
                <View key={index} style={[styles.modalCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    <View style={[styles.keywordChip, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                      <Text style={{ color: COLORS.primary, fontSize: 12, fontFamily: FONTS.semibold }}>
                        {(variation.name || '').replace(/_/g, ' ').toUpperCase()}
                      </Text>
                    </View>
                    <View style={[styles.keywordChip, { backgroundColor: colors.backgroundTertiary }]}>
                      <Text style={{ color: colors.text, fontSize: 12, fontFamily: FONTS.medium }}>{variation.emphasis}</Text>
                    </View>
                  </View>

                  <Text style={[styles.framingLabel, { color: colors.textSecondary }]}>Situation</Text>
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{variation.story.situation}</Text>
                  <Text style={[styles.framingLabel, { color: colors.textSecondary, marginTop: 8 }]}>Task</Text>
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{variation.story.task}</Text>
                  <Text style={[styles.framingLabel, { color: colors.textSecondary, marginTop: 8 }]}>Action</Text>
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{variation.story.action}</Text>
                  <Text style={[styles.framingLabel, { color: colors.textSecondary, marginTop: 8 }]}>Result</Text>
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{variation.story.result}</Text>

                  {variation.key_phrases?.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={[styles.framingLabel, { color: colors.textSecondary }]}>Key Phrases</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                        {variation.key_phrases.map((phrase: string, pi: number) => (
                          <View key={pi} style={[styles.keywordChip, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                            <Text style={{ color: COLORS.primary, fontSize: 12, fontFamily: FONTS.medium }}>{phrase}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {variation.when_to_use && (
                    <View style={[styles.useCaseBox, { backgroundColor: colors.backgroundTertiary, marginTop: 10 }]}>
                      <Text style={[styles.framingLabel, { color: colors.textSecondary }]}>Best For:</Text>
                      <Text style={[styles.suggestionText, { color: colors.text }]}>{variation.when_to_use}</Text>
                    </View>
                  )}
                </View>
              ))}

              {variationsResult.usage_guide && (
                <View style={[styles.modalCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.modalCardTitle, { color: colors.text }]}>Usage Guide</Text>
                  {Object.entries(variationsResult.usage_guide).map(([key, value]: [string, any]) => (
                    <View key={key} style={{ marginTop: 8 }}>
                      <Text style={[styles.suggestionComponent, { color: COLORS.primary }]}>
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </Text>
                      <Text style={[styles.suggestionText, { color: colors.text }]}>{value}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.headline,
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
  introCard: {
    marginBottom: SPACING.lg,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  introTitle: {
    fontSize: 20,
    fontFamily: FONTS.semibold,
  },
  introText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  contextBadge: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignSelf: 'flex-start',
  },
  contextBadgeText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  stepSection: {
    marginBottom: SPACING.lg,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  stepTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
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
  emptySection: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.subhead,
    textAlign: 'center',
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
  experienceCardSelected: {
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
    marginBottom: 2,
  },
  experienceCompany: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.xs,
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
    marginTop: 4,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
  },
  dropdownSubtext: {
    ...TYPOGRAPHY.caption1,
    marginTop: 2,
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
  storiesSectionTitle: {
    ...TYPOGRAPHY.headline,
    marginBottom: SPACING.md,
  },
  storyCard: {
    marginBottom: SPACING.md,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storyTitle: {
    flex: 1,
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
  },
  storyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  storyContent: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  starSection: {
    marginBottom: SPACING.md,
  },
  starSectionHeader: {
    borderLeftWidth: 3,
    paddingLeft: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  starSectionLabel: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    textTransform: 'uppercase',
  },
  starSectionText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 22,
    paddingLeft: SPACING.md,
  },
  themesSection: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  themesSectionTitle: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  themeChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  themeChipText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  talkingPointsSection: {
    marginBottom: SPACING.md,
  },
  talkingPointsTitle: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  talkingPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  talkingPointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  talkingPointText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  storyActionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  editMode: {
    gap: SPACING.md,
  },
  editSection: {
    marginBottom: SPACING.sm,
  },
  editLabel: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.xs,
  },
  editInput: {
    minHeight: 100,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
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
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  cancelButton: {
    // backgroundColor set dynamically for light/dark mode
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  saveButton: {
    backgroundColor: COLORS.success,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  // Guide Styles
  guideCard: {
    marginBottom: SPACING.lg,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guideHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  guideTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
  },
  guideSubtitle: {
    ...TYPOGRAPHY.caption1,
    marginTop: 2,
  },
  guideContent: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  guideSection: {
    paddingBottom: SPACING.md,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    // borderBottomColor set dynamically for light/dark mode
  },
  guideSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guideSectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  guideLetter: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideLetterText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  guideSectionTitleContainer: {
    flex: 1,
  },
  guideSectionTitle: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
  },
  guideSectionSubtitle: {
    ...TYPOGRAPHY.caption1,
    marginTop: 2,
  },
  guideSectionContent: {
    marginTop: SPACING.md,
    paddingLeft: 40,
  },
  guideKeyQuestions: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    // borderBottomColor set dynamically for light/dark mode
  },
  guideKeyQuestionsText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  guideHighlight: {
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  guideHighlightText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  guideQuestionGroup: {
    marginBottom: SPACING.md,
  },
  guideQuestionGroupTitle: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  guideQuestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  guideQuestionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  guideQuestionBullet: {
    fontSize: 14,
    marginRight: SPACING.sm,
    marginTop: -1,
  },
  guideQuestionText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 19,
  },
  challengeGroup: {
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  // Step subtitle
  stepSubtitle: {
    ...TYPOGRAPHY.caption1,
    marginTop: 2,
  },
  // Story prompts / STAR hints
  starHintCard: {
    marginTop: SPACING.md,
  },
  starHintTitle: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  starHintContent: {
    gap: SPACING.sm,
  },
  starHintItem: {
    marginBottom: SPACING.xs,
  },
  starHintLabel: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '600',
    marginBottom: 2,
  },
  starHintText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    paddingLeft: SPACING.sm,
  },
  // Story questions display
  storyQuestionsContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  storyChallengeContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  storyQuestionsTitle: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  storyQuestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  storyQuestionBullet: {
    fontSize: 12,
    marginRight: SPACING.xs,
    marginTop: 1,
  },
  storyQuestionText: {
    flex: 1,
    ...TYPOGRAPHY.caption1,
    lineHeight: 17,
  },
  // Modal styles for Analysis/Suggestions/Variations
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
  modalCloseButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    ...TYPOGRAPHY.headline,
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  modalCard: {
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  modalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  modalCardTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
  scoreText: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginVertical: 8,
  },
  componentRow: {
    marginBottom: 12,
  },
  componentLabel: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: 2,
  },
  componentScore: {
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  componentFeedback: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    marginTop: 2,
  },
  bulletItem: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    marginTop: 6,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  impactLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  suggestionCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: 10,
  },
  suggestionComponent: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  suggestionReason: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 17,
    marginTop: 4,
  },
  framingLabel: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    marginBottom: 2,
  },
  keywordChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  useCaseBox: {
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
});
