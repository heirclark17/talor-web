import { describe, it, expect } from 'vitest'
import type {
  CommonInterviewQuestion,
  CommonQuestionsData,
  CommonQuestionsResponse,
  ExceptionalAnswerBuilder,
  WhatToSay
} from './commonQuestions'

describe('Common Questions Types', () => {
  it('should allow valid CommonInterviewQuestion object', () => {
    const question: CommonInterviewQuestion = {
      id: 'q1',
      question: 'Tell me about yourself',
      why_hard: 'Open ended',
      common_mistakes: ['Too long'],
      exceptional_answer_builder: {
        structure: ['Intro', 'Body', 'Close'],
        customization_checklist: ['Research company'],
        strong_phrases: ['Proven track record']
      },
      what_to_say: {
        short: 'Brief version',
        long: 'Detailed version',
        placeholders_used: []
      }
    }

    expect(question.id).toBe('q1')
  })

  it('should allow valid ExceptionalAnswerBuilder object', () => {
    const builder: ExceptionalAnswerBuilder = {
      structure: ['Part 1', 'Part 2'],
      customization_checklist: ['Step 1'],
      strong_phrases: ['Phrase 1']
    }

    expect(builder.structure).toHaveLength(2)
  })

  it('should allow valid WhatToSay object', () => {
    const answer: WhatToSay = {
      short: 'Short answer',
      long: 'Long answer',
      placeholders_used: ['[company]']
    }

    expect(answer.short).toBe('Short answer')
  })

  it('should allow valid CommonQuestionsResponse object', () => {
    const response: CommonQuestionsResponse = {
      success: true,
      data: {
        questions: []
      }
    }

    expect(response.success).toBe(true)
  })
})
