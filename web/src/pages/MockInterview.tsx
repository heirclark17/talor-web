/**
 * Mock Interview Page
 *
 * AI-powered interactive mock interviews with adaptive questioning
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Brain, Code, Briefcase } from 'lucide-react';
import MockInterviewChat from '../components/interview/MockInterviewChat';
import { usePostHog } from '../contexts/PostHogContext';

export default function MockInterview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { capture } = usePostHog();

  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [resumeSummary, setResumeSummary] = useState('');
  const [interviewType, setInterviewType] = useState<'behavioral' | 'technical' | 'company-specific'>('behavioral');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // Get params from URL (passed from InterviewPrep page)
    const companyParam = searchParams.get('company');
    const titleParam = searchParams.get('title');
    const summaryParam = searchParams.get('summary');

    if (companyParam) setCompany(companyParam);
    if (titleParam) setJobTitle(titleParam);
    if (summaryParam) setResumeSummary(summaryParam);

    // Track page view
    capture('page_viewed', {
      page_name: 'Mock Interview',
      page_type: 'interview_prep',
    });
  }, [searchParams, capture]);

  const startInterview = () => {
    setShowChat(true);
    capture('mock_interview_started', {
      company,
      jobTitle,
      interviewType,
    });
  };

  const handleComplete = (transcript: any[]) => {
    capture('mock_interview_completed', {
      company,
      jobTitle,
      interviewType,
      questionCount: transcript.length,
    });
  };

  if (showChat) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl mx-auto">
          <button
            onClick={() => setShowChat(false)}
            className="btn-secondary mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Setup
          </button>

          <MockInterviewChat
            company={company}
            jobTitle={jobTitle}
            interviewType={interviewType}
            resumeSummary={resumeSummary}
            onComplete={handleComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-theme mb-6">
            AI Mock Interview
          </h1>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            Practice your interview skills with an AI interviewer that adapts to your responses
            and provides realistic interview scenarios.
          </p>
        </div>

        {/* Interview Setup */}
        <div className="glass rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-theme mb-6">Interview Setup</h2>

          <div className="space-y-6">
            {/* Company Input */}
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., Google"
                className="input"
              />
            </div>

            {/* Job Title Input */}
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                className="input"
              />
            </div>

            {/* Interview Type Selection */}
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-3">
                Interview Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setInterviewType('behavioral')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    interviewType === 'behavioral'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-border hover:border-blue-500/50'
                  }`}
                >
                  <Brain className="w-8 h-8 text-blue-500 mb-3 mx-auto" />
                  <h3 className="font-semibold text-theme mb-2">Behavioral</h3>
                  <p className="text-sm text-theme-secondary">
                    STAR method questions about past experiences and soft skills
                  </p>
                </button>

                <button
                  onClick={() => setInterviewType('technical')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    interviewType === 'technical'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-border hover:border-blue-500/50'
                  }`}
                >
                  <Code className="w-8 h-8 text-green-500 mb-3 mx-auto" />
                  <h3 className="font-semibold text-theme mb-2">Technical</h3>
                  <p className="text-sm text-theme-secondary">
                    Technical skills, problem-solving, and system design
                  </p>
                </button>

                <button
                  onClick={() => setInterviewType('company-specific')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    interviewType === 'company-specific'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-border hover:border-blue-500/50'
                  }`}
                >
                  <Briefcase className="w-8 h-8 text-purple-500 mb-3 mx-auto" />
                  <h3 className="font-semibold text-theme mb-2">Company-Specific</h3>
                  <p className="text-sm text-theme-secondary">
                    Company culture, values, and specific challenges
                  </p>
                </button>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startInterview}
              disabled={!company.trim() || !jobTitle.trim()}
              className="btn-primary w-full py-4 text-lg"
            >
              Start Mock Interview
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-xl p-6">
            <h3 className="font-semibold text-theme mb-2">Adaptive Questions</h3>
            <p className="text-sm text-theme-secondary">
              AI interviewer adapts follow-up questions based on your previous answers
            </p>
          </div>
          <div className="glass rounded-xl p-6">
            <h3 className="font-semibold text-theme mb-2">Realistic Practice</h3>
            <p className="text-sm text-theme-secondary">
              10 questions designed to simulate real interview scenarios
            </p>
          </div>
          <div className="glass rounded-xl p-6">
            <h3 className="font-semibold text-theme mb-2">Instant Feedback</h3>
            <p className="text-sm text-theme-secondary">
              Get brief feedback on your answers to improve your responses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
