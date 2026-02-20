/**
 * Job Search Service
 *
 * Provides job search functionality across multiple job boards.
 * Supports filtering by location, remote work, salary, and date posted.
 *
 * Future integration options:
 * - Adzuna API (free tier available)
 * - Indeed API (requires sponsorship)
 * - LinkedIn Jobs API (requires partnership)
 * - Custom scraping with Playwright (backup)
 *
 * Current implementation: Built-in job database (starter dataset)
 */

export interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  remote: boolean
  hybrid?: boolean
  salary?: {
    min?: number
    max?: number
    currency: string
  }
  description: string
  requirements: string[]
  responsibilities: string[]
  url: string
  source: 'linkedin' | 'indeed' | 'glassdoor' | 'built-in'
  postedDate: Date
  applicationDeadline?: Date
  companyLogo?: string
  tags: string[]
}

export interface JobSearchFilters {
  keywords?: string
  location?: string
  remote?: boolean
  salaryMin?: number
  datePosted?: 'day' | 'week' | 'month' | 'any'
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  jobType?: 'full-time' | 'part-time' | 'contract' | 'internship'
}

export interface JobSearchResult {
  jobs: JobPosting[]
  totalCount: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * Sample job database (starter dataset)
 * In production, this would be replaced with real API calls
 */
const SAMPLE_JOBS: JobPosting[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    remote: false,
    hybrid: true,
    salary: { min: 150000, max: 250000, currency: 'USD' },
    description: 'Build the next generation of Google products used by billions of people worldwide.',
    requirements: [
      'Bachelor\'s degree in Computer Science or equivalent',
      '5+ years of software development experience',
      'Strong knowledge of algorithms and data structures',
      'Experience with large-scale distributed systems',
    ],
    responsibilities: [
      'Design and implement scalable backend systems',
      'Collaborate with cross-functional teams',
      'Mentor junior engineers',
      'Participate in code reviews and technical design discussions',
    ],
    url: 'https://careers.google.com/jobs/results/123456789',
    source: 'built-in',
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    companyLogo: '🔵',
    tags: ['Backend', 'Distributed Systems', 'Java', 'Go'],
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Meta',
    location: 'Remote',
    remote: true,
    salary: { min: 130000, max: 200000, currency: 'USD' },
    description: 'Lead product strategy for our social networking platform.',
    requirements: [
      '3+ years of product management experience',
      'Strong analytical and problem-solving skills',
      'Experience shipping consumer products',
      'Excellent communication skills',
    ],
    responsibilities: [
      'Define product vision and roadmap',
      'Work closely with engineering and design teams',
      'Analyze user metrics and feedback',
      'Drive product launches',
    ],
    url: 'https://www.metacareers.com/jobs/234567890',
    source: 'built-in',
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    companyLogo: '🔵',
    tags: ['Product Strategy', 'Analytics', 'User Research'],
  },
  {
    id: '3',
    title: 'Staff Software Engineer',
    company: 'Netflix',
    location: 'Los Gatos, CA',
    remote: false,
    salary: { min: 200000, max: 350000, currency: 'USD' },
    description: 'Drive technical excellence across our streaming platform.',
    requirements: [
      '8+ years of software engineering experience',
      'Proven track record of technical leadership',
      'Deep expertise in distributed systems',
      'Experience with streaming technologies',
    ],
    responsibilities: [
      'Lead complex technical initiatives',
      'Architect scalable systems',
      'Mentor and guide engineering teams',
      'Drive technical strategy',
    ],
    url: 'https://jobs.netflix.com/jobs/345678901',
    source: 'built-in',
    postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    companyLogo: '🔴',
    tags: ['Streaming', 'Cloud', 'Microservices', 'Leadership'],
  },
  {
    id: '4',
    title: 'Senior Product Designer',
    company: 'Airbnb',
    location: 'San Francisco, CA',
    remote: false,
    hybrid: true,
    salary: { min: 140000, max: 200000, currency: 'USD' },
    description: 'Design delightful experiences for our global community.',
    requirements: [
      '5+ years of product design experience',
      'Strong portfolio demonstrating UX/UI expertise',
      'Proficiency with Figma and design systems',
      'Experience with user research and testing',
    ],
    responsibilities: [
      'Create user-centered designs',
      'Collaborate with product and engineering',
      'Conduct user research and usability testing',
      'Maintain and evolve design system',
    ],
    url: 'https://careers.airbnb.com/positions/456789012',
    source: 'built-in',
    postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    companyLogo: '🎨',
    tags: ['UX/UI', 'Figma', 'Design Systems', 'User Research'],
  },
  {
    id: '5',
    title: 'Data Scientist',
    company: 'Amazon',
    location: 'Seattle, WA',
    remote: false,
    salary: { min: 120000, max: 180000, currency: 'USD' },
    description: 'Apply machine learning to solve complex business problems.',
    requirements: [
      'Master\'s or PhD in Computer Science, Statistics, or related field',
      '3+ years of data science experience',
      'Strong programming skills in Python/R',
      'Experience with ML frameworks (TensorFlow, PyTorch)',
    ],
    responsibilities: [
      'Build and deploy ML models',
      'Analyze large datasets',
      'Collaborate with product teams',
      'Present findings to stakeholders',
    ],
    url: 'https://amazon.jobs/en/jobs/567890123',
    source: 'built-in',
    postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    companyLogo: '🟠',
    tags: ['Machine Learning', 'Python', 'SQL', 'Analytics'],
  },
  {
    id: '6',
    title: 'DevOps Engineer',
    company: 'Microsoft',
    location: 'Remote',
    remote: true,
    salary: { min: 110000, max: 170000, currency: 'USD' },
    description: 'Build and maintain infrastructure for Azure services.',
    requirements: [
      'Bachelor\'s degree in Computer Science or equivalent',
      '4+ years of DevOps experience',
      'Experience with Kubernetes and Docker',
      'Knowledge of CI/CD pipelines',
    ],
    responsibilities: [
      'Manage cloud infrastructure',
      'Implement automation and monitoring',
      'Ensure high availability and scalability',
      'Collaborate with development teams',
    ],
    url: 'https://careers.microsoft.com/us/en/job/678901234',
    source: 'built-in',
    postedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    companyLogo: '🔷',
    tags: ['Kubernetes', 'Azure', 'CI/CD', 'Infrastructure'],
  },
  {
    id: '7',
    title: 'Frontend Engineer',
    company: 'Stripe',
    location: 'New York, NY',
    remote: false,
    hybrid: true,
    salary: { min: 130000, max: 200000, currency: 'USD' },
    description: 'Build beautiful, performant web experiences for our payment platform.',
    requirements: [
      '3+ years of frontend development experience',
      'Expert knowledge of React and TypeScript',
      'Strong understanding of web performance',
      'Experience with design systems',
    ],
    responsibilities: [
      'Build reusable UI components',
      'Optimize web performance',
      'Collaborate with designers and backend engineers',
      'Contribute to design system',
    ],
    url: 'https://stripe.com/jobs/listing/789012345',
    source: 'built-in',
    postedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    companyLogo: '🟣',
    tags: ['React', 'TypeScript', 'Web Performance', 'UI/UX'],
  },
  {
    id: '8',
    title: 'Security Engineer',
    company: 'Apple',
    location: 'Cupertino, CA',
    remote: false,
    salary: { min: 150000, max: 220000, currency: 'USD' },
    description: 'Protect our users\' privacy and security across all Apple platforms.',
    requirements: [
      '5+ years of security engineering experience',
      'Deep knowledge of cryptography and secure coding',
      'Experience with penetration testing',
      'Understanding of mobile and cloud security',
    ],
    responsibilities: [
      'Conduct security reviews and audits',
      'Design secure systems and protocols',
      'Respond to security incidents',
      'Educate teams on security best practices',
    ],
    url: 'https://jobs.apple.com/en-us/details/890123456',
    source: 'built-in',
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    companyLogo: '🍎',
    tags: ['Security', 'Cryptography', 'Mobile', 'Privacy'],
  },
]

/**
 * Search jobs with filters
 */
export async function searchJobs(
  filters: JobSearchFilters = {},
  page = 1,
  pageSize = 10
): Promise<JobSearchResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  let filteredJobs = [...SAMPLE_JOBS]

  // Apply keyword filter
  if (filters.keywords) {
    const keywords = filters.keywords.toLowerCase()
    filteredJobs = filteredJobs.filter(
      (job) =>
        job.title.toLowerCase().includes(keywords) ||
        job.company.toLowerCase().includes(keywords) ||
        job.description.toLowerCase().includes(keywords) ||
        job.tags.some((tag) => tag.toLowerCase().includes(keywords))
    )
  }

  // Apply location filter
  if (filters.location) {
    const location = filters.location.toLowerCase()
    filteredJobs = filteredJobs.filter(
      (job) =>
        job.location.toLowerCase().includes(location) ||
        (job.remote && location.includes('remote'))
    )
  }

  // Apply remote filter
  if (filters.remote !== undefined) {
    filteredJobs = filteredJobs.filter((job) => job.remote === filters.remote)
  }

  // Apply salary filter
  if (filters.salaryMin) {
    filteredJobs = filteredJobs.filter(
      (job) => job.salary && job.salary.min && job.salary.min >= filters.salaryMin!
    )
  }

  // Apply date posted filter
  if (filters.datePosted && filters.datePosted !== 'any') {
    const now = Date.now()
    const cutoff =
      filters.datePosted === 'day'
        ? 24 * 60 * 60 * 1000
        : filters.datePosted === 'week'
        ? 7 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000 // month

    filteredJobs = filteredJobs.filter(
      (job) => now - job.postedDate.getTime() <= cutoff
    )
  }

  // Sort by posted date (newest first)
  filteredJobs.sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime())

  // Paginate
  const totalCount = filteredJobs.length
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const jobs = filteredJobs.slice(startIndex, endIndex)

  return {
    jobs,
    totalCount,
    page,
    pageSize,
    hasMore: endIndex < totalCount,
  }
}

/**
 * Get recent job searches from localStorage
 */
export function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem('recent_job_searches')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save search to recent searches
 */
export function saveRecentSearch(keywords: string) {
  if (!keywords.trim()) return

  try {
    const recent = getRecentSearches()
    const updated = [keywords, ...recent.filter((s) => s !== keywords)].slice(0, 10)
    localStorage.setItem('recent_job_searches', JSON.stringify(updated))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}
