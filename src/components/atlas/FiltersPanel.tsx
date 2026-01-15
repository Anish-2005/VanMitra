'use client'

import { useState } from 'react'
import { Filter } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import { useTheme } from '@/components/ThemeProvider'

interface FiltersPanelProps {
  filtersExpanded: boolean
  setFiltersExpanded: (expanded: boolean) => void
  pendingStateFilter: string
  setPendingStateFilter: (state: string) => void
  pendingDistrictFilter: string
  setPendingDistrictFilter: (district: string) => void
  pendingStatusFilter: string
  setPendingStatusFilter: (status: string) => void
  pendingVillageFilter: string
  setPendingVillageFilter: (village: string) => void
  pendingClaimTypeFilter: string | null
  setPendingClaimTypeFilter: (type: string | null) => void
  handleStateChange: (state: string) => void
  handleDistrictChange: (district: string) => void
  handleApplyFilters: () => void
  isApplyingFilters: boolean
  stateOptions: string[]
  districtOptionsByState: Record<string, string[]>
  statusOptions: string[]
  villageOptions: string[]
  villageOptionsByState: Record<string, string[]>
  villageOptionsByStateAndDistrict: Record<string, Record<string, string[]>>
}

export function FiltersPanel({
  filtersExpanded,
  setFiltersExpanded,
  pendingStateFilter,
  setPendingStateFilter,
  pendingDistrictFilter,
  setPendingDistrictFilter,
  pendingStatusFilter,
  setPendingStatusFilter,
  pendingVillageFilter,
  setPendingVillageFilter,
  pendingClaimTypeFilter,
  setPendingClaimTypeFilter,
  handleStateChange,
  handleDistrictChange,
  handleApplyFilters,
  isApplyingFilters,
  stateOptions,
  districtOptionsByState,
  statusOptions,
  villageOptions,
  villageOptionsByState,
  villageOptionsByStateAndDistrict
}: FiltersPanelProps) {
  const { isLight } = useTheme()

  return (
    <GlassCard className={`overflow-hidden mb-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
      <div
        className={`flex items-center justify-between p-3 cursor-pointer ${isLight ? 'bg-emerald-100 hover:bg-emerald-200' : 'bg-slate-800/50'}`}
        onClick={() => setFiltersExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          <Filter size={16} className={isLight ? 'text-emerald-700' : 'text-emerald-400'} />
          <span className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Filters</span>
          <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>(controls)</span>
        </div>
        <div className={`transform transition-transform ${filtersExpanded ? "rotate-180" : ""} ${isLight ? 'text-slate-700' : 'text-white'}`}>▼</div>
      </div>

      <AnimatePresence>
        {filtersExpanded && (
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
            <div className="p-4 space-y-3">
              <div>
                <label className={`block text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>State</label>
                <select
                  value={pendingStateFilter}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className={`mt-1 w-full rounded-md border p-2 ${isLight
                    ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`}
                >
                  <option value="all">All</option>
                  {(stateOptions.length ? stateOptions : []).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>District</label>
                <select
                  value={pendingDistrictFilter}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className={`mt-1 w-full rounded-md border p-2 ${isLight
                    ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`}
                >
                  <option value="all">All</option>
                  {pendingStateFilter !== "all"
                    ? districtOptionsByState[pendingStateFilter] &&
                      districtOptionsByState[pendingStateFilter].length
                      ? districtOptionsByState[pendingStateFilter].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))
                      : [].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))
                    : null}
                </select>
              </div>

              <div>
                <label className={`block text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>Status</label>
                <select
                  value={pendingStatusFilter}
                  onChange={(e) => setPendingStatusFilter(e.target.value)}
                  className={`mt-1 w-full rounded-md border p-2 ${isLight
                    ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`}
                >
                  <option value="all">All</option>
                  {statusOptions.length ? (
                    statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {String(s).charAt(0).toUpperCase() + String(s).slice(1)}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className={`block text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>Village</label>
                <select
                  value={pendingVillageFilter}
                  onChange={(e) => setPendingVillageFilter(e.target.value)}
                  className={`mt-1 w-full rounded-md border p-2 ${isLight
                    ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`}
                >
                  <option value="all">All</option>
                  {pendingDistrictFilter && pendingDistrictFilter !== "all"
                    ? // Prefer district-scoped villages when district is selected
                    (villageOptionsByStateAndDistrict[pendingStateFilter] && villageOptionsByStateAndDistrict[pendingStateFilter][pendingDistrictFilter]
                      ? villageOptionsByStateAndDistrict[pendingStateFilter][pendingDistrictFilter].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))
                      : // fallback to state-wide villages for the selected state
                      (villageOptionsByState[pendingStateFilter] || []).map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      )))
                    : // no district selected: show state-wide list if available otherwise global list
                    (pendingStateFilter !== "all"
                      ? (villageOptionsByState[pendingStateFilter] || []).map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))
                      : villageOptions.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      )))}
                </select>
              </div>

              <div>
                <label className={`block text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>Claim type</label>
                <select
                  value={pendingClaimTypeFilter ?? ""}
                  onChange={(e) => setPendingClaimTypeFilter(e.target.value || null)}
                  className={`mt-1 w-full rounded-md border p-2 ${isLight
                    ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`}
                >
                  <option value="">any</option>
                  {statusOptions.length ? (
                    statusOptions.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))
                  ) : (
                    <option value="">(any)</option>
                  )}
                </select>
              </div>

              <div>
                <button
                  onClick={handleApplyFilters}
                  disabled={isApplyingFilters}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isLight
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                >
                  {isApplyingFilters ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Applying...
                    </>
                  ) : (
                    "Apply Filters"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}