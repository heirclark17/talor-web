import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { FileText, Upload, Target, CheckCircle, Sparkles, TrendingUp, Award, ChevronDown, Zap, Users, BarChart3, Clock, Check, X, Star, Quote, Plus, Minus, Twitter, Linkedin, Github, Mail } from 'lucide-react'
import UploadResume from './pages/UploadResume'
import TailorResume from './pages/TailorResume'
import InterviewPrep from './pages/InterviewPrep'

function Dashboard() {
  const navigate = useNavigate()
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId)
  }

  const toggleFaq = (faqId: string) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - Split Layout */}
      <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto mb-16 sm:mb-24">
          {/* Left: Content */}
          <div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-white mb-6 sm:mb-8 leading-tight tracking-tight">
              Build a Job-Winning Resume in Minutes with AI
            </h1>
            <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed">
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
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400 mb-6 sm:mb-8">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="whitespace-nowrap">No credit card required</span>
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="whitespace-nowrap">Free forever plan</span>
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="whitespace-nowrap">2-minute setup</span>
              </span>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex -space-x-2 sm:-space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 border-2 border-black"></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-black"></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 border-2 border-black"></div>
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
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
        <div id="features" className="scroll-mt-20 px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-3 sm:mb-4">Powerful Features to Land Your Dream Job</h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
              Everything you need to create ATS-friendly, recruiter-approved resumes in minutes
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto mb-12 sm:mb-16">
          {/* AI Writes for You Card */}
          <div
            className="glass glass-hover rounded-3xl p-10 cursor-pointer transition-all duration-300"
            onClick={() => toggleCard('ai-writing')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-white mb-3 uppercase tracking-wide">
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
            className="glass glass-hover rounded-3xl p-10 cursor-pointer transition-all duration-300"
            onClick={() => toggleCard('guided-flow')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-white mb-3 uppercase tracking-wide">
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
            className="glass glass-hover rounded-3xl p-10 cursor-pointer transition-all duration-300"
            onClick={() => toggleCard('quality-score')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-white mb-3 uppercase tracking-wide">
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
            className="glass glass-hover rounded-3xl p-10 cursor-pointer transition-all duration-300"
            onClick={() => toggleCard('job-matching')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-white mb-3 uppercase tracking-wide">
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

        {/* How It Works Section */}
        <div className="max-w-6xl mx-auto mt-24 sm:mt-40 mb-16 sm:mb-24 px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-3 sm:mb-4">How It Works</h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
              Create a job-winning resume in 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center glass border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-10 h-10 text-purple-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Upload Resume</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Upload your existing resume or start from scratch. We support PDF, DOCX, and TXT formats.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center glass border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-10 h-10 text-blue-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Paste Job URL</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Copy any job posting URL from LinkedIn, Indeed, or company career pages. Our AI does the rest.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center glass border border-green-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-10 h-10 text-green-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Tailors It</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Our AI analyzes the job requirements and customizes your resume to match in under 30 seconds.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center glass border border-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-10 h-10 text-orange-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  4
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Download & Apply</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Download your tailored resume as a professional DOCX file and start applying immediately.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4"
            >
              Try It Now - It's Free →
            </button>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="max-w-7xl mx-auto mt-24 sm:mt-40 mb-16 sm:mb-24 scroll-mt-20">
          <div className="text-center mb-12 sm:mb-16 px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-3 sm:mb-4">Simple, Transparent Pricing</h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
              Start for free, upgrade when you need more. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-6">
            {/* Free Plan */}
            <div className="glass rounded-3xl p-10 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-white mb-2">Free</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold text-white">$0</span>
                  <span className="text-gray-400">/forever</span>
                </div>
                <p className="text-gray-400 text-sm">Perfect for getting started</p>
              </div>

              <button
                onClick={() => navigate('/upload')}
                className="w-full btn-secondary mb-8"
              >
                Get Started Free
              </button>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">3 tailored resumes per month</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">AI-powered resume writing</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">ATS optimization</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">DOCX download</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 text-sm">Interview prep generation</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 text-sm">Priority support</span>
                </div>
              </div>
            </div>

            {/* Pro Plan - Featured */}
            <div className="glass rounded-3xl p-10 border-2 border-purple-500/50 relative hover:border-purple-500/70 transition-all duration-300 md:transform md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-white mb-2">Pro</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold text-white">$19</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400 text-sm">For active job seekers</p>
              </div>

              <button
                onClick={() => navigate('/upload')}
                className="w-full btn-primary mb-8"
              >
                Start 7-Day Free Trial
              </button>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm"><strong className="text-white">Unlimited</strong> tailored resumes</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">AI-powered resume writing</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">ATS optimization</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">DOCX & PDF download</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm"><strong className="text-white">Interview prep</strong> generation</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">Company research & insights</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">Priority email support</span>
                </div>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="glass rounded-3xl p-10 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-white mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold text-white">$49</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400 text-sm">For teams & recruiters</p>
              </div>

              <button
                onClick={() => navigate('/upload')}
                className="w-full btn-secondary mb-8"
              >
                Contact Sales
              </button>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm"><strong className="text-white">Everything in Pro</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">Team collaboration (5 seats)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">Custom branding & templates</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">API access</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">Dedicated account manager</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">24/7 priority support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">SSO & advanced security</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Banner */}
          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm">
              All plans include 30-day money-back guarantee • No credit card required for Free plan
            </p>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="max-w-7xl mx-auto mt-24 sm:mt-40 mb-16 sm:mb-24 px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-3 sm:mb-4 px-4">Loved by Job Seekers Worldwide</h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
              See what our users have to say about landing their dream jobs with Talor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Testimonial 1 */}
            <div className="glass rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <Quote className="w-8 h-8 text-purple-400/30 mb-4" />
              <p className="text-gray-300 leading-relaxed mb-6 text-sm">
                "Talor cut my resume tailoring time from 2 hours to 30 seconds. I landed 3 interviews in the first week after using it. The AI really understands what hiring managers want to see."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Sarah Martinez</p>
                  <p className="text-gray-400 text-xs">Senior Data Analyst at Google</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="glass rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <Quote className="w-8 h-8 text-blue-400/30 mb-4" />
              <p className="text-gray-300 leading-relaxed mb-6 text-sm">
                "As someone who hates writing resumes, this is a game-changer. The interview prep feature helped me prepare for tough questions and I nailed my Microsoft interview!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  JC
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">James Chen</p>
                  <p className="text-gray-400 text-xs">Software Engineer at Microsoft</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="glass rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <Quote className="w-8 h-8 text-green-400/30 mb-4" />
              <p className="text-gray-300 leading-relaxed mb-6 text-sm">
                "I was skeptical about AI resume tools, but Talor proved me wrong. Got my resume past ATS and landed interviews at Amazon, Meta, and Stripe. Worth every penny."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                  AP
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Aisha Patel</p>
                  <p className="text-gray-400 text-xs">Product Manager at Amazon</p>
                </div>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="glass rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <Quote className="w-8 h-8 text-orange-400/30 mb-4" />
              <p className="text-gray-300 leading-relaxed mb-6 text-sm">
                "The best $19/month I've ever spent. Applied to 25 jobs, got 8 interviews, and 3 offers. The tailored resumes made me stand out from hundreds of other applicants."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                  MR
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Marcus Rodriguez</p>
                  <p className="text-gray-400 text-xs">DevOps Engineer at Netflix</p>
                </div>
              </div>
            </div>

            {/* Testimonial 5 */}
            <div className="glass rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <Quote className="w-8 h-8 text-pink-400/30 mb-4" />
              <p className="text-gray-300 leading-relaxed mb-6 text-sm">
                "Switched careers from nursing to tech and Talor helped me highlight transferable skills. Got my first developer role at a startup within 2 months!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">
                  LN
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Lisa Nguyen</p>
                  <p className="text-gray-400 text-xs">Junior Developer at Startup</p>
                </div>
              </div>
            </div>

            {/* Testimonial 6 */}
            <div className="glass rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <Quote className="w-8 h-8 text-indigo-400/30 mb-4" />
              <p className="text-gray-300 leading-relaxed mb-6 text-sm">
                "Finally, a resume tool that actually works. The ATS optimization is no joke - I started getting callbacks immediately after switching to Talor-generated resumes."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  DK
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">David Kim</p>
                  <p className="text-gray-400 text-xs">Security Analyst at Cisco</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-6xl mx-auto mt-16 sm:mt-24 px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white mb-12 sm:mb-16">
            Why Choose Talor?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="glass rounded-3xl p-10 sm:p-10">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3">Since 2025</div>
              <div className="text-gray-400 text-sm">Built with cutting-edge AI technology</div>
            </div>
            <div className="glass rounded-3xl p-10 sm:p-10">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3">100+</div>
              <div className="text-gray-400 text-sm">Cybersecurity professionals trust Talor</div>
            </div>
            <div className="glass rounded-3xl p-10 sm:p-10">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3">95%</div>
              <div className="text-gray-400 text-sm">Interview rate improvement</div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-24 sm:mt-40 mb-16 sm:mb-24 px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-3 sm:mb-4">Frequently Asked Questions</h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
              Everything you need to know about Talor and how it works
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <button
                onClick={() => toggleFaq('faq-1')}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-semibold text-white pr-4">
                  How does Talor tailor my resume to a job posting?
                </span>
                {expandedFaq === 'faq-1' ? (
                  <Minus className="w-5 h-5 text-purple-400 flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === 'faq-1' && (
                <div className="px-6 pb-5 text-gray-300 leading-relaxed border-t border-white/10 pt-5 animate-in fade-in slide-in-from-top-4 duration-300">
                  <p>
                    Our AI analyzes the job description to identify key requirements, skills, and keywords. It then rewrites your resume bullets to highlight relevant experience, matches your skills to the job requirements, and optimizes formatting for ATS systems. The entire process takes under 30 seconds and creates a perfectly tailored resume for that specific role.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <button
                onClick={() => toggleFaq('faq-2')}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-semibold text-white pr-4">
                  Is my resume data secure and private?
                </span>
                {expandedFaq === 'faq-2' ? (
                  <Minus className="w-5 h-5 text-purple-400 flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === 'faq-2' && (
                <div className="px-6 pb-5 text-gray-300 leading-relaxed border-t border-white/10 pt-5 animate-in fade-in slide-in-from-top-4 duration-300">
                  <p>
                    Absolutely. We use enterprise-grade encryption for all data transmission and storage. Your resume data is never shared with third parties, never used to train AI models, and you can delete your data at any time. We're committed to protecting your privacy and comply with GDPR, CCPA, and other data protection regulations.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <button
                onClick={() => toggleFaq('faq-3')}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-semibold text-white pr-4">
                  What file formats do you support?
                </span>
                {expandedFaq === 'faq-3' ? (
                  <Minus className="w-5 h-5 text-purple-400 flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === 'faq-3' && (
                <div className="px-6 pb-5 text-gray-300 leading-relaxed border-t border-white/10 pt-5 animate-in fade-in slide-in-from-top-4 duration-300">
                  <p>
                    For uploads, we support PDF, DOCX (Microsoft Word), and TXT formats. Your tailored resume is always delivered as a professionally formatted DOCX file that you can edit in Microsoft Word or Google Docs. Pro users also get PDF export with the same formatting.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 4 */}
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <button
                onClick={() => toggleFaq('faq-4')}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-semibold text-white pr-4">
                  Can I edit the AI-generated resume?
                </span>
                {expandedFaq === 'faq-4' ? (
                  <Minus className="w-5 h-5 text-purple-400 flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === 'faq-4' && (
                <div className="px-6 pb-5 text-gray-300 leading-relaxed border-t border-white/10 pt-5 animate-in fade-in slide-in-from-top-4 duration-300">
                  <p>
                    Yes! The generated resume is a fully editable DOCX file. You can open it in Microsoft Word, Google Docs, or any word processor and make any changes you want. The AI provides a strong foundation, but you have complete control over the final version.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 5 */}
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <button
                onClick={() => toggleFaq('faq-5')}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-semibold text-white pr-4">
                  What is ATS optimization and why does it matter?
                </span>
                {expandedFaq === 'faq-5' ? (
                  <Minus className="w-5 h-5 text-purple-400 flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === 'faq-5' && (
                <div className="px-6 pb-5 text-gray-300 leading-relaxed border-t border-white/10 pt-5 animate-in fade-in slide-in-from-top-4 duration-300">
                  <p>
                    ATS (Applicant Tracking Systems) are software that 99% of large companies use to filter resumes before humans see them. Our resumes are optimized with proper formatting, keyword placement, and structure to ensure they pass ATS screening. This dramatically increases your chances of getting your resume in front of a real person.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 6 */}
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <button
                onClick={() => toggleFaq('faq-6')}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-semibold text-white pr-4">
                  How is this different from other resume builders?
                </span>
                {expandedFaq === 'faq-6' ? (
                  <Minus className="w-5 h-5 text-purple-400 flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === 'faq-6' && (
                <div className="px-6 pb-5 text-gray-300 leading-relaxed border-t border-white/10 pt-5 animate-in fade-in slide-in-from-top-4 duration-300">
                  <p>
                    Unlike generic resume builders, Talor specializes in job-specific tailoring. You maintain one master resume, then automatically generate customized versions for each job you apply to. This saves hours of manual work and ensures each application is perfectly matched to the role. Plus, our interview prep feature helps you prepare for the next step.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 7 */}
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <button
                onClick={() => toggleFaq('faq-7')}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-semibold text-white pr-4">
                  Can I cancel my subscription anytime?
                </span>
                {expandedFaq === 'faq-7' ? (
                  <Minus className="w-5 h-5 text-purple-400 flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === 'faq-7' && (
                <div className="px-6 pb-5 text-gray-300 leading-relaxed border-t border-white/10 pt-5 animate-in fade-in slide-in-from-top-4 duration-300">
                  <p>
                    Yes, you can cancel your Pro or Enterprise subscription at any time with no penalties or fees. You'll retain access until the end of your billing period. We also offer a 30-day money-back guarantee if you're not satisfied with the service. The Free plan never expires and requires no payment information.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 8 */}
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <button
                onClick={() => toggleFaq('faq-8')}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-semibold text-white pr-4">
                  Do you offer refunds?
                </span>
                {expandedFaq === 'faq-8' ? (
                  <Minus className="w-5 h-5 text-purple-400 flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === 'faq-8' && (
                <div className="px-6 pb-5 text-gray-300 leading-relaxed border-t border-white/10 pt-5 animate-in fade-in slide-in-from-top-4 duration-300">
                  <p>
                    We offer a 30-day money-back guarantee on all paid plans. If you're not completely satisfied with Talor within the first 30 days, contact our support team and we'll issue a full refund, no questions asked. We want you to feel confident trying our service risk-free.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CTA after FAQ */}
          <div className="text-center mt-12">
            <p className="text-gray-400 mb-6">Still have questions?</p>
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary inline-flex items-center gap-2"
            >
              Try It Free - No Credit Card Required
            </button>
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

        {/* Footer */}
        <footer className="border-t border-white/10 mt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            {/* Footer Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12">
              {/* Company Column */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-6 h-6 text-white" />
                  <span className="text-xl font-bold text-white">Talor</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  AI-powered resume builder that helps you land your dream job faster with perfectly tailored resumes.
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5 text-gray-400" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-gray-400" />
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="w-5 h-5 text-gray-400" />
                  </a>
                  <a
                    href="mailto:support@talor.ai"
                    className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
                    aria-label="Email"
                  >
                    <Mail className="w-5 h-5 text-gray-400" />
                  </a>
                </div>
              </div>

              {/* Product Column */}
              <div>
                <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <Link to="/upload" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Upload Resume
                    </Link>
                  </li>
                  <li>
                    <Link to="/tailor" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Tailor Resume
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      ATS Checker
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Cover Letter Generator
                    </a>
                  </li>
                </ul>
              </div>

              {/* Resources Column */}
              <div>
                <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Resume Templates
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Resume Examples
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Career Guides
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      API Documentation
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal Column */}
              <div>
                <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Cookie Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      GDPR Compliance
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Security
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Accessibility
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-white/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-gray-400 text-sm text-center sm:text-left">
                  © 2026 Talor. All rights reserved. Built with care for job seekers worldwide.
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Status
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Changelog
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
