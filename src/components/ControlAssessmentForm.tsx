'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Control, ControlAssessment } from '@/types/compliance'
import { createNotification } from '@/lib/notificationService'

interface ControlAssessmentFormProps {
  control: Control
  onSubmit: () => void
  onCancel: () => void
}

export default function ControlAssessmentForm({
  control,
  onSubmit,
  onCancel,
}: ControlAssessmentFormProps) {
  const [formData, setFormData] = useState<Partial<ControlAssessment>>({
    control_id: control.id,
    status: 'not_implemented',
    evidence: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Ensure all required fields are present
      if (!formData.status) {
        throw new Error('Assessment status is required')
      }

      const { error } = await supabase.from('control_assessments').insert([{
        ...formData,
        assessment_date: new Date().toISOString(),
      }])

      if (error) throw error

      // Create notification based on assessment status
      const notificationType = formData.status === 'effective' ? 'success' :
        formData.status === 'partially_effective' ? 'warning' : 'error'

      const statusDisplay = formData.status.replace(/_/g, ' ')
      await createNotification({
        title: 'Control Assessment Updated',
        message: `Control "${control.title}" has been assessed as ${statusDisplay}.`,
        type: notificationType,
        relatedEntityType: 'control',
        relatedEntityId: control.id,
      })

      onSubmit()
    } catch (error) {
      console.error('Error saving assessment:', error)
      await createNotification({
        title: 'Error Saving Assessment',
        message: 'There was an error while saving the control assessment. Please try again.',
        type: 'error',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Assessment Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value as ControlAssessment['status'] })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="effective">Effective</option>
          <option value="partially_effective">Partially Effective</option>
          <option value="ineffective">Ineffective</option>
          <option value="not_implemented">Not Implemented</option>
        </select>
      </div>

      <div>
        <label htmlFor="evidence" className="block text-sm font-medium text-gray-700">
          Evidence
        </label>
        <textarea
          id="evidence"
          value={formData.evidence}
          onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
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
          Submit Assessment
        </button>
      </div>
    </form>
  )
}