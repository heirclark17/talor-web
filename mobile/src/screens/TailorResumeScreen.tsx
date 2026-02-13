import React, { useState, useEffect, useCallback } from 'react';
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
  Key, Share2
} from 'lucide-react-native';
import { MatchScore, KeywordPanel, ResumeAnalysis } from '../components';
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
  const { colors } = useTheme();
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

  // Set selected resume when resumes are loaded
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      const targetId = initialResumeId || resumes[0].id;
      setSelectedResumeId(targetId);
    }
  }, [resumes, selectedResumeId, initialResumeId]);

  useFocusEffect(
    useCallback(() => {
      // Only fetch if not showing comparison
      if (!showComparison) {
        fetchResumes();
      }
    }, [showComparison, fetchResumes])
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
        setCompany(result.data.company || '');
        setJobTitle(result.data.title || '');
        Alert.alert('Success', 'Job details extracted successfully!');
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

        // Show the comparison view
        setShowComparison(true);
        setActiveTab('tailored');
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
    setJobUrl('');
    setCompany('');
    setJobTitle('');
    setActiveTab('tailored');
  };

  const loadAnalysis = async () => {
    if (!tailoredResumeData || loadingAnalysis) return;

    setLoadingAnalysis(true);
    try {
      const result = await api.analyzeAll(tailoredResumeData.id);
      if (result.success && result.data) {
        setAnalysisData(result.data);
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
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
      navigation.navigate('InterviewPreps' as any, { screen: 'InterviewPrep', params: { tailoredResumeId: tailoredResumeData.id } });
    }
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

        {/* Success Banner */}
        <View style={styles.successBanner}>
          <Check color={COLORS.success} size={20} />
          <Text style={styles.successText}>Resume Successfully Tailored!</Text>
        </View>

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
          ) : (
            // Tailored Resume Content
            <View>
              {/* Summary - Highlighted as changed */}
              <View style={[styles.comparisonSection, styles.changedSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionHeader, { color: colors.text }]}>Professional Summary</Text>
                  <View style={styles.changedBadge}>
                    <Text style={styles.changedBadgeText}>Enhanced</Text>
                  </View>
                </View>
                <View style={styles.sectionContent}>
                  <Text style={[styles.sectionText, { color: colors.text }]}>
                    {tailoredResumeData.summary}
                  </Text>
                </View>
              </View>

              {/* Core Competencies - Highlighted as changed */}
              <View style={[styles.comparisonSection, styles.changedSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionHeader, { color: colors.text }]}>Core Competencies</Text>
                  <View style={styles.changedBadge}>
                    <Text style={styles.changedBadgeText}>Tailored</Text>
                  </View>
                </View>
                <View style={styles.skillsContainer}>
                  {tailoredResumeData.competencies.map((skill, index) => (
                    <View key={index} style={[styles.skillPill, styles.tailoredSkillPill]}>
                      <Text style={[styles.skillText, { color: colors.text }]}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Experience - Highlighted as changed */}
              <View style={[styles.comparisonSection, styles.changedSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionHeader, { color: colors.text }]}>Experience</Text>
                  <View style={styles.changedBadge}>
                    <Text style={styles.changedBadgeText}>Reframed</Text>
                  </View>
                </View>
                {tailoredResumeData.experience.map((exp, index) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={[styles.experienceHeader, { color: colors.text }]}>{exp.header}</Text>
                    {(exp.bullets || []).map((bullet: string, bIndex: number) => (
                      <Text key={bIndex} style={[styles.bulletPoint, { color: colors.textSecondary }]}>• {bullet}</Text>
                    ))}
                  </View>
                ))}
              </View>

              {/* Education */}
              <View style={[styles.comparisonSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>Education</Text>
                <View style={styles.sectionContent}>
                  <Text style={[styles.sectionText, { color: colors.text }]}>
                    {tailoredResumeData.education || baseResumeData.education || 'No education listed'}
                  </Text>
                </View>
              </View>

              {/* Certifications */}
              <View style={[styles.comparisonSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>Certifications</Text>
                <View style={styles.sectionContent}>
                  <Text style={[styles.sectionText, { color: colors.text }]}>
                    {tailoredResumeData.certifications || baseResumeData.certifications || 'No certifications listed'}
                  </Text>
                </View>
              </View>

              {/* Alignment Statement - New Section */}
              {tailoredResumeData.alignment_statement && (
                <View style={[styles.comparisonSection, styles.newSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={[styles.sectionHeader, { color: colors.text }]}>Company Alignment</Text>
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>New</Text>
                    </View>
                  </View>
                  <View style={styles.sectionContent}>
                    <Text style={[styles.sectionText, { color: colors.text }]}>
                      {tailoredResumeData.alignment_statement}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

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
              style={[styles.secondaryButton, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
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
              style={[styles.secondaryButton, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
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
                />
              </View>
              <GlassButton
                variant="primary"
                onPress={handleExtractJob}
                disabled={extracting || !jobUrl.trim()}
                loading={extracting}
                icon={!extracting ? <Sparkles color="#fff" size={20} /> : undefined}
                style={styles.extractButton}
              />
            </View>
            <Text style={[styles.inputHint, { color: colors.textTertiary }]}>
              Paste a job URL to auto-extract company and job details
            </Text>
          </View>

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
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <GlassButton
            label={tailoring ? 'Tailoring...' : 'Tailor Resume'}
            variant="primary"
            onPress={handleTailor}
            disabled={tailoring}
            loading={tailoring}
            icon={!tailoring ? <Target color="#fff" size={20} /> : undefined}
            fullWidth
          />
        </View>
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
    paddingVertical: SPACING.md,
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
    ...TYPOGRAPHY.largeTitle,
  },
  titleWithBack: {
    fontSize: 24,
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
    padding: SPACING.lg,
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
});
