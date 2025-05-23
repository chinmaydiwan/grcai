'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { supabase } from '@/lib/supabase'
import type { Risk } from '@/types/risk'

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRisks()
  }, [])

  async function fetchRisks() {
    try {
      const { data, error } = await supabase
        .from('risks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRisks(data || [])
    } catch (error) {
      console.error('Error fetching risks:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Risk Management</h2>
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add New Risk
          </button>
        </div>

        {loading ? (
          <div>Loading risks...</div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Last Updated
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {risks.map((risk) => (
                  <tr key={risk.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{risk.title}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <RiskLevelBadge likelihood={risk.likelihood} impact={risk.impact} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <StatusBadge status={risk.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(risk.updated_at).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function RiskLevelBadge({ likelihood, impact }: { likelihood: number; impact: number }) {
  const score = likelihood * impact
  let color = 'gray'
  let text = 'Low'

  if (score > 15) {
    color = 'red'
    text = 'High'
  } else if (score > 8) {
    color = 'yellow'
    text = 'Medium'
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-${color}-100 px-2.5 py-0.5 text-xs font-medium text-${color}-800`}
    >
      {text}
    </span>
  )
}

function StatusBadge({ status }: { status: Risk['status'] }) {
  const statusColors: Record<Risk['status'], { bg: string; text: string }> = {
    open: { bg: 'red-100', text: 'red-800' },
    in_review: { bg: 'yellow-100', text: 'yellow-800' },
    mitigated: { bg: 'green-100', text: 'green-800' },
    accepted: { bg: 'blue-100', text: 'blue-800' },
    closed: { bg: 'gray-100', text: 'gray-800' },
  }

  const { bg, text } = statusColors[status]

  return (
    <span className={`inline-flex items-center rounded-full bg-${bg} px-2.5 py-0.5 text-xs font-medium text-${text}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  )
}