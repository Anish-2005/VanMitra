'use client'

import { Layers } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { useTheme } from '@/components/ThemeProvider'

interface BoundaryLayersPanelProps {
  pendingShowStateBoundary: boolean
  setPendingShowStateBoundary: (show: boolean) => void
  pendingShowDistrictBoundary: boolean
  setPendingShowDistrictBoundary: (show: boolean) => void
  pendingShowTehsilBoundary: boolean
  setPendingShowTehsilBoundary: (show: boolean) => void
  showStateBoundary: boolean
  showDistrictBoundary: boolean
  showTehsilBoundary: boolean
  onApplyBoundaries: () => void
  onCancelBoundaries: () => void
}

export function BoundaryLayersPanel({
  pendingShowStateBoundary,
  setPendingShowStateBoundary,
  pendingShowDistrictBoundary,
  setPendingShowDistrictBoundary,
  pendingShowTehsilBoundary,
  setPendingShowTehsilBoundary,
  showStateBoundary,
  showDistrictBoundary,
  showTehsilBoundary,
  onApplyBoundaries,
  onCancelBoundaries
}: BoundaryLayersPanelProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <GlassCard className={`overflow-hidden mb-6 ${isLight ? 'bg-white/95 border border-slate-200 shadow-lg' : ''}`}>
      <div className={`flex items-center justify-between p-4 ${isLight ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100' : 'bg-slate-800/50'}`}>
        <div className="flex items-center gap-3">
          <Layers size={18} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
          <div>
            <span className={`font-semibold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Boundary Layers</span>
            <span className={`block text-xs font-medium ${isLight ? 'text-emerald-600' : 'text-green-300'}`}>Madhya Pradesh</span>
          </div>
        </div>
      </div>

      <div className={`p-5 space-y-4 ${isLight ? 'bg-white' : ''}`}>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-red-500 bg-red-50 rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 border border-red-400 bg-transparent rounded-sm"></div>
            </div>
            <span className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>State Boundary</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={pendingShowStateBoundary}
              onChange={(e) => setPendingShowStateBoundary(e.target.checked)}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 ${isLight ? 'bg-gray-200 peer-checked:bg-emerald-500' : 'bg-gray-700 peer-checked:bg-emerald-500'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
          </label>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 bg-blue-50 rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 border border-blue-400 bg-transparent rounded-sm"></div>
            </div>
            <span className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>District Boundaries</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={pendingShowDistrictBoundary}
              onChange={(e) => setPendingShowDistrictBoundary(e.target.checked)}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 ${isLight ? 'bg-gray-200 peer-checked:bg-blue-500' : 'bg-gray-700 peer-checked:bg-blue-500'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
          </label>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-green-500 bg-green-50 rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 border border-green-400 bg-transparent rounded-sm"></div>
            </div>
            <span className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>Tehsil Boundaries</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={pendingShowTehsilBoundary}
              onChange={(e) => setPendingShowTehsilBoundary(e.target.checked)}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 ${isLight ? 'bg-gray-200 peer-checked:bg-green-500' : 'bg-gray-700 peer-checked:bg-green-500'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
          </label>
        </div>
      </div>
      <div className={`p-4 border-t rounded-b-2xl ${isLight ? 'border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50' : 'border-emerald-700/50 bg-emerald-800/30'} flex items-center justify-center gap-3`}>
        <button
          onClick={onApplyBoundaries}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${isLight
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
        >
          Apply Changes
        </button>
        <button
          onClick={onCancelBoundaries}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${isLight
            ? 'border-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 shadow-sm'
            : 'border border-green-400/30 text-green-300 hover:bg-green-500/20'}`}
        >
          Cancel
        </button>
      </div>
    </GlassCard>
  )
}