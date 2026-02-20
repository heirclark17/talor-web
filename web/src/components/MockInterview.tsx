import React, { useState, useEffect, useRef } from 'react'
import {
  MessageCircle,
  Send,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PauseCircle,
  PlayCircle,
  StopCircle,
  Loader2,
  Star,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Award,
  AlertCircle,
  X,
  ArrowRight
} from 'lucide-react'
import {
  type InterviewConfig,
  type InterviewSession,
  type InterviewMessage,
  type OverallFeedback,
  startMockInterview,
  sendInterviewResponse,
  endMockInterview,
  getInterviewTips
} from '../lib/mockInterview'
import { showSuccess, showError } from '../utils/toast'

interface MockInterviewProps {
  config: InterviewConfig
  onComplete: (feedback: OverallFeedback) => void
  onCancel: () => void
}

export default function MockInterview({ config, onComplete, onCancel }: MockInterviewProps) {
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [currentResponse, setCurrentResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showTips, setShowTips] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Initialize interview
  useEffect(() => {
    initializeInterview()
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages])

  // Focus input after interviewer responds
  useEffect(() => {
    if (!isLoading && session?.status === 'active') {
      inputRef.current?.focus()
    }
  }, [isLoading, session?.status])

  const initializeInterview = async () => {
    try {
      setIsLoading(true)
      const newSession = await startMockInterview(config)
      setSession(newSession)
      setIsLoading(false)
      showSuccess('Interview started! Take your time with each response.')
    } catch (error) {
      console.error('[Mock Interview] Init error:', error)
      showError('Failed to start interview. Please try again.')
      setIsLoading(false)
    }
  }

  const handleSendResponse = async () => {
    if (!currentResponse.trim() || !session || isLoading || isPaused) return

    const response = currentResponse.trim()
    setCurrentResponse('')
    setIsLoading(true)

    try {
      const interviewerMessage = await sendInterviewResponse(session.id, response)

      // Update session with new messages
      setSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages]
      } : null)

      setIsLoading(false)
    } catch (error) {
      console.error('[Mock Interview] Response error:', error)
      showError('Failed to send response. Please try again.')
      setIsLoading(false)
    }
  }

  const handleEndInterview = async () => {
    if (!session) return

    if (!confirm('Are you sure you want to end this interview? You\'ll receive feedback on your performance.')) {
      return
    }

    setIsLoading(true)

    try {
      const feedback = await endMockInterview(session.id)
      setIsLoading(false)
      onComplete(feedback)
    } catch (error) {
      console.error('[Mock Interview] End error:', error)
      showError('Failed to end interview. Please try again.')
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendResponse()
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-theme">Starting interview...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[800px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-theme-subtle bg-theme-glass-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-theme">{config.jobTitle} at {config.company}</h3>
            <p className="text-sm text-theme-secondary capitalize">{config.interviewType} Interview</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Controls */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              audioEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-theme-glass-10 text-theme-tertiary'
            }`}
            title={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              videoEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-theme-glass-10 text-theme-tertiary'
            }`}
            title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-lg transition-colors ${
              isPaused ? 'bg-yellow-500/20 text-yellow-400' : 'bg-theme-glass-10 text-theme-tertiary'
            }`}
            title={isPaused ? 'Resume interview' : 'Pause interview'}
          >
            {isPaused ? <PlayCircle className="w-5 h-5" /> : <PauseCircle className="w-5 h-5" />}
          </button>

          <button
            onClick={handleEndInterview}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium"
          >
            <StopCircle className="w-4 h-4 inline mr-2" />
            End Interview
          </button>

          <button
            onClick={onCancel}
            className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-theme-tertiary" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Messages */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {session.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'interviewer'
                      ? 'bg-theme-glass-10 border border-theme-subtle'
                      : 'bg-blue-500/20 border border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-theme">
                      {message.role === 'interviewer' ? 'Interviewer' : 'You'}
                    </span>
                    <span className="text-xs text-theme-tertiary">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-theme whitespace-pre-wrap">{message.content}</p>

                  {/* Instant feedback */}
                  {message.feedback && (
                    <div className="mt-3 pt-3 border-t border-theme-subtle">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium text-theme">Feedback</span>
                      </div>
                      {message.feedback.strengths.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-green-400 font-medium mb-1">Strengths:</p>
                          <ul className="text-xs text-theme-secondary space-y-1">
                            {message.feedback.strengths.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {message.feedback.improvements.length > 0 && (
                        <div>
                          <p className="text-xs text-yellow-400 font-medium mb-1">Could improve:</p>
                          <ul className="text-xs text-theme-secondary space-y-1">
                            {message.feedback.improvements.map((i, idx) => (
                              <li key={idx}>• {i}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-theme-glass-10 border border-theme-subtle rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-sm text-theme-secondary">Interviewer is typing...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Paused indicator */}
            {isPaused && (
              <div className="flex justify-center">
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-4 py-2">
                  <p className="text-sm text-yellow-400 flex items-center gap-2">
                    <PauseCircle className="w-4 h-4" />
                    Interview paused - Click play to continue
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-theme-subtle bg-theme-glass-5 p-4">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={currentResponse}
                onChange={(e) => setCurrentResponse(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isPaused ? 'Interview paused...' : 'Type your response...'}
                disabled={isLoading || isPaused || session.status !== 'active'}
                className="flex-1 px-4 py-3 bg-theme-glass-10 border border-theme-subtle rounded-xl text-theme placeholder-theme-tertiary resize-none focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                rows={3}
              />
              <button
                onClick={handleSendResponse}
                disabled={!currentResponse.trim() || isLoading || isPaused || session.status !== 'active'}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
            <p className="mt-2 text-xs text-theme-tertiary">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Tips sidebar */}
        {showTips && (
          <div className="w-80 border-l border-theme-subtle bg-theme-glass-5 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-theme flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                Interview Tips
              </h3>
              <button
                onClick={() => setShowTips(false)}
                className="p-1 hover:bg-theme-glass-10 rounded transition-colors"
              >
                <X className="w-4 h-4 text-theme-tertiary" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm font-medium text-blue-400 mb-2 capitalize">
                  {config.interviewType} Interview Tips
                </p>
                <ul className="text-xs text-theme-secondary space-y-2">
                  {getInterviewTips(config.interviewType).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-blue-400" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-theme-glass-10 border border-theme-subtle rounded-lg">
                <p className="text-sm font-medium text-theme mb-2">General Tips</p>
                <ul className="text-xs text-theme-secondary space-y-2">
                  <li>• Take your time to think before responding</li>
                  <li>• Be specific and provide concrete examples</li>
                  <li>• Stay positive and professional</li>
                  <li>• Ask clarifying questions if needed</li>
                  <li>• Show enthusiasm for the role</li>
                </ul>
              </div>

              <div className="text-center pt-4">
                <p className="text-xs text-theme-tertiary">
                  {session.messages.filter(m => m.role === 'candidate').length} responses so far
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
