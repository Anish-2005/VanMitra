import React from "react"
import GlassCard from "@/components/ui/GlassCard"
import AnimatedCounter from "@/components/ui/AnimatedCounter"

interface FeatureHeaderProps {
  isLight: boolean
  props: {
    id?: string
    status?: string
    claim_type?: string
    area?: number
    state?: string
    village?: string
  }
}

export default function FeatureHeader({ isLight, props }: FeatureHeaderProps) {
  return (
    <GlassCard className={`p-8 mb-8 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
      {/* Top Row: Status + Type */}
      <div className="flex items-start gap-6 mb-8">
        <div className="flex flex-wrap gap-3">
          <div
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm backdrop-blur-sm ${String(props.status).toLowerCase() === 'approved'
              ? isLight
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-emerald-200/50'
                : 'bg-emerald-600/30 text-emerald-100 border-emerald-400/40 shadow-emerald-800/20'
              : isLight
                ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-amber-200/50'
                : 'bg-amber-600/30 text-amber-100 border-amber-400/40 shadow-amber-800/20'
              }`}
          >
            {String(props.status ?? '').toUpperCase()}
          </div>
          <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border shadow-inner ${isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-700/40 text-slate-200 border border-slate-600/40'}`}>
            {String(props.claim_type ?? '').toUpperCase()}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
        {/* ID */}
        <div className={`group relative rounded-2xl p-6 border shadow-lg transition-colors ${isLight ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300 shadow-emerald-100/50' : 'bg-emerald-900/20 border-emerald-700/40 hover:border-emerald-500/50 shadow-emerald-900/10'}`}>
          <span className={`font-semibold text-xs uppercase tracking-wide flex items-center gap-2 ${isLight ? 'text-emerald-700' : 'text-emerald-300/70'}`}>
            <svg className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400/80'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M9 12h6m2 0a2 2 0 100-4h-1V7a2 2 0 10-4 0v1H9a2 2 0 100 4h1v1a2 2 0 104 0v-1h1z" />
            </svg>
            ID
          </span>
          <p className={`text-2xl font-bold mt-2 truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{props.id}</p>
        </div>

        {/* Area */}
        <div className={`group relative rounded-2xl p-6 border shadow-lg transition-colors ${isLight ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300 shadow-emerald-100/50' : 'bg-emerald-900/20 border-emerald-700/40 hover:border-emerald-500/50 shadow-emerald-900/10'}`}>
          <span className={`font-semibold text-xs uppercase tracking-wide flex items-center gap-2 ${isLight ? 'text-emerald-700' : 'text-emerald-300/70'}`}>
            <svg className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400/80'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M4 4h16v16H4z" />
            </svg>
            Area
          </span>
          <span className={`text-2xl font-bold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <AnimatedCounter value={props.area || 0} /> <span className={`text-base ${isLight ? 'text-emerald-700' : 'text-emerald-300/70'}`}>ha</span>
          </span>
        </div>

        {/* State */}
        <div className={`group relative rounded-2xl p-6 border shadow-lg transition-colors ${isLight ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300 shadow-emerald-100/50' : 'bg-emerald-900/20 border-emerald-700/40 hover:border-emerald-500/50 shadow-emerald-900/10'}`}>
          <span className={`font-semibold text-xs uppercase tracking-wide flex items-center gap-2 ${isLight ? 'text-emerald-700' : 'text-emerald-300/70'}`}>
            <svg className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400/80'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 2l9 4.5v11L12 22l-9-4.5v-11L12 2z" />
            </svg>
            State
          </span>
          <p className={`text-2xl font-bold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{props.state ?? '—'}</p>
        </div>

        {/* Village */}
        <div className={`group relative rounded-2xl p-6 border shadow-lg transition-colors ${isLight ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300 shadow-emerald-100/50' : 'bg-emerald-900/20 border-emerald-700/40 hover:border-emerald-500/50 shadow-emerald-900/10'}`}>
          <span className={`font-semibold text-xs uppercase tracking-wide flex items-center gap-2 ${isLight ? 'text-emerald-700' : 'text-emerald-300/70'}`}>
            <svg className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400/80'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10a8 8 0 10-16 0c0 6 8 10 8 10z" />
            </svg>
            Village
          </span>
          <p className={`text-2xl font-bold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{props.village ?? '—'}</p>
        </div>
      </div>
    </GlassCard>
  )
}