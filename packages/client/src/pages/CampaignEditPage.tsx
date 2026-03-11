import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useCampaign } from '../hooks/useCampaign'
import { useUpdateCampaign, useSubmitCampaign } from '../hooks/useCampaignMutations'
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
import { Button } from '../components/ui/Button'
import type { TeamMemberInput, MilestoneInput, RiskInput } from '@mmf/shared'
import type { CampaignFormData } from './CampaignNewPage'

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

const loadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-text-secondary)',
  textAlign: 'center',
  padding: 'var(--space-16) 0',
}

const errorDisplayStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-size)',
  color: 'var(--color-status-error)',
  textAlign: 'center',
  padding: 'var(--space-16) 0',
}

const mutationErrorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--type-body-small-size)',
  color: 'var(--color-text-error)',
}

function buildFormDataFromCampaign(campaign: {
  title: string
  summary: string
  description: string
  alignmentStatement: string
  teamMembers: TeamMemberInput[]
  milestones: MilestoneInput[]
  risks: RiskInput[]
  funding?: FundingData
  minFundingTargetUsd?: number
  maxFundingCapUsd?: number
  deadline: Date | null
  budgetBreakdown: string | null
  category: string
  heroImageUrl: string | null
  additionalImageUrls: string[]
  goalAmount?: number
}): CampaignFormData {
  return {
    mission: {
      title: campaign.title,
      summary: campaign.summary,
      description: campaign.description,
      alignmentStatement: campaign.alignmentStatement,
    },
    teamMembers: campaign.teamMembers.map((m) => ({
      name: m.name,
      role: m.role,
      bio: m.bio ?? null,
    })),
    funding: {
      minFundingTargetUsd: campaign.minFundingTargetUsd ?? campaign.goalAmount ?? 0,
      maxFundingCapUsd: campaign.maxFundingCapUsd ?? 0,
      deadline: campaign.deadline,
      budgetBreakdown: campaign.budgetBreakdown ?? '',
      category: campaign.category,
    },
    milestones: campaign.milestones.map((m) => ({
      title: m.title,
      description: m.description,
      targetDate: m.targetDate ?? null,
      fundingPercentage: m.fundingPercentage,
      verificationCriteria: m.verificationCriteria ?? null,
    })),
    risks: campaign.risks.map((r) => ({
      description: r.description,
      mitigation: r.mitigation,
    })),
    media: {
      heroImageUrl: campaign.heroImageUrl ?? '',
      additionalImageUrls: campaign.additionalImageUrls,
    },
  }
}

export function CampaignEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: campaign, isLoading, isError } = useCampaign(id ?? '')
  const updateMutation = useUpdateCampaign()
  const submitMutation = useSubmitCampaign()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CampaignFormData | null>(null)
  const [showStepErrors, setShowStepErrors] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (campaign && !initialized) {
      setFormData(buildFormDataFromCampaign(campaign))
      setInitialized(true)
    }
  }, [campaign, initialized])

  useEffect(() => {
    document.title = 'Edit Campaign — Mars Mission Fund'
    return () => {
      document.title = 'Mars Mission Fund'
    }
  }, [])

  if (isLoading || !formData) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={loadingStyle}>Loading campaign…</div>
        </div>
      </div>
    )
  }

  if (isError || !campaign) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={errorDisplayStyle}>Failed to load campaign. Please try again.</div>
        </div>
      </div>
    )
  }

  const isBusy = updateMutation.isPending || submitMutation.isPending

  async function saveCurrentStep(data: CampaignFormData) {
    if (!id) return
    setMutationError(null)
    try {
      await updateMutation.mutateAsync({
        id,
        input: {
          title: data.mission.title,
          summary: data.mission.summary,
          description: data.mission.description,
          alignmentStatement: data.mission.alignmentStatement,
          category: data.funding.category,
          minFundingTargetUsd: data.funding.minFundingTargetUsd,
          maxFundingCapUsd: data.funding.maxFundingCapUsd,
          deadline: data.funding.deadline ?? undefined,
          budgetBreakdown: data.funding.budgetBreakdown || null,
          heroImageUrl: data.media.heroImageUrl || null,
          additionalImageUrls: data.media.additionalImageUrls,
          teamMembers: data.teamMembers,
          milestones: data.milestones,
          risks: data.risks,
        },
      })
    } catch {
      setMutationError('Failed to save changes. Please try again.')
      throw new Error('Save failed')
    }
  }

  async function handleNext() {
    if (!formData) return
    if (currentStep === 1 && !formData.mission.title.trim()) {
      setShowStepErrors(true)
      return
    }
    setShowStepErrors(false)
    try {
      await saveCurrentStep(formData)
      setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS))
    } catch {
      // error already set in saveCurrentStep
    }
  }

  function handleBack() {
    setShowStepErrors(false)
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  async function handleSaveDraft() {
    if (!formData) return
    setMutationError(null)
    try {
      await saveCurrentStep(formData)
    } catch {
      // error already set
    }
  }

  async function handleSubmit() {
    if (!formData || !id) return
    setMutationError(null)
    try {
      await saveCurrentStep(formData)
      await submitMutation.mutateAsync(id)
      navigate('/dashboard')
    } catch {
      setMutationError('Failed to submit campaign. Please try again.')
    }
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        <div style={stepContentStyle}>
          {currentStep === 1 && (
            <MissionObjectivesStep
              data={formData.mission}
              onChange={(mission: MissionObjectivesData) =>
                setFormData((d) => (d ? { ...d, mission } : d))
              }
              showErrors={showStepErrors}
            />
          )}
          {currentStep === 2 && (
            <TeamStep
              teamMembers={formData.teamMembers}
              onChange={(teamMembers: TeamMemberInput[]) =>
                setFormData((d) => (d ? { ...d, teamMembers } : d))
              }
            />
          )}
          {currentStep === 3 && (
            <FundingStep
              data={formData.funding}
              onChange={(funding: FundingData) => setFormData((d) => (d ? { ...d, funding } : d))}
              showErrors={showStepErrors}
            />
          )}
          {currentStep === 4 && (
            <MilestonesStep
              milestones={formData.milestones}
              onChange={(milestones: MilestoneInput[]) =>
                setFormData((d) => (d ? { ...d, milestones } : d))
              }
              showErrors={showStepErrors}
            />
          )}
          {currentStep === 5 && (
            <RisksStep
              risks={formData.risks}
              onChange={(risks: RiskInput[]) => setFormData((d) => (d ? { ...d, risks } : d))}
            />
          )}
          {currentStep === 6 && (
            <MediaStep
              data={formData.media}
              onChange={(media: MediaData) => setFormData((d) => (d ? { ...d, media } : d))}
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
              isSaving={updateMutation.isPending && !submitMutation.isPending}
              isSubmitting={submitMutation.isPending}
            />
          )}
        </div>

        {mutationError && (
          <span role="alert" style={mutationErrorStyle}>
            {mutationError}
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
              {isBusy ? 'Saving…' : 'Save & Next →'}
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
