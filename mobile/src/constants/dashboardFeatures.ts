import {
  FileText,
  Plus,
  PenTool,
  Upload,
  Target,
  Layers,
  Search,
  Briefcase,
  BookOpen,
  Sparkles,
  FileEdit,
  Bookmark,
  TrendingUp,
  CreditCard,
} from 'lucide-react-native';

export type FeatureCategory = 'Resume Tools' | 'Career Prep' | 'Growth';

export interface DashboardFeature {
  id: string;
  screen: string;
  label: string;
  subtitle: string;
  icon: typeof FileText;
  iconColor: string;
  category: FeatureCategory;
}

export const DASHBOARD_FEATURES: DashboardFeature[] = [
  // Resume Tools
  {
    id: 'resumes',
    screen: 'HomeMain',
    label: 'My Resumes',
    subtitle: 'View, edit, and manage all your saved resumes',
    icon: FileText,
    iconColor: '#60A5FA',
    category: 'Resume Tools',
  },
  {
    id: 'build',
    screen: 'ResumeBuilder',
    label: 'Build Resume',
    subtitle: 'Create a new resume from scratch with AI guidance',
    icon: Plus,
    iconColor: '#34D399',
    category: 'Resume Tools',
  },
  {
    id: 'templates',
    screen: 'Templates',
    label: 'Templates',
    subtitle: 'Browse professional resume templates and designs',
    icon: PenTool,
    iconColor: '#A78BFA',
    category: 'Resume Tools',
  },
  {
    id: 'upload',
    screen: 'UploadResume',
    label: 'Upload',
    subtitle: 'Upload an existing resume file to get started',
    icon: Upload,
    iconColor: '#10B981',
    category: 'Resume Tools',
  },
  {
    id: 'tailor',
    screen: 'TailorMain',
    label: 'Tailor',
    subtitle: 'Customize your resume for a specific job posting',
    icon: Target,
    iconColor: '#FB7185',
    category: 'Resume Tools',
  },
  {
    id: 'batch',
    screen: 'BatchTailor',
    label: 'Batch Tailor',
    subtitle: 'Tailor your resume for multiple jobs at once',
    icon: Layers,
    iconColor: '#8B5CF6',
    category: 'Resume Tools',
  },

  // Career Prep
  {
    id: 'jobs',
    screen: 'JobSearch',
    label: 'Job Search',
    subtitle: 'Search and discover jobs that match your skills',
    icon: Search,
    iconColor: '#10B981',
    category: 'Career Prep',
  },
  {
    id: 'tracking',
    screen: 'Applications',
    label: 'Applications',
    subtitle: 'Track and manage all your job applications',
    icon: Briefcase,
    iconColor: '#F59E0B',
    category: 'Career Prep',
  },
  {
    id: 'interview',
    screen: 'InterviewList',
    label: 'Interview Prep',
    subtitle: 'Practice with AI-powered interview questions',
    icon: BookOpen,
    iconColor: '#06B6D4',
    category: 'Career Prep',
  },
  {
    id: 'star',
    screen: 'StoriesMain',
    label: 'STAR Stories',
    subtitle: 'Build compelling behavioral interview answers',
    icon: Sparkles,
    iconColor: '#FBBF24',
    category: 'Career Prep',
  },
  {
    id: 'cover-letters',
    screen: 'CoverLetters',
    label: 'Cover Letters',
    subtitle: 'Generate tailored cover letters for any role',
    icon: FileEdit,
    iconColor: '#6366F1',
    category: 'Career Prep',
  },

  // Growth
  {
    id: 'saved',
    screen: 'SavedMain',
    label: 'Saved',
    subtitle: 'View your bookmarked comparisons and items',
    icon: Bookmark,
    iconColor: '#F97316',
    category: 'Growth',
  },
  {
    id: 'career',
    screen: 'CareerMain',
    label: 'Career Path',
    subtitle: 'Plan your career trajectory and next moves',
    icon: TrendingUp,
    iconColor: '#22C55E',
    category: 'Growth',
  },
  {
    id: 'pricing',
    screen: 'Pricing',
    label: 'Pricing',
    subtitle: 'View subscription plans and manage billing',
    icon: CreditCard,
    iconColor: '#A78BFA',
    category: 'Growth',
  },
];

export const FEATURE_CATEGORIES: FeatureCategory[] = ['Resume Tools', 'Career Prep', 'Growth'];
