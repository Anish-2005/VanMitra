"use client"

import React, { useEffect, useState } from "react"
import * as turf from '@turf/turf'
import Link from "next/link"
import { useTheme } from "./ThemeProvider"

interface Props {
  open: boolean
  village?: string | null
  claims: any[]
  onClose: () => void
  onGoto?: (lng: number, lat: number) => void
}

export default function VillageClaimsPanel({ open, village, claims, onClose, onGoto }: Props) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isLight = mounted && theme === 'light';

  if (!open) return null

  return (
    <div className={
      `mb-6 rounded-3xl shadow-2xl p-4 ${isLight ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-900/95 border border-emerald-700/50'}
      `
    }>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <div>
            <div className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Claims in {village ?? "selected village"}</div>
            <div className={`text-xs ${isLight ? 'text-slate-600' : 'text-emerald-300'}`}>Showing {claims.length} claim{claims.length !== 1 ? "s" : ""}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className={`p-2 rounded-2xl border transition-all duration-200 ${isLight ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'border-emerald-600 text-emerald-300 hover:bg-emerald-800/50'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className={`max-h-64 overflow-auto custom-scroll rounded-2xl ${isLight ? '' : ''}`}>
        {claims.length === 0 ? (
          <div className={`text-sm text-center py-8 ${isLight ? 'text-slate-600' : 'text-emerald-400'}`}>
            <div className={`${isLight ? 'w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3' : 'w-12 h-12 bg-emerald-800/50 rounded-2xl flex items-center justify-center mx-auto mb-3'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            No claims found for this village.
          </div>
        ) : (
          <ul className="space-y-3">
            {claims.map((c: any) => {
              const props = c.properties ?? c
              const id = props?.claim_id ?? props?.id ?? ""
              // Compute coordinates: prefer explicit lat/lng in properties, else centroid for polygons
              let lat: number | undefined = undefined
              let lng: number | undefined = undefined
              if (props?.lat !== undefined && props?.lng !== undefined) {
                lat = Number(props.lat)
                lng = Number(props.lng)
              } else if (c.geometry && c.geometry.type === 'Point') {
                lng = Number(c.geometry.coordinates[0])
                lat = Number(c.geometry.coordinates[1])
              } else if (c.geometry) {
                try {
                  const cent = turf.centroid(c)
                  if (cent && cent.geometry && cent.geometry.coordinates) {
                    lng = Number(cent.geometry.coordinates[0])
                    lat = Number(cent.geometry.coordinates[1])
                  }
                } catch (e) {
                  // ignore centroid errors
                }
              }

              return (
                <li key={id} className={`p-3 rounded-2xl transition-all duration-200 border ${isLight ? 'hover:bg-green-50 border-slate-200' : 'hover:bg-emerald-800/30 border-emerald-700/30'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="text-sm">
                        <div className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Claim {id}</div>
                        <div className={`text-xs ${isLight ? 'text-slate-600' : 'text-emerald-400'}`}>{String(props?.claim_type ?? "").toUpperCase()} — {props?.land_area ?? "—"} ha</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lat !== undefined && lng !== undefined ? (
                        <>
                          <button
                            onClick={() => onGoto && onGoto(Number(lng), Number(lat))}
                            className={`p-2 rounded-xl border transition-all duration-200 ${isLight ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'border-emerald-600 text-emerald-300 hover:bg-emerald-800/50'}`}
                            aria-label={`Fly to claim ${id}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onGoto && onGoto(Number(lng), Number(lat))}
                            className={`p-2 rounded-xl border transition-all duration-200 ${isLight ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'border-emerald-600 text-emerald-300 hover:bg-emerald-800/50'}`}
                            aria-label={`Locate claim ${id} on map`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </>
                      ) : null}
                      <Link href={`/atlas/${encodeURIComponent(String(id))}`} className={`p-2 rounded-xl border transition-all duration-200 ${isLight ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'border-emerald-600 text-emerald-300 hover:bg-emerald-800/50'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
