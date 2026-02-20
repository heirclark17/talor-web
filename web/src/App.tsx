import React, { useState, useEffect, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { FileText, Upload, Target, Zap, CheckCircle, Clock, BookOpen, Sparkles, Bookmark, TrendingUp, Menu, X, Settings, Briefcase, FileEdit, Loader2, Layers, LogOut } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import { useScrollAnimation } from './hooks/useScrollAnimation'
import { useSessionMigration } from './hooks/useSessionMigration'
import { useClerkUserSync } from './hooks/useClerkUserSync'
import { useAuth } from './contexts/AuthContext'
import { PostHogProvider } from './contexts/PostHogContext'

// Lazy-loaded page components for code splitting
const UploadResume = React.lazy(() => import('./pages/UploadResume'))
const TailorResume = React.lazy(() => import('./pages/TailorResume'))
const InterviewPrep = React.lazy(() => import('./pages/InterviewPrep'))
const InterviewPrepList = React.lazy(() => import('./pages/InterviewPrepList'))
const StarStoriesList = React.lazy(() => import('./pages/StarStoriesList'))
const SavedComparisons = React.lazy(() => import('./pages/SavedComparisons'))
const CareerPathDesigner = React.lazy(() => import('./pages/CareerPathDesigner'))
const Home = React.lazy(() => import('./pages/Home'))
const SettingsPage = React.lazy(() => import('./pages/Settings'))
const ApplicationTracker = React.lazy(() => import('./pages/ApplicationTracker'))
const CoverLetterGenerator = React.lazy(() => import('./pages/CoverLetterGenerator'))
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'))
const BatchTailor = React.lazy(() => import('./pages/BatchTailor'))
const NotFound = React.lazy(() => import('./pages/NotFound'))
const OnboardingTour = React.lazy(() => import('./components/OnboardingTour'))

function Dashboard() {
  const navigate = useNavigate()
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
              <div className="text-4xl sm:text-5xl font-bold text-theme mb-2 sm:mb-3">10x</div>
              <div className="text-sm sm:text-base text-theme-secondary">Faster Applications</div>
            </div>
            <div className={`animate-on-scroll ${socialProofAnimation.isVisible ? 'animate-scale-in delay-300' : ''}`}>
              <div className="text-4xl sm:text-5xl font-bold text-theme mb-2 sm:mb-3">ATS</div>
              <div className="text-sm sm:text-base text-theme-secondary">Optimized Format</div>
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

        {/* How It Works */}
        <div
          ref={howItWorksAnimation.ref}
          className="max-w-4xl mx-auto py-16 sm:py-20 lg:py-24 border-t border-theme-subtle"
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
  useClerkUserSync()
  return <>{children}</>
}

function AppContent() {
  const location = useLocation()
  const { signOut, user } = useAuth()
  const isLandingPage = location.pathname === '/'
  const isAuthPage = location.pathname === '/sign-in' || location.pathname === '/sign-up'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

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

  const navLinks = [
    { to: '/resumes', icon: FileText, label: 'Resumes', tourId: 'resumes' },
    { to: '/upload', icon: Upload, label: 'Upload', tourId: 'upload' },
    { to: '/tailor', icon: Target, label: 'Tailor', tourId: 'tailor' },
    { to: '/batch-tailor', icon: Layers, label: 'Batch', tourId: 'batch-tailor' },
    { to: '/applications', icon: Briefcase, label: 'Applications', tourId: 'applications' },
    { to: '/interview-preps', icon: BookOpen, label: 'Interview Prep', tourId: 'interview-prep' },
    { to: '/star-stories', icon: Sparkles, label: 'STAR Stories', tourId: 'star-stories' },
    { to: '/cover-letters', icon: FileEdit, label: 'Cover Letters', tourId: 'cover-letters' },
    { to: '/saved-comparisons', icon: Bookmark, label: 'Saved', tourId: 'saved' },
    { to: '/career-path', icon: TrendingUp, label: 'Career Path', tourId: 'career-path' },
    { to: '/settings', icon: Settings, label: 'Settings', tourId: 'settings' },
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

              {/* Menu Button + User Avatar */}
              <div className="flex items-center gap-3">
                {user && (
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-3 py-1.5 text-theme-secondary hover:text-theme hover:bg-theme-glass-10 rounded-lg transition-colors text-sm"
                    title="Sign out"
                  >
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-semibold text-sm">
                      {(user.user_metadata?.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                    </div>
                    <LogOut className="w-4 h-4" />
                  </button>
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
              className="fixed inset-0 top-[65px] z-40 animate-fade-in"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Backdrop - clickable to close */}
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
                onClick={() => setMobileMenuOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setMobileMenuOpen(false)
                  }
                }}
                aria-hidden="true"
              />

              {/* Menu Panel */}
              <nav
                className="relative border-t border-theme-subtle animate-slide-down"
                style={{ backgroundColor: 'var(--bg-primary)' }}
                aria-label="Main navigation"
              >
                <div className="container mx-auto px-4 sm:px-6 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2" role="menu">
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        data-tour={link.tourId}
                        onClick={() => setMobileMenuOpen(false)}
                        role="menuitem"
                        className={`flex items-center gap-3 p-3 min-h-[44px] rounded-xl transition-all duration-200 ${
                          location.pathname === link.to
                            ? 'bg-theme-glass-10 text-theme'
                            : 'text-theme-secondary hover:bg-theme-glass-5 hover:text-theme active:scale-[0.98]'
                        }`}
                        aria-current={location.pathname === link.to ? 'page' : undefined}
                      >
                        <link.icon className="w-5 h-5" aria-hidden="true" />
                        <span className="text-base font-medium">{link.label}</span>
                      </Link>
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
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />

              {/* Protected routes */}
              <Route path="/resumes" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><UploadResume /></ProtectedRoute>} />
              <Route path="/tailor" element={<ProtectedRoute><TailorResume /></ProtectedRoute>} />
              <Route path="/batch-tailor" element={<ProtectedRoute><BatchTailor /></ProtectedRoute>} />
              <Route path="/applications" element={<ProtectedRoute><ApplicationTracker /></ProtectedRoute>} />
              <Route path="/interview-preps" element={<ProtectedRoute><InterviewPrepList /></ProtectedRoute>} />
              <Route path="/interview-prep/:tailoredResumeId" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
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
