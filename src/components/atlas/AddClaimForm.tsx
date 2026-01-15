'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
import { useTheme } from '../ThemeProvider'

interface AddClaimFormProps {
  newClaim: {
    state_name: string
    district_name: string
    village_name: string
    claim_type: string
    claimant_name: string
    community_name: string
    claimed_area: number
  }
  setNewClaim: (claim: any) => void
  addClaimOpen: boolean
  setAddClaimOpen: (open: boolean) => void
  submittingClaim: boolean
  submitNewClaim: () => void
  goToVillageArea: () => void
  lastClickedCoords: [number, number] | null
  claimAreaCenter: [number, number] | null
  markerPlaced: boolean
  areaEntered: boolean
  stateOptions: string[]
  claimTypeOptions: string[]
  onAreaChange?: (area: number) => void
}

export function AddClaimForm({
  newClaim,
  setNewClaim,
  addClaimOpen,
  setAddClaimOpen,
  submittingClaim,
  submitNewClaim,
  goToVillageArea,
  lastClickedCoords,
  claimAreaCenter,
  markerPlaced,
  areaEntered,
  stateOptions,
  claimTypeOptions,
  onAreaChange
}: AddClaimFormProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <GlassCard className={`mb-4 overflow-hidden ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
      <div
        className={`flex items-center justify-between p-3 cursor-pointer rounded-lg ${isLight ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 hover:from-emerald-100 hover:to-green-100' : 'bg-gradient-to-r from-emerald-900/20 to-green-900/20 border border-emerald-800/30 hover:from-emerald-800/30 hover:to-green-800/30'}`}
        onClick={() => setAddClaimOpen(!addClaimOpen)}
      >
        <div className="flex items-center gap-2">
          <Plus size={16} className={isLight ? 'text-emerald-700' : 'text-emerald-400'} />
          <span className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Add Claim</span>
          <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>(manual entry)</span>
        </div>
        <div className={`transform transition-transform ${addClaimOpen ? "rotate-180" : ""} ${isLight ? 'text-slate-700' : 'text-white'}`}>▼</div>
      </div>

      <AnimatePresence>
        {addClaimOpen && (
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
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-green-300'}`}>State</label>
                  <select
                    value={newClaim.state_name}
                    onChange={(e) => {
                      const stateName = e.target.value
                      setNewClaim((s) => ({ ...s, state_name: stateName, district_name: "", village_name: "" }))
                    }}
                    className={`w-full rounded-lg border px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2 ${isLight
                      ? 'border-slate-300 bg-white text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm'
                      : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm focus:ring-emerald-400 focus:border-emerald-400'}`}
                  >
                    <option value="">Select State</option>
                    {(stateOptions.length ? stateOptions : []).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-green-300'}`}>District</label>
                  <input
                    type="text"
                    value={newClaim.district_name}
                    onChange={(e) => {
                      const districtName = e.target.value
                      setNewClaim((s) => ({ ...s, district_name: districtName, village_name: "" }))
                    }}
                    className={`w-full rounded-lg border px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-slate-400 ${isLight
                      ? 'border-slate-300 bg-white text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm'
                      : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm focus:ring-emerald-400 focus:border-emerald-400'}`}
                    placeholder="Enter district name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-green-300'}`}>Village</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newClaim.village_name}
                      onChange={(e) => setNewClaim((s) => ({ ...s, village_name: e.target.value }))}
                      className={`flex-1 rounded-lg border px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-slate-400 ${isLight
                        ? 'border-slate-300 bg-white text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm'
                        : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm focus:ring-emerald-400 focus:border-emerald-400'}`}
                      placeholder="Enter village name"
                    />
                    <button
                      onClick={goToVillageArea}
                      disabled={!newClaim.village_name || !newClaim.state_name}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${isLight ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/30'}`}
                      type="button"
                    >
                      Go to Area
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-green-300'}`}>Claim type</label>
                  <select
                    value={newClaim.claim_type}
                    onChange={(e) => setNewClaim((s) => ({ ...s, claim_type: e.target.value }))}
                    className={`w-full rounded-lg border px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2 ${isLight
                      ? 'border-slate-300 bg-white text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm'
                      : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm focus:ring-emerald-400 focus:border-emerald-400'}`}
                  >
                    <option value="">Select Claim Type</option>
                    {claimTypeOptions.length ? (
                      claimTypeOptions.map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="IFR">IFR</option>
                        <option value="CR">CR</option>
                        <option value="CFR">CFR</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-green-300'}`}>Claimed area (ha)</label>
                  <input
                    type="number"
                    value={newClaim.claimed_area}
                    onChange={(e) => {
                      const area = Number(e.target.value)
                      setNewClaim((s) => ({ ...s, claimed_area: area }))
                      onAreaChange?.(area)
                    }}
                    className={`w-full rounded-lg border px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-slate-400 ${isLight
                      ? 'border-slate-300 bg-white text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm'
                      : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm focus:ring-emerald-400 focus:border-emerald-400'}`}
                    placeholder="Enter area in hectares"
                  />
                </div>

                {lastClickedCoords && addClaimOpen && (
                  <div>
                    <label className={`block text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>Last Clicked Coordinates</label>
                    <div className={`mt-1 p-3 rounded-md ${isLight ? 'bg-slate-100 border border-slate-300' : 'bg-slate-700/50 border border-slate-600'}`}>
                      <div className={`text-sm font-mono ${isLight ? 'text-slate-800' : 'text-green-100'}`}>
                        <div><strong>Longitude:</strong> {lastClickedCoords[0].toFixed(6)}</div>
                        <div><strong>Latitude:</strong> {lastClickedCoords[1].toFixed(6)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {markerPlaced && claimAreaCenter && (
                  <div>
                    <label className={`block text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>Claim Center Coordinates</label>
                    <div className={`mt-1 p-3 rounded-md ${isLight ? 'bg-blue-100 border border-blue-300' : 'bg-blue-500/20 border border-blue-400/30'}`}>
                      <div className={`text-sm font-mono ${isLight ? 'text-blue-800' : 'text-blue-100'}`}>
                        <div><strong>Longitude:</strong> {claimAreaCenter[0].toFixed(6)}</div>
                        <div><strong>Latitude:</strong> {claimAreaCenter[1].toFixed(6)}</div>
                      </div>
                      <div className={`text-xs mt-1 ${isLight ? 'text-blue-600' : 'text-blue-300'}`}>
                        Drag the red marker on the map to change these coordinates
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-green-300'}`}>Claimant name</label>
                  <input
                    value={newClaim.claimant_name}
                    onChange={(e) => setNewClaim((s) => ({ ...s, claimant_name: e.target.value }))}
                    className={`w-full rounded-lg border px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-slate-400 ${isLight
                      ? 'border-slate-300 bg-white text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm'
                      : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm focus:ring-emerald-400 focus:border-emerald-400'}`}
                    placeholder="Enter claimant name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-green-300'}`}>Community name</label>
                  <input
                    value={newClaim.community_name}
                    onChange={(e) => setNewClaim((s) => ({ ...s, community_name: e.target.value }))}
                    className={`w-full rounded-lg border px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-slate-400 ${isLight
                      ? 'border-slate-300 bg-white text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm'
                      : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm focus:ring-emerald-400 focus:border-emerald-400'}`}
                    placeholder="Enter community name"
                  />
                </div>
              </div>

              {addClaimOpen && (
                <div className={`rounded-md p-3 ${isLight ? 'bg-yellow-100 border border-yellow-300' : 'bg-yellow-500/20 border border-yellow-400/30'}`}>
                  <p className={`text-sm ${isLight ? 'text-yellow-800' : 'text-yellow-200'}`}>
                    {!markerPlaced
                      ? "Click on the map to select a location for your claim."
                      : !areaEntered
                        ? "Location selected. Enter the claimed area to see the claim boundary."
                        : "Claim area is now visible on the map with a red marker. You can drag it to reposition."
                    }
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  disabled={submittingClaim || !newClaim.state_name || !newClaim.district_name || !newClaim.village_name || !newClaim.claim_type || !newClaim.claimed_area}
                  onClick={submitNewClaim}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${isLight ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-emerald-900/30'}`}
                >
                  {submittingClaim ? 'Submitting...' : 'Submit Claim'}
                </button>
                <button
                  onClick={() => {
                    setAddClaimOpen(false)
                    setNewClaim({ state_name: "", district_name: "", village_name: "", claim_type: "", claimant_name: "", community_name: "", claimed_area: 0 })
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isLight ? 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                >
                  Cancel
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}