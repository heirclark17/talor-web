/**
 * AI Mock Interview Chat Component
 *
 * Interactive ChatGPT-style mock interviews with adaptive follow-up questions
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, RotateCcw, PlayCircle, StopCircle, Mic, MicOff } from 'lucide-react';
import { api } from '../../api/client';
import { showError } from '../../utils/toast';

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface MockInterviewChatProps {
  company: string;
  jobTitle: string;
  interviewType: 'behavioral' | 'technical' | 'company-specific';
  resumeSummary?: string;
  onComplete?: (transcript: Message[]) => void;
}

export default function MockInterviewChat({
  company,
  jobTitle,
  interviewType,
  resumeSummary,
  onComplete,
}: MockInterviewChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const MAX_QUESTIONS = 10;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputValue(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'aborted') {
        showError(`Speech recognition error: ${event.error}`);
      }
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const toggleListening = () => {
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  };

  const getInterviewPrompt = () => {
    const basePrompt = `You are conducting a ${interviewType} interview for the position of ${jobTitle} at ${company}.

Guidelines:
- Ask thoughtful, relevant questions based on the interview type
- Adapt follow-up questions based on the candidate's previous answers
- Be professional but conversational
- Provide brief feedback on answers when appropriate
- Ask ${MAX_QUESTIONS} questions total
- End with a summary of performance

${resumeSummary ? `Candidate's background: ${resumeSummary}` : ''}

Interview Type: ${interviewType}
${interviewType === 'behavioral' ? '- Focus on past experiences, STAR method situations, soft skills' : ''}
${interviewType === 'technical' ? '- Focus on technical skills, problem-solving, system design' : ''}
${interviewType === 'company-specific' ? `- Focus on ${company}'s culture, values, and specific challenges` : ''}

Start the interview with a warm greeting and the first question.`;

    return basePrompt;
  };

  const startInterview = async () => {
    setIsActive(true);
    setMessages([]);
    setQuestionCount(0);
    setIsLoading(true);

    try {
      const systemPrompt = getInterviewPrompt();
      const response = await api.generateMockInterview({
        systemPrompt,
        messages: [],
        company,
        jobTitle,
        interviewType,
      });

      if (response.success && response.data?.message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date(),
        };
        setMessages([assistantMessage]);
        setQuestionCount(1);
      } else {
        throw new Error(response.error || 'Failed to start interview');
      }
    } catch (error) {
      showError('Failed to start mock interview');
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await api.generateMockInterview({
        systemPrompt: getInterviewPrompt(),
        messages: conversationHistory,
        company,
        jobTitle,
        interviewType,
      });

      if (response.success && response.data?.message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setQuestionCount((prev) => prev + 1);

        // Check if interview should end
        if (questionCount >= MAX_QUESTIONS) {
          setIsActive(false);
          if (onComplete) {
            onComplete([...messages, userMessage, assistantMessage]);
          }
        }
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      showError('Failed to send message');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const resetInterview = () => {
    stopListening();
    setMessages([]);
    setInputValue('');
    setIsActive(false);
    setQuestionCount(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[700px]">
      {/* Header */}
      <div className="glass rounded-t-xl p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-theme">
              {interviewType === 'behavioral' && 'Behavioral Interview'}
              {interviewType === 'technical' && 'Technical Interview'}
              {interviewType === 'company-specific' && `${company} Interview`}
            </h3>
            <p className="text-sm text-theme-secondary">{jobTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-theme-secondary">
              Question {questionCount}/{MAX_QUESTIONS}
            </span>
            {isActive && (
              <button
                onClick={resetInterview}
                className="btn-secondary flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-theme-glass-5">
        {!isActive && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <PlayCircle className="w-16 h-16 text-blue-500 mb-4" />
            <h4 className="text-xl font-semibold text-theme mb-2">
              Ready to practice?
            </h4>
            <p className="text-theme-secondary mb-6 max-w-md">
              This AI mock interview will ask you {MAX_QUESTIONS} questions and adapt based on your responses.
              Practice your answers in a realistic interview setting.
            </p>
            <button
              onClick={startInterview}
              disabled={isLoading}
              className="btn-primary flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Starting Interview...
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" />
                  Start Interview
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'glass text-theme'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-theme-tertiary'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="glass rounded-lg p-4">
                  <div className="flex items-center gap-2 text-theme-secondary">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Interviewer is typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      {isActive && (
        <div className="glass rounded-b-xl p-4 border-t border-border">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isRecording
                  ? "Listening... speak your answer"
                  : "Type your response... (Shift+Enter for new line)"}
                className="w-full input resize-none"
                rows={2}
                disabled={isLoading || questionCount >= MAX_QUESTIONS}
              />
              {isRecording && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Listening...
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={toggleListening}
                disabled={isLoading || questionCount >= MAX_QUESTIONS}
                className={`px-4 py-2 rounded-lg transition-all ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'btn-secondary'
                }`}
                title={isRecording ? 'Stop recording' : 'Speak your answer'}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading || questionCount >= MAX_QUESTIONS}
                className="btn-primary px-4 py-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          {questionCount >= MAX_QUESTIONS && (
            <p className="text-sm text-green-500 mt-2 text-center">
              Interview complete! Review your responses above.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
