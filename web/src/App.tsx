import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { FileText, Upload, Target, CheckCircle, Sparkles, TrendingUp, Award, ChevronDown, Zap, Users, BarChart3, Clock } from 'lucide-react'
import UploadResume from './pages/UploadResume'
import TailorResume from './pages/TailorResume'
import InterviewPrep from './pages/InterviewPrep'

function Dashboard() {
  const navigate = useNavigate()
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - Split Layout */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto mb-24">
          {/* Left: Content */}
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Build a Job-Winning Resume in Minutes with AI
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Leverage your professional experience and career goals to create highly
              effective resumes. Our AI-powered platform instantly tailors your resume
              to any job posting with ATS optimization.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => navigate('/upload')}
                className="btn-primary inline-flex items-center justify-center gap-2 text-base px-8 py-4"
              >
                Create My Resume Free →
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary inline-flex items-center justify-center gap-2 text-base px-8 py-4"
              >
                See Features
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-8">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Free forever plan
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                2-minute setup
              </span>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 border-2 border-black"></div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-black"></div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 border-2 border-black"></div>
              </div>
              <p className="text-sm text-gray-400">
                Join <span className="text-white font-semibold">10,000+</span> job seekers who landed their dream roles
              </p>
            </div>
          </div>

          {/* Right: Visual Showcase */}
          <div className="relative">
            <div className="glass rounded-2xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
              {/* Mock Resume Preview */}
              <div className="space-y-4">
                <div className="h-6 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                <div className="space-y-2 mt-6">
                  <div className="h-3 bg-white/10 rounded"></div>
                  <div className="h-3 bg-white/10 rounded w-5/6"></div>
                  <div className="h-3 bg-white/10 rounded w-4/6"></div>
                </div>
                <div className="space-y-2 mt-6">
                  <div className="h-3 bg-white/10 rounded w-full"></div>
                  <div className="h-3 bg-white/10 rounded w-4/5"></div>
                </div>
              </div>

              {/* Floating ATS Score Badge */}
              <div className="absolute top-4 right-4 glass border border-green-500/50 rounded-lg px-4 py-2 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 text-sm font-semibold">98% ATS Match</span>
                </div>
              </div>

              {/* Floating Speed Badge */}
              <div className="absolute bottom-4 left-4 glass border border-orange-500/50 rounded-lg px-4 py-2 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-400 text-sm font-semibold">2 min setup</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid - Glassmorphism Style */}
        <div id="features" className="scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Features to Land Your Dream Job</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Everything you need to create ATS-friendly, recruiter-approved resumes in minutes
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-16">
          {/* AI Writes for You Card */}
          <div
            className="glass glass-hover rounded-3xl p-8 cursor-pointer transition-all duration-300"
            onClick={() => toggleCard('ai-writing')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-wide">
                  AI Writes it for You
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  AI writes optimized content tailored to job descriptions
                </p>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 flex-shrink-0 mt-1 transition-transform duration-300 ${
                  expandedCard === 'ai-writing' ? 'rotate-180' : ''
                }`}
              />
            </div>
            {expandedCard === 'ai-writing' && (
              <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    Our AI analyzes the job posting and your experience to craft compelling bullet points
                    that highlight your most relevant achievements. Save hours of writing time with intelligent
                    suggestions that pass ATS screening.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white font-semibold text-sm">Lightning Fast</p>
                        <p className="text-gray-400 text-xs">Save 3+ hours per application</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white font-semibold text-sm">Targeted Content</p>
                        <p className="text-gray-400 text-xs">Matches job requirements</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Guided Resume Flow Card */}
          <div
            className="glass glass-hover rounded-3xl p-8 cursor-pointer transition-all duration-300"
            onClick={() => toggleCard('guided-flow')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-wide">
                  Guided Resume Flow
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Step-by-step guidance through resume creation process
                </p>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 flex-shrink-0 mt-1 transition-transform duration-300 ${
                  expandedCard === 'guided-flow' ? 'rotate-180' : ''
                }`}
              />
            </div>
            {expandedCard === 'guided-flow' && (
              <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    Follow our intuitive wizard that guides you through each section. We'll prompt you
                    with smart questions and best practices to ensure nothing is missed.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white font-semibold text-sm">Beginner Friendly</p>
                        <p className="text-gray-400 text-xs">No experience needed</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white font-semibold text-sm">Quick Process</p>
                        <p className="text-gray-400 text-xs">Complete in under 5 min</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resume Quality Score Card */}
          <div
            className="glass glass-hover rounded-3xl p-8 cursor-pointer transition-all duration-300"
            onClick={() => toggleCard('quality-score')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-wide">
                  Resume Quality Score
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Real-time ATS scoring to track and improve resume quality
                </p>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 flex-shrink-0 mt-1 transition-transform duration-300 ${
                  expandedCard === 'quality-score' ? 'rotate-180' : ''
                }`}
              />
            </div>
            {expandedCard === 'quality-score' && (
              <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    See your resume score improve in real-time as you add content. Get specific suggestions
                    on formatting, keywords, impact statements, and ATS compatibility.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white font-semibold text-sm">98% ATS Pass Rate</p>
                        <p className="text-gray-400 text-xs">Tested on major ATS systems</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white font-semibold text-sm">Instant Feedback</p>
                        <p className="text-gray-400 text-xs">Know your chances before applying</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Match Any Job Card */}
          <div
            className="glass glass-hover rounded-3xl p-8 cursor-pointer transition-all duration-300"
            onClick={() => toggleCard('job-matching')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-wide">
                  Match Any Job Instantly
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Side-by-side job matching with keyword highlighting
                </p>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 flex-shrink-0 mt-1 transition-transform duration-300 ${
                  expandedCard === 'job-matching' ? 'rotate-180' : ''
                }`}
              />
            </div>
            {expandedCard === 'job-matching' && (
              <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    Paste any job URL and our AI instantly analyzes requirements. See your resume and
                    job description side-by-side with keyword highlighting. One base resume, unlimited tailored versions.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white font-semibold text-sm">30 Second Match</p>
                        <p className="text-gray-400 text-xs">Instant job analysis</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white font-semibold text-sm">Keyword Highlighting</p>
                        <p className="text-gray-400 text-xs">See what matters most</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-6xl mx-auto mt-24">
          <h2 className="text-5xl font-bold text-center text-white mb-16">
            Why Choose Talor?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="glass rounded-3xl p-10">
              <div className="text-6xl font-bold text-white mb-3">Since 2025</div>
              <div className="text-gray-400 text-sm">Built with cutting-edge AI technology</div>
            </div>
            <div className="glass rounded-3xl p-10">
              <div className="text-6xl font-bold text-white mb-3">100+</div>
              <div className="text-gray-400 text-sm">Cybersecurity professionals trust Talor</div>
            </div>
            <div className="glass rounded-3xl p-10">
              <div className="text-6xl font-bold text-white mb-3">95%</div>
              <div className="text-gray-400 text-sm">Interview rate improvement</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black">
        {/* Top Navigation - Glassmorphism */}
        <nav className="glass sticky top-0 z-50 border-b border-white/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <FileText className="w-8 h-8 text-white" />
                <span className="text-2xl font-bold text-white tracking-tight">Talor</span>
              </Link>
              <div className="flex items-center gap-8">
                <Link
                  to="/upload"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span className="font-medium">Upload</span>
                </Link>
                <Link
                  to="/tailor"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Target className="w-5 h-5" />
                  <span className="font-medium">Tailor</span>
                </Link>
                <Link
                  to="/upload"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadResume />} />
            <Route path="/tailor" element={<TailorResume />} />
            <Route path="/interview-prep/:tailoredResumeId" element={<InterviewPrep />} />
            <Route path="/resumes" element={<div className="p-8"><h1 className="text-3xl font-bold text-white">My Resumes</h1></div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
