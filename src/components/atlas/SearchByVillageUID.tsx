'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
import { useTheme } from '../ThemeProvider'

interface SearchByVillageUIDProps {
  searchVillageUid: string | number | null
  setSearchVillageUid: (uid: string | number | null) => void
  searchStatus: string | null
  setSearchStatus: (status: string | null) => void
  searchClaimType: string | null
  setSearchClaimType: (type: string | null) => void
  searchByUidExpanded: boolean
  setSearchByUidExpanded: (expanded: boolean) => void
  searchLoading: boolean
  runSearchByVillageUid: () => void
}

export function SearchByVillageUID({
  searchVillageUid,
  setSearchVillageUid,
  searchStatus,
  setSearchStatus,
  searchClaimType,
  setSearchClaimType,
  searchByUidExpanded,
  setSearchByUidExpanded,
  searchLoading,
  runSearchByVillageUid
}: SearchByVillageUIDProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <GlassCard className={`my-4 overflow-hidden ${isLight ? 'bg-white/95 border border-slate-200 shadow-lg' : ''}`}>
      <div
        className={`flex items-center justify-between p-4 cursor-pointer ${isLight ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100' : 'bg-slate-800/50'}`}
        onClick={() => setSearchByUidExpanded(!searchByUidExpanded)}
      >
        <div className="flex items-center gap-3">
          <div>
            <span className={`font-semibold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Search by Village UID</span>
            <span className={`block text-xs font-medium ${isLight ? 'text-emerald-600' : 'text-green-300'}`}>Lookup claims by village identifier</span>
          </div>
        </div>
        <div className={`transform transition-transform duration-200 ${searchByUidExpanded ? "rotate-180" : ""} ${isLight ? 'text-slate-600' : 'text-white'}`}>▼</div>
      </div>
      <AnimatePresence>
        {searchByUidExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0.0, 0.2, 1],
              opacity: { duration: 0.2 }
            }}
            className="overflow-hidden"
          >
            <div className={`p-5 space-y-4 ${isLight ? 'bg-white' : ''}`}>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Village UID</label>
                <input
                  value={(searchVillageUid ?? '') as any}
                  onChange={(e) => setSearchVillageUid(e.target.value)}
                  placeholder="Village UID (integer)"
                  className={`w-full rounded-lg px-3 py-2 text-sm transition-colors ${isLight
                    ? 'border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Status (optional)</label>
                <input
                  value={searchStatus ?? ''}
                  onChange={(e) => setSearchStatus(e.target.value)}
                  placeholder="Status (optional)"
                  className={`w-full rounded-lg px-3 py-2 text-sm transition-colors ${isLight
                    ? 'border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Claim type (optional)</label>
                <input
                  value={searchClaimType ?? ''}
                  onChange={(e) => setSearchClaimType(e.target.value)}
                  placeholder="Claim type (optional)"
                  className={`w-full rounded-lg px-3 py-2 text-sm transition-colors ${isLight
                    ? 'border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  disabled={searchLoading}
                  onClick={() => runSearchByVillageUid()}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${isLight ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-900/30'}`}
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
                <button
                  onClick={() => {
                    setSearchVillageUid('')
                    setSearchStatus('all')
                    setSearchClaimType('')
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isLight ? 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}