import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Video,
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Trash2,
  Upload,
  Check,
  AlertCircle,
  Loader2,
  Camera,
  X,
} from 'lucide-react';
import { api } from '../api/client';

interface PracticeRecorderProps {
  questionContext: string;
  interviewPrepId?: number;
  starStoryId?: number;
  questionText?: string;
  existingRecordingUrl?: string | null;
  onRecordingChange?: (url: string | null) => void;
}

type RecorderState = 'idle' | 'previewing' | 'recording' | 'paused' | 'recorded' | 'uploading' | 'saved' | 'error';
type RecordingMode = 'video' | 'audio';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export default function PracticeRecorder({
  questionContext,
  interviewPrepId,
  starStoryId,
  questionText,
  existingRecordingUrl,
  onRecordingChange,
}: PracticeRecorderProps) {
  const [state, setState] = useState<RecorderState>(existingRecordingUrl ? 'saved' : 'idle');
  const [mode, setMode] = useState<RecordingMode>('video');
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [loadingPlayback, setLoadingPlayback] = useState(false);

  // S3 key for the current recording
  const [s3Key, setS3Key] = useState<string | null>(existingRecordingUrl || null);
  const [audioLevel, setAudioLevel] = useState<number>(0); // 0-100 for speaking animation

  // Refs
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoPlaybackRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load playback URL when we have an existing recording
  useEffect(() => {
    if (existingRecordingUrl && !playbackUrl && state === 'saved') {
      loadPlaybackUrl(existingRecordingUrl);
    }
  }, [existingRecordingUrl]);

  // Sync s3Key when prop changes
  useEffect(() => {
    if (existingRecordingUrl) {
      setS3Key(existingRecordingUrl);
      setState('saved');
    }
  }, [existingRecordingUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Playback time tracking
  useEffect(() => {
    const vid = videoPlaybackRef.current;
    if (!vid) return;

    const onTimeUpdate = () => setCurrentTime(vid.currentTime);
    const onDurationChange = () => setDuration(vid.duration || 0);
    const onEnded = () => setIsPlaying(false);
    const onLoadedMetadata = () => setDuration(vid.duration || 0);

    vid.addEventListener('timeupdate', onTimeUpdate);
    vid.addEventListener('durationchange', onDurationChange);
    vid.addEventListener('ended', onEnded);
    vid.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      vid.removeEventListener('timeupdate', onTimeUpdate);
      vid.removeEventListener('durationchange', onDurationChange);
      vid.removeEventListener('ended', onEnded);
      vid.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [playbackUrl, state]);

  const loadPlaybackUrl = async (key: string) => {
    setLoadingPlayback(true);
    try {
      const res = await api.getRecordingDownloadUrl(key);
      if (res.success && res.data?.download_url) {
        setPlaybackUrl(res.data.download_url);
      }
    } catch (e) {
      console.error('Failed to load playback URL:', e);
    } finally {
      setLoadingPlayback(false);
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    // Stop audio analysis
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }
    setAudioLevel(0);
  };

  const startAudioAnalysis = (stream: MediaStream) => {
    try {
      // Create audio context and analyser
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      // Animate audio levels
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalizedLevel = Math.min(100, (average / 255) * 100);

        setAudioLevel(normalizedLevel);
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
      console.log('[PracticeRecorder] Audio analysis started');
    } catch (e) {
      console.error('[PracticeRecorder] Failed to start audio analysis:', e);
    }
  };

  const startPreview = async () => {
    setError(null);
    console.log(`[PracticeRecorder] Starting preview, mode: ${mode}`);

    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera/microphone access. Please use a modern browser like Chrome, Firefox, or Edge.');
      }

      const constraints: MediaStreamConstraints =
        mode === 'video'
          ? { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true }
          : { audio: true };

      console.log('[PracticeRecorder] Requesting media with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log('[PracticeRecorder] Got stream:', stream.id);
      console.log('[PracticeRecorder] Video tracks:', stream.getVideoTracks().length);
      console.log('[PracticeRecorder] Audio tracks:', stream.getAudioTracks().length);

      streamRef.current = stream;

      // Start audio level analysis for speaking animation
      startAudioAnalysis(stream);

      if (mode === 'video' && videoPreviewRef.current) {
        console.log('[PracticeRecorder] Setting video preview srcObject');
        videoPreviewRef.current.srcObject = stream;

        // Ensure video plays
        try {
          await videoPreviewRef.current.play();
          console.log('[PracticeRecorder] Video preview playing');
        } catch (playError: any) {
          console.error('[PracticeRecorder] Video play error:', playError);
          setError(`Video preview failed: ${playError.message}`);
        }
      } else if (mode === 'audio') {
        console.log('[PracticeRecorder] Audio-only mode, no preview needed');
      }

      setState('previewing');
      setExpanded(true);
    } catch (e: any) {
      console.error('[PracticeRecorder] getUserMedia error:', e);
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setError('Camera/microphone permission denied. Please allow access and try again.');
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setError('No camera or microphone found. Please connect a device and try again.');
      } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
        setError('Camera/microphone is already in use by another application.');
      } else {
        setError(`Could not access ${mode === 'video' ? 'camera' : 'microphone'}: ${e.message}`);
      }
      setState('error');
      setExpanded(true);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setRecordingTime(0);

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
      ? 'video/webm;codecs=vp8,opus'
      : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

    const recorder = new MediaRecorder(streamRef.current, { mimeType });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      blobRef.current = blob;

      // Set local playback immediately
      const url = URL.createObjectURL(blob);
      setPlaybackUrl(url);
      setDuration(recordingTime);

      stopStream();
      setState('recorded');
    };

    mediaRecorderRef.current = recorder;
    recorder.start(1000); // 1s chunks
    setState('recording');

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    stopRecording();
    stopStream();
    blobRef.current = null;
    setPlaybackUrl(null);
    setState('idle');
    setExpanded(false);
    setRecordingTime(0);
    setError(null);
  };

  const uploadRecording = async () => {
    if (!blobRef.current) return;

    if (blobRef.current.size > MAX_FILE_SIZE) {
      setError('Recording is too large (max 100MB). Please record a shorter clip.');
      return;
    }

    setState('uploading');
    setUploadProgress(0);

    try {
      // 1. Get presigned upload URL
      const contentType = blobRef.current.type || 'video/webm';
      const uploadRes = await api.getRecordingUploadUrl({
        file_name: `${questionContext}.webm`,
        content_type: contentType,
        question_context: questionContext,
      });

      if (!uploadRes.success || !uploadRes.data?.upload_url) {
        throw new Error('Failed to get upload URL');
      }

      const { upload_url, s3_key } = uploadRes.data;
      setUploadProgress(20);

      // 2. Upload directly to S3
      const uploadResp = await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blobRef.current,
      });

      if (!uploadResp.ok) throw new Error('S3 upload failed');
      setUploadProgress(70);

      // 3. Save s3_key reference in DB
      if (starStoryId) {
        // STAR story - update via star stories endpoint
        await api.updateStarStory(starStoryId, { video_recording_url: s3_key });
      } else if (interviewPrepId && questionText) {
        // Practice question response
        await api.savePracticeQuestionResponse({
          interview_prep_id: interviewPrepId,
          question_id: questionContext,
          question_text: questionText,
          video_recording_url: s3_key,
        });
      }

      setUploadProgress(100);
      setS3Key(s3_key);
      setState('saved');
      onRecordingChange?.(s3_key);
    } catch (e: any) {
      console.error('Upload failed:', e);
      setError('Upload failed. You can retry or keep practicing with local playback.');
      setState('recorded'); // Keep local blob for playback
    }
  };

  const handleDelete = async () => {
    if (!s3Key) {
      console.warn('No s3Key found, cannot delete');
      return;
    }

    try {
      const result = await api.deleteRecording({ s3_key: s3Key, question_context: questionContext });

      if (!result.success) {
        console.error('Delete API call failed:', result.error);
        setError(`Failed to delete recording: ${result.error || 'Unknown error'}`);
        setShowDeleteConfirm(false);
        return;
      }

      // Success - clear all state
      setS3Key(null);
      setPlaybackUrl(null);
      blobRef.current = null;
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setState('idle');
      setExpanded(false);
      setShowDeleteConfirm(false);
      onRecordingChange?.(null);
    } catch (e: any) {
      console.error('Delete failed:', e);
      setError(`Delete failed: ${e.message || 'Unknown error'}`);
      setShowDeleteConfirm(false);
    }
  };

  // Playback controls
  const togglePlay = () => {
    const vid = videoPlaybackRef.current;
    if (!vid) return;
    if (isPlaying) {
      vid.pause();
    } else {
      vid.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekRelative = (seconds: number) => {
    const vid = videoPlaybackRef.current;
    if (!vid) return;
    vid.currentTime = Math.max(0, Math.min(vid.currentTime + seconds, vid.duration || 0));
  };

  const handleSeekBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const vid = videoPlaybackRef.current;
    const bar = seekBarRef.current;
    if (!vid || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    vid.currentTime = pct * duration;
  };

  const switchMode = (newMode: RecordingMode) => {
    if (state === 'recording') return;
    stopStream();
    setMode(newMode);
    if (state === 'previewing') {
      setState('idle');
      // Re-start preview with new mode after a tick
      setTimeout(() => startPreview(), 100);
    }
  };

  // ============= RENDER =============

  // Idle: show compact "Record Practice" button
  if (state === 'idle' && !expanded) {
    return (
      <button
        onClick={startPreview}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600/80 to-pink-600/80 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-rose-500/20"
      >
        <Video className="w-4 h-4" />
        Record Practice
      </button>
    );
  }

  // Saved with recording: compact playback bar (collapsed)
  if ((state === 'saved' || (state === 'recorded' && s3Key)) && !expanded) {
    return (
      <div className="flex items-center gap-3 p-3 bg-theme-glass-5 rounded-xl border border-theme-subtle">
        <button
          onClick={() => { setExpanded(true); }}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          Play Recording
        </button>
        <span className="text-xs text-theme-tertiary">
          {duration > 0 ? formatTime(duration) : 'Saved'}
        </span>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="ml-auto p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Delete recording"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 rounded-xl">
            <div className="bg-theme-card p-4 rounded-xl shadow-xl text-center space-y-3">
              <p className="text-sm text-theme">Delete this recording?</p>
              <div className="flex gap-2 justify-center">
                <button onClick={handleDelete} className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-500">
                  Delete
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 bg-theme-glass-10 text-theme-secondary text-xs rounded-lg hover:bg-theme-glass-15">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Expanded view (recording, playback, etc.)
  return (
    <div className="relative bg-theme-glass-5 rounded-xl border border-theme-subtle overflow-hidden">
      {/* Header with mode toggle and close */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-theme-subtle">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => switchMode('video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === 'video' ? 'bg-rose-500/20 text-rose-400' : 'text-theme-tertiary hover:text-theme-secondary hover:bg-theme-glass-5'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Video
          </button>
          <button
            onClick={() => switchMode('audio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === 'audio' ? 'bg-blue-500/20 text-blue-400' : 'text-theme-tertiary hover:text-theme-secondary hover:bg-theme-glass-5'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Audio
          </button>
        </div>
        <button
          onClick={cancelRecording}
          className="p-1.5 text-theme-tertiary hover:text-theme-secondary hover:bg-theme-glass-5 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Error state */}
      {(state === 'error' || error) && (
        <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={() => { setError(null); setState('idle'); startPreview(); }}
                className="mt-2 text-xs text-red-300 underline hover:text-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera preview (during previewing/recording) */}
      {(state === 'previewing' || state === 'recording') && mode === 'video' && (
        <div className="relative aspect-video max-h-[200px] bg-black">
          <video
            ref={videoPreviewRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          {state === 'recording' && (
            <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 bg-red-600/90 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-xs text-white font-medium">{formatTime(recordingTime)}</span>
            </div>
          )}
          {/* Speaking indicator - Audio level bars */}
          {state === 'recording' && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1 px-3 py-2 bg-black/50 backdrop-blur-sm rounded-full">
              {[0, 1, 2, 3, 4].map((i) => {
                const barHeight = Math.max(4, (audioLevel / 100) * 24 * (1 - Math.abs(i - 2) * 0.2));
                return (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-green-400 to-green-300 rounded-full transition-all duration-75"
                    style={{
                      height: `${barHeight}px`,
                      opacity: audioLevel > 5 ? 1 : 0.3,
                    }}
                  />
                );
              })}
              <span className="ml-2 text-xs text-white/80 font-medium">
                {audioLevel > 10 ? 'Speaking...' : 'Listening...'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Audio-only mode with waveform indicator */}
      {(state === 'previewing' || state === 'recording') && mode === 'audio' && (
        <div className="p-6 bg-gradient-to-br from-theme-glass-10 to-theme-glass-5 rounded-xl border border-theme-glass-10">
          <div className="flex flex-col items-center gap-4">
            <Mic className={`w-12 h-12 ${audioLevel > 10 ? 'text-green-500' : 'text-theme-secondary'} transition-colors`} />
            {/* Audio level bars */}
            <div className="flex items-end gap-1.5 h-16">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const barHeight = Math.max(8, (audioLevel / 100) * 64 * (1 - Math.abs(i - 3) * 0.15));
                return (
                  <div
                    key={i}
                    className="w-2 bg-gradient-to-t from-green-500 to-green-400 rounded-full transition-all duration-75"
                    style={{
                      height: `${barHeight}px`,
                      opacity: audioLevel > 5 ? 1 : 0.4,
                    }}
                  />
                );
              })}
            </div>
            <p className="text-sm text-theme-secondary">
              {state === 'recording' ? (audioLevel > 10 ? '🎤 Speaking...' : '👂 Listening...') : 'Ready to record'}
            </p>
          </div>
        </div>
      )}

      {/* Audio-only recording indicator */}
      {(state === 'previewing' || state === 'recording') && mode === 'audio' && (
        <div className="flex items-center justify-center py-8 bg-theme-glass-3">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${state === 'recording' ? 'bg-red-500/15' : 'bg-blue-500/10'}`}>
            <Mic className={`w-8 h-8 ${state === 'recording' ? 'text-red-400 animate-pulse' : 'text-blue-400'}`} />
            {state === 'recording' && (
              <span className="text-lg font-mono text-red-400">{formatTime(recordingTime)}</span>
            )}
            {state === 'previewing' && (
              <span className="text-sm text-theme-secondary">Microphone ready</span>
            )}
          </div>
        </div>
      )}

      {/* Playback view */}
      {(state === 'recorded' || state === 'saved') && expanded && playbackUrl && (
        <div>
          {/* Video element (hidden for audio-only, shown for video) */}
          <video
            ref={videoPlaybackRef}
            src={playbackUrl}
            playsInline
            className={mode === 'video' ? 'w-full aspect-video max-h-[200px] object-cover bg-black' : 'hidden'}
            style={mode === 'video' ? { transform: 'scaleX(-1)' } : undefined}
          />
          {/* Audio-only playback visual */}
          {mode === 'audio' && (
            <div className="flex items-center justify-center py-6 bg-theme-glass-3">
              <div className="flex items-center gap-3 px-5 py-3 bg-blue-500/10 rounded-2xl">
                <Mic className={`w-6 h-6 ${isPlaying ? 'text-blue-400 animate-pulse' : 'text-blue-400/60'}`} />
                <span className="text-sm font-mono text-theme-secondary">{formatTime(currentTime)}</span>
              </div>
            </div>
          )}
          {/* Hidden audio source for audio-only mode */}
          {mode === 'audio' && (
            <video ref={videoPlaybackRef} src={playbackUrl} className="hidden" />
          )}

          {/* Playback controls */}
          <div className="px-4 py-3 space-y-2">
            {/* Seek bar */}
            <div
              ref={seekBarRef}
              onClick={handleSeekBarClick}
              className="relative w-full h-1.5 bg-theme-glass-10 rounded-full cursor-pointer group"
            >
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-[width] duration-100"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, transform: 'translate(-50%, -50%)' }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-theme-tertiary font-mono w-20">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div className="flex items-center gap-1">
                <button onClick={() => seekRelative(-10)} className="p-2 text-theme-secondary hover:text-theme rounded-lg hover:bg-theme-glass-5 transition-colors" title="Rewind 10s">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={togglePlay} className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-full transition-colors">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button onClick={() => seekRelative(10)} className="p-2 text-theme-secondary hover:text-theme rounded-lg hover:bg-theme-glass-5 transition-colors" title="Forward 10s">
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              <div className="w-20 flex justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete recording"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading playback */}
      {state === 'saved' && expanded && loadingPlayback && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-theme-secondary animate-spin" />
          <span className="ml-2 text-sm text-theme-secondary">Loading recording...</span>
        </div>
      )}

      {/* Recording controls */}
      {(state === 'previewing' || state === 'recording') && (
        <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-theme-subtle">
          {state === 'previewing' && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-red-500/25"
            >
              <div className="w-3 h-3 bg-white rounded-full" />
              Start Recording
            </button>
          )}
          {state === 'recording' && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-red-500/25"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              Stop ({formatTime(recordingTime)})
            </button>
          )}
        </div>
      )}

      {/* Post-recording actions: Upload / Retry */}
      {state === 'recorded' && !s3Key && (
        <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-theme-subtle">
          <button
            onClick={uploadRecording}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-green-500/20"
          >
            <Upload className="w-4 h-4" />
            Save Recording
          </button>
          <button
            onClick={() => { blobRef.current = null; setPlaybackUrl(null); startPreview(); }}
            className="px-4 py-2.5 bg-theme-glass-10 hover:bg-theme-glass-15 text-theme-secondary rounded-xl text-sm font-medium transition-colors"
          >
            Re-record
          </button>
        </div>
      )}

      {/* Uploading progress */}
      {state === 'uploading' && (
        <div className="px-4 py-3 border-t border-theme-subtle">
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
            <div className="flex-1">
              <div className="h-1.5 bg-theme-glass-10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-[width] duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-theme-tertiary">{uploadProgress}%</span>
          </div>
        </div>
      )}

      {/* Saved confirmation */}
      {state === 'saved' && expanded && !loadingPlayback && playbackUrl && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-theme-subtle bg-green-500/5">
          <div className="flex items-center gap-2 text-green-400">
            <Check className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Recording saved</span>
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="text-xs text-theme-tertiary hover:text-theme-secondary"
          >
            Collapse
          </button>
        </div>
      )}

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl">
          <div className="bg-theme-card p-5 rounded-xl shadow-2xl text-center space-y-3 mx-4">
            <p className="text-sm text-theme font-medium">Delete this recording?</p>
            <p className="text-xs text-theme-tertiary">This action cannot be undone.</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-theme-glass-10 hover:bg-theme-glass-15 text-theme-secondary text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
