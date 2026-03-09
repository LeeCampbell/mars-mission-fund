export interface Milestone {
  id: string
  title: string
  targetDate: string
  fundingPercentage: number
  verificationCriteria: string
  status: 'pending' | 'active' | 'completed'
}

export interface StretchGoal {
  id: string
  title: string
  description: string
  targetAmount: number
  unlocked: boolean
}

export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
}

export interface CampaignUpdate {
  id: string
  title: string
  date: string
  body: string
}

export interface Campaign {
  id: string
  title: string
  summary: string
  description: string
  heroImageUrl: string
  status: string
  category: string
  raisedAmount: number
  goalAmount: number
  fundingProgressPct: number
  targetAmount: number
  contributorCount: number
  deadline: string
  milestones: Milestone[]
  stretchGoals: StretchGoal[]
  teamMembers: TeamMember[]
  updates: CampaignUpdate[]
}
