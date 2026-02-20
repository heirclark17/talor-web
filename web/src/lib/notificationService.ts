/**
 * Notification Service
 *
 * Handles email and in-app notifications across the application
 */

export type NotificationType =
  | 'resume_ready'
  | 'batch_complete'
  | 'cover_letter_ready'
  | 'application_update'
  | 'interview_reminder'
  | 'interview_prep_ready'
  | 'weekly_summary'
  | 'tips_and_updates'

export interface NotificationPayload {
  type: NotificationType
  userId: string
  data: {
    title: string
    message: string
    actionUrl?: string
    actionText?: string
    [key: string]: any
  }
}

/**
 * Check if user has enabled notifications for a specific type
 */
export function isNotificationEnabled(type: NotificationType, channel: 'email' | 'inApp'): boolean {
  try {
    const saved = localStorage.getItem('notification_preferences')
    if (!saved) return true // Default to enabled if no preferences saved

    const preferences = JSON.parse(saved)
    const setting = preferences.find((p: any) => p.id === type)

    return setting ? setting[channel] : true
  } catch (error) {
    console.error('Error checking notification preferences:', error)
    return true // Fail open
  }
}

/**
 * Send an in-app notification
 */
export function sendInAppNotification(notification: NotificationPayload): void {
  if (!isNotificationEnabled(notification.type, 'inApp')) {
    console.log('[Notifications] In-app notification disabled for:', notification.type)
    return
  }

  // Store in-app notification in localStorage
  try {
    const stored = localStorage.getItem('in_app_notifications')
    const notifications = stored ? JSON.parse(stored) : []

    notifications.unshift({
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
    })

    // Keep only last 50 notifications
    const trimmed = notifications.slice(0, 50)

    localStorage.setItem('in_app_notifications', JSON.stringify(trimmed))

    // Dispatch custom event for notification center to listen
    window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }))

    console.log('[Notifications] In-app notification sent:', notification.type)
  } catch (error) {
    console.error('Error storing in-app notification:', error)
  }
}

/**
 * Send an email notification
 */
export async function sendEmailNotification(notification: NotificationPayload): Promise<void> {
  if (!isNotificationEnabled(notification.type, 'email')) {
    console.log('[Notifications] Email notification disabled for:', notification.type)
    return
  }

  try {
    // TODO: Replace with actual email service (SendGrid, Mailgun, Resend)
    // For now, log that email would be sent
    console.log('[Notifications] Email notification would be sent:', {
      type: notification.type,
      userId: notification.userId,
      title: notification.data.title,
      message: notification.data.message,
    })

    // TODO: Call backend API to send email
    // await fetch('/api/notifications/email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(notification),
    // })
  } catch (error) {
    console.error('Error sending email notification:', error)
  }
}

/**
 * Send notification through all enabled channels
 */
export async function sendNotification(notification: NotificationPayload): Promise<void> {
  // Send in-app notification (synchronous)
  sendInAppNotification(notification)

  // Send email notification (asynchronous)
  await sendEmailNotification(notification)
}

/**
 * Get all in-app notifications
 */
export function getInAppNotifications(): any[] {
  try {
    const stored = localStorage.getItem('in_app_notifications')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error getting in-app notifications:', error)
    return []
  }
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(notificationId: string): void {
  try {
    const stored = localStorage.getItem('in_app_notifications')
    if (!stored) return

    const notifications = JSON.parse(stored)
    const updated = notifications.map((n: any) =>
      n.id === notificationId ? { ...n, read: true } : n
    )

    localStorage.setItem('in_app_notifications', JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('notification-read', { detail: { id: notificationId } }))
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

/**
 * Clear all in-app notifications
 */
export function clearAllNotifications(): void {
  try {
    localStorage.removeItem('in_app_notifications')
    window.dispatchEvent(new CustomEvent('notifications-cleared'))
  } catch (error) {
    console.error('Error clearing notifications:', error)
  }
}

/**
 * Get unread notification count
 */
export function getUnreadCount(): number {
  try {
    const notifications = getInAppNotifications()
    return notifications.filter((n) => !n.read).length
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}

// Email templates for different notification types
export const EMAIL_TEMPLATES: Record<NotificationType, { subject: string; template: string }> = {
  resume_ready: {
    subject: 'Your Tailored Resume is Ready 🎯',
    template: `
      <h2>Your resume is ready!</h2>
      <p>{{message}}</p>
      <p><a href="{{actionUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">{{actionText}}</a></p>
    `,
  },
  batch_complete: {
    subject: 'Batch Tailoring Complete ✅',
    template: `
      <h2>All your resumes are ready!</h2>
      <p>{{message}}</p>
      <p><a href="{{actionUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">{{actionText}}</a></p>
    `,
  },
  cover_letter_ready: {
    subject: 'Your Cover Letter is Ready 📄',
    template: `
      <h2>Cover letter generated!</h2>
      <p>{{message}}</p>
      <p><a href="{{actionUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">{{actionText}}</a></p>
    `,
  },
  application_update: {
    subject: 'Application Status Update 📋',
    template: `
      <h2>Application status changed</h2>
      <p>{{message}}</p>
      <p><a href="{{actionUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">{{actionText}}</a></p>
    `,
  },
  interview_reminder: {
    subject: 'Interview Reminder 🎤',
    template: `
      <h2>Interview coming up!</h2>
      <p>{{message}}</p>
      <p><a href="{{actionUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">{{actionText}}</a></p>
    `,
  },
  interview_prep_ready: {
    subject: 'Interview Prep Ready 💼',
    template: `
      <h2>Your interview prep is ready!</h2>
      <p>{{message}}</p>
      <p><a href="{{actionUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">{{actionText}}</a></p>
    `,
  },
  weekly_summary: {
    subject: 'Your Weekly Job Search Summary 📊',
    template: `
      <h2>This week's activity</h2>
      <p>{{message}}</p>
      <p><a href="{{actionUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">{{actionText}}</a></p>
    `,
  },
  tips_and_updates: {
    subject: 'New Tips & Features from Talor 💡',
    template: `
      <h2>What's new</h2>
      <p>{{message}}</p>
      <p><a href="{{actionUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">{{actionText}}</a></p>
    `,
  },
}
