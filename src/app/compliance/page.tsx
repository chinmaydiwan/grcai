'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { supabase } from '@/lib/supabase'
import type { ComplianceFramework, Control } from '@/types/compliance'

export default function CompliancePage() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([])
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)
  const [controls, setControls] = useState<Control[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFrameworks()
  }, [])

  useEffect(() => {
    if (selectedFramework) {
      fetchControls(selectedFramework)
    }
  }, [selectedFramework])

  async function fetchFrameworks() {
    try {
      const { data, error } = await supabase
        .from('compliance_frameworks')
        .select('*')
        .order('name')

      if (error) throw error
      setFrameworks(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching frameworks:', error)
      setLoading(false)
    }
  }

  async function fetchControls(frameworkId: string) {
    try {
      const { data, error } = await supabase
        .from('controls')
        .select('*')
        .eq('framework_id', frameworkId)
        .order('control_id')

      if (error) throw error
      setControls(data || [])
    } catch (error) {
      console.error('Error fetching controls:', error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Compliance Management</h2>
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Framework
          </button>
        </div>

        {loading ? (
          <div>Loading frameworks...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Framework List */}
            <div className="col-span-1 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Frameworks</h3>
              <div className="space-y-2">
                {frameworks.map((framework) => (
                  <button
                    key={framework.id}
                    onClick={() => setSelectedFramework(framework.id)}
                    className={`w-full rounded-lg px-4 py-2 text-left ${
                      selectedFramework === framework.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{framework.name}</div>
                    <div className="text-sm text-gray-500">v{framework.version}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Controls List */}
            <div className="col-span-3">
              {selectedFramework ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Controls</h3>
                    <button
                      type="button"
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Add Control
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-lg bg-white shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Control ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Status
                          </th>
                          <th className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {controls.map((control) => (
                          <tr key={control.id}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                              {control.control_id}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{control.title}</td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <ControlStatusBadge controlId={control.id} />
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900">Assess</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">
                      Select a framework to view its controls
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function ControlStatusBadge({ controlId }: { controlId: string }) {
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLatestAssessment() {
      try {
        const { data, error } = await supabase
          .from('control_assessments')
          .select('status')
          .eq('control_id', controlId)
          .order('assessment_date', { ascending: false })
          .limit(1)

        if (error) throw error
        setStatus(data?.[0]?.status || 'not_implemented')
      } catch (error) {
        console.error('Error fetching control status:', error)
      }
    }
    fetchLatestAssessment();
  }, [controlId]);

  const statusColors: Record<string, { bg: string; text: string }> = {
    effective: { bg: 'green-100', text: 'green-800' },
    partially_effective: { bg: 'yellow-100', text: 'yellow-800' },
    ineffective: { bg: 'red-100', text: 'red-800' },
    not_implemented: { bg: 'gray-100', text: 'gray-800' },
  }

  const { bg, text } = statusColors[status || 'not_implemented']

  return (
    <span
      className={`inline-flex items-center rounded-full bg-${bg} px-2.5 py-0.5 text-xs font-medium text-${text}`}
    >
      {status?.replace('_', ' ').toUpperCase() || 'NOT IMPLEMENTED'}
    </span>
  )
}