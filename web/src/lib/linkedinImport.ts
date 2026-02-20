/**
 * LinkedIn Profile Import Service
 *
 * Parses LinkedIn profile data and converts it to resume format
 */

export interface LinkedInProfile {
  firstName: string
  lastName: string
  headline: string
  summary: string
  location: string
  email?: string
  phone?: string
  positions: LinkedInPosition[]
  education: LinkedInEducation[]
  skills: string[]
  certifications?: LinkedInCertification[]
  volunteer?: LinkedInVolunteer[]
}

export interface LinkedInPosition {
  title: string
  companyName: string
  location?: string
  startDate: string // YYYY-MM format
  endDate?: string // YYYY-MM format or 'Present'
  description?: string
  current: boolean
}

export interface LinkedInEducation {
  schoolName: string
  degree?: string
  fieldOfStudy?: string
  startDate?: string
  endDate?: string
  grade?: string
  description?: string
}

export interface LinkedInCertification {
  name: string
  authority: string
  licenseNumber?: string
  startDate?: string
  endDate?: string
  url?: string
}

export interface LinkedInVolunteer {
  organization: string
  role: string
  cause?: string
  startDate?: string
  endDate?: string
  description?: string
}

/**
 * Import LinkedIn profile from JSON data
 */
export async function importLinkedInProfile(profileData: string): Promise<LinkedInProfile> {
  try {
    const data = JSON.parse(profileData)

    // LinkedIn export format varies, try to detect and parse
    if (data.profile) {
      // Format 1: Wrapped in profile object
      return parseLinkedInData(data.profile)
    } else if (data.firstName && data.lastName) {
      // Format 2: Direct profile data
      return parseLinkedInData(data)
    } else {
      throw new Error('Unrecognized LinkedIn profile format')
    }
  } catch (error) {
    console.error('[LinkedIn Import] Parse error:', error)
    throw new Error('Failed to parse LinkedIn profile data. Please ensure you uploaded a valid LinkedIn JSON export.')
  }
}

/**
 * Parse LinkedIn profile data
 */
function parseLinkedInData(data: any): LinkedInProfile {
  return {
    firstName: data.firstName || data.first_name || '',
    lastName: data.lastName || data.last_name || '',
    headline: data.headline || '',
    summary: data.summary || '',
    location: formatLocation(data),
    email: data.emailAddress || data.email || undefined,
    phone: data.phoneNumbers?.[0]?.number || data.phone || undefined,
    positions: parsePositions(data.positions || data.experience || []),
    education: parseEducation(data.education || []),
    skills: parseSkills(data.skills || []),
    certifications: parseCertifications(data.certifications || []),
    volunteer: parseVolunteer(data.volunteer || [])
  }
}

/**
 * Format location from LinkedIn data
 */
function formatLocation(data: any): string {
  if (data.locationName) return data.locationName
  if (data.location) {
    if (typeof data.location === 'string') return data.location
    if (data.location.name) return data.location.name
  }
  if (data.geoLocationName) return data.geoLocationName
  return ''
}

/**
 * Parse work positions
 */
function parsePositions(positions: any[]): LinkedInPosition[] {
  return positions.map(pos => ({
    title: pos.title || '',
    companyName: pos.companyName || pos.company?.name || '',
    location: pos.location || pos.locationName || undefined,
    startDate: formatDate(pos.startDate || pos.timePeriod?.startDate),
    endDate: pos.endDate ? formatDate(pos.endDate) : (pos.timePeriod?.endDate ? formatDate(pos.timePeriod.endDate) : 'Present'),
    description: pos.description || undefined,
    current: !pos.endDate && !pos.timePeriod?.endDate
  }))
}

/**
 * Parse education
 */
function parseEducation(education: any[]): LinkedInEducation[] {
  return education.map(edu => ({
    schoolName: edu.schoolName || edu.school?.name || '',
    degree: edu.degreeName || edu.degree || undefined,
    fieldOfStudy: edu.fieldOfStudy || edu.field || undefined,
    startDate: edu.startDate ? formatDate(edu.startDate) : undefined,
    endDate: edu.endDate ? formatDate(edu.endDate) : undefined,
    grade: edu.grade || undefined,
    description: edu.description || undefined
  }))
}

/**
 * Parse skills
 */
function parseSkills(skills: any[]): string[] {
  return skills.map(skill => {
    if (typeof skill === 'string') return skill
    return skill.name || skill.skill || ''
  }).filter(Boolean)
}

/**
 * Parse certifications
 */
function parseCertifications(certifications: any[]): LinkedInCertification[] {
  return certifications.map(cert => ({
    name: cert.name || '',
    authority: cert.authority || cert.organization || '',
    licenseNumber: cert.licenseNumber || undefined,
    startDate: cert.startDate ? formatDate(cert.startDate) : undefined,
    endDate: cert.endDate ? formatDate(cert.endDate) : undefined,
    url: cert.url || undefined
  }))
}

/**
 * Parse volunteer experience
 */
function parseVolunteer(volunteer: any[]): LinkedInVolunteer[] {
  return volunteer.map(vol => ({
    organization: vol.organization || vol.organizationName || '',
    role: vol.role || vol.title || '',
    cause: vol.cause || undefined,
    startDate: vol.startDate ? formatDate(vol.startDate) : undefined,
    endDate: vol.endDate ? formatDate(vol.endDate) : undefined,
    description: vol.description || undefined
  }))
}

/**
 * Format date to YYYY-MM
 */
function formatDate(date: any): string {
  if (!date) return ''

  if (typeof date === 'string') {
    // Try parsing various date formats
    const match = date.match(/(\d{4})-?(\d{2})?/)
    if (match) {
      return match[2] ? `${match[1]}-${match[2]}` : match[1]
    }
    return date
  }

  if (date.year) {
    const month = date.month ? String(date.month).padStart(2, '0') : '01'
    return `${date.year}-${month}`
  }

  return ''
}

/**
 * Convert LinkedIn profile to resume text
 */
export function convertLinkedInToResume(profile: LinkedInProfile): string {
  const sections: string[] = []

  // Header
  sections.push(`${profile.firstName} ${profile.lastName}`)
  if (profile.headline) sections.push(profile.headline)
  if (profile.location) sections.push(profile.location)
  if (profile.email) sections.push(profile.email)
  if (profile.phone) sections.push(profile.phone)
  sections.push('') // Blank line

  // Summary
  if (profile.summary) {
    sections.push('PROFESSIONAL SUMMARY')
    sections.push(profile.summary)
    sections.push('') // Blank line
  }

  // Experience
  if (profile.positions.length > 0) {
    sections.push('PROFESSIONAL EXPERIENCE')
    profile.positions.forEach(pos => {
      const dateRange = pos.endDate
        ? `${pos.startDate} - ${pos.endDate}`
        : `${pos.startDate} - Present`

      sections.push(`${pos.title} | ${pos.companyName}`)
      if (pos.location) sections.push(pos.location)
      sections.push(dateRange)
      if (pos.description) sections.push(pos.description)
      sections.push('') // Blank line between positions
    })
  }

  // Education
  if (profile.education.length > 0) {
    sections.push('EDUCATION')
    profile.education.forEach(edu => {
      const degree = edu.degree && edu.fieldOfStudy
        ? `${edu.degree} in ${edu.fieldOfStudy}`
        : edu.degree || edu.fieldOfStudy || 'Education'

      sections.push(`${degree} | ${edu.schoolName}`)
      if (edu.startDate && edu.endDate) {
        sections.push(`${edu.startDate} - ${edu.endDate}`)
      } else if (edu.endDate) {
        sections.push(edu.endDate)
      }
      if (edu.grade) sections.push(`Grade: ${edu.grade}`)
      if (edu.description) sections.push(edu.description)
      sections.push('') // Blank line
    })
  }

  // Skills
  if (profile.skills.length > 0) {
    sections.push('SKILLS')
    sections.push(profile.skills.join(', '))
    sections.push('') // Blank line
  }

  // Certifications
  if (profile.certifications && profile.certifications.length > 0) {
    sections.push('CERTIFICATIONS')
    profile.certifications.forEach(cert => {
      sections.push(`${cert.name} - ${cert.authority}`)
      if (cert.licenseNumber) sections.push(`License: ${cert.licenseNumber}`)
      if (cert.startDate) sections.push(`Issued: ${cert.startDate}`)
      if (cert.url) sections.push(cert.url)
      sections.push('') // Blank line
    })
  }

  // Volunteer
  if (profile.volunteer && profile.volunteer.length > 0) {
    sections.push('VOLUNTEER EXPERIENCE')
    profile.volunteer.forEach(vol => {
      sections.push(`${vol.role} | ${vol.organization}`)
      if (vol.cause) sections.push(`Cause: ${vol.cause}`)
      if (vol.startDate && vol.endDate) {
        sections.push(`${vol.startDate} - ${vol.endDate}`)
      }
      if (vol.description) sections.push(vol.description)
      sections.push('') // Blank line
    })
  }

  return sections.join('\n')
}

/**
 * Validate LinkedIn profile data
 */
export function validateLinkedInProfile(profile: LinkedInProfile): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!profile.firstName) errors.push('First name is required')
  if (!profile.lastName) errors.push('Last name is required')
  if (profile.positions.length === 0) errors.push('At least one work experience is required')

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Get LinkedIn profile URL
 */
export function getLinkedInProfileUrl(profile: LinkedInProfile): string {
  const name = `${profile.firstName}-${profile.lastName}`.toLowerCase().replace(/\s+/g, '-')
  return `https://www.linkedin.com/in/${name}`
}
