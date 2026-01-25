import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Sparkles,
  TrendingUp,
  Upload,
  Target,
  Building,
  Clock,
  GraduationCap,
  Heart,
  Check,
  ChevronRight,
  ArrowLeft,
  X,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as DocumentPicker from 'expo-document-picker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type WizardStep = 'welcome' | 'upload' | 'questions' | 'generating' | 'results';
type QuestionStep = 1 | 2 | 3 | 4 | 5;

interface CareerPlan {
  id?: number;
  profileSummary?: string;
  generatedAt?: string;
  [key: string]: any;
}

export default function CareerPathDesignerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [step, setStep] = useState<WizardStep>('welcome');
  const [questionStep, setQuestionStep] = useState<QuestionStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [plan, setPlan] = useState<CareerPlan>();

  // Async job status
  const [jobId, setJobId] = useState<string>();
  const [jobProgress, setJobProgress] = useState<number>(0);
  const [jobMessage, setJobMessage] = useState<string>('');

  // Resume upload
  const [resumeFile, setResumeFile] = useState<any>(null);
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Existing resumes
  const [existingResumes, setExistingResumes] = useState<any[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  // Basic Profile (Step 1)
  const [dreamRole, setDreamRole] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [currentIndustry, setCurrentIndustry] = useState('');
  const [yearsExperience, setYearsExperience] = useState(5);
  const [educationLevel, setEducationLevel] = useState('bachelors');
  const [topTasks, setTopTasks] = useState<string[]>(['', '', '']);
  const [strengths, setStrengths] = useState<string[]>(['', '']);

  // Target Role Details (Step 2)
  const [targetRoleLevel, setTargetRoleLevel] = useState('mid-level');
  const [targetIndustries, setTargetIndustries] = useState<string[]>([]);

  // Work Preferences (Step 3)
  const [timeline, setTimeline] = useState('6months');
  const [timePerWeek, setTimePerWeek] = useState(10);
  const [currentEmploymentStatus, setCurrentEmploymentStatus] = useState('employed-full-time');
  const [location, setLocation] = useState('');
  const [willingToRelocate, setWillingToRelocate] = useState(false);
  const [inPersonVsRemote, setInPersonVsRemote] = useState('hybrid');

  // Learning Preferences (Step 4)
  const [learningStyle, setLearningStyle] = useState<string[]>([]);
  const [technicalBackground, setTechnicalBackground] = useState('some-technical');

  // Motivation & Goals (Step 5)
  const [transitionMotivation, setTransitionMotivation] = useState<string[]>([]);

  // Fetch existing resumes when on upload step
  useFocusEffect(
    useCallback(() => {
      if (step === 'upload' && existingResumes.length === 0) {
        loadExistingResumes();
      }
    }, [step])
  );

  const loadExistingResumes = async () => {
    setLoadingResumes(true);
    try {
      const response = await api.getResumes();
      if (response.success && response.data) {
        const resumeList = Array.isArray(response.data) ? response.data : [];
        setExistingResumes(resumeList);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleSelectExistingResume = async (id: number) => {
    setError(undefined);
    setUploadProgress(10);

    try {
      const resumeResult = await api.getResume(id);
      setUploadProgress(50);

      if (!resumeResult.success || !resumeResult.data) {
        setError('Failed to load resume. Please try again.');
        setUploadProgress(0);
        return;
      }

      setResumeId(id);
      setUploadProgress(100);

      // Auto-fill fields from resume
      if (resumeResult.data.parsed_data) {
        const data = resumeResult.data.parsed_data;
        if (data.experience?.[0]?.title) setCurrentRole(data.experience[0].title);
        if (data.experience?.[0]?.company) setCurrentIndustry(data.experience[0].company);

        // Calculate years of experience
        const years = data.experience?.reduce((total: number, exp: any) => {
          return total + (exp.duration_years || 0);
        }, 0) || 0;
        if (years > 0) setYearsExperience(years);
      }

      setTimeout(() => setStep('questions'), 500);
    } catch (error: any) {
      setError(error.message || 'Failed to load resume');
      setUploadProgress(0);
    }
  };

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setResumeFile(file);
      setError(undefined);
      setUploadProgress(10);

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'application/pdf',
        name: file.name,
      } as any);

      const uploadResult = await api.uploadResume(formData);
      setUploadProgress(50);

      if (!uploadResult.success || !uploadResult.data) {
        setError('Failed to upload resume. Please try again.');
        setResumeFile(null);
        setUploadProgress(0);
        return;
      }

      setResumeId(uploadResult.data.resume_id);
      setUploadProgress(100);

      // Auto-fill from parsed data
      if (uploadResult.data.parsed_data) {
        const data = uploadResult.data.parsed_data;
        if (data.experience?.[0]?.title) setCurrentRole(data.experience[0].title);
        if (data.experience?.[0]?.company) setCurrentIndustry(data.experience[0].company);

        const years = data.experience?.reduce((total: number, exp: any) => {
          return total + (exp.duration_years || 0);
        }, 0) || 0;
        if (years > 0) setYearsExperience(years);
      }

      setTimeout(() => setStep('questions'), 500);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setResumeFile(null);
      setUploadProgress(0);
    }
  };

  const handleGenerate = async () => {
    if (!dreamRole.trim()) {
      setError('Please tell us your dream role or career goal');
      return;
    }

    const validTopTasks = topTasks.filter(t => t.trim()).length >= 3;
    const validStrengths = strengths.filter(s => s.trim()).length >= 2;

    if (!validTopTasks) {
      setError('Please provide at least 3 top tasks from your current role');
      return;
    }

    if (!validStrengths) {
      setError('Please provide at least 2 strengths');
      return;
    }

    setLoading(true);
    setError(undefined);
    setStep('generating');
    setJobProgress(0);
    setJobMessage('Creating your personalized career plan...');

    try {
      const intake = {
        current_role_title: currentRole || dreamRole,
        current_industry: currentIndustry || 'General',
        years_experience: yearsExperience,
        education_level: educationLevel,
        top_tasks: topTasks.filter(t => t.trim()),
        strengths: strengths.filter(s => s.trim()),
        target_role_interest: dreamRole,
        target_role_level: targetRoleLevel,
        target_industries: targetIndustries,
        time_per_week: timePerWeek,
        timeline: timeline,
        current_employment_status: currentEmploymentStatus,
        location: location || 'Remote',
        willing_to_relocate: willingToRelocate,
        in_person_vs_remote: inPersonVsRemote,
        learning_style: learningStyle,
        technical_background: technicalBackground,
        transition_motivation: transitionMotivation,
      };

      const createJobResult = await api.generateCareerPlanAsync(intake);

      if (!createJobResult.success || !createJobResult.data?.job_id) {
        const errorMsg = createJobResult.error || 'Failed to start career plan generation';
        setError(`Generation failed: ${errorMsg}`);
        setStep('questions');
        setLoading(false);
        return;
      }

      const currentJobId = createJobResult.data.job_id;
      setJobId(currentJobId);

      // Poll for job status
      let attempts = 0;
      const maxAttempts = 120; // 10 minutes with 5-second polling
      const pollInterval = 5000; // 5 seconds

      const poll = async () => {
        attempts++;

        if (attempts > maxAttempts) {
          setError('Career plan generation timed out. Please try again.');
          setStep('questions');
          setLoading(false);
          return;
        }

        const statusResult = await api.getCareerPlanJobStatus(currentJobId);

        if (!statusResult.success) {
          setTimeout(poll, pollInterval);
          return;
        }

        const jobData = statusResult.data;
        setJobProgress(jobData.progress || 0);
        setJobMessage(jobData.message || 'Processing...');

        if (jobData.status === 'completed' && jobData.plan) {
          setPlan(jobData.plan);
          setStep('results');
          setLoading(false);
        } else if (jobData.status === 'failed') {
          const errorMsg = jobData.error || 'Career plan generation failed';
          setError(errorMsg);
          setStep('questions');
          setLoading(false);
        } else {
          setTimeout(poll, pollInterval);
        }
      };

      poll();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setStep('questions');
      setLoading(false);
    }
  };

  const handleNextQuestionStep = () => {
    // Validate current step
    if (questionStep === 1) {
      const validTopTasks = topTasks.filter(t => t.trim()).length >= 3;
      const validStrengths = strengths.filter(s => s.trim()).length >= 2;

      if (!dreamRole.trim()) {
        setError('Please provide your dream role');
        return;
      }
      if (!validTopTasks) {
        setError('Please provide at least 3 top tasks');
        return;
      }
      if (!validStrengths) {
        setError('Please provide at least 2 strengths');
        return;
      }
    }

    if (questionStep === 4) {
      if (learningStyle.length === 0) {
        setError('Please select at least one learning style');
        return;
      }
    }

    if (questionStep === 5) {
      if (transitionMotivation.length === 0) {
        setError('Please select at least one motivation for transitioning');
        return;
      }
    }

    setError(undefined);
    if (questionStep < 5) {
      setQuestionStep((questionStep + 1) as QuestionStep);
    }
  };

  const handlePrevQuestionStep = () => {
    setError(undefined);
    if (questionStep > 1) {
      setQuestionStep((questionStep - 1) as QuestionStep);
    }
  };

  const toggleArrayItem = (arr: string[], setArr: (val: string[]) => void, item: string) => {
    if (arr.includes(item)) {
      setArr(arr.filter(i => i !== item));
    } else {
      setArr([...arr, item]);
    }
  };

  // Welcome Screen
  if (step === 'welcome') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeBadge}>
              <Sparkles color={COLORS.primary} size={20} />
              <Text style={styles.welcomeBadgeText}>AI-Powered Career Planning</Text>
            </View>

            <Text style={styles.welcomeTitle}>Design Your Career Transition Path</Text>

            <Text style={styles.welcomeSubtitle}>
              Upload your resume and complete our comprehensive assessment. Get a personalized roadmap with certifications, study materials, tech stacks, and networking events.
            </Text>

            <View style={styles.featureGrid}>
              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Upload color={COLORS.primary} size={32} />
                </View>
                <Text style={styles.featureTitle}>Upload Resume</Text>
                <Text style={styles.featureText}>We analyze your experience automatically</Text>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Target color={COLORS.primary} size={32} />
                </View>
                <Text style={styles.featureTitle}>Detailed Assessment</Text>
                <Text style={styles.featureText}>Comprehensive questionnaire for best fit</Text>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <TrendingUp color={COLORS.primary} size={32} />
                </View>
                <Text style={styles.featureTitle}>Actionable Plan</Text>
                <Text style={styles.featureText}>Real certifications, events, and resources</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setStep('upload')}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <ChevronRight color={COLORS.dark.background} size={20} />
            </TouchableOpacity>

            <Text style={styles.welcomeFooter}>Takes 10-15 minutes for comprehensive assessment</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Upload Resume Screen
  if (step === 'upload') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.uploadContainer}>
            <Text style={styles.screenTitle}>Upload Your Resume</Text>
            <Text style={styles.screenSubtitle}>
              We'll automatically extract your skills, experience, and background
            </Text>

            {/* Existing resumes */}
            {existingResumes.length > 0 && !resumeFile && (
              <>
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Select from Your Previous Resumes</Text>
                  {loadingResumes ? (
                    <ActivityIndicator size="large" color={COLORS.primary} />
                  ) : (
                    existingResumes.map((resume: any) => (
                      <TouchableOpacity
                        key={resume.id}
                        style={styles.resumeItem}
                        onPress={() => handleSelectExistingResume(resume.id)}
                      >
                        <View style={styles.resumeInfo}>
                          <Text style={styles.resumeName}>{resume.filename || `Resume ${resume.id}`}</Text>
                          <Text style={styles.resumeDate}>
                            Uploaded {new Date(resume.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                        <ChevronRight color={COLORS.dark.textSecondary} size={20} />
                      </TouchableOpacity>
                    ))
                  )}
                </View>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>
              </>
            )}

            {/* Upload zone */}
            <TouchableOpacity
              style={styles.uploadZone}
              onPress={handleFileSelect}
              disabled={uploadProgress > 0 && uploadProgress < 100}
            >
              {!resumeFile ? (
                <>
                  <Upload color={COLORS.primary} size={48} />
                  <Text style={styles.uploadTitle}>Tap to select your resume</Text>
                  <Text style={styles.uploadSubtext}>Supports PDF, DOC, and DOCX files</Text>
                </>
              ) : uploadProgress < 100 ? (
                <>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.uploadTitle}>Analyzing your resume...</Text>
                  <Text style={styles.uploadSubtext}>{uploadProgress}% complete</Text>
                </>
              ) : (
                <>
                  <View style={styles.checkIcon}>
                    <Check color={COLORS.success} size={32} />
                  </View>
                  <Text style={styles.uploadTitle}>Resume uploaded successfully!</Text>
                  <Text style={styles.uploadSubtext}>{resumeFile.name}</Text>
                </>
              )}
            </TouchableOpacity>

            {error && (
              <View style={styles.errorBox}>
                <X color={COLORS.danger} size={20} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep('welcome')}
              >
                <ArrowLeft color={COLORS.dark.textSecondary} size={20} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, !resumeFile && styles.secondaryButton]}
                onPress={() => setStep('questions')}
              >
                <Text style={[styles.primaryButtonText, !resumeFile && styles.secondaryButtonText]}>
                  {resumeFile ? 'Continue' : 'Skip'}
                </Text>
                <ChevronRight color={resumeFile ? COLORS.dark.background : COLORS.primary} size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Questions Screen (Multi-Step)
  if (step === 'questions') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.questionsContainer}>
            {/* Step indicator */}
            <View style={styles.stepIndicator}>
              {[1, 2, 3, 4, 5].map((num) => (
                <View
                  key={num}
                  style={[
                    styles.stepDot,
                    questionStep === num && styles.stepDotActive,
                    questionStep > num && styles.stepDotCompleted,
                  ]}
                >
                  {questionStep > num ? (
                    <Check color={COLORS.dark.background} size={16} />
                  ) : (
                    <Text style={styles.stepDotText}>{num}</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Step content */}
            {questionStep === 1 && (
              <View>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIcon}>
                    <Target color={COLORS.primary} size={32} />
                  </View>
                  <Text style={styles.stepTitle}>Basic Profile</Text>
                  <Text style={styles.stepSubtitle}>Tell us about your current role and dream career</Text>
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Dream Role or Career Goal *</Text>
                    <TextInput
                      style={styles.input}
                      value={dreamRole}
                      onChangeText={setDreamRole}
                      placeholder="e.g., Senior Cloud Security Architect"
                      placeholderTextColor={COLORS.dark.textTertiary}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Current Role Title</Text>
                    <TextInput
                      style={styles.input}
                      value={currentRole}
                      onChangeText={setCurrentRole}
                      placeholder="e.g., IT Manager"
                      placeholderTextColor={COLORS.dark.textTertiary}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Current Industry</Text>
                    <TextInput
                      style={styles.input}
                      value={currentIndustry}
                      onChangeText={setCurrentIndustry}
                      placeholder="e.g., Healthcare, Finance"
                      placeholderTextColor={COLORS.dark.textTertiary}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Years of Experience: {yearsExperience}</Text>
                    <Text style={styles.helpText}>Slide to adjust</Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Education Level</Text>
                    <View style={styles.chipGrid}>
                      {[
                        { value: 'high school', label: 'High School' },
                        { value: 'associates', label: 'Associates' },
                        { value: 'bachelors', label: 'Bachelors' },
                        { value: 'masters', label: 'Masters' },
                        { value: 'phd', label: 'PhD' },
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.chip,
                            educationLevel === option.value && styles.chipSelected,
                          ]}
                          onPress={() => setEducationLevel(option.value)}
                        >
                          <Text style={[
                            styles.chipText,
                            educationLevel === option.value && styles.chipTextSelected,
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Top 3-5 Tasks in Current Role *</Text>
                    {topTasks.map((task, idx) => (
                      <TextInput
                        key={idx}
                        style={[styles.input, styles.inputMargin]}
                        value={task}
                        onChangeText={(text) => {
                          const newTasks = [...topTasks];
                          newTasks[idx] = text;
                          setTopTasks(newTasks);
                        }}
                        placeholder={`Task ${idx + 1}`}
                        placeholderTextColor={COLORS.dark.textTertiary}
                      />
                    ))}
                    <TouchableOpacity onPress={() => setTopTasks([...topTasks, ''])}>
                      <Text style={styles.linkText}>+ Add another task</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Your Top Strengths (2-5) *</Text>
                    {strengths.map((strength, idx) => (
                      <TextInput
                        key={idx}
                        style={[styles.input, styles.inputMargin]}
                        value={strength}
                        onChangeText={(text) => {
                          const newStrengths = [...strengths];
                          newStrengths[idx] = text;
                          setStrengths(newStrengths);
                        }}
                        placeholder={`Strength ${idx + 1} (e.g., Leadership)`}
                        placeholderTextColor={COLORS.dark.textTertiary}
                      />
                    ))}
                    {strengths.length < 5 && (
                      <TouchableOpacity onPress={() => setStrengths([...strengths, ''])}>
                        <Text style={styles.linkText}>+ Add another strength</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}

            {questionStep === 2 && (
              <View>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIcon}>
                    <Building color={COLORS.primary} size={32} />
                  </View>
                  <Text style={styles.stepTitle}>Target Role Details</Text>
                  <Text style={styles.stepSubtitle}>Help us understand your career aspirations</Text>
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Desired Career Level</Text>
                    <View style={styles.chipGrid}>
                      {[
                        { value: 'entry-level', label: 'Entry Level' },
                        { value: 'mid-level', label: 'Mid Level' },
                        { value: 'senior', label: 'Senior' },
                        { value: 'lead', label: 'Lead' },
                        { value: 'executive', label: 'Executive' },
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.chip,
                            targetRoleLevel === option.value && styles.chipSelected,
                          ]}
                          onPress={() => setTargetRoleLevel(option.value)}
                        >
                          <Text style={[
                            styles.chipText,
                            targetRoleLevel === option.value && styles.chipTextSelected,
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Target Industries (Select all that apply)</Text>
                    <View style={styles.chipGrid}>
                      {[
                        'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
                        'Manufacturing', 'Government', 'Consulting', 'Non-Profit', 'Other',
                      ].map((industry) => (
                        <TouchableOpacity
                          key={industry}
                          style={[
                            styles.chip,
                            targetIndustries.includes(industry) && styles.chipSelected,
                          ]}
                          onPress={() => toggleArrayItem(targetIndustries, setTargetIndustries, industry)}
                        >
                          <Text style={[
                            styles.chipText,
                            targetIndustries.includes(industry) && styles.chipTextSelected,
                          ]}>
                            {industry}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {questionStep === 3 && (
              <View>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIcon}>
                    <Clock color={COLORS.primary} size={32} />
                  </View>
                  <Text style={styles.stepTitle}>Work Preferences</Text>
                  <Text style={styles.stepSubtitle}>Your availability and work style</Text>
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Transition Timeline</Text>
                    <View style={styles.chipGrid}>
                      {[
                        { value: '3months', label: '3 Months', desc: 'Fast track' },
                        { value: '6months', label: '6 Months', desc: 'Balanced' },
                        { value: '12months', label: '12 Months', desc: 'Thorough' },
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.chipLarge,
                            timeline === option.value && styles.chipSelected,
                          ]}
                          onPress={() => setTimeline(option.value)}
                        >
                          <Text style={[
                            styles.chipText,
                            timeline === option.value && styles.chipTextSelected,
                          ]}>
                            {option.label}
                          </Text>
                          <Text style={styles.chipSubtext}>{option.desc}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Hours per Week Available: {timePerWeek} hrs/week</Text>
                    <Text style={styles.helpText}>Slide to adjust (5-40 hours)</Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Current Employment Status</Text>
                    <View style={styles.chipGrid}>
                      {[
                        { value: 'employed-full-time', label: 'Full-Time' },
                        { value: 'employed-part-time', label: 'Part-Time' },
                        { value: 'unemployed', label: 'Unemployed' },
                        { value: 'student', label: 'Student' },
                        { value: 'freelance', label: 'Freelance' },
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.chip,
                            currentEmploymentStatus === option.value && styles.chipSelected,
                          ]}
                          onPress={() => setCurrentEmploymentStatus(option.value)}
                        >
                          <Text style={[
                            styles.chipText,
                            currentEmploymentStatus === option.value && styles.chipTextSelected,
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Your Location</Text>
                    <TextInput
                      style={styles.input}
                      value={location}
                      onChangeText={setLocation}
                      placeholder="e.g., Austin, TX or Remote"
                      placeholderTextColor={COLORS.dark.textTertiary}
                    />
                    <Text style={styles.helpText}>Helps us find local networking events</Text>
                  </View>

                  <View style={styles.formGroup}>
                    <View style={styles.switchRow}>
                      <Text style={styles.label}>Willing to relocate for opportunities</Text>
                      <Switch
                        value={willingToRelocate}
                        onValueChange={setWillingToRelocate}
                        trackColor={{ false: COLORS.dark.glassBorder, true: COLORS.primary }}
                        thumbColor={COLORS.dark.text}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Work Preference</Text>
                    <View style={styles.chipGrid}>
                      {[
                        { value: 'in-person', label: 'In-Person' },
                        { value: 'remote', label: 'Remote' },
                        { value: 'hybrid', label: 'Hybrid' },
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.chip,
                            inPersonVsRemote === option.value && styles.chipSelected,
                          ]}
                          onPress={() => setInPersonVsRemote(option.value)}
                        >
                          <Text style={[
                            styles.chipText,
                            inPersonVsRemote === option.value && styles.chipTextSelected,
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {questionStep === 4 && (
              <View>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIcon}>
                    <GraduationCap color={COLORS.primary} size={32} />
                  </View>
                  <Text style={styles.stepTitle}>Learning Preferences</Text>
                  <Text style={styles.stepSubtitle}>How you learn best</Text>
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Preferred Learning Styles (Select all that apply) *</Text>
                    <View style={styles.chipGrid}>
                      {[
                        { value: 'video-courses', label: '📹 Video Courses' },
                        { value: 'reading-books', label: '📚 Reading Books' },
                        { value: 'hands-on-projects', label: '🛠️ Hands-On Projects' },
                        { value: 'bootcamp', label: '🎓 Bootcamp' },
                        { value: 'mentorship', label: '👥 Mentorship' },
                        { value: 'self-paced', label: '⏰ Self-Paced' },
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.chipLarge,
                            learningStyle.includes(option.value) && styles.chipSelected,
                          ]}
                          onPress={() => toggleArrayItem(learningStyle, setLearningStyle, option.value)}
                        >
                          <Text style={[
                            styles.chipText,
                            learningStyle.includes(option.value) && styles.chipTextSelected,
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Technical Background</Text>
                    <View style={styles.chipGrid}>
                      {[
                        { value: 'non-technical', label: 'Non-Technical', desc: 'Little to no tech' },
                        { value: 'some-technical', label: 'Some Technical', desc: 'Basic knowledge' },
                        { value: 'technical', label: 'Technical', desc: 'Solid background' },
                        { value: 'highly-technical', label: 'Highly Technical', desc: 'Expert level' },
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.chipLarge,
                            technicalBackground === option.value && styles.chipSelected,
                          ]}
                          onPress={() => setTechnicalBackground(option.value)}
                        >
                          <Text style={[
                            styles.chipText,
                            technicalBackground === option.value && styles.chipTextSelected,
                          ]}>
                            {option.label}
                          </Text>
                          <Text style={styles.chipSubtext}>{option.desc}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {questionStep === 5 && (
              <View>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIcon}>
                    <Heart color={COLORS.primary} size={32} />
                  </View>
                  <Text style={styles.stepTitle}>Motivation & Goals</Text>
                  <Text style={styles.stepSubtitle}>What drives this career change</Text>
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Why are you transitioning? (Select all that apply) *</Text>
                    <View style={styles.chipGrid}>
                      {[
                        { value: 'better-pay', label: '💰 Better Pay' },
                        { value: 'work-life-balance', label: '⚖️ Work-Life Balance' },
                        { value: 'interesting-work', label: '✨ More Interesting Work' },
                        { value: 'remote-work', label: '🏠 Remote Work' },
                        { value: 'career-growth', label: '📈 Career Growth' },
                        { value: 'passion', label: '❤️ Follow Passion' },
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.chipLarge,
                            transitionMotivation.includes(option.value) && styles.chipSelected,
                          ]}
                          onPress={() => toggleArrayItem(transitionMotivation, setTransitionMotivation, option.value)}
                        >
                          <Text style={[
                            styles.chipText,
                            transitionMotivation.includes(option.value) && styles.chipTextSelected,
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {error && (
              <View style={styles.errorBox}>
                <X color={COLORS.danger} size={20} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Navigation */}
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={questionStep > 1 ? handlePrevQuestionStep : () => setStep('upload')}
              >
                <ArrowLeft color={COLORS.dark.textSecondary} size={20} />
                <Text style={styles.backButtonText}>{questionStep > 1 ? 'Previous' : 'Back'}</Text>
              </TouchableOpacity>

              {questionStep < 5 ? (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleNextQuestionStep}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                  <ChevronRight color={COLORS.dark.background} size={20} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleGenerate}
                  disabled={loading}
                >
                  <Sparkles color={COLORS.dark.background} size={20} />
                  <Text style={styles.primaryButtonText}>Generate Plan</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.stepLabel}>
              Step {questionStep} of 5: {
                questionStep === 1 ? 'Basic Profile' :
                questionStep === 2 ? 'Target Role Details' :
                questionStep === 3 ? 'Work Preferences' :
                questionStep === 4 ? 'Learning Preferences' :
                'Motivation & Goals'
              }
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Generating Screen
  if (step === 'generating') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.generatingContainer}>
          <View style={styles.generatingCard}>
            <View style={styles.generatingIcon}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>

            <Text style={styles.generatingTitle}>Crafting Your Personalized Career Roadmap</Text>

            <Text style={styles.generatingMessage}>
              {jobMessage || `Our AI is researching ${dreamRole} opportunities with real-world data...`}
            </Text>

            <Text style={styles.generatingSubtext}>
              This may take 2-3 minutes for comprehensive research
            </Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${jobProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>{jobProgress}%</Text>
            </View>

            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={styles.stepBullet}>
                  {jobProgress >= 10 ? (
                    <Check color={COLORS.success} size={16} />
                  ) : (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  )}
                </View>
                <Text style={[styles.stepText, jobProgress >= 10 && styles.stepTextCompleted]}>
                  Researching certifications and job market data
                </Text>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepBullet}>
                  {jobProgress >= 60 ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <View style={styles.stepDotInactive} />
                  )}
                </View>
                <Text style={[styles.stepText, jobProgress >= 60 && styles.stepTextCompleted]}>
                  Generating personalized plan
                </Text>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepBullet}>
                  {jobProgress >= 90 ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <View style={styles.stepDotInactive} />
                  )}
                </View>
                <Text style={[styles.stepText, jobProgress >= 90 && styles.stepTextCompleted]}>
                  Finalizing your resume transformation guide
                </Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Results Screen
  if (step === 'results') {
    if (!plan) {
      return (
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.errorContainer}>
            <X color={COLORS.danger} size={64} />
            <Text style={styles.errorTitle}>Failed to Generate Plan</Text>
            <Text style={styles.errorMessage}>
              We couldn't generate your career plan. Please try again.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setStep('questions');
                setError(undefined);
              }}
            >
              <Text style={styles.primaryButtonText}>Back to Assessment</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultsContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setStep('welcome');
                setPlan(undefined);
                setDreamRole('');
                setQuestionStep(1);
              }}
            >
              <ArrowLeft color={COLORS.dark.textSecondary} size={20} />
              <Text style={styles.backButtonText}>New Plan</Text>
            </TouchableOpacity>

            <View style={styles.resultsHeader}>
              <View style={styles.resultsIcon}>
                <TrendingUp color={COLORS.primary} size={32} />
              </View>
              <Text style={styles.resultsTitle}>Your Career Transition Plan</Text>
              <Text style={styles.resultsSubtitle}>
                {plan.profileSummary || 'Your personalized career transition roadmap'}
              </Text>
              {plan.generatedAt && (
                <Text style={styles.resultsDate}>
                  Generated {new Date(plan.generatedAt).toLocaleDateString()}
                </Text>
              )}
            </View>

            {/* Display plan data here - will be enhanced with actual plan content */}
            <View style={styles.planContent}>
              <Text style={styles.planText}>Plan generated successfully!</Text>
              <Text style={styles.planText}>View detailed results on the web version for best experience.</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.dark.glass,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xl,
  },
  welcomeBadgeText: {
    color: COLORS.dark.text,
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.dark.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.dark.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    lineHeight: 24,
  },
  featureGrid: {
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
    width: '100%',
  },
  featureCard: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.dark.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark.text,
    marginBottom: SPACING.xs,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.dark.textSecondary,
    textAlign: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.dark.text,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 48,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark.background,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
  welcomeFooter: {
    fontSize: 12,
    color: COLORS.dark.textTertiary,
    marginTop: SPACING.md,
  },
  uploadContainer: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 16,
    color: COLORS.dark.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  resumeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    minHeight: 64,
  },
  resumeInfo: {
    flex: 1,
  },
  resumeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark.text,
    marginBottom: 4,
  },
  resumeDate: {
    fontSize: 13,
    color: COLORS.dark.textSecondary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.dark.glassBorder,
  },
  dividerText: {
    color: COLORS.dark.textSecondary,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
  },
  uploadZone: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.dark.glassBorder,
    borderStyle: 'dashed',
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    marginBottom: SPACING.xl,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark.text,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  uploadSubtext: {
    fontSize: 14,
    color: COLORS.dark.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  checkIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.dark.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.danger,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    flex: 1,
    color: COLORS.danger,
    fontSize: 14,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.dark.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  questionsContainer: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.dark.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.dark.text,
  },
  stepDotText: {
    color: COLORS.dark.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.dark.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark.text,
    marginBottom: SPACING.xs,
  },
  stepSubtitle: {
    fontSize: 14,
    color: COLORS.dark.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    gap: SPACING.lg,
  },
  formGroup: {
    gap: SPACING.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark.text,
  },
  input: {
    backgroundColor: COLORS.dark.backgroundSecondary,
    borderWidth: 2,
    borderColor: COLORS.dark.glassBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.dark.text,
    fontSize: 16,
    minHeight: 48,
  },
  inputMargin: {
    marginBottom: SPACING.xs,
  },
  helpText: {
    fontSize: 13,
    color: COLORS.dark.textTertiary,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    backgroundColor: COLORS.dark.backgroundTertiary,
    borderWidth: 2,
    borderColor: COLORS.dark.glassBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark.text,
  },
  chipTextSelected: {
    color: COLORS.dark.background,
  },
  chipLarge: {
    backgroundColor: COLORS.dark.backgroundTertiary,
    borderWidth: 2,
    borderColor: COLORS.dark.glassBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSubtext: {
    fontSize: 11,
    color: COLORS.dark.textTertiary,
    marginTop: 2,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 13,
    color: COLORS.dark.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  generatingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  generatingCard: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    padding: SPACING.xxl,
    width: '100%',
    alignItems: 'center',
  },
  generatingIcon: {
    marginBottom: SPACING.lg,
  },
  generatingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  generatingMessage: {
    fontSize: 16,
    color: COLORS.dark.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  generatingSubtext: {
    fontSize: 13,
    color: COLORS.dark.textTertiary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  progressContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.dark.backgroundTertiary,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.dark.textTertiary,
    textAlign: 'center',
  },
  stepsList: {
    gap: SPACING.md,
    width: '100%',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stepBullet: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.dark.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotInactive: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.dark.textTertiary,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.dark.textSecondary,
  },
  stepTextCompleted: {
    color: COLORS.dark.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.dark.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  resultsIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.dark.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  resultsSubtitle: {
    fontSize: 14,
    color: COLORS.dark.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  resultsDate: {
    fontSize: 12,
    color: COLORS.dark.textTertiary,
  },
  planContent: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    padding: SPACING.xl,
  },
  planText: {
    fontSize: 16,
    color: COLORS.dark.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
});
