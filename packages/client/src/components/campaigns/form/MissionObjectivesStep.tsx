import { useState } from 'react'

export interface MissionObjectivesData {
  title: string
  summary: string
  description: string
  alignmentStatement: string
}

interface MissionObjectivesStepProps {
  data: MissionObjectivesData
  onChange: (data: MissionObjectivesData) => void
  showErrors?: boolean
}

const SUMMARY_MAX = 280

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
  transition: 'border-color var(--motion-hover)',
}

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: 'var(--color-text-error)',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical' as const,
  minHeight: '100px',
}

const textareaErrorStyle: React.CSSProperties = {
  ...inputErrorStyle,
  resize: 'vertical' as const,
  minHeight: '100px',
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-error)',
}

const charCountStyle: React.CSSProperties = {
  fontFamily: 'var(--font-data)',
  fontSize: 'var(--type-label-size)',
  color: 'var(--color-text-tertiary)',
  textAlign: 'right' as const,
}

const charCountErrorStyle: React.CSSProperties = {
  ...charCountStyle,
  color: 'var(--color-text-error)',
}

export function MissionObjectivesStep({ data, onChange, showErrors = false }: MissionObjectivesStepProps) {
  const [touched, setTouched] = useState({ title: false, summary: false })

  const titleError = !data.title.trim() ? 'Title is required' : null
  const summaryError = data.summary.length > SUMMARY_MAX ? `Summary must be ${SUMMARY_MAX} characters or fewer` : null

  const showTitleError = (showErrors || touched.title) && titleError
  const showSummaryError = summaryError !== null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={fieldGroupStyle}>
        <label htmlFor="campaign-title" style={labelStyle}>
          Campaign Title <span aria-hidden="true" style={{ color: 'var(--color-text-error)' }}>*</span>
        </label>
        <input
          id="campaign-title"
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          onBlur={() => setTouched((t) => ({ ...t, title: true }))}
          style={showTitleError ? inputErrorStyle : inputStyle}
          placeholder="Enter campaign title"
          aria-required="true"
          aria-invalid={showTitleError ? 'true' : undefined}
          aria-describedby={showTitleError ? 'title-error' : undefined}
        />
        {showTitleError && (
          <span id="title-error" role="alert" style={errorStyle}>
            {titleError}
          </span>
        )}
      </div>

      <div style={fieldGroupStyle}>
        <label htmlFor="campaign-summary" style={labelStyle}>
          Summary
        </label>
        <textarea
          id="campaign-summary"
          value={data.summary}
          onChange={(e) => onChange({ ...data, summary: e.target.value })}
          style={showSummaryError ? textareaErrorStyle : textareaStyle}
          placeholder="Brief description of your campaign (max 280 characters)"
          maxLength={SUMMARY_MAX + 50}
          aria-invalid={showSummaryError ? 'true' : undefined}
          aria-describedby="summary-count summary-error"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {showSummaryError ? (
            <span id="summary-error" role="alert" style={errorStyle}>
              {summaryError}
            </span>
          ) : (
            <span />
          )}
          <span
            id="summary-count"
            style={showSummaryError ? charCountErrorStyle : charCountStyle}
            aria-live="polite"
          >
            {data.summary.length}/{SUMMARY_MAX}
          </span>
        </div>
      </div>

      <div style={fieldGroupStyle}>
        <label htmlFor="campaign-description" style={labelStyle}>
          Description
        </label>
        <textarea
          id="campaign-description"
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          style={{ ...textareaStyle, minHeight: '160px' }}
          placeholder="Detailed description of your mission"
        />
      </div>

      <div style={fieldGroupStyle}>
        <label htmlFor="campaign-alignment" style={labelStyle}>
          Mars Alignment Statement
        </label>
        <textarea
          id="campaign-alignment"
          value={data.alignmentStatement}
          onChange={(e) => onChange({ ...data, alignmentStatement: e.target.value })}
          style={{ ...textareaStyle, minHeight: '120px' }}
          placeholder="Explain how this campaign contributes to the Mars mission"
        />
      </div>
    </div>
  )
}
