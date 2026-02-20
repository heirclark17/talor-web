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
