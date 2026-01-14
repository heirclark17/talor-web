import React from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { FileText, Upload, Target, CheckCircle, Sparkles } from 'lucide-react'
import UploadResume from './pages/UploadResume'
import TailorResume from './pages/TailorResume'
import InterviewPrep from './pages/InterviewPrep'

function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - Split Layout */}
      <div className="container mx-auto px-4 sm:px-6 py-24 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto mb-24 sm:mb-32">
          {/* Left: Content */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-6 sm:mb-8 leading-tight tracking-tight">
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
                onClick={() => navigate('/tailor')}
                className="btn-secondary inline-flex items-center justify-center gap-2 text-base px-8 py-4"
              >
                Learn More
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
