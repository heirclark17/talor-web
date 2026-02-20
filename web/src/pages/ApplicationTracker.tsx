import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Briefcase, Plus, Search, Filter, ChevronDown, Calendar, MapPin, DollarSign, ExternalLink, MoreHorizontal, X, Bookmark, Check, Layers } from 'lucide-react'
import { api } from '../api/client'

interface SavedJob {
  id: number
  url: string
  company: string
  title: string
  location: string
  salary: string
  created_at: string | null
}

type ApplicationStatus = 'saved' | 'applied' | 'screening' | 'interviewing' | 'offer' | 'accepted' | 'rejected' | 'withdrawn' | 'no_response'

interface Application {
  id: number
  jobTitle: string
  companyName: string
  jobUrl: string | null
  status: ApplicationStatus
  appliedDate: string | null
  notes: string | null
  tailoredResumeId: number | null
  salaryMin: number | null
  salaryMax: number | null
  location: string | null
  contactName: string | null
  contactEmail: string | null
  nextFollowUp: string | null
  createdAt: string
  updatedAt: string
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string }> = {
  saved: { label: 'Saved', color: 'text-gray-400', bg: 'bg-gray-500/20' },
  applied: { label: 'Applied', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  screening: { label: 'Screening', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  interviewing: { label: 'Interviewing', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  offer: { label: 'Offer', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  accepted: { label: 'Accepted', color: 'text-green-400', bg: 'bg-green-500/20' },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/20' },
  withdrawn: { label: 'Withdrawn', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  no_response: { label: 'No Response', color: 'text-gray-500', bg: 'bg-gray-600/20' },
}

const ALL_STATUSES: ApplicationStatus[] = ['saved', 'applied', 'screening', 'interviewing', 'offer', 'accepted', 'rejected', 'withdrawn', 'no_response']

export default function ApplicationTracker() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingApp, setEditingApp] = useState<Application | null>(null)
  const [stats, setStats] = useState<Record<string, number>>({})
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [prefilledJob, setPrefilledJob] = useState<SavedJob | null>(null)

  // Check for batch filter from URL
  const batchResumeIds = searchParams.get('batch')?.split(',').filter(Boolean).map(Number) || null

  useEffect(() => {
    loadApplications()
    loadStats()
    loadSavedJobs()
  }, [])

  async function loadSavedJobs() {
    try {
      const res = await api.getSavedJobs()
      if (res.success && res.data?.jobs) {
        setSavedJobs(res.data.jobs)
      }
    } catch (err) {
      console.error('[ApplicationTracker] Saved jobs error:', err)
    }
  }

  async function loadApplications() {
    setLoading(true)
    try {
      const res = await api.listApplications(filterStatus === 'all' ? undefined : filterStatus)
      if (res.success && res.data) {
        setApplications(res.data.applications || [])
      }
    } catch (err) {
      console.error('[ApplicationTracker] Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    try {
      const res = await api.getApplicationStats()
      if (res.success && res.data) {
        setStats(res.data.stats || {})
      }
    } catch (err) {
      console.error('[ApplicationTracker] Stats error:', err)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [filterStatus])

  async function handleStatusChange(appId: number, newStatus: ApplicationStatus) {
    const res = await api.updateApplication(appId, { status: newStatus })
    if (res.success) {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a))
      loadStats()
    }
  }

  async function handleDelete(appId: number) {
    const res = await api.deleteApplication(appId)
    if (res.success) {
      setApplications(prev => prev.filter(a => a.id !== appId))
      loadStats()
    }
  }

  async function handleSave(data: Partial<Application>) {
    if (editingApp) {
      const res = await api.updateApplication(editingApp.id, data)
      if (res.success) {
        loadApplications()
        loadStats()
      }
    } else {
      const res = await api.createApplication(data)
      if (res.success) {
        loadApplications()
        loadStats()
      }
    }
    setShowAddModal(false)
    setEditingApp(null)
  }

  const filtered = applications.filter(a => {
    // Filter by batch resume IDs if present
    if (batchResumeIds && batchResumeIds.length > 0) {
      if (!a.tailoredResumeId || !batchResumeIds.includes(a.tailoredResumeId)) {
        return false
      }
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return a.jobTitle.toLowerCase().includes(q) || a.companyName.toLowerCase().includes(q)
    }
    return true
  })

  const handleClearBatchFilter = () => {
    setSearchParams({})
  }

  const totalActive = (stats['applied'] || 0) + (stats['screening'] || 0) + (stats['interviewing'] || 0)

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-theme flex items-center gap-3">
            <Briefcase className="w-8 h-8" />
            Application Tracker
          </h1>
          <p className="text-theme-secondary mt-1">
            {totalActive} active application{totalActive !== 1 ? 's' : ''} in pipeline
          </p>
        </div>
        <button
          onClick={() => { setEditingApp(null); setShowAddModal(true) }}
          className="btn-primary inline-flex items-center gap-2 px-5 py-3"
        >
          <Plus className="w-5 h-5" />
          Add Application
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        {(['applied', 'screening', 'interviewing', 'offer', 'accepted'] as ApplicationStatus[]).map(status => (
          <div
            key={status}
            className={`rounded-xl p-3 ${STATUS_CONFIG[status].bg} border border-theme-subtle cursor-pointer transition-all hover:border-theme-muted ${filterStatus === status ? 'ring-1 ring-white/30' : ''}`}
            onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
          >
            <div className={`text-2xl font-bold ${STATUS_CONFIG[status].color}`}>
              {stats[status] || 0}
            </div>
            <div className="text-xs text-theme-secondary mt-1">{STATUS_CONFIG[status].label}</div>
          </div>
        ))}
      </div>

      {/* Batch Filter Banner */}
      {batchResumeIds && batchResumeIds.length > 0 && (
        <div className="glass rounded-xl p-4 border border-blue-500/30 bg-blue-500/5 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-theme font-medium">Showing Batch Results</p>
                <p className="text-sm text-theme-secondary">
                  Displaying {filtered.length} application{filtered.length !== 1 ? 's' : ''} from batch tailoring
                </p>
              </div>
            </div>
            <button
              onClick={handleClearBatchFilter}
              className="px-4 py-2 rounded-lg bg-theme-glass-10 hover:bg-theme-glass-20 text-theme-secondary hover:text-theme transition-colors text-sm font-medium whitespace-nowrap"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}

      {/* Saved Jobs Quick-Add */}
      {savedJobs.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-theme-secondary mb-3 flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            Quick Add from Saved Jobs
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {savedJobs.map(job => (
              <button
                key={job.id}
                onClick={() => { setPrefilledJob(job); setEditingApp(null); setShowAddModal(true) }}
                className="flex-shrink-0 text-left rounded-xl p-3 border border-theme-subtle bg-theme-glass-5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all min-w-[200px] max-w-[260px]"
              >
                <p className="text-sm font-semibold text-theme truncate">{job.company}</p>
                <p className="text-xs text-theme-secondary truncate mt-0.5">{job.title}</p>
                {job.location && <p className="text-xs text-theme-tertiary truncate mt-0.5">{job.location}</p>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-theme-glass-5 border border-theme-subtle rounded-xl text-theme placeholder-gray-500 focus:outline-none focus:border-theme-muted"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as ApplicationStatus | 'all')}
          className="px-4 py-3 bg-theme-secondary border border-theme-subtle rounded-xl text-theme focus:outline-none focus:border-theme-muted"
        >
          <option value="all" className="bg-theme-secondary text-theme">All Statuses</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s} className="bg-theme-secondary text-theme">{STATUS_CONFIG[s].label}</option>
          ))}
        </select>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="text-center py-16 text-theme-secondary">Loading applications...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
          <p className="text-theme-secondary text-lg mb-2">No applications yet</p>
          <p className="text-theme-tertiary text-sm">Start tracking your job applications by clicking "Add Application"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <div key={app.id} className="glass rounded-xl p-4 sm:p-5 border border-theme-subtle hover:border-theme-muted transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-theme font-semibold truncate">{app.jobTitle}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CONFIG[app.status].bg} ${STATUS_CONFIG[app.status].color}`}>
                      {STATUS_CONFIG[app.status].label}
                    </span>
                  </div>
                  <p className="text-theme-secondary text-sm">{app.companyName}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-theme-tertiary">
                    {app.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {app.location}
                      </span>
                    )}
                    {app.salaryMin && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {app.salaryMin.toLocaleString()}{app.salaryMax ? ` - ${app.salaryMax.toLocaleString()}` : ''}
                      </span>
                    )}
                    {app.appliedDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Applied {new Date(app.appliedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {app.jobUrl && (
                    <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors text-theme-secondary hover:text-theme">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <select
                    value={app.status}
                    onChange={e => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                    className="text-xs bg-theme-secondary border border-theme-subtle rounded-lg px-2 py-1.5 text-theme-secondary focus:outline-none"
                  >
                    {ALL_STATUSES.map(s => (
                      <option key={s} value={s} className="bg-theme-secondary text-theme">{STATUS_CONFIG[s].label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => { setEditingApp(app); setShowAddModal(true) }}
                    className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors text-theme-secondary hover:text-theme"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {app.notes && (
                <p className="text-theme-tertiary text-sm mt-3 pt-3">{app.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <ApplicationFormModal
          application={editingApp}
          savedJobs={savedJobs}
          prefilledJob={prefilledJob}
          onSave={handleSave}
          onClose={() => { setShowAddModal(false); setEditingApp(null); setPrefilledJob(null) }}
          onDelete={editingApp ? () => { handleDelete(editingApp.id); setShowAddModal(false); setEditingApp(null) } : undefined}
        />
      )}
    </div>
  )
}

function ApplicationFormModal({
  application,
  savedJobs,
  prefilledJob,
  onSave,
  onClose,
  onDelete,
}: {
  application: Application | null
  savedJobs: SavedJob[]
  prefilledJob: SavedJob | null
  onSave: (data: any) => void
  onClose: () => void
  onDelete?: () => void
}) {
  const [jobTitle, setJobTitle] = useState(application?.jobTitle || prefilledJob?.title || '')
  const [companyName, setCompanyName] = useState(application?.companyName || prefilledJob?.company || '')
  const [jobUrl, setJobUrl] = useState(application?.jobUrl || prefilledJob?.url || '')
  const [status, setStatus] = useState<ApplicationStatus>(application?.status || 'saved')
  const [location, setLocation] = useState(application?.location || prefilledJob?.location || '')
  const [salaryMin, setSalaryMin] = useState(application?.salaryMin?.toString() || '')
  const [salaryMax, setSalaryMax] = useState(application?.salaryMax?.toString() || '')
  const [notes, setNotes] = useState(application?.notes || '')
  const [appliedDate, setAppliedDate] = useState(application?.appliedDate?.split('T')[0] || '')
  const [contactName, setContactName] = useState(application?.contactName || '')
  const [contactEmail, setContactEmail] = useState(application?.contactEmail || '')
  const [selectedSavedJobId, setSelectedSavedJobId] = useState<number | null>(prefilledJob?.id || null)

  function handleSelectSavedJob(job: SavedJob) {
    setSelectedSavedJobId(job.id)
    setJobTitle(job.title)
    setCompanyName(job.company)
    setJobUrl(job.url)
    if (job.location) setLocation(job.location)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      job_title: jobTitle,
      company_name: companyName,
      job_url: jobUrl || null,
      status,
      location: location || null,
      salary_min: salaryMin ? parseInt(salaryMin) : null,
      salary_max: salaryMax ? parseInt(salaryMax) : null,
      notes: notes || null,
      applied_date: appliedDate || null,
      contact_name: contactName || null,
      contact_email: contactEmail || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0f]/95 backdrop-blur-sm" onClick={onClose}>
      <div className="rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-theme-subtle bg-theme" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-theme">
            {application ? 'Edit Application' : 'Add Application'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-theme-glass-10 rounded-lg text-theme-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Saved Jobs Selector - only show when adding new, not editing */}
          {!application && savedJobs.length > 0 && (
            <div>
              <label className="block text-sm text-theme-secondary mb-2 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" />
                Fill from saved job
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {savedJobs.map(job => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => handleSelectSavedJob(job)}
                    className={`flex-shrink-0 text-left rounded-lg px-3 py-2 border transition-all text-xs min-w-[150px] max-w-[200px] ${
                      selectedSavedJobId === job.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-theme-subtle bg-theme-glass-5 hover:border-theme-muted'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {selectedSavedJobId === job.id && <Check className="w-3 h-3 text-blue-400 flex-shrink-0" />}
                      <span className="font-medium text-theme truncate">{job.company}</span>
                    </div>
                    <p className="text-theme-tertiary truncate mt-0.5">{job.title}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-theme-secondary mb-1">Job Title *</label>
            <input required value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full px-4 py-2.5 bg-theme-glass-5 border border-theme-subtle rounded-xl text-theme focus:outline-none focus:border-theme-muted" />
          </div>
          <div>
            <label className="block text-sm text-theme-secondary mb-1">Company *</label>
            <input required value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-4 py-2.5 bg-theme-glass-5 border border-theme-subtle rounded-xl text-theme focus:outline-none focus:border-theme-muted" />
          </div>
          <div>
            <label className="block text-sm text-theme-secondary mb-1">Job URL</label>
            <input value={jobUrl} onChange={e => setJobUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 bg-theme-glass-5 border border-theme-subtle rounded-xl text-theme placeholder-theme-tertiary focus:outline-none focus:border-theme-muted" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-theme-secondary mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as ApplicationStatus)} className="w-full px-4 py-2.5 bg-theme-secondary border border-theme-subtle rounded-xl text-theme focus:outline-none focus:border-theme-muted">
                {ALL_STATUSES.map(s => <option key={s} value={s} className="bg-theme-secondary text-theme">{STATUS_CONFIG[s].label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-theme-secondary mb-1">Applied Date</label>
              <input type="date" value={appliedDate} onChange={e => setAppliedDate(e.target.value)} className="w-full px-4 py-2.5 bg-theme-secondary border border-theme-subtle rounded-xl text-theme focus:outline-none focus:border-theme-muted [color-scheme:dark]" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-theme-secondary mb-1">Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Remote, New York, etc." className="w-full px-4 py-2.5 bg-theme-glass-5 border border-theme-subtle rounded-xl text-theme placeholder-theme-tertiary focus:outline-none focus:border-theme-muted" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-theme-secondary mb-1">Salary Min</label>
              <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="80000" className="w-full px-4 py-2.5 bg-theme-glass-5 border border-theme-subtle rounded-xl text-theme placeholder-theme-tertiary focus:outline-none focus:border-theme-muted" />
            </div>
            <div>
              <label className="block text-sm text-theme-secondary mb-1">Salary Max</label>
              <input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="120000" className="w-full px-4 py-2.5 bg-theme-glass-5 border border-theme-subtle rounded-xl text-theme placeholder-theme-tertiary focus:outline-none focus:border-theme-muted" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-theme-secondary mb-1">Contact Name</label>
              <input value={contactName} onChange={e => setContactName(e.target.value)} className="w-full px-4 py-2.5 bg-theme-glass-5 border border-theme-subtle rounded-xl text-theme focus:outline-none focus:border-theme-muted" />
            </div>
            <div>
              <label className="block text-sm text-theme-secondary mb-1">Contact Email</label>
              <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full px-4 py-2.5 bg-theme-glass-5 border border-theme-subtle rounded-xl text-theme focus:outline-none focus:border-theme-muted" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-theme-secondary mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-theme-glass-5 border border-theme-subtle rounded-xl text-theme focus:outline-none focus:border-theme-muted resize-none" />
          </div>
          <div className="flex items-center justify-between pt-2">
            {onDelete && (
              <button type="button" onClick={onDelete} className="text-sm text-red-400 hover:text-red-300">
                Delete Application
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={onClose} className="px-5 py-2.5 bg-theme-glass-10 hover:bg-theme-glass-20 text-theme rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="btn-primary px-5 py-2.5">{application ? 'Save Changes' : 'Add Application'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
