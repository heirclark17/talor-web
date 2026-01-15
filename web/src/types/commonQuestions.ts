/**
 * TypeScript types for Common Interview Questions feature
 */

export interface ExceptionalAnswerBuilder {
  structure: string[]
  customization_checklist: string[]
  strong_phrases: string[]
}

export interface WhatToSay {
  short: string
  long: string
  placeholders_used: string[]
}

export interface CommonInterviewQuestion {
  id: string
  question: string
  why_hard: string
  common_mistakes: string[]
  exceptional_answer_builder: ExceptionalAnswerBuilder
  what_to_say: WhatToSay
}

export interface CommonQuestionsData {
  questions: CommonInterviewQuestion[]
}

export interface CommonQuestionsResponse {
  success: boolean
  data: CommonQuestionsData
}
