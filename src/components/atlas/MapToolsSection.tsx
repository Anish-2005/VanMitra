'use client'

import { Ruler, Download } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import { useTheme } from '../ThemeProvider'

interface MapToolsSectionProps {
  isMeasuring: boolean
  measurementDistance: number | null
  handleExportGeoJSON: () => void
  handleExportMap: () => void
}

export function MapToolsSection({
  isMeasuring,
  measurementDistance,
  handleExportGeoJSON,
  handleExportMap
}: MapToolsSectionProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <GlassCard className={`mt-4 p-4 pb-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
        <div className={`flex items-center gap-2 mb-3 p-3 rounded-lg ${isLight ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100' : 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-800/30'}`}>
          <Ruler size={16} className={isLight ? 'text-blue-600' : 'text-blue-400'} />
          <h4 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Measurement Tools</h4>
        </div>
        <div className="space-y-3">
          {!isMeasuring ? (
            <button
              onClick={() => {
                // This would be passed as a prop from parent
                console.log("Start measurement clicked")
              }}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm ${isLight ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/30'}`}
            >
              Start Measurement
            </button>
          ) : (
            <div className={`text-sm p-3 rounded-md border ${isLight ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30'}`}>
              Click two points on the map to measure distance
            </div>
          )}
          {measurementDistance && (
            <div className={`text-sm p-3 rounded-md border ${isLight ? 'bg-green-100 text-green-800 border-green-300' : 'bg-green-500/20 text-green-200 border-green-400/30'}`}>
              <strong>Distance:</strong> {measurementDistance.toFixed(2)} km
            </div>
          )}
          <button
            onClick={() => {
              // This would be passed as a prop from parent
              console.log("Clear measurement clicked")
            }}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isLight ? 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
          >
            Clear Measurement
          </button>
        </div>
      </GlassCard>

      <GlassCard className={`mt-4 p-4 pb-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
        <div className={`flex items-center gap-2 mb-3 p-3 rounded-lg ${isLight ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100' : 'bg-gradient-to-r from-emerald-900/20 to-green-900/20 border border-emerald-800/30'}`}>
          <Download size={16} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
          <h4 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Export Tools</h4>
        </div>
        <div className="space-y-3">
          <button
            onClick={handleExportGeoJSON}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm ${isLight ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-emerald-900/30'}`}
          >
            Export GeoJSON
          </button>
          <button
            onClick={handleExportMap}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isLight ? 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
          >
            Export Map Image
          </button>
        </div>
      </GlassCard>
    </div>
  )
}