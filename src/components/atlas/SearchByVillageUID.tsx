'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import { useTheme } from '@/components/ThemeProvider'

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
  const { isLight } = useTheme()

  return (
    <GlassCard className={`my-4 overflow-hidden ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
      <div
        className={`flex items-center justify-between p-3 cursor-pointer ${isLight ? 'bg-emerald-100 hover:bg-emerald-200' : 'bg-slate-800/50'}`}
        onClick={() => setSearchByUidExpanded((s) => !s)}
      >
        <div>
          <h4 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'} mb-0`}>Search by Village UID</h4>
          <p className={`text-xs ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>Lookup claims by village identifier</p>
        </div>
        <div className={`transform transition-transform ${searchByUidExpanded ? "rotate-180" : ""} ${isLight ? 'text-slate-700' : 'text-white'}`}>▼</div>
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
            <div className="p-4 grid grid-cols-1 gap-2">
              <input
                value={(searchVillageUid ?? '') as any}
                onChange={(e) => setSearchVillageUid(e.target.value)}
                placeholder="Village UID (integer)"
                className={`w-full rounded-md border p-2 ${isLight
                  ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                  : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`}
              />
              <input
                value={searchStatus ?? ''}
                onChange={(e) => setSearchStatus(e.target.value)}
                placeholder="Status (optional)"
                className={`w-full rounded-md border p-2 ${isLight
                  ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                  : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`}
              />
              <input
                value={searchClaimType ?? ''}
                onChange={(e) => setSearchClaimType(e.target.value)}
                placeholder="Claim type (optional)"
                className={`w-full rounded-md border p-2 ${isLight
                  ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                  : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`}
              />
              <div className="flex items-center gap-2">
                <button
                  disabled={searchLoading}
                  onClick={() => runSearchByVillageUid()}
                  className={`px-3 py-1 rounded-md ${searchLoading
                    ? (isLight ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-gray-300 text-gray-700 cursor-not-allowed')
                    : (isLight ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white')}`}
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
                <button
                  onClick={() => {
                    setSearchVillageUid('')
                    setSearchStatus('all')
                    setSearchClaimType('')
                  }}
                  className={`px-3 py-1 rounded-md ${isLight
                    ? 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'border border-green-400/30 text-green-300 hover:bg-green-500/20'}`}
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