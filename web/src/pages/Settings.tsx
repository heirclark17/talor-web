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
    alert('Local data cleared. A new session will be created.')
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
    window.open('mailto:support@talor.app?subject=Web App Support', '_blank')
  }

  const handlePrivacy = () => {
    window.open('https://talor.app/privacy', '_blank')
  }

  const handleTerms = () => {
    window.open('https://talor.app/terms', '_blank')
  }

  const handleHelp = () => {
    window.open('https://talor.app/help', '_blank')
  }

  const getThemeLabel = () => {
    return theme === 'dark' ? 'Dark' : 'Light'
  }

  const getThemeIcon = () => {
    return theme === 'dark' ? (
      <Moon className="w-5 h-5 text-gray-400" />
    ) : (
      <Sun className="w-5 h-5 text-gray-400" />
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-semibold text-white mb-8">Settings</h1>

        {/* Account Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Account
          </h2>
          <div className="glass rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-white font-medium">User ID</p>
                  <p className="text-gray-500 text-sm font-mono truncate max-w-[200px]">
                    {userId.slice(0, 20)}...
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopyUserId}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Copy user ID"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Features
          </h2>
          <div className="glass rounded-xl border border-white/10 overflow-hidden divide-y divide-white/10">
            <Link
              to="/resumes"
              className="px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-white font-medium">My Resumes</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </Link>
            <Link
              to="/star-stories"
              className="px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-white font-medium">STAR Stories</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </Link>
            <Link
              to="/career-path"
              className="px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-white font-medium">Career Path Designer</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </Link>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Appearance
          </h2>
          <div className="glass rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={toggleTheme}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  {getThemeIcon()}
                </div>
                <span className="text-white font-medium">Theme</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{getThemeLabel()}</span>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </div>
            </button>
          </div>
        </section>

        {/* Support Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Support
          </h2>
          <div className="glass rounded-xl border border-white/10 overflow-hidden divide-y divide-white/10">
            <button
              onClick={handleHelp}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-white font-medium">Help Center</span>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={handleContact}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-white font-medium">Contact Support</span>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </section>

        {/* Legal Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Legal
          </h2>
          <div className="glass rounded-xl border border-white/10 overflow-hidden divide-y divide-white/10">
            <button
              onClick={handlePrivacy}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-white font-medium">Privacy Policy</span>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={handleTerms}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-white font-medium">Terms of Service</span>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </section>

        {/* Data Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Data
          </h2>
          <div className="glass rounded-xl border border-white/10 overflow-hidden">
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
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </section>

        {/* App Info */}
        <div className="text-center py-8">
          <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
            <SettingsIcon className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Talor</h2>
          <p className="text-gray-400 text-sm mb-2">Version 1.0.0</p>
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} Talor. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
