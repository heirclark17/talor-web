import React, { useState, useRef, useEffect } from 'react'
import { Video, Mic, Square, Play, Pause, Download, Trash2, Camera, MicOff, VideoOff } from 'lucide-react'
import { showError } from '../utils/toast'

interface Recording {
  id: string
  blob: Blob
  url: string
  duration: number
  timestamp: number
  type: 'audio' | 'video'
  questionIndex?: number
}

interface Props {
  questions: string[]
  onRecordingComplete?: (recording: Recording) => void
}

export default function VideoRecorder({ questions, onRecordingComplete }: Props) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>('video')
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [playingRecording, setPlayingRecording] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const playbackVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const requestPermissions = async () => {
    try {
      const constraints = recordingType === 'video'
        ? { video: true, audio: true }
        : { audio: true }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current && recordingType === 'video') {
        videoRef.current.srcObject = stream
      }

      setHasPermission(true)
      return stream
    } catch (error) {
      showError('Unable to access camera/microphone. Please check permissions.')
      return null
    }
  }

  const startRecording = async () => {
    const stream = hasPermission ? streamRef.current : await requestPermissions()
    if (!stream) return

    chunksRef.current = []

    const mimeType = recordingType === 'video'
      ? 'video/webm;codecs=vp8,opus'
      : 'audio/webm;codecs=opus'

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'video/webm'
    })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recordingType === 'video' ? 'video/webm' : 'audio/webm' })
      const url = URL.createObjectURL(blob)

      const recording: Recording = {
        id: Date.now().toString(),
        blob,
        url,
        duration: elapsedTime,
        timestamp: Date.now(),
        type: recordingType,
        questionIndex: currentQuestionIndex
      }

      setRecordings(prev => [...prev, recording])
      if (onRecordingComplete) {
        onRecordingComplete(recording)
      }

      setElapsedTime(0)
    }

    mediaRecorder.start(100) // Collect data every 100ms
    mediaRecorderRef.current = mediaRecorder
    setIsRecording(true)
    setIsPaused(false)

    // Start timer
    const startTime = Date.now()
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)

      const startTime = Date.now() - (elapsedTime * 1000)
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id))
  }

  const downloadRecording = (recording: Recording) => {
    const a = document.createElement('a')
    a.href = recording.url
    a.download = `recording-${(recording.questionIndex ?? 0) + 1}-${recording.timestamp}.webm`
    a.click()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const playRecording = (recording: Recording) => {
    if (playbackVideoRef.current) {
      playbackVideoRef.current.src = recording.url
      playbackVideoRef.current.play()
      setPlayingRecording(recording.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Recording Type Toggle */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => !isRecording && setRecordingType('audio')}
          disabled={isRecording}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            recordingType === 'audio'
              ? 'bg-white text-black'
              : 'bg-theme-glass-10 text-theme hover:bg-theme-glass-20'
          } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Mic className="w-5 h-5" />
          Audio Only
        </button>
        <button
          onClick={() => !isRecording && setRecordingType('video')}
          disabled={isRecording}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            recordingType === 'video'
              ? 'bg-white text-black'
              : 'bg-theme-glass-10 text-theme hover:bg-theme-glass-20'
          } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Video className="w-5 h-5" />
          Video + Audio
        </button>
      </div>

      {/* Video Preview */}
      {recordingType === 'video' && (hasPermission || isRecording) && (
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="text-white font-semibold text-sm">REC</span>
              <span className="text-white font-mono text-sm">{formatTime(elapsedTime)}</span>
            </div>
          )}
        </div>
      )}

      {/* Current Question */}
      <div className="glass rounded-xl p-6 border border-theme-subtle">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-theme font-semibold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h4>
          <div className="flex gap-2">
            {currentQuestionIndex > 0 && (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={isRecording}
                className="px-3 py-1 bg-theme-glass-10 hover:bg-theme-glass-20 rounded-lg text-sm text-theme transition-colors disabled:opacity-50"
              >
                Previous
              </button>
            )}
            {currentQuestionIndex < questions.length - 1 && (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                disabled={isRecording}
                className="px-3 py-1 bg-theme-glass-10 hover:bg-theme-glass-20 rounded-lg text-sm text-theme transition-colors disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>
        </div>
        <p className="text-theme-secondary text-lg leading-relaxed">
          {questions[currentQuestionIndex]}
        </p>
      </div>

      {/* Recording Controls */}
      <div className="flex justify-center gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center gap-3 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-lg transition-all shadow-lg"
          >
            <div className="w-4 h-4 bg-white rounded-full" />
            Start Recording
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button
                onClick={pauseRecording}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-all"
              >
                <Pause className="w-5 h-5" />
                Pause
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all"
              >
                <Play className="w-5 h-5" />
                Resume
              </button>
            )}
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all"
            >
              <Square className="w-5 h-5" />
              Stop & Save
            </button>
          </>
        )}
      </div>

      {/* Recordings List */}
      {recordings.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-theme font-semibold text-lg">Your Recordings</h4>
          {recordings.map((recording) => (
            <div key={recording.id} className="glass rounded-xl p-4 border border-theme-subtle">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {recording.type === 'video' ? (
                    <Video className="w-8 h-8 text-theme" />
                  ) : (
                    <Mic className="w-8 h-8 text-theme" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-theme font-medium">
                    Question {(recording.questionIndex || 0) + 1} - {recording.type === 'video' ? 'Video' : 'Audio'}
                  </div>
                  <div className="text-theme-secondary text-sm">
                    Duration: {formatTime(recording.duration)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => playRecording(recording)}
                    className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                    title="Play"
                  >
                    <Play className="w-5 h-5 text-theme" />
                  </button>
                  <button
                    onClick={() => downloadRecording(recording)}
                    className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5 text-theme" />
                  </button>
                  <button
                    onClick={() => deleteRecording(recording.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Playback Video */}
      {playingRecording && (
        <div className="fixed inset-0 bg-theme z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => {
                  setPlayingRecording(null)
                  if (playbackVideoRef.current) {
                    playbackVideoRef.current.pause()
                  }
                }}
                className="text-theme hover:text-theme-secondary"
              >
                <Square className="w-8 h-8" />
              </button>
            </div>
            <video
              ref={playbackVideoRef}
              controls
              className="w-full rounded-xl"
              onEnded={() => setPlayingRecording(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
