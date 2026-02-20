import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Settings as SettingsIcon,
  User,
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
  AlertTriangle,
  Palette,
  Bell,
} from 'lucide-react'
import { getUserId, clearUserSession } from '../utils/userSession'
import { showSuccess } from '../utils/toast'
import ThemeToggle from '../components/ThemeToggle'
import NotificationPreferences from '../components/settings/NotificationPreferences'

export default function Settings() {
  const [userId, setUserId] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    setUserId(getUserId())
  }, [])

  const handleClearData = () => {
    setShowClearConfirm(true)
  }

  const confirmClearData = () => {
    clearUserSession()
    showSuccess('Local data cleared. A new session will be created.')
    setUserId(getUserId())
    setShowClearConfirm(false)
  }

  const handleCopyUserId = async () => {
    try {
      await navigator.clipboard.writeText(userId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard write can fail silently
    }
  }

  const handleContact = () => {
    window.open('mailto:support@talorme.com?subject=Web App Support', '_blank')
  }

  const handleHelp = () => {
    window.open('mailto:support@talorme.com?subject=Help Request', '_blank')
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

        {/* Appearance Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-theme-tertiary uppercase tracking-wide mb-3">
            Appearance
          </h2>
          <div className="glass rounded-xl border border-theme-subtle overflow-hidden">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-theme-glass-5 rounded-lg flex items-center justify-center">
                  <Palette className="w-5 h-5 text-theme-secondary" />
                </div>
                <div>
                  <p className="text-theme font-medium">Theme</p>
                  <p className="text-theme-tertiary text-sm">Choose your preferred color scheme</p>
                </div>
              </div>
              <ThemeToggle variant="switch" />
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-theme-tertiary uppercase tracking-wide mb-3">
            Notifications
          </h2>
          <div className="glass rounded-xl border border-theme-subtle overflow-hidden">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-theme-glass-5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-theme-glass-5 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-theme-secondary" />
                </div>
                <div className="text-left">
                  <p className="text-theme font-medium">Email & In-App Notifications</p>
                  <p className="text-theme-tertiary text-sm">Manage your notification preferences</p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-theme-tertiary transition-transform ${showNotifications ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Notification Preferences Panel */}
          {showNotifications && (
            <div className="mt-4">
              <NotificationPreferences />
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-theme-tertiary uppercase tracking-wide mb-3">
            Features
          </h2>
          <div className="glass rounded-xl border border-theme-subtle overflow-hidden">
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

        {/* Support Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-theme-tertiary uppercase tracking-wide mb-3">
            Support
          </h2>
          <div className="glass rounded-xl border border-theme-subtle overflow-hidden">
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
          <div className="glass rounded-xl border border-theme-subtle overflow-hidden">
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

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm clear data"
        >
          <div
            className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-theme-subtle bg-theme p-6 text-center">
            <div className="w-14 h-14 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-theme mb-2">Clear Local Data?</h3>
            <p className="text-theme-secondary text-sm mb-6">
              This will clear your local session data. Your resumes and server data will not be affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-theme-glass-10 hover:bg-theme-glass-20 text-theme rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearData}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
