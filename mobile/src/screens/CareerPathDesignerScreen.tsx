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
  BarChart3,
  BookOpen,
  Lightbulb,
  AlertCircle,
  FolderOpen,
  Briefcase,
  Link2,
  Video,
  Wrench,
  Users,
  DollarSign,
  Scale,
  Home,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';
import { CareerPlanResults, CareerPathCertifications } from '../components';
import { useResumeStore } from '../stores/resumeStore';
import { usePostHog } from '../contexts/PostHogContext';
import type { CareerPlan } from '../types/career-plan';
import { transformApiResponse } from '../utils/careerPlanTransform';
let DocumentPicker: typeof import('expo-document-picker') | null = null;
try { DocumentPicker = require('expo-document-picker'); } catch {}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type WizardStep = 'welcome' | 'upload' | 'questions' | 'generating' | 'results';
type QuestionStep = 1 | 2 | 3 | 4 | 5;

interface StoredPlan extends Partial<CareerPlan> {
  id?: number;
  [key: string]: any;
}

// --- Resume Intelligence Functions (matching web) ---

function inferStrengths(experience: any[], skills: string[], summary: string): string[] {
  const allText = [
    summary || '',
    ...experience.map((e: any) => [
      e.title || '', e.company || '',
      ...(Array.isArray(e.responsibilities) ? e.responsibilities : []),
      ...(Array.isArray(e.bullets) ? e.bullets : []),
      e.description || '',
    ].join(' ')),
    ...skills,
  ].join(' ').toLowerCase();

  const strengthPatterns: [RegExp, string][] = [
    [/\b(led|lead|managed|directed|supervised|oversaw|coordinated|spearheaded|headed|mentored|coached)\b/g, 'Leadership & Team Management'],
    [/\b(stakeholder|executive|c-suite|board|cross-functional|cross functional|collaborate|collaboration|partner)\b/g, 'Stakeholder & Executive Communication'],
    [/\b(project manag|program manag|pmo|portfolio|agile|scrum|kanban|sprint|roadmap|milestone)\b/g, 'Program & Project Management'],
    [/\b(strateg|vision|roadmap|transform|moderniz|initiative|innovation|architect)\b/g, 'Strategic Planning & Vision'],
    [/\b(budget|cost|financial|roi|revenue|savings|p&l|forecast|resource allocation)\b/g, 'Budget & Financial Management'],
    [/\b(security|cyber|vulnerability|threat|incident|soc |siem|firewall|penetration|compliance)\b/g, 'Cybersecurity & Risk Management'],
    [/\b(cloud|aws|azure|gcp|infrastructure|devops|ci\/cd|kubernetes|docker|terraform)\b/g, 'Cloud & Infrastructure'],
    [/\b(develop|engineer|code|software|application|api|database|full.?stack|backend|frontend)\b/g, 'Software Development & Engineering'],
    [/\b(data|analytics|reporting|dashboard|metrics|kpi|insight|visualization|tableau|power bi)\b/g, 'Data Analysis & Reporting'],
    [/\b(process|improv|optimi|efficien|automat|streamlin|workflow|operational excellence)\b/g, 'Process Improvement & Optimization'],
    [/\b(vendor|third.?party|contract|procurement|negotiat|supplier|outsourc)\b/g, 'Vendor & Contract Management'],
    [/\b(risk|governance|audit|compliance|regulat|framework|nist|iso|sox|hipaa|pci|gdpr)\b/g, 'Risk & Compliance Management'],
    [/\b(train|mentor|develop talent|onboard|team building|culture|retention|hiring|recruit)\b/g, 'Talent Development & Mentoring'],
    [/\b(present|communicat|report|document|brief|written|verbal|public speak)\b/g, 'Communication & Presentation'],
    [/\b(problem.?solv|troubleshoot|root cause|diagnos|resolv|debug|investigat)\b/g, 'Problem Solving & Troubleshooting'],
    [/\b(deliver|implement|deploy|launch|execut|ship|release|go.?live|migration)\b/g, 'Execution & Delivery'],
    [/\b(client|customer|account|relationship|satisfaction|nps|retention|success)\b/g, 'Client Relationship Management'],
  ];

  const scored = strengthPatterns.map(([regex, label]) => {
    const matches = allText.match(regex);
    return { label, count: matches ? matches.length : 0 };
  });

  return scored
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(s => s.label);
}

function inferIndustry(company: string, title: string, skills: string[]): string {
  const all = `${company} ${title} ${skills.join(' ')}`.toLowerCase();

  const patterns: [RegExp, string][] = [
    [/\b(bank|financ|capital|invest|trading|hedge fund|mortgage|credit|jpmorgan|goldman|citi|wells fargo|fidelity|schwab|merrill|morgan stanley)\b/, 'Financial Services & Banking'],
    [/\b(hospital|health|medical|pharma|biotech|clinical|patient|hipaa|epic|cerner|unitedhealth|anthem|aetna|humana|cvs health)\b/, 'Healthcare & Life Sciences'],
    [/\b(defense|military|dod|army|navy|air force|lockheed|raytheon|northrop|boeing|clearance|classified|fedramp|disa)\b/, 'Defense & Aerospace'],
    [/\b(federal|government|govt|public sector|state agency|gsa|va |usda|fbi|cia|nsa|homeland)\b/, 'Government & Public Sector'],
    [/\b(school|university|college|education|edtech|academic|campus|student|coursera|udemy)\b/, 'Education & EdTech'],
    [/\b(retail|ecommerce|e-commerce|shopping|merchant|walmart|amazon|target|costco|shopify)\b/, 'Retail & E-Commerce'],
    [/\b(energy|oil|gas|petroleum|utility|utilities|solar|wind|renewable|power grid|exxon|chevron|shell|bp)\b/, 'Energy & Utilities'],
    [/\b(telecom|wireless|5g|spectrum|at&t|verizon|t-mobile|comcast|charter)\b/, 'Telecommunications'],
    [/\b(insurance|underwriting|actuari|claims|allstate|geico|progressive|state farm|liberty mutual)\b/, 'Insurance'],
    [/\b(manufactur|automotive|vehicle|factory|assembly|ford|gm|toyota|tesla|caterpillar)\b/, 'Manufacturing & Automotive'],
    [/\b(real estate|property|mortgage|reit|construction|building|housing)\b/, 'Real Estate & Construction'],
    [/\b(media|entertainment|streaming|broadcast|publish|news|disney|netflix|warner|spotify)\b/, 'Media & Entertainment'],
    [/\b(transport|logistics|shipping|freight|supply chain|fedex|ups|maersk|warehouse)\b/, 'Transportation & Logistics'],
    [/\b(consult|advisory|deloitte|accenture|mckinsey|kpmg|pwc|ernst|ey |bain|bcg)\b/, 'Consulting & Professional Services'],
    [/\b(saas|software|cloud|platform|devops|api|microsoft|google|apple|meta|oracle|salesforce|adobe|sap|ibm|cisco|intel|nvidia|aws|azure|gcp)\b/, 'Technology & Software'],
    [/\b(cyber|security|infosec|soc |siem|penetration|vulnerability|threat|firewall|endpoint)\b/, 'Cybersecurity'],
    [/\b(data|analytics|machine learning|artificial intelligence| ai |ml |deep learning|nlp)\b/, 'Data Science & AI'],
  ];

  for (const [regex, industry] of patterns) {
    if (regex.test(all)) return industry;
  }
  return 'Technology';
}

function parseEducationLevel(education: any): string | null {
  const text = (Array.isArray(education) ? education.map((e: any) => typeof e === 'string' ? e : e.degree || e.field || '').join(' ') : String(education || '')).toLowerCase();
  if (/\b(ph\.?d|doctorate|doctoral)\b/.test(text)) return 'phd';
  if (/\b(master|mba|m\.s\.|m\.a\.|msc|ma )\b/.test(text)) return 'masters';
  if (/\b(bachelor|b\.s\.|b\.a\.|bsc|ba |bba)\b/.test(text)) return 'bachelors';
  if (/\b(associate|a\.s\.|a\.a\.)\b/.test(text)) return 'associates';
  return null;
}

function estimateYearsFromDates(experience: any[]): number {
  if (!Array.isArray(experience)) return 0;

  // Try duration_years first
  const fromDuration = experience.reduce((total: number, exp: any) => total + (exp.duration_years || 0), 0);
  if (fromDuration > 0) return Math.round(fromDuration);

  // Try date parsing
  let minYear = Infinity;
  let maxYear = -Infinity;
  for (const exp of experience) {
    const dateStr = exp.dates || exp.date_range || exp.duration || '';
    const yearMatches = dateStr.match(/\b(19|20)\d{2}\b/g);
    if (yearMatches) {
      for (const y of yearMatches) {
        const year = parseInt(y, 10);
        if (year < minYear) minYear = year;
        if (year > maxYear) maxYear = year;
      }
    }
    if (/present|current/i.test(dateStr)) {
      maxYear = new Date().getFullYear();
    }
  }
  if (minYear !== Infinity && maxYear !== -Infinity) {
    return Math.max(1, maxYear - minYear);
  }
  return 0;
}

function autoPopulateFromResume(
  data: any,
  setCurrentRole: (v: string) => void,
  setCurrentIndustry: (v: string) => void,
  setYearsExperience: (v: number) => void,
  setEducationLevel: (v: string) => void,
  setStrengths: (v: string[]) => void,
  setTools?: (v: string[]) => void,
  setExistingCertifications?: (v: string[]) => void,
) {
  let experience = data.experience || [];
  let skills = data.skills || [];

  // Parse stringified JSON arrays
  if (typeof experience === 'string') {
    try { experience = JSON.parse(experience); } catch { experience = []; }
  }
  if (typeof skills === 'string') {
    try { skills = JSON.parse(skills); } catch { skills = []; }
  }

  // Set current role from latest position
  if (Array.isArray(experience) && experience.length > 0) {
    const first = experience[0];
    const title = first.title || first.position || first.role || first.job_title || '';
    const company = first.company || '';
    if (title) setCurrentRole(title);
    if (company || title) {
      setCurrentIndustry(inferIndustry(company, title, skills));
    }
  }

  // Calculate years of experience
  const years = estimateYearsFromDates(experience);
  if (years > 0) setYearsExperience(years);

  // Determine education level
  const eduLevel = parseEducationLevel(data.education);
  if (eduLevel) setEducationLevel(eduLevel);

  // Infer top strengths
  const inferredStrengths = inferStrengths(experience, skills, data.summary || '');
  if (inferredStrengths.length > 0) setStrengths(inferredStrengths);

  // Pre-fill tools from skills/technologies
  if (setTools && Array.isArray(skills) && skills.length > 0) {
    const toolsFromSkills = skills.slice(0, 5).map((s: any) => typeof s === 'string' ? s : s.name || '');
    if (toolsFromSkills.filter((t: string) => t).length > 0) {
      setTools(toolsFromSkills.filter((t: string) => t));
    }
  }

  // Pre-fill certifications from resume
  if (setExistingCertifications && data.certifications) {
    let certs: string[] = [];
    if (typeof data.certifications === 'string' && data.certifications.trim()) {
      // Backend returns newline-separated string
      certs = data.certifications.split('\n').map((c: string) => c.trim()).filter((c: string) => c);
    } else if (Array.isArray(data.certifications)) {
      certs = data.certifications.map((c: any) => typeof c === 'string' ? c.trim() : '').filter((c: string) => c);
    }
    if (certs.length > 0) {
      setExistingCertifications(certs);
    }
  }
}

export default function CareerPathDesignerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();
  const { capture } = usePostHog();

  // Resume store
  const {
    resumes: existingResumes,
    loading: loadingResumes,
    fetchResumes,
  } = useResumeStore();

  const [step, setStep] = useState<WizardStep>('welcome');
  const [questionStep, setQuestionStep] = useState<QuestionStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [plan, setPlan] = useState<CareerPlan>();

  // Saved career plans
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [loadingSavedPlans, setLoadingSavedPlans] = useState(false);

  // Feature #13: Career Trajectory Analysis
  const [trajectoryAnalysis, setTrajectoryAnalysis] = useState<any>(null);
  const [loadingTrajectory, setLoadingTrajectory] = useState(false);

  // Feature #14: Skill Gaps Analysis
  const [skillGaps, setSkillGaps] = useState<any>(null);
  const [loadingSkillGaps, setLoadingSkillGaps] = useState(false);

  // Feature #15: Detailed Career Plan
  const [showDetailedPlan, setShowDetailedPlan] = useState(false);

  // Async job status
  const [jobId, setJobId] = useState<string>();
  const [jobProgress, setJobProgress] = useState<number>(0);
  const [jobMessage, setJobMessage] = useState<string>('');

  // Resume upload
  const [resumeFile, setResumeFile] = useState<any>(null);
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Basic Profile (Step 1)
  const [dreamRole, setDreamRole] = useState('');
  const [dreamRoleMethod, setDreamRoleMethod] = useState<'type' | 'url' | null>(null);
  const [jobUrl, setJobUrl] = useState('');
  const [extractingJob, setExtractingJob] = useState(false);
  const [currentRole, setCurrentRole] = useState('');
  const [currentIndustry, setCurrentIndustry] = useState('');
  const [yearsExperience, setYearsExperience] = useState(5);
  const [educationLevel, setEducationLevel] = useState('bachelors');
  const [topTasks, setTopTasks] = useState<string[]>(['', '', '']);
  const [strengths, setStrengths] = useState<string[]>(['', '']);
  const [currentSalaryRange, setCurrentSalaryRange] = useState('');
  const [dislikes, setDislikes] = useState<string[]>([]);

  // Target Role Details (Step 2)
  const [targetRoleLevel, setTargetRoleLevel] = useState('mid-level');
  const [targetIndustries, setTargetIndustries] = useState<string[]>([]);
  const [specificCompanies, setSpecificCompanies] = useState<string[]>(['']);
  const [specificTechnologiesInterest, setSpecificTechnologiesInterest] = useState<string[]>([]);

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
  const [tools, setTools] = useState<string[]>(['', '', '']);
  const [existingCertifications, setExistingCertifications] = useState<string[]>([]);
  const [trainingBudget, setTrainingBudget] = useState('');
  const [preferredPlatforms, setPreferredPlatforms] = useState<string[]>([]);
  const [certificationAreasInterest, setCertificationAreasInterest] = useState<string[]>([]);

  // Motivation & Goals (Step 5)
  const [transitionMotivation, setTransitionMotivation] = useState<string[]>([]);
  const [biggestConcern, setBiggestConcern] = useState('');
  const [alreadyStarted, setAlreadyStarted] = useState(false);
  const [stepsAlreadyTaken, setStepsAlreadyTaken] = useState('');

  // Fetch existing resumes when on upload step
  useFocusEffect(
    useCallback(() => {
      if (step === 'upload' && existingResumes.length === 0) {
        fetchResumes();
      }
    }, [step, existingResumes.length, fetchResumes])
  );

  // Load saved career plans on welcome screen
  useFocusEffect(
    useCallback(() => {
      const loadSavedPlans = async () => {
        if (step === 'welcome') {
          // Track screen view
          capture('screen_viewed', {
            screen_name: 'Career Path Designer',
            screen_type: 'core_feature',
            wizard_step: step,
          });

          setLoadingSavedPlans(true);
          try {
            const result = await api.listCareerPlans();
            if (result.success && Array.isArray(result.data)) {
              setSavedPlans(result.data);
            }
          } catch (err) {
            console.error('Failed to load saved career plans:', err);
          } finally {
            setLoadingSavedPlans(false);
          }
        }
      };
      loadSavedPlans();
    }, [step, capture])
  );

  // Load a saved career plan
  const handleLoadSavedPlan = async (planId: number) => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await api.getCareerPlan(planId);
      if (result.success && result.data) {
        const planData = result.data;
        const transformed = transformApiResponse(planData.plan || planData);
        setPlan({ ...transformed, id: planId } as any);
        // Set the context from saved plan
        if (planData.current_role) setCurrentRole(planData.current_role);
        if (planData.target_role) setDreamRole(planData.target_role);
        if (planData.timeline) setTimeline(planData.timeline);
        setStep('results');
      } else {
        setError('Failed to load career plan');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load career plan');
    } finally {
      setLoading(false);
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

      // Auto-fill fields from resume using inference functions
      const parsedData = resumeResult.data.parsed_data || resumeResult.data;
      if (parsedData) {
        autoPopulateFromResume(
          parsedData,
          setCurrentRole,
          setCurrentIndustry,
          setYearsExperience,
          setEducationLevel,
          setStrengths,
          setTools,
          setExistingCertifications,
        );
      }

      setTimeout(() => setStep('questions'), 500);
    } catch (error: any) {
      setError(error.message || 'Failed to load resume');
      setUploadProgress(0);
    }
  };

  const handleFileSelect = async () => {
    if (!DocumentPicker) {
      Alert.alert('Unavailable', 'Document picker requires a new native build. Please rebuild the app.');
      return;
    }
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

      // Create FormData with file
      const formData = new FormData();
      // @ts-ignore - FormData append in React Native accepts this structure
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/pdf',
      });

      // Use updated uploadResume method with direct fetch + explicit auth headers
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

      // Auto-fill from parsed data using intelligence functions
      if (uploadResult.data.parsed_data) {
        autoPopulateFromResume(
          uploadResult.data.parsed_data,
          setCurrentRole,
          setCurrentIndustry,
          setYearsExperience,
          setEducationLevel,
          setStrengths,
          setTools,
          setExistingCertifications,
        );
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
        // Basic Profile
        current_role_title: currentRole || dreamRole,
        current_industry: currentIndustry || 'General',
        years_experience: yearsExperience,
        education_level: educationLevel,
        top_tasks: topTasks.filter(t => t.trim()),
        tools: tools.filter(t => t.trim()),
        strengths: strengths.filter(s => s.trim()),
        dislikes: dislikes,

        // Target Role
        target_role_interest: dreamRole,
        target_role_level: targetRoleLevel,
        target_industries: targetIndustries,
        specific_companies: specificCompanies.filter(c => c.trim()),
        job_url: jobUrl.trim() || undefined,

        // Timeline & Availability
        time_per_week: timePerWeek,
        timeline: timeline,
        current_employment_status: currentEmploymentStatus,

        // Location & Work Preferences
        location: location || 'Remote',
        willing_to_relocate: willingToRelocate,
        in_person_vs_remote: inPersonVsRemote,

        // Learning Preferences
        learning_style: learningStyle,
        preferred_platforms: preferredPlatforms,
        technical_background: technicalBackground,
        specific_technologies_interest: specificTechnologiesInterest,
        certification_areas_interest: certificationAreasInterest,

        // Motivation & Goals
        transition_motivation: transitionMotivation,

        // Enhanced fields
        current_salary_range: currentSalaryRange || undefined,
        existing_certifications: existingCertifications.filter(c => c.trim()),
        training_budget: trainingBudget || undefined,
        biggest_concern: biggestConcern || undefined,
        already_started: alreadyStarted,
        steps_already_taken: stepsAlreadyTaken.trim() || undefined,
      };

      // Try async generation first (better results with web research)
      setJobMessage('Starting career analysis with AI research...');
      setJobProgress(10);

      const asyncResult = await api.generateCareerPlanAsync(intake);

      if (asyncResult.success && asyncResult.data?.job_id) {
        // Async generation started - poll for results
        const asyncJobId = asyncResult.data.job_id;
        setJobId(asyncJobId);
        setJobMessage('Researching industry trends and opportunities...');
        setJobProgress(20);

        // Poll for job completion
        const pollInterval = 3000; // 3 seconds
        const maxPolls = 60; // Max 3 minutes
        let pollCount = 0;

        const pollForResults = async () => {
          pollCount++;
          const statusResult = await api.getCareerPlanJobStatus(asyncJobId);

          if (!statusResult.success) {
            // If job not found (404), stop polling and show error
            setError(statusResult.error || 'Failed to get job status');
            setStep('questions');
            setLoading(false);
            return;
          }

          const status = statusResult.data?.status;
          const progress = statusResult.data?.progress || 0;

          // Update progress and message based on status
          if (status === 'processing') {
            const progressMessages = [
              'Analyzing your background...',
              'Researching target role requirements...',
              'Identifying skill gaps...',
              'Finding relevant certifications...',
              'Discovering networking opportunities...',
              'Building your personalized roadmap...',
            ];
            const msgIndex = Math.min(Math.floor(progress / 20), progressMessages.length - 1);
            setJobMessage(progressMessages[msgIndex]);
            setJobProgress(20 + Math.min(progress * 0.7, 70)); // Cap at 90%

            if (pollCount < maxPolls) {
              setTimeout(pollForResults, pollInterval);
            } else {
              setError('Career plan generation timed out. Please try again.');
              setStep('questions');
              setLoading(false);
            }
          } else if (status === 'completed') {
            // Success - process the results
            setJobProgress(100);
            setJobMessage('Career plan generated!');

            const planRaw = statusResult.data?.plan || statusResult.data;
            const transformed = transformApiResponse(planRaw);
            setPlan({ ...transformed, id: statusResult.data?.planId } as any);

            // Track successful career plan generation
            capture('career_plan_generated', {
              screen_name: 'Career Path Designer',
              generation_method: 'async',
              current_role: currentRole || dreamRole,
              target_role: dreamRole,
              timeline: timeline,
              has_resume: !!resumeId,
              plan_id: statusResult.data?.planId,
            });

            setStep('results');
            setLoading(false);
          } else if (status === 'failed') {
            setError(statusResult.data?.error || 'Career plan generation failed');
            setStep('questions');
            setLoading(false);
          }
        };

        // Start polling
        setTimeout(pollForResults, pollInterval);
      } else {
        // Async failed, fall back to sync generation
        console.log('Async generation not available, falling back to sync...');
        setJobMessage('Generating your personalized career plan...');
        setJobProgress(30);

        const result = await api.generateCareerPlan({
          currentRole: currentRole || 'Current Position',
          targetRole: dreamRole,
          resumeId: resumeId || undefined,
        });

        if (!result.success) {
          const errorMsg = result.error || 'Failed to generate career plan';
          setError(`Generation failed: ${errorMsg}`);
          setStep('questions');
          setLoading(false);
          return;
        }

        setJobProgress(100);
        setJobMessage('Career plan generated!');

        // Map API response to full CareerPlan format
        const planRaw = result.data?.plan || result.data;
        const transformed = transformApiResponse(planRaw);
        setPlan({ ...transformed, id: result.data?.planId || result.data?.plan_id } as any);

        // Track successful career plan generation
        capture('career_plan_generated', {
          screen_name: 'Career Path Designer',
          generation_method: 'sync',
          current_role: currentRole || dreamRole,
          target_role: dreamRole,
          timeline: timeline,
          has_resume: !!resumeId,
          plan_id: result.data?.planId || result.data?.plan_id,
        });

        setStep('results');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setStep('questions');
      setLoading(false);
    }
  };

  const handleNextQuestionStep = async () => {
    // Validate current step
    if (questionStep === 1) {
      const validTopTasks = topTasks.filter(t => t.trim()).length >= 3;
      const validStrengths = strengths.filter(s => s.trim()).length >= 2;

      // If user has a job URL but no dream role, try to extract it first
      if (!dreamRole.trim() && jobUrl.trim()) {
        setExtractingJob(true);
        try {
          const result = await api.extractJobDetails(jobUrl.trim());
          if (result.success && result.data) {
            const title = result.data.job_title || result.data.title || result.data.Title || '';
            if (title) {
              setDreamRole(title);
              // Continue validation with extracted title
            } else {
              setError('Could not extract role from URL. Please enter your dream role manually.');
              setExtractingJob(false);
              return;
            }
          } else {
            setError('Could not extract role from URL. Please enter your dream role manually.');
            setExtractingJob(false);
            return;
          }
        } catch (err) {
          setError('Could not extract role from URL. Please enter your dream role manually.');
          setExtractingJob(false);
          return;
        } finally {
          setExtractingJob(false);
        }
      } else if (!dreamRole.trim()) {
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

  // Feature #13: Analyze Career Trajectory
  const handleAnalyzeTrajectory = async () => {
    if (!resumeId) {
      Alert.alert('Resume Required', 'Please upload a resume first to analyze your career trajectory.');
      return;
    }

    setLoadingTrajectory(true);
    try {
      const result = await api.analyzeCareerTrajectory({
        resumeId: resumeId,
        targetRole: dreamRole,
        industry: currentIndustry,
      });

      if (result.success && result.data) {
        setTrajectoryAnalysis(result.data);
      } else {
        Alert.alert('Analysis Failed', result.error || 'Could not analyze career trajectory');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze trajectory');
    } finally {
      setLoadingTrajectory(false);
    }
  };

  // Feature #14: Get Skill Gaps Analysis
  const handleAnalyzeSkillGaps = async () => {
    if (!resumeId || !dreamRole) {
      Alert.alert('Information Required', 'Please upload a resume and provide your target role.');
      return;
    }

    setLoadingSkillGaps(true);
    try {
      const result = await api.getSkillGaps({
        resumeId: resumeId,
        targetRole: dreamRole,
      });

      if (result.success && result.data) {
        setSkillGaps(result.data);
      } else {
        Alert.alert('Analysis Failed', result.error || 'Could not analyze skill gaps');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze skill gaps');
    } finally {
      setLoadingSkillGaps(false);
    }
  };

  // Feature #15: Generate Detailed Career Plan
  const handleGenerateDetailedPlan = async () => {
    if (!resumeId || !dreamRole || !currentRole) {
      Alert.alert('Information Required', 'Please complete all required fields first.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.generateDetailedCareerPlan({
        resumeId: resumeId,
        currentRole: currentRole,
        targetRole: dreamRole,
        timeline: timeline,
      });

      if (result.success && result.data) {
        setPlan(result.data as any);
        setShowDetailedPlan(true);
        setStep('results');
      } else {
        Alert.alert('Generation Failed', result.error || 'Could not generate detailed career plan');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate career plan');
    } finally {
      setLoading(false);
    }
  };

  // Welcome Screen
  if (step === 'welcome') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.welcomeContainer}>
            <View style={[styles.welcomeBadge, { backgroundColor: colors.glass }]}>
              <Sparkles color={COLORS.primary} size={20} />
              <Text style={[styles.welcomeBadgeText, { color: colors.text }]}>AI-Powered Career Planning</Text>
            </View>

            <Text style={[styles.welcomeTitle, { color: colors.text }]}>Design Your Career Transition Path</Text>

            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
              Upload your resume and complete our comprehensive assessment. Get a personalized roadmap with certifications, study materials, tech stacks, and networking events.
            </Text>

            <View style={styles.featureGrid}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Upload color="#10B981" size={32} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Upload Resume</Text>
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>We analyze your experience automatically</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Target color="#F59E0B" size={32} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Detailed Assessment</Text>
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>Comprehensive questionnaire for best fit</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <TrendingUp color="#8B5CF6" size={32} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Actionable Plan</Text>
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>Real certifications, events, and resources</Text>
              </View>
            </View>

            {/* Saved Career Plans Section */}
            {savedPlans.length > 0 && (
              <View style={styles.savedPlansSection}>
                <View style={styles.savedPlansHeader}>
                  <FolderOpen color={COLORS.primary} size={20} />
                  <Text style={[styles.savedPlansTitle, { color: colors.text }]}>Your Saved Career Plans</Text>
                </View>
                {loadingSavedPlans ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  savedPlans.slice(0, 3).map((savedPlan: any) => (
                    <TouchableOpacity
                      key={savedPlan.id}
                      style={[styles.savedPlanItem, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                      onPress={() => handleLoadSavedPlan(savedPlan.id)}
                    >
                      <View style={styles.savedPlanIcon}>
                        <Briefcase color={COLORS.primary} size={20} />
                      </View>
                      <View style={styles.savedPlanInfo}>
                        <Text style={[styles.savedPlanRole, { color: colors.text }]} numberOfLines={1}>
                          {savedPlan.target_roles?.[0] || savedPlan.target_role || savedPlan.targetRole || 'Career Plan'}
                        </Text>
                        <Text style={[styles.savedPlanDate, { color: colors.textSecondary }]}>
                          {savedPlan.created_at ? new Date(savedPlan.created_at).toLocaleDateString() : 'Saved'}
                        </Text>
                      </View>
                      <ChevronRight color={colors.textSecondary} size={20} />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.text }]}
              onPress={() => setStep('upload')}
            >
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                {savedPlans.length > 0 ? 'Create New Plan' : 'Get Started'}
              </Text>
              <ChevronRight color={colors.background} size={20} />
            </TouchableOpacity>

            <Text style={[styles.welcomeFooter, { color: colors.textTertiary }]}>Takes 10-15 minutes for comprehensive assessment</Text>
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
            <Text style={[styles.screenTitle, { color: colors.text }]}>Upload Your Resume</Text>
            <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
              We'll automatically extract your skills, experience, and background
            </Text>

            {/* Existing resumes */}
            {existingResumes.length > 0 && !resumeFile && (
              <>
                <View style={styles.sectionContainer}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Select from Your Previous Resumes</Text>
                  {loadingResumes ? (
                    <ActivityIndicator size="large" color={COLORS.primary} />
                  ) : (
                    existingResumes.map((resume: any) => (
                      <TouchableOpacity
                        key={resume.id}
                        style={[styles.resumeItem, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                        onPress={() => handleSelectExistingResume(resume.id)}
                      >
                        <View style={styles.resumeInfo}>
                          <Text style={[styles.resumeName, { color: colors.text }]}>{resume.filename || `Resume ${resume.id}`}</Text>
                          <Text style={[styles.resumeDate, { color: colors.textSecondary }]}>
                            Uploaded {new Date(resume.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                        <ChevronRight color={colors.textSecondary} size={20} />
                      </TouchableOpacity>
                    ))
                  )}
                </View>

                <View style={styles.divider}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.glassBorder }]} />
                  <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.glassBorder }]} />
                </View>
              </>
            )}

            {/* Upload zone */}
            <TouchableOpacity
              style={[styles.uploadZone, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
              onPress={handleFileSelect}
              disabled={uploadProgress > 0 && uploadProgress < 100}
            >
              {!resumeFile ? (
                <>
                  <Upload color={COLORS.primary} size={48} />
                  <Text style={[styles.uploadTitle, { color: colors.text }]}>Tap to select your resume</Text>
                  <Text style={[styles.uploadSubtext, { color: colors.textSecondary }]}>Supports PDF, DOC, and DOCX files</Text>
                </>
              ) : uploadProgress < 100 ? (
                <>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={[styles.uploadTitle, { color: colors.text }]}>Analyzing your resume...</Text>
                  <Text style={[styles.uploadSubtext, { color: colors.textSecondary }]}>{uploadProgress}% complete</Text>
                </>
              ) : (
                <>
                  <View style={[styles.checkIcon, { backgroundColor: colors.backgroundTertiary }]}>
                    <Check color={COLORS.success} size={32} />
                  </View>
                  <Text style={[styles.uploadTitle, { color: colors.text }]}>Resume uploaded successfully!</Text>
                  <Text style={[styles.uploadSubtext, { color: colors.textSecondary }]}>{resumeFile.name}</Text>
                </>
              )}
            </TouchableOpacity>

            {error && (
              <View style={[styles.errorBox, { backgroundColor: colors.glass }]}>
                <X color={COLORS.danger} size={20} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep('welcome')}
              >
                <ArrowLeft color={colors.textSecondary} size={20} />
                <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.text }, !resumeFile && styles.secondaryButton]}
                onPress={() => setStep('questions')}
              >
                <Text style={[styles.primaryButtonText, { color: colors.background }, !resumeFile && styles.secondaryButtonText]}>
                  {resumeFile ? 'Continue' : 'Skip'}
                </Text>
                <ChevronRight color={resumeFile ? colors.background : COLORS.primary} size={20} />
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
                    { backgroundColor: colors.backgroundTertiary },
                    questionStep === num && styles.stepDotActive,
                    questionStep > num && [styles.stepDotCompleted, { backgroundColor: colors.text }],
                  ]}
                >
                  {questionStep > num ? (
                    <Check color={colors.background} size={16} />
                  ) : (
                    <Text style={[styles.stepDotText, { color: colors.textSecondary }]}>{num}</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Step content */}
            {questionStep === 1 && (
              <View>
                <View style={styles.stepHeader}>
                  <View style={[styles.stepIcon, { backgroundColor: colors.backgroundTertiary }]}>
                    <Target color={COLORS.primary} size={32} />
                  </View>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Basic Profile</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>Tell us about your current role and dream career</Text>
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>How would you like to target your next role?</Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                      <TouchableOpacity
                        style={[
                          styles.chip,
                          { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
                          dreamRoleMethod === 'type' && styles.chipSelected,
                        ]}
                        onPress={() => setDreamRoleMethod(dreamRoleMethod === 'type' ? null : 'type')}
                      >
                        <Lightbulb size={16} color={dreamRoleMethod === 'type' ? colors.background : colors.text} />
                        <Text style={[styles.chipText, { color: colors.text }, dreamRoleMethod === 'type' && { color: colors.background }]}>I know my role</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.chip,
                          { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
                          dreamRoleMethod === 'url' && styles.chipSelected,
                        ]}
                        onPress={() => setDreamRoleMethod(dreamRoleMethod === 'url' ? null : 'url')}
                      >
                        <Link2 size={16} color={dreamRoleMethod === 'url' ? colors.background : colors.text} />
                        <Text style={[styles.chipText, { color: colors.text }, dreamRoleMethod === 'url' && { color: colors.background }]}>I have a job posting</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {dreamRoleMethod === 'type' && (
                    <View style={styles.formGroup}>
                      <Text style={[styles.label, { color: colors.text }]}>Dream Role or Career Goal *</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder, color: colors.text }]}
                        value={dreamRole}
                        onChangeText={setDreamRole}
                        placeholder="e.g., Senior Cloud Security Architect"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>
                  )}

                  {dreamRoleMethod === 'url' && (
                    <View style={styles.formGroup}>
                      <Text style={[styles.label, { color: colors.text }]}>Job Posting URL</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder, color: colors.text }]}
                        value={jobUrl}
                        onChangeText={setJobUrl}
                        placeholder="https://linkedin.com/jobs/... or any job posting URL"
                        placeholderTextColor={colors.textTertiary}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                      />
                      <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 4 }}>Job details will be extracted automatically</Text>

                      <View style={{ marginTop: 12 }}>
                        <Text style={[styles.label, { color: colors.text }]}>
                          Dream Role{' '}
                          <Text style={{ fontFamily: FONTS.regular, fontSize: 11, color: colors.textSecondary }}>(auto-filled from URL or enter manually)</Text>
                          {extractingJob && <Text style={{ fontFamily: FONTS.regular, fontSize: 11, color: colors.textSecondary }}> extracting...</Text>}
                        </Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder, color: colors.text }]}
                          value={dreamRole}
                          onChangeText={setDreamRole}
                          placeholder="e.g., Senior Cloud Security Architect"
                          placeholderTextColor={colors.textTertiary}
                        />
                      </View>

                      {jobUrl.trim() && !dreamRole.trim() && (
                        <TouchableOpacity
                          style={[styles.chip, styles.chipSelected, { marginTop: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16 }]}
                          onPress={async () => {
                            setExtractingJob(true);
                            try {
                              const result = await api.extractJobDetails(jobUrl.trim());
                              if (result.success && result.data) {
                                const title = result.data.job_title || result.data.title || result.data.Title || '';
                                if (title) setDreamRole(title);
                              }
                            } catch (err) {
                              // Extraction failed silently - user can type manually
                            } finally {
                              setExtractingJob(false);
                            }
                          }}
                          disabled={extractingJob}
                        >
                          {extractingJob ? (
                            <ActivityIndicator size="small" color={colors.background} />
                          ) : (
                            <Sparkles size={14} color={colors.background} />
                          )}
                          <Text style={[styles.chipText, { color: colors.background }]}>
                            {extractingJob ? 'Extracting...' : 'Extract Role from URL'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* Show dream role field if no method selected yet (backward compat) */}
                  {dreamRoleMethod === null && (
                    <View style={styles.formGroup}>
                      <Text style={[styles.label, { color: colors.text }]}>Dream Role or Career Goal *</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder, color: colors.text }]}
                        value={dreamRole}
                        onChangeText={(text) => {
                          setDreamRole(text);
                          if (text.trim()) setDreamRoleMethod('type');
                        }}
                        placeholder="e.g., Senior Cloud Security Architect"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>
                  )}

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Current Role Title</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder, color: colors.text }]}
                      value={currentRole}
                      onChangeText={setCurrentRole}
                      placeholder="e.g., IT Manager"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Current Industry</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder, color: colors.text }]}
                      value={currentIndustry}
                      onChangeText={setCurrentIndustry}
                      placeholder="e.g., Healthcare, Finance"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Years of Experience: {yearsExperience}</Text>
                    <Text style={[styles.helpText, { color: colors.textTertiary }]}>Slide to adjust</Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Education Level</Text>
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
                            { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                            educationLevel === option.value && styles.chipSelected,
                          ]}
                          onPress={() => setEducationLevel(option.value)}
                        >
                          <Text style={[
                            styles.chipText,
                            { color: colors.text },
                            educationLevel === option.value && { color: colors.background },
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Top 3-5 Tasks in Current Role *</Text>
                    {topTasks.map((task, idx) => (
                      <TextInput
                        key={idx}
                        style={[styles.input, styles.inputMargin, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder, color: colors.text }]}
                        value={task}
                        onChangeText={(text) => {
                          const newTasks = [...topTasks];
                          newTasks[idx] = text;
                          setTopTasks(newTasks);
                        }}
                        placeholder={`Task ${idx + 1}`}
                        placeholderTextColor={colors.textTertiary}
                      />
                    ))}
                    <TouchableOpacity onPress={() => setTopTasks([...topTasks, ''])}>
                      <Text style={styles.linkText}>+ Add another task</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Your Top Strengths (2-5) *</Text>
                    {strengths.map((strength, idx) => (
                      <TextInput
                        key={idx}
                        style={[styles.input, styles.inputMargin, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder, color: colors.text }]}
                        value={strength}
                        onChangeText={(text) => {
                          const newStrengths = [...strengths];
                          newStrengths[idx] = text;
                          setStrengths(newStrengths);
                        }}
                        placeholder={`Strength ${idx + 1} (e.g., Leadership)`}
                        placeholderTextColor={colors.textTertiary}
                      />
                    ))}
                    {strengths.length < 5 && (
                      <TouchableOpacity onPress={() => setStrengths([...strengths, ''])}>
                        <Text style={styles.linkText}>+ Add another strength</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Current Salary Range</Text>
                    <View style={styles.chipGrid}>
                      {[
                        'Under $40K', '$40-60K', '$60-80K', '$80-100K',
                        '$100-130K', '$130-170K', '$170K+', 'Prefer not to say',
                      ].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.chip,
                            { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                            currentSalaryRange === option && styles.chipSelected,
                          ]}
                          onPress={() => setCurrentSalaryRange(currentSalaryRange === option ? '' : option)}
                        >
                          <Text style={[
                            styles.chipText,
                            { color: colors.text },
                            currentSalaryRange === option && { color: colors.background },
                          ]}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>What do you dislike about your current work?</Text>
                    <View style={styles.chipGrid}>
                      {[
                        'Repetitive tasks', 'No growth', 'Bad management', 'Low pay',
                        'Long hours', 'No remote', 'No creativity',
                      ].map((item) => (
                        <TouchableOpacity
                          key={item}
                          style={[
                            styles.chip,
                            { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                            dislikes.includes(item) && styles.chipSelected,
                          ]}
                          onPress={() => toggleArrayItem(dislikes, setDislikes, item)}
                        >
                          <Text style={[
                            styles.chipText,
                            { color: colors.text },
                            dislikes.includes(item) && { color: colors.background },
                          ]}>
                            {item}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {questionStep === 2 && (
              <View>
                <View style={styles.stepHeader}>
                  <View style={[styles.stepIcon, { backgroundColor: colors.backgroundTertiary }]}>
                    <Building color={COLORS.primary} size={32} />
                  </View>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Target Role Details</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>Help us understand your career aspirations</Text>
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Desired Career Level</Text>
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
                            { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                            targetRoleLevel === option.value && styles.chipSelected,
                          ]}
                          onPress={() => setTargetRoleLevel(option.value)}
                        >
                          <Text style={[
                            styles.chipText,
                            { color: colors.text },
                            targetRoleLevel === option.value && { color: colors.background },
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Target Industries (Select all that apply)</Text>
                    <View style={styles.chipGrid}>
                      {[
                        'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
                        'Manufacturing', 'Government', 'Consulting', 'Non-Profit', 'Other',
                      ].map((industry) => (
                        <TouchableOpacity
                          key={industry}
                          style={[
                            styles.chip,
                            { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                            targetIndustries.includes(industry) && styles.chipSelected,
                          ]}
                          onPress={() => toggleArrayItem(targetIndustries, setTargetIndustries, industry)}
                        >
                          <Text style={[
                            styles.chipText,
                            { color: colors.text },
                            targetIndustries.includes(industry) && { color: colors.background },
                          ]}>
                            {industry}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Dream Companies (up to 3)</Text>
                    {specificCompanies.map((company, idx) => (
                      <TextInput
                        key={idx}
                        style={[styles.input, styles.inputMargin, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder, color: colors.text }]}
                        value={company}
                        onChangeText={(text) => {
                          const updated = [...specificCompanies];
                          updated[idx] = text;
                          setSpecificCompanies(updated);
                        }}
                        placeholder={`Company ${idx + 1} (e.g., Google)`}
                        placeholderTextColor={colors.textTertiary}
                      />
                    ))}
                    {specificCompanies.length < 3 && (
                      <TouchableOpacity onPress={() => setSpecificCompanies([...specificCompanies, ''])}>
                        <Text style={styles.linkText}>+ Add another company</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Technologies You Want to Work With</Text>
                    <View style={styles.chipGrid}>
                      {[
                        'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js',
                        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
                        'AI/ML', 'Data Science', 'Cybersecurity', 'Blockchain',
                      ].map((tech) => (
                        <TouchableOpacity
                          key={tech}
                          style={[
                            styles.chip,
                            { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                            specificTechnologiesInterest.includes(tech) && styles.chipSelected,
                          ]}
                          onPress={() => toggleArrayItem(specificTechnologiesInterest, setSpecificTechnologiesInterest, tech)}
                        >
                          <Text style={[
                            styles.chipText,
                            { color: colors.text },
                            specificTechnologiesInterest.includes(tech) && { color: colors.background },
                          ]}>
                            {tech}
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
                  <View style={[styles.stepIcon, { backgroundColor: colors.backgroundTertiary }]}>
                    <Clock color={COLORS.primary} size={32} />
                  </View>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Work Preferences</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>Your availability and work style</Text>
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Transition Timeline</Text>
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
                            { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                            timeline === option.value && styles.chipSelected,
                          ]}
                          onPress={() => setTimeline(option.value)}
                        >
                          <Text style={[
                            styles.chipText,
                            { color: colors.text },
                            timeline === option.value && { color: colors.background },
                          ]}>
                            {option.label}
                          </Text>
                          <Text style={[styles.chipSubtext, { color: colors.textTertiary }]}>{option.desc}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Hours per Week Available: {timePerWeek} hrs/week</Text>
                    <Text style={[styles.helpText, { color: colors.textTertiary }]}>Slide to adjust (5-40 hours)</Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Current Employment Status</Text>
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
                            { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                            currentEmploymentStatus === option.value && styles.chipSelected,
                          ]}
                          onPress={() => setCurrentEmploymentStatus(option.value)}
                        >
                          <Text style={[
                            styles.chipText,
                            { color: colors.text },
                            currentEmploymentStatus === option.value && { color: colors.background },
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Your Location</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder, color: colors.text }]}
                      value={location}
                      onChangeText={setLocation}
                      placeholder="e.g., Austin, TX or Remote"
                      placeholderTextColor={colors.textTertiary}
                    />
                    <Text style={[styles.helpText, { color: colors.textTertiary }]}>Helps us find local networking events</Text>
                  </View>

                  <View style={styles.formGroup}>
                    <View style={styles.switchRow}>
                      <Text style={[styles.label, { color: colors.text }]}>Willing to relocate for opportunities</Text>
                      <Switch
                        value={willingToRelocate}
                        onValueChange={setWillingToRelocate}
                        trackColor={{ false: colors.glassBorder, true: COLORS.primary }}
                        thumbColor={colors.text}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Work Preference</Text>
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
                            { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                            inPersonVsRemote === option.value && styles.chipSelected,
                          ]}
                          onPress={() => setInPersonVsRemote(option.value)}
                        >
                          <Text style={[
                            styles.chipText,
                            { color: colors.text },
                            inPersonVsRemote === option.value && { color: colors.background },
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
                  <View style={[styles.stepIcon, { backgroundColor: colors.backgroundTertiary }]}>
                    <GraduationCap color={COLORS.primary} size={32} />
                  </View>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Learning Preferences</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>How you learn best</Text>
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Preferred Learning Styles (Select all that apply) *</Text>
                    <View style={styles.chipGrid}>
                      {[
                        { value: 'video-courses', label: 'Video Courses', Icon: Video },
                        { value: 'reading-books', label: 'Reading Books', Icon: BookOpen },
                        { value: 'hands-on-projects', label: 'Hands-On Projects', Icon: Wrench },
                        { value: 'bootcamp', label: 'Bootcamp', Icon: GraduationCap },
                        { value: 'mentorship', label: 'Mentorship', Icon: Users },
                        { value: 'self-paced', label: 'Self-Paced', Icon: Clock },
                      ].map((option) => {
                        const isSelected = learningStyle.includes(option.value);
                        const itemColor = isSelected ? colors.background : colors.text;
                        return (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.chipLarge,
                              { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                              isSelected && styles.chipSelected,
                            ]}
                            onPress={() => toggleArrayItem(learningStyle, setLearningStyle, option.value)}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <option.Icon size={16} color={itemColor} />
                              <Text style={[styles.chipText, { color: itemColor }]}>
                                {option.label}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Technical Background</Text>
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
                            { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                            technicalBackground === option.value && styles.chipSelected,
                          ]}
                          onPress={() => setTechnicalBackground(option.value)}
                        >
                          <Text style={[
                            styles.chipText,
                            { color: colors.text },
                            technicalBackground === option.value && { color: colors.background },
                          ]}>
                            {option.label}
                          </Text>
                          <Text style={[styles.chipSubtext, { color: colors.textTertiary }]}>{option.desc}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Tools/Software You Use Daily</Text>
                    {tools.map((tool, idx) => (
                      <TextInput
                        key={idx}
                        style={[styles.input, styles.inputMargin, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder, color: colors.text }]}
                        value={tool}
                        onChangeText={(text) => {
                          const updated = [...tools];
                          updated[idx] = text;
                          setTools(updated);
                        }}
                        placeholder={`Tool ${idx + 1} (e.g., Jira, Excel, Python)`}
                        placeholderTextColor={colors.textTertiary}
                      />
                    ))}
                    {tools.length < 8 && (
                      <TouchableOpacity onPress={() => setTools([...tools, ''])}>
                        <Text style={styles.linkText}>+ Add another tool</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Certifications You Already Hold</Text>
                    {existingCertifications.length === 0 ? (
                      <TouchableOpacity onPress={() => setExistingCertifications([''])}>
                        <Text style={styles.linkText}>+ Add a certification</Text>
                      </TouchableOpacity>
                    ) : (
                      <>
                        {existingCertifications.map((cert, idx) => (
                          <TextInput
                            key={idx}
                            style={[styles.input, styles.inputMargin, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder, color: colors.text }]}
                            value={cert}
                            onChangeText={(text) => {
                              const updated = [...existingCertifications];
                              updated[idx] = text;
                              setExistingCertifications(updated);
                            }}
                            placeholder={`Cert ${idx + 1} (e.g., PMP, AWS SAA)`}
                            placeholderTextColor={colors.textTertiary}
                          />
                        ))}
                        {existingCertifications.length < 10 && (
                          <TouchableOpacity onPress={() => setExistingCertifications([...existingCertifications, ''])}>
                            <Text style={styles.linkText}>+ Add another certification</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Training Budget</Text>
                    <View style={styles.chipGrid}>
                      {[
                        'Under $500', '$500-2K', '$2K-5K', '$5K+', 'Employer pays',
                      ].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.chip,
                            { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                            trainingBudget === option && styles.chipSelected,
                          ]}
                          onPress={() => setTrainingBudget(trainingBudget === option ? '' : option)}
                        >
                          <Text style={[
                            styles.chipText,
                            { color: colors.text },
                            trainingBudget === option && { color: colors.background },
                          ]}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Preferred Learning Platforms</Text>
                    <View style={styles.chipGrid}>
                      {[
                        'Coursera', 'Udemy', 'YouTube', 'LinkedIn Learning',
                        'Pluralsight', 'edX',
                      ].map((platform) => (
                        <TouchableOpacity
                          key={platform}
                          style={[
                            styles.chip,
                            { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                            preferredPlatforms.includes(platform) && styles.chipSelected,
                          ]}
                          onPress={() => toggleArrayItem(preferredPlatforms, setPreferredPlatforms, platform)}
                        >
                          <Text style={[
                            styles.chipText,
                            { color: colors.text },
                            preferredPlatforms.includes(platform) && { color: colors.background },
                          ]}>
                            {platform}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Certification Areas of Interest</Text>
                    <View style={styles.chipGrid}>
                      {[
                        'Cloud', 'Cybersecurity', 'Data Science', 'PMP',
                        'Agile', 'DevOps', 'AI/ML',
                      ].map((area) => (
                        <TouchableOpacity
                          key={area}
                          style={[
                            styles.chip,
                            { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                            certificationAreasInterest.includes(area) && styles.chipSelected,
                          ]}
                          onPress={() => toggleArrayItem(certificationAreasInterest, setCertificationAreasInterest, area)}
                        >
                          <Text style={[
                            styles.chipText,
                            { color: colors.text },
                            certificationAreasInterest.includes(area) && { color: colors.background },
                          ]}>
                            {area}
                          </Text>
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
                  <View style={[styles.stepIcon, { backgroundColor: colors.backgroundTertiary }]}>
                    <Heart color={COLORS.primary} size={32} />
                  </View>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>Motivation & Goals</Text>
                  <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>What drives this career change</Text>
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Why are you transitioning? (Select all that apply) *</Text>
                    <View style={styles.chipGrid}>
                      {[
                        { value: 'better-pay', label: 'Better Pay', Icon: DollarSign },
                        { value: 'work-life-balance', label: 'Work-Life Balance', Icon: Scale },
                        { value: 'interesting-work', label: 'More Interesting Work', Icon: Sparkles },
                        { value: 'remote-work', label: 'Remote Work', Icon: Home },
                        { value: 'career-growth', label: 'Career Growth', Icon: TrendingUp },
                        { value: 'passion', label: 'Follow Passion', Icon: Heart },
                      ].map((option) => {
                        const isSelected = transitionMotivation.includes(option.value);
                        const itemColor = isSelected ? colors.background : colors.text;
                        return (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.chipLarge,
                              { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                              isSelected && styles.chipSelected,
                            ]}
                            onPress={() => toggleArrayItem(transitionMotivation, setTransitionMotivation, option.value)}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <option.Icon size={16} color={itemColor} />
                              <Text style={[styles.chipText, { color: itemColor }]}>
                                {option.label}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Biggest Concern About This Transition</Text>
                    <View style={styles.chipGrid}>
                      {[
                        'Not qualified enough', 'Too late to switch', "Can't afford it",
                        "Don't know where to start", 'Impostor syndrome', 'Will take too long', 'Too risky',
                      ].map((concern) => (
                        <TouchableOpacity
                          key={concern}
                          style={[
                            styles.chip,
                            { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                            biggestConcern === concern && styles.chipSelected,
                          ]}
                          onPress={() => setBiggestConcern(biggestConcern === concern ? '' : concern)}
                        >
                          <Text style={[
                            styles.chipText,
                            { color: colors.text },
                            biggestConcern === concern && { color: colors.background },
                          ]}>
                            {concern}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Have you already started transitioning?</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      <TouchableOpacity
                        style={[
                          styles.chip,
                          { backgroundColor: colors.backgroundTertiary, borderColor: isDark ? colors.glassBorder : 'transparent' },
                          alreadyStarted && styles.chipSelected,
                        ]}
                        onPress={() => setAlreadyStarted(!alreadyStarted)}
                      >
                        <Text style={[
                          styles.chipText,
                          { color: colors.text },
                          alreadyStarted && { color: colors.background },
                        ]}>
                          {alreadyStarted ? 'Yes' : 'No'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {alreadyStarted && (
                    <View style={styles.formGroup}>
                      <Text style={[styles.label, { color: colors.text }]}>What steps have you already taken?</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder, color: colors.text, minHeight: 80, textAlignVertical: 'top' }]}
                        value={stepsAlreadyTaken}
                        onChangeText={setStepsAlreadyTaken}
                        placeholder="e.g., Completed AWS Cloud Practitioner, started learning Python on Coursera..."
                        placeholderTextColor={colors.textTertiary}
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                  )}
                </View>
              </View>
            )}

            {error && (
              <View style={[styles.errorBox, { backgroundColor: colors.glass }]}>
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
                <ArrowLeft color={colors.textSecondary} size={20} />
                <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>{questionStep > 1 ? 'Previous' : 'Back'}</Text>
              </TouchableOpacity>

              {questionStep < 5 ? (
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.text }]}
                  onPress={handleNextQuestionStep}
                >
                  <Text style={[styles.primaryButtonText, { color: colors.background }]}>Continue</Text>
                  <ChevronRight color={colors.background} size={20} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.text }]}
                  onPress={handleGenerate}
                  disabled={loading}
                >
                  <Sparkles color={colors.background} size={20} />
                  <Text style={[styles.primaryButtonText, { color: colors.background }]}>Generate Plan</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={[styles.stepLabel, { color: colors.textTertiary }]}>
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
          <View style={[styles.generatingCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <View style={styles.generatingIcon}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>

            <Text style={[styles.generatingTitle, { color: colors.text }]}>Crafting Your Personalized Career Roadmap</Text>

            <Text style={[styles.generatingMessage, { color: colors.textSecondary }]}>
              {jobMessage || `Our AI is researching ${dreamRole} opportunities with real-world data...`}
            </Text>

            <Text style={[styles.generatingSubtext, { color: colors.textTertiary }]}>
              This typically takes 5-7 minutes
            </Text>

            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.backgroundTertiary }]}>
                <View style={[styles.progressFill, { width: `${jobProgress}%` }]} />
              </View>
              <Text style={[styles.progressText, { color: colors.textTertiary }]}>{jobProgress}%</Text>
            </View>

            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={[styles.stepBullet, { backgroundColor: colors.backgroundTertiary }]}>
                  {jobProgress >= 10 ? (
                    <Check color={COLORS.success} size={16} />
                  ) : (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  )}
                </View>
                <Text style={[styles.stepText, { color: colors.textSecondary }, jobProgress >= 10 && { color: colors.text }]}>
                  Researching certifications and job market data
                </Text>
              </View>

              <View style={styles.stepItem}>
                <View style={[styles.stepBullet, { backgroundColor: colors.backgroundTertiary }]}>
                  {jobProgress >= 60 ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <View style={[styles.stepDotInactive, { backgroundColor: colors.textTertiary }]} />
                  )}
                </View>
                <Text style={[styles.stepText, { color: colors.textSecondary }, jobProgress >= 60 && { color: colors.text }]}>
                  Generating personalized plan
                </Text>
              </View>

              <View style={styles.stepItem}>
                <View style={[styles.stepBullet, { backgroundColor: colors.backgroundTertiary }]}>
                  {jobProgress >= 90 ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <View style={[styles.stepDotInactive, { backgroundColor: colors.textTertiary }]} />
                  )}
                </View>
                <Text style={[styles.stepText, { color: colors.textSecondary }, jobProgress >= 90 && { color: colors.text }]}>
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
            <Text style={[styles.errorTitle, { color: colors.text }]}>Failed to Generate Plan</Text>
            <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
              We couldn't generate your career plan. Please try again.
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.text }]}
              onPress={() => {
                setStep('questions');
                setError(undefined);
              }}
            >
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>Back to Assessment</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    // Use the full CareerPlan directly
    const fullPlan = plan as CareerPlan;

    const handleExportPlan = async () => {
      Alert.alert('Export', 'Export functionality coming soon!');
    };

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.resultsHeaderBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setStep('welcome');
              setPlan(undefined);
              setDreamRole('');
              setQuestionStep(1);
            }}
          >
            <ArrowLeft color={colors.textSecondary} size={20} />
            <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>New Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Feature #13: Career Trajectory Analysis */}
        {resumeId && !trajectoryAnalysis && !loadingTrajectory && (
          <View style={styles.analysisPrompt}>
            <TouchableOpacity
              style={[styles.analyzeButton, { backgroundColor: colors.backgroundTertiary }]}
              onPress={handleAnalyzeTrajectory}
            >
              <BarChart3 color={COLORS.primary} size={20} />
              <Text style={[styles.analyzeButtonText, { color: colors.text }]}>Analyze Career Trajectory</Text>
            </TouchableOpacity>
          </View>
        )}

        {loadingTrajectory && (
          <View style={[styles.analysisCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.analysisLoadingText, { color: colors.textSecondary }]}>Analyzing your career trajectory...</Text>
          </View>
        )}

        {trajectoryAnalysis && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={[styles.analysisCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
              <View style={styles.analysisHeader}>
                <BarChart3 color={COLORS.primary} size={32} />
                <Text style={[styles.analysisTitle, { color: colors.text }]}>Career Trajectory Analysis</Text>
              </View>

              <View style={styles.analysisSection}>
                <Text style={[styles.analysisSectionTitle, { color: colors.text }]}>Current Position Assessment</Text>
                <Text style={[styles.analysisText, { color: colors.textSecondary }]}>
                  {trajectoryAnalysis.current_position_assessment}
                </Text>
              </View>

              {trajectoryAnalysis.growth_potential && (
                <View style={styles.analysisSection}>
                  <Text style={[styles.analysisSectionTitle, { color: colors.text }]}>Growth Potential</Text>
                  <View style={styles.scoreRow}>
                    <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Score:</Text>
                    <Text style={[styles.scoreValue, { color: COLORS.primary }]}>
                      {trajectoryAnalysis.growth_potential.score}/100
                    </Text>
                  </View>
                  {trajectoryAnalysis.growth_potential.factors?.map((factor: string, index: number) => (
                    <View key={index} style={styles.bulletRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={[styles.bulletText, { color: colors.text }]}>{factor}</Text>
                    </View>
                  ))}
                </View>
              )}

              {trajectoryAnalysis.trajectory_path && trajectoryAnalysis.trajectory_path.length > 0 && (
                <View style={styles.analysisSection}>
                  <Text style={[styles.analysisSectionTitle, { color: colors.text }]}>Career Path Roadmap</Text>
                  {trajectoryAnalysis.trajectory_path.map((step: any, index: number) => (
                    <View key={index} style={[styles.pathStep, { backgroundColor: colors.backgroundTertiary }]}>
                      <Text style={[styles.pathStepRole, { color: colors.text }]}>{step.role}</Text>
                      <Text style={[styles.pathStepTimeline, { color: colors.textSecondary }]}>
                        Timeline: {step.timeline}
                      </Text>
                      {step.requirements?.map((req: string, reqIndex: number) => (
                        <Text key={reqIndex} style={[styles.pathStepReq, { color: colors.textTertiary }]}>
                          • {req}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              {trajectoryAnalysis.recommended_next_steps && (
                <View style={styles.analysisSection}>
                  <Text style={[styles.analysisSectionTitle, { color: colors.text }]}>Recommended Next Steps</Text>
                  {trajectoryAnalysis.recommended_next_steps.map((step: string, index: number) => (
                    <View key={index} style={styles.bulletRow}>
                      <Check color={COLORS.success} size={16} />
                      <Text style={[styles.bulletText, { color: colors.text }]}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}

              {trajectoryAnalysis.market_insights && (
                <View style={styles.analysisSection}>
                  <Text style={[styles.analysisSectionTitle, { color: colors.text }]}>Market Insights</Text>
                  <View style={styles.insightRow}>
                    <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>Demand:</Text>
                    <Text style={[styles.insightValue, { color: trajectoryAnalysis.market_insights.demand === 'high' ? COLORS.success : COLORS.warning }]}>
                      {trajectoryAnalysis.market_insights.demand.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.insightRow}>
                    <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>Salary Range:</Text>
                    <Text style={[styles.insightValue, { color: colors.text }]}>
                      {trajectoryAnalysis.market_insights.salary_range}
                    </Text>
                  </View>
                  {trajectoryAnalysis.market_insights.top_companies?.length > 0 && (
                    <View style={styles.companiesList}>
                      <Text style={[styles.companiesLabel, { color: colors.textSecondary }]}>Top Hiring Companies:</Text>
                      <View style={styles.companiesChips}>
                        {trajectoryAnalysis.market_insights.top_companies.map((company: string, index: number) => (
                          <View key={index} style={[styles.companyChip, { backgroundColor: colors.backgroundTertiary }]}>
                            <Text style={[styles.companyChipText, { color: colors.text }]}>{company}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {/* Feature #14: Skill Gaps Analysis */}
        {resumeId && dreamRole && !skillGaps && !loadingSkillGaps && (
          <View style={styles.analysisPrompt}>
            <TouchableOpacity
              style={[styles.analyzeButton, { backgroundColor: colors.backgroundTertiary }]}
              onPress={handleAnalyzeSkillGaps}
            >
              <Lightbulb color={COLORS.primary} size={20} />
              <Text style={[styles.analyzeButtonText, { color: colors.text }]}>Analyze Skill Gaps</Text>
            </TouchableOpacity>
          </View>
        )}

        {loadingSkillGaps && (
          <View style={[styles.analysisCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.analysisLoadingText, { color: colors.textSecondary }]}>Analyzing skill gaps...</Text>
          </View>
        )}

        {skillGaps && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={[styles.analysisCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
              <View style={styles.analysisHeader}>
                <Lightbulb color={COLORS.primary} size={32} />
                <Text style={[styles.analysisTitle, { color: colors.text }]}>Skill Gaps Analysis</Text>
              </View>

              {skillGaps.identified_gaps && skillGaps.identified_gaps.length > 0 && (
                <View style={styles.analysisSection}>
                  <Text style={[styles.analysisSectionTitle, { color: colors.text }]}>Identified Skill Gaps</Text>
                  {skillGaps.identified_gaps.map((gap: any, index: number) => (
                    <View key={index} style={[styles.skillGapCard, { backgroundColor: colors.backgroundTertiary }]}>
                      <View style={styles.skillGapHeader}>
                        <Text style={[styles.skillGapName, { color: colors.text }]}>{gap.skill}</Text>
                        <View style={[
                          styles.importanceBadge,
                          { backgroundColor: gap.importance === 'critical' ? ALPHA_COLORS.danger.bg : gap.importance === 'high' ? ALPHA_COLORS.warning.bg : colors.glass }
                        ]}>
                          <Text style={[
                            styles.importanceBadgeText,
                            { color: gap.importance === 'critical' ? COLORS.danger : gap.importance === 'high' ? COLORS.warning : colors.textSecondary }
                          ]}>
                            {gap.importance.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.skillLevelRow}>
                        <Text style={[styles.skillLevelLabel, { color: colors.textSecondary }]}>Current: {gap.current_level}</Text>
                        <Text style={[styles.skillLevelLabel, { color: colors.textSecondary }]}>→</Text>
                        <Text style={[styles.skillLevelLabel, { color: COLORS.primary }]}>Target: {gap.target_level}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {skillGaps.industry_demand && (
                <View style={styles.analysisSection}>
                  <Text style={[styles.analysisSectionTitle, { color: colors.text }]}>Industry Demand</Text>
                  {skillGaps.industry_demand.trending_skills?.length > 0 && (
                    <View style={styles.trendingSection}>
                      <Text style={[styles.trendingLabel, { color: colors.textSecondary }]}>Trending Skills:</Text>
                      <View style={styles.trendingChips}>
                        {skillGaps.industry_demand.trending_skills.map((skill: string, index: number) => (
                          <View key={index} style={[styles.trendingChip, { backgroundColor: ALPHA_COLORS.success.bg }]}>
                            <TrendingUp color={COLORS.success} size={14} />
                            <Text style={[styles.trendingChipText, { color: COLORS.success }]}>{skill}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {skillGaps.learning_resources && skillGaps.learning_resources.length > 0 && (
                <View style={styles.analysisSection}>
                  <Text style={[styles.analysisSectionTitle, { color: colors.text }]}>Learning Resources</Text>
                  {skillGaps.learning_resources.map((item: any, index: number) => (
                    <View key={index} style={styles.resourceSection}>
                      <Text style={[styles.resourceSkillName, { color: colors.text }]}>{item.skill}</Text>
                      {item.resources?.map((resource: any, resIndex: number) => (
                        <View key={resIndex} style={[styles.resourceCard, { backgroundColor: colors.backgroundTertiary }]}>
                          <View style={styles.resourceHeader}>
                            <BookOpen color={COLORS.primary} size={16} />
                            <Text style={[styles.resourceType, { color: COLORS.primary }]}>{resource.type.toUpperCase()}</Text>
                          </View>
                          <Text style={[styles.resourceTitle, { color: colors.text }]}>{resource.title}</Text>
                          <Text style={[styles.resourceProvider, { color: colors.textSecondary }]}>{resource.provider}</Text>
                          {resource.duration && (
                            <Text style={[styles.resourceMeta, { color: colors.textTertiary }]}>Duration: {resource.duration}</Text>
                          )}
                          {resource.cost && (
                            <Text style={[styles.resourceMeta, { color: colors.textTertiary }]}>Cost: {resource.cost}</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              {skillGaps.priority_ranking && skillGaps.priority_ranking.length > 0 && (
                <View style={styles.analysisSection}>
                  <Text style={[styles.analysisSectionTitle, { color: colors.text }]}>Priority Ranking</Text>
                  {skillGaps.priority_ranking.map((skill: string, index: number) => (
                    <View key={index} style={styles.priorityRow}>
                      <View style={[styles.priorityNumber, { backgroundColor: COLORS.primary }]}>
                        <Text style={[styles.priorityNumberText, { color: colors.background }]}>{index + 1}</Text>
                      </View>
                      <Text style={[styles.prioritySkill, { color: colors.text }]}>{skill}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {fullPlan.targetRoles?.length > 0 ? (
          <CareerPlanResults
            plan={fullPlan}
            timeline={timeline}
            onExportPDF={handleExportPlan}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.resultsContainer}>
              <View style={[styles.resultsHeader, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <View style={[styles.resultsIcon, { backgroundColor: colors.backgroundTertiary }]}>
                  <TrendingUp color={COLORS.primary} size={32} />
                </View>
                <Text style={[styles.resultsTitle, { color: colors.text }]}>
                  Your Career Transition Plan
                </Text>
                <Text style={[styles.resultsSubtitle, { color: colors.textSecondary }]}>
                  {plan.profileSummary || 'Your personalized career transition roadmap'}
                </Text>
                {plan.generatedAt && (
                  <Text style={[styles.resultsDate, { color: colors.textTertiary }]}>
                    Generated {new Date(plan.generatedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>

              <View style={[styles.planContent, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Text style={[styles.planText, { color: colors.text }]}>
                  Plan generated successfully!
                </Text>
                <Text style={[styles.planText, { color: colors.textSecondary }]}>
                  {plan.profileSummary || 'Your career transition roadmap is ready.'}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xl,
  },
  welcomeBadgeText: {
    ...TYPOGRAPHY.subhead,
    fontFamily: FONTS.semibold,
  },
  welcomeTitle: {
    fontSize: 34,
    fontFamily: FONTS.semibold,
    textAlign: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  welcomeSubtitle: {
    ...TYPOGRAPHY.callout,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.screenMargin,
    lineHeight: 24,
  },
  featureGrid: {
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
    width: '100%',
  },
  featureCard: {
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  featureItem: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  featureTitle: {
    ...TYPOGRAPHY.callout,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.xs,
  },
  featureText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 48,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.callout,
    fontFamily: FONTS.semibold,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 48,
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.callout,
    fontFamily: FONTS.semibold,
  },
  welcomeFooter: {
    ...TYPOGRAPHY.caption1,
    marginTop: SPACING.md,
  },
  savedPlansSection: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  savedPlansHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  savedPlansTitle: {
    ...TYPOGRAPHY.callout,
    fontFamily: FONTS.semibold,
  },
  savedPlanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  savedPlanIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: ALPHA_COLORS.primary.bgSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  savedPlanInfo: {
    flex: 1,
  },
  savedPlanRole: {
    ...TYPOGRAPHY.subhead,
    fontFamily: FONTS.semibold,
    marginBottom: 2,
  },
  savedPlanDate: {
    ...TYPOGRAPHY.caption1,
  },
  uploadContainer: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 34,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  screenSubtitle: {
    ...TYPOGRAPHY.callout,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.callout,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  resumeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    minHeight: 64,
  },
  resumeInfo: {
    flex: 1,
  },
  resumeName: {
    ...TYPOGRAPHY.callout,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  resumeDate: {
    fontSize: 13,
    fontFamily: FONTS.regular,
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
    paddingHorizontal: SPACING.md,
    ...TYPOGRAPHY.subhead,
  },
  uploadZone: {
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    marginBottom: SPACING.xl,
  },
  uploadTitle: {
    ...TYPOGRAPHY.headline,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  uploadSubtext: {
    ...TYPOGRAPHY.subhead,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  checkIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.danger,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    flex: 1,
    color: COLORS.danger,
    ...TYPOGRAPHY.subhead,
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
    ...TYPOGRAPHY.callout,
    fontFamily: FONTS.semibold,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepDotCompleted: {
  },
  stepDotText: {
    ...TYPOGRAPHY.subhead,
    fontFamily: FONTS.semibold,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: SPACING.radiusMD,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: FONTS.extralight,
    marginBottom: SPACING.xs,
  },
  stepSubtitle: {
    ...TYPOGRAPHY.subhead,
    textAlign: 'center',
  },
  formContainer: {
    gap: SPACING.lg,
  },
  formGroup: {
    gap: SPACING.sm,
  },
  label: {
    ...TYPOGRAPHY.callout,
    fontFamily: FONTS.semibold,
  },
  input: {
    borderWidth: 2,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...TYPOGRAPHY.callout,
    minHeight: 48,
  },
  inputMargin: {
    marginBottom: SPACING.xs,
  },
  helpText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    borderWidth: 2,
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
    ...TYPOGRAPHY.subhead,
    fontFamily: FONTS.semibold,
  },
  chipTextSelected: {
  },
  chipLarge: {
    borderWidth: 2,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSubtext: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  linkText: {
    color: COLORS.primary,
    ...TYPOGRAPHY.subhead,
    fontFamily: FONTS.semibold,
    marginTop: SPACING.xs,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
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
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.xxl,
    width: '100%',
    alignItems: 'center',
  },
  generatingIcon: {
    marginBottom: SPACING.lg,
  },
  generatingTitle: {
    fontSize: 20,
    fontFamily: FONTS.extralight,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  generatingMessage: {
    ...TYPOGRAPHY.callout,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  generatingSubtext: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  progressContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  progressBar: {
    height: 8,
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
    ...TYPOGRAPHY.caption1,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotInactive: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
  },
  stepText: {
    flex: 1,
    ...TYPOGRAPHY.subhead,
  },
  stepTextCompleted: {
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: FONTS.extralight,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    ...TYPOGRAPHY.callout,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  resultsHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenMargin,
    paddingVertical: SPACING.md,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  resultsIcon: {
    width: 64,
    height: 64,
    borderRadius: SPACING.radiusMD,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resultsTitle: {
    fontSize: 24,
    fontFamily: FONTS.extralight,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  resultsSubtitle: {
    ...TYPOGRAPHY.subhead,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  resultsDate: {
    ...TYPOGRAPHY.caption1,
  },
  planContent: {
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.xl,
  },
  planText: {
    ...TYPOGRAPHY.callout,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  // Career Analysis Styles (Features #13, #14, #15)
  analysisPrompt: {
    padding: SPACING.lg,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 48,
  },
  analyzeButtonText: {
    ...TYPOGRAPHY.callout,
    fontFamily: FONTS.semibold,
  },
  analysisCard: {
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.xl,
    margin: SPACING.lg,
  },
  analysisLoadingText: {
    ...TYPOGRAPHY.callout,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  analysisHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  analysisTitle: {
    fontSize: 24,
    fontFamily: FONTS.extralight,
    marginTop: SPACING.md,
  },
  analysisSection: {
    marginBottom: SPACING.xl,
  },
  analysisSectionTitle: {
    ...TYPOGRAPHY.headline,
    marginBottom: SPACING.md,
  },
  analysisText: {
    ...TYPOGRAPHY.callout,
    lineHeight: 24,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  scoreLabel: {
    ...TYPOGRAPHY.callout,
  },
  scoreValue: {
    fontSize: 24,
    fontFamily: FONTS.semibold,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  bullet: {
    ...TYPOGRAPHY.callout,
    color: COLORS.primary,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  pathStep: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  pathStepRole: {
    ...TYPOGRAPHY.callout,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  pathStepTimeline: {
    ...TYPOGRAPHY.subhead,
    marginBottom: SPACING.sm,
  },
  pathStepReq: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginBottom: 2,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  insightLabel: {
    ...TYPOGRAPHY.subhead,
  },
  insightValue: {
    ...TYPOGRAPHY.callout,
    fontFamily: FONTS.semibold,
  },
  companiesList: {
    marginTop: SPACING.md,
  },
  companiesLabel: {
    ...TYPOGRAPHY.subhead,
    marginBottom: SPACING.sm,
  },
  companiesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  companyChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  companyChipText: {
    ...TYPOGRAPHY.caption1,
  },
  skillGapCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  skillGapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  skillGapName: {
    ...TYPOGRAPHY.callout,
    fontFamily: FONTS.semibold,
    flex: 1,
  },
  importanceBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  importanceBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
  },
  skillLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  skillLevelLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  trendingSection: {
    marginBottom: SPACING.md,
  },
  trendingLabel: {
    ...TYPOGRAPHY.subhead,
    marginBottom: SPACING.sm,
  },
  trendingChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  trendingChipText: {
    ...TYPOGRAPHY.caption1,
    fontFamily: FONTS.semibold,
  },
  resourceSection: {
    marginBottom: SPACING.lg,
  },
  resourceSkillName: {
    ...TYPOGRAPHY.callout,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  resourceCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  resourceType: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
  },
  resourceTitle: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  resourceProvider: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginBottom: 4,
  },
  resourceMeta: {
    ...TYPOGRAPHY.caption1,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  priorityNumber: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityNumberText: {
    ...TYPOGRAPHY.subhead,
    fontFamily: FONTS.semibold,
  },
  prioritySkill: {
    flex: 1,
    ...TYPOGRAPHY.subhead,
  },
});
