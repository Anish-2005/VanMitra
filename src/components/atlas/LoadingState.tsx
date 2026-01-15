import React from "react"

interface LoadingStateProps {
  isLight: boolean
}

export default function LoadingState({ isLight }: LoadingStateProps) {
  return (
    <div className={
      `min-h-screen p-8 ${isLight ?
        'bg-gradient-to-br from-emerald-50 via-green-100 to-teal-100 text-slate-900' :
        'bg-emerald-900/95 text-white'}`
    }>
      <div className={`max-w-3xl mx-auto p-8 rounded-3xl shadow-2xl backdrop-blur-sm ${isLight ? 'bg-white/90 border border-slate-200' : 'bg-emerald-800/30 border border-emerald-700/50'}`}>
        <div className="flex items-center justify-center">
          <div className={`w-6 h-6 rounded-full animate-pulse mr-3 ${isLight ? 'bg-emerald-600' : 'bg-emerald-400'}`}></div>
          <span className={isLight ? 'text-emerald-700' : 'text-emerald-100'}>Loading...</span>
        </div>
      </div>
    </div>
  )
}