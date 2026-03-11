import { useState } from 'react'
import type { RiskInput } from '@mmf/shared'
import { Button } from '../../ui/Button'

interface RisksStepProps {
  risks: RiskInput[]
  onChange: (risks: RiskInput[]) => void
}

interface InlineRiskForm {
  description: string
  mitigation: string
}

const EMPTY_FORM: InlineRiskForm = { description: '', mitigation: '' }

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

const textareaStyle: React.CSSProperties = {
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
  resize: 'vertical' as const,
  minHeight: '80px',
}

const riskCardStyle: React.CSSProperties = {
  padding: 'var(--space-4)',
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--color-border-input)',
  background: 'var(--color-bg-elevated)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
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

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-data)',
  fontSize: 'var(--type-label-size)',
  letterSpacing: 'var(--type-label-spacing)',
  textTransform: 'uppercase',
  color: 'var(--color-text-tertiary)',
  margin: 0,
}

export function RisksStep({ risks, onChange }: RisksStepProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<InlineRiskForm>(EMPTY_FORM)

  function handleAdd() {
    if (!form.description.trim() || !form.mitigation.trim()) return
    onChange([
      ...risks,
      { description: form.description.trim(), mitigation: form.mitigation.trim() },
    ])
    setForm(EMPTY_FORM)
    setShowAddForm(false)
  }

  function handleRemove(index: number) {
    onChange(risks.filter((_, i) => i !== index))
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
          Risk Disclosures ({risks.length})
        </h3>
        {!showAddForm && (
          <Button variant="secondary" onClick={() => setShowAddForm(true)} type="button">
            + Add Risk
          </Button>
        )}
      </div>

      {risks.length === 0 && !showAddForm && (
        <p style={emptyStyle}>
          No risks added yet. Transparently disclosing risks builds backer confidence.
        </p>
      )}

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        {risks.map((risk, index) => (
          <li key={index} style={riskCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: 'var(--type-label-size)',
                  color: 'var(--color-text-accent)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--type-label-spacing)',
                }}
              >
                Risk {index + 1}
              </span>
              <Button
                variant="ghost"
                onClick={() => handleRemove(index)}
                type="button"
                aria-label={`Remove risk ${index + 1}`}
              >
                Remove
              </Button>
            </div>
            <div>
              <p style={sectionLabelStyle}>Risk</p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--type-body-small-size)',
                  color: 'var(--color-text-primary)',
                  margin: '4px 0 0',
                }}
              >
                {risk.description}
              </p>
            </div>
            <div>
              <p style={sectionLabelStyle}>Mitigation</p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--type-body-small-size)',
                  color: 'var(--color-text-secondary)',
                  margin: '4px 0 0',
                }}
              >
                {risk.mitigation}
              </p>
            </div>
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
            New Risk Disclosure
          </h4>

          <div style={fieldGroupStyle}>
            <label htmlFor="risk-description" style={labelStyle}>
              Risk Description <span aria-hidden="true" style={{ color: 'var(--color-text-error)' }}>*</span>
            </label>
            <textarea
              id="risk-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              style={textareaStyle}
              placeholder="Describe the potential risk to this campaign"
            />
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="risk-mitigation" style={labelStyle}>
              Mitigation Strategy <span aria-hidden="true" style={{ color: 'var(--color-text-error)' }}>*</span>
            </label>
            <textarea
              id="risk-mitigation"
              value={form.mitigation}
              onChange={(e) => setForm((f) => ({ ...f, mitigation: e.target.value }))}
              style={textareaStyle}
              placeholder="How will this risk be mitigated or managed?"
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button
              variant="primary"
              onClick={handleAdd}
              type="button"
              disabled={!form.description.trim() || !form.mitigation.trim()}
            >
              Add Risk
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
