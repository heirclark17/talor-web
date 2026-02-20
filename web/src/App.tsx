import React, { useState, useEffect, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { FileText, Upload, Target, Zap, CheckCircle, Clock, BookOpen, Sparkles, Bookmark, TrendingUp, Menu, X, Settings, Briefcase, FileEdit, Loader2, Layers, LogOut, CreditCard, PenTool, Sun, Moon } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import { useScrollAnimation } from './hooks/useScrollAnimation'
import { useSessionMigration } from './hooks/useSessionMigration'
import { useAuthUserSync } from './hooks/useAuthUserSync'
import { useAuth } from './contexts/AuthContext'
import { PostHogProvider } from './contexts/PostHogContext'
import { initializeTheme, useThemeStore } from './stores/themeStore'

// Auto-reload wrapper for lazy imports - handles stale chunks after deploys
function lazyWithRetry(importFn: () => Promise<any>) {
  return React.lazy(() =>
    importFn().catch((err: Error) => {
      // If the chunk 404'd due to a new deployment, reload once
      const isChunkError =
        err.message.includes('Failed to fetch dynamically imported module') ||
        err.message.includes('Loading chunk') ||
        err.message.includes('Loading CSS chunk')
      if (isChunkError && !sessionStorage.getItem('chunk_reload')) {
        sessionStorage.setItem('chunk_reload', '1')
        window.location.reload()
        return { default: () => null } as any // won't render, page is reloading
      }
      sessionStorage.removeItem('chunk_reload')
      throw err
    })
  )
}

// Lazy-loaded page components for code splitting (with auto-retry on stale chunks)
const UploadResume = lazyWithRetry(() => import('./pages/UploadResume'))
const TailorResume = lazyWithRetry(() => import('./pages/TailorResume'))
const InterviewPrep = lazyWithRetry(() => import('./pages/InterviewPrep'))
const InterviewPrepList = lazyWithRetry(() => import('./pages/InterviewPrepList'))
const StarStoriesList = lazyWithRetry(() => import('./pages/StarStoriesList'))
const SavedComparisons = lazyWithRetry(() => import('./pages/SavedComparisons'))
const CareerPathDesigner = lazyWithRetry(() => import('./pages/CareerPathDesigner'))
const Home = lazyWithRetry(() => import('./pages/Home'))
const SettingsPage = lazyWithRetry(() => import('./pages/Settings'))
const ApplicationTracker = lazyWithRetry(() => import('./pages/ApplicationTracker'))
const CoverLetterGenerator = lazyWithRetry(() => import('./pages/CoverLetterGenerator'))
const PrivacyPolicy = lazyWithRetry(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazyWithRetry(() => import('./pages/TermsOfService'))
const BatchTailor = lazyWithRetry(() => import('./pages/BatchTailor'))
const Pricing = lazyWithRetry(() => import('./pages/Pricing'))
const Templates = lazyWithRetry(() => import('./pages/Templates'))
const MockInterview = lazyWithRetry(() => import('./pages/MockInterview'))
const ResumeBuilder = lazyWithRetry(() => import('./pages/ResumeBuilder'))
const JobSearch = lazyWithRetry(() => import('./pages/JobSearch'))
const NotFound = lazyWithRetry(() => import('./pages/NotFound'))
const OnboardingTour = lazyWithRetry(() => import('./components/OnboardingTour'))

function Dashboard() {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const heroAnimation = useScrollAnimation(0.1)
  const socialProofAnimation = useScrollAnimation(0.1)
  const featuresAnimation = useScrollAnimation(0.1)
  const howItWorksAnimation = useScrollAnimation(0.1)
  const finalCtaAnimation = useScrollAnimation(0.1)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="animate-gradient absolute inset-0 z-0"></div>

      {/* Floating particles */}
      <div className="particles-background">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Landing Page Navbar */}
      <nav className="sticky top-0 z-50 landing-nav-glass">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-theme" />
              <span className="text-xl sm:text-2xl font-bold text-theme tracking-tight">Talor</span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-6">
              <Link
                to="/pricing"
                className="text-sm font-medium text-theme-secondary hover:text-theme transition-colors px-3 py-2"
              >
                Pricing
              </Link>
              {isSignedIn ? (
                <button
                  onClick={() => navigate('/resumes')}
                  className="btn-primary inline-flex items-center gap-2 text-sm px-5 py-2 text-white font-semibold"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/sign-in')}
                    className="text-sm font-medium text-theme-secondary hover:text-theme transition-colors px-3 py-2"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => navigate('/sign-up')}
                    className="btn-primary inline-flex items-center gap-2 text-sm px-5 py-2 text-white font-semibold"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Hero Section */}
        <div
          ref={heroAnimation.ref}
          className={`max-w-4xl mx-auto text-center pt-20 sm:pt-24 lg:pt-32 pb-16 sm:pb-20 lg:pb-24 animate-on-scroll ${
            heroAnimation.isVisible ? 'animate-fade-in-up' : ''
          }`}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-theme mb-6 sm:mb-8 lg:mb-12 leading-tight tracking-tight animate-float">
            Build a Job-Winning Resume in Minutes with Talor
          </h1>
          <p className="text-base sm:text-lg text-theme-secondary mb-8 sm:mb-10 lg:mb-14 leading-relaxed px-2 sm:px-0">
            Leverage your professional experience and career goals to create highly
            effective resumes. Our AI-powered platform instantly tailors your resume
            to any job posting with ATS optimization.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary inline-flex items-center justify-center gap-2 text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 text-white font-semibold animate-pulse-slow w-full sm:w-auto"
            >
              Create My Resume →
            </button>
          </div>
        </div>

        {/* Social Proof */}
        <div
          ref={socialProofAnimation.ref}
          className="max-w-5xl mx-auto py-12 sm:py-16 lg:py-20"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center">
            <div className={`animate-on-scroll ${socialProofAnimation.isVisible ? 'animate-scale-in delay-100' : ''}`}>
              <div className="text-4xl sm:text-5xl font-bold text-theme mb-2 sm:mb-3">100%</div>
              <div className="text-sm sm:text-base text-theme-secondary">ATS Compatible</div>
            </div>
            <div className={`animate-on-scroll ${socialProofAnimation.isVisible ? 'animate-scale-in delay-300' : ''}`}>
              <div className="text-4xl sm:text-5xl font-bold text-theme mb-2 sm:mb-3">15+</div>
              <div className="text-sm sm:text-base text-theme-secondary">Professional Templates</div>
            </div>
            <div className={`animate-on-scroll ${socialProofAnimation.isVisible ? 'animate-scale-in delay-500' : ''}`}>
              <div className="text-4xl sm:text-5xl font-bold text-theme mb-2 sm:mb-3">AI</div>
              <div className="text-sm sm:text-base text-theme-secondary">Powered Tailoring</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div
          ref={featuresAnimation.ref}
          className="max-w-5xl mx-auto py-16 sm:py-20 lg:py-24"
        >
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-theme text-center mb-12 sm:mb-16 lg:mb-20 animate-on-scroll ${
            featuresAnimation.isVisible ? 'animate-fade-in-up' : ''
          }`}>
            Why Talor Works Better
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className={`text-center animate-on-scroll ${
              featuresAnimation.isVisible ? 'animate-fade-in-up delay-100' : ''
            }`}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-theme-glass-5 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-float">
                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-theme" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-theme mb-3 sm:mb-4">
                Instant Tailoring
              </h3>
              <p className="text-sm sm:text-base text-theme-secondary leading-relaxed">
                Paste any job URL and our AI instantly customizes your resume to match the role, highlighting relevant experience and skills.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`text-center animate-on-scroll ${
              featuresAnimation.isVisible ? 'animate-fade-in-up delay-300' : ''
            }`}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-theme-glass-5 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-float" style={{ animationDelay: '1s' }}>
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-theme" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-theme mb-3 sm:mb-4">
                ATS-Friendly Format
              </h3>
              <p className="text-sm sm:text-base text-theme-secondary leading-relaxed">
                Every resume is formatted to pass Applicant Tracking Systems, ensuring recruiters actually see your application.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`text-center animate-on-scroll sm:col-span-2 lg:col-span-1 ${
              featuresAnimation.isVisible ? 'animate-fade-in-up delay-500' : ''
            }`}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-theme-glass-5 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-float" style={{ animationDelay: '2s' }}>
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-theme" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-theme mb-3 sm:mb-4">
                Save Hours Per Application
              </h3>
              <p className="text-sm sm:text-base text-theme-secondary leading-relaxed">
                Stop manually rewriting your resume for every job. Create tailored versions in seconds instead of hours.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="max-w-5xl mx-auto py-16 sm:py-20 lg:py-24">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme text-center mb-12 sm:mb-16">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="glass rounded-xl border border-theme-subtle p-6">
              <div className="flex items-start gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-theme-secondary text-sm mb-4 leading-relaxed">
                "Talor helped me tailor my resume for 15 different roles in one afternoon. The AI really understood how to highlight my relevant experience for each position."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-semibold">
                  S
                </div>
                <div>
                  <p className="font-semibold text-theme text-sm">Sarah M.</p>
                  <p className="text-theme-tertiary text-xs">Product Manager</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="glass rounded-xl border border-theme-subtle p-6">
              <div className="flex items-start gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-theme-secondary text-sm mb-4 leading-relaxed">
                "The interview prep feature is phenomenal. Getting company-specific questions and STAR story suggestions saved me hours of research before my interviews."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-semibold">
                  J
                </div>
                <div>
                  <p className="font-semibold text-theme text-sm">James K.</p>
                  <p className="text-theme-tertiary text-xs">Software Engineer</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="glass rounded-xl border border-theme-subtle p-6">
              <div className="flex items-start gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-theme-secondary text-sm mb-4 leading-relaxed">
                "Finally, a resume tool that actually understands the job description. The keyword matching and ATS optimization gave me confidence my applications would get seen."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-semibold">
                  M
                </div>
                <div>
                  <p className="font-semibold text-theme text-sm">Maria L.</p>
                  <p className="text-theme-tertiary text-xs">Marketing Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div
          ref={howItWorksAnimation.ref}
          className="max-w-4xl mx-auto py-16 sm:py-20 lg:py-24"
        >
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-theme text-center mb-12 sm:mb-16 lg:mb-20 animate-on-scroll ${
            howItWorksAnimation.isVisible ? 'animate-fade-in-up' : ''
          }`}>
            How It Works
          </h2>
          <div className="space-y-8 sm:space-y-12 lg:space-y-16">
            {/* Step 1 */}
            <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 lg:gap-8 text-center sm:text-left animate-on-scroll ${
              howItWorksAnimation.isVisible ? 'animate-slide-in-left delay-100' : ''
            }`}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white text-theme-inverse rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                <span className="text-xl sm:text-2xl font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-theme mb-2 sm:mb-3">
                  Upload Your Base Resume
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-theme-secondary leading-relaxed">
                  Start with your existing resume. Our AI will parse your experience, skills, and education to create your professional profile.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 lg:gap-8 text-center sm:text-left animate-on-scroll ${
              howItWorksAnimation.isVisible ? 'animate-slide-in-left delay-300' : ''
            }`}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white text-theme-inverse rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse-slow" style={{ animationDelay: '1s' }}>
                <span className="text-xl sm:text-2xl font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-theme mb-2 sm:mb-3">
                  Paste Any Job URL
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-theme-secondary leading-relaxed">
                  Simply paste a job posting link from LinkedIn, Indeed, or any company career page. We'll automatically extract requirements and keywords.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 lg:gap-8 text-center sm:text-left animate-on-scroll ${
              howItWorksAnimation.isVisible ? 'animate-slide-in-left delay-500' : ''
            }`}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white text-theme-inverse rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse-slow" style={{ animationDelay: '2s' }}>
                <span className="text-xl sm:text-2xl font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-theme mb-2 sm:mb-3">
                  Download & Apply
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-theme-secondary leading-relaxed">
                  Get your perfectly tailored, ATS-optimized resume instantly. Download as DOCX or PDF and apply with confidence.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div
          ref={finalCtaAnimation.ref}
          className={`max-w-3xl mx-auto py-16 sm:py-20 lg:py-24 text-center animate-on-scroll ${
            finalCtaAnimation.isVisible ? 'animate-fade-in-up' : ''
          }`}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme mb-4 sm:mb-6 lg:mb-8">
            Ready to Land Your Next Interview?
          </h2>
          <p className="text-base sm:text-lg text-theme-secondary mb-8 sm:mb-10 lg:mb-12">
            Join professionals who are getting more interviews with tailored resumes.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="btn-primary inline-flex items-center justify-center gap-2 text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 text-white font-semibold w-full sm:w-auto"
          >
            Get Started →
          </button>
          <p className="text-xs sm:text-sm text-theme-tertiary mt-3 sm:mt-4">Takes less than 2 minutes to get started</p>
        </div>
      </div>
    </div>
  )
}

function SessionMigrationProvider({ children }: { children: React.ReactNode }) {
  useSessionMigration()
  useAuthUserSync()
  return <>{children}</>
}

function AppContent() {
  const location = useLocation()
  const { signOut, user } = useAuth()
  const { theme, toggleTheme } = useThemeStore()
  const isLandingPage = location.pathname === '/'
  const isAuthPage = location.pathname === '/sign-in' || location.pathname === '/sign-up'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = React.useRef<HTMLDivElement>(null)
  const isDark = theme === 'dark'

  // Close mobile menu and user menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  // Close user menu on click outside
  useEffect(() => {
    if (!userMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  // Prevent body scroll when menu is open + close on Escape
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMobileMenuOpen(false)
      }
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', handleEscape)
      }
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const menuSections = [
    {
      label: 'Resume Tools',
      links: [
        { to: '/resumes', icon: FileText, label: 'My Resumes', desc: 'View and manage all resumes', tourId: 'resumes', iconColor: 'text-blue-400' },
        { to: '/templates', icon: PenTool, label: 'Templates', desc: 'Browse resume templates', tourId: 'templates', iconColor: 'text-purple-400' },
        { to: '/upload', icon: Upload, label: 'Upload', desc: 'Upload a new base resume', tourId: 'upload', iconColor: 'text-emerald-400' },
        { to: '/tailor', icon: Target, label: 'Tailor', desc: 'Customize for a specific job', tourId: 'tailor', iconColor: 'text-rose-400' },
        { to: '/batch-tailor', icon: Layers, label: 'Batch Tailor', desc: 'Tailor for multiple jobs at once', tourId: 'batch-tailor', iconColor: 'text-violet-400' },
      ],
    },
    {
      label: 'Career Prep',
      links: [
        { to: '/job-search', icon: Search, label: 'Job Search', desc: 'Find and tailor for jobs', tourId: 'job-search', iconColor: 'text-emerald-400' },
        { to: '/applications', icon: Briefcase, label: 'Applications', desc: 'Track your job applications', tourId: 'applications', iconColor: 'text-amber-400' },
        { to: '/interview-preps', icon: BookOpen, label: 'Interview Prep', desc: 'Practice for upcoming interviews', tourId: 'interview-prep', iconColor: 'text-cyan-400' },
        { to: '/star-stories', icon: Sparkles, label: 'STAR Stories', desc: 'Build behavioral interview answers', tourId: 'star-stories', iconColor: 'text-yellow-400' },
        { to: '/cover-letters', icon: FileEdit, label: 'Cover Letters', desc: 'Generate tailored cover letters', tourId: 'cover-letters', iconColor: 'text-indigo-400' },
      ],
    },
    {
      label: 'Growth',
      links: [
        { to: '/saved-comparisons', icon: Bookmark, label: 'Saved', desc: 'Bookmarked comparisons', tourId: 'saved', iconColor: 'text-orange-400' },
        { to: '/career-path', icon: TrendingUp, label: 'Career Path', desc: 'Plan your career trajectory', tourId: 'career-path', iconColor: 'text-green-400' },
        { to: '/pricing', icon: CreditCard, label: 'Pricing', desc: 'View plans and upgrade', tourId: 'pricing', iconColor: 'text-purple-400' },
        { to: '/settings', icon: Settings, label: 'Settings', desc: 'Preferences and account', tourId: 'settings', iconColor: 'text-slate-400' },
      ],
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Top Navigation - Hidden on landing page and auth pages */}
      {!isLandingPage && !isAuthPage && (
        <nav className="sticky top-0 z-50" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-theme" />
                <span className="text-xl sm:text-2xl font-bold text-theme tracking-tight">Talor</span>
              </Link>

              {/* Theme Toggle + Menu Button + User Avatar */}
              <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="group relative inline-flex items-center justify-center rounded-lg p-2.5 transition-all duration-200 hover:bg-theme-glass-10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-theme min-w-[44px] min-h-[44px]"
                  aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                  title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                >
                  <Sun
                    className={`h-5 w-5 transition-all duration-300 ${
                      isDark
                        ? 'rotate-0 scale-100 text-theme-secondary group-hover:text-theme'
                        : 'rotate-90 scale-0 absolute'
                    }`}
                  />
                  <Moon
                    className={`h-5 w-5 transition-all duration-300 ${
                      !isDark
                        ? 'rotate-0 scale-100 text-theme-secondary group-hover:text-theme'
                        : '-rotate-90 scale-0 absolute'
                    }`}
                  />
                </button>

                {user && (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="w-9 h-9 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-semibold text-sm hover:bg-blue-500/30 transition-colors"
                      aria-label="User menu"
                      aria-expanded={userMenuOpen}
                      aria-haspopup="true"
                    >
                      {(user.user_metadata?.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                    </button>

                    {userMenuOpen && (
                      <div
                        className="absolute right-0 mt-2 w-64 rounded-xl overflow-hidden user-menu-glass"
                        role="menu"
                      >
                        <div className="px-4 py-3 border-b border-white/8">
                          {user.user_metadata?.full_name && (
                            <p className="text-sm font-semibold text-theme truncate">{user.user_metadata.full_name}</p>
                          )}
                          <p className="text-xs text-theme-tertiary truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false)
                            signOut()
                          }}
                          role="menuitem"
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-theme-secondary hover:text-theme hover:bg-white/8 transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="min-w-[44px] min-h-[44px] p-2 text-theme hover:bg-theme-glass-10 rounded-lg transition-colors flex items-center justify-center gap-2"
                  aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="nav-menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" aria-hidden="true" />
                  ) : (
                    <Menu className="w-6 h-6" aria-hidden="true" />
                  )}
                  <span className="text-sm font-medium hidden sm:inline">Menu</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Dropdown Panel */}
          {mobileMenuOpen && (
            <div
              id="nav-menu"
              className="fixed inset-0 top-[65px] z-40"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-md menu-backdrop-enter"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />

              {/* Menu Panel */}
              <nav
                className="relative menu-panel-enter menu-glass-panel"
                aria-label="Main navigation"
              >
                <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" role="menu">
                    {menuSections.map((section) => (
                      <div key={section.label}>
                        <div className="menu-section-label">{section.label}</div>
                        <div className="flex flex-col gap-1.5">
                          {section.links.map((link) => (
                            <Link
                              key={link.to}
                              to={link.to}
                              data-tour={link.tourId}
                              onClick={() => setMobileMenuOpen(false)}
                              role="menuitem"
                              className={`menu-nav-card menu-item-enter ${
                                location.pathname === link.to ? 'active' : ''
                              }`}
                              aria-current={location.pathname === link.to ? 'page' : undefined}
                            >
                              <div className="menu-icon-wrap">
                                <link.icon
                                  className={`w-[18px] h-[18px] ${
                                    location.pathname === link.to
                                      ? 'text-accent'
                                      : link.iconColor
                                  }`}
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className={`text-[15px] font-semibold leading-tight ${
                                  location.pathname === link.to ? 'text-theme' : 'text-theme'
                                }`}>
                                  {link.label}
                                </div>
                                <div className="text-[13px] text-theme-tertiary leading-snug mt-0.5">
                                  {link.desc}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </nav>
            </div>
          )}
        </nav>
      )}

      {/* Main Content */}
      <main>
        <ErrorBoundary>
          <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-theme-secondary" />
            </div>
          }>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/sign-in/*" element={<SignIn />} />
              <Route path="/sign-up/*" element={<SignUp />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />

              {/* Protected routes */}
              <Route path="/resumes" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><UploadResume /></ProtectedRoute>} />
              <Route path="/tailor" element={<ProtectedRoute><TailorResume /></ProtectedRoute>} />
              <Route path="/batch-tailor" element={<ProtectedRoute><BatchTailor /></ProtectedRoute>} />
              <Route path="/applications" element={<ProtectedRoute><ApplicationTracker /></ProtectedRoute>} />
              <Route path="/interview-preps" element={<ProtectedRoute><InterviewPrepList /></ProtectedRoute>} />
              <Route path="/interview-prep/:tailoredResumeId" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
              <Route path="/mock-interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
              <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
              <Route path="/job-search" element={<ProtectedRoute><JobSearch /></ProtectedRoute>} />
              <Route path="/star-stories" element={<ProtectedRoute><StarStoriesList /></ProtectedRoute>} />
              <Route path="/cover-letters" element={<ProtectedRoute><CoverLetterGenerator /></ProtectedRoute>} />
              <Route path="/saved-comparisons" element={<ProtectedRoute><SavedComparisons /></ProtectedRoute>} />
              <Route path="/career-path" element={<ProtectedRoute><CareerPathDesigner /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              {/* 404 catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Toast notifications */}
      <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />

      {/* Onboarding Tour - Shows on first visit */}
      {!isLandingPage && !isAuthPage && <OnboardingTour />}
    </div>
  )
}

function App() {
  // Initialize theme on app load
  useEffect(() => {
    initializeTheme()
  }, [])

  return (
    <BrowserRouter>
      <PostHogProvider>
        <SessionMigrationProvider>
          <AppContent />
        </SessionMigrationProvider>
      </PostHogProvider>
    </BrowserRouter>
  )
}

export default App
