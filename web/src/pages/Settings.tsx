import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Monitor,
  Shield,
  HelpCircle,
  Mail,
  ExternalLink,
  Trash2,
  ChevronRight,
  BookOpen,
  TrendingUp,
  FileText,
  Copy,
  Check,
} from 'lucide-react'
import { getUserId, clearUserSession } from '../utils/userSession'
import { useTheme } from '../contexts/ThemeContext'
import { showSuccess } from '../utils/toast'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const [userId, setUserId] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setUserId(getUserId())
  }, [])

  const handleClearData = () => {
    if (!window.confirm(
      'This will clear all your local data including your user session. Your resumes and data stored on the server will not be affected. Are you sure?'
    )) {
      return
    }

    clearUserSession()
    showSuccess('Local data cleared. A new session will be created.')
    setUserId(getUserId())
  }

  const handleCopyUserId = async () => {
    try {
      await navigator.clipboard.writeText(userId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy user ID:', err)
    }
  }

  const handleContact = () => {
    window.open('mailto:support@talorme.com?subject=Web App Support', '_blank')
  }

  const handleHelp = () => {
    window.open('mailto:support@talorme.com?subject=Help Request', '_blank')
  }

  const getThemeLabel = () => {
    return theme === 'dark' ? 'Dark' : 'Light'
  }

  const getThemeIcon = () => {
    return theme === 'dark' ? (
      <Moon className="w-5 h-5 text-theme-secondary" />
    ) : (
      <Sun className="w-5 h-5 text-theme-secondary" />
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-semibold text-theme mb-8">Settings</h1>

        {/* Account Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-theme-tertiary uppercase tracking-wide mb-3">
            Account
          </h2>
          <div className="glass rounded-xl border border-theme-subtle overflow-hidden">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-theme-glass-5 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-theme-secondary" />
                </div>
                <div>
                  <p className="text-theme font-medium">User ID</p>
                  <p className="text-theme-tertiary text-sm font-mono truncate max-w-[200px]">
                    {userId.slice(0, 20)}...
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopyUserId}
                className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Copy user ID"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-theme-secondary" />
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-theme-tertiary uppercase tracking-wide mb-3">
            Features
          </h2>
          <div className="glass rounded-xl border border-theme-subtle overflow-hidden divide-y divide-theme-subtle">
            <Link
              to="/resumes"
              className="px-4 py-4 flex items-center justify-between hover:bg-theme-glass-5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-theme-glass-5 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-theme-secondary" />
                </div>
                <span className="text-theme font-medium">My Resumes</span>
              </div>
              <ChevronRight className="w-5 h-5 text-theme-tertiary" />
            </Link>
            <Link
              to="/star-stories"
              className="px-4 py-4 flex items-center justify-between hover:bg-theme-glass-5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-theme-glass-5 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-theme-secondary" />
                </div>
                <span className="text-theme font-medium">STAR Stories</span>
              </div>
              <ChevronRight className="w-5 h-5 text-theme-tertiary" />
            </Link>
            <Link
              to="/career-path"
              className="px-4 py-4 flex items-center justify-between hover:bg-theme-glass-5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-theme-glass-5 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-theme-secondary" />
                </div>
                <span className="text-theme font-medium">Career Path Designer</span>
              </div>
              <ChevronRight className="w-5 h-5 text-theme-tertiary" />
            </Link>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-theme-tertiary uppercase tracking-wide mb-3">
            Appearance
          </h2>
          <div className="glass rounded-xl border border-theme-subtle overflow-hidden">
            <button
              onClick={toggleTheme}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-theme-glass-5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-theme-glass-5 rounded-lg flex items-center justify-center">
                  {getThemeIcon()}
                </div>
                <span className="text-theme font-medium">Theme</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-theme-secondary">{getThemeLabel()}</span>
                <ChevronRight className="w-5 h-5 text-theme-tertiary" />
              </div>
            </button>
          </div>
        </section>

        {/* Support Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-theme-tertiary uppercase tracking-wide mb-3">
            Support
          </h2>
          <div className="glass rounded-xl border border-theme-subtle overflow-hidden divide-y divide-theme-subtle">
            <button
              onClick={handleHelp}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-theme-glass-5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-theme-glass-5 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-theme-secondary" />
                </div>
                <span className="text-theme font-medium">Help Center</span>
              </div>
              <ExternalLink className="w-5 h-5 text-theme-tertiary" />
            </button>
            <button
              onClick={handleContact}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-theme-glass-5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-theme-glass-5 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-theme-secondary" />
                </div>
                <span className="text-theme font-medium">Contact Support</span>
              </div>
              <ExternalLink className="w-5 h-5 text-theme-tertiary" />
            </button>
          </div>
        </section>

        {/* Legal Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-theme-tertiary uppercase tracking-wide mb-3">
            Legal
          </h2>
          <div className="glass rounded-xl border border-theme-subtle overflow-hidden divide-y divide-theme-subtle">
            <Link
              to="/privacy"
              className="px-4 py-4 flex items-center justify-between hover:bg-theme-glass-5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-theme-glass-5 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-theme-secondary" />
                </div>
                <span className="text-theme font-medium">Privacy Policy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-theme-tertiary" />
            </Link>
            <Link
              to="/terms"
              className="px-4 py-4 flex items-center justify-between hover:bg-theme-glass-5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-theme-glass-5 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-theme-secondary" />
                </div>
                <span className="text-theme font-medium">Terms of Service</span>
              </div>
              <ChevronRight className="w-5 h-5 text-theme-tertiary" />
            </Link>
          </div>
        </section>

        {/* Data Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-theme-tertiary uppercase tracking-wide mb-3">
            Data
          </h2>
          <div className="glass rounded-xl border border-theme-subtle overflow-hidden">
            <button
              onClick={handleClearData}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-red-500/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-red-400 font-medium">Clear Local Data</span>
              </div>
              <ChevronRight className="w-5 h-5 text-theme-tertiary" />
            </button>
          </div>
        </section>

        {/* App Info */}
        <div className="text-center py-8">
          <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto mb-4 border border-theme-subtle">
            <SettingsIcon className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-theme mb-1">Talor</h2>
          <p className="text-theme-secondary text-sm mb-2">Version 1.0.0</p>
          <p className="text-theme-tertiary text-xs">
            &copy; {new Date().getFullYear()} Talor. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
