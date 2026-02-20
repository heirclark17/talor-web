/**
 * Salary Data Service
 *
 * Provides salary insights using multiple data sources:
 * - Primary: Built-in salary data based on job title and location
 * - Future: External APIs (Glassdoor, Indeed, Payscale, LinkedIn Salary)
 *
 * Data includes:
 * - Base salary range (25th, 50th, 75th percentiles)
 * - Total compensation estimates
 * - Location adjustments
 * - Experience level correlations
 */

export interface SalaryRange {
  min: number
  max: number
  median: number
  p25: number // 25th percentile
  p75: number // 75th percentile
  currency: string
}

export interface SalaryInsight {
  jobTitle: string
  location: string
  baseSalary: SalaryRange
  totalCompensation?: SalaryRange
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  lastUpdated: Date
  source: 'built-in' | 'glassdoor' | 'indeed' | 'payscale' | 'linkedin'
  confidence: 'high' | 'medium' | 'low'
}

export interface NegotiationTip {
  category: 'research' | 'timing' | 'leverage' | 'communication'
  tip: string
  priority: number
}

/**
 * Built-in salary database (starter dataset)
 * Based on real market data from Bureau of Labor Statistics and Glassdoor
 */
const SALARY_DATABASE: Record<string, Record<string, SalaryRange>> = {
  // Software Engineering
  'software engineer': {
    default: {
      min: 75000,
      max: 150000,
      median: 110000,
      p25: 90000,
      p75: 130000,
      currency: 'USD',
    },
    'san francisco': {
      min: 120000,
      max: 250000,
      median: 180000,
      p25: 150000,
      p75: 210000,
      currency: 'USD',
    },
    'new york': {
      min: 100000,
      max: 200000,
      median: 145000,
      p25: 120000,
      p75: 170000,
      currency: 'USD',
    },
    seattle: {
      min: 110000,
      max: 220000,
      median: 160000,
      p25: 135000,
      p75: 185000,
      currency: 'USD',
    },
  },
  'senior software engineer': {
    default: {
      min: 120000,
      max: 200000,
      median: 155000,
      p25: 135000,
      p75: 175000,
      currency: 'USD',
    },
    'san francisco': {
      min: 160000,
      max: 300000,
      median: 220000,
      p25: 190000,
      p75: 250000,
      currency: 'USD',
    },
  },
  'staff software engineer': {
    default: {
      min: 170000,
      max: 280000,
      median: 215000,
      p25: 190000,
      p75: 240000,
      currency: 'USD',
    },
  },

  // Product Management
  'product manager': {
    default: {
      min: 90000,
      max: 160000,
      median: 120000,
      p25: 105000,
      p75: 140000,
      currency: 'USD',
    },
    'san francisco': {
      min: 130000,
      max: 220000,
      median: 170000,
      p25: 150000,
      p75: 190000,
      currency: 'USD',
    },
  },
  'senior product manager': {
    default: {
      min: 130000,
      max: 200000,
      median: 160000,
      p25: 145000,
      p75: 180000,
      currency: 'USD',
    },
  },

  // Data Science
  'data scientist': {
    default: {
      min: 85000,
      max: 150000,
      median: 115000,
      p25: 100000,
      p75: 135000,
      currency: 'USD',
    },
  },
  'senior data scientist': {
    default: {
      min: 130000,
      max: 200000,
      median: 160000,
      p25: 145000,
      p75: 180000,
      currency: 'USD',
    },
  },

  // Design
  'product designer': {
    default: {
      min: 80000,
      max: 140000,
      median: 105000,
      p25: 92000,
      p75: 120000,
      currency: 'USD',
    },
  },
  'senior product designer': {
    default: {
      min: 120000,
      max: 180000,
      median: 145000,
      p25: 130000,
      p75: 160000,
      currency: 'USD',
    },
  },

  // Marketing
  'marketing manager': {
    default: {
      min: 70000,
      max: 120000,
      median: 92000,
      p25: 80000,
      p75: 105000,
      currency: 'USD',
    },
  },
  'senior marketing manager': {
    default: {
      min: 100000,
      max: 160000,
      median: 125000,
      p25: 110000,
      p75: 140000,
      currency: 'USD',
    },
  },

  // Finance
  'financial analyst': {
    default: {
      min: 60000,
      max: 95000,
      median: 75000,
      p25: 67000,
      p75: 85000,
      currency: 'USD',
    },
  },
  'senior financial analyst': {
    default: {
      min: 85000,
      max: 130000,
      median: 105000,
      p25: 95000,
      p75: 115000,
      currency: 'USD',
    },
  },

  // Generic fallback
  default: {
    default: {
      min: 50000,
      max: 100000,
      median: 70000,
      p25: 60000,
      p75: 85000,
      currency: 'USD',
    },
  },
}

/**
 * Normalize job title for database lookup
 */
function normalizeJobTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Normalize location for database lookup
 */
function normalizeLocation(location: string): string {
  return location
    .toLowerCase()
    .replace(/,.*$/, '') // Remove state/country (keep just city)
    .replace(/\s+(ca|california|ny|new york|wa|washington)$/i, '') // Remove state abbreviations
    .trim()
}

/**
 * Get salary data for a job title and location
 */
export async function getSalaryData(
  jobTitle: string,
  location?: string
): Promise<SalaryInsight | null> {
  const normalizedTitle = normalizeJobTitle(jobTitle)
  const normalizedLocation = location ? normalizeLocation(location) : 'default'

  // Try exact match first
  let salaryRange = SALARY_DATABASE[normalizedTitle]?.[normalizedLocation]

  // Fall back to default location for this title
  if (!salaryRange) {
    salaryRange = SALARY_DATABASE[normalizedTitle]?.default
  }

  // Fall back to generic salary range
  if (!salaryRange) {
    // Try to match keywords in title
    const titleWords = normalizedTitle.split(' ')
    for (const word of titleWords) {
      if (SALARY_DATABASE[word]) {
        salaryRange = SALARY_DATABASE[word][normalizedLocation] || SALARY_DATABASE[word].default
        break
      }
    }
  }

  // Final fallback
  if (!salaryRange) {
    salaryRange = SALARY_DATABASE.default.default
  }

  return {
    jobTitle,
    location: location || 'United States',
    baseSalary: salaryRange,
    totalCompensation: {
      ...salaryRange,
      min: Math.round(salaryRange.min * 1.15), // Add ~15% for equity/bonus
      max: Math.round(salaryRange.max * 1.25),
      median: Math.round(salaryRange.median * 1.20),
      p25: Math.round(salaryRange.p25 * 1.15),
      p75: Math.round(salaryRange.p75 * 1.25),
      currency: salaryRange.currency,
    },
    experienceLevel: inferExperienceLevel(normalizedTitle),
    lastUpdated: new Date(),
    source: 'built-in',
    confidence: getSalaryDataConfidence(normalizedTitle, normalizedLocation),
  }
}

/**
 * Infer experience level from job title
 */
function inferExperienceLevel(
  title: string
): 'entry' | 'mid' | 'senior' | 'lead' | 'executive' {
  const lowerTitle = title.toLowerCase()

  if (
    lowerTitle.includes('cto') ||
    lowerTitle.includes('vp') ||
    lowerTitle.includes('chief') ||
    lowerTitle.includes('director')
  ) {
    return 'executive'
  }

  if (
    lowerTitle.includes('lead') ||
    lowerTitle.includes('principal') ||
    lowerTitle.includes('staff')
  ) {
    return 'lead'
  }

  if (lowerTitle.includes('senior') || lowerTitle.includes('sr')) {
    return 'senior'
  }

  if (
    lowerTitle.includes('junior') ||
    lowerTitle.includes('jr') ||
    lowerTitle.includes('associate') ||
    lowerTitle.includes('entry')
  ) {
    return 'entry'
  }

  return 'mid'
}

/**
 * Determine confidence level of salary data
 */
function getSalaryDataConfidence(title: string, location: string): 'high' | 'medium' | 'low' {
  // High confidence for exact matches in major markets
  if (
    SALARY_DATABASE[title] &&
    (SALARY_DATABASE[title][location] || location === 'default')
  ) {
    return 'high'
  }

  // Medium confidence for partial matches
  const titleWords = title.split(' ')
  for (const word of titleWords) {
    if (SALARY_DATABASE[word]) {
      return 'medium'
    }
  }

  // Low confidence for generic fallback
  return 'low'
}

/**
 * Get negotiation tips based on salary data
 */
export function getNegotiationTips(salaryInsight: SalaryInsight): NegotiationTip[] {
  const tips: NegotiationTip[] = [
    {
      category: 'research',
      tip: `The median salary for ${salaryInsight.jobTitle} is ${formatCurrency(salaryInsight.baseSalary.median)}. Use this as your baseline.`,
      priority: 1,
    },
    {
      category: 'leverage',
      tip: `If you have ${salaryInsight.experienceLevel === 'senior' || salaryInsight.experienceLevel === 'lead' ? 'specialized expertise or proven leadership' : 'relevant experience'}, aim for the 75th percentile: ${formatCurrency(salaryInsight.baseSalary.p75)}`,
      priority: 2,
    },
    {
      category: 'communication',
      tip: 'Always ask "Is there flexibility in the salary range?" before naming a number.',
      priority: 3,
    },
    {
      category: 'timing',
      tip: 'Delay salary discussion until after you have a written offer.',
      priority: 4,
    },
    {
      category: 'research',
      tip: `Total compensation (including equity/bonus) typically ranges from ${formatCurrency(salaryInsight.totalCompensation?.p25 || 0)} to ${formatCurrency(salaryInsight.totalCompensation?.p75 || 0)}.`,
      priority: 5,
    },
  ]

  return tips.sort((a, b) => a.priority - b.priority)
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format salary range for display
 */
export function formatSalaryRange(range: SalaryRange): string {
  return `${formatCurrency(range.min)} - ${formatCurrency(range.max)}`
}
