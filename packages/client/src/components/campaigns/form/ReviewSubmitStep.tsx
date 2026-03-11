import { useState } from 'react'
import type { MilestoneInput, RiskInput, TeamMemberInput } from '@mmf/shared'
import { Button } from '../../ui/Button'
import type { MissionObjectivesData } from './MissionObjectivesStep'
import type { FundingData } from './FundingStep'
import type { MediaData } from './MediaStep'

export interface ReviewSubmitStepProps {
  mission: MissionObjectivesData
  teamMembers: TeamMemberInput[]
  funding: FundingData
  milestones: MilestoneInput[]
  risks: RiskInput[]
  media: MediaData
  onSaveDraft: () => void
  onSubmit: () => void
  isSaving?: boolean
  isSubmitting?: boolean
}

function formatUsd(amount: number): string {
  if (!amount) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(date: Date | null | string | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
  padding: 'var(--space-4)',
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--color-border-input)',
  background: 'var(--color-bg-elevated)',
}

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-data)',
  fontSize: 'var(--type-label-size)',
  fontWeight: 600,
  letterSpacing: 'var(--type-label-spacing)',
  textTransform: 'uppercase',
  color: 'var(--color-text-accent)',
  margin: 0,
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 'var(--space-4)',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-data)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-tertiary)',
  flexShrink: 0,
}

const valueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-primary)',
  textAlign: 'right',
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
}

const thStyle: React.CSSProperties = {
  fontFamily: 'var(--font-data)',
  fontSize: 'var(--type-label-size)',
  letterSpacing: 'var(--type-label-spacing)',
  textTransform: 'uppercase',
  color: 'var(--color-text-tertiary)',
  textAlign: 'left' as const,
  padding: 'var(--space-2) var(--space-3)',
  borderBottom: '1px solid var(--color-border-input)',
}

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  color: 'var(--color-text-secondary)',
  verticalAlign: 'top' as const,
}

const sumRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  padding: 'var(--space-2) var(--space-3)',
  fontFamily: 'var(--font-data)',
  fontSize: 'var(--type-body-small-size)',
}

const dialogBackdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}

const dialogBoxStyle: React.CSSProperties = {
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border-input)',
  borderRadius: 'var(--radius-card)',
  padding: 'var(--space-6)',
  maxWidth: '480px',
  width: '90%',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
}

export function ReviewSubmitStep({
  mission,
  teamMembers,
  funding,
  milestones,
  risks,
  media,
  onSaveDraft,
  onSubmit,
  isSaving = false,
  isSubmitting = false,
}: ReviewSubmitStepProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const totalPercentage = milestones.reduce((sum, m) => sum + (m.fundingPercentage || 0), 0)
  const percentSumOk = milestones.length === 0 || totalPercentage === 100

  function handleSubmitClick() {
    setShowConfirm(true)
  }

  function handleConfirm() {
    setShowConfirm(false)
    onSubmit()
  }

  function handleCancel() {
    setShowConfirm(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--type-body-small-size)',
          color: 'var(--color-text-secondary)',
          margin: 0,
        }}
      >
        Review the information below before saving or submitting your campaign.
      </p>

      {/* Mission Objectives */}
      <div style={sectionStyle}>
        <h3 style={sectionHeadingStyle}>Mission Objectives</h3>
        <div style={rowStyle}>
          <span style={labelStyle}>Title</span>
          <span style={valueStyle}>{mission.title || '—'}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Summary</span>
          <span style={{ ...valueStyle, maxWidth: '60%' }}>{mission.summary || '—'}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Description</span>
          <span style={{ ...valueStyle, color: mission.description ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>
            {mission.description ? `${mission.description.slice(0, 80)}${mission.description.length > 80 ? '…' : ''}` : '—'}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Alignment Statement</span>
          <span style={{ ...valueStyle, color: mission.alignmentStatement ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>
            {mission.alignmentStatement ? `${mission.alignmentStatement.slice(0, 80)}${mission.alignmentStatement.length > 80 ? '…' : ''}` : '—'}
          </span>
        </div>
      </div>

      {/* Team */}
      <div style={sectionStyle}>
        <h3 style={sectionHeadingStyle}>Team</h3>
        <div style={rowStyle}>
          <span style={labelStyle}>Members</span>
          <span style={valueStyle}>{teamMembers.length > 0 ? `${teamMembers.length} member${teamMembers.length !== 1 ? 's' : ''}` : 'None added'}</span>
        </div>
        {teamMembers.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {teamMembers.map((m, i) => (
              <li key={i} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--type-body-small-size)', color: 'var(--color-text-secondary)' }}>
                {m.name} — {m.role}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Funding */}
      <div style={sectionStyle}>
        <h3 style={sectionHeadingStyle}>Funding</h3>
        <div style={rowStyle}>
          <span style={labelStyle}>Category</span>
          <span style={valueStyle}>{funding.category || '—'}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Minimum Target</span>
          <span style={valueStyle}>{formatUsd(funding.minFundingTargetUsd)}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Maximum Cap</span>
          <span style={valueStyle}>{formatUsd(funding.maxFundingCapUsd)}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Deadline</span>
          <span style={valueStyle}>{formatDate(funding.deadline)}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Budget Breakdown</span>
          <span style={{ ...valueStyle, color: funding.budgetBreakdown ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>
            {funding.budgetBreakdown ? 'Provided' : '—'}
          </span>
        </div>
      </div>

      {/* Milestones */}
      <div style={sectionStyle}>
        <h3 style={sectionHeadingStyle}>Milestones</h3>
        {milestones.length === 0 ? (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--type-body-small-size)', color: 'var(--color-text-tertiary)' }}>
            No milestones added
          </span>
        ) : (
          <>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Title</th>
                  <th style={{ ...thStyle, textAlign: 'right' as const }}>Funding %</th>
                  <th style={{ ...thStyle, textAlign: 'right' as const }}>Target Date</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((m, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>{m.title}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' as const }}>{m.fundingPercentage}%</td>
                    <td style={{ ...tdStyle, textAlign: 'right' as const }}>{formatDate(m.targetDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={sumRowStyle}>
              <span
                style={{
                  fontWeight: 600,
                  color: percentSumOk ? 'var(--color-text-success)' : 'var(--color-text-error)',
                }}
              >
                Total: {totalPercentage}%{!percentSumOk && ' (must equal 100%)'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Risks */}
      <div style={sectionStyle}>
        <h3 style={sectionHeadingStyle}>Risk Disclosures</h3>
        <div style={rowStyle}>
          <span style={labelStyle}>Risks disclosed</span>
          <span style={valueStyle}>{risks.length > 0 ? `${risks.length} risk${risks.length !== 1 ? 's' : ''}` : 'None added'}</span>
        </div>
      </div>

      {/* Media */}
      <div style={sectionStyle}>
        <h3 style={sectionHeadingStyle}>Media</h3>
        <div style={rowStyle}>
          <span style={labelStyle}>Hero Image</span>
          <span style={{ ...valueStyle, color: media.heroImageUrl ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)', wordBreak: 'break-all' as const, maxWidth: '60%' }}>
            {media.heroImageUrl || '—'}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Additional Images</span>
          <span style={valueStyle}>{media.additionalImageUrls.length > 0 ? `${media.additionalImageUrls.length} image${media.additionalImageUrls.length !== 1 ? 's' : ''}` : 'None'}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' as const, marginTop: 'var(--space-2)' }}>
        <Button
          variant="secondary"
          onClick={onSaveDraft}
          type="button"
          disabled={isSaving || isSubmitting}
        >
          {isSaving ? 'Saving…' : 'Save Draft'}
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmitClick}
          type="button"
          disabled={isSaving || isSubmitting}
        >
          {isSubmitting ? 'Submitting…' : 'Submit for Review'}
        </Button>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div style={dialogBackdropStyle} role="presentation">
          <div
            style={dialogBoxStyle}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
          >
            <h2
              id="confirm-dialog-title"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--type-section-heading-size)',
                fontWeight: 'var(--type-section-heading-weight)' as React.CSSProperties['fontWeight'],
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              Submit for Review?
            </h2>
            <p
              id="confirm-dialog-desc"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--type-body-size)',
                color: 'var(--color-text-secondary)',
                margin: 0,
              }}
            >
              Once submitted, your campaign will be queued for reviewer approval. You will not be able to edit it while it is under review.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={handleCancel} type="button">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                type="button"
              >
                Confirm Submission
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
