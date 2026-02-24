import type { BuilderResumeData } from '../stores/builderStore'

export interface ScoreCategory {
  category: string
  score: number
  maxScore: number
  tips: string[]
}

export interface ResumeScore {
  total: number
  breakdown: ScoreCategory[]
}

export function scoreResume(data: BuilderResumeData): ResumeScore {
  const breakdown: ScoreCategory[] = []

  // 1. Contact completeness (15pts)
  {
    let score = 0
    const tips: string[] = []
    if (data.name) score += 4; else tips.push('Add your full name')
    if (data.email) score += 4; else tips.push('Add your email address')
    if (data.phone) score += 3; else tips.push('Add your phone number')
    if (data.location) score += 2; else tips.push('Add your location')
    if (data.linkedin) score += 2; else tips.push('Add your LinkedIn URL')
    breakdown.push({ category: 'Contact Info', score, maxScore: 15, tips })
  }

  // 2. Summary quality (20pts)
  {
    let score = 0
    const tips: string[] = []
    const len = (data.summary || '').length
    if (len > 0) score += 5
    if (len >= 100) score += 5; else if (len > 0) tips.push('Expand your summary to at least 100 characters')
    if (len >= 200) score += 5; else if (len >= 100) tips.push('A 200+ character summary is ideal')
    if (len > 0 && len <= 600) score += 5; else if (len > 600) tips.push('Consider trimming your summary — keep it concise')
    if (len === 0) tips.push('Add a professional summary')
    breakdown.push({ category: 'Summary', score, maxScore: 20, tips })
  }

  // 3. Experience depth (25pts)
  {
    let score = 0
    const tips: string[] = []
    const exps = data.experience || []
    const filledExps = exps.filter((e) => e.company || e.title)
    if (filledExps.length >= 1) score += 5
    if (filledExps.length >= 2) score += 5
    if (filledExps.length >= 3) score += 3

    const totalBullets = filledExps.reduce(
      (sum, e) => sum + (e.bullets?.filter((b) => b.trim()).length || 0),
      0
    )
    if (totalBullets >= 3) score += 4
    if (totalBullets >= 6) score += 4
    if (totalBullets >= 10) score += 4

    if (filledExps.length === 0) tips.push('Add at least one work experience')
    else if (filledExps.length < 2) tips.push('Add more positions to show career progression')
    if (totalBullets < 3) tips.push('Add bullet points describing your achievements')
    else if (totalBullets < 6) tips.push('More bullet points with measurable results improve your score')

    breakdown.push({ category: 'Experience', score, maxScore: 25, tips })
  }

  // 4. Education (10pts)
  {
    let score = 0
    const tips: string[] = []
    const edu = data.education || ''
    if (edu.trim()) score += 7
    if (edu.length > 30) score += 3
    if (!edu.trim()) tips.push('Add your education background')
    breakdown.push({ category: 'Education', score, maxScore: 10, tips })
  }

  // 5. Skills count (10pts)
  {
    let score = 0
    const tips: string[] = []
    const count = data.skills?.length || 0
    if (count >= 1) score += 2
    if (count >= 3) score += 2
    if (count >= 5) score += 3
    if (count >= 8) score += 3
    if (count === 0) tips.push('Add relevant skills')
    else if (count < 5) tips.push('Add more skills — aim for 5-10')
    else if (count > 15) tips.push('Consider trimming to your top 10-15 skills')
    breakdown.push({ category: 'Skills', score, maxScore: 10, tips })
  }

  // 6. Keyword density (10pts) — checks for action verbs in bullets
  {
    let score = 0
    const tips: string[] = []
    const bullets = (data.experience || []).flatMap((e) => e.bullets || []).join(' ').toLowerCase()
    const actionVerbs = ['led', 'managed', 'built', 'developed', 'designed', 'implemented', 'delivered', 'achieved', 'increased', 'reduced', 'improved', 'created', 'launched', 'optimized', 'collaborated', 'drove']
    const found = actionVerbs.filter((v) => bullets.includes(v))
    if (found.length >= 1) score += 3
    if (found.length >= 3) score += 3
    if (found.length >= 5) score += 4
    if (found.length === 0 && bullets.length > 0) tips.push('Use strong action verbs (Led, Built, Delivered, etc.)')
    else if (found.length < 3) tips.push('Use more varied action verbs in your bullets')

    // Check for numbers/metrics
    const hasMetrics = /\d+%|\$\d|[0-9]+ (team|projects?|clients?|users?)/.test(bullets)
    if (!hasMetrics && bullets.length > 0) tips.push('Add measurable results (e.g., "increased revenue by 25%")')

    breakdown.push({ category: 'Keywords & Impact', score, maxScore: 10, tips })
  }

  // 7. Formatting / completeness (10pts)
  {
    let score = 0
    const tips: string[] = []
    const exps = data.experience || []
    const hasDates = exps.some((e) => e.dates)
    const hasLocation = exps.some((e) => e.location)
    if (hasDates) score += 3; else if (exps.length > 0) tips.push('Add dates to your experience entries')
    if (hasLocation) score += 2; else if (exps.length > 0) tips.push('Add locations to your experience entries')

    const certs = data.certifications || ''
    if (certs.trim()) score += 3
    // General completeness bonus
    const sections = [data.name, data.summary, data.experience?.length, data.education, data.skills?.length].filter(Boolean).length
    if (sections >= 4) score += 2

    breakdown.push({ category: 'Formatting', score, maxScore: 10, tips })
  }

  const total = breakdown.reduce((sum, c) => sum + c.score, 0)

  return { total, breakdown }
}
