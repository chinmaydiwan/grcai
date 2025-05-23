'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { supabase } from '@/lib/supabase'
import { submitApproval } from '@/lib/workflowService'
import type { WorkflowApproval } from '@/types/workflow'
import type { RealtimePostgresChangesPayload, RealtimeChannel } from '@supabase/supabase-js'

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<WorkflowApproval[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApprovals()
    const subscription = subscribeToApprovals()
    return () => {
      subscription.unsubscribe()
    }
  }, [fetchApprovals, subscribeToApprovals])

  async function fetchApprovals() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('workflow_approvals')
        .select(`
          *,
          workflow_instances!inner(*, workflow_definitions(*))
        `)
        .eq('approver_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setApprovals(data || [])
    } catch (error) {
      console.error('Error fetching approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const channel = subscribeToApprovals();
    return () => {
      channel.unsubscribe();
    };
  }, [fetchApprovals]);

  function subscribeToApprovals(): RealtimeChannel {
    return supabase.channel('workflow_approvals')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'workflow_approvals' 
        }, 
        async (payload: RealtimePostgresChangesPayload<{
          type: 'INSERT' | 'UPDATE' | 'DELETE'
          new: WorkflowApproval
          old: WorkflowApproval | null
        }>) => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          
          const newRecord = payload.new as WorkflowApproval
          if (newRecord && newRecord.approver_id === user.id) {
            fetchApprovals()
          }
        }
      )
      .subscribe()
  }

  async function handleApproval(approvalId: string, status: 'approved' | 'rejected', comments: string = '') {
    try {
      await submitApproval(approvalId, status, comments)
      await fetchApprovals()
    } catch (error) {
      console.error('Error submitting approval:', error)
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div>Loading...</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Workflow Approvals</h2>
        </div>

        {approvals.length === 0 ? (
          <p className="text-gray-500">No approvals found</p>
        ) : (
          <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
            <ul className="divide-y divide-gray-200">
              {approvals.map((approval) => (
                <li key={approval.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {approval.workflow_instance?.workflow_definition.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Status: <span className="font-medium">{approval.status}</span>
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Step {approval.step_number + 1}:
                        {approval.workflow_instance?.workflow_definition.steps[approval.step_number].name}
                      </p>
                    </div>
                    {approval.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleApproval(approval.id, 'approved')}
                          className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(approval.id, 'rejected')}
                          className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}