'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { supabase } from '@/lib/supabase'
import type { Audit } from '@/types/audit'

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAudits()
  }, [])

  async function fetchAudits() {
    try {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .order('start_date', { ascending: false })

      if (error) throw error
      setAudits(data || [])
    } catch (error) {
      console.error('Error fetching audits:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Audit Management</h2>
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Audit
          </button>
        </div>

        {loading ? (
          <div>Loading audits...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Active Audits */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Active Audits</h3>
              <div className="space-y-4">
                {audits
                  .filter((audit) => ['planned', 'in_progress', 'under_review'].includes(audit.status))
                  .map((audit) => (
                    <AuditCard key={audit.id} audit={audit} />
                  ))}
              </div>
            </div>

            {/* Completed Audits */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Completed Audits</h3>
              <div className="space-y-4">
                {audits
                  .filter((audit) => audit.status === 'completed')
                  .map((audit) => (
                    <AuditCard key={audit.id} audit={audit} />
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function AuditCard({ audit }: { audit: Audit }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">{audit.title}</h4>
        <AuditStatusBadge status={audit.status} />
      </div>
      <div className="mt-2 text-sm text-gray-500">{audit.scope}</div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="space-y-1">
          <div>
            <span className="font-medium text-gray-500">Start Date:</span>{' '}
            {new Date(audit.start_date).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium text-gray-500">End Date:</span>{' '}
            {new Date(audit.end_date).toLocaleDateString()}
          </div>
        </div>
        <button className="text-blue-600 hover:text-blue-900">View Details</button>
      </div>
    </div>
  )
}

function AuditStatusBadge({ status }: { status: Audit['status'] }) {
  const statusColors: Record<Audit['status'], { bg: string; text: string }> = {
    planned: { bg: 'blue-100', text: 'blue-800' },
    in_progress: { bg: 'yellow-100', text: 'yellow-800' },
    under_review: { bg: 'purple-100', text: 'purple-800' },
    completed: { bg: 'green-100', text: 'green-800' },
    cancelled: { bg: 'gray-100', text: 'gray-800' },
  }

  const { bg, text } = statusColors[status]

  return (
    <span
      className={`inline-flex items-center rounded-full bg-${bg} px-2.5 py-0.5 text-xs font-medium text-${text}`}
    >
      {status.replace('_', ' ').toUpperCase()}
    </span>
  )
}