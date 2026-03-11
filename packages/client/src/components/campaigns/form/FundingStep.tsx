import type { CampaignCategory } from '@mmf/shared'
import { CampaignCategorySchema } from '@mmf/shared'

export interface FundingData {
  minFundingTargetUsd: number
  maxFundingCapUsd: number
  deadline: Date | null
  budgetBreakdown: string
  category: string
}

interface FundingStepProps {
  data: FundingData
  onChange: (data: FundingData) => void
  showErrors?: boolean
}

const MIN_FUNDING = 1_000_000 // $1M
const MAX_FUNDING = 1_000_000_000 // $1B

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

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: 'var(--color-text-error)',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical' as const,
  minHeight: '120px',
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-error)',
}

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-tertiary)',
}

const CATEGORIES = CampaignCategorySchema.options as CampaignCategory[]

function dateToInputValue(date: Date | null): string {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function inputValueToDate(value: string): Date | null {
  if (!value) return null
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

export function FundingStep({ data, onChange, showErrors = false }: FundingStepProps) {
  const minError =
    data.minFundingTargetUsd > 0 && data.minFundingTargetUsd < MIN_FUNDING
      ? 'Minimum target must be at least $1,000,000'
      : null

  const maxError =
    data.maxFundingCapUsd > 0 && data.maxFundingCapUsd > MAX_FUNDING
      ? 'Maximum cap must not exceed $1,000,000,000'
      : data.maxFundingCapUsd > 0 &&
          data.minFundingTargetUsd > 0 &&
          data.maxFundingCapUsd < data.minFundingTargetUsd
        ? 'Maximum cap must be greater than or equal to minimum target'
        : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' as const }}>
        <div style={{ ...fieldGroupStyle, flex: 1, minWidth: '200px' }}>
          <label htmlFor="min-funding" style={labelStyle}>
            Minimum Target (USD)
          </label>
          <input
            id="min-funding"
            type="number"
            min={MIN_FUNDING}
            max={MAX_FUNDING}
            step={1000}
            value={data.minFundingTargetUsd || ''}
            onChange={(e) =>
              onChange({ ...data, minFundingTargetUsd: parseInt(e.target.value, 10) || 0 })
            }
            style={(showErrors && minError) ? inputErrorStyle : inputStyle}
            placeholder="1000000"
            aria-describedby={minError ? 'min-funding-error' : 'min-funding-hint'}
          />
          {minError && showErrors ? (
            <span id="min-funding-error" role="alert" style={errorStyle}>
              {minError}
            </span>
          ) : (
            <span id="min-funding-hint" style={hintStyle}>
              Minimum: $1,000,000
            </span>
          )}
        </div>

        <div style={{ ...fieldGroupStyle, flex: 1, minWidth: '200px' }}>
          <label htmlFor="max-funding" style={labelStyle}>
            Maximum Cap (USD)
          </label>
          <input
            id="max-funding"
            type="number"
            min={MIN_FUNDING}
            max={MAX_FUNDING}
            step={1000}
            value={data.maxFundingCapUsd || ''}
            onChange={(e) =>
              onChange({ ...data, maxFundingCapUsd: parseInt(e.target.value, 10) || 0 })
            }
            style={(showErrors && maxError) ? inputErrorStyle : inputStyle}
            placeholder="1000000000"
            aria-describedby={maxError ? 'max-funding-error' : 'max-funding-hint'}
          />
          {maxError && showErrors ? (
            <span id="max-funding-error" role="alert" style={errorStyle}>
              {maxError}
            </span>
          ) : (
            <span id="max-funding-hint" style={hintStyle}>
              Maximum: $1,000,000,000
            </span>
          )}
        </div>
      </div>

      <div style={fieldGroupStyle}>
        <label htmlFor="campaign-deadline" style={labelStyle}>
          Deadline
        </label>
        <input
          id="campaign-deadline"
          type="date"
          value={dateToInputValue(data.deadline)}
          onChange={(e) => onChange({ ...data, deadline: inputValueToDate(e.target.value) })}
          style={inputStyle}
        />
      </div>

      <div style={fieldGroupStyle}>
        <label htmlFor="campaign-category" style={labelStyle}>
          Category
        </label>
        <select
          id="campaign-category"
          value={data.category}
          onChange={(e) => onChange({ ...data, category: e.target.value })}
          style={{
            ...inputStyle,
            cursor: 'pointer',
          }}
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div style={fieldGroupStyle}>
        <label htmlFor="budget-breakdown" style={labelStyle}>
          Budget Breakdown
        </label>
        <textarea
          id="budget-breakdown"
          value={data.budgetBreakdown}
          onChange={(e) => onChange({ ...data, budgetBreakdown: e.target.value })}
          style={textareaStyle}
          placeholder="Describe how the funds will be allocated (e.g. R&D 40%, Equipment 30%, Personnel 20%, Operations 10%)"
        />
      </div>
    </div>
  )
}
