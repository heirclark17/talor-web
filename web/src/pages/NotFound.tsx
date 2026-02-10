import { Link } from 'react-router-dom'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 glass rounded-2xl flex items-center justify-center mx-auto mb-6 border border-theme-subtle">
          <FileQuestion className="w-10 h-10 text-theme-tertiary" />
        </div>
        <h1 className="text-4xl font-bold text-theme mb-3">404</h1>
        <p className="text-lg text-theme-secondary mb-2">Page Not Found</p>
        <p className="text-theme-tertiary mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/resumes"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3"
          >
            <Home className="w-5 h-5" />
            Go to Resumes
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 text-theme-secondary hover:text-theme transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
