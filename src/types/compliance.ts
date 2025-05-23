export interface ComplianceFramework {
  id: string
  name: string
  description: string
  version: string
  created_at: string
  updated_at: string
}

export interface Control {
  id: string
  framework_id: string
  control_id: string
  title: string
  description: string
  created_at: string
  updated_at: string
}

export interface ControlAssessment {
  id: string
  control_id: string
  assessor_id: string
  status: 'effective' | 'partially_effective' | 'ineffective' | 'not_implemented'
  evidence: string
  notes: string
  assessment_date: string
}

export interface Policy {
  id: string
  title: string
  description: string
  version: string
  status: 'draft' | 'review' | 'approved' | 'archived'
  owner_id: string
  created_at: string
  updated_at: string
}