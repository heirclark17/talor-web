import toast from 'react-hot-toast'

export function showSuccess(message: string) {
  toast.success(message, {
    style: {
      background: '#1a1a2e',
      color: '#f0f0f0',
      border: '1px solid rgba(255,255,255,0.1)',
    },
    iconTheme: {
      primary: '#22c55e',
      secondary: '#1a1a2e',
    },
  })
}

export function showError(message: string) {
  toast.error(message, {
    duration: 5000,
    style: {
      background: '#1a1a2e',
      color: '#f0f0f0',
      border: '1px solid rgba(255,255,255,0.1)',
    },
    iconTheme: {
      primary: '#ef4444',
      secondary: '#1a1a2e',
    },
  })
}

export function showInfo(message: string) {
  toast(message, {
    style: {
      background: '#1a1a2e',
      color: '#f0f0f0',
      border: '1px solid rgba(255,255,255,0.1)',
    },
  })
}
