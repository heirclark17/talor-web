/**
 * Notification Preferences Component
 *
 * Allows users to configure email and in-app notification settings
 */

import { useState, useEffect } from 'react'
import { Bell, Mail, MessageSquare, CheckCircle, Info } from 'lucide-react'
import { showSuccess, showError } from '../../utils/toast'

interface NotificationSetting {
  id: string
  label: string
  description: string
  email: boolean
  inApp: boolean
  category: 'resume' | 'application' | 'interview' | 'account'
}

export default function NotificationPreferences() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'resume_ready',
      label: 'Resume Ready',
      description: 'When your tailored resume is ready to download',
      email: true,
      inApp: true,
      category: 'resume',
    },
    {
      id: 'batch_complete',
      label: 'Batch Tailoring Complete',
      description: 'When all resumes in a batch are ready',
      email: true,
      inApp: true,
      category: 'resume',
    },
    {
      id: 'cover_letter_ready',
      label: 'Cover Letter Ready',
      description: 'When your generated cover letter is ready',
      email: false,
      inApp: true,
      category: 'resume',
    },
    {
      id: 'application_update',
      label: 'Application Status Update',
      description: 'When tracked application status changes',
      email: true,
      inApp: true,
      category: 'application',
    },
    {
      id: 'interview_reminder',
      label: 'Interview Reminders',
      description: '24 hours before scheduled interviews',
      email: true,
      inApp: true,
      category: 'interview',
    },
    {
      id: 'interview_prep_ready',
      label: 'Interview Prep Ready',
      description: 'When AI-generated interview prep is complete',
      email: false,
      inApp: true,
      category: 'interview',
    },
    {
      id: 'weekly_summary',
      label: 'Weekly Summary',
      description: 'Weekly digest of your application activity',
      email: true,
      inApp: false,
      category: 'account',
    },
    {
      id: 'tips_and_updates',
      label: 'Tips & Product Updates',
      description: 'Job search tips and new Talor features',
      email: false,
      inApp: false,
      category: 'account',
    },
  ])

  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notification_preferences')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading notification preferences:', error)
      }
    }
  }, [])

  const handleToggle = (id: string, channel: 'email' | 'inApp') => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, [channel]: !setting[channel] } : setting
      )
    )
    setHasChanges(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save to localStorage
      localStorage.setItem('notification_preferences', JSON.stringify(settings))

      // TODO: Save to backend API
      // await api.updateNotificationPreferences(settings)

      showSuccess('Notification preferences saved')
      setHasChanges(false)
    } catch (error) {
      showError('Error saving preferences')
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'resume', name: 'Resume & Documents', icon: CheckCircle },
    { id: 'application', name: 'Job Applications', icon: Bell },
    { id: 'interview', name: 'Interviews', icon: MessageSquare },
    { id: 'account', name: 'Account & Updates', icon: Info },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-theme mb-2">Notification Preferences</h2>
        <p className="text-theme-secondary">
          Choose how and when you want to receive updates about your job search
        </p>
      </div>

      {/* Notification Categories */}
      {categories.map((category) => {
        const CategoryIcon = category.icon
        const categorySettings = settings.filter((s) => s.category === category.id)

        if (categorySettings.length === 0) return null

        return (
          <div key={category.id} className="glass rounded-xl border border-theme-subtle p-6">
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <CategoryIcon className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-theme">{category.name}</h3>
            </div>

            {/* Settings Table */}
            <div className="space-y-1">
              {/* Header Row */}
              <div className="grid grid-cols-[1fr,auto,auto] gap-4 pb-3 border-b border-theme-subtle">
                <div className="text-sm font-medium text-theme-secondary">Notification</div>
                <div className="text-sm font-medium text-theme-secondary text-center w-20">
                  <Mail className="w-4 h-4 mx-auto" />
                  <span className="text-xs">Email</span>
                </div>
                <div className="text-sm font-medium text-theme-secondary text-center w-20">
                  <Bell className="w-4 h-4 mx-auto" />
                  <span className="text-xs">In-App</span>
                </div>
              </div>

              {/* Setting Rows */}
              {categorySettings.map((setting) => (
                <div
                  key={setting.id}
                  className="grid grid-cols-[1fr,auto,auto] gap-4 py-3 border-b border-theme-subtle last:border-0"
                >
                  <div>
                    <p className="font-medium text-theme">{setting.label}</p>
                    <p className="text-sm text-theme-tertiary">{setting.description}</p>
                  </div>

                  {/* Email Toggle */}
                  <div className="flex items-center justify-center w-20">
                    <button
                      onClick={() => handleToggle(setting.id, 'email')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        setting.email ? 'bg-accent' : 'bg-theme-glass-10'
                      }`}
                      aria-label={`Toggle email for ${setting.label}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.email ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* In-App Toggle */}
                  <div className="flex items-center justify-center w-20">
                    <button
                      onClick={() => handleToggle(setting.id, 'inApp')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        setting.inApp ? 'bg-accent' : 'bg-theme-glass-10'
                      }`}
                      aria-label={`Toggle in-app for ${setting.label}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.inApp ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Save Button */}
      {hasChanges && (
        <div className="glass rounded-xl border border-theme-subtle p-4 flex items-center justify-between">
          <p className="text-sm text-theme-secondary">You have unsaved changes</p>
          <button onClick={handleSave} disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      )}

      {/* Info Banner */}
      <div className="glass rounded-xl border border-blue-500/20 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-theme mb-1">About Notifications</h4>
          <p className="text-sm text-theme-secondary">
            Email notifications are sent to your account email. In-app notifications appear in the
            notification center. You can update these preferences at any time.
          </p>
        </div>
      </div>
    </div>
  )
}
