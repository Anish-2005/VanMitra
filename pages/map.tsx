import dynamic from 'next/dynamic'
import React from 'react'

const MapComponent = dynamic(() => import('../components/MapComponent'), { ssr: false })

export default function AtlasPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">FRA Atlas — Interactive Map</h2>
      <div className="bg-white rounded shadow p-4">
        <MapComponent />
      </div>
    </div>
  )
}
