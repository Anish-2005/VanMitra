import React from "react"

interface MapErrorOverlayProps {
  mapError: string | null
  onRetry: () => void
}

export default function MapErrorOverlay({ mapError, onRetry }: MapErrorOverlayProps) {
  if (!mapError) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40">
      <div className="bg-emerald-900/95 border border-emerald-700/50 rounded-3xl p-6 shadow-2xl max-w-lg text-center backdrop-blur-sm">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-white">Map error</h3>
        </div>
        <p className="text-emerald-300 mb-6">{mapError}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onRetry}
            className="px-6 py-2 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-200 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  )
}