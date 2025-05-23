'use client'

import { useState, useEffect, useCallback } from 'react' // Import useCallback
import { supabase } from '@/lib/supabase'
import { submitApproval } from '@/lib/workflowService'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { WorkflowApproval } from '@/types/workflow'

export default function WorkflowApprovalList() {
  const [approvals, setApprovals] = useState<WorkflowApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    getUserId()
  }, [])

  async function getUserId() {
    const { data: { user } } = await supabase.auth.getUser()
    setUserId(user?.id || null)
  }

  // Wrap fetchApprovals in useCallback
  const fetchApprovals = useCallback(async () => {
    if (!userId) return // Ensure userId is available

    try {
      const { data, error } = await supabase
        .from('workflow_approvals')
        .select(`
          *,
          workflow_instances!inner(*, workflow_definitions(*))
        `)
        .eq('status', 'pending')
        .eq('approver_id', userId)

      if (error) throw error
      setApprovals(data || [])
    } catch (error) {
      console.error('Error fetching approvals:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, setApprovals, setLoading]) // Add dependencies

  // Wrap subscribeToApprovals in useCallback
  const subscribeToApprovals = useCallback(() => {
    if (!userId) return // Ensure userId is available

    const channel = supabase
      .channel('workflow_approvals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_approvals'
        },
        (payload: RealtimePostgresChangesPayload<WorkflowApproval>) => {
          if (payload.new && (payload.new as WorkflowApproval).approver_id === userId) {
            fetchApprovals() // Call the memoized fetchApprovals
          }
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchApprovals, supabase]) // Add dependencies

  // Consolidate the useEffect for fetching and subscribing
  useEffect(() => {
    if (userId) {
      fetchApprovals()
      const cleanup = subscribeToApprovals()
      return cleanup
    }
  }, [userId, fetchApprovals, subscribeToApprovals]) // Add dependencies

  async function handleApproval(approvalId: string, status: 'approved' | 'rejected', comments: string = '') {
    try {
      await submitApproval(approvalId, status, comments)
      await fetchApprovals()
    } catch (error) {
      console.error('Error submitting approval:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Pending Approvals</h2>
      {approvals.length === 0 ? (
        <p className="text-gray-500">No pending approvals</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {approvals.map((approval) => (
            <li key={approval.id} className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {approval.workflow_instance?.workflow_definition?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Step {approval.step_number + 1}:
                    {approval.workflow_instance?.workflow_definition?.steps[approval.step_number].name}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproval(approval.id, 'approved')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(approval.id, 'rejected')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}