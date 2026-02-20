import React, { useState, useEffect, useRef } from 'react'
import { api } from '../api/client'
import {
  Loader2,
  PlayCircle,
  StopCircle,
  Video,
  Mic,
  Sparkles,
  Save,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface PracticeQuestion {
  question: string
  category: string
  difficulty: string
  why_asked: string
  key_skills_tested: string[]
}

interface StarStory {
  situation: string
  task: string
  action: string
  result: string
}

interface SavedResponse {
  id: number
  question_text: string
  question_category: string
  star_story: StarStory | null
  audio_recording_url: string | null
  video_recording_url: string | null
  written_answer: string | null
  times_practiced: number
  last_practiced_at: string | null
}

interface PracticeQuestionsProps {
  interviewPrepId: number
}

export default function PracticeQuestions({ interviewPrepId }: PracticeQuestionsProps) {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [savedResponses, setSavedResponses] = useState<Record<string, SavedResponse>>({})
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

  // Per-question state
  const [generatingStory, setGeneratingStory] = useState<Record<number, boolean>>({})
  const [starStories, setStarStories] = useState<Record<number, StarStory>>({})
  const [writtenAnswers, setWrittenAnswers] = useState<Record<number, string>>({})
  const [recording, setRecording] = useState<Record<number, 'audio' | 'video' | null>>({})
  const [recordingStartTime, setRecordingStartTime] = useState<Record<number, number>>({})
  const [saving, setSaving] = useState<Record<number, boolean>>({})
  const [saveSuccess, setSaveSuccess] = useState<Record<number, boolean>>({})

  // Media recording refs
  const mediaRecorderRef = useRef<Record<number, MediaRecorder | null>>({})
  const chunksRef = useRef<Record<number, Blob[]>>({})
  const videoPreviewRef = useRef<Record<number, HTMLVideoElement | null>>({})

  useEffect(() => {
    loadSavedResponses()
  }, [interviewPrepId])

  const loadSavedResponses = async () => {
    const result = await api.getPracticeResponses(interviewPrepId)
    if (result.success && result.data) {
      const responsesMap: Record<string, SavedResponse> = {}
      result.data.forEach((response: SavedResponse) => {
        responsesMap[response.question_text] = response
        if (response.star_story) {
          const questionIndex = questions.findIndex(q => q.question === response.question_text)
          if (questionIndex !== -1) {
            setStarStories(prev => ({ ...prev, [questionIndex]: response.star_story! }))
          }
        }
        if (response.written_answer) {
          const questionIndex = questions.findIndex(q => q.question === response.question_text)
          if (questionIndex !== -1) {
            setWrittenAnswers(prev => ({ ...prev, [questionIndex]: response.written_answer! }))
          }
        }
      })
      setSavedResponses(responsesMap)
    }
  }

  const generateQuestions = async () => {
    setGenerating(true)
    try {
      const result = await api.generatePracticeQuestions({
        interview_prep_id: interviewPrepId,
        num_questions: 10,
      })

      if (result.success && result.data) {
        setQuestions(result.data)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error: any) {
      alert(`Error generating questions: ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  const generateStarStoryForQuestion = async (questionIndex: number) => {
    const question = questions[questionIndex]
    setGeneratingStory(prev => ({ ...prev, [questionIndex]: true }))

    try {
      const result = await api.generateStarStory({
        interview_prep_id: interviewPrepId,
        question: question.question,
      })

      if (result.success && result.data) {
        setStarStories(prev => ({ ...prev, [questionIndex]: result.data }))
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error: any) {
      alert(`Error generating STAR story: ${error.message}`)
    } finally {
      setGeneratingStory(prev => ({ ...prev, [questionIndex]: false }))
    }
  }

  const startRecording = async (questionIndex: number, type: 'audio' | 'video') => {
    try {
      const constraints = type === 'video'
        ? { video: true, audio: true }
        : { audio: true }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (type === 'video' && videoPreviewRef.current[questionIndex]) {
        videoPreviewRef.current[questionIndex]!.srcObject = stream
        videoPreviewRef.current[questionIndex]!.play()
      }

      const mediaRecorder = new MediaRecorder(stream)
      chunksRef.current[questionIndex] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current[questionIndex].push(e.data)
        }
      }

      mediaRecorder.start()
      mediaRecorderRef.current[questionIndex] = mediaRecorder

      setRecording(prev => ({ ...prev, [questionIndex]: type }))
      setRecordingStartTime(prev => ({ ...prev, [questionIndex]: Date.now() }))
    } catch (error: any) {
      alert(`Error starting recording: ${error.message}`)
    }
  }

  const stopRecording = (questionIndex: number) => {
    const mediaRecorder = mediaRecorderRef.current[questionIndex]
    if (!mediaRecorder) return

    return new Promise<Blob>((resolve) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current[questionIndex], {
          type: recording[questionIndex] === 'video' ? 'video/webm' : 'audio/webm'
        })

        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop())

        // Clear video preview
        if (videoPreviewRef.current[questionIndex]) {
          videoPreviewRef.current[questionIndex]!.srcObject = null
        }

        setRecording(prev => ({ ...prev, [questionIndex]: null }))
        resolve(blob)
      }

      mediaRecorder.stop()
    })
  }

  const saveResponse = async (questionIndex: number) => {
    const question = questions[questionIndex]
    const isRecording = recording[questionIndex]

    setSaving(prev => ({ ...prev, [questionIndex]: true }))

    try {
      let recordingBlob: Blob | null = null
      let duration = 0

      // Stop recording if active
      if (isRecording) {
        recordingBlob = await stopRecording(questionIndex) ?? null
        duration = Math.floor((Date.now() - (recordingStartTime[questionIndex] || Date.now())) / 1000)
      }

      // For now, we'll store recordings as base64 data URLs
      // In production, you'd upload to S3/cloud storage
      let audioUrl: string | undefined
      let videoUrl: string | undefined

      if (recordingBlob) {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(recordingBlob)
        })

        if (recording[questionIndex] === 'audio') {
          audioUrl = dataUrl
        } else {
          videoUrl = dataUrl
        }
      }

      const result = await api.savePracticeResponse({
        interview_prep_id: interviewPrepId,
        question_text: question.question,
        question_category: question.category,
        star_story: starStories[questionIndex] || undefined,
        audio_recording_url: audioUrl,
        video_recording_url: videoUrl,
        written_answer: writtenAnswers[questionIndex] || undefined,
        practice_duration_seconds: duration || undefined,
      })

      if (result.success) {
        setSaveSuccess(prev => ({ ...prev, [questionIndex]: true }))
        setTimeout(() => {
          setSaveSuccess(prev => ({ ...prev, [questionIndex]: false }))
        }, 3000)
        await loadSavedResponses()
      } else {
        alert(`Error saving response: ${result.error}`)
      }
    } catch (error: any) {
      alert(`Error saving response: ${error.message}`)
    } finally {
      setSaving(prev => ({ ...prev, [questionIndex]: false }))
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      behavioral: 'bg-blue-500/20 text-blue-300',
      technical: 'bg-purple-500/20 text-purple-300',
      situational: 'bg-green-500/20 text-green-300',
      role_specific: 'bg-orange-500/20 text-orange-300',
    }
    return colors[category] || 'bg-gray-500/20 text-theme-secondary'
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'text-green-400',
      medium: 'text-yellow-400',
      hard: 'text-red-400',
    }
    return colors[difficulty] || 'text-theme-secondary'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-theme animate-spin mr-2" />
        <span className="text-theme-secondary">Loading practice questions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-theme mb-2">AI Practice Questions</h3>
          <p className="text-theme-secondary text-sm">
            Get tailored interview questions based on this specific job description
          </p>
        </div>
        {questions.length === 0 && (
          <button
            onClick={generateQuestions}
            disabled={generating}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Practice Questions
              </>
            )}
          </button>
        )}
      </div>

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((question, idx) => {
            const isExpanded = expandedQuestion === idx
            const savedResponse = savedResponses[question.question]

            return (
              <div
                key={idx}
                className="bg-theme-glass-5 border border-theme-subtle rounded-lg overflow-hidden"
              >
                {/* Question Header */}
                <button
                  onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                  className="w-full p-5 flex items-start justify-between hover:bg-theme-glass-5 transition-colors text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(question.category)}`}>
                        {question.category}
                      </span>
                      <span className={`text-xs font-semibold ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty.toUpperCase()}
                      </span>
                      {savedResponse && (
                        <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Practiced {savedResponse.times_practiced}x
                        </span>
                      )}
                    </div>
                    <h4 className="text-theme font-medium text-base leading-relaxed">
                      {question.question}
                    </h4>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-theme-secondary ml-4 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-theme-secondary ml-4 flex-shrink-0" />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 pt-4">
                    {/* Why Asked & Skills */}
                    <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded">
                      <div className="text-xs font-semibold text-blue-300 mb-2">
                        💡 WHY THIS QUESTION
                      </div>
                      <p className="text-theme text-sm mb-3">{question.why_asked}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-blue-300 font-semibold">Skills tested:</span>
                        {question.key_skills_tested.map((skill, skillIdx) => (
                          <span
                            key={skillIdx}
                            className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* STAR Story */}
                    {!starStories[idx] && (
                      <button
                        onClick={() => generateStarStoryForQuestion(idx)}
                        disabled={generatingStory[idx]}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {generatingStory[idx] ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating STAR Story...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Generate AI STAR Story
                          </>
                        )}
                      </button>
                    )}

                    {starStories[idx] && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-green-400" />
                          <span className="text-green-300 font-semibold">AI-Generated STAR Story</span>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-green-300 mb-1">SITUATION</div>
                          <p className="text-theme text-sm">{starStories[idx].situation}</p>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-green-300 mb-1">TASK</div>
                          <p className="text-theme text-sm">{starStories[idx].task}</p>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-green-300 mb-1">ACTION</div>
                          <p className="text-theme text-sm">{starStories[idx].action}</p>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-green-300 mb-1">RESULT</div>
                          <p className="text-theme text-sm">{starStories[idx].result}</p>
                        </div>
                      </div>
                    )}

                    {/* Written Answer */}
                    <div>
                      <label className="text-theme text-sm font-semibold mb-2 block">
                        Your Written Answer (Optional)
                      </label>
                      <textarea
                        value={writtenAnswers[idx] || ''}
                        onChange={(e) =>
                          setWrittenAnswers(prev => ({ ...prev, [idx]: e.target.value }))
                        }
                        placeholder="Type your answer here..."
                        className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg p-3 text-theme-secondary min-h-[100px] focus:outline-none focus:border-theme-muted"
                      />
                    </div>

                    {/* Recording Controls */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-theme text-sm font-semibold mb-2 block">
                          Audio Recording
                        </label>
                        {!recording[idx] ? (
                          <button
                            onClick={() => startRecording(idx, 'audio')}
                            className="w-full flex items-center justify-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-3 rounded-lg hover:bg-blue-500/30 transition-colors"
                          >
                            <Mic className="w-5 h-5" />
                            Start Audio Recording
                          </button>
                        ) : recording[idx] === 'audio' ? (
                          <button
                            onClick={() => saveResponse(idx)}
                            className="w-full flex items-center justify-center gap-2 bg-red-500/20 text-red-300 px-4 py-3 rounded-lg hover:bg-red-500/30 transition-colors animate-pulse"
                          >
                            <StopCircle className="w-5 h-5" />
                            Stop & Save
                          </button>
                        ) : null}
                      </div>

                      <div>
                        <label className="text-theme text-sm font-semibold mb-2 block">
                          Video Recording
                        </label>
                        {!recording[idx] ? (
                          <button
                            onClick={() => startRecording(idx, 'video')}
                            className="w-full flex items-center justify-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-3 rounded-lg hover:bg-purple-500/30 transition-colors"
                          >
                            <Video className="w-5 h-5" />
                            Start Video Recording
                          </button>
                        ) : recording[idx] === 'video' ? (
                          <button
                            onClick={() => saveResponse(idx)}
                            className="w-full flex items-center justify-center gap-2 bg-red-500/20 text-red-300 px-4 py-3 rounded-lg hover:bg-red-500/30 transition-colors animate-pulse"
                          >
                            <StopCircle className="w-5 h-5" />
                            Stop & Save
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* Video Preview */}
                    {recording[idx] === 'video' && (
                      <div className="bg-black rounded-lg overflow-hidden">
                        <video
                          ref={(el) => {
                            if (el) videoPreviewRef.current[idx] = el
                          }}
                          className="w-full"
                          muted
                        />
                      </div>
                    )}

                    {/* Save Button (if not recording) */}
                    {!recording[idx] && (
                      <button
                        onClick={() => saveResponse(idx)}
                        disabled={saving[idx]}
                        className="w-full flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {saving[idx] ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                          </>
                        ) : saveSuccess[idx] ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            Saved!
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save Response
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
