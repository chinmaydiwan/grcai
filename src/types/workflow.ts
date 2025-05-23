export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  entity_type: string;
  steps: WorkflowStep[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  step_number: number;
  name: string;
  description?: string;
  approver_roles: string[];
  required_approvals: number;
}

export interface WorkflowInstance {
  id: string;
  workflow_definition_id: string;
  entity_id: string;
  current_step: number;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface WorkflowApproval {
  id: string;
  workflow_instance_id: string;
  step_number: number;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  created_at: string;
  updated_at: string;
  workflow_instance?: WorkflowInstance & {
    workflow_definition: WorkflowDefinition;
  };
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string;
}