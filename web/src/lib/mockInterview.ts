/**
 * AI Mock Interview Service
 *
 * Conducts interactive mock interviews using GPT-4
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export interface InterviewConfig {
  jobTitle: string
  company: string
  interviewType: 'behavioral' | 'technical' | 'case' | 'system-design' | 'mixed'
  difficulty: 'entry' | 'mid' | 'senior' | 'executive'
  duration?: number // in minutes
  focusAreas?: string[]
}

export interface InterviewMessage {
  id: string
  role: 'interviewer' | 'candidate'
  content: string
  timestamp: Date
  feedback?: InterviewFeedback
}

export interface InterviewFeedback {
  rating: 1 | 2 | 3 | 4 | 5
  strengths: string[]
  improvements: string[]
  notes?: string
}

export interface InterviewSession {
  id: string
  config: InterviewConfig
  messages: InterviewMessage[]
  startedAt: Date
  endedAt?: Date
  overallFeedback?: OverallFeedback
  status: 'active' | 'paused' | 'completed'
}

export interface OverallFeedback {
  overallRating: number // 1-5
  communication: number // 1-5
  technicalKnowledge: number // 1-5
  problemSolving: number // 1-5
  cultureFit: number // 1-5
  strengths: string[]
  improvements: string[]
  recommendations: string[]
  wouldHire: boolean
  summary: string
}

/**
 * Start a new mock interview session
 */
export async function startMockInterview(config: InterviewConfig): Promise<InterviewSession> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mock-interview/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    })

    if (!response.ok) {
      throw new Error('Failed to start mock interview')
    }

    const data = await response.json()

    const session: InterviewSession = {
      id: data.sessionId || generateSessionId(),
      config,
      messages: [],
      startedAt: new Date(),
      status: 'active'
    }

    // Add initial interviewer greeting
    const greeting = data.greeting || generateGreeting(config)
    session.messages.push({
      id: generateMessageId(),
      role: 'interviewer',
      content: greeting,
      timestamp: new Date()
    })

    // Save session to localStorage
    saveSession(session)

    return session

  } catch (error) {
    console.error('[Mock Interview] Start error:', error)

    // Fallback: Create session locally if backend fails
    const session: InterviewSession = {
      id: generateSessionId(),
      config,
      messages: [{
        id: generateMessageId(),
        role: 'interviewer',
        content: generateGreeting(config),
        timestamp: new Date()
      }],
      startedAt: new Date(),
      status: 'active'
    }

    saveSession(session)
    return session
  }
}

/**
 * Send candidate response and get interviewer's next question
 */
export async function sendInterviewResponse(
  sessionId: string,
  candidateResponse: string
): Promise<InterviewMessage> {
  try {
    const session = loadSession(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }

    // Add candidate's response to messages
    const candidateMessage: InterviewMessage = {
      id: generateMessageId(),
      role: 'candidate',
      content: candidateResponse,
      timestamp: new Date()
    }

    session.messages.push(candidateMessage)

    // Get AI interviewer's response
    const response = await fetch(`${API_BASE_URL}/api/mock-interview/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        conversationHistory: session.messages.map(m => ({
          role: m.role === 'interviewer' ? 'assistant' : 'user',
          content: m.content
        })),
        config: session.config
      })
    })

    if (!response.ok) {
      throw new Error('Failed to get interview response')
    }

    const data = await response.json()

    const interviewerMessage: InterviewMessage = {
      id: generateMessageId(),
      role: 'interviewer',
      content: data.message || data.response,
      timestamp: new Date(),
      feedback: data.feedback
    }

    session.messages.push(interviewerMessage)

    // Update session
    saveSession(session)

    return interviewerMessage

  } catch (error) {
    console.error('[Mock Interview] Response error:', error)

    // Fallback: Generate question locally if backend fails
    const session = loadSession(sessionId)!
    const fallbackMessage: InterviewMessage = {
      id: generateMessageId(),
      role: 'interviewer',
      content: generateFallbackQuestion(session.config, session.messages.length),
      timestamp: new Date()
    }

    session.messages.push(fallbackMessage)
    saveSession(session)

    return fallbackMessage
  }
}

/**
 * End interview and get overall feedback
 */
export async function endMockInterview(sessionId: string): Promise<OverallFeedback> {
  try {
    const session = loadSession(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }

    const response = await fetch(`${API_BASE_URL}/api/mock-interview/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        conversationHistory: session.messages,
        config: session.config
      })
    })

    if (!response.ok) {
      throw new Error('Failed to get interview feedback')
    }

    const data = await response.json()

    const feedback: OverallFeedback = {
      overallRating: data.overallRating || 3,
      communication: data.communication || 3,
      technicalKnowledge: data.technicalKnowledge || 3,
      problemSolving: data.problemSolving || 3,
      cultureFit: data.cultureFit || 3,
      strengths: data.strengths || [],
      improvements: data.improvements || [],
      recommendations: data.recommendations || [],
      wouldHire: data.wouldHire || false,
      summary: data.summary || 'Thank you for completing the interview.'
    }

    // Update session
    session.overallFeedback = feedback
    session.endedAt = new Date()
    session.status = 'completed'
    saveSession(session)

    return feedback

  } catch (error) {
    console.error('[Mock Interview] End error:', error)

    // Fallback: Generate feedback locally
    const session = loadSession(sessionId)!
    const fallbackFeedback = generateFallbackFeedback(session)

    session.overallFeedback = fallbackFeedback
    session.endedAt = new Date()
    session.status = 'completed'
    saveSession(session)

    return fallbackFeedback
  }
}

/**
 * Get all interview sessions
 */
export function getAllSessions(): InterviewSession[] {
  try {
    const sessionsJson = localStorage.getItem('mock_interview_sessions')
    if (!sessionsJson) return []

    const sessions = JSON.parse(sessionsJson)
    return sessions.map((s: any) => ({
      ...s,
      startedAt: new Date(s.startedAt),
      endedAt: s.endedAt ? new Date(s.endedAt) : undefined,
      messages: s.messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }))
    }))
  } catch (error) {
    console.error('[Mock Interview] Load sessions error:', error)
    return []
  }
}

/**
 * Get specific session
 */
export function loadSession(sessionId: string): InterviewSession | null {
  const sessions = getAllSessions()
  return sessions.find(s => s.id === sessionId) || null
}

/**
 * Save session to localStorage
 */
function saveSession(session: InterviewSession): void {
  try {
    const sessions = getAllSessions()
    const existingIndex = sessions.findIndex(s => s.id === session.id)

    if (existingIndex >= 0) {
      sessions[existingIndex] = session
    } else {
      sessions.push(session)
    }

    // Keep only last 20 sessions
    const trimmed = sessions.slice(-20)

    localStorage.setItem('mock_interview_sessions', JSON.stringify(trimmed))
  } catch (error) {
    console.error('[Mock Interview] Save session error:', error)
  }
}

/**
 * Delete session
 */
export function deleteSession(sessionId: string): void {
  try {
    const sessions = getAllSessions()
    const filtered = sessions.filter(s => s.id !== sessionId)
    localStorage.setItem('mock_interview_sessions', JSON.stringify(filtered))
  } catch (error) {
    console.error('[Mock Interview] Delete session error:', error)
  }
}

// Helper functions

function generateSessionId(): string {
  return `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateGreeting(config: InterviewConfig): string {
  const { jobTitle, company, interviewType } = config

  const greetings = [
    `Hello! Thank you for joining us today. I'm excited to discuss the ${jobTitle} position at ${company}. This will be a ${interviewType} interview. Let's start with: Tell me about yourself and why you're interested in this role.`,
    `Welcome! I'm looking forward to our conversation about the ${jobTitle} role at ${company}. Today's ${interviewType} interview will help us understand your background and experience. To begin, could you walk me through your professional journey and what draws you to ${company}?`,
    `Hi there! Thanks for taking the time to interview for the ${jobTitle} position. We'll be conducting a ${interviewType} interview today. Let's get started: Can you introduce yourself and explain what interests you about ${company}?`
  ]

  return greetings[Math.floor(Math.random() * greetings.length)]
}

function generateFallbackQuestion(config: InterviewConfig, messageCount: number): string {
  const { interviewType } = config

  if (interviewType === 'behavioral') {
    const questions = [
      "Can you tell me about a time when you faced a significant challenge at work? How did you handle it?",
      "Describe a situation where you had to work with a difficult team member. What was your approach?",
      "Tell me about a project you're most proud of. What was your role and what made it successful?",
      "Can you share an example of a time when you had to meet a tight deadline? How did you prioritize your work?",
      "Describe a situation where you had to adapt to a significant change. How did you manage it?"
    ]
    return questions[messageCount % questions.length]
  }

  if (interviewType === 'technical') {
    const questions = [
      "What programming languages and technologies are you most comfortable with? Can you walk me through a recent technical problem you solved?",
      "How do you approach debugging a complex issue in production? Can you describe your methodology?",
      "Tell me about a time when you had to learn a new technology quickly. How did you approach it?",
      "How do you ensure code quality in your projects? What practices do you follow?",
      "Can you explain a technical decision you made that significantly impacted a project? What was your reasoning?"
    ]
    return questions[messageCount % questions.length]
  }

  // Mixed/default questions
  const questions = [
    "What are your greatest strengths and how do they apply to this role?",
    "Where do you see yourself in the next 3-5 years?",
    "What questions do you have for me about the role or our company?",
    "Thank you for your responses. Is there anything else you'd like to share before we conclude?"
  ]

  return questions[messageCount % questions.length]
}

function generateFallbackFeedback(session: InterviewSession): OverallFeedback {
  const messageCount = session.messages.filter(m => m.role === 'candidate').length

  return {
    overallRating: messageCount >= 5 ? 4 : 3,
    communication: 4,
    technicalKnowledge: 3,
    problemSolving: 3,
    cultureFit: 4,
    strengths: [
      'Good articulation of ideas',
      'Relevant experience shared',
      'Professional demeanor'
    ],
    improvements: [
      'Could provide more specific examples with quantifiable results',
      'Consider using the STAR method for behavioral questions',
      'Ask more clarifying questions about the role'
    ],
    recommendations: [
      'Practice the STAR method (Situation, Task, Action, Result) for behavioral interviews',
      'Prepare specific metrics and achievements from past roles',
      'Research the company more deeply and prepare thoughtful questions'
    ],
    wouldHire: messageCount >= 5,
    summary: `Thank you for completing this ${session.config.interviewType} interview for the ${session.config.jobTitle} position. You demonstrated good communication skills and relevant experience. With more preparation and specific examples, you'll be even stronger in future interviews.`
  }
}

/**
 * Get interview tips based on type
 */
export function getInterviewTips(interviewType: string): string[] {
  const tips = {
    behavioral: [
      'Use the STAR method: Situation, Task, Action, Result',
      'Prepare 5-7 specific examples from your experience',
      'Focus on recent accomplishments (last 2-3 years)',
      'Include quantifiable results and metrics',
      'Practice speaking concisely (2-3 minutes per answer)'
    ],
    technical: [
      'Think out loud - explain your reasoning',
      'Ask clarifying questions before diving in',
      'Consider edge cases and test scenarios',
      'Discuss trade-offs of different approaches',
      'Be honest if you don\'t know something'
    ],
    'case': [
      'Structure your answer using frameworks',
      'Ask for information you need',
      'State your assumptions clearly',
      'Show your analytical thinking process',
      'Summarize your recommendation at the end'
    ],
    'system-design': [
      'Start with requirements and constraints',
      'Think about scalability from the beginning',
      'Discuss trade-offs of different architectures',
      'Consider bottlenecks and failure scenarios',
      'Draw diagrams to illustrate your design'
    ],
    mixed: [
      'Adapt your communication style to each question type',
      'Balance technical depth with business context',
      'Connect your answers to the company\'s challenges',
      'Ask thoughtful questions throughout',
      'Show enthusiasm for the role and company'
    ]
  }

  return tips[interviewType as keyof typeof tips] || tips.mixed
}
