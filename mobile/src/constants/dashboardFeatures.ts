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
  Settings,
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
    subtitle: 'View & manage',
    icon: FileText,
    iconColor: '#60A5FA',
    category: 'Resume Tools',
  },
  {
    id: 'build',
    screen: 'ResumeBuilder',
    label: 'Build Resume',
    subtitle: 'Start fresh',
    icon: Plus,
    iconColor: '#34D399',
    category: 'Resume Tools',
  },
  {
    id: 'templates',
    screen: 'Templates',
    label: 'Templates',
    subtitle: 'Browse designs',
    icon: PenTool,
    iconColor: '#A78BFA',
    category: 'Resume Tools',
  },
  {
    id: 'upload',
    screen: 'UploadResume',
    label: 'Upload',
    subtitle: 'Import file',
    icon: Upload,
    iconColor: '#10B981',
    category: 'Resume Tools',
  },
  {
    id: 'tailor',
    screen: 'TailorMain',
    label: 'Tailor',
    subtitle: 'Match to job',
    icon: Target,
    iconColor: '#FB7185',
    category: 'Resume Tools',
  },
  {
    id: 'batch',
    screen: 'BatchTailor',
    label: 'Batch Tailor',
    subtitle: 'Multi-tailor',
    icon: Layers,
    iconColor: '#8B5CF6',
    category: 'Resume Tools',
  },

  // Career Prep
  {
    id: 'jobs',
    screen: 'JobSearch',
    label: 'Job Search',
    subtitle: 'Find matches',
    icon: Search,
    iconColor: '#10B981',
    category: 'Career Prep',
  },
  {
    id: 'tracking',
    screen: 'Applications',
    label: 'Applications',
    subtitle: 'Track apps',
    icon: Briefcase,
    iconColor: '#F59E0B',
    category: 'Career Prep',
  },
  {
    id: 'interview',
    screen: 'InterviewList',
    label: 'Interview Prep',
    subtitle: 'AI practice',
    icon: BookOpen,
    iconColor: '#06B6D4',
    category: 'Career Prep',
  },
  {
    id: 'star',
    screen: 'StoriesMain',
    label: 'STAR Stories',
    subtitle: 'Build stories',
    icon: Sparkles,
    iconColor: '#FBBF24',
    category: 'Career Prep',
  },
  {
    id: 'cover-letters',
    screen: 'CoverLetters',
    label: 'Cover Letters',
    subtitle: 'Generate',
    icon: FileEdit,
    iconColor: '#6366F1',
    category: 'Career Prep',
  },

  // Growth
  {
    id: 'saved',
    screen: 'SavedMain',
    label: 'Saved',
    subtitle: 'Bookmarks',
    icon: Bookmark,
    iconColor: '#F97316',
    category: 'Growth',
  },
  {
    id: 'career',
    screen: 'CareerMain',
    label: 'Career Path',
    subtitle: 'Plan path',
    icon: TrendingUp,
    iconColor: '#22C55E',
    category: 'Growth',
  },
  {
    id: 'pricing',
    screen: 'Pricing',
    label: 'Pricing',
    subtitle: 'Plans & sub',
    icon: CreditCard,
    iconColor: '#A78BFA',
    category: 'Growth',
  },
  {
    id: 'settings',
    screen: 'SettingsMain',
    label: 'Settings',
    subtitle: 'Preferences',
    icon: Settings,
    iconColor: '#94A3B8',
    category: 'Growth',
  },
];

export const FEATURE_CATEGORIES: FeatureCategory[] = ['Resume Tools', 'Career Prep', 'Growth'];
