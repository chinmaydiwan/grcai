'use client'

import DashboardLayout from '@/components/DashboardLayout'

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Risk Summary Card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Risk Summary</h3>
          <dl className="mt-5 grid grid-cols-1 gap-5">
            <div>
              <dt className="text-sm font-medium text-gray-500">High Risks</dt>
              <dd className="mt-1 text-3xl font-semibold text-red-600">5</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Medium Risks</dt>
              <dd className="mt-1 text-3xl font-semibold text-yellow-600">12</dd>
            </div>
          </dl>
        </div>

        {/* Compliance Status Card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Compliance Status</h3>
          <dl className="mt-5 grid grid-cols-1 gap-5">
            <div>
              <dt className="text-sm font-medium text-gray-500">Controls in Place</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">85%</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Pending Reviews</dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">8</dd>
            </div>
          </dl>
        </div>

        {/* Audit Status Card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Audit Status</h3>
          <dl className="mt-5 grid grid-cols-1 gap-5">
            <div>
              <dt className="text-sm font-medium text-gray-500">Active Audits</dt>
              <dd className="mt-1 text-3xl font-semibold text-purple-600">3</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Completed</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-600">15</dd>
            </div>
          </dl>
        </div>
      </div>
    </DashboardLayout>
  )
}