import React from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { FileText, Upload, Target, CheckCircle, Sparkles, TrendingUp, Award, ChevronDown } from 'lucide-react'
import UploadResume from './pages/UploadResume'
import TailorResume from './pages/TailorResume'
import InterviewPrep from './pages/InterviewPrep'

function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Build a Job-Winning Resume in Minutes with AI
          </h1>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed">
            Leverage your professional experience and career goals to create a highly
            effective resume. Our AI-powered resumes instantly impress hiring managers.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="btn-primary inline-flex items-center gap-2 text-lg"
          >
            Start for Free →
          </button>
        </div>

        {/* Feature Cards Grid - Glassmorphism Style */}
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-16">
          {/* AI Writes for You Card */}
          <div className="glass glass-hover rounded-3xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-wide">
                  AI Writes it for You
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  AI writes optimized content tailored to job descriptions
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
            </div>
          </div>

          {/* Guided Resume Flow Card */}
          <div className="glass glass-hover rounded-3xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-wide">
                  Guided Resume Flow
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Step-by-step guidance through resume creation process
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
            </div>
          </div>

          {/* Resume Quality Score Card */}
          <div className="glass glass-hover rounded-3xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-wide">
                  Resume Quality Score
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Real-time ATS scoring to track and improve resume quality
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
            </div>
          </div>

          {/* Match Any Job Card */}
          <div className="glass glass-hover rounded-3xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-wide">
                  Match Any Job Instantly
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Side-by-side job matching with keyword highlighting
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
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
