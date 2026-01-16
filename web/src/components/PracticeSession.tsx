import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, X, Clock, Mic, MicOff, CheckCircle } from 'lucide-react'

interface STARStory {
  id?: string
  title: string
  situation: string
  task: string
  action: string
  result: string
  key_themes: string[]
  talking_points: string[]
}

interface Props {
  story: STARStory
  onClose: () => void
}

export default function PracticeSession({ story, onClose }: Props) {
  const [isRunning, setIsRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [currentSection, setCurrentSection] = useState<'situation' | 'task' | 'action' | 'result' | 'complete'>('situation')
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [showInstructions, setShowInstructions] = useState(true)

  // Estimated time per section (in seconds)
  const sectionTime = {
    situation: 60, // 1 minute
    task: 45, // 45 seconds
    action: 150, // 2.5 minutes (most important)
    result: 60, // 1 minute
  }

  // Total target time: 3-5 minutes (let's aim for 5 minutes = 315 seconds)
  const targetTime = 300 // 5 minutes

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          const newSeconds = prevSeconds + 1

          // Auto-advance sections based on time
          if (newSeconds === sectionTime.situation && currentSection === 'situation') {
            setCurrentSection('task')
          } else if (newSeconds === sectionTime.situation + sectionTime.task && currentSection === 'task') {
            setCurrentSection('action')
          } else if (newSeconds === sectionTime.situation + sectionTime.task + sectionTime.action && currentSection === 'action') {
            setCurrentSection('result')
          } else if (newSeconds >= targetTime && currentSection === 'result') {
            setCurrentSection('complete')
            setIsRunning(false)
          }

          return newSeconds
        })
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, currentSection])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsRunning(true)
    if (seconds === 0) {
      setCurrentSection('situation')
    }
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setSeconds(0)
    setCurrentSection('situation')
    setIsRecording(false)
  }

  const handleNextSection = () => {
    const sections: Array<'situation' | 'task' | 'action' | 'result' | 'complete'> = ['situation', 'task', 'action', 'result', 'complete']
    const currentIndex = sections.indexOf(currentSection)
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1])
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const audioChunks: BlobPart[] = []

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('Could not access microphone. Please check your permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `star-story-${story.title.replace(/\s+/g, '-')}-${Date.now()}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'situation':
        return 'text-green-400'
      case 'task':
        return 'text-blue-400'
      case 'action':
        return 'text-purple-400'
      case 'result':
        return 'text-yellow-400'
      default:
        return 'text-white'
    }
  }

  const getSectionProgress = () => {
    const totalSectionTime = sectionTime[currentSection as keyof typeof sectionTime] || 60
    const sectionStart = currentSection === 'situation' ? 0 :
                         currentSection === 'task' ? sectionTime.situation :
                         currentSection === 'action' ? sectionTime.situation + sectionTime.task :
                         sectionTime.situation + sectionTime.task + sectionTime.action

    const sectionElapsed = Math.max(0, seconds - sectionStart)
    return Math.min(100, (sectionElapsed / totalSectionTime) * 100)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 glass border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Practice Session</h2>
            <p className="text-gray-400">{story.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions Panel */}
          {showInstructions && (
            <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-blue-400">How to Use This Practice Session</h3>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <p className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span>Click <strong className="text-white">"Start Practice"</strong> to begin the timer and recording (optional)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span>Speak out loud through each STAR section. The timer will auto-advance through sections.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span>Focus on the <strong className="text-purple-400">ACTION</strong> section (2.5 minutes) - this is the most important part</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">4.</span>
                  <span>Try to complete your story within <strong className="text-white">3-5 minutes</strong> total</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">5.</span>
                  <span>Use the <strong className="text-white">Record</strong> button to capture your practice and <strong className="text-white">Play</strong> to review</span>
                </p>
              </div>
            </div>
          )}

          {/* Audio Recording Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRecording && !audioUrl && (
              <button
                onClick={startRecording}
                className="btn-secondary flex items-center gap-2 px-6 py-3"
                disabled={isRunning}
              >
                <Mic className="w-5 h-5" />
                Start Recording
              </button>
            )}
            {isRecording && (
              <button
                onClick={stopRecording}
                className="btn-danger flex items-center gap-2 px-6 py-3 animate-pulse"
              >
                <MicOff className="w-5 h-5" />
                Stop Recording
              </button>
            )}
            {audioUrl && !isRecording && (
              <div className="glass rounded-xl p-4 border border-white/10 flex items-center gap-4 w-full max-w-2xl">
                <div className="flex-1">
                  <audio src={audioUrl} controls className="w-full" />
                </div>
                <button
                  onClick={downloadRecording}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  <FileDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setAudioUrl(null)
                    setAudioBlob(null)
                  }}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Timer Display */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 glass rounded-2xl px-8 py-4 border border-white/10">
              <Clock className="w-8 h-8 text-white" />
              <div className="text-5xl font-bold text-white font-mono">{formatTime(seconds)}</div>
              <div className="text-sm text-gray-400">/ {formatTime(targetTime)}</div>
            </div>

            {/* Overall Progress */}
            <div className="mt-4 max-w-md mx-auto">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 via-purple-400 to-yellow-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, (seconds / targetTime) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Current Section */}
          {currentSection !== 'complete' && (
            <div className="glass rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-2xl font-bold uppercase ${getSectionColor(currentSection)}`}>
                  {currentSection}
                </h3>
                <div className="text-sm text-gray-400">
                  {formatTime(Math.floor(getSectionProgress() / 100 * (sectionTime[currentSection as keyof typeof sectionTime] || 60)))} / {formatTime(sectionTime[currentSection as keyof typeof sectionTime] || 60)}
                </div>
              </div>

              {/* Section Progress */}
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full transition-all duration-300 ${
                    currentSection === 'situation' ? 'bg-green-400' :
                    currentSection === 'task' ? 'bg-blue-400' :
                    currentSection === 'action' ? 'bg-purple-400' :
                    'bg-yellow-400'
                  }`}
                  style={{ width: `${getSectionProgress()}%` }}
                />
              </div>

              {/* Section Content (Reference) */}
              <div className="bg-white/5 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {story[currentSection as keyof STARStory] as string}
                </p>
              </div>

              <button
                onClick={handleNextSection}
                className="w-full btn-secondary py-2 text-sm"
              >
                Next Section →
              </button>
            </div>
          )}

          {/* Complete State */}
          {currentSection === 'complete' && (
            <div className="glass rounded-xl p-8 border border-white/10 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Great Job!</h3>
              <p className="text-gray-400 mb-4">
                You completed your practice session in {formatTime(seconds)}
              </p>
              <div className="text-sm text-gray-500">
                Target time: 3-5 minutes {seconds >= 180 && seconds <= 300 ? '✓' : ''}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRunning && seconds === 0 && (
              <button
                onClick={handleStart}
                className="btn-primary flex items-center gap-2 px-8 py-4 text-lg"
              >
                <Play className="w-6 h-6" />
                Start Practice
              </button>
            )}

            {!isRunning && seconds > 0 && currentSection !== 'complete' && (
              <button
                onClick={handleStart}
                className="btn-primary flex items-center gap-2 px-8 py-4"
              >
                <Play className="w-6 h-6" />
                Resume
              </button>
            )}

            {isRunning && (
              <button
                onClick={handlePause}
                className="btn-secondary flex items-center gap-2 px-8 py-4"
              >
                <Pause className="w-6 h-6" />
                Pause
              </button>
            )}

            {seconds > 0 && (
              <button
                onClick={handleReset}
                className="btn-secondary flex items-center gap-2 px-8 py-4"
              >
                <RotateCcw className="w-6 h-6" />
                Reset
              </button>
            )}
          </div>

          {/* Key Themes & Talking Points (Quick Reference) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {story.key_themes && story.key_themes.length > 0 && (
              <div className="glass rounded-xl p-6 border border-white/10">
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Key Themes</h4>
                <div className="flex flex-wrap gap-2">
                  {story.key_themes.map((theme, i) => (
                    <span key={i} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {story.talking_points && story.talking_points.length > 0 && (
              <div className="glass rounded-xl p-6 border border-white/10">
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Talking Points</h4>
                <ul className="space-y-2">
                  {story.talking_points.slice(0, 3).map((point, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-white mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-400 text-sm">
              <strong>Practice Tips:</strong> Speak out loud as you go through each section.
              Focus on the ACTION section (2.5 minutes) - this is the most important part.
              Try to stay within 3-5 minutes total.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
