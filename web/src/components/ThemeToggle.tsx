import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      data-testid="theme-toggle"
      className="fixed top-4 right-4 z-50 min-w-[44px] min-h-[44px] p-2 rounded-lg bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={theme === 'dark'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-400" aria-hidden="true" data-icon="sun" />
      ) : (
        <Moon className="w-5 h-5 text-blue-600" aria-hidden="true" data-icon="moon" />
      )}
    </button>
  )
}
