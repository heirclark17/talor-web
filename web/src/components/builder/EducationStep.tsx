import { GraduationCap, Plus, Trash2 } from 'lucide-react'
import { useBuilderStore } from '../../stores/builderStore'

export default function EducationStep() {
  const educations = useBuilderStore((s) => s.educations)
  const addEducation = useBuilderStore((s) => s.addEducation)
  const updateEducation = useBuilderStore((s) => s.updateEducation)
  const removeEducation = useBuilderStore((s) => s.removeEducation)
  const certifications = useBuilderStore((s) => s.certifications)
  const setCertifications = useBuilderStore((s) => s.setCertifications)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold text-theme">Education</h2>
        </div>
        <button onClick={addEducation} className="btn-secondary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>

      {educations.map((edu) => (
        <div key={edu.id} className="p-5 bg-theme-glass-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-theme text-sm">
              {edu.school || 'New Education'}
            </h3>
            {educations.length > 1 && (
              <button
                onClick={() => removeEducation(edu.id)}
                className="text-red-500 hover:text-red-400 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-theme-secondary mb-1.5">
                School *
              </label>
              <input
                type="text"
                value={edu.school}
                onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                className="input"
                placeholder="Stanford University"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-secondary mb-1.5">
                Degree
              </label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                className="input"
                placeholder="Bachelor of Science"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-secondary mb-1.5">
                Field of Study
              </label>
              <input
                type="text"
                value={edu.field}
                onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                className="input"
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-secondary mb-1.5">
                Start Year
              </label>
              <input
                type="text"
                value={edu.startDate}
                onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                className="input"
                placeholder="2018"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-secondary mb-1.5">
                End Year
              </label>
              <input
                type="text"
                value={edu.endDate}
                onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                className="input"
                placeholder="2022"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-secondary mb-1.5">
                GPA (optional)
              </label>
              <input
                type="text"
                value={edu.gpa}
                onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                className="input"
                placeholder="3.8"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Certifications */}
      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          Certifications (optional)
        </label>
        <textarea
          value={certifications}
          onChange={(e) => setCertifications(e.target.value)}
          className="input min-h-[100px]"
          placeholder="AWS Certified Solutions Architect&#10;PMP Certified"
        />
      </div>
    </div>
  )
}
