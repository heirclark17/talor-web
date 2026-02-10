/**
 * API Module Index
 * Re-exports the full api singleton for backwards compatibility,
 * plus domain-specific modules for cleaner imports.
 */

// Full singleton (backwards compat)
export { api, type ApiResponse } from './client'

// Domain modules
export { resumeApi } from './resumeApi'
export { tailorApi } from './tailorApi'
export { interviewApi } from './interviewApi'
export { starStoryApi } from './starStoryApi'
export { careerPathApi } from './careerPathApi'
export { applicationApi } from './applicationApi'
export { coverLetterApi } from './coverLetterApi'
