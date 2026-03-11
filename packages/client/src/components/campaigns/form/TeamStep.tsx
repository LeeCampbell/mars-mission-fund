import { useState } from 'react'
import type { TeamMemberInput } from '@mmf/shared'
import { Button } from '../../ui/Button'

interface TeamStepProps {
  teamMembers: TeamMemberInput[]
  onChange: (teamMembers: TeamMemberInput[]) => void
}

interface InlineFormState {
  name: string
  role: string
  bio: string
}

const fieldGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-data)',
  fontSize: 'var(--type-input-label-size)',
  fontWeight: 'var(--type-input-label-weight)' as React.CSSProperties['fontWeight'],
  letterSpacing: 'var(--type-input-label-spacing)',
  color: 'var(--color-text-tertiary)',
  textTransform: 'uppercase',
}

const inputStyle: React.CSSProperties = {
  background: 'var(--color-bg-input)',
  border: '1px solid var(--color-border-input)',
  borderRadius: 'var(--radius-input)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  padding: 'var(--space-3) var(--space-4)',
  width: '100%',
  boxSizing: 'border-box' as const,
  outline: 'none',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical' as const,
  minHeight: '80px',
}

const memberCardStyle: React.CSSProperties = {
  padding: 'var(--space-4)',
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--color-border-input)',
  background: 'var(--color-bg-elevated)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
}

const memberNameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  margin: 0,
}

const memberRoleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-secondary)',
  margin: 0,
}

const memberBioStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-tertiary)',
  margin: 0,
}

const addFormStyle: React.CSSProperties = {
  padding: 'var(--space-4)',
  borderRadius: 'var(--radius-card)',
  border: '1px dashed var(--color-border-input)',
  background: 'var(--color-bg-input)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
}

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-tertiary)',
  textAlign: 'center',
  padding: 'var(--space-8)',
  border: '1px dashed var(--color-border-input)',
  borderRadius: 'var(--radius-card)',
}

const EMPTY_FORM: InlineFormState = { name: '', role: '', bio: '' }

export function TeamStep({ teamMembers, onChange }: TeamStepProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<InlineFormState>(EMPTY_FORM)

  function handleAdd() {
    if (!form.name.trim() || !form.role.trim()) return
    onChange([
      ...teamMembers,
      { name: form.name.trim(), role: form.role.trim(), bio: form.bio.trim() || null },
    ])
    setForm(EMPTY_FORM)
    setShowAddForm(false)
  }

  function handleRemove(index: number) {
    onChange(teamMembers.filter((_, i) => i !== index))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--type-body-size)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          Team Members ({teamMembers.length})
        </h3>
        {!showAddForm && (
          <Button variant="secondary" onClick={() => setShowAddForm(true)} type="button">
            + Add Member
          </Button>
        )}
      </div>

      {teamMembers.length === 0 && !showAddForm && (
        <p style={emptyStyle}>No team members added yet. Click &quot;Add Member&quot; to add your first team member.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {teamMembers.map((member, index) => (
          <li key={index} style={memberCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={memberNameStyle}>{member.name}</p>
                <p style={memberRoleStyle}>{member.role}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => handleRemove(index)}
                type="button"
                aria-label={`Remove ${member.name}`}
              >
                Remove
              </Button>
            </div>
            {member.bio && <p style={memberBioStyle}>{member.bio}</p>}
          </li>
        ))}
      </ul>

      {showAddForm && (
        <div style={addFormStyle}>
          <h4
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--type-body-size)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            New Team Member
          </h4>

          <div style={fieldGroupStyle}>
            <label htmlFor="member-name" style={labelStyle}>
              Name <span aria-hidden="true" style={{ color: 'var(--color-text-error)' }}>*</span>
            </label>
            <input
              id="member-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={inputStyle}
              placeholder="Full name"
            />
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="member-role" style={labelStyle}>
              Role <span aria-hidden="true" style={{ color: 'var(--color-text-error)' }}>*</span>
            </label>
            <input
              id="member-role"
              type="text"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              style={inputStyle}
              placeholder="e.g. Mission Engineer, Chief Scientist"
            />
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="member-bio" style={labelStyle}>
              Bio
            </label>
            <textarea
              id="member-bio"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              style={textareaStyle}
              placeholder="Brief biography"
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button
              variant="primary"
              onClick={handleAdd}
              type="button"
              disabled={!form.name.trim() || !form.role.trim()}
            >
              Add Member
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddForm(false)
                setForm(EMPTY_FORM)
              }}
              type="button"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
