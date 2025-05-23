export type AuditStatus = 'planned' | 'in_progress' | 'under_review' | 'completed' | 'cancelled'

export interface Audit {
  id: string
  org_id: string
  title: string
  scope: string
  start_date: string
  end_date: string
  status: AuditStatus
  lead_auditor_id: string
  created_at: string
  updated_at: string
}

export interface AuditFinding {
  id: string
  audit_id: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  status: 'open' | 'in_progress' | 'remediated' | 'accepted'
  owner_id: string
  due_date: string
  created_at: string
  updated_at: string
}

export interface AuditWorkpaper {
  id: string
  audit_id: string
  title: string
  description: string
  file_url: string
  uploaded_by: string
  created_at: string
}