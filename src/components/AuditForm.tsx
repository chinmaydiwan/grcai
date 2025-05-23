'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Audit } from '@/types/audit'
import { createNotification } from '@/lib/notificationService'

interface AuditFormProps {
  audit?: Partial<Audit>
  onSubmit: () => void
  onCancel: () => void
}

export default function AuditForm({ audit, onSubmit, onCancel }: AuditFormProps) {
  const [formData, setFormData] = useState<Partial<Audit>>({
    title: '',
    scope: '',
    start_date: '',
    end_date: '',
    status: 'planned',
    ...audit,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (audit?.id) {
        // Update existing audit
        const { error } = await supabase
          .from('audits')
          .update(formData)
          .eq('id', audit.id)

        if (error) throw error

        await createNotification({
          title: 'Audit Updated',
          message: `Audit "${formData.title}" has been updated.`,
          type: 'info',
          relatedEntityType: 'audit',
          relatedEntityId: audit.id,
        })
      } else {
        // Create new audit
        const { data, error } = await supabase
          .from('audits')
          .insert([formData])
          .select()

        if (error) throw error

        if (data && data.length > 0) {
          const newAudit = data[0] as Audit
          await createNotification({
            title: 'New Audit Created',
            message: `A new audit "${formData.title}" has been scheduled.`,
            type: 'success',
            relatedEntityType: 'audit',
            relatedEntityId: newAudit.id,
          })
        }
      }

      onSubmit()
    } catch (error) {
      console.error('Error saving audit:', error)
      await createNotification({
        title: 'Error Saving Audit',
        message: 'There was an error while saving the audit. Please try again.',
        type: 'error',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Audit Title
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
        <label htmlFor="scope" className="block text-sm font-medium text-gray-700">
          Audit Scope
        </label>
        <textarea
          id="scope"
          value={formData.scope}
          onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="start_date"
            value={formData.start_date?.split('T')[0]}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="end_date"
            value={formData.end_date?.split('T')[0]}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, status: e.target.value as Audit['status'] })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="planned">Planned</option>
          <option value="in_progress">In Progress</option>
          <option value="under_review">Under Review</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
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
          {audit?.id ? 'Update Audit' : 'Create Audit'}
        </button>
      </div>
    </form>
  )
}