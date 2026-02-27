import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Target, Link, FileText, ChevronDown, Sparkles, Building2, ArrowLeft,
  Check, Download, RefreshCw, Bookmark, Briefcase, ChevronRight, BarChart3,
  Key, Share2, BookOpen, ClipboardCheck, Clock, X, History,
  Edit3, Save, Plus, Trash2, ChevronUp, Copy, CheckCircle2,
  ChevronsDown, ChevronsUp,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { MatchScore, KeywordPanel, ResumeAnalysis, ProgressStepper } from '../components';
import { GlassButton } from '../components/glass/GlassButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';
import { exportAndShare, ExportFormat } from '../utils/fileExport';
import { useResumeStore } from '../stores/resumeStore';
import { GlassCard } from '../components/glass/GlassCard';
import { ScreenContainer } from '../components/layout';
import { NumberText } from '../components/ui';
import { usePostHog } from '../contexts/PostHogContext';

const TAILOR_SESSION_KEY = 'tailor_session_data';

interface BaseResumeData {
  id: number;
  filename: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills?: string[];
  experience?: any[];
  education?: string;
  certifications?: string;
}

interface TailoredResumeData {
  id: number;
  summary: string;
  competencies: string[];
  experience: any[];
  education: string;
  certifications: string;
  alignment_statement: string;
  company: string;
  title: string;
  docx_path: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TailorResumeRouteProp = RouteProp<RootStackParamList, 'TailorResume'>;

export default function TailorResumeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TailorResumeRouteProp>();
  const { colors, isDark } = useTheme();
  const { capture } = usePostHog();
  const initialResumeId = route.params?.resumeId;

  // Zustand store for shared resume data
  const { resumes, loading, fetchResumes, setSelectedResumeId: setStoreSelectedResumeId } = useResumeStore();

  // Form state (screen-specific)
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(initialResumeId || null);
  const [jobUrl, setJobUrl] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [tailoring, setTailoring] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [showResumeSelector, setShowResumeSelector] = useState(false);

  // Comparison view state
  const [showComparison, setShowComparison] = useState(false);
  const [baseResumeData, setBaseResumeData] = useState<BaseResumeData | null>(null);
  const [tailoredResumeData, setTailoredResumeData] = useState<TailoredResumeData | null>(null);
  const [activeTab, setActiveTab] = useState<'original' | 'tailored' | 'keywords' | 'analysis'>('tailored');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Analysis state
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [keywordsData, setKeywordsData] = useState<any>(null);
  const [loadingKeywords, setLoadingKeywords] = useState(false);

  // Saved jobs state
  const [savedJobs, setSavedJobs] = useState<any[]>([]);

  // Edit mode state
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [editedSkills, setEditedSkills] = useState<string[] | null>(null);
  const [editedExperience, setEditedExperience] = useState<any[] | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Show changes toggle
  const [showChanges, setShowChanges] = useState(true);

  // Expand/collapse sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    skills: true,
    experience: true,
    education: true,
    certifications: true,
    alignment: true,
  });

  // Title options
  const [titleOptionsOpen, setTitleOptionsOpen] = useState<number | null>(null);
  const [customTitleEdit, setCustomTitleEdit] = useState<{ index: number; value: string } | null>(null);

  // Copy state
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Next step prompt
  const [showNextStepPrompt, setShowNextStepPrompt] = useState(false);

  // Analysis progress
  const [analysisProgress, setAnalysisProgress] = useState<string>('');

  // Set selected resume when resumes are loaded
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      const targetId = initialResumeId || resumes[0].id;
      setSelectedResumeId(targetId);
    }
  }, [resumes, selectedResumeId, initialResumeId]);

  const fetchSavedJobs = useCallback(async () => {
    try {
      const result = await api.getSavedJobs();
      if (result.success && result.data) {
        setSavedJobs(Array.isArray(result.data) ? result.data.slice(0, 5) : []);
      }
    } catch (e) {
      // silent - non-critical
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Only fetch if not showing comparison
      if (!showComparison) {
        fetchResumes();
        fetchSavedJobs();
        capture('screen_viewed', {
          screen_name: 'Tailor Resume',
          screen_type: 'core_feature',
          resume_count: resumes.length,
        });
      }
    }, [showComparison, fetchResumes, fetchSavedJobs, capture, resumes.length])
  );

  const handleExtractJob = async () => {
    if (!jobUrl.trim()) {
      Alert.alert('Error', 'Please enter a job URL');
      return;
    }

    setExtracting(true);
    try {
      const result = await api.extractJobDetails(jobUrl);
      if (result.success && result.data) {
        const extractedCompany = result.data.company || '';
        const extractedTitle = result.data.title || '';
        setCompany(extractedCompany);
        setJobTitle(extractedTitle);
        Alert.alert('Success', 'Job details extracted successfully!');
        // Auto-save the job
        if (extractedCompany || extractedTitle) {
          api.saveJob(jobUrl.trim(), extractedCompany, extractedTitle).then(() => fetchSavedJobs());
        }
      } else {
        Alert.alert('Error', result.error || 'Could not extract job details. Please enter them manually.');
      }
    } catch (error: any) {
      console.error('Error extracting job:', error);
      Alert.alert('Error', error.message || 'Failed to extract job details. Please try again.');
    } finally {
      setExtracting(false);
    }
  };

  const handleTailor = async () => {
    if (!selectedResumeId) {
      Alert.alert('Error', 'Please select a resume');
      return;
    }

    if (!jobUrl.trim() && !company.trim()) {
      Alert.alert('Error', 'Please enter a job URL or company name');
      return;
    }

    setTailoring(true);
    try {
      // First, fetch the base resume data for comparison
      const baseResult = await api.getResume(selectedResumeId);
      if (!baseResult.success || !baseResult.data) {
        throw new Error('Failed to fetch base resume data');
      }
      setBaseResumeData(baseResult.data);

      // Now tailor the resume
      const result = await api.tailorResume({
        baseResumeId: selectedResumeId,
        jobUrl: jobUrl.trim() || undefined,
        company: company.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
      });

      if (result.success && result.data) {
        // Store the tailored resume data
        setTailoredResumeData({
          id: result.data.tailored_resume_id,
          summary: result.data.summary,
          competencies: result.data.competencies || [],
          experience: result.data.experience || [],
          education: result.data.education || '',
          certifications: result.data.certifications || '',
          alignment_statement: result.data.alignment_statement || '',
          company: result.data.company || company,
          title: result.data.title || jobTitle,
          docx_path: result.data.docx_path || '',
        });

        // Track successful tailoring
        capture('resume_tailored', {
          screen_name: 'Tailor Resume',
          company: result.data.company || company,
          job_title: result.data.title || jobTitle,
          has_job_url: !!jobUrl.trim(),
          tailored_resume_id: result.data.tailored_resume_id,
        });

        // Auto-save the job URL if present
        if (jobUrl.trim()) {
          api.saveJob(
            jobUrl.trim(),
            result.data.company || company,
            result.data.title || jobTitle
          ).then(() => fetchSavedJobs());
        }

        // Show the comparison view
        setShowComparison(true);
        setActiveTab('tailored');
        setShowNextStepPrompt(true);
      } else {
        console.error('Tailoring failed:', result.error);
        Alert.alert('Error', result.error || 'Failed to tailor resume. Please try again.');
      }
    } catch (error: any) {
      console.error('Error tailoring:', error);
      Alert.alert('Error', error.message || 'Failed to tailor resume. Please check your connection.');
    } finally {
      setTailoring(false);
    }
  };

  const handleStartNew = () => {
    setShowComparison(false);
    setBaseResumeData(null);
    setTailoredResumeData(null);
    setAnalysisData(null);
    setKeywordsData(null);
    setJobUrl('');
    setCompany('');
    setJobTitle('');
    setActiveTab('tailored');
    setShowNextStepPrompt(false);
    setEditMode({});
    setEditedContent({});
    setEditedSkills(null);
    setEditedExperience(null);
    clearSession();
  };

  const loadAnalysis = async (forceRefresh: boolean = false) => {
    if (!tailoredResumeData || loadingAnalysis) return;

    setLoadingAnalysis(true);
    setAnalysisProgress(forceRefresh ? 'Refreshing AI analysis...' : 'Loading AI analysis...');
    try {
      const result = await api.analyzeAll(tailoredResumeData.id, forceRefresh);
      if (result.success && result.data) {
        setAnalysisData(result.data);
        if (result.data.keywords) setKeywordsData(result.data.keywords);
        setAnalysisProgress(
          result.data.cached
            ? `Analysis loaded from cache`
            : `Analysis complete`
        );
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      setAnalysisProgress('Error loading analysis');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Load analysis when switching to analysis tab
  useEffect(() => {
    if (activeTab === 'analysis' && !analysisData && tailoredResumeData) {
      loadAnalysis();
    }
  }, [activeTab, tailoredResumeData]);

  // Load keywords when switching to keywords tab (uses analyzeAll which includes keywords)
  const loadKeywords = async () => {
    if (!tailoredResumeData || loadingKeywords) return;

    setLoadingKeywords(true);
    try {
      // Use analyzeAll which returns keyword data as part of its response
      const result = await api.analyzeAll(tailoredResumeData.id);
      if (result.success && result.data) {
        // Extract keywords data from the analysis response
        setKeywordsData(result.data.keywords || result.data);
        // Also update analysisData if not already loaded
        if (!analysisData) {
          setAnalysisData(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading keywords:', error);
    } finally {
      setLoadingKeywords(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'keywords' && !keywordsData && tailoredResumeData) {
      loadKeywords();
    }
  }, [activeTab, tailoredResumeData]);

  // Export resume function
  const handleExport = async (format: ExportFormat) => {
    if (!tailoredResumeData) return;

    setExporting(true);
    setExportProgress(0);

    try {
      const success = await exportAndShare({
        tailoredResumeId: tailoredResumeData.id,
        format,
        filename: `${tailoredResumeData.company}_${tailoredResumeData.title}_Resume`,
        onProgress: setExportProgress,
      });

      if (success) {
        // Share sheet handled by exportAndShare
      }
    } catch (error: any) {
      Alert.alert('Export Failed', error.message || 'Unable to export resume');
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  const showExportOptions = () => {
    Alert.alert(
      'Export Resume',
      'Choose a format to export your tailored resume',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'PDF', onPress: () => handleExport('pdf') },
        { text: 'Word (DOCX)', onPress: () => handleExport('docx') },
      ]
    );
  };

  const handleSaveComparison = async () => {
    if (!tailoredResumeData) return;

    setSaving(true);
    try {
      const result = await api.saveComparison({
        tailoredResumeId: tailoredResumeData.id,
        title: `${tailoredResumeData.company} - ${tailoredResumeData.title}`,
      });

      if (result.success) {
        Alert.alert('Saved', 'Comparison saved successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to save comparison');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save comparison');
    } finally {
      setSaving(false);
    }
  };

  const handleViewInterviewPrep = () => {
    if (tailoredResumeData) {
      navigation.navigate('InterviewPrep' as any, { tailoredResumeId: tailoredResumeData.id });
    }
  };

  const handleSelectSavedJob = (job: any) => {
    setJobUrl(job.job_url || job.jobUrl || '');
    setCompany(job.company || '');
    setJobTitle(job.job_title || job.jobTitle || '');
  };

  const handleDeleteSavedJob = async (jobId: number) => {
    try {
      await api.deleteSavedJob(jobId);
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (e) {
      // silent
    }
  };

  // ── Session Persistence ──
  const saveSession = useCallback(async () => {
    if (!tailoredResumeData || !baseResumeData) return;
    try {
      const sessionData = {
        baseResumeData,
        tailoredResumeData,
        jobUrl,
        company,
        jobTitle,
        analysisData,
        keywordsData,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(TAILOR_SESSION_KEY, JSON.stringify(sessionData));
    } catch {}
  }, [tailoredResumeData, baseResumeData, jobUrl, company, jobTitle, analysisData, keywordsData]);

  // Auto-save session when data changes
  useEffect(() => {
    if (tailoredResumeData && baseResumeData) {
      saveSession();
    }
  }, [tailoredResumeData, baseResumeData, analysisData, keywordsData, saveSession]);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const raw = await AsyncStorage.getItem(TAILOR_SESSION_KEY);
        if (!raw) return;
        const session = JSON.parse(raw);
        if (session.tailoredResumeData && session.baseResumeData) {
          setBaseResumeData(session.baseResumeData);
          setTailoredResumeData(session.tailoredResumeData);
          setJobUrl(session.jobUrl || '');
          setCompany(session.company || '');
          setJobTitle(session.jobTitle || '');
          if (session.analysisData) setAnalysisData(session.analysisData);
          if (session.keywordsData) setKeywordsData(session.keywordsData);
          setShowComparison(true);
        }
      } catch {}
    };
    if (!showComparison && !tailoredResumeData) {
      restoreSession();
    }
  }, []);

  const clearSession = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(TAILOR_SESSION_KEY);
    } catch {}
  }, []);

  // ── Edit Mode Functions ──
  const toggleEditMode = (section: string) => {
    if (editMode[section]) {
      // Exiting edit mode without saving
      setEditedContent((prev) => {
        const next = { ...prev };
        delete next[section];
        return next;
      });
      if (section === 'skills') setEditedSkills(null);
      if (section === 'experience') setEditedExperience(null);
    } else {
      // Entering edit mode - initialize copies
      if (section === 'skills' && tailoredResumeData) {
        setEditedSkills([...tailoredResumeData.competencies]);
      }
      if (section === 'experience' && tailoredResumeData) {
        setEditedExperience(JSON.parse(JSON.stringify(tailoredResumeData.experience)));
      }
      if (section === 'summary' && tailoredResumeData) {
        setEditedContent((prev) => ({ ...prev, summary: tailoredResumeData.summary }));
      }
      if (section === 'alignment' && tailoredResumeData) {
        setEditedContent((prev) => ({ ...prev, alignment: tailoredResumeData.alignment_statement }));
      }
    }
    setEditMode((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const saveEdit = async (section: string) => {
    if (!tailoredResumeData) return;
    setSavingSection(section);

    const updatePayload: any = {};
    if (section === 'summary' && editedContent.summary !== undefined) {
      updatePayload.summary = editedContent.summary;
    } else if (section === 'skills' && editedSkills) {
      updatePayload.competencies = editedSkills;
    } else if (section === 'experience' && editedExperience) {
      updatePayload.experience = editedExperience;
    } else if (section === 'alignment' && editedContent.alignment !== undefined) {
      updatePayload.alignment_statement = editedContent.alignment;
    }

    if (Object.keys(updatePayload).length === 0) {
      setSavingSection(null);
      setEditMode((prev) => ({ ...prev, [section]: false }));
      return;
    }

    try {
      const result = await api.updateTailoredResume(tailoredResumeData.id, updatePayload);
      if (result.data?.success !== false) {
        // Update local state
        setTailoredResumeData((prev: any) => {
          if (!prev) return prev;
          const updated = { ...prev };
          if (updatePayload.summary !== undefined) updated.summary = updatePayload.summary;
          if (updatePayload.competencies) updated.competencies = updatePayload.competencies;
          if (updatePayload.experience) updated.experience = updatePayload.experience;
          if (updatePayload.alignment_statement !== undefined) updated.alignment_statement = updatePayload.alignment_statement;
          return updated;
        });
        setEditMode((prev) => ({ ...prev, [section]: false }));
        setEditedSkills(null);
        setEditedExperience(null);
      } else {
        Alert.alert('Error', 'Failed to save changes');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save changes');
    } finally {
      setSavingSection(null);
    }
  };

  // Skills helpers
  const deleteSkill = (index: number) => {
    setEditedSkills((prev) => prev ? prev.filter((_, i) => i !== index) : prev);
  };

  const addSkill = () => {
    if (newSkill.trim() && editedSkills) {
      setEditedSkills([...editedSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  // Experience helpers
  const updateExperience = (index: number, field: string, value: string) => {
    setEditedExperience((prev) => {
      if (!prev) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateExperienceBullet = (expIndex: number, bulletIndex: number, value: string) => {
    setEditedExperience((prev) => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev));
      updated[expIndex].bullets[bulletIndex] = value;
      return updated;
    });
  };

  const deleteExperienceBullet = (expIndex: number, bulletIndex: number) => {
    setEditedExperience((prev) => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev));
      updated[expIndex].bullets.splice(bulletIndex, 1);
      return updated;
    });
  };

  const addExperienceBullet = (expIndex: number) => {
    setEditedExperience((prev) => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev));
      if (!updated[expIndex].bullets) updated[expIndex].bullets = [];
      updated[expIndex].bullets.push('');
      return updated;
    });
  };

  // Title options
  const selectTitleOption = async (expIndex: number, selectedTitle: string) => {
    if (!tailoredResumeData) return;
    const updatedExperience = JSON.parse(JSON.stringify(tailoredResumeData.experience));
    const exp = updatedExperience[expIndex];
    const currentHeader = exp.header || '';
    const dashIndex = currentHeader.indexOf(' – ');
    const suffix = dashIndex !== -1 ? currentHeader.substring(dashIndex) : '';
    exp.header = selectedTitle + suffix;

    setTailoredResumeData((prev: any) => prev ? { ...prev, experience: updatedExperience } : prev);
    setTitleOptionsOpen(null);
    setCustomTitleEdit(null);

    try {
      await api.updateTailoredResume(tailoredResumeData.id, { experience: updatedExperience });
    } catch {}
  };

  const saveCustomTitle = (expIndex: number) => {
    if (customTitleEdit && customTitleEdit.value.trim()) {
      selectTitleOption(expIndex, customTitleEdit.value.trim());
    }
  };

  // Copy to clipboard
  const handleCopy = async (content: string, section: string) => {
    try {
      await Clipboard.setStringAsync(content);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  // Section expand/collapse
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleExpandAll = () => {
    const allExpanded = Object.values(expandedSections).every((v) => v);
    const newState = Object.keys(expandedSections).reduce<Record<string, boolean>>(
      (acc, key) => ({ ...acc, [key]: !allExpanded }),
      {}
    );
    setExpandedSections(newState);
  };

  // Show changes check
  const hasChanged = (original: string | undefined, tailored: string | undefined): boolean => {
    return (original || '') !== (tailored || '');
  };

  const selectedResume = resumes?.find((r) => r.id === selectedResumeId);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Comparison View
  if (showComparison && baseResumeData && tailoredResumeData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.comparisonHeader}>
          <TouchableOpacity
            style={styles.comparisonBackButton}
            onPress={handleStartNew}
          >
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <View style={styles.comparisonHeaderContent}>
            <Text style={[styles.comparisonTitle, { color: colors.text }]}>Resume Comparison</Text>
            <Text style={[styles.comparisonSubtitle, { color: colors.textSecondary }]}>
              Tailored for {tailoredResumeData.company}
            </Text>
          </View>
        </View>

        {/* Next Step Prompt */}
        {showNextStepPrompt && (
          <View style={[styles.nextStepPrompt, { backgroundColor: ALPHA_COLORS.primary.bg, borderColor: ALPHA_COLORS.primary.border }]}>
            <View style={styles.nextStepContent}>
              <Check color={COLORS.success} size={20} />
              <Text style={[styles.nextStepText, { color: colors.text }]}>Resume tailored! What's next?</Text>
              <TouchableOpacity onPress={() => setShowNextStepPrompt(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X color={colors.textTertiary} size={16} />
              </TouchableOpacity>
            </View>
            <View style={styles.nextStepActions}>
              <TouchableOpacity
                style={[styles.nextStepButton, { backgroundColor: COLORS.primary }]}
                onPress={() => {
                  setShowNextStepPrompt(false);
                  navigation.navigate('CoverLetters' as any);
                }}
              >
                <BookOpen color="#fff" size={16} />
                <Text style={styles.nextStepButtonText}>Cover Letter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nextStepButton, { backgroundColor: COLORS.purple }]}
                onPress={() => {
                  setShowNextStepPrompt(false);
                  handleViewInterviewPrep();
                }}
              >
                <Briefcase color="#fff" size={16} />
                <Text style={styles.nextStepButtonText}>Interview Prep</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nextStepButtonOutline, { borderColor: colors.border }]}
                onPress={() => {
                  setShowNextStepPrompt(false);
                  showExportOptions();
                }}
              >
                <Download color={colors.textSecondary} size={16} />
                <Text style={[styles.nextStepButtonOutlineText, { color: colors.textSecondary }]}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Toolbar: Show Changes + Expand/Collapse */}
        {activeTab === 'tailored' && (
          <View style={styles.comparisonToolbar}>
            <TouchableOpacity
              style={[styles.toolbarButton, showChanges && { backgroundColor: ALPHA_COLORS.success.bg }]}
              onPress={() => setShowChanges(!showChanges)}
            >
              <Sparkles color={showChanges ? COLORS.success : colors.textSecondary} size={14} />
              <Text style={[styles.toolbarButtonText, { color: showChanges ? COLORS.success : colors.textSecondary }]}>
                {showChanges ? 'Changes On' : 'Changes Off'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={toggleExpandAll}
            >
              {Object.values(expandedSections).every((v) => v) ? (
                <ChevronsUp color={colors.textSecondary} size={14} />
              ) : (
                <ChevronsDown color={colors.textSecondary} size={14} />
              )}
              <Text style={[styles.toolbarButtonText, { color: colors.textSecondary }]}>
                {Object.values(expandedSections).every((v) => v) ? 'Collapse' : 'Expand'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => tailoredResumeData && loadAnalysis(true)}
              disabled={loadingAnalysis}
            >
              <RefreshCw
                color={loadingAnalysis ? COLORS.primary : colors.textSecondary}
                size={14}
                style={loadingAnalysis ? { opacity: 0.5 } : undefined}
              />
              <Text style={[styles.toolbarButtonText, { color: loadingAnalysis ? COLORS.primary : colors.textSecondary }]}>
                {loadingAnalysis ? 'Refreshing' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tab Switcher */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.tabScrollContainer, { backgroundColor: colors.backgroundSecondary }]}
          contentContainerStyle={styles.tabScrollContent}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === 'original' && [styles.tabActive, { backgroundColor: colors.glass }]]}
            onPress={() => setActiveTab('original')}
          >
            <FileText
              color={activeTab === 'original' ? COLORS.primary : colors.textSecondary}
              size={14}
            />
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'original' && [styles.tabTextActive, { color: colors.text }]]}>
              Original
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tailored' && [styles.tabActive, { backgroundColor: colors.glass }]]}
            onPress={() => setActiveTab('tailored')}
          >
            <Sparkles
              color={activeTab === 'tailored' ? COLORS.success : colors.textSecondary}
              size={14}
            />
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'tailored' && [styles.tabTextActive, { color: colors.text }]]}>
              Tailored
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'keywords' && [styles.tabActive, { backgroundColor: colors.glass }]]}
            onPress={() => setActiveTab('keywords')}
          >
            <Key
              color={activeTab === 'keywords' ? COLORS.warning : colors.textSecondary}
              size={14}
            />
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'keywords' && [styles.tabTextActive, { color: colors.text }]]}>
              Keywords
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analysis' && [styles.tabActive, { backgroundColor: colors.glass }]]}
            onPress={() => setActiveTab('analysis')}
          >
            <BarChart3
              color={activeTab === 'analysis' ? COLORS.info : colors.textSecondary}
              size={14}
            />
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'analysis' && [styles.tabTextActive, { color: colors.text }]]}>
              Analysis
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Content */}
        <ScrollView style={styles.comparisonContent} contentContainerStyle={styles.comparisonContentContainer}>
          {activeTab === 'original' ? (
            // Original Resume Content
            <View>
              {/* Summary */}
              <View style={[styles.comparisonSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>Professional Summary</Text>
                <View style={styles.sectionContent}>
                  <Text style={[styles.sectionText, { color: colors.text }]}>
                    {baseResumeData.summary || 'No summary available'}
                  </Text>
                </View>
              </View>

              {/* Skills */}
              <View style={[styles.comparisonSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>Skills</Text>
                <View style={styles.skillsContainer}>
                  {(baseResumeData.skills || []).map((skill, index) => (
                    <View key={index} style={styles.skillPill}>
                      <Text style={[styles.skillText, { color: colors.text }]}>{skill}</Text>
                    </View>
                  ))}
                  {(!baseResumeData.skills || baseResumeData.skills.length === 0) && (
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No skills listed</Text>
                  )}
                </View>
              </View>

              {/* Experience */}
              <View style={[styles.comparisonSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>Experience</Text>
                {(baseResumeData.experience || []).map((exp, index) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={[styles.experienceHeader, { color: colors.text }]}>{exp.header || exp.title}</Text>
                    {(exp.bullets || []).map((bullet: string, bIndex: number) => (
                      <Text key={bIndex} style={[styles.bulletPoint, { color: colors.textSecondary }]}>• {bullet}</Text>
                    ))}
                  </View>
                ))}
                {(!baseResumeData.experience || baseResumeData.experience.length === 0) && (
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No experience listed</Text>
                )}
              </View>

              {/* Education */}
              <View style={[styles.comparisonSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>Education</Text>
                <View style={styles.sectionContent}>
                  <Text style={[styles.sectionText, { color: colors.text }]}>
                    {baseResumeData.education || 'No education listed'}
                  </Text>
                </View>
              </View>

              {/* Certifications */}
              <View style={[styles.comparisonSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>Certifications</Text>
                <View style={styles.sectionContent}>
                  <Text style={[styles.sectionText, { color: colors.text }]}>
                    {baseResumeData.certifications || 'No certifications listed'}
                  </Text>
                </View>
              </View>
            </View>
          ) : activeTab === 'tailored' ? (
            // Tailored Resume Content with Edit Mode + Show Changes
            <View>
              {/* Professional Summary */}
              <View style={[
                styles.comparisonSection,
                showChanges && hasChanged(baseResumeData.summary, tailoredResumeData.summary) && styles.changedSection,
                { backgroundColor: colors.glass, borderColor: colors.glassBorder },
              ]}>
                <TouchableOpacity style={styles.sectionHeaderRow} onPress={() => toggleSection('summary')}>
                  <View style={styles.sectionHeaderLeft}>
                    {expandedSections.summary ? <ChevronDown color={colors.textTertiary} size={16} /> : <ChevronRight color={colors.textTertiary} size={16} />}
                    <Text style={[styles.sectionHeader, { color: colors.text, padding: 0 }]}>Professional Summary</Text>
                  </View>
                  <View style={styles.sectionHeaderActions}>
                    {showChanges && hasChanged(baseResumeData.summary, tailoredResumeData.summary) && (
                      <View style={styles.changedBadge}><Text style={styles.changedBadgeText}>Enhanced</Text></View>
                    )}
                    <TouchableOpacity
                      onPress={() => handleCopy(tailoredResumeData.summary, 'summary')}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {copiedSection === 'summary' ? <Check color={COLORS.success} size={16} /> : <Copy color={colors.textTertiary} size={16} />}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => editMode.summary ? saveEdit('summary') : toggleEditMode('summary')}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {savingSection === 'summary' ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                      ) : editMode.summary ? (
                        <Save color={COLORS.primary} size={16} />
                      ) : (
                        <Edit3 color={colors.textTertiary} size={16} />
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
                {expandedSections.summary && (
                  <View style={styles.sectionContent}>
                    {editMode.summary ? (
                      <View>
                        <TextInput
                          style={[styles.editTextArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                          value={editedContent.summary ?? tailoredResumeData.summary}
                          onChangeText={(text) => setEditedContent((prev) => ({ ...prev, summary: text }))}
                          multiline
                          textAlignVertical="top"
                        />
                        <View style={styles.editActions}>
                          <TouchableOpacity style={styles.editCancelButton} onPress={() => toggleEditMode('summary')}>
                            <Text style={[styles.editCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text style={[styles.sectionText, { color: colors.text }]}>
                        {tailoredResumeData.summary}
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Core Competencies */}
              <View style={[
                styles.comparisonSection,
                showChanges && styles.changedSection,
                { backgroundColor: colors.glass, borderColor: colors.glassBorder },
              ]}>
                <TouchableOpacity style={styles.sectionHeaderRow} onPress={() => toggleSection('skills')}>
                  <View style={styles.sectionHeaderLeft}>
                    {expandedSections.skills ? <ChevronDown color={colors.textTertiary} size={16} /> : <ChevronRight color={colors.textTertiary} size={16} />}
                    <Text style={[styles.sectionHeader, { color: colors.text, padding: 0 }]}>Core Competencies</Text>
                  </View>
                  <View style={styles.sectionHeaderActions}>
                    {showChanges && <View style={styles.changedBadge}><Text style={styles.changedBadgeText}>Tailored</Text></View>}
                    <TouchableOpacity
                      onPress={() => editMode.skills ? saveEdit('skills') : toggleEditMode('skills')}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {savingSection === 'skills' ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                      ) : editMode.skills ? (
                        <Save color={COLORS.primary} size={16} />
                      ) : (
                        <Edit3 color={colors.textTertiary} size={16} />
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
                {expandedSections.skills && (
                  <View style={styles.skillsContainer}>
                    {editMode.skills ? (
                      <View style={{ width: '100%', gap: SPACING.sm }}>
                        <View style={styles.editSkillsWrap}>
                          {(editedSkills || tailoredResumeData.competencies).map((skill, index) => (
                            <View key={index} style={[styles.skillPill, styles.tailoredSkillPill, styles.editSkillPill]}>
                              <Text style={[styles.skillText, { color: colors.text }]}>{skill}</Text>
                              <TouchableOpacity onPress={() => deleteSkill(index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <X color={COLORS.danger} size={12} />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                        <View style={styles.addSkillRow}>
                          <TextInput
                            style={[styles.addSkillInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                            value={newSkill}
                            onChangeText={setNewSkill}
                            placeholder="Add a skill..."
                            placeholderTextColor={colors.textTertiary}
                            onSubmitEditing={addSkill}
                            returnKeyType="done"
                          />
                          <TouchableOpacity style={styles.addSkillButton} onPress={addSkill}>
                            <Plus color="#fff" size={16} />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.editCancelButton} onPress={() => toggleEditMode('skills')}>
                          <Text style={[styles.editCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      tailoredResumeData.competencies.map((skill, index) => (
                        <View key={index} style={[styles.skillPill, styles.tailoredSkillPill]}>
                          <Text style={[styles.skillText, { color: colors.text }]}>{skill}</Text>
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>

              {/* Experience */}
              <View style={[
                styles.comparisonSection,
                showChanges && styles.changedSection,
                { backgroundColor: colors.glass, borderColor: colors.glassBorder },
              ]}>
                <TouchableOpacity style={styles.sectionHeaderRow} onPress={() => toggleSection('experience')}>
                  <View style={styles.sectionHeaderLeft}>
                    {expandedSections.experience ? <ChevronDown color={colors.textTertiary} size={16} /> : <ChevronRight color={colors.textTertiary} size={16} />}
                    <Text style={[styles.sectionHeader, { color: colors.text, padding: 0 }]}>Experience</Text>
                  </View>
                  <View style={styles.sectionHeaderActions}>
                    {showChanges && <View style={styles.changedBadge}><Text style={styles.changedBadgeText}>Reframed</Text></View>}
                    <TouchableOpacity
                      onPress={() => editMode.experience ? saveEdit('experience') : toggleEditMode('experience')}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {savingSection === 'experience' ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                      ) : editMode.experience ? (
                        <Save color={COLORS.primary} size={16} />
                      ) : (
                        <Edit3 color={colors.textTertiary} size={16} />
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
                {expandedSections.experience && (
                  editMode.experience ? (
                    // Edit mode for experience
                    <View style={{ padding: SPACING.md, gap: SPACING.lg }}>
                      {(editedExperience || tailoredResumeData.experience).map((exp, index) => (
                        <View key={index} style={[styles.editExperienceItem, { borderColor: colors.border }]}>
                          <TextInput
                            style={[styles.editExperienceTitle, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                            value={exp.header}
                            onChangeText={(text) => updateExperience(index, 'header', text)}
                            placeholder="Job title - Company"
                            placeholderTextColor={colors.textTertiary}
                          />
                          {exp.location !== undefined && (
                            <TextInput
                              style={[styles.editExperienceField, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                              value={exp.location || ''}
                              onChangeText={(text) => updateExperience(index, 'location', text)}
                              placeholder="Location"
                              placeholderTextColor={colors.textTertiary}
                            />
                          )}
                          {exp.dates !== undefined && (
                            <TextInput
                              style={[styles.editExperienceField, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                              value={exp.dates || ''}
                              onChangeText={(text) => updateExperience(index, 'dates', text)}
                              placeholder="Dates"
                              placeholderTextColor={colors.textTertiary}
                            />
                          )}
                          <Text style={[styles.editBulletsLabel, { color: colors.textSecondary }]}>Bullet Points</Text>
                          {(exp.bullets || []).map((bullet: string, bIndex: number) => (
                            <View key={bIndex} style={styles.editBulletRow}>
                              <TextInput
                                style={[styles.editBulletInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                value={bullet}
                                onChangeText={(text) => updateExperienceBullet(index, bIndex, text)}
                                multiline
                                textAlignVertical="top"
                              />
                              <TouchableOpacity onPress={() => deleteExperienceBullet(index, bIndex)}>
                                <Trash2 color={COLORS.danger} size={16} />
                              </TouchableOpacity>
                            </View>
                          ))}
                          <TouchableOpacity style={styles.addBulletButton} onPress={() => addExperienceBullet(index)}>
                            <Plus color={COLORS.primary} size={14} />
                            <Text style={styles.addBulletText}>Add Bullet</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      <TouchableOpacity style={styles.editCancelButton} onPress={() => toggleEditMode('experience')}>
                        <Text style={[styles.editCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    // View mode for experience with title options
                    tailoredResumeData.experience.map((exp, index) => (
                      <View key={index} style={styles.experienceItem}>
                        <View style={styles.experienceHeaderRow}>
                          <Text style={[styles.experienceHeader, { color: colors.text, flex: 1 }]}>{exp.header}</Text>
                          {exp.title_options && exp.title_options.length > 1 && (
                            <TouchableOpacity
                              style={[styles.titleOptionsButton, titleOptionsOpen === index && { backgroundColor: ALPHA_COLORS.primary.bg }]}
                              onPress={() => {
                                setTitleOptionsOpen(titleOptionsOpen === index ? null : index);
                                setCustomTitleEdit(null);
                              }}
                            >
                              <Sparkles color={COLORS.primary} size={10} />
                              <Text style={styles.titleOptionsButtonText}>
                                {titleOptionsOpen === index ? 'Close' : `${exp.title_options.length} Options`}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Title Options Dropdown */}
                        {titleOptionsOpen === index && exp.title_options && (
                          <View style={[styles.titleOptionsDropdown, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                            <Text style={[styles.titleOptionsLabel, { color: colors.textTertiary }]}>Select a title or write your own</Text>
                            {exp.title_options.map((option: string, optIdx: number) => {
                              const currentHeader = exp.header || '';
                              const dashIdx = currentHeader.indexOf(' – ');
                              const currentTitle = dashIdx !== -1 ? currentHeader.substring(0, dashIdx) : currentHeader;
                              const isSelected = option.trim() === currentTitle.trim();
                              return (
                                <TouchableOpacity
                                  key={optIdx}
                                  style={[styles.titleOption, isSelected && { backgroundColor: ALPHA_COLORS.primary.bg }]}
                                  onPress={() => selectTitleOption(index, option)}
                                >
                                  {isSelected ? (
                                    <CheckCircle2 color={COLORS.primary} size={14} />
                                  ) : (
                                    <View style={[styles.titleOptionCircle, { borderColor: colors.textTertiary }]} />
                                  )}
                                  <Text style={[styles.titleOptionText, { color: isSelected ? COLORS.primary : colors.text }]}>{option}</Text>
                                </TouchableOpacity>
                              );
                            })}
                            {customTitleEdit?.index === index ? (
                              <View style={styles.customTitleRow}>
                                <TextInput
                                  style={[styles.customTitleInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                  value={customTitleEdit.value}
                                  onChangeText={(text) => setCustomTitleEdit({ index, value: text })}
                                  onSubmitEditing={() => saveCustomTitle(index)}
                                  placeholder="Type your own title..."
                                  placeholderTextColor={colors.textTertiary}
                                  autoFocus
                                />
                                <TouchableOpacity onPress={() => saveCustomTitle(index)} style={styles.customTitleSave}>
                                  <Check color={COLORS.success} size={16} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setCustomTitleEdit(null)}>
                                  <X color={colors.textTertiary} size={16} />
                                </TouchableOpacity>
                              </View>
                            ) : (
                              <TouchableOpacity
                                style={styles.customTitleButton}
                                onPress={() => {
                                  const currentHeader = exp.header || '';
                                  const dashIdx = currentHeader.indexOf(' – ');
                                  const currentTitle = dashIdx !== -1 ? currentHeader.substring(0, dashIdx) : currentHeader;
                                  setCustomTitleEdit({ index, value: currentTitle });
                                }}
                              >
                                <Edit3 color={colors.textTertiary} size={14} />
                                <Text style={[styles.customTitleButtonText, { color: colors.textTertiary }]}>Write a custom title...</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}

                        {(exp.bullets || []).map((bullet: string, bIndex: number) => (
                          <Text key={bIndex} style={[styles.bulletPoint, { color: colors.textSecondary }]}>• {bullet}</Text>
                        ))}
                      </View>
                    ))
                  )
                )}
              </View>

              {/* Education */}
              <View style={[styles.comparisonSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <TouchableOpacity style={styles.sectionHeaderRow} onPress={() => toggleSection('education')}>
                  <View style={styles.sectionHeaderLeft}>
                    {expandedSections.education ? <ChevronDown color={colors.textTertiary} size={16} /> : <ChevronRight color={colors.textTertiary} size={16} />}
                    <Text style={[styles.sectionHeader, { color: colors.text, padding: 0 }]}>Education</Text>
                  </View>
                </TouchableOpacity>
                {expandedSections.education && (
                  <View style={styles.sectionContent}>
                    <Text style={[styles.sectionText, { color: colors.text }]}>
                      {tailoredResumeData.education || baseResumeData.education || 'No education listed'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Certifications */}
              <View style={[styles.comparisonSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <TouchableOpacity style={styles.sectionHeaderRow} onPress={() => toggleSection('certifications')}>
                  <View style={styles.sectionHeaderLeft}>
                    {expandedSections.certifications ? <ChevronDown color={colors.textTertiary} size={16} /> : <ChevronRight color={colors.textTertiary} size={16} />}
                    <Text style={[styles.sectionHeader, { color: colors.text, padding: 0 }]}>Certifications</Text>
                  </View>
                </TouchableOpacity>
                {expandedSections.certifications && (
                  <View style={styles.sectionContent}>
                    <Text style={[styles.sectionText, { color: colors.text }]}>
                      {tailoredResumeData.certifications || baseResumeData.certifications || 'No certifications listed'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Alignment Statement */}
              {tailoredResumeData.alignment_statement && (
                <View style={[styles.comparisonSection, styles.newSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <TouchableOpacity style={styles.sectionHeaderRow} onPress={() => toggleSection('alignment')}>
                    <View style={styles.sectionHeaderLeft}>
                      {expandedSections.alignment ? <ChevronDown color={colors.textTertiary} size={16} /> : <ChevronRight color={colors.textTertiary} size={16} />}
                      <Text style={[styles.sectionHeader, { color: colors.text, padding: 0 }]}>Company Alignment</Text>
                    </View>
                    <View style={styles.sectionHeaderActions}>
                      <View style={styles.newBadge}><Text style={styles.newBadgeText}>New</Text></View>
                      <TouchableOpacity
                        onPress={() => editMode.alignment ? saveEdit('alignment') : toggleEditMode('alignment')}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        {savingSection === 'alignment' ? (
                          <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : editMode.alignment ? (
                          <Save color={COLORS.primary} size={16} />
                        ) : (
                          <Edit3 color={colors.textTertiary} size={16} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                  {expandedSections.alignment && (
                    <View style={styles.sectionContent}>
                      {editMode.alignment ? (
                        <View>
                          <TextInput
                            style={[styles.editTextArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                            value={editedContent.alignment ?? tailoredResumeData.alignment_statement}
                            onChangeText={(text) => setEditedContent((prev) => ({ ...prev, alignment: text }))}
                            multiline
                            textAlignVertical="top"
                          />
                          <View style={styles.editActions}>
                            <TouchableOpacity style={styles.editCancelButton} onPress={() => toggleEditMode('alignment')}>
                              <Text style={[styles.editCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <Text style={[styles.sectionText, { color: colors.text }]}>
                          {tailoredResumeData.alignment_statement}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          ) : null}

          {/* Keywords Tab Content */}
          {activeTab === 'keywords' && (
            <View style={{ gap: SPACING.lg }}>
              {loadingKeywords ? (
                <View style={styles.loadingKeywords}>
                  <ActivityIndicator size="large" color={COLORS.warning} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Analyzing keywords...
                  </Text>
                </View>
              ) : (
                <>
                  {/* Keyword Match Summary */}
                  {keywordsData && (
                    <View style={[styles.keywordSummary, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                      <View style={styles.keywordSummaryHeader}>
                        <Key color={COLORS.warning} size={24} />
                        <View style={styles.keywordSummaryContent}>
                          <Text style={[styles.keywordSummaryTitle, { color: colors.text }]}>
                            Keyword Match Score
                          </Text>
                          <Text style={[styles.keywordSummaryScore, { color: COLORS.warning }]}>
                            {keywordsData.match_score || keywordsData.matchScore || 0}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Keywords Panel - Full Component */}
                  <KeywordPanel
                    keywords={keywordsData || analysisData?.keywords}
                    loading={loadingKeywords}
                  />

                  {/* Missing Keywords Section */}
                  {keywordsData?.missing_keywords && keywordsData.missing_keywords.length > 0 && (
                    <View style={[styles.comparisonSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                      <Text style={[styles.sectionHeader, { color: colors.text }]}>Missing Keywords</Text>
                      <Text style={[styles.keywordHelpText, { color: colors.textSecondary }]}>
                        Consider adding these keywords to improve your match score
                      </Text>
                      <View style={styles.skillsContainer}>
                        {keywordsData.missing_keywords.map((keyword: string, index: number) => (
                          <View key={index} style={[styles.skillPill, styles.missingKeywordPill]}>
                            <Text style={[styles.skillText, { color: COLORS.warning }]}>{keyword}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Matched Keywords Section */}
                  {keywordsData?.matched_keywords && keywordsData.matched_keywords.length > 0 && (
                    <View style={[styles.comparisonSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                      <Text style={[styles.sectionHeader, { color: colors.text }]}>Matched Keywords</Text>
                      <View style={styles.skillsContainer}>
                        {keywordsData.matched_keywords.map((keyword: string, index: number) => (
                          <View key={index} style={[styles.skillPill, styles.matchedKeywordPill]}>
                            <Check color={COLORS.success} size={12} />
                            <Text style={[styles.skillText, { color: COLORS.success }]}>{keyword}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {/* Analysis Tab Content */}
          {activeTab === 'analysis' && (
            <View style={{ gap: SPACING.lg }}>
              {/* Match Score */}
              <MatchScore
                matchScore={analysisData?.match_score}
                loading={loadingAnalysis}
              />

              {/* Keyword Analysis */}
              <KeywordPanel
                keywords={analysisData?.keywords}
                loading={loadingAnalysis}
              />

              {/* Detailed Change Explanations */}
              <ResumeAnalysis
                analysis={analysisData?.changes}
                loading={loadingAnalysis}
              />
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.comparisonFooter}>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.glass, borderColor: isDark ? colors.glassBorder : 'transparent' }]}
              onPress={handleSaveComparison}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Bookmark color={COLORS.primary} size={18} />
              )}
              <Text style={styles.secondaryButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.glass, borderColor: isDark ? colors.glassBorder : 'transparent' }]}
              onPress={showExportOptions}
              disabled={exporting}
            >
              {exporting ? (
                <ActivityIndicator size="small" color={COLORS.success} />
              ) : (
                <Download color={COLORS.success} size={18} />
              )}
              <Text style={[styles.secondaryButtonText, { color: COLORS.success }]}>Export</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.interviewPrepButton}
              onPress={handleViewInterviewPrep}
            >
              <Briefcase color="#fff" size={18} />
              <Text style={styles.interviewPrepButtonText}>Prep</Text>
              <ChevronRight color="#fff" size={18} />
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.glass, borderColor: isDark ? colors.glassBorder : 'transparent' }]}
              onPress={() => navigation.navigate('Applications' as any)}
            >
              <ClipboardCheck color={COLORS.primary} size={18} />
              <Text style={styles.secondaryButtonText}>Track App</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.glass, borderColor: isDark ? colors.glassBorder : 'transparent' }]}
              onPress={() => navigation.navigate('CoverLetters' as any)}
            >
              <BookOpen color={COLORS.primary} size={18} />
              <Text style={styles.secondaryButtonText}>Cover Letter</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.startNewButton}
            onPress={handleStartNew}
          >
            <RefreshCw color={colors.textSecondary} size={18} />
            <Text style={[styles.startNewButtonText, { color: colors.textSecondary }]}>Start New Tailoring</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state - no resumes
  if (resumes.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Tailor Resume</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <FileText color={colors.textTertiary} size={64} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Resumes</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Upload a resume first to start tailoring it for specific jobs.
          </Text>
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: colors.text }]}
            onPress={() => navigation.navigate('UploadResume')}
            accessibilityRole="button"
            accessibilityLabel="Upload resume"
            accessibilityHint="Opens file picker to select and upload a resume document"
          >
            <Text style={[styles.uploadButtonText, { color: colors.background }]}>Upload Resume</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main Form View
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.header}>
          {initialResumeId && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              accessibilityHint="Returns to the previous screen"
            >
              <ArrowLeft color={colors.text} size={24} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, { color: colors.text }, initialResumeId ? styles.titleWithBack : undefined]}>Tailor Resume</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Workflow Stepper */}
          <ProgressStepper
            steps={[
              { id: 'resume', label: 'Resume' },
              { id: 'job', label: 'Job Details' },
              { id: 'tailor', label: 'Tailor' },
              { id: 'export', label: 'Export' },
            ]}
            currentStep={
              !selectedResumeId ? 0 :
              !(jobUrl && company && jobTitle) ? 1 :
              !showComparison ? 2 : 3
            }
            variant="default"
            style={{ marginBottom: SPACING.md }}
          />

          {/* Resume Selector */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Select Resume</Text>
            <TouchableOpacity
              style={[styles.selector, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
              onPress={() => setShowResumeSelector(!showResumeSelector)}
              accessibilityRole="button"
              accessibilityLabel={`Resume selector: ${selectedResume?.filename || 'No resume selected'}`}
              accessibilityHint={showResumeSelector ? 'Collapses resume list' : 'Expands resume list'}
              accessibilityState={{ expanded: showResumeSelector }}
            >
              <View style={styles.selectorContent}>
                <FileText color={COLORS.primary} size={20} />
                <Text style={[styles.selectorText, { color: colors.text }]} numberOfLines={1}>
                  {selectedResume?.filename || 'Select a resume'}
                </Text>
              </View>
              <ChevronDown
                color={colors.textSecondary}
                size={20}
                style={showResumeSelector ? { transform: [{ rotate: '180deg' }] } : {}}
              />
            </TouchableOpacity>

            {showResumeSelector && (
              <View style={[styles.selectorDropdown, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                {resumes.map((resume) => (
                  <TouchableOpacity
                    key={resume.id}
                    style={[
                      styles.selectorOption,
                      selectedResumeId === resume.id && [styles.selectorOptionSelected, { backgroundColor: colors.glass }],
                    ]}
                    onPress={() => {
                      setSelectedResumeId(resume.id);
                      setShowResumeSelector(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${resume.filename}`}
                    accessibilityHint={`${resume.skills_count} skills`}
                    accessibilityState={{ selected: selectedResumeId === resume.id }}
                  >
                    <Text
                      style={[
                        styles.selectorOptionText, { color: colors.text },
                        selectedResumeId === resume.id && styles.selectorOptionTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {resume.filename}
                    </Text>
                    <Text style={[styles.selectorOptionMeta, { color: colors.textTertiary }]}>
                      {resume.skills_count} skills
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Job URL Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Job Posting URL</Text>
            <View style={styles.inputRow}>
              <View style={[styles.inputWrapper, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Link color={colors.textTertiary} size={20} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="https://linkedin.com/jobs/..."
                  placeholderTextColor={colors.textTertiary}
                  value={jobUrl}
                  onChangeText={setJobUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  accessibilityLabel="Job posting URL"
                  accessibilityHint="Enter the web address of the job posting to auto-extract details"
                />
              </View>
              <GlassButton
                variant="primary"
                onPress={handleExtractJob}
                disabled={extracting || !jobUrl.trim()}
                loading={extracting}
                icon={!extracting ? <Sparkles color="#fff" size={20} /> : undefined}
                style={styles.extractButton}
                accessibilityLabel={extracting ? "Extracting job details" : "Extract job details"}
                accessibilityHint="Automatically fills company and job title from the URL"
              />
            </View>
            <Text style={[styles.inputHint, { color: colors.textTertiary }]}>
              Paste a job URL to auto-extract company and job details
            </Text>
          </View>

          {/* Recent Jobs */}
          {savedJobs.length > 0 && (
            <View style={styles.section}>
              <View style={styles.recentJobsHeader}>
                <History color={colors.textTertiary} size={14} />
                <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginBottom: 0 }]}>Recent Jobs</Text>
              </View>
              {savedJobs.map((job) => (
                <TouchableOpacity
                  key={job.id}
                  style={[styles.recentJobItem, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                  onPress={() => handleSelectSavedJob(job)}
                  activeOpacity={0.7}
                >
                  <View style={styles.recentJobContent}>
                    <Text style={[styles.recentJobCompany, { color: colors.text }]} numberOfLines={1}>
                      {job.company || 'Unknown Company'}
                    </Text>
                    <Text style={[styles.recentJobTitle, { color: colors.textSecondary }]} numberOfLines={1}>
                      {job.job_title || job.jobTitle || 'Untitled Position'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteSavedJob(job.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.recentJobDelete}
                  >
                    <X color={colors.textTertiary} size={16} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Manual Entry */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textTertiary }]}>OR ENTER MANUALLY</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Company</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
              <Building2 color={colors.textTertiary} size={20} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Company name"
                placeholderTextColor={colors.textTertiary}
                value={company}
                onChangeText={setCompany}
                accessibilityLabel="Company name"
                accessibilityHint="Enter the name of the company you're applying to"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Job Title</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
              <Target color={colors.textTertiary} size={20} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Job title"
                placeholderTextColor={colors.textTertiary}
                value={jobTitle}
                onChangeText={setJobTitle}
                accessibilityLabel="Job title"
                accessibilityHint="Enter the job title you're applying for"
              />
            </View>
          </View>

          <View style={styles.footer}>
            <GlassButton
              label={tailoring ? 'Tailoring...' : 'Tailor Resume'}
              variant="primary"
              size="lg"
              onPress={handleTailor}
              disabled={tailoring}
              loading={tailoring}
              icon={!tailoring ? <Target color="#fff" size={20} /> : undefined}
              fullWidth
              accessibilityLabel={tailoring ? "Tailoring resume in progress" : "Tailor resume for job"}
              accessibilityHint="Customizes your resume to match the job requirements using AI"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    fontFamily: FONTS.regular,
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
  title: {
    fontSize: 34,
    fontFamily: FONTS.semibold,
  },
  titleWithBack: {
    fontSize: 34,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    minHeight: 48,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  selectorText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    flex: 1,
  },
  selectorDropdown: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  selectorOption: {
    padding: SPACING.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  selectorOptionSelected: {
  },
  selectorOptionText: {
    ...TYPOGRAPHY.subhead,
  },
  selectorOptionTextSelected: {
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
  },
  selectorOptionMeta: {
    ...TYPOGRAPHY.caption1,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    minHeight: 48,
  },
  inputIcon: {
    marginLeft: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.regular,
    padding: SPACING.md,
  },
  extractButton: {
    width: 48,
    height: 48,
    paddingHorizontal: 0,
  },
  inputHint: {
    ...TYPOGRAPHY.caption1,
    marginTop: SPACING.xs,
  },
  recentJobsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  recentJobItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    minHeight: 44,
  },
  recentJobContent: {
    flex: 1,
    gap: 2,
  },
  recentJobCompany: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  recentJobTitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  recentJobDelete: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...TYPOGRAPHY.caption1,
    marginHorizontal: SPACING.md,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
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
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  uploadButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  uploadButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },

  // Comparison View Styles
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  comparisonBackButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -SPACING.sm,
    marginRight: SPACING.sm,
  },
  comparisonHeaderContent: {
    flex: 1,
  },
  comparisonTitle: {
    fontSize: 24,
    fontFamily: FONTS.extralight,
  },
  comparisonSubtitle: {
    ...TYPOGRAPHY.subhead,
    marginTop: 2,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: ALPHA_COLORS.success.bg,
    borderWidth: 1,
    borderColor: ALPHA_COLORS.success.border,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  successText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.success,
  },
  tabScrollContainer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.sm,
    maxHeight: 40,
  },
  tabScrollContent: {
    padding: 3,
    gap: 6,
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    height: 32,
  },
  tabActive: {
  },
  tabText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  tabTextActive: {
  },
  comparisonContent: {
    flex: 1,
  },
  comparisonContentContainer: {
    padding: SPACING.lg,
  },
  comparisonSection: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  changedSection: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  newSection: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: FONTS.extralight,
    padding: SPACING.md,
    paddingBottom: 0,
  },
  changedBadge: {
    backgroundColor: ALPHA_COLORS.success.bg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  changedBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
    color: COLORS.success,
    textTransform: 'uppercase',
  },
  newBadge: {
    backgroundColor: ALPHA_COLORS.primary.bg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  newBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  sectionContent: {
    padding: SPACING.md,
  },
  sectionText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    padding: SPACING.md,
  },
  skillPill: {
    backgroundColor: ALPHA_COLORS.neutral.bg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  tailoredSkillPill: {
    backgroundColor: ALPHA_COLORS.success.bg,
  },
  skillText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  experienceItem: {
    padding: SPACING.md,
  },
  experienceHeader: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  bulletPoint: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    marginBottom: 4,
  },
  comparisonFooter: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 44,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
  },
  interviewPrepButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.purple,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 44,
  },
  interviewPrepButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: '#fff',
  },
  startNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  startNewButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  loadingKeywords: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  keywordSummary: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  keywordSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  keywordSummaryContent: {
    flex: 1,
  },
  keywordSummaryTitle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  keywordSummaryScore: {
    fontSize: 32,
    fontFamily: FONTS.bold,
  },
  keywordHelpText: {
    ...TYPOGRAPHY.caption1,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  missingKeywordPill: {
    backgroundColor: ALPHA_COLORS.warning.bg,
    borderWidth: 1,
    borderColor: ALPHA_COLORS.warning.border,
  },
  matchedKeywordPill: {
    backgroundColor: ALPHA_COLORS.success.bg,
    borderWidth: 1,
    borderColor: ALPHA_COLORS.success.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Next Step Prompt
  nextStepPrompt: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  nextStepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  nextStepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  nextStepActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  nextStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  nextStepButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FONTS.semibold,
  },
  nextStepButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  nextStepButtonOutlineText: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
  },

  // Toolbar
  comparisonToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  toolbarButtonText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },

  // Section Header with expand/collapse
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  sectionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  // Edit mode styles
  editTextArea: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    fontSize: 14,
    fontFamily: FONTS.regular,
    minHeight: 120,
    lineHeight: 22,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
  },
  editCancelButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  editCancelText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  editSkillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  editSkillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addSkillRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  addSkillInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  addSkillButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editExperienceItem: {
    borderBottomWidth: 1,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  editExperienceTitle: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  editExperienceField: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  editBulletsLabel: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.xs,
  },
  editBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  editBulletInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    fontSize: 13,
    fontFamily: FONTS.regular,
    minHeight: 60,
    lineHeight: 20,
  },
  addBulletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.xs,
  },
  addBulletText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },

  // Experience header row with title options
  experienceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },

  // Title Options
  titleOptionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: ALPHA_COLORS.primary.bg,
  },
  titleOptionsButtonText: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
  },
  titleOptionsDropdown: {
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 6,
  },
  titleOptionsLabel: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  titleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 8,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  titleOptionCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  titleOptionText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    flex: 1,
  },
  customTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  customTitleInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  customTitleSave: {
    padding: 4,
  },
  customTitleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
  },
  customTitleButtonText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
});
