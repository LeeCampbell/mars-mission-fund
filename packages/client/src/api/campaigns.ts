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

const mockCampaign: Campaign = {
  id: '1',
  title: 'Mars Habitat Alpha',
  summary:
    'A fully pressurised, radiation-shielded habitat module designed for long-term human occupation on the Martian surface.',
  description:
    'A fully pressurised, radiation-shielded habitat module designed for long-term human occupation on the Martian surface. ' +
    'This campaign funds the design, testing, and prototype fabrication phases, bringing humanity one step closer to a permanent presence on Mars.',
  heroImageUrl: '',
  status: 'active',
  category: 'Habitat',
  raisedAmount: 1_250_000,
  goalAmount: 2_000_000,
  fundingProgressPct: 63,
  targetAmount: 2_000_000,
  contributorCount: 4_382,
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  milestones: [
    {
      id: 'm1',
      title: 'Design Phase Complete',
      targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      fundingPercentage: 100,
      verificationCriteria: 'CAD files submitted and reviewed by independent structural engineer.',
      status: 'completed',
    },
    {
      id: 'm2',
      title: 'Prototype Fabrication',
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      fundingPercentage: 62,
      verificationCriteria: 'Physical prototype passes pressure integrity test at 1.5× nominal.',
      status: 'active',
    },
    {
      id: 'm3',
      title: 'Thermal Vacuum Testing',
      targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
      fundingPercentage: 0,
      verificationCriteria: 'Module survives 10 thermal cycles in NASA-certified vacuum chamber.',
      status: 'pending',
    },
  ],
  stretchGoals: [
    {
      id: 'sg1',
      title: 'Secondary Life-Support Module',
      description:
        'Adds a redundant life-support sub-system, increasing crew safety margins to 99.9%.',
      targetAmount: 2_500_000,
      unlocked: false,
    },
  ],
  teamMembers: [
    {
      id: 'tm1',
      name: 'Dr. Elena Vasquez',
      role: 'Chief Systems Engineer',
      bio: 'Former NASA structural engineer with 15 years of experience designing life-support systems for the ISS.',
    },
    {
      id: 'tm2',
      name: 'Marcus Okafor',
      role: 'Materials Scientist',
      bio: 'Specialises in radiation-shielding composites and regolith-based construction materials.',
    },
  ],
  updates: [
    {
      id: 'u1',
      title: 'Design Phase Milestone Achieved',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      body: 'We are thrilled to announce that all CAD files have been reviewed and approved by our independent structural engineering partner. Prototype fabrication begins next week!',
    },
  ],
}

const mockCampaigns: Campaign[] = [mockCampaign]

export async function fetchCampaigns(): Promise<Campaign[]> {
  try {
    const response = await fetch('/v1/campaigns')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return (await response.json()) as Campaign[]
  } catch {
    return mockCampaigns
  }
}

export async function fetchCampaign(id: string): Promise<Campaign> {
  try {
    const response = await fetch(`/v1/campaigns/${id}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return (await response.json()) as Campaign
  } catch {
    return { ...mockCampaign, id }
  }
}
