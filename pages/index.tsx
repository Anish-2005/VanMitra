import React from 'react'

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">Total Claims: —</div>
        <div className="p-4 bg-white rounded shadow">Sanctioned: —</div>
        <div className="p-4 bg-white rounded shadow">Pending: —</div>
      </div>
      <div className="mt-6 p-4 bg-white rounded shadow">Charts and quick stats will go here.</div>
    </div>
  )
}
