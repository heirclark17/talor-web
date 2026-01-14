import React from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { FileText, Upload, Target } from 'lucide-react'
import UploadResume from './pages/UploadResume'
import TailorResume from './pages/TailorResume'
import InterviewPrep from './pages/InterviewPrep'

function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - Split Layout */}
      <div className="container mx-auto px-4 sm:px-6 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto mb-24 sm:mb-32 text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-6 sm:mb-8 leading-tight tracking-tight">
              Build a Job-Winning Resume in Minutes with AI
            </h1>
            <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed">
              Leverage your professional experience and career goals to create highly
              effective resumes. Our AI-powered platform instantly tailors your resume
              to any job posting with ATS optimization.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
