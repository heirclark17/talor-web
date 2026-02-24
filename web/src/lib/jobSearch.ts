/**
 * Job Search Service
 *
 * Integrates with Adzuna API for real job postings.
 * Free tier: 250 API calls/month
 *
 * Fallback to sample data if API is unavailable or quota exceeded.
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
  source: 'linkedin' | 'indeed' | 'glassdoor' | 'built-in' | 'adzuna'
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
 * Adzuna API Response Types
 */
interface AdzunaJob {
  id: string
  title: string
  company: {
    display_name: string
  }
  location: {
    display_name: string
    area: string[]
  }
  description: string
  redirect_url: string
  created: string
  salary_min?: number
  salary_max?: number
  salary_is_predicted?: string
  category: {
    label: string
    tag: string
  }
  contract_type?: string
  contract_time?: string
}

interface AdzunaResponse {
  results: AdzunaJob[]
  count: number
  mean?: number
}

/**
 * Sample job database (fallback when API unavailable)
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
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
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
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    companyLogo: '🔵',
    tags: ['Product Strategy', 'Analytics', 'User Research'],
  },
  {
    id: '3',
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
    postedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    companyLogo: '🟣',
    tags: ['React', 'TypeScript', 'Web Performance', 'UI/UX'],
  },
]

/**
 * Map Adzuna job to our JobPosting format
 */
function mapAdzunaJob(adzunaJob: AdzunaJob): JobPosting {
  // Extract keywords/tags from category and title
  const tags: string[] = []
  if (adzunaJob.category?.label) {
    tags.push(adzunaJob.category.label)
  }
  if (adzunaJob.contract_type) {
    tags.push(adzunaJob.contract_type)
  }

  // Detect remote from location or title
  const locationStr = adzunaJob.location.display_name.toLowerCase()
  const titleStr = adzunaJob.title.toLowerCase()
  const descStr = adzunaJob.description.toLowerCase()
  const isRemote =
    locationStr.includes('remote') ||
    titleStr.includes('remote') ||
    descStr.includes('remote work') ||
    descStr.includes('work from home')

  // Extract simple requirements from description
  const requirements: string[] = []
  const responsibilities: string[] = []

  // Basic extraction (can be improved with NLP)
  const descLines = adzunaJob.description.split('\n').filter((line) => line.trim())
  descLines.forEach((line) => {
    const lowerLine = line.toLowerCase()
    if (
      lowerLine.includes('required') ||
      lowerLine.includes('must have') ||
      lowerLine.includes('qualification')
    ) {
      requirements.push(line.trim())
    } else if (
      lowerLine.includes('responsibility') ||
      lowerLine.includes('will') ||
      lowerLine.includes('you will')
    ) {
      responsibilities.push(line.trim())
    }
  })

  return {
    id: adzunaJob.id,
    title: adzunaJob.title,
    company: adzunaJob.company.display_name,
    location: adzunaJob.location.display_name,
    remote: isRemote,
    salary:
      adzunaJob.salary_min || adzunaJob.salary_max
        ? {
            min: adzunaJob.salary_min,
            max: adzunaJob.salary_max,
            currency: 'USD',
          }
        : undefined,
    description: adzunaJob.description,
    requirements: requirements.length > 0 ? requirements : ['See job description for details'],
    responsibilities:
      responsibilities.length > 0 ? responsibilities : ['See job description for details'],
    url: adzunaJob.redirect_url,
    source: 'adzuna',
    postedDate: new Date(adzunaJob.created),
    tags,
  }
}

/**
 * Search jobs using Adzuna API
 */
async function searchAdzunaJobs(
  filters: JobSearchFilters,
  page: number,
  pageSize: number
): Promise<JobSearchResult> {
  const appId = import.meta.env.VITE_ADZUNA_APP_ID
  const apiKey = import.meta.env.VITE_ADZUNA_API_KEY

  if (!appId || !apiKey || appId === 'your_app_id_here') {
    throw new Error('Adzuna API credentials not configured')
  }

  // Build Adzuna API URL
  // Format: https://api.adzuna.com/v1/api/jobs/{country}/search/{page}?app_id={app_id}&app_key={app_key}&what={keywords}&where={location}
  const country = 'us' // United States
  const baseUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`

  const params = new URLSearchParams({
    app_id: appId,
    app_key: apiKey,
    results_per_page: pageSize.toString(),
  })

  // Add search filters
  if (filters.keywords) {
    params.append('what', filters.keywords)
  }

  if (filters.location) {
    params.append('where', filters.location)
  }

  if (filters.salaryMin) {
    params.append('salary_min', filters.salaryMin.toString())
  }

  // Date posted filter (max_days_old)
  if (filters.datePosted && filters.datePosted !== 'any') {
    const daysOld =
      filters.datePosted === 'day' ? 1 : filters.datePosted === 'week' ? 7 : 30
    params.append('max_days_old', daysOld.toString())
  }

  // Contract type filter
  if (filters.jobType) {
    if (filters.jobType === 'full-time') params.append('full_time', '1')
    if (filters.jobType === 'part-time') params.append('part_time', '1')
    if (filters.jobType === 'contract') params.append('contract', '1')
  }

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`)

    if (!response.ok) {
      // Check for rate limit (429) or quota exceeded
      if (response.status === 429) {
        throw new Error('QUOTA_EXCEEDED')
      }
      throw new Error(`Adzuna API error: ${response.status}`)
    }

    const data: AdzunaResponse = await response.json()

    // Map Adzuna jobs to our format
    const jobs = data.results.map(mapAdzunaJob)

    // Filter by remote if specified (Adzuna doesn't have direct remote filter)
    let filteredJobs = jobs
    if (filters.remote !== undefined) {
      filteredJobs = jobs.filter((job) => job.remote === filters.remote)
    }

    return {
      jobs: filteredJobs,
      totalCount: data.count,
      page,
      pageSize,
      hasMore: filteredJobs.length === pageSize,
    }
  } catch (error) {
    console.error('Adzuna API error:', error)
    throw error
  }
}

/**
 * Search jobs with filters (with fallback to sample data)
 */
export async function searchJobs(
  filters: JobSearchFilters = {},
  page = 1,
  pageSize = 10
): Promise<JobSearchResult> {
  try {
    // Try Adzuna API first
    return await searchAdzunaJobs(filters, page, pageSize)
  } catch (error) {
    console.warn('Falling back to sample jobs:', error)

    // Fallback to sample data
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
          : 30 * 24 * 60 * 60 * 1000

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
