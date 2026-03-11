import { useState } from 'react'
import { useNavigate } from 'react-router'
import { StepIndicator } from '../components/campaigns/form/StepIndicator'
import {
  MissionObjectivesStep,
  type MissionObjectivesData,
} from '../components/campaigns/form/MissionObjectivesStep'
import { TeamStep } from '../components/campaigns/form/TeamStep'
import { FundingStep, type FundingData } from '../components/campaigns/form/FundingStep'
import { MilestonesStep } from '../components/campaigns/form/MilestonesStep'
import { RisksStep } from '../components/campaigns/form/RisksStep'
import { MediaStep, type MediaData } from '../components/campaigns/form/MediaStep'
import { ReviewSubmitStep } from '../components/campaigns/form/ReviewSubmitStep'
import { useCreateCampaign, useSubmitCampaign } from '../hooks/useCampaignMutations'
import { Button } from '../components/ui/Button'
import type { TeamMemberInput, MilestoneInput, RiskInput } from '@mmf/shared'

export interface CampaignFormData {
  mission: MissionObjectivesData
  teamMembers: TeamMemberInput[]
  funding: FundingData
  milestones: MilestoneInput[]
  risks: RiskInput[]
  media: MediaData
}

const INITIAL_DATA: CampaignFormData = {
  mission: { title: '', summary: '', description: '', alignmentStatement: '' },
  teamMembers: [],
  funding: {
    minFundingTargetUsd: 0,
    maxFundingCapUsd: 0,
    deadline: null,
    budgetBreakdown: '',
    category: '',
  },
  milestones: [],
  risks: [],
  media: { heroImageUrl: '', additionalImageUrls: [] },
}

const TOTAL_STEPS = 7

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg-page)',
  padding: 'var(--space-8) var(--space-6)',
}

const containerStyle: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-6)',
}

const stepContentStyle: React.CSSProperties = {
  padding: 'var(--space-6)',
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--color-border-input)',
  background: 'var(--color-bg-elevated)',
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 'var(--space-3)',
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-error)',
}

export function CampaignNewPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CampaignFormData>(INITIAL_DATA)
  const [showStepErrors, setShowStepErrors] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMutation = useCreateCampaign()
  const submitMutation = useSubmitCampaign()

  function handleNext() {
    if (currentStep === 1 && !formData.mission.title.trim()) {
      setShowStepErrors(true)
      return
    }
    setShowStepErrors(false)
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  function handleBack() {
    setShowStepErrors(false)
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  async function handleSaveDraft() {
    if (!formData.mission.title.trim()) {
      setShowStepErrors(true)
      setCurrentStep(1)
      return
    }
    setError(null)
    try {
      const campaign = await createMutation.mutateAsync({
        title: formData.mission.title,
        summary: formData.mission.summary,
        description: formData.mission.description,
        alignmentStatement: formData.mission.alignmentStatement,
        category: formData.funding.category,
        minFundingTargetUsd: formData.funding.minFundingTargetUsd,
        maxFundingCapUsd: formData.funding.maxFundingCapUsd,
        deadline: formData.funding.deadline ?? undefined,
        budgetBreakdown: formData.funding.budgetBreakdown || null,
        heroImageUrl: formData.media.heroImageUrl || null,
        additionalImageUrls: formData.media.additionalImageUrls,
        teamMembers: formData.teamMembers,
        milestones: formData.milestones,
        risks: formData.risks,
      })
      navigate(`/campaigns/${campaign.id}/edit`)
    } catch {
      setError('Failed to save draft. Please try again.')
    }
  }

  async function handleSubmit() {
    if (!formData.mission.title.trim()) {
      setShowStepErrors(true)
      setCurrentStep(1)
      return
    }
    setError(null)
    try {
      const campaign = await createMutation.mutateAsync({
        title: formData.mission.title,
        summary: formData.mission.summary,
        description: formData.mission.description,
        alignmentStatement: formData.mission.alignmentStatement,
        category: formData.funding.category,
        minFundingTargetUsd: formData.funding.minFundingTargetUsd,
        maxFundingCapUsd: formData.funding.maxFundingCapUsd,
        deadline: formData.funding.deadline ?? undefined,
        budgetBreakdown: formData.funding.budgetBreakdown || null,
        heroImageUrl: formData.media.heroImageUrl || null,
        additionalImageUrls: formData.media.additionalImageUrls,
        teamMembers: formData.teamMembers,
        milestones: formData.milestones,
        risks: formData.risks,
      })
      await submitMutation.mutateAsync(campaign.id)
      navigate('/dashboard')
    } catch {
      setError('Failed to submit campaign. Please try again.')
    }
  }

  const isBusy = createMutation.isPending || submitMutation.isPending

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        <div style={stepContentStyle}>
          {currentStep === 1 && (
            <MissionObjectivesStep
              data={formData.mission}
              onChange={(mission) => setFormData((d) => ({ ...d, mission }))}
              showErrors={showStepErrors}
            />
          )}
          {currentStep === 2 && (
            <TeamStep
              teamMembers={formData.teamMembers}
              onChange={(teamMembers) => setFormData((d) => ({ ...d, teamMembers }))}
            />
          )}
          {currentStep === 3 && (
            <FundingStep
              data={formData.funding}
              onChange={(funding) => setFormData((d) => ({ ...d, funding }))}
              showErrors={showStepErrors}
            />
          )}
          {currentStep === 4 && (
            <MilestonesStep
              milestones={formData.milestones}
              onChange={(milestones) => setFormData((d) => ({ ...d, milestones }))}
              showErrors={showStepErrors}
            />
          )}
          {currentStep === 5 && (
            <RisksStep
              risks={formData.risks}
              onChange={(risks) => setFormData((d) => ({ ...d, risks }))}
            />
          )}
          {currentStep === 6 && (
            <MediaStep
              data={formData.media}
              onChange={(media) => setFormData((d) => ({ ...d, media }))}
            />
          )}
          {currentStep === 7 && (
            <ReviewSubmitStep
              mission={formData.mission}
              teamMembers={formData.teamMembers}
              funding={formData.funding}
              milestones={formData.milestones}
              risks={formData.risks}
              media={formData.media}
              onSaveDraft={handleSaveDraft}
              onSubmit={handleSubmit}
              isSaving={createMutation.isPending && !submitMutation.isPending}
              isSubmitting={submitMutation.isPending}
            />
          )}
        </div>

        {error && (
          <span role="alert" style={errorStyle}>
            {error}
          </span>
        )}

        {currentStep < TOTAL_STEPS && (
          <div style={navStyle}>
            <div>
              {currentStep > 1 && (
                <Button variant="ghost" onClick={handleBack} type="button" disabled={isBusy}>
                  ← Back
                </Button>
              )}
            </div>
            <Button variant="secondary" onClick={handleNext} type="button" disabled={isBusy}>
              Next →
            </Button>
          </div>
        )}

        {currentStep === TOTAL_STEPS && (
          <div style={navStyle}>
            <Button variant="ghost" onClick={handleBack} type="button" disabled={isBusy}>
              ← Back
            </Button>
            <span />
          </div>
        )}
      </div>
    </div>
  )
}
