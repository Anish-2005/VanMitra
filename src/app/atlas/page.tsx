"use client"

import { useState, useRef, useEffect } from "react"
import * as turf from "@turf/turf"
import { STATES, DEFAULT_STATE } from "../../lib/regions"
import { motion } from "framer-motion"
import { Layers, Ruler, Download } from "lucide-react"
import DecorativeBackground from "@/components/DecorativeBackground"
import Link from "next/link"
import WebGIS, { type WebGISRef as WebGISRefType } from "../../components/WebGIS"
import LayerManager from "../../components/LayerManager"
import Modal from "../../components/Modal"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import type { GISLayer, GISMarker } from "../../components/WebGIS"
import { exportToGeoJSON } from "../../lib/gis-utils"
import type { GeoJSON } from "geojson"

export default function AtlasPage() {
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

  const claimTypeColors: Record<string, string> = {
    IFR: "#16a34a",
    CR: "#3b82f6",
    CFR: "#f59e0b",
  }

  const pushToast = (message: string, type: "info" | "error" = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000)
  }
  const [mapKey, setMapKey] = useState(0) // Key to force WebGIS re-render
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)
  const [mapZoom, setMapZoom] = useState<number>(7.5)

  const [pendingStateFilter, setPendingStateFilter] = useState("all")
  const [pendingDistrictFilter, setPendingDistrictFilter] = useState("all")
  const [isApplyingFilters, setIsApplyingFilters] = useState(false)
  const [filtersExpanded, setFiltersExpanded] = useState(true)

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
    setMapKey((prev) => prev + 1)
  }, [stateFilter, districtFilter])

  useEffect(() => {
    setPendingStateFilter(stateFilter)
    setPendingDistrictFilter(districtFilter)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/claims?status=all&limit=1000", { headers: { Accept: "application/json" } })
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

        features.forEach((f: any) => {
          const props = f.properties || f
          const stateName = (props?.state ?? "").toString()
          const districtName = (props?.district ?? "").toString()
          const status = (props?.status ?? "").toString()
          const ctype = (props?.claim_type ?? props?.claimType ?? "").toString()
          if (stateName) {
            statesSet.add(stateName)
            if (!districtsByState[stateName]) districtsByState[stateName] = new Set()
            if (districtName) districtsByState[stateName].add(districtName)
          }
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
          setStatusOptions((prev) => (prev.length ? prev : Array.from(statusesSet)))
          setClaimTypeOptions((prev) => (prev.length ? prev : Array.from(claimTypesSet)))
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
                    label: String(f.properties?.claim_id ?? f.properties?.id ?? ""),
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
                      label: String(f.properties?.claim_id ?? f.properties?.id ?? ""),
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
                      label: String(f.properties?.claim_id ?? f.properties?.id ?? ""),
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
                  label: String(item.claim_id ?? item.id ?? ""),
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
                label: String(item.claim_id ?? item.id),
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
        setMapKey((k) => k + 1)
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
  }, [stateFilter, districtFilter, statusFilter, claimTypeFilter])

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

  const handleLayerToggle = (layerId: string) => {
    setLayers((prev) => prev.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer)))
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
    // If a boundary layer was clicked, compute area and (for tehsil) claims count
    const { layer, feature, lngLat } = featureInfo as any
    const props = feature?.properties || {}

    const getBoundaryLabel = (p: any) => {
      if (!p) return undefined
      return (
        p.name || p.NAME || p.NAME_1 || p.NAME_2 || p.ST_NM || p.STATE_NAME || p.state || p.district || p.DISTRICT || p.tehsil || p.TEHSIL || p.subdistrict || p.SUBDIST || p._label || p._name || p._source || (p?.NAME_0) || undefined
      )
    }

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

      // If tehsil, also compute number of claims inside it
      const level = (props?.level || layer?.id || layer?.name || "").toString().toLowerCase()
      const isTehsil = level.includes("tehsil") || String(props?.type ?? "").toLowerCase().includes("tehsil")

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

      if (isTehsil) {
        ;(async () => {
          try {
            // show counting state in modal
            setSelectedFeature((prev) => (prev ? { ...prev, properties: { ...prev.properties, _counting: true } } : prev))

            // Fetch claims for the state to limit results (use current stateFilter or default)
            const st = stateFilter === "all" ? DEFAULT_STATE : stateFilter
            const q = new URLSearchParams()
            q.set("state", st)
            q.set("limit", "10000")
            const res = await fetch(`/api/claims?${q.toString()}`)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            const features: any[] = data && data.type === "FeatureCollection" ? data.features || [] : Array.isArray(data) ? data : []

            // Prepare polygon feature for intersection checks
            const polyFeature = feature.type === 'Feature' ? feature : { type: 'Feature', properties: {}, geometry: feature }

            let count = 0
            for (const f of features) {
              try {
                if (!f || !f.geometry) continue

                const gtype = (f.geometry.type || '').toLowerCase()

                if (gtype === 'point' || gtype === 'multipoint') {
                  const coords = gtype === 'point' ? f.geometry.coordinates : (f.geometry.coordinates && f.geometry.coordinates[0])
                  if (!coords) continue
                  const pt = turf.point(coords)
                  if (turf.booleanPointInPolygon(pt, polyFeature)) count++
                } else {
                  // For polygon/multipolygon or unknown geometries, use booleanIntersects
                  const feat = f.type === 'Feature' ? f : { type: 'Feature', properties: f.properties || {}, geometry: f.geometry }
                  if (turf.booleanIntersects(feat, polyFeature)) count++
                }
              } catch (e) {
                // ignore per-feature errors
              }
            }

            // update modal properties with claims count and clear counting flag
            setSelectedFeature((prev) => (prev ? { ...prev, properties: { ...prev.properties, claims_count: count, _counting: false } } : prev))
          } catch (err) {
            console.warn("Failed to count claims for tehsil:", err)
            setSelectedFeature((prev) => (prev ? { ...prev, properties: { ...prev.properties, _counting: false } } : prev))
          }
        })()
      }
      return
    }

    // default behavior for non-boundary features (claims)
    setSelectedFeature({ ...featureInfo, properties: featureInfo.feature?.properties })
    setModalOpen(true)
  }

  const handleMapClick = (lngLat: { lng: number; lat: number }) => {
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
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 text-green-900 relative overflow-hidden">
        <DecorativeBackground count={6} />

        <header className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center border border-green-700 shadow-md">
              <Layers className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-green-900">VanMitra</h1>
              <p className="text-xs text-green-700">Interactive Map & Layers</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors"
            >
              Dashboard
            </Link>
          </nav>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-8">
              <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-green-300 bg-white">
                  <div className="w-full h-[560px] p-6 relative">
                    <div className="absolute inset-0 bg-green-800/6 pointer-events-none"></div>
                    <div className="relative z-10 h-full">
                      <WebGIS
                        key={mapKey}
                        ref={webGISRef}
                        center={(mapCenter ?? stateCenter) as [number, number]}
                        zoom={mapZoom}
                        // Ensure application layers (claims) are rendered above boundary layers so
                        // claim clicks are not blocked. We put boundaryLayers first so WebGIS adds
                        // them earlier and other layers are added on top.
                        layers={[...boundaryLayers, ...layers]}
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
                </div>
              </motion.div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl shadow-md border border-green-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Ruler size={16} />
                    <h4 className="font-semibold text-green-900">Measurement Tools</h4>
                  </div>
                  <div className="space-y-3">
                    {!isMeasuring ? (
                      <button
                        onClick={() => webGISRef.current?.startMeasurement?.()}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Start Measurement
                      </button>
                    ) : (
                      <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-md">
                        Click two points on the map to measure distance
                      </div>
                    )}
                    {measurementDistance && (
                      <div className="text-sm bg-green-50 p-3 rounded-md">
                        <strong>Distance:</strong> {measurementDistance.toFixed(2)} km
                      </div>
                    )}
                    <button
                      onClick={() => webGISRef.current?.clearMeasurement?.()}
                      className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Clear Measurement
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl shadow-md border border-green-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Download size={16} />
                    <h4 className="font-semibold text-green-900">Export Tools</h4>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={handleExportGeoJSON}
                      className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                      Export GeoJSON
                    </button>
                    <button
                      onClick={() => {
                        console.log("Export button clicked")
                        handleExportMap()
                      }}
                      className="w-full border border-green-200 text-green-700 px-4 py-2 rounded-md hover:bg-green-50 transition-colors"
                    >
                      Export Map Image
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <aside className="lg:col-span-4">
              <div className="mb-6">
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
                    } catch (e) {}
                  }}
                />
              </div>

              <div className="bg-white rounded-xl shadow-md border border-green-100 overflow-hidden mb-6">
                <div
                  className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
                  onClick={() => setFiltersExpanded((prev) => !prev)}
                >
                  <div className="flex items-center gap-2">
                    <Layers size={16} />
                    <span className="font-medium">Filters</span>
                    <span className="text-sm text-gray-500">(controls)</span>
                  </div>
                  <div className={`transform transition-transform ${filtersExpanded ? "rotate-180" : ""}`}>▼</div>
                </div>

                {filtersExpanded && (
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-sm text-green-700">State</label>
                      <select
                        value={pendingStateFilter}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="mt-1 w-full rounded-md border border-green-100 p-2 bg-green-50"
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
                      <label className="block text-sm text-green-700">District</label>
                      <select
                        value={pendingDistrictFilter}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="mt-1 w-full rounded-md border border-green-100 p-2 bg-green-50"
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
                      <label className="block text-sm text-green-700">Status</label>
                      <select
                        value={pendingStatusFilter}
                        onChange={(e) => setPendingStatusFilter(e.target.value)}
                        className="mt-1 w-full rounded-md border border-green-100 p-2 bg-green-50"
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
                      <label className="block text-sm text-green-700">Claim type</label>
                      <select
                        value={pendingClaimTypeFilter ?? ""}
                        onChange={(e) => setPendingClaimTypeFilter(e.target.value || null)}
                        className="mt-1 w-full rounded-md border border-green-100 p-2 bg-green-50"
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
                        className="w-full inline-flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                )}
              </div>

              {/* Boundary Toggles */}
              <div className="bg-white rounded-xl shadow-md border border-green-100 overflow-hidden mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Layers size={16} />
                    <span className="font-medium">Boundary Layers</span>
                    <span className="text-sm text-gray-500">(Madhya Pradesh)</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-red-500 bg-transparent"></div>
                      <span className="text-sm font-medium">State Boundary</span>
                    </div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={pendingShowStateBoundary}
                        onChange={(e) => setPendingShowStateBoundary(e.target.checked)}
                        className="rounded border-gray-200"
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 bg-transparent"></div>
                      <span className="text-sm font-medium">District Boundaries</span>
                    </div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={pendingShowDistrictBoundary}
                        onChange={(e) => setPendingShowDistrictBoundary(e.target.checked)}
                        className="rounded border-gray-200"
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-green-500 bg-transparent"></div>
                      <span className="text-sm font-medium">Tehsil Boundaries</span>
                    </div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={pendingShowTehsilBoundary}
                        onChange={(e) => setPendingShowTehsilBoundary(e.target.checked)}
                        className="rounded border-gray-200"
                      />
                    </label>
                  </div>
                </div>
                <div className="p-3 border-t border-green-50 bg-green-50 flex items-center gap-2">
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
                      } catch (e) {}
                      setMapZoom(7.5)
                    }}
                    className="bg-green-700 text-white px-3 py-1 rounded-md text-sm"
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
                    className="bg-white border border-green-200 text-green-700 px-3 py-1 rounded-md text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-green-50">
                <h5 className="text-sm font-medium text-green-900 mb-3">Legend</h5>
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
                                    border: "1px solid rgba(0,0,0,0.06)",
                                  }}
                                />
                                <span className="text-sm">{ct} Areas</span>
                              </div>
                              <label className="inline-flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={visible}
                                  onChange={() => handleLayerToggle(layerId)}
                                  className="rounded border-gray-200"
                                />
                                <span className="text-sm text-gray-600">{visible ? "Visible" : "Hidden"}</span>
                              </label>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-xs text-gray-500">No claim types available</div>
                    )}

                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-600">
                        <div className="font-medium mb-1">Note:</div>
                        <div>Symbols for claim centroids have been removed for a cleaner overview.</div>
                        <div>Use the area layers and zoom controls to inspect claims.</div>
                      </div>
                    </div>
                </div>
              </div>
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
                    const lbl = p._label || p.name || p.NAME || p.district || p.tehsil || p.state || "Boundary"
                    const lvl = (p.level || selectedFeature.layer || "").toString().toLowerCase()
                    if (lvl.includes("tehsil") || String(selectedFeature.layer).toLowerCase().includes("tehsil")) return `Tehsil: ${lbl}`
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
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">{selectedFeature.properties?._label ?? selectedFeature.properties?.name ?? ""}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Area</div>
                      <div className="font-medium">
                        {selectedFeature.properties?._area_ha ? `${Number(selectedFeature.properties._area_ha).toFixed(2)} ha` : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Claims inside</div>
                      <div className="font-medium">
                        {selectedFeature.properties?._counting ? (
                          <span className="text-xs text-gray-500">Counting...</span>
                        ) : (
                          (selectedFeature.properties?.claims_count ?? "—")
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-4">
                    <div>
                      <div className="text-sm text-gray-600">
                        {selectedFeature.properties?.village ?? ""}, {selectedFeature.properties?.district ?? ""}
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${String(selectedFeature.properties?.status).toLowerCase() === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                      >
                        {String(selectedFeature.properties?.status ?? "").toUpperCase()}
                      </div>
                      <div className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {String(selectedFeature.properties?.claim_type ?? "").toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">Land area</div>
                      <div className="font-medium">{selectedFeature.properties?.land_area ?? "—"} ha</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">State</div>
                      <div className="font-medium">{selectedFeature.properties?.state ?? "—"}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">District</div>
                      <div className="font-medium">{selectedFeature.properties?.district ?? "—"}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">Village</div>
                      <div className="font-medium">{selectedFeature.properties?.village ?? "—"}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          router.push(
                            `/atlas/${encodeURIComponent(selectedFeature.properties?.claim_id ?? selectedFeature.properties?.id ?? "")}`,
                          )
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-green-700 text-white rounded-md text-sm"
                      >
                        Open detail
                      </button>
                      <button
                        onClick={() => {
                          /* show edit modal */
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1 border rounded-md text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          /* report action */
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1 border rounded-md text-sm"
                      >
                        Report
                      </button>
                      <button
                        onClick={() => {
                          /* verify action */
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1 border rounded-md text-sm"
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

        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center ${t.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}
            >
              {t.type === "error" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm8.707-7.293a1 1 0 00-1.414-1.414L10 10.586 8.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  )
}
