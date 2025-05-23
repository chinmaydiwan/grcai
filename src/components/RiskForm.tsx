'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Risk } from '@/types/risk'
import { createNotification } from '@/lib/notificationService'
import { createWorkflowInstance } from '@/lib/workflowService'
import { hasPermission } from '@/lib/rbacService'
// Remove unused import
// import { RiskCategory } from "../types/risk";

interface RiskFormProps {
  risk?: Partial<Risk>
  onSubmit: () => void
  onCancel: () => void
}

export default function RiskForm({ risk, onSubmit, onCancel }: RiskFormProps) {
  const [formData, setFormData] = useState<Partial<Risk>>({
    title: '',
    description: '',
    likelihood: 1,
    impact: 1,
    status: 'open',
    ...risk,
  })
  const [canBypassApproval, setCanBypassApproval] = useState(false)

  useEffect(() => {
    checkPermissions()
  }, [])

  async function checkPermissions() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const hasHighRiskPermission = await hasPermission(user.id, 'bypass_risk_approval')
      setCanBypassApproval(hasHighRiskPermission)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (risk?.id) {
        // Update existing risk
        const { error } = await supabase
          .from('risks')
          .update(formData)
          .eq('id', risk.id)

        if (error) throw error

        await createNotification({
          title: 'Risk Updated',
          message: `Risk "${formData.title}" has been updated.`,
          type: 'info',
          relatedEntityType: 'risk',
          relatedEntityId: risk.id,
        })
      } else {
        // Create new risk
        const { data, error } = await supabase
          .from('risks')
          .insert([formData])
          .select() // Add select() to return the inserted data

        if (error) throw error

        if (data && data[0]) {
          const riskScore = (formData.likelihood || 1) * (formData.impact || 1)
          
          // Create workflow instance for high-risk items that require approval
          if (riskScore > 15 && !canBypassApproval) {
            await createWorkflowInstance(
              'risk_approval_workflow',
              data[0].id,
              'risk',
              formData.title || ''
            )

            await createNotification({
              title: 'Risk Pending Approval',
              message: `New high-risk item "${formData.title}" has been created and is pending approval.`,
              type: 'warning',
              relatedEntityType: 'risk',
              relatedEntityId: data[0].id,
            })
          } else {
            await createNotification({
              title: 'New Risk Created',
              message: `A new risk "${formData.title}" has been created.`,
              type: 'success',
              relatedEntityType: 'risk',
              relatedEntityId: data[0].id,
            })
          }
        }
      }

      onSubmit()
    } catch (error) {
      console.error('Error saving risk:', error)
      await createNotification({
        title: 'Error Saving Risk',
        message: 'There was an error while saving the risk. Please try again.',
        type: 'error',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="likelihood" className="block text-sm font-medium text-gray-700">
            Likelihood (1-5)
          </label>
          <input
            type="number"
            id="likelihood"
            min={1}
            max={5}
            value={formData.likelihood}
            onChange={(e) => setFormData({ ...formData, likelihood: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="impact" className="block text-sm font-medium text-gray-700">
            Impact (1-5)
          </label>
          <input
            type="number"
            id="impact"
            min={1}
            max={5}
            value={formData.impact}
            onChange={(e) => setFormData({ ...formData, impact: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as Risk['status'] })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="open">Open</option>
          <option value="in_review">In Review</option>
          <option value="mitigated">Mitigated</option>
          <option value="accepted">Accepted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {risk?.id ? 'Update Risk' : 'Create Risk'}
        </button>
      </div>
    </form>
  )
}