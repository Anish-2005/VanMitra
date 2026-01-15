import React from "react"

interface LoadingOverlayProps {
  isLoadingData: boolean
}

export default function LoadingOverlay({ isLoadingData }: LoadingOverlayProps) {
  if (!isLoadingData) return null

  return (
    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-20">
      <div className="bg-emerald-900/95 border border-emerald-700/50 rounded-3xl p-6 shadow-2xl flex items-center gap-4 backdrop-blur-sm">
        <div className="relative">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full border-2 border-green-300/30 animate-ping"></div>
        </div>
        <div>
          <span className="text-white font-medium">Loading map data...</span>
          <div className="text-xs text-emerald-300 mt-1">Please wait</div>
        </div>
      </div>
    </div>
  )
}