import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

/**
 * ErrorBoundary component for catching JavaScript errors in child components.
 * Displays a friendly error UI with options to retry or navigate home.
 * In development mode, shows detailed error information for debugging.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Store error info for dev display
    this.setState({ errorInfo })

    // Call optional error handler (for logging/analytics)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // If custom fallback provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isDev = import.meta.env.DEV

      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg w-full text-center">
            {/* Error Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" aria-hidden="true" />
            </div>

            {/* Error Message */}
            <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              We're sorry, but something unexpected happened. Please try refreshing the page or going back to the home page.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors min-h-[44px]"
                aria-label="Try again"
              >
                <RefreshCw className="w-5 h-5" aria-hidden="true" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors min-h-[44px]"
                aria-label="Go to home page"
              >
                <Home className="w-5 h-5" aria-hidden="true" />
                Go Home
              </button>
            </div>

            {/* Dev-only Error Details */}
            {isDev && this.state.error && (
              <div className="text-left bg-white/5 border border-white/10 rounded-xl p-4 mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Bug className="w-4 h-4 text-red-400" aria-hidden="true" />
                  <span className="text-sm font-semibold text-red-400">
                    Error Details (Dev Only)
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Error Name */}
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Error</span>
                    <p className="text-sm text-white font-mono mt-1 break-all">
                      {this.state.error.name}: {this.state.error.message}
                    </p>
                  </div>

                  {/* Stack Trace */}
                  {this.state.error.stack && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Stack Trace</span>
                      <pre className="text-xs text-gray-400 font-mono mt-1 overflow-x-auto whitespace-pre-wrap break-all max-h-40 overflow-y-auto bg-black/30 rounded p-2">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}

                  {/* Component Stack */}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Component Stack</span>
                      <pre className="text-xs text-gray-400 font-mono mt-1 overflow-x-auto whitespace-pre-wrap break-all max-h-32 overflow-y-auto bg-black/30 rounded p-2">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Help Text */}
            <p className="text-sm text-gray-500 mt-6">
              If this problem persists, please{' '}
              <a
                href="mailto:support@talor.app?subject=Bug Report"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook wrapper for functional components that need error boundary behavior.
 * Use this for handling errors in event handlers and async code.
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    console.error('useErrorHandler caught an error:', error)
    setError(error)
  }, [])

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  // If there's an error, throw it to be caught by the nearest ErrorBoundary
  if (error) {
    throw error
  }

  return { handleError, resetError }
}
