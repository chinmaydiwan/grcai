export type RiskStatus = 'open' | 'in_review' | 'mitigated' | 'accepted' | 'closed'

export interface Risk {
  id: string
  org_id: string
  category_id: string
  title: string
  description: string
  likelihood: number
  impact: number
  status: RiskStatus
  owner_id: string
  created_at: string
  updated_at: string
}

export interface RiskCategory {
  id: string
  name: string
  description: string
}

export interface RiskAssessment {
  risk_id: string
  assessor_id: string
  assessment_date: string
  likelihood: number
  impact: number
  notes: string
}