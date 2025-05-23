import { supabase } from './supabase'
import { createNotification } from './notificationService'

export async function createWorkflowInstance(
  workflowDefinitionId: string,
  entityId: string,
  entityType: string,
  entityTitle: string
) {
  try {
    // Get workflow definition
    const { data: workflowDef, error: defError } = await supabase
      .from('workflow_definitions')
      .select('*')
      .eq('id', workflowDefinitionId)
      .single()

    if (defError) throw defError

    // Create workflow instance
    const { data: instance, error: instanceError } = await supabase
      .from('workflow_instances')
      .insert([{
        workflow_definition_id: workflowDefinitionId,
        entity_id: entityId,
        status: 'pending',
        current_step: 0
      }])
      .select()
      .single()

    if (instanceError) throw instanceError

    // Create initial approvals for the first step
    const firstStep = workflowDef.steps[0]
    const { error: approvalError } = await supabase
      .from('workflow_approvals')
      .insert(
        firstStep.approver_roles.map((roleId: string) => ({
          workflow_instance_id: instance.id,
          step_number: 0,
          approver_id: roleId, // This will be replaced with actual user IDs based on roles
        }))
      )

    if (approvalError) throw approvalError

    // Notify approvers
    await createNotification({
      title: 'New Approval Required',
      message: `A new ${entityType} "${entityTitle}" requires your approval.`,
      type: 'info',
      relatedEntityType: entityType,
      relatedEntityId: entityId
    })

    return instance
  } catch (error) {
    console.error('Error creating workflow instance:', error)
    throw error
  }
}

export async function submitApproval(
  approvalId: string,
  status: 'approved' | 'rejected',
  comments?: string
) {
  try {
    // Update approval
    const { data: approval, error: approvalError } = await supabase
      .from('workflow_approvals')
      .update({ status, comments })
      .eq('id', approvalId)
      .select()
      .single()

    if (approvalError) throw approvalError

    // Get workflow instance and definition
    const { data: instance, error: instanceError } = await supabase
      .from('workflow_instances')
      .select('*, workflow_definitions(*)')
      .eq('id', approval.workflow_instance_id)
      .single()

    if (instanceError) throw instanceError

    // Check if current step is complete
    const currentStep = instance.workflow_definitions.steps[instance.current_step]
    const { data: stepApprovals, error: stepError } = await supabase
      .from('workflow_approvals')
      .select('status')
      .eq('workflow_instance_id', instance.id)
      .eq('step_number', instance.current_step)

    if (stepError) throw stepError

    const approvedCount = stepApprovals.filter(a => a.status === 'approved').length
    const rejectedCount = stepApprovals.filter(a => a.status === 'rejected').length

    // Update workflow instance status
    if (rejectedCount > 0) {
      await supabase
        .from('workflow_instances')
        .update({ status: 'rejected' })
        .eq('id', instance.id)
    } else if (approvedCount >= currentStep.required_approvals) {
      if (instance.current_step === instance.workflow_definitions.steps.length - 1) {
        // Final step approved
        await supabase
          .from('workflow_instances')
          .update({ status: 'completed' })
          .eq('id', instance.id)
      } else {
        // Move to next step
        const nextStep = instance.current_step + 1
        await supabase
          .from('workflow_instances')
          .update({
            current_step: nextStep,
            status: 'in_progress'
          })
          .eq('id', instance.id)

        // Create approvals for next step
        const nextStepDef = instance.workflow_definitions.steps[nextStep]
        await supabase
          .from('workflow_approvals')
          .insert(
            nextStepDef.approver_roles.map((roleId: string) => ({
              workflow_instance_id: instance.id,
              step_number: nextStep,
              approver_id: roleId, // This will be replaced with actual user IDs based on roles
            }))
          )
      }
    }

    return approval
  } catch (error) {
    console.error('Error submitting approval:', error)
    throw error
  }
}