import React from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { FileText, Upload, Target, Zap, CheckCircle, Clock } from 'lucide-react'
import UploadResume from './pages/UploadResume'
import TailorResume from './pages/TailorResume'
import InterviewPrep from './pages/InterviewPrep'

function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center pt-32 pb-24">
          <h1 className="text-6xl font-semibold text-white mb-12 leading-tight tracking-tight">
            Build a Job-Winning Resume in Minutes with AI
          </h1>
          <p className="text-lg text-gray-300 mb-14 leading-relaxed">
            Leverage your professional experience and career goals to create highly
            effective resumes. Our AI-powered platform instantly tailors your resume
            to any job posting with ATS optimization.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-10 py-5 text-white font-semibold"
            >
              Create My Resume Free →
            </button>
            <p className="text-sm text-gray-500">No credit card required • Free forever</p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="max-w-5xl mx-auto py-20 border-t border-white/10">
          <div className="grid grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold text-white mb-3">10x</div>
              <div className="text-base text-gray-400">Faster Applications</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-3">ATS</div>
              <div className="text-base text-gray-400">Optimized Format</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-3">AI</div>
              <div className="text-base text-gray-400">Powered Tailoring</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-5xl mx-auto py-24">
          <h2 className="text-4xl font-bold text-white text-center mb-20">
            Why Talor Works Better
          </h2>
          <div className="grid grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Instant Tailoring
              </h3>
              <p className="text-base text-gray-400 leading-relaxed">
                Paste any job URL and our AI instantly customizes your resume to match the role, highlighting relevant experience and skills.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                ATS-Friendly Format
              </h3>
              <p className="text-base text-gray-400 leading-relaxed">
                Every resume is formatted to pass Applicant Tracking Systems, ensuring recruiters actually see your application.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Save Hours Per Application
              </h3>
              <p className="text-base text-gray-400 leading-relaxed">
                Stop manually rewriting your resume for every job. Create tailored versions in seconds instead of hours.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto py-24 border-t border-white/10">
          <h2 className="text-4xl font-bold text-white text-center mb-20">
            How It Works
          </h2>
          <div className="space-y-16">
            {/* Step 1 */}
            <div className="flex items-start gap-8">
              <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold">1</span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  Upload Your Base Resume
                </h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Start with your existing resume. Our AI will parse your experience, skills, and education to create your professional profile.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-8">
              <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold">2</span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  Paste Any Job URL
                </h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Simply paste a job posting link from LinkedIn, Indeed, or any company career page. We'll automatically extract requirements and keywords.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-8">
              <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold">3</span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  Download & Apply
                </h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Get your perfectly tailored, ATS-optimized resume instantly. Download as DOCX or PDF and apply with confidence.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-3xl mx-auto py-24 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Ready to Land Your Next Interview?
          </h2>
          <p className="text-lg text-gray-400 mb-12">
            Join professionals who are getting more interviews with tailored resumes.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-10 py-5 text-white font-semibold"
          >
            Start For Free →
          </button>
          <p className="text-sm text-gray-500 mt-4">Takes less than 2 minutes to get started</p>
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
                  <span className="text-base font-medium">Upload</span>
                </Link>
                <Link
                  to="/tailor"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Target className="w-5 h-5" />
                  <span className="text-base font-medium">Tailor</span>
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
