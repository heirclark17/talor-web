import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface SkillTagInputProps {
  skills: string[]
  onChange: (skills: string[]) => void
  placeholder?: string
}

export default function SkillTagInput({
  skills,
  onChange,
  placeholder = 'Type a skill and press Enter...',
}: SkillTagInputProps) {
  const [input, setInput] = useState('')

  const addSkill = (value: string) => {
    const trimmed = value.trim()
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed])
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(input)
      setInput('')
    } else if (e.key === 'Backspace' && !input && skills.length > 0) {
      onChange(skills.slice(0, -1))
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text')
    const items = text.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean)
    const unique = items.filter((s) => !skills.includes(s))
    if (unique.length) onChange([...skills, ...unique])
  }

  const removeSkill = (skill: string) => {
    onChange(skills.filter((s) => s !== skill))
  }

  return (
    <div className="min-h-[48px] p-2 rounded-xl border border-white/10 bg-theme-glass-5 flex flex-wrap gap-2 focus-within:border-accent/50 transition-colors">
      {skills.map((skill) => (
        <span
          key={skill}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-medium bg-accent/15 text-accent"
        >
          {skill}
          <button
            type="button"
            onClick={() => removeSkill(skill)}
            className="hover:bg-accent/20 rounded-full p-0.5 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => {
          if (input.trim()) {
            addSkill(input)
            setInput('')
          }
        }}
        placeholder={skills.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-theme placeholder:text-theme-tertiary py-1"
      />
    </div>
  )
}
