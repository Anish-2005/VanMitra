"use client"

import React from "react"
import * as turf from '@turf/turf'
import Link from "next/link"

interface Props {
  open: boolean
  village?: string | null
  claims: any[]
  onClose: () => void
  onGoto?: (lng: number, lat: number) => void
}

export default function VillageClaimsPanel({ open, village, claims, onClose, onGoto }: Props) {
  if (!open) return null

  return (
    <div className="mb-6 bg-white rounded-xl shadow-md border border-green-100 p-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium">Claims in {village ?? "selected village"}</div>
          <div className="text-xs text-gray-500">Showing {claims.length} claim{claims.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-sm text-gray-600 px-2 py-1 border rounded">Close</button>
        </div>
      </div>

      <div className="max-h-64 overflow-auto">
        {claims.length === 0 ? (
          <div className="text-xs text-gray-500">No claims found for this village.</div>
        ) : (
          <ul className="space-y-2">
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
                <li key={id} className="p-2 rounded hover:bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <div className="font-medium">Claim {id}</div>
                      <div className="text-xs text-gray-600">{String(props?.claim_type ?? "").toUpperCase()} — {props?.land_area ?? "—"} ha</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lat !== undefined && lng !== undefined ? (
                        <>
                          <button
                            onClick={() => onGoto && onGoto(Number(lng), Number(lat))}
                            className="text-xs px-2 py-1 border rounded text-green-700"
                            aria-label={`Fly to claim ${id}`}
                          >
                            Fly
                          </button>
                          <button
                            onClick={() => onGoto && onGoto(Number(lng), Number(lat))}
                            className="text-xs px-2 py-1 border rounded text-green-700"
                            aria-label={`Locate claim ${id} on map`}
                          >
                            Locate
                          </button>
                        </>
                      ) : null}
                      <Link href={`/atlas/${encodeURIComponent(String(id))}`} className="text-xs px-2 py-1 border rounded text-blue-600">
                        Open
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
