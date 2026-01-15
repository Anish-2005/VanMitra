import React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface ErrorStateProps {
  isLight: boolean
  error?: string | null
}

export default function ErrorState({ isLight, error }: ErrorStateProps) {
  return (
    <div className={
      `min-h-screen p-8 ${isLight ?
        'bg-gradient-to-br from-emerald-50 via-green-100 to-teal-100 text-slate-900' :
        'bg-emerald-900/95 text-white'}`
    }>
      <div className={`max-w-3xl mx-auto p-8 rounded-3xl shadow-2xl backdrop-blur-sm ${isLight ? 'bg-white/90 border border-slate-200' : 'bg-emerald-800/30 border border-emerald-700/50'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${isLight ? 'text-red-600' : 'text-red-400'}`}>{error || "Feature not found"}</h2>
        <div className="mt-6">
          <Link href="/atlas" className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl ${isLight ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
            <ArrowLeft size={16} />
            Back to Atlas
          </Link>
        </div>
      </div>
    </div>
  )
}