"use client"

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect } from "react"
import { useTheme } from "@/components/ThemeProvider"
import * as turf from "@turf/turf"
import { STATES, DEFAULT_STATE } from "../../lib/regions"
import { motion, AnimatePresence } from "framer-motion"
import { Layers, Ruler, Download, MapPin, Copy, ZoomIn, FileDown, Plus } from "lucide-react"
import dynamicImport from "next/dynamic"
import DecorativeBackground from "@/components/ui/DecorativeBackground"
import Link from "next/link"
import WebGIS, { type WebGISRef as WebGISRefType } from "../../components/WebGIS"
import LayerManager from "../../components/LayerManager"
import Modal from "../../components/Modal"
import VillageClaimsPanel from "../../components/VillageClaimsPanel"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import type { GISLayer, GISMarker } from "../../components/WebGIS"
import { exportToGeoJSON } from "../../lib/gis-utils"
import type { GeoJSON } from "geojson"
import Navbar from "@/components/ui/Navbar"
import Footer from "@/components/ui/Footer"
import ThreeBackground from "@/components/ui/ThreeBackground"
import GlassCard from "@/components/ui/GlassCard"
import MagneticButton from "@/components/ui/MagneticButton"
import AnimatedCounter from "@/components/ui/AnimatedCounter"

// Client-only components to prevent hydration mismatches
const DecorativeElements = dynamicImport(() => import('@/components/ui/DecorativeElements'), { ssr: false })

export default function AtlasPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isLight = mounted && theme === 'light';

  const [layers, setLayers] = useState<GISLayer[]>([
    {
      id: "claims",
      name: "Claims",
      type: "geojson",
      url: "",
      visible: true,
      data: undefined,
      style: {
        fillColor: "#16a34a",
        strokeColor: "#15803d",
        strokeWidth: 2,
        opacity: 0.7,
      },
    },
    {
      id: "claim-area",
      name: "Claim Area",
      type: "geojson",
      url: "",
      visible: false,
      data: undefined,
      style: {
        fillColor: "#fbbf24",
        strokeColor: "#f59e0b",
        strokeWidth: 3,
        opacity: 0.6,
      },
    },
  ])

  const [markers, setMarkers] = useState<GISMarker[]>([])

  const [stateFilter, setStateFilter] = useState("all")
  const [districtFilter, setDistrictFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [claimTypeFilter, setClaimTypeFilter] = useState<string | null>(null)
  const [pendingStatusFilter, setPendingStatusFilter] = useState("all")
  const [pendingClaimTypeFilter, setPendingClaimTypeFilter] = useState<string | null>(null)
  const [loadingClaims, setLoadingClaims] = useState(false)
  const [toasts, setToasts] = useState<{ id: number; message: string; type?: "info" | "error" }[]>([])

  const [statusOptions, setStatusOptions] = useState<string[]>([])
  const [claimTypeOptions, setClaimTypeOptions] = useState<string[]>([])
  const [stateOptions, setStateOptions] = useState<string[]>([])
  const [districtOptionsByState, setDistrictOptionsByState] = useState<Record<string, string[]>>({})
  const [villageOptions, setVillageOptions] = useState<string[]>([])
  const [villageOptionsByState, setVillageOptionsByState] = useState<Record<string, string[]>>({})
  const [villageOptionsByStateAndDistrict, setVillageOptionsByStateAndDistrict] = useState<Record<string, Record<string, string[]>>>({})

  const claimTypeColors: Record<string, string> = {
    IFR: "#16a34a",
    CR: "#3b82f6",
    CFR: "#f59e0b",
  }

  // Toasts disabled — replace with no-op to avoid UI notifications during tests
  const pushToast = (_message: string, _type: "info" | "error" = "info") => { }
  const [mapKey, setMapKey] = useState(0) // Key to force WebGIS re-render
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)
  const [mapZoom, setMapZoom] = useState<number>(7.5)

  const [pendingStateFilter, setPendingStateFilter] = useState("all")
  const [pendingDistrictFilter, setPendingDistrictFilter] = useState("all")
  const [pendingVillageFilter, setPendingVillageFilter] = useState("all")
  const [isApplyingFilters, setIsApplyingFilters] = useState(false)
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  // Boundary layer toggles
  const [showStateBoundary, setShowStateBoundary] = useState(false)
  const [showDistrictBoundary, setShowDistrictBoundary] = useState(false)
  const [showTehsilBoundary, setShowTehsilBoundary] = useState(false)
  const [boundaryLayers, setBoundaryLayers] = useState<GISLayer[]>([])
  // Pending UI state for boundary toggles (Apply button will commit)
  const [pendingShowStateBoundary, setPendingShowStateBoundary] = useState(showStateBoundary)
  const [pendingShowDistrictBoundary, setPendingShowDistrictBoundary] = useState(showDistrictBoundary)
  const [pendingShowTehsilBoundary, setPendingShowTehsilBoundary] = useState(showTehsilBoundary)
  // simple counter to re-run loading effect when user applies
  const [applyCounter, setApplyCounter] = useState(0)

  const [villageFilter, setVillageFilter] = useState("all")

  // Job id to guard against stale async counting when clicking many boundaries
  const countJobRef = useRef(0)

  // If no specific state is selected, default to the project's default state (Madhya Pradesh)
  const effectiveState = stateFilter === "all" ? DEFAULT_STATE : stateFilter
  const stateCenter = STATES.find((s) => s.name === effectiveState)?.center ?? [78.9629, 22.9734]

  useEffect(() => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) => ({
        ...layer,
        url:
          layer.id === "fra-claims" || layer.id === "village-boundaries" || layer.id === "assets"
            ? (() => {
              const params = new URLSearchParams()
              if (stateFilter && stateFilter !== "all") params.set("state", stateFilter)
              if (districtFilter && districtFilter !== "all") params.set("district", districtFilter)
              const base =
                layer.id === "fra-claims"
                  ? "/api/atlas/fra"
                  : layer.id === "village-boundaries"
                    ? "/api/atlas/boundaries"
                    : "/api/atlas/assets"
              const qs = params.toString()
              return qs ? `${base}?${qs}` : base
            })()
            : layer.url,
      })),
    )
  }, [stateFilter, districtFilter])

  // Use a client-side URLSearchParams snapshot instead of next/navigation's
  // useSearchParams to avoid CSR-bailout / suspense errors during prerender.
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const readParams = () => {
      try {
        setSearchParams(new URLSearchParams(window.location.search))
      } catch (e) {
        setSearchParams(null)
      }
    }
    readParams()
    const onPop = () => readParams()
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  // Initialize pending + committed filters from URL search params (if present).
  // This allows the filters panel to reflect the querystring and for the
  // initial /api/claims request used to derive options to match the URL.
  useEffect(() => {
    try {
      const sp = searchParams
      const s = sp?.get("state") ?? stateFilter
      const d = sp?.get("district") ?? districtFilter
      const v = sp?.get("village") ?? villageFilter
      const st = sp?.get("status") ?? statusFilter ?? "all"
      const ct = sp?.get("claim_type") ?? (claimTypeFilter ?? null)

      setPendingStateFilter(s)
      setPendingDistrictFilter(d)
      setPendingVillageFilter(v)
      setPendingStatusFilter(st)
      setPendingClaimTypeFilter(ct ?? null)

      // Also commit the filters so the main claims fetch matches the URL on load
      setStateFilter(s)
      setDistrictFilter(d)
      setVillageFilter(v)
      setStatusFilter(st)
      setClaimTypeFilter(ct ?? null)
    } catch (e) {
      // noop
    }
    // Intentionally depend on searchParams so updates to the URL reflect in UI
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
      ; (async () => {
        try {
          // Build API URL using the current page's querystring so filter options
          // reflect the data present for the same URL that the user may have.
          const params = new URLSearchParams()
          // copy existing search params from the page
          try {
            if (searchParams) {
              for (const k of searchParams.keys()) {
                const v = searchParams.get(k)
                if (v) params.set(k, v)
              }
            }
          } catch (ee) {
            // fallback: ignore
          }
          if (!params.has("limit")) params.set("limit", "1000")
          // default status handling to 'all' if missing
          if (!params.has("status")) params.set("status", "all")
          const qs = params.toString() ? `?${params.toString()}` : ""
          const res = await fetch(`/api/claims${qs}`, { headers: { Accept: "application/json" } })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          const features =
            data && data.type === "FeatureCollection" && Array.isArray(data.features)
              ? data.features
              : Array.isArray(data)
                ? data
                : []

          const statesSet = new Set<string>()
          const districtsByState: Record<string, Set<string>> = {}
          const statusesSet = new Set<string>()
          const claimTypesSet = new Set<string>()
          const villagesByState: Record<string, Set<string>> = {}
          const villagesByStateAndDistrict: Record<string, Record<string, Set<string>>> = {}
          const villagesSet = new Set<string>()

          features.forEach((f: any) => {
            const props = f.properties || f
            const stateName = (props?.state ?? props?.state_name ?? "").toString()
            const districtName = (props?.district ?? props?.district_name ?? "").toString()
            const villageName = (props?.village ?? props?.village_name ?? props?.villageName ?? "").toString()
            const status = (props?.status ?? "").toString()
            const ctype = (props?.claim_type ?? props?.claimType ?? "").toString()

            if (stateName) {
              statesSet.add(stateName)
              if (!districtsByState[stateName]) districtsByState[stateName] = new Set()
              if (districtName) districtsByState[stateName].add(districtName)
              if (!villagesByState[stateName]) villagesByState[stateName] = new Set()
              if (villageName) villagesByState[stateName].add(villageName)

              if (!villagesByStateAndDistrict[stateName]) villagesByStateAndDistrict[stateName] = {}
              const byDistrict = villagesByStateAndDistrict[stateName]
              const dkey = districtName || "_unknown"
              if (!byDistrict[dkey]) byDistrict[dkey] = new Set()
              if (villageName) byDistrict[dkey].add(villageName)
            }
            if (villageName) villagesSet.add(villageName)
            if (status) {
              const s = status.toString().toLowerCase()
              statusesSet.add(s)
            }
            if (ctype) claimTypesSet.add(ctype.toUpperCase())
          })

          if (!cancelled) {
            const statesArr = Array.from(statesSet).sort((a, b) => a.localeCompare(b))
            setStateOptions(statesArr)
            const districtsObj: Record<string, string[]> = {}
            Object.entries(districtsByState).forEach(([s, set]) => {
              districtsObj[s] = Array.from(set).sort((a, b) => a.localeCompare(b))
            })
            setDistrictOptionsByState(districtsObj)

            const villagesObj: Record<string, string[]> = {}
            Object.entries(villagesByState).forEach(([s, set]) => {
              villagesObj[s] = Array.from(set).sort((a, b) => a.localeCompare(b))
            })
            setVillageOptionsByState(villagesObj)
            setVillageOptions(Array.from(villagesSet).sort((a, b) => a.localeCompare(b)))

            // build nested mapping state -> district -> villages
            const nested: Record<string, Record<string, string[]>> = {}
            Object.entries(villagesByStateAndDistrict).forEach(([s, districts]) => {
              nested[s] = {}
              Object.entries(districts).forEach(([d, set]) => {
                nested[s][d] = Array.from(set).sort((a, b) => a.localeCompare(b))
              })
            })
            setVillageOptionsByStateAndDistrict(nested)
            // Always replace option lists with values derived from API so the
            // filters panel shows options present in the current API response
            setStatusOptions(Array.from(statusesSet))
            setClaimTypeOptions(Array.from(claimTypesSet))
          }
        } catch (err) {
          console.warn("Could not derive filter options from API:", err)
        }
      })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const fetchClaims = async () => {
      try {
        setLoadingClaims(true)
        const params = new URLSearchParams()
        if (stateFilter && stateFilter !== "all") params.set("state", stateFilter)
        if (districtFilter && districtFilter !== "all") params.set("district", districtFilter)
        if (villageFilter && villageFilter !== "all") params.set("village", villageFilter)
        if (statusFilter === "" || statusFilter === "all") {
          params.set("status", "all")
        } else if (statusFilter) {
          params.set("status", statusFilter)
        }
        if (claimTypeFilter) params.set("claim_type", claimTypeFilter ?? "")

        const url = `/api/claims?${params.toString()}`
        const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        const features: any[] = []
        const newMarkers: any[] = []

        // If the API returns a FeatureCollection
        if (data && data.type === "FeatureCollection" && Array.isArray(data.features)) {
          data.features.forEach((f: any, idx: number) => {
            // ensure geometry is valid
            if (f.geometry) {
              features.push(f)
              // For polygon geometries, compute an accurate centroid with turf
              try {
                if (f.geometry.type === "Point") {
                  const [lng, lat] = f.geometry.coordinates
                  const pid = String(f.properties?.claim_id ?? f.properties?.id ?? `claim-${idx}`)
                  const ppopup = `<div style="min-width:160px;font-size:13px"><strong>Claim ${pid}</strong><div>Type: ${String(f.properties?.claim_type ?? "")}</div><div>Area: ${String(f.properties?.land_area ?? f.properties?.area ?? "")} ha</div><div style="margin-top:6px"><a href=\"/atlas/${encodeURIComponent(pid)}\" style=\"color:#0b78ff; text-decoration:none;\">View details</a></div></div>`
                  // determine marker size (points remain small by default)
                  const areaVal = Number(f.properties?.land_area ?? f.properties?.area ?? 0)
                  const size = areaVal > 0 ? Math.max(6, Math.min(18, Math.sqrt(areaVal) * 2)) : 8
                  newMarkers.push({
                    id: pid,
                    lng,
                    lat,
                    label: String(f.properties?.community_name ?? f.properties?.claim_id ?? f.properties?.id ?? ""),
                    color: "#16a34a",
                    popup: ppopup,
                    raw: f.properties,
                    size,
                  })
                } else if (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon") {
                  const centroid = turf.centroid(f)
                  if (centroid && centroid.geometry && centroid.geometry.coordinates) {
                    const [lng, lat] = centroid.geometry.coordinates
                    const pid = String(f.properties?.claim_id ?? f.properties?.id ?? `claim-${idx}`)
                    const ppopup = `<div style="min-width:160px;font-size:13px"><strong>Claim ${pid}</strong><div>Type: ${String(f.properties?.claim_type ?? "")}</div><div>Area: ${String(f.properties?.land_area ?? f.properties?.area ?? "")} ha</div><div style="margin-top:6px"><a href=\"/atlas/${encodeURIComponent(pid)}\" style=\"color:#0b78ff; text-decoration:none;\">View details</a></div></div>`
                    // compute visible marker size from area; use turf.area if land_area missing
                    let areaVal = Number(f.properties?.land_area ?? f.properties?.area ?? 0)
                    if (!areaVal || areaVal === 0) {
                      try {
                        areaVal = turf.area(f) / 10000
                      } catch (ee) {
                        areaVal = 0
                      }
                    }
                    // areaVal in hectares; for very small areas, increase marker size for visibility
                    let size = 10 // default
                    if (areaVal > 0) {
                      // scale: tiny (<0.1ha) => larger marker; large areas => small marker
                      if (areaVal < 0.1) size = 20
                      else if (areaVal < 0.5) size = 16
                      else if (areaVal < 2) size = 12
                      else size = 8
                    } else {
                      size = 14 // unknown area fallback
                    }
                    // high-contrast outline color for tiny markers
                    const outline = areaVal < 0.5 ? "#000000" : "#ffffff"
                    newMarkers.push({
                      id: pid,
                      lng,
                      lat,
                      label: String(f.properties?.community_name ?? f.properties?.claim_id ?? f.properties?.id ?? ""),
                      color: "#16a34a",
                      popup: ppopup,
                      raw: f.properties,
                      size,
                      outline,
                    })
                  }
                }
              } catch (e) {
                // fallback to safe centroid calculation
                try {
                  const coords =
                    f.geometry.type === "Polygon" ? f.geometry.coordinates[0] : f.geometry.coordinates[0][0]
                  let sx = 0,
                    sy = 0,
                    count = 0
                  coords.forEach((c: any) => {
                    sx += c[0]
                    sy += c[1]
                    count++
                  })
                  if (count) {
                    const lng = sx / count
                    const lat = sy / count
                    newMarkers.push({
                      id: String(f.properties?.claim_id ?? f.properties?.id ?? `claim-${idx}`),
                      lng,
                      lat,
                      label: String(f.properties?.community_name ?? f.properties?.claim_id ?? f.properties?.id ?? ""),
                      color: "#16a34a",
                      popup: f.properties,
                      raw: f.properties,
                    })
                  }
                } catch (ee) {
                  // ignore centroid errors
                }
              }
            }
          })
        } else if (Array.isArray(data)) {
          // older API shape: array of plain objects
          data.forEach((item: any, idx: number) => {
            let geom = item.geometry
            if (!geom && (item.lat !== undefined || item.lng !== undefined)) {
              geom = { type: "Point", coordinates: [Number(item.lng), Number(item.lat)] }
            }
            if (geom) {
              features.push({ type: "Feature", properties: item, geometry: geom })
              if (geom.type === "Point") {
                newMarkers.push({
                  id: String(item.claim_id ?? item.id ?? `claim-${idx}`),
                  lng: geom.coordinates[0],
                  lat: geom.coordinates[1],
                  label: String(item.community_name ?? item.claim_id ?? item.id ?? ""),
                  color: "#16a34a",
                  popup: item,
                  raw: item,
                })
              }
            }
          })
        } else if (data && data.id) {
          const item = data
          const geom =
            item.geometry ??
            (item.lat && item.lng ? { type: "Point", coordinates: [Number(item.lng), Number(item.lat)] } : null)
          if (geom) {
            features.push({ type: "Feature", properties: item, geometry: geom })
            if (geom.type === "Point")
              newMarkers.push({
                id: String(item.claim_id ?? item.id),
                lng: geom.coordinates[0],
                lat: geom.coordinates[1],
                label: String(item.community_name ?? item.claim_id ?? item.id),
                color: "#16a34a",
                popup: item,
                raw: item,
              })
          }
        }

        // Build layers grouped by claim_type so polygons are styled by type
        const types = Array.from(
          new Set(features.map((f) => String(f.properties?.claim_type ?? "unknown").toUpperCase())),
        )
        // For each claim type, create both a polygon layer (areas) and a centroid point layer
        const newLayers: GISLayer[] = types.flatMap((t) => {
          const typeFeatures = features.filter(
            (f) => String(f.properties?.claim_type ?? "unknown").toUpperCase() === t,
          )

          const areaLayer: GISLayer = {
            id: `claims-${t.toLowerCase()}`,
            name: `Claims — ${t}`,
            type: "geojson",
            url: "",
            visible: true,
            data: { type: "FeatureCollection", features: typeFeatures },
            style: {
              fillColor: claimTypeColors[t] ?? "#60a5fa",
              strokeColor: claimTypeColors[t] ?? "#2563eb",
              strokeWidth: 3,
              opacity: 0.65,
            },
          }
          return [areaLayer]
        })

        // increase fill opacity slightly for better visibility
        const adjustedLayers = newLayers.length
          ? newLayers
          : [
            {
              id: "claims",
              name: "Claims",
              type: "geojson",
              url: "",
              visible: true,
              data: { type: "FeatureCollection", features },
              style: { fillColor: "#16a34a", strokeColor: "#15803d", strokeWidth: 2, opacity: 0.6 },
            },
          ]
        adjustedLayers.forEach((l: any) => {
          l.style.opacity = l.style.opacity ?? 0.6
        })
        setLayers(adjustedLayers as GISLayer[])
        setMarkers(
          newMarkers.map((m) => ({
            ...m,
            color: claimTypeColors[(m.raw?.claim_type ?? m.raw?.claimType ?? "").toUpperCase()] ?? "#16a34a",
          })),
        )
        if (!features.length) pushToast("No claims found for selected filters", "info")

        // populate filter options
        const statuses = Array.from(
          new Set(
            features.map((f) => {
              const s = String((f.properties?.status ?? "").toString()).toLowerCase()
              return s === "any" ? "all" : s
            }),
          ),
        ).filter(Boolean)
        const claimTypes = Array.from(
          new Set(features.map((f) => String((f.properties?.claim_type ?? "").toString()).toUpperCase())),
        ).filter(Boolean)
        setStatusOptions(statuses)
        setClaimTypeOptions(claimTypes)

        // auto-center map to features bbox for better visibility
        try {
          if (features.length) {
            const fc: GeoJSON.FeatureCollection = { type: "FeatureCollection", features } as any
            const bbox = turf.bbox(fc) // [minX, minY, maxX, maxY]
            const centerLng = (bbox[0] + bbox[2]) / 2
            const centerLat = (bbox[1] + bbox[3]) / 2
            setMapCenter([centerLng, centerLat])
            // compute an approximate zoom based on bbox size
            const lngSpan = Math.abs(bbox[2] - bbox[0])
            const latSpan = Math.abs(bbox[3] - bbox[1])
            const span = Math.max(lngSpan, latSpan)
            let z = 6
            if (span < 0.02) z = 14
            else if (span < 0.1) z = 12
            else if (span < 0.5) z = 10
            else if (span < 2) z = 8
            else z = 6
            setMapZoom(z)
          }
        } catch (e) {
          // ignore centering errors
        }
      } catch (err) {
        if ((err as any).name === "AbortError") return
        console.error("Failed to fetch claims", err)
        pushToast("Failed to fetch claims", "error")
      } finally {
        setLoadingClaims(false)
      }
    }
    fetchClaims()
    return () => controller.abort()
  }, [stateFilter, districtFilter, statusFilter, claimTypeFilter, villageFilter])

  // Effect to handle boundary layer loading
  useEffect(() => {
    const loadBoundaryLayers = async () => {
      const newBoundaryLayers: GISLayer[] = []

      // Use the committed (live) values when loading
      if (showStateBoundary) {
        try {
          const response = await fetch("/api/atlas/boundaries?level=state&state=Madhya Pradesh")
          const data = await response.json()
          if (data.features && data.features.length > 0) {
            newBoundaryLayers.push({
              id: "state-boundary",
              name: "State Boundary",
              type: "geojson",
              url: "",
              visible: true,
              data: data,
              style: {
                fillColor: "transparent",
                strokeColor: "#dc2626",
                strokeWidth: 3,
                opacity: 1,
              },
            })
          }
        } catch (error) {
          console.error("Failed to load state boundary:", error)
        }
      }


      if (showDistrictBoundary) {
        try {
          const response = await fetch("/api/atlas/boundaries?level=district&state=Madhya Pradesh")
          const data = await response.json()
          if (data.features && data.features.length > 0) {
            newBoundaryLayers.push({
              id: "district-boundary",
              name: "District Boundaries",
              type: "geojson",
              url: "",
              visible: true,
              data: data,
              style: {
                fillColor: "transparent",
                strokeColor: "#2563eb",
                strokeWidth: 2,
                opacity: 1,
              },
            })
          }
        } catch (error) {
          console.error("Failed to load district boundaries:", error)
        }
      }


      if (showTehsilBoundary) {
        try {
          const response = await fetch("/api/atlas/boundaries?level=tehsil&state=Madhya Pradesh")
          const data = await response.json()
          if (data.features && data.features.length > 0) {
            newBoundaryLayers.push({
              id: "tehsil-boundary",
              name: "Tehsil Boundaries",
              type: "geojson",
              url: "",
              visible: true,
              data: data,
              style: {
                fillColor: "transparent",
                strokeColor: "#16a34a",
                strokeWidth: 1,
                opacity: 1,
              },
            })
          }
        } catch (error) {
          console.error("Failed to load tehsil boundaries:", error)
        }
      }

      setBoundaryLayers(newBoundaryLayers)
    }

    loadBoundaryLayers()
    // applyCounter allows manual re-run when user clicks Apply
  }, [showStateBoundary, showDistrictBoundary, showTehsilBoundary, applyCounter])

  const handleStateChange = (newState: string) => {
    setPendingStateFilter(newState)
    const stateData = STATES.find((s) => s.name === newState)
    if (stateData && stateData.districts.length > 0) {
      setPendingDistrictFilter(stateData.districts[0])
    }
  }

  const handleDistrictChange = (newDistrict: string) => {
    setPendingDistrictFilter(newDistrict)
  }

  const handleApplyFilters = () => {
    setIsApplyingFilters(true)
    setStateFilter(pendingStateFilter)
    setDistrictFilter(pendingDistrictFilter)
    // apply pending filters
    setStatusFilter(pendingStatusFilter ?? "all")
    setClaimTypeFilter(pendingClaimTypeFilter ?? null)

    // Update URL search params so current filter selection is reflected in the URL
    try {
      const params = new URLSearchParams()
      if (pendingStateFilter && pendingStateFilter !== "all") params.set("state", pendingStateFilter)
      if (pendingDistrictFilter && pendingDistrictFilter !== "all") params.set("district", pendingDistrictFilter)
      if (pendingVillageFilter && pendingVillageFilter !== "all") params.set("village", pendingVillageFilter)
      if (pendingStatusFilter && pendingStatusFilter !== "all") params.set("status", pendingStatusFilter)
      if (pendingClaimTypeFilter) params.set("claim_type", pendingClaimTypeFilter)
      const qs = params.toString() ? `?${params.toString()}` : ""
      router.push(`/atlas${qs}`)
    } catch (e) {
      // ignore navigation errors
    }

    // Reset loading state after a short delay
    setTimeout(() => setIsApplyingFilters(false), 1000)
  }

  const [selectedFeature, setSelectedFeature] = useState<{
    layer: string
    feature: any
    lngLat: any
    properties?: any
  } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()

  const [isMeasuring, setIsMeasuring] = useState(false)
  const [measurementDistance, setMeasurementDistance] = useState<number | null>(null)

  const webGISRef = useRef<WebGISRefType>(null)

  // Extract a robust boundary label from feature properties. Hoisted to component scope
  // so multiple UI paths can reuse it (feature click, previews, modals).
  const getBoundaryLabel = (p: any) => {
    if (!p) return undefined
    const keys = [
      'tehsil',
      'TEHSIL',
      'tehsil_name',
      'TEHSIL_NM',
      'subdistrict',
      'SUBDIST',
      'NAME_2',
      'name',
      'NAME',
      'NAME_1',
      'NAME_0',
      'ST_NM',
      'state',
      'district',
      'DISTRICT',
      'state_name',
      'STATE_NAME',
      'name_en',
      'name_local',
      'label',
    ]
    for (const k of keys) {
      const v = p?.[k]
      if (v && typeof v === 'string' && v.trim().length) {
        const candidate = v.trim()
        // If the candidate equals a known state name and this feature has a state-like prop,
        // avoid returning the state as the tehsil/district label. Use STATES list for comparison.
        const isStateName = STATES.some((s) => s.name.toLowerCase() === candidate.toLowerCase())
        if (isStateName) continue
        return candidate
      }
    }
    for (const [k, v] of Object.entries(p || {})) {
      if (typeof v === 'string' && v.trim().length && k.toLowerCase().includes('tehsil')) {
        const cand = v.trim()
        if (!STATES.some((s) => s.name.toLowerCase() === cand.toLowerCase())) return cand
      }
      if (typeof v === 'string' && v.trim().length && k.toLowerCase().includes('name')) {
        const cand = v.trim()
        if (!STATES.some((s) => s.name.toLowerCase() === cand.toLowerCase())) return cand
      }
    }
    return undefined
  }

  // Small display helpers
  const formatNumber = (v: any) => {
    if (v === null || typeof v === 'undefined' || v === '') return '—'
    const n = Number(v)
    if (Number.isNaN(n)) return String(v)
    // show two decimals for fractional values, otherwise no decimals
    const options: Intl.NumberFormatOptions = Math.abs(n) < 1 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 2 }
    try {
      return new Intl.NumberFormat(undefined, options).format(n)
    } catch (e) {
      return n.toFixed(2)
    }
  }

  const formatArea = (ha: any) => {
    if (ha === null || typeof ha === 'undefined' || ha === '') return '—'
    const n = Number(ha)
    if (Number.isNaN(n)) return String(ha)
    const haFmt = formatNumber(n) + ' ha'
    const km2 = n * 0.01
    const km2Fmt = formatNumber(km2) + ' km²'
    return `${haFmt} (${km2Fmt})`
  }

  const humanizeKey = (k: string) => {
    if (!k) return k
    const map: Record<string, string> = {
      STNAME: 'State',
      STNAME_SH: 'State (short)',
      STCODE11: 'State code',
      stname: 'State',
      stcode11: 'State code',
      dtname: 'District',
      dtcode11: 'District code',
      sdtname: 'Tehsil',
      sdtcode11: 'Tehsil code',
      Shape_Area: 'Shape area (raw)',
      Shape_Length: 'Shape length (raw)',
      OBJECTID: 'Object ID',
      _label: 'Label',
      _area_ha: 'Area (ha)',
      _counting: 'Counting',
      claims_count: 'Claims inside',
    }
    if (map[k]) return map[k]
    // fallback: replace underscores and camelcase -> Title Case
    const s = k.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
    return s
      .split(' ')
      .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toUpperCase()))
      .join(' ')
  }

  const friendlyLevel = (raw: string) => {
    if (!raw) return 'Boundary'
    const r = String(raw).toLowerCase()
    if (r.includes('state')) return 'State boundary'
    if (r.includes('district')) return 'District boundary'
    if (r.includes('tehsil') || r.includes('subdist') || r.includes('subdistrict')) return 'Tehsil boundary'
    // fall back to cleaned-up string
    return r.replace(/-/g, ' ')
  }

  // Village claims panel state
  const [villagePanelOpen, setVillagePanelOpen] = useState(false)
  const [villageClaims, setVillageClaims] = useState<any[]>([])
  const [villageNameSelected, setVillageNameSelected] = useState<string | null>(null)
  const [searchVillageUid, setSearchVillageUid] = useState<string | number | null>(null)
  const [searchStatus, setSearchStatus] = useState<string | null>("all")
  const [searchClaimType, setSearchClaimType] = useState<string | null>(null)
  const [searchByUidExpanded, setSearchByUidExpanded] = useState<boolean>(false)
  // layer to show results from search-by-village-uid
  const [searchResultsLayer, setSearchResultsLayer] = useState<any | null>(null)
  const [searchLoading, setSearchLoading] = useState<boolean>(false)

  const handleLayerToggle = (layerId: string) => {
    setLayers((prev) => prev.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer)))
  }

  const runSearchByVillageUid = async () => {
    if (!searchVillageUid) {
      pushToast("Enter a village UID to search", "error")
      return
    }
    // clear previous results
    setSearchResultsLayer(null)
    const vid = String(searchVillageUid).trim()
    setVillagePanelOpen(true)
    setVillageClaims([])
    setSearchLoading(true)
    try {
      const q = new URLSearchParams()
      if (searchStatus && searchStatus !== "all") q.set("status", searchStatus)
      if (searchClaimType) q.set("claim_type", searchClaimType)
      const qs = q.toString() ? `?${q.toString()}` : ""

      // Try local API endpoints for UID lookup. Prefer the explicit village/:vid route
      // which is the most authoritative mapping on the server. Other shapes are fallbacks.
      const tryUrls = [
        `/api/claims/village/${encodeURIComponent(vid)}${qs}`,
        `/api/claims?village_uid=${encodeURIComponent(vid)}${qs ? `&${q.toString()}` : ""}`,
        `/api/claims?village=${encodeURIComponent(vid)}${qs ? `&${q.toString()}` : ""}`,
      ]

      let data: any = null
      let lastErr: any = null
      let usedUrl: string | null = null
      for (const u of tryUrls) {
        try {
          console.debug("Searching village via:", u)
          const res = await fetch(u)
          if (!res.ok) {
            lastErr = `HTTP ${res.status} for ${u}`
            continue
          }
          data = await res.json()
          usedUrl = u
          break
        } catch (e) {
          lastErr = e
          continue
        }
      }

      if (!data) {
        console.error("Village search failed (no data). Last error:", lastErr)
        pushToast(`Village search failed: ${String(lastErr)}`, "error")
        return
      }

      const features = data && data.type === "FeatureCollection" ? data.features || [] : Array.isArray(data) ? data : []

      if (!features.length) {
        pushToast("No claims found for this village UID", "info")
        setSearchLoading(false)
        return
      }

      // Derive village label by majority vote across candidate fields in returned features
      const candidateKeys = [
        'village_name',
        'village',
        'VILLAGE',
        'villageName',
        'habitation',
        'settlement',
        'locality',
        'habitation_name',
        'name',
      ]

      const normalize = (s: any) => (s === null || typeof s === 'undefined' ? '' : String(s).trim())
      const counts = new Map<string, number>()
      const rawSamples: any[] = []
      features.forEach((f: any, idx: number) => {
        const props = f?.properties ?? f
        if (idx < 3) rawSamples.push(props)
        for (const k of candidateKeys) {
          const val = props?.[k]
          if (val) {
            const n = normalize(val)
            if (!n) continue
            counts.set(n, (counts.get(n) || 0) + 1)
          }
        }
        // also consider any string-like property as fallback
        Object.values(props || {}).forEach((v: any) => {
          if (typeof v === 'string' && v.trim().length > 0) {
            const n = normalize(v)
            counts.set(n, (counts.get(n) || 0) + 1)
          }
        })
      })

      let villageLabel: string | null = null
      if (counts.size) {
        // pick the most common non-empty normalized label
        const sorted = Array.from(counts.entries()).filter(([k]) => k).sort((a, b) => b[1] - a[1])
        if (sorted.length) villageLabel = sorted[0][0]
      }

      setVillageNameSelected(villageLabel ? villageLabel : `Village UID: ${vid}`)

      // Debug helper: show which URL returned results and which claim IDs are present
      try {
        const ids = features
          .map((f: any) => (f?.properties?.claim_id ?? f?.properties?.id ?? null))
          .filter(Boolean)
          .slice(0, 10)
          .join(", ")
        pushToast(
          `UID ${vid} → ${villageLabel ?? 'unknown'} (claims: ${ids || 'none'}) via ${usedUrl || 'unknown'} — sample: ${JSON.stringify(rawSamples)}`,
          "info",
        )
      } catch (e) {
        // ignore toast errors
      }

      // Create search result layer and center map on combined centroid
      try {
        const layer = {
          id: `search-results-${Date.now()}`,
          name: `Search results for ${villageLabel ? villageLabel : vid}`,
          type: 'geojson',
          url: '',
          visible: true,
          data: { type: 'FeatureCollection', features },
          style: { fillColor: '#ff8c00', strokeColor: '#ff8c00', strokeWidth: 2, opacity: 0.35 },
        }
        setSearchResultsLayer(layer)

        const fc: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features } as any
        const cent = turf.centroid(fc)
        if (cent && cent.geometry && cent.geometry.coordinates) {
          const [lng, lat] = cent.geometry.coordinates
          webGISRef.current?.flyTo?.(lng, lat, 12)
        }
      } catch (e) {
        // ignore
      }

      // Populate village claims (dedupe by claim id)
      const byId = new Map<string, any>()
      features.forEach((f: any, idx: number) => {
        const pid = String((f.properties && (f.properties.claim_id || f.properties.id)) ?? f.id ?? `uid-${vid}-${idx}`)
        if (!byId.has(pid)) byId.set(pid, f)
      })
      setVillageClaims(Array.from(byId.values()))
    } catch (err) {
      console.error("Village search error:", err)
      pushToast("Village search failed", "error")
    } finally {
      setSearchLoading(false)
    }
  }

  const handleLayerRemove = (layerId: string) => {
    setLayers((prev) => prev.filter((layer) => layer.id !== layerId))
  }

  const handleLayerUpdate = (layerId: string, updates: Partial<GISLayer>) => {
    setLayers((prev) => prev.map((layer) => (layer.id === layerId ? { ...layer, ...updates } : layer)))
  }

  const handleMarkerUpdate = (markerId: string, updates: Partial<GISMarker>) => {
    setMarkers((prev) => prev.map((marker) => (marker.id === markerId ? { ...marker, ...updates } : marker)))
  }

  const handleFeatureClick = (featureInfo: { layer: string; feature: any; lngLat: any }) => {
    // If placing marker, don't show modal for other features
    if (addClaimOpen && areaEntered && !markerPlaced) {
      return
    }

    // Handle claim area dragging
    if (featureInfo.layer === "claim-area" && addClaimOpen) {
      setIsDraggingArea(true)
      pushToast("Dragging claim area - drag to move it to a new location", "info")
      return
    }

    // If a boundary layer was clicked, compute area and (for tehsil) claims count
    const { layer, feature, lngLat } = featureInfo as any
    const props = feature?.properties || {}



    const isBoundary = String(layer?.id ?? layer?.name ?? "").toLowerCase().includes("boundary") ||
      String(props?.level ?? "").toLowerCase().includes("state") ||
      String(props?.level ?? "").toLowerCase().includes("district") ||
      String(props?.level ?? "").toLowerCase().includes("tehsil")

    if (isBoundary) {
      // compute area using turf (m^2 -> convert to hectares)
      let areaHa: number | null = null
      try {
        const geom = feature.geometry ?? feature
        const areaSqM = turf.area(geom)
        areaHa = areaSqM / 10000
      } catch (e) {
        areaHa = null
      }

      // default label (try multiple common property names)
      const label = getBoundaryLabel(props) ?? "Boundary"

      // For boundary layers, compute number of claims inside it
      const level = (props?.level || layer?.id || layer?.name || "").toString().toLowerCase()
      const isBoundaryWithClaims = level.includes("state") || level.includes("district") || level.includes("tehsil") ||
        String(props?.type ?? "").toLowerCase().includes("state") ||
        String(props?.type ?? "").toLowerCase().includes("district") ||
        String(props?.type ?? "").toLowerCase().includes("tehsil")

      const boundaryFeature = {
        layer: layer?.id || layer?.name || "boundary",
        feature,
        lngLat,
        properties: {
          ...props,
          _label: label,
          _area_ha: areaHa,
        },
      }

      setSelectedFeature(boundaryFeature)
      setModalOpen(true)

      if (isBoundaryWithClaims) {
        ; (async () => {
          // increment job id for this counting task
          const job = ++countJobRef.current
          try {
            // show counting state in modal and attach job id
            setSelectedFeature((prev) => (prev ? { ...prev, properties: { ...prev.properties, _counting: true, _countJob: job } } : prev))

            // Ask the server to count claims intersecting this boundary geometry
            const geom = feature.type === 'Feature' ? feature.geometry : feature
            const res = await fetch('/api/claims/count', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ geometry: geom })
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const body = await res.json()
            const count = Number(body?.count ?? 0)

            // Apply results if still latest job
            if (job === countJobRef.current) {
              setSelectedFeature((prev) => (prev ? { ...prev, properties: { ...prev.properties, claims_count: count, _counting: false } } : prev))
            }
          } catch (err) {
            console.warn("Failed to count claims for boundary:", err)
            // Only clear counting flag if this job is still the latest
            if (job === countJobRef.current) {
              setSelectedFeature((prev) => (prev ? { ...prev, properties: { ...prev.properties, _counting: false } } : prev))
            }
          }
        })()
      }
      return
    }

    // default behavior for non-boundary features (claims)
    setSelectedFeature({ ...featureInfo, properties: featureInfo.feature?.properties })
    setModalOpen(true)
  }

  // open panel with claims for a village; try API fetch first, else filter in-memory
  const onVillageClick = async (villageName?: string | null) => {
    if (!villageName) return
    setVillageNameSelected(villageName)
    setVillagePanelOpen(true)
    setVillageClaims([])

    try {
      const st = stateFilter === "all" ? DEFAULT_STATE : stateFilter
      const q = new URLSearchParams()
      q.set("village", villageName)
      q.set("state", st)
      q.set("limit", "1000")
      const res = await fetch(`/api/claims?${q.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const features = data && data.type === "FeatureCollection" ? data.features || [] : Array.isArray(data) ? data : []
        // filter API results defensively by village
        const villageLower = String(villageName).toLowerCase().trim()
        const keys = ["village", "VILLAGE", "village_name", "villageName", "habitation", "settlement", "locality", "habitation_name"]
        const normalize = (v: any) => (v === null || typeof v === "undefined" ? "" : String(v).toLowerCase().trim())
        const matchesVillage = (f: any) => {
          const props = f?.properties ?? f
          if (!props) return false
          for (const k of keys) {
            if (props[k] && normalize(props[k]) === villageLower) return true
          }
          // fallback: sometimes village stored in other fields
          const allVals = Object.values(props || {})
          for (const val of allVals) {
            if (typeof val === "string" && normalize(val) === villageLower) return true
          }
          return false
        }

        const filtered = Array.isArray(features) ? features.filter(matchesVillage) : []
        // dedupe by claim id
        const byId = new Map<string, any>()
        filtered.forEach((f: any) => {
          const pid = String((f.properties && (f.properties.claim_id || f.properties.id)) ?? f.id ?? Math.random())
          if (!byId.has(pid)) byId.set(pid, f)
        })
        setVillageClaims(Array.from(byId.values()))
        return
      }
    } catch (err) {
      // ignore and fallback to in-memory
    }

    // Fallback: filter already loaded layers for features with matching village
    const villageLower = String(villageName).toLowerCase().trim()
    const keys = ["village", "VILLAGE", "village_name", "villageName", "habitation", "settlement", "locality", "habitation_name"]
    const normalize = (v: any) => (v === null || typeof v === "undefined" ? "" : String(v).toLowerCase().trim())
    const matchesVillage = (f: any) => {
      const props = f?.properties ?? f
      if (!props) return false
      for (const k of keys) {
        if (props[k] && normalize(props[k]) === villageLower) return true
      }
      const allVals = Object.values(props || {})
      for (const val of allVals) {
        if (typeof val === "string" && normalize(val) === villageLower) return true
      }
      return false
    }

    const allFeatures: any[] = []
    layers.forEach((l) => {
      if (l.data?.features) allFeatures.push(...l.data.features)
    })
    // Include markers raw props as additional items
    markers.forEach((m) => {
      const mr = m as any
      if (mr?.raw) {
        allFeatures.push({ type: "Feature", properties: mr.raw, geometry: mr.geometry ?? (mr.lng && mr.lat ? { type: "Point", coordinates: [mr.lng, mr.lat] } : undefined) })
      }
    })

    const matches = allFeatures.filter(matchesVillage)
    // dedupe by id
    const byId = new Map<string, any>()
    matches.forEach((f: any) => {
      const pid = String((f.properties && (f.properties.claim_id || f.properties.id)) ?? f.id ?? Math.random())
      if (!byId.has(pid)) byId.set(pid, f)
    })
    setVillageClaims(Array.from(byId.values()))
  }

  // open panel filtered by district (same UI as village panel)
  const onDistrictClick = async (districtName?: string | null) => {
    if (!districtName) return
    setVillageNameSelected(districtName)
    setVillagePanelOpen(true)
    setVillageClaims([])

    try {
      const st = stateFilter === "all" ? DEFAULT_STATE : stateFilter
      const q = new URLSearchParams()
      q.set("district", districtName)
      q.set("state", st)
      q.set("limit", "1000")
      const res = await fetch(`/api/claims?${q.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const features = data && data.type === "FeatureCollection" ? data.features || [] : Array.isArray(data) ? data : []
        const districtLower = String(districtName).toLowerCase().trim()
        const keys = ["district", "DISTRICT", "district_name", "districtName"]
        const normalize = (v: any) => (v === null || typeof v === "undefined" ? "" : String(v).toLowerCase().trim())
        const matchesDistrict = (f: any) => {
          const props = f?.properties ?? f
          if (!props) return false
          for (const k of keys) {
            if (props[k] && normalize(props[k]) === districtLower) return true
          }
          const allVals = Object.values(props || {})
          for (const val of allVals) {
            if (typeof val === "string" && normalize(val) === districtLower) return true
          }
          return false
        }

        const filtered = Array.isArray(features) ? features.filter(matchesDistrict) : []
        const byId = new Map<string, any>()
        filtered.forEach((f: any) => {
          const pid = String((f.properties && (f.properties.claim_id || f.properties.id)) ?? f.id ?? Math.random())
          if (!byId.has(pid)) byId.set(pid, f)
        })
        setVillageClaims(Array.from(byId.values()))
        return
      }
    } catch (err) {
      // ignore and fallback
    }

    // fallback: filter in-memory
    const districtLower = String(districtName).toLowerCase().trim()
    const keys = ["district", "DISTRICT", "district_name", "districtName"]
    const normalize = (v: any) => (v === null || typeof v === "undefined" ? "" : String(v).toLowerCase().trim())
    const matchesDistrict = (f: any) => {
      const props = f?.properties ?? f
      if (!props) return false
      for (const k of keys) {
        if (props[k] && normalize(props[k]) === districtLower) return true
      }
      const allVals = Object.values(props || {})
      for (const val of allVals) {
        if (typeof val === "string" && normalize(val) === districtLower) return true
      }
      return false
    }

    const allFeatures: any[] = []
    layers.forEach((l) => {
      if (l.data?.features) allFeatures.push(...l.data.features)
    })
    const mrks = markers as any[]
    mrks.forEach((mr) => {
      if (mr?.raw) {
        allFeatures.push({ type: "Feature", properties: mr.raw, geometry: mr.geometry ?? (mr.lng && mr.lat ? { type: "Point", coordinates: [mr.lng, mr.lat] } : undefined) })
      }
    })

    const matches = allFeatures.filter(matchesDistrict)
    const byId = new Map<string, any>()
    matches.forEach((f: any) => {
      const pid = String((f.properties && (f.properties.claim_id || f.properties.id)) ?? f.id ?? Math.random())
      if (!byId.has(pid)) byId.set(pid, f)
    })
    setVillageClaims(Array.from(byId.values()))
  }

  // open panel filtered by state (reuse same panel UI)
  const onStateClick = async (stateName?: string | null) => {
    if (!stateName) return
    setVillageNameSelected(stateName)
    setVillagePanelOpen(true)
    setVillageClaims([])

    try {
      const q = new URLSearchParams()
      q.set("state", stateName)
      q.set("limit", "1000")
      const res = await fetch(`/api/claims?${q.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const features = data && data.type === "FeatureCollection" ? data.features || [] : Array.isArray(data) ? data : []
        const byId = new Map<string, any>()
        const ids = features.filter(Boolean)
        ids.forEach((f: any) => {
          const pid = String((f.properties && (f.properties.claim_id || f.properties.id)) ?? f.id ?? Math.random())
          if (!byId.has(pid)) byId.set(pid, f)
        })
        setVillageClaims(Array.from(byId.values()))
        return
      }
    } catch (err) {
      // fallback to in-memory
    }

    // fallback: filter already loaded features and markers by state
    const stateLower = String(stateName).toLowerCase().trim()
    const normalize = (v: any) => (v === null || typeof v === "undefined" ? "" : String(v).toLowerCase().trim())
    const matchesState = (f: any) => {
      const props = f?.properties ?? f
      if (!props) return false
      const keys = ["state", "STATE", "state_name", "stateName"]
      for (const k of keys) {
        if (props[k] && normalize(props[k]) === stateLower) return true
      }
      const allVals = Object.values(props || {})
      for (const val of allVals) {
        if (typeof val === "string" && normalize(val) === stateLower) return true
      }
      return false
    }

    const allFeatures: any[] = []
    layers.forEach((l) => {
      if (l.data?.features) allFeatures.push(...l.data.features)
    })
    markers.forEach((m) => {
      const mr = m as any
      if (mr?.raw) {
        allFeatures.push({ type: "Feature", properties: mr.raw, geometry: mr.geometry ?? (mr.lng && mr.lat ? { type: "Point", coordinates: [mr.lng, mr.lat] } : undefined) })
      }
    })

    const matches = allFeatures.filter(matchesState)
    const byId = new Map<string, any>()
    matches.forEach((f: any) => {
      const pid = String((f.properties && (f.properties.claim_id || f.properties.id)) ?? f.id ?? Math.random())
      if (!byId.has(pid)) byId.set(pid, f)
    })
    setVillageClaims(Array.from(byId.values()))
  }

  const handleMapClick = (lngLat: { lng: number; lat: number }) => {
    console.log("🗺️ [Atlas] Map clicked at:", lngLat, "isDraggingArea:", isDraggingArea, "addClaimOpen:", addClaimOpen, "claimAreaVisible:", claimAreaVisible, "areaEntered:", areaEntered, "markerPlaced:", markerPlaced)

    // Always update last clicked coordinates
    console.log("🗺️ [Atlas] Setting lastClickedCoords to:", [lngLat.lng, lngLat.lat])
    setLastClickedCoords([lngLat.lng, lngLat.lat])

    // If add claim form is open, allow placing/selecting location
    if (addClaimOpen) {
      console.log("Placing/selecting location at clicked location:", lngLat)
      setClaimAreaCenter([lngLat.lng, lngLat.lat])
      setMarkerPlaced(true)
      if (areaEntered) {
        setClaimAreaVisible(true)
      }
      return
    }

    // If dragging claim area, update its position
    if (isDraggingArea && addClaimOpen) {
      console.log("Updating claim area center from drag:", lngLat)
      setClaimAreaCenter([lngLat.lng, lngLat.lat])
      setIsDraggingArea(false)
      pushToast("Claim area moved to new location", "info")
      return
    }

    // Handle marker drag completion (when marker is dragged and dropped)
    // This is called from WebGIS when claim-area-center marker is dragged
    if (addClaimOpen && claimAreaVisible) {
      console.log("Updating claim area center from marker drag:", lngLat)
      setClaimAreaCenter([lngLat.lng, lngLat.lat])
      pushToast("Claim area moved to new location", "info")
      return
    }

    console.log("Map clicked at:", lngLat)
  }

  const handleExportMap = async () => {
    console.log("Starting map export...")
    try {
      if (webGISRef.current) {
        await webGISRef.current.exportMap()
        return
      }

      alert("Map export initiated. Please use your browser's screenshot feature (Ctrl+Shift+S) to capture the map.")
    } catch (error) {
      try {
        console.error("Export failed:", error instanceof Error ? error.message : String(error))
      } catch (logError) {
        console.error("Export failed (could not log error details)")
      }
      alert("Export failed. Please try refreshing the page or taking a manual screenshot.")
    }
  }

  // --- Add Claim modal state & handler ---
  const [addClaimOpen, setAddClaimOpen] = useState(false)
  const [newClaim, setNewClaim] = useState({
    state_name: "",
    district_name: "",
    village_name: "",
    claim_type: "",
    claimant_name: "",
    community_name: "",
    claimed_area: 0,
  })
  const [submittingClaim, setSubmittingClaim] = useState(false)

  // Draggable claim area state
  const [claimAreaVisible, setClaimAreaVisible] = useState(false)
  const [claimAreaCenter, setClaimAreaCenter] = useState<[number, number] | null>(null)
  const [claimAreaRadius, setClaimAreaRadius] = useState<number>(0) // in meters
  const [isDraggingArea, setIsDraggingArea] = useState(false)
  const [areaEntered, setAreaEntered] = useState(false)
  const [markerPlaced, setMarkerPlaced] = useState(false)
  const [lastClickedCoords, setLastClickedCoords] = useState<[number, number] | null>(null)

  // Update last click marker
  useEffect(() => {
    console.log("🗺️ [Atlas] lastClickedCoords changed:", lastClickedCoords)
    if (lastClickedCoords) {
      // Determine color based on selected claim type.
      // Priority: when add-claim modal is open use newClaim.claim_type, otherwise
      // fall back to pendingClaimTypeFilter or claimTypeFilter; if none selected use 'NON'.
      const selectedTypeRaw = (addClaimOpen && newClaim?.claim_type)
        ? newClaim.claim_type
        : (pendingClaimTypeFilter ?? claimTypeFilter ?? null)
      const selectedType = selectedTypeRaw ? String(selectedTypeRaw).toUpperCase() : "NON"
      const lastClickColorMap: Record<string, string> = { IFR: "#16a34a", CR: "#3b82f6", CFR: "#f59e0b", NON: "#dc2626" }
      const lastClickColor = lastClickColorMap[selectedType] ?? "#dc2626"

      const lastClickMarker: GISMarker = {
        id: "last-click",
        lng: lastClickedCoords[0],
        lat: lastClickedCoords[1],
        label: "Last Click Location",
        color: lastClickColor,
        popup: `<div style="min-width:180px;font-size:14px;padding:8px;"><strong style="color:${lastClickColor};">📍 Last Clicked Location</strong><div style="margin-top:8px;"><strong>Latitude:</strong> ${lastClickedCoords[1].toFixed(6)}</div><div><strong>Longitude:</strong> ${lastClickedCoords[0].toFixed(6)}</div><div style="margin-top:8px;font-size:12px;color:#666;">Click elsewhere to move this marker</div></div>`,
        size: 50, // larger size for better visibility
      }

      console.log("🗺️ [Atlas] Creating last-click marker:", lastClickMarker)
      setMarkers((prev) => {
        const filtered = prev.filter(m => m.id !== "last-click")
        const newMarkers = [...filtered, lastClickMarker]
        console.log("🗺️ [Atlas] Updated markers array with last-click:", newMarkers.map(m => ({ id: m.id, lng: m.lng, lat: m.lat })))
        return newMarkers
      })
    } else {
      console.log("🗺️ [Atlas] Removing last-click marker")
      setMarkers((prev) => prev.filter(m => m.id !== "last-click"))
    }
  }, [lastClickedCoords])

  // Update claim area and marker
  useEffect(() => {
    console.log("=== CLAIM AREA useEffect triggered ===")
    console.log("claimAreaVisible:", claimAreaVisible)
    console.log("claimAreaCenter:", claimAreaCenter)
    console.log("claimAreaRadius:", claimAreaRadius)
    console.log("area:", newClaim.claimed_area)
    console.log("markerPlaced:", markerPlaced)
    console.log("Current map center:", mapCenter)
    console.log("🗺️ [Atlas] Current markers count:", markers.length)

    // Handle circle layer
    if (claimAreaVisible && claimAreaCenter && claimAreaRadius > 0) {
      console.log("=== SHOWING CLAIM AREA CIRCLE ===")
      // Create a circle polygon for the claim area
      const circle = turf.circle(claimAreaCenter, claimAreaRadius / 1000, { steps: 64, units: 'kilometers' })
      console.log("Created circle:", circle)

      setLayers((prevLayers) =>
        prevLayers.map((layer) =>
          layer.id === "claim-area"
            ? {
              ...layer,
              visible: true,
              data: { type: "FeatureCollection", features: [circle] },
            }
            : layer
        )
      )
    } else {
      console.log("=== HIDING CLAIM AREA CIRCLE ===")
      // Hide the claim area layer
      setLayers((prevLayers) =>
        prevLayers.map((layer) =>
          layer.id === "claim-area"
            ? { ...layer, visible: false, data: undefined }
            : layer
        )
      )
    }

    // Handle marker
    if (markerPlaced && claimAreaCenter && addClaimOpen) {
      console.log("=== SHOWING CLAIM MARKER ===")
      const area = newClaim.claimed_area
      const claimMarker: GISMarker = {
        id: "claim-area-center",
        lng: claimAreaCenter[0],
        lat: claimAreaCenter[1],
        label: area > 0 ? `New Claim (${area} ha)` : `Selected Location`,
        color: "#ef4444",
        popup: area > 0 ? `<div style="min-width:200px;font-size:13px"><strong>New Claim Area</strong><div>Area: ${area} ha</div><div>Radius: ${(claimAreaRadius / 1000).toFixed(2)} km</div><div style="margin-top:6px;color:#ef4444;"><em>Drag the circle to reposition</em></div></div>` : `<div style="min-width:200px;font-size:13px"><strong>Selected Location</strong><div style="margin-top:6px;color:#ef4444;"><em>Drag to reposition</em></div></div>`,
        size: area > 0 ? Math.max(100, Math.min(200, Math.sqrt(area) * 10)) : 100 // Size proportional to area, min 100px, max 200px
      }

      console.log("Creating marker:", claimMarker)
      console.log("Marker coordinates vs map center:", {
        markerLng: claimMarker.lng,
        markerLat: claimMarker.lat,
        mapCenterLng: mapCenter ? mapCenter[0] : null,
        mapCenterLat: mapCenter ? mapCenter[1] : null,
        distance: mapCenter ? turf.distance(turf.point(claimAreaCenter), turf.point(mapCenter), { units: 'kilometers' }) : null
      })

      setMarkers((prev) => {
        const filtered = prev.filter(m => m.id !== "claim-area-center")
        const newMarkers = [...filtered, claimMarker]
        console.log("Updated markers array:", newMarkers.length, "markers")
        console.log("All marker IDs:", newMarkers.map(m => m.id))
        return newMarkers
      })
    } else {
      console.log("=== HIDING CLAIM MARKER ===")
      // Remove claim area marker
      setMarkers((prev) => {
        const filtered = prev.filter(m => m.id !== "claim-area-center")
        console.log("Removed claim marker, remaining markers:", filtered.length)
        return filtered
      })
    }
    console.log("=== END CLAIM AREA useEffect ===")
  }, [claimAreaVisible, claimAreaCenter, claimAreaRadius, newClaim.claimed_area, mapCenter, markerPlaced, addClaimOpen])

  const submitNewClaim = async () => {
    try {
      setSubmittingClaim(true)

      // Prepare claim data with exact fields required by external API
      const claimData = {
        state_name: newClaim.state_name,
        district_name: newClaim.district_name,
        village_name: newClaim.village_name,
        claim_type: newClaim.claim_type,
        claimant_name: newClaim.claimant_name,
        community_name: newClaim.community_name,
        claimed_area: newClaim.claimed_area,
        latitude: claimAreaCenter ? claimAreaCenter[1] : null,
        longitude: claimAreaCenter ? claimAreaCenter[0] : null
      }

      console.log("Submitting claim with exact fields for database storage:", claimData)

      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claimData),
      })

      console.log("API response status:", res.status)

      if (!res.ok) {
        const errorText = await res.text()
        console.error("Claim submission failed:", res.status, errorText)
        pushToast(`Failed to submit claim: ${res.status} ${errorText}`, "error")
        return
      }

      const responseData = await res.json()
      console.log("Claim successfully stored in Firebase:", responseData)

      pushToast("Claim submitted successfully and stored in database", "info")

      // Clear form and reset state
      setAddClaimOpen(false)
      setNewClaim({
        state_name: "",
        district_name: "",
        village_name: "",
        claim_type: "",
        claimant_name: "",
        community_name: "",
        claimed_area: 0
      })
      setClaimAreaVisible(false)
      setClaimAreaCenter(null)
      setClaimAreaRadius(0)
      setAreaEntered(false)
      setMarkerPlaced(false)
      setLastClickedCoords(null)

      // Remove claim area marker
      setMarkers((prev) => {
        const filtered = prev.filter(m => m.id !== "claim-area-center")
        console.log("Removed claim marker, remaining markers:", filtered.length)
        return filtered
      })

      // Refresh claims data
      setApplyCounter((c) => c + 1)

    } catch (err) {
      console.error("Claim submission error:", err)
      pushToast("Failed to submit claim (network error)", "error")
    } finally {
      setSubmittingClaim(false)
    }
  }

  // Function to fetch village coordinates and zoom to area
  const goToVillageArea = async () => {
    if (!newClaim.village_name || !newClaim.state_name) {
      pushToast("Please enter village and state first", "error")
      return
    }

    try {
      // Use OpenStreetMap Nominatim API to search for village
      const query = `${newClaim.village_name}, ${newClaim.state_name}, India`
      const encodedQuery = encodeURIComponent(query)
      const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1&countrycodes=IN`

      console.log("Searching for village:", query)
      console.log("API URL:", apiUrl)

      const res = await fetch(apiUrl)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()
      console.log("Nominatim API Response:", data)

      if (data && data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lon = parseFloat(result.lon)

        console.log("Found village coordinates:", { lat, lon })

        // Set claim area center
        setClaimAreaCenter([lon, lat])

        // Zoom to the village location
        webGISRef.current?.flyTo?.(lon, lat, 14)

        pushToast(`Zoomed to ${newClaim.village_name}, ${newClaim.state_name}`, "info")
      } else {
        // Fallback: use state center if village not found
        const stateData = STATES.find((s) => s.name === newClaim.state_name)
        if (stateData) {
          setClaimAreaCenter([stateData.center[0], stateData.center[1]])
          webGISRef.current?.flyTo?.(stateData.center[0], stateData.center[1], 10)
          pushToast(`Village not found, zoomed to ${newClaim.state_name} center`, "info")
        } else {
          pushToast("Could not find village location", "error")
        }
      }
    } catch (err) {
      console.error("Error fetching village coordinates:", err)
      pushToast("Failed to find village location", "error")
    }
  }

  const handleStartMeasurement = () => {
    setIsMeasuring(true)
    setMeasurementDistance(null)
  }

  const handleClearMeasurement = () => {
    setIsMeasuring(false)
    setMeasurementDistance(null)
  }

  const handleExportGeoJSON = () => {
    const allFeatures: Array<{ type: "Feature"; properties: any; geometry: any }> = []
    layers.forEach((layer) => {
      if (layer.data?.features) {
        allFeatures.push(...layer.data.features)
      }
    })
    if (!allFeatures.length) {
      pushToast("No features available to export", "info")
      return
    }
    const ts = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `vanmitra-atlas-${ts}.geojson`
    exportToGeoJSON(allFeatures, filename)
  }

  return (
    <ProtectedRoute>
      <div className={
        `min-h-screen relative overflow-hidden ${isLight ?
          'bg-gradient-to-br from-emerald-50 via-green-100 to-teal-100 text-slate-900' :
          'bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white'}`
      }>
        <ThreeBackground />
        <DecorativeElements />

        {/* Mesh Gradient Overlay */}
        <div className={isLight ? "fixed inset-0 bg-gradient-to-br from-white/40 via-transparent to-emerald-100/20 pointer-events-none z-1" : "fixed inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-900/20 pointer-events-none z-1"} />

        {/* Animated Grid */}
        <div className={isLight ? "fixed inset-0 opacity-10 pointer-events-none z-1" : "fixed inset-0 opacity-10 pointer-events-none z-1"}>
          <div className="absolute inset-0" style={{
            backgroundImage: isLight ? `linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)` : `linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <Navbar />

        <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-8">
              <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                <GlassCard className={`p-0 overflow-hidden ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                  <div className="w-full h-[560px] relative rounded-2xl">
                    {/* subtle tint overlay */}
                    <div className={`absolute inset-0 rounded-2xl pointer-events-none ${isLight ? 'bg-emerald-100/20' : 'bg-green-900/10'}`} />

                    <div className="relative z-10 h-full">
                      <WebGIS
                        key={mapKey}
                        ref={webGISRef}
                        center={(mapCenter ?? stateCenter) as [number, number]}
                        zoom={mapZoom}
                        // Ensure application layers (claims) are rendered above boundary layers
                        layers={
                          searchResultsLayer
                            ? [searchResultsLayer, ...boundaryLayers, ...layers]
                            : [...boundaryLayers, ...layers]
                        }
                        markers={markers}
                        onFeatureClick={handleFeatureClick}
                        onMapClick={handleMapClick}
                        enableGeocoder={true}
                        enableMeasurement={true}
                        className="w-full h-full"
                        showControls={false}
                        state={stateFilter}
                        district={districtFilter}
                        onLayerToggle={handleLayerToggle}
                      />
                    </div>
                  </div>
                </GlassCard>

              </motion.div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard className={`mt-4 p-4 pb-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Ruler size={16} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
                    <h4 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Measurement Tools</h4>
                  </div>
                  <div className="space-y-3">
                    {!isMeasuring ? (
                      <button
                        onClick={() => webGISRef.current?.startMeasurement?.()}
                        className={`w-full px-4 py-2 rounded-md transition duration-200 ${isLight ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                      >
                        Start Measurement
                      </button>
                    ) : (
                      <div className={`text-sm p-3 rounded-md border ${isLight ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30'}`}>
                        Click two points on the map to measure distance
                      </div>
                    )}
                    {measurementDistance && (
                      <div className={`text-sm p-3 rounded-md border ${isLight ? 'bg-green-100 text-green-800 border-green-300' : 'bg-green-500/20 text-green-200 border-green-400/30'}`}>
                        <strong>Distance:</strong> {measurementDistance.toFixed(2)} km
                      </div>
                    )}
                    <button
                      onClick={() => webGISRef.current?.clearMeasurement?.()}
                      className={`w-full px-4 py-2 rounded-md transition duration-200 ${isLight ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}`}
                    >
                      Clear Measurement
                    </button>
                  </div>
                </GlassCard>

                <GlassCard className={`mt-4 p-4 pb-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Download size={16} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
                    <h4 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Export Tools</h4>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={handleExportGeoJSON}
                      className={`w-full px-4 py-2 rounded-md transition duration-200 ${isLight ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                    >
                      Export GeoJSON
                    </button>
                    <button
                      onClick={() => {
                        console.log("Export button clicked")
                        handleExportMap()
                      }}
                      className={`w-full px-4 py-2 rounded-md transition duration-200 ${isLight ? 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50' : 'border border-emerald-600/50 text-emerald-300 hover:bg-emerald-500/20'}`}
                    >
                      Export Map Image
                    </button>
                    {/* Add Claim button moved to aside */}
                  </div>
                </GlassCard>
              </div>
            </section>

            <aside className="lg:col-span-4">
              <div className="mb-6">
                <VillageClaimsPanel
                  open={villagePanelOpen}
                  village={villageNameSelected}
                  claims={villageClaims}
                  onClose={() => setVillagePanelOpen(false)}
                  onGoto={(lng, lat) => {
                    try {
                      webGISRef.current?.flyTo?.(lng, lat, 15)
                    } catch (e) { }
                  }}
                />
                <GlassCard className={`mb-4 overflow-hidden ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                  <div
                    className={`flex items-center justify-between p-3 cursor-pointer ${isLight ? 'bg-emerald-100 hover:bg-emerald-200' : 'bg-slate-800/50'}`}
                    onClick={() => setAddClaimOpen((prev) => !prev)}
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
                              <label className={`block text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>State</label>
                              <select
                                value={newClaim.state_name}
                                onChange={(e) => {
                                  const stateName = e.target.value
                                  setNewClaim((s) => ({ ...s, state_name: stateName, district_name: "", village_name: "" }))
                                  // Reset district and village when state changes
                                  setPendingDistrictFilter("")
                                  setPendingVillageFilter("")
                                }}
                                className={`mt-1 w-full rounded-md border p-2 ${isLight
                                  ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                                  : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`}
                              >
                                <option value="">Select State</option>
                                {(stateOptions.length ? stateOptions : STATES.map((s) => s.name)).map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className={`block text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>District</label>
                              <input
                                type="text"
                                value={newClaim.district_name}
                                onChange={(e) => {
                                  const districtName = e.target.value
                                  setNewClaim((s) => ({ ...s, district_name: districtName, village_name: "" }))
                                  // Reset village when district changes
                                  setPendingVillageFilter("")
                                }}
                                className={`mt-1 w-full rounded-md border p-2 ${isLight
                                  ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                                  : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`}
                                placeholder="Enter district name"
                              />
                            </div>

                            <div>
                              <label className={`block text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>Village</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newClaim.village_name}
                                  onChange={(e) => setNewClaim((s) => ({ ...s, village_name: e.target.value }))}
                                  className={`mt-1 flex-1 rounded-md border p-2 ${isLight
                                    ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                                    : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`}
                                  placeholder="Enter village name"
                                />
                                <button
                                  onClick={goToVillageArea}
                                  disabled={!newClaim.village_name || !newClaim.state_name}
                                  className={`mt-1 px-3 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isLight
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                  type="button"
                                >
                                  Go to Area
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className={`block text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>Claim type</label>
                              <select
                                value={newClaim.claim_type}
                                onChange={(e) => setNewClaim((s) => ({ ...s, claim_type: e.target.value }))}
                                className={`mt-1 w-full rounded-md border p-2 ${isLight
                                  ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                                  : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`}
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
                              <label className={`block text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>Claimed area (ha)</label>
                              <input
                                type="number"
                                value={newClaim.claimed_area}
                                onChange={(e) => {
                                  const area = Number(e.target.value)
                                  setNewClaim((s) => ({ ...s, claimed_area: area }))

                                  // Calculate radius from area (assuming circular area)
                                  // Area = πr², so r = sqrt(area/π)
                                  // Convert hectares to square meters: area_m2 = area * 10000
                                  // r = sqrt(area_m2 / π)
                                  if (area > 0) {
                                    const areaM2 = area * 10000
                                    const radiusM = Math.sqrt(areaM2 / Math.PI)
                                    setClaimAreaRadius(radiusM)
                                    setAreaEntered(true)
                                    if (markerPlaced) {
                                      setClaimAreaVisible(true)
                                    }
                                  } else {
                                    // Clear claim area when area is 0 or empty
                                    setClaimAreaVisible(false)
                                    setClaimAreaRadius(0)
                                    setAreaEntered(false)
                                    setMarkerPlaced(false)
                                  }
                                }}
                                className={`mt-1 w-full rounded-md border p-2 ${isLight
                                  ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                                  : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`}
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
                              <label className={`block text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>Claimant name</label>
                              <input
                                value={newClaim.claimant_name}
                                onChange={(e) => setNewClaim((s) => ({ ...s, claimant_name: e.target.value }))}
                                className={`mt-1 w-full rounded-md border p-2 ${isLight
                                  ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                                  : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`}
                                placeholder="Enter claimant name"
                              />
                            </div>

                            <div>
                              <label className={`block text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>Community name</label>
                              <input
                                value={newClaim.community_name}
                                onChange={(e) => setNewClaim((s) => ({ ...s, community_name: e.target.value }))}
                                className={`mt-1 w-full rounded-md border p-2 ${isLight
                                  ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                                  : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`}
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
                                    : "Claim area is now visible on the map with a red marker. You can drag it to adjust the location."
                                }
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-3">
                            <button
                              disabled={submittingClaim || !newClaim.state_name || !newClaim.district_name || !newClaim.village_name || !newClaim.claim_type || !newClaim.claimed_area}
                              onClick={submitNewClaim}
                              className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isLight
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                            >
                              {submittingClaim ? 'Submitting...' : 'Submit Claim'}
                            </button>
                            <button
                              onClick={() => {
                                setAddClaimOpen(false)
                                setClaimAreaVisible(false)
                                setClaimAreaCenter(null)
                                setClaimAreaRadius(0)
                                setAreaEntered(false)
                                setMarkerPlaced(false)
                                setLastClickedCoords(null)
                                setNewClaim({ state_name: "", district_name: "", village_name: "", claim_type: "", claimant_name: "", community_name: "", claimed_area: 0 })
                                // Remove claim area marker
                                setMarkers((prev) => {
                                  const filtered = prev.filter(m => m.id !== "claim-area-center")
                                  console.log("Cancel button: Removed claim marker, remaining markers:", filtered.length)
                                  console.log("Cancel button: Removed marker IDs:", prev.filter(m => m.id === "claim-area-center").map(m => m.id))
                                  return filtered
                                })
                              }}
                              className={`px-4 py-2 rounded-md transition-colors ${isLight
                                ? 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                                : 'border border-green-400/30 text-green-300 hover:bg-green-500/20'}`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
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
                          <input value={(searchVillageUid ?? '') as any} onChange={(e) => setSearchVillageUid(e.target.value)} placeholder="Village UID (integer)" className={`w-full rounded-md border p-2 ${isLight
                            ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                            : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`} />
                          <input value={searchStatus ?? ''} onChange={(e) => setSearchStatus(e.target.value)} placeholder="Status (optional)" className={`w-full rounded-md border p-2 ${isLight
                            ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                            : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`} />
                          <input value={searchClaimType ?? ''} onChange={(e) => setSearchClaimType(e.target.value)} placeholder="Claim type (optional)" className={`w-full rounded-md border p-2 ${isLight
                            ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                            : 'border-green-400/30 bg-slate-800/50 text-white placeholder-green-400 backdrop-blur-sm'}`} />
                          <div className="flex items-center gap-2">
                            <button disabled={searchLoading} onClick={() => runSearchByVillageUid()} className={`px-3 py-1 rounded-md ${searchLoading
                              ? (isLight ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-gray-300 text-gray-700 cursor-not-allowed')
                              : (isLight ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white')}`}>
                              {searchLoading ? 'Searching...' : 'Search'}
                            </button>
                            <button onClick={() => { setSearchVillageUid(''); setSearchStatus('all'); setSearchClaimType(''); setSearchResultsLayer(null); setVillagePanelOpen(false); setSearchLoading(false); }} className={`px-3 py-1 rounded-md ${isLight
                              ? 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                              : 'border border-green-400/30 text-green-300 hover:bg-green-500/20'}`}>Clear</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>


              </div>

              <GlassCard className={`overflow-hidden mb-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                <div
                  className={`flex items-center justify-between p-3 cursor-pointer ${isLight ? 'bg-emerald-100 hover:bg-emerald-200' : 'bg-slate-800/50'}`}
                  onClick={() => setFiltersExpanded((prev) => !prev)}
                >
                  <div className="flex items-center gap-2">
                    <Layers size={16} className={isLight ? 'text-emerald-700' : 'text-emerald-400'} />
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
                            {(stateOptions.length ? stateOptions : STATES.map((s) => s.name)).map((s) => (
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
                                : (STATES.find((s) => s.name === pendingStateFilter)?.districts || []).map((d) => (
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
                            {claimTypeOptions.length ? (
                              claimTypeOptions.map((ct) => (
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
              <LayerManager
                layers={[...layers, ...boundaryLayers]}
                markers={markers}
                onLayerToggle={handleLayerToggle}
                onLayerRemove={handleLayerRemove}
                onLayerUpdate={handleLayerUpdate}
                onMarkerUpdate={handleMarkerUpdate}
                onMarkerGoto={(lng, lat) => {
                  try {
                    webGISRef.current?.flyTo?.(lng, lat, 12)
                  } catch (e) { }
                }}
                initiallyCollapsed={true}
              />
              <GlassCard className={`overflow-hidden mb-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                <div className={`flex items-center justify-between p-3 ${isLight ? 'bg-emerald-100' : 'bg-slate-800/50'}`}>
                  <div className="flex items-center gap-2">
                    <Layers size={16} className={isLight ? 'text-emerald-700' : 'text-emerald-400'} />
                    <span className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Boundary Layers</span>
                    <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>(Madhya Pradesh)</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-red-500 bg-transparent"></div>
                      <span className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>State Boundary</span>
                    </div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={pendingShowStateBoundary}
                        onChange={(e) => setPendingShowStateBoundary(e.target.checked)}
                        className={`rounded ${isLight ? 'border-slate-300 bg-white' : 'border-green-400/30 bg-slate-800/50'}`}
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 bg-transparent"></div>
                      <span className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>District Boundaries</span>
                    </div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={pendingShowDistrictBoundary}
                        onChange={(e) => setPendingShowDistrictBoundary(e.target.checked)}
                        className={`rounded ${isLight ? 'border-slate-300 bg-white' : 'border-green-400/30 bg-slate-800/50'}`}
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-green-500 bg-transparent"></div>
                      <span className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Tehsil Boundaries</span>
                    </div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={pendingShowTehsilBoundary}
                        onChange={(e) => setPendingShowTehsilBoundary(e.target.checked)}
                        className={`rounded ${isLight ? 'border-slate-300 bg-white' : 'border-green-400/30 bg-slate-800/50'}`}
                      />
                    </label>
                  </div>
                </div>
                <div className={`p-3 border-t rounded-b-2xl ${isLight ? 'border-slate-200 bg-slate-100' : 'border-emerald-700/50 bg-emerald-800/30'} flex items-center gap-2`}>
                  <button
                    onClick={() => {
                      // Commit pending selections
                      setShowStateBoundary(pendingShowStateBoundary)
                      setShowDistrictBoundary(pendingShowDistrictBoundary)
                      setShowTehsilBoundary(pendingShowTehsilBoundary)
                      // trigger reload effect
                      setApplyCounter((c) => c + 1)
                      // Force WebGIS re-render/refresh so the map re-loads layers and paints
                      setMapKey((k) => k + 1)
                      // Recenter map to state center and reset zoom to a sensible default
                      try {
                        setMapCenter(stateCenter as [number, number])
                      } catch (e) { }
                      setMapZoom(7.5)
                    }}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${isLight
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      // Revert pending to committed values
                      setPendingShowStateBoundary(showStateBoundary)
                      setPendingShowDistrictBoundary(showDistrictBoundary)
                      setPendingShowTehsilBoundary(showTehsilBoundary)
                    }}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${isLight
                      ? 'border border-slate-300 text-slate-700 hover:bg-slate-200'
                      : 'border border-green-400/30 text-green-300 hover:bg-green-500/20'}`}
                  >
                    Cancel
                  </button>
                </div>
              </GlassCard>

              <GlassCard className={`mt-4 p-4 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                <h5 className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'} mb-3`}>Legend</h5>
                <div className="space-y-3">
                  {claimTypeOptions.length ? (
                    claimTypeOptions.map((ct) => {
                      const layerId = `claims-${ct.toLowerCase()}`
                      const layer = layers.find((l) => l.id === layerId)
                      const visible = layer ? !!layer.visible : true
                      const color = claimTypeColors[ct] ?? "#60a5fa"

                      return (
                        <div key={ct} className="space-y-2">
                          {/* Claim area layer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                style={{
                                  width: 16,
                                  height: 12,
                                  background: color,
                                  display: "inline-block",
                                  borderRadius: 3,
                                  border: "1px solid rgba(255,255,255,0.1)",
                                }}
                              />
                              <span className={`text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{ct} Areas</span>
                            </div>
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={visible}
                                onChange={() => handleLayerToggle(layerId)}
                                className={`rounded ${isLight ? 'border-slate-300 bg-white' : 'border-green-400/30 bg-slate-800/50'}`}
                              />
                              <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>{visible ? "Visible" : "Hidden"}</span>
                            </label>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className={`text-xs ${isLight ? 'text-emerald-600' : 'text-green-400'}`}>No claim types available</div>
                  )}

                  <div className="pt-2 border-t border-emerald-700/50">
                    <div className={`text-xs ${isLight ? 'text-emerald-600' : 'text-green-400'}`}>
                      <div className={`font-medium mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>Note:</div>
                      <div>Symbols for claim centroids have been removed for a cleaner overview.</div>
                      <div>Use the area layers and zoom controls to inspect claims.</div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </aside>
          </div>
        </main>

        <Modal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedFeature(null)
          }}
          title={
            selectedFeature
              ? (() => {
                const p = selectedFeature.properties || {}
                const isBoundary = String(selectedFeature.layer || "").toLowerCase().includes("boundary") || String(p?.level || "").toLowerCase().includes("state") || String(p?.level || "").toLowerCase().includes("district") || String(p?.level || "").toLowerCase().includes("tehsil")
                if (isBoundary) {
                  const lbl = getBoundaryLabel(p) || p._label || p.name || p.NAME || p.district || p.tehsil || p.state || "Boundary"
                  const lvl = (p.level || selectedFeature.layer || "").toString().toLowerCase()
                  if (lvl.includes("tehsil") || String(selectedFeature.layer).toLowerCase().includes("tehsil")) return ` ${lbl}`
                  if (lvl.includes("district") || String(selectedFeature.layer).toLowerCase().includes("district")) return `District: ${lbl}`
                  if (lvl.includes("state") || String(selectedFeature.layer).toLowerCase().includes("state")) return `State: ${lbl}`
                  return lbl
                }
                return `Claim ${p?.claim_id ?? p?.id ?? ""}`
              })()
              : undefined
          }
        >
          {selectedFeature ? (
            <div className="space-y-4">
              {String(selectedFeature.layer || "").toLowerCase().includes("boundary") ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedFeature.properties?._label ?? "Boundary"}</h3>
                      <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-500'}`}>{String(selectedFeature.properties?.level || selectedFeature.layer || "").replace(/-/g, " ")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          try {
                            const geom = selectedFeature.feature?.geometry ?? selectedFeature.feature
                            const fc = geom.type === 'Feature' ? geom : { type: 'Feature', properties: {}, geometry: geom }
                            const bbox = turf.bbox(fc)
                            const centerLng = (bbox[0] + bbox[2]) / 2
                            const centerLat = (bbox[1] + bbox[3]) / 2
                            webGISRef.current?.flyTo?.(centerLng, centerLat, 12)
                          } catch (e) {
                            // ignore
                          }
                        }}
                        className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-colors duration-200 ${isLight
                          ? 'bg-emerald-100 border border-emerald-300 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-emerald-800/30 border border-emerald-600/50 text-emerald-100 hover:bg-emerald-700/40'}`}
                      >
                        <ZoomIn size={16} />
                        <span>Zoom</span>
                      </button>
                      <button
                        onClick={() => {
                          try {
                            const props = { ...selectedFeature.properties }
                            navigator.clipboard?.writeText(JSON.stringify(props, null, 2))
                            pushToast('Boundary properties copied to clipboard', 'info')
                          } catch (e) {
                            pushToast('Copy failed', 'error')
                          }
                        }}
                        className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-colors duration-200 ${isLight
                          ? 'bg-emerald-100 border border-emerald-300 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-emerald-800/30 border border-emerald-600/50 text-emerald-100 hover:bg-emerald-700/40'}`}
                      >
                        <Copy size={16} />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => {
                          try {
                            const data = selectedFeature.feature?.type === 'Feature' ? selectedFeature.feature : { type: 'Feature', properties: selectedFeature.properties, geometry: selectedFeature.feature }
                            exportToGeoJSON([data], `${(selectedFeature.properties?._label || 'boundary').replace(/\s+/g, '_')}.geojson`)
                          } catch (e) {
                            pushToast('Export failed', 'error')
                          }
                        }}
                        className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-colors duration-200 ${isLight
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                      >
                        <FileDown size={16} />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className={`p-4 rounded-2xl border ${isLight
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-emerald-800/30 border-emerald-700/30'}`}>
                      <div className={`text-xs font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-300/70'}`}>Area</div>
                      <div className={`mt-2 text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {formatArea(selectedFeature.properties?._area_ha ?? selectedFeature.properties?.Shape_Area ? Number(selectedFeature.properties?._area_ha ?? (selectedFeature.properties?.Shape_Area / 10000)) : null)}
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl border ${isLight
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-emerald-800/30 border-emerald-700/30'}`}>
                      <div className={`text-xs font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-300/70'}`}>Claims inside</div>
                      <div className={`mt-2 text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {selectedFeature.properties?._counting ? <span className={`text-sm ${isLight ? 'text-emerald-600' : 'text-emerald-400/70'}`}>Counting...</span> : (selectedFeature.properties?.claims_count?.toString() ?? '—')}
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl border ${isLight
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-emerald-800/30 border-emerald-700/30'}`}>
                      <div className={`text-xs font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-300/70'}`}>Level</div>
                      <div className={`mt-2 text-lg font-semibold ${isLight ? 'text-emerald-800' : 'text-emerald-100'}`}>{friendlyLevel(selectedFeature.properties?.level ?? selectedFeature.layer)}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-emerald-700/30">
                    <h4 className={`text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'} mb-4`}>Properties</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm max-h-48 overflow-auto custom-scroll">
                      {selectedFeature.properties && Object.entries(selectedFeature.properties).slice(0, 50).map(([k, v]) => (
                        <div key={k} className={`flex justify-between gap-3 border-b py-2 ${isLight ? 'border-slate-200' : 'border-emerald-700/20'}`}>
                          <div className={`font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-300/70'}`}>{humanizeKey(k)}</div>
                          <div className={`font-semibold break-words text-right ${isLight ? 'text-slate-900' : 'text-white'}`}>{k === '_area_ha' || k === 'Shape_Area' ? formatArea(v) : String(v)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`rounded-3xl border p-6 space-y-6 ${isLight
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-emerald-900/95 border-emerald-700/50'}`}>
                    {/* Status + Claim Type */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3">
                        <span
                          className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide border ${String(selectedFeature.properties?.status).toLowerCase() === "approved"
                              ? (isLight
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-emerald-700/30 text-emerald-100 border-emerald-600/50")
                              : (isLight
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-amber-700/30 text-amber-100 border-amber-600/50")
                            }`}
                        >
                          {String(selectedFeature.properties?.status ?? "").toUpperCase()}
                        </span>
                        <span className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide border ${isLight
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-slate-700/50 text-slate-200 border-slate-600/50'}`}>
                          {String(selectedFeature.properties?.claim_type ?? "").toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className={`text-xs font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-300/70'}`}>Land area</p>
                        <p className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {selectedFeature.properties?.land_area ?? "—"} ha
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className={`text-xs font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-300/70'}`}>State</p>
                        <button
                          onClick={() => onStateClick(selectedFeature.properties?.state)}
                          className={`text-lg font-bold hover:underline transition-colors duration-200 ${isLight
                            ? 'text-emerald-700 hover:text-emerald-800'
                            : 'text-emerald-200 hover:text-emerald-100'}`}
                        >
                          {selectedFeature.properties?.state ?? "—"}
                        </button>
                      </div>

                      <div className="space-y-1">
                        <p className={`text-xs font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-300/70'}`}>District</p>
                        <button
                          onClick={() =>
                            onDistrictClick(selectedFeature.properties?.district)
                          }
                          className={`text-lg font-bold hover:underline transition-colors duration-200 ${isLight
                            ? 'text-emerald-700 hover:text-emerald-800'
                            : 'text-emerald-200 hover:text-emerald-100'}`}
                        >
                          {selectedFeature.properties?.district ?? "—"}
                        </button>
                      </div>

                      <div className="space-y-1">
                        <p className={`text-xs font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-300/70'}`}>Village</p>
                        <button
                          onClick={() =>
                            onVillageClick(selectedFeature.properties?.village)
                          }
                          className={`text-lg font-bold hover:underline transition-colors duration-200 ${isLight
                            ? 'text-emerald-700 hover:text-emerald-800'
                            : 'text-emerald-200 hover:text-emerald-100'}`}
                        >
                          {selectedFeature.properties?.village ?? "—"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-emerald-700/30">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => {
                          router.push(
                            `/atlas/${encodeURIComponent(selectedFeature.properties?.claim_id ?? selectedFeature.properties?.id ?? "")}`,
                          )
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${isLight
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                      >
                        Open detail
                      </button>
                      <button
                        onClick={() => {
                          /* show edit modal */
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${isLight
                          ? 'border border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'border border-emerald-600/50 bg-emerald-800/30 text-emerald-100 hover:bg-emerald-700/40'}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          /* report action */
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${isLight
                          ? 'border border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'border border-emerald-600/50 bg-emerald-800/30 text-emerald-100 hover:bg-emerald-700/40'}`}
                      >
                        Report
                      </button>
                      <button
                        onClick={() => {
                          /* verify action */
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${isLight
                          ? 'border border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'border border-emerald-600/50 bg-emerald-800/30 text-emerald-100 hover:bg-emerald-700/40'}`}
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </Modal>

        {/* Footer */}
        <Footer />

        {/* Toast UI removed */}
      </div>
    </ProtectedRoute>
  )
}

