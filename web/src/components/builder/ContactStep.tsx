import { User } from 'lucide-react'
import { useBuilderStore } from '../../stores/builderStore'

export default function ContactStep() {
  const contactInfo = useBuilderStore((s) => s.contactInfo)
  const setContact = useBuilderStore((s) => s.setContact)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <User className="w-6 h-6 text-accent" />
        <h2 className="text-2xl font-bold text-theme">Contact Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={contactInfo.name}
            onChange={(e) => setContact({ name: e.target.value })}
            className="input"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            Email *
          </label>
          <input
            type="email"
            value={contactInfo.email}
            onChange={(e) => setContact({ email: e.target.value })}
            className="input"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={contactInfo.phone}
            onChange={(e) => setContact({ phone: e.target.value })}
            className="input"
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            Location
          </label>
          <input
            type="text"
            value={contactInfo.location}
            onChange={(e) => setContact({ location: e.target.value })}
            className="input"
            placeholder="San Francisco, CA"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            LinkedIn URL
          </label>
          <input
            type="url"
            value={contactInfo.linkedin}
            onChange={(e) => setContact({ linkedin: e.target.value })}
            className="input"
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>
      </div>
    </div>
  )
}
