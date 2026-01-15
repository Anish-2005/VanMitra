'use client'

import { useState } from 'react'
import { Filter } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
import { useTheme } from '../ThemeProvider'

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
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <GlassCard className={`overflow-hidden mb-6 ${isLight ? 'bg-white/95 border border-slate-200 shadow-lg' : ''}`}>
      <div
        className={`flex items-center justify-between p-4 cursor-pointer ${isLight ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100' : 'bg-slate-800/50'}`}
        onClick={() => setFiltersExpanded(!filtersExpanded)}
      >
        <div className="flex items-center gap-3">
          <Filter size={18} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
          <div>
            <span className={`font-semibold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Filters</span>
            <span className={`block text-xs font-medium ${isLight ? 'text-emerald-600' : 'text-green-300'}`}>controls</span>
          </div>
        </div>
        <div className={`transform transition-transform duration-200 ${filtersExpanded ? "rotate-180" : ""} ${isLight ? 'text-slate-600' : 'text-white'}`}>▼</div>
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
            <div className={`p-5 space-y-4 overflow-y-auto max-h-96 custom-scroll ${isLight ? 'bg-white' : ''}`}>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>State</label>
                <select
                  value={pendingStateFilter}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-sm transition-colors ${isLight
                    ? 'border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border border-slate-600 bg-slate-800/50 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
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
                <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>District</label>
                <select
                  value={pendingDistrictFilter}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-sm transition-colors ${isLight
                    ? 'border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border border-slate-600 bg-slate-800/50 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
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
                <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Status</label>
                <select
                  value={pendingStatusFilter}
                  onChange={(e) => setPendingStatusFilter(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-sm transition-colors ${isLight
                    ? 'border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border border-slate-600 bg-slate-800/50 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
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
                <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Village</label>
                <select
                  value={pendingVillageFilter}
                  onChange={(e) => setPendingVillageFilter(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-sm transition-colors ${isLight
                    ? 'border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border border-slate-600 bg-slate-800/50 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
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
                <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Claim type</label>
                <select
                  value={pendingClaimTypeFilter ?? ""}
                  onChange={(e) => setPendingClaimTypeFilter(e.target.value || null)}
                  className={`w-full rounded-lg px-3 py-2 text-sm transition-colors ${isLight
                    ? 'border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border border-slate-600 bg-slate-800/50 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
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

              <div className="pt-2">
                <button
                  onClick={handleApplyFilters}
                  disabled={isApplyingFilters}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${isLight ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-900/30'}`}
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