import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2, Mail, Lock, User, FileText } from 'lucide-react'

export default function SignUp() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/resumes`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.user && !data.session) {
      // Email confirmation required
      setConfirmationSent(true)
      setLoading(false)
    } else {
      navigate('/resumes')
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/resumes` },
    })
    if (error) setError(error.message)
  }

  if (confirmationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass rounded-2xl p-8 border border-theme-subtle w-full max-w-md text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-xl font-semibold text-theme mb-2">Check your email</h1>
          <p className="text-theme-secondary text-sm mb-6">
            We sent a confirmation link to <strong className="text-theme">{email}</strong>.
            Click the link to activate your account.
          </p>
          <Link to="/sign-in" className="text-blue-400 hover:text-blue-300 text-sm">
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass rounded-2xl p-8 border border-theme-subtle w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <FileText className="w-7 h-7 text-theme" />
          <span className="text-2xl font-bold text-theme tracking-tight">Talor</span>
        </div>

        <h1 className="text-xl font-semibold text-theme text-center mb-2">Create your account</h1>
        <p className="text-theme-secondary text-sm text-center mb-6">Start tailoring resumes in minutes</p>

        {/* OAuth buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuth('google')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-theme-glass-10 border border-theme-muted text-theme rounded-lg hover:bg-theme-glass-20 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-theme-glass-10 border border-theme-muted text-theme rounded-lg hover:bg-theme-glass-20 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-theme-glass-20"></div>
          <span className="text-theme-tertiary text-sm">or</span>
          <div className="flex-1 h-px bg-theme-glass-20"></div>
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-theme-secondary text-sm mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-theme-glass-10 border border-theme-muted text-theme rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-theme-secondary text-sm mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-theme-glass-10 border border-theme-muted text-theme rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-theme-secondary text-sm mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 bg-theme-glass-10 border border-theme-muted text-theme rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="text-theme-secondary text-sm text-center mt-6">
          Already have an account?{' '}
          <Link to="/sign-in" className="text-blue-400 hover:text-blue-300">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
