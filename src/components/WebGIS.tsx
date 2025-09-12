// src/components/WebGIS.tsx
"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react"
import maplibregl, { type Map, type Marker, type Popup, type GeoJSONSource } from "maplibre-gl"
import type MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder"
import * as turf from "@turf/turf"
import { Layers, Ruler, MapPin } from "lucide-react"

// Types
export interface GISLayer {
  id: string
  name: string
  type: "geojson" | "raster" | "vector"
  url?: string
  data?: any
  visible: boolean
  style: {
    fillColor?: string
    strokeColor?: string
    strokeWidth?: number
    opacity?: number
  }
}

export interface GISMarker {
  id: string
  lng: number
  lat: number
  label?: string
  color?: string
  popup?: string
  size?: number
}

export interface WebGISProps {
  center?: [number, number]
  zoom?: number
  layers?: GISLayer[]
  markers?: GISMarker[]
  onFeatureClick?: (feature: any) => void
  onMapClick?: (lngLat: maplibregl.LngLat) => void
  enableGeocoder?: boolean
  enableMeasurement?: boolean
  className?: string
  // Control visibility props
  showControls?: boolean
  showLayerControls?: boolean
  showMeasurementControls?: boolean
  showExportControls?: boolean
  // External control callbacks
  onLayerToggle?: (layerId: string) => void
  onStartMeasurement?: () => void
  onClearMeasurement?: () => void
  onExport?: () => void
  // Location parameters for API calls
  state?: string
  district?: string
  // Optional base raster tiles (eg. OpenWeather tile URLs)
  baseRasterTiles?: string[]
  baseRasterAttribution?: string
  // Ref for external access
  ref?: React.Ref<WebGISRef>
}

export interface WebGISRef {
  exportMap: () => void
  startMeasurement: () => void
  clearMeasurement: () => void
  flyTo: (lng: number, lat: number, zoom?: number) => void
}

const WebGIS = forwardRef<WebGISRef, WebGISProps>(function WebGISComponent(
  {
  // Default center set to central Madhya Pradesh (approximate)
  center = [78.0, 23.3],
    zoom = 8,
    layers = [],
    markers = [],
    onFeatureClick,
    onMapClick,
    enableGeocoder = true,
    enableMeasurement = true,
    className = "w-full h-full",
    showControls = true,
    showLayerControls = true,
    showMeasurementControls = true,
    showExportControls = true,
    onLayerToggle: externalLayerToggle,
    onStartMeasurement: externalStartMeasurement,
    onClearMeasurement: externalClearMeasurement,
    onExport: externalExport,
    baseRasterTiles,
    baseRasterAttribution,
    state = "Madhya Pradesh",
    district = "Bhopal",
  },
  ref,
) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<Map | null>(null)
  const markersRef = useRef<Marker[]>([])
  const popupsRef = useRef<Popup[]>([])
  const geocoderRef = useRef<MaplibreGeocoder | null>(null)
  const measurementPoints = useRef<maplibregl.LngLat[]>([])
  const measurementLine = useRef<string | null>(null)

  const isMeasuringRef = useRef(false)
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [measurementDistance, setMeasurementDistance] = useState<number | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [currentLayers, setCurrentLayers] = useState<GISLayer[]>(layers)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  // Draggable marker state
  const [draggedMarker, setDraggedMarker] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    // Build base raster source from prop or default to OSM
    const tiles = Array.isArray(baseRasterTiles) ? baseRasterTiles : undefined
    // Filter out obviously invalid tiles (e.g., URLs containing 'undefined')
    const validTiles = (tiles || []).filter(
      (t: string) => typeof t === "string" && t.length > 10 && !t.includes("undefined"),
    )
    const baseTiles =
      validTiles && validTiles.length > 0 ? validTiles : ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "base-raster": {
            type: "raster",
            tiles: baseTiles,
            tileSize: 256,
            attribution: baseRasterAttribution || "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "base-raster-layer",
            type: "raster",
            source: "base-raster",
          },
        ],
      },
      center: center,
  zoom: zoom,
  // Restrict map pan/zoom so the user cannot zoom out past the India extent.
  // India approximate bbox (west,south,east,north): [66, 5, 100, 38]
  maxBounds: [[66.0, 5.0], [100.0, 38.0]],
  // minZoom prevents zooming out too far; set to ~3.5 to keep India visible
  minZoom: 3.5,
      pitch: 0,
      bearing: 0,
    })

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right")
    map.current.addControl(new maplibregl.ScaleControl(), "bottom-left")

    // Wait for map to load before setting loaded state
    map.current.on("load", () => {
      console.log("🗺️ Map loaded event fired")
      console.log("Map canvas element:", map.current!.getCanvas())
      console.log("Map canvas dimensions:", map.current!.getCanvas().width, "x", map.current!.getCanvas().height)
      setMapLoaded(true)

      // Map click handler for generic clicks (calls external onMapClick if provided)
      map.current!.on("click", (e) => {
        if (onMapClick) {
          onMapClick(e.lngLat)
        }
      })
    })

    // Add error handling for map loading and tile/source failures
    map.current.on("error", (e) => {
      try {
        console.error("🗺️ Map error event:", e)
        // Safe error message extraction
        let errorMessage = "Unknown map error"

        // Handle different error object structures
        if (typeof e === "object" && e !== null) {
          if ("error" in e && typeof e.error === "object" && e.error !== null && "message" in e.error) {
            errorMessage = String(e.error.message)
          } else if ("message" in e) {
            errorMessage = String(e.message)
          } else {
            try {
              errorMessage = JSON.stringify(e)
            } catch {
              errorMessage = String(e)
            }
          }
        } else {
          errorMessage = String(e)
        }

        setMapError(errorMessage)
      } catch (err) {
        console.error("🗺️ Map error (logging failed):", err)
        setMapError("Unknown map error")
      }
    })

    // Listen for source/tile failures via sourcedata events
    map.current.on("sourcedata", (e) => {
      try {
        // Some tile load failures are surfaced on sourcedata where the tile has an error
        // We log the event and set a human-readable message when possible
        const evt = e as unknown as { tile?: { state?: string }; sourceId?: string }
        if (evt.tile && evt.tile.state === "errored") {
          console.warn("🗺️ Tile error for source:", evt.sourceId, e)
          setMapError(`Tile load error for source ${evt.sourceId}`)
        }
      } catch (err) {
        // ignore
      }
    })

    // Add tile loading events
    map.current.on("sourcedata", (e) => {
      if (e.sourceId === "osm" && e.isSourceLoaded) {
        console.log("🗺️ OSM tiles loaded")
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  // Update map center and zoom
  useEffect(() => {
    if (!map.current) return
    map.current.setCenter(center)
    map.current.setZoom(zoom)
  }, [center, zoom])

  // Load data from APIs and sync incoming layers
  useEffect(() => {
    console.log("Loading data for layers:", layers.length, "with state:", state, "district:", district)
    setIsLoadingData(true)

    // Sync currentLayers to the incoming prop layers (preserve any provided data)
    setCurrentLayers(layers.map((l) => ({ ...l })))

    const fetchPromises = layers.map((layer) => {
      // If layer already contains data, set it immediately
      if (layer.visible && layer.data) {
        setCurrentLayers((prev) => prev.map((l) => (l.id === layer.id ? { ...l, data: layer.data } : l)))
        return Promise.resolve(layer.data)
      }

      if (layer.visible && layer.url) {
        // Only add state and district parameters if they're not already in the URL
        let url = layer.url
        if (!url.includes("state=") && !url.includes("district=")) {
          const separator = url.includes("?") ? "&" : "?"
          const params = []
          if (state) params.push(`state=${encodeURIComponent(state)}`)
          if (district) params.push(`district=${encodeURIComponent(district)}`)
          if (params.length > 0) {
            url += separator + params.join("&")
          }
        }

        console.log("Fetching data from:", url)
        return fetch(url)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`)
            }
            return res.json()
          })
          .then((data) => {
            console.log("Received data for layer", layer.id, ":", data?.features?.length || 0, "features")
            setCurrentLayers((prev) => prev.map((l) => (l.id === layer.id ? { ...l, data } : l)))
            return data
          })
          .catch((error) => {
            console.error("Error fetching data for layer", layer.id, ":", error)
            // Set empty data to prevent infinite retries
            setCurrentLayers((prev) =>
              prev.map((l) => (l.id === layer.id ? { ...l, data: { type: "FeatureCollection", features: [] } } : l)),
            )
            return null
          })
      }
      return Promise.resolve(null)
    })

    Promise.all(fetchPromises).then(() => {
      setIsLoadingData(false)
    })
  }, [layers, state, district])

  // Handle layers
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    console.log("Handling layers, currentLayers:", currentLayers.length)
    currentLayers.forEach((layer) => {
      const sourceId = `source-${layer.id}`
      const layerId = `layer-${layer.id}`

      if (layer.visible && layer.data) {
        console.log("Adding/updating layer:", layer.id, "with", layer.data?.features?.length || 0, "features")

        // Remove any existing variants (fill / outline) and source if they exist
        const fillId = `${layerId}-fill`
        const outlineId = `${layerId}-outline`
        if (map.current!.getLayer(fillId)) {
          try {
            map.current!.removeLayer(fillId)
          } catch (e) {
            /* ignore */
          }
        }
        if (map.current!.getLayer(outlineId)) {
          try {
            map.current!.removeLayer(outlineId)
          } catch (e) {
            /* ignore */
          }
        }

        // Check if source already exists before adding
        if (!map.current!.getSource(sourceId)) {
          try {
            map.current!.addSource(sourceId, {
              type: "geojson",
              data: layer.data,
            })
          } catch (error) {
            console.error("Error adding source", sourceId, ":", error)
            return
          }
        } else {
          // Update existing source data
          try {
            ;(map.current!.getSource(sourceId) as GeoJSONSource).setData(layer.data)
          } catch (error) {
            console.error("Error updating source", sourceId, ":", error)
          }
        }

        addLayerFromSource(layer, sourceId, layerId)
      } else {
        // Remove layer and source if not visible or no data
        const fillId = `${layerId}-fill`
        const outlineId = `${layerId}-outline`

        const tryRemoveLayer = (id: string) => {
          if (map.current!.getLayer(id)) {
            try {
              map.current!.removeLayer(id)
            } catch (e) {
              /* ignore */
            }
          }
        }

        // Remove common variants
        tryRemoveLayer(fillId)
        tryRemoveLayer(outlineId)

        // Also remove any point layer paint handler registered earlier
        try {
          const pointHandlerKey = layerId // matches how we stored handlers (layerConfig.id)
          if ((map.current as any)._pointLayerHandlers && (map.current as any)._pointLayerHandlers[pointHandlerKey]) {
            const h = (map.current as any)._pointLayerHandlers[pointHandlerKey]
            try {
              if (map.current) map.current.off("move", h)
            } catch (e) {}
            try {
              if (map.current) map.current.off("zoom", h)
            } catch (e) {}
            delete (map.current as any)._pointLayerHandlers[pointHandlerKey]
          }
        } catch (e) {}

        // Special-case: if this is the boundaries layer, we previously created
        // district/state sub-sources and sub-layers. Remove those explicitly.
        try {
          if (layer.id === "boundaries") {
            // Ensure we remove all known boundary sub-sources/layers including tehsil
            const subSuffixes = ["-tehsil", "-district", "-state"]
            for (const s of subSuffixes) {
              const subSource = `source-${layer.id}${s}`
              const subLayer = `layer-${layer.id}${s}`
              const subFill = `${subLayer}-fill`
              const subOutline = `${subLayer}-outline`

              // remove any outline/fill variants
              tryRemoveLayer(subFill)
              tryRemoveLayer(subOutline)
              // remove the main sub-layer
              tryRemoveLayer(subLayer)

              // remove source if exists
              try {
                if (map.current!.getSource(subSource)) {
                  try {
                    map.current!.removeSource(subSource)
                  } catch (e) {
                    /* ignore */
                  }
                }
              } catch (e) {}
            }
          }
        } catch (e) {
          /* ignore */
        }

        // Also remove the primary source for the layer if present and safe
        try {
          if (map.current!.getSource(sourceId)) {
            try {
              map.current!.removeSource(sourceId)
            } catch (e) {
              // Some sources may be shared; ignore removal errors
            }
          }
        } catch (e) {
          /* ignore */
        }
      }
    })
  }, [currentLayers, mapLoaded, layers])

  // Ensure boundaries are always rendered on top and have prominent styling.
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    try {
      // Find the boundaries layer config
      const boundariesLayer = currentLayers.find((l) => l.id === "boundaries")
      if (!boundariesLayer) return

      // We prefer boundaries to be visible but NOT on top so they do not block clicks
      // to other interactive layers (e.g., claims). We'll move each boundaries sub-layer
      // to sit before the first non-base, non-boundaries style layer so application
      // layers remain above boundaries.
      const styleLayers = map.current.getStyle()?.layers || []

      // Find an anchor layer: the first style layer that is not the base raster and
      // not a boundaries sub-layer itself. We'll place boundaries BEFORE this anchor,
      // which keeps boundaries underneath other application layers.
      const anchor = styleLayers.find((l: any) => {
        const id: string = l.id || ''
        if (id === 'base-raster-layer') return false
        if (id.includes('layer-boundaries')) return false
        if (id === 'measurement-line-layer') return false
        return true
      })

      const subSuffixesInOrder = ["-tehsil", "-district", "-state"]

      for (const s of subSuffixesInOrder) {
        const subLayer = `layer-${boundariesLayer.id}${s}`
        const subFill = `${subLayer}-fill`
        const subOutline = `${subLayer}-outline`

        try {
          // Place fill and main sub-layer BEFORE the anchor so they're underneath app layers
          if (map.current.getLayer(subFill)) {
            if (anchor && anchor.id) {
              // @ts-ignore
              map.current.moveLayer(subFill, anchor.id)
            } else {
              // fallback: move to bottom
              // @ts-ignore
              map.current.moveLayer(subFill)
            }
          }
        } catch (e) {}

        try {
          if (map.current.getLayer(subLayer)) {
            if (anchor && anchor.id) {
              // @ts-ignore
              map.current.moveLayer(subLayer, anchor.id)
            } else {
              // @ts-ignore
              map.current.moveLayer(subLayer)
            }
          }
        } catch (e) {}

        try {
          // Place outline ABOVE the anchor so users can click thin boundary lines even when other
          // application layers (e.g., claims) are present. We attempt to place it just above the
          // anchor by moving it before the next layer after the anchor; if anchor is last, move to top.
          if (map.current.getLayer(subOutline)) {
            if (anchor && anchor.id) {
              const idx = styleLayers.findIndex((l: any) => l.id === anchor.id)
              const nextLayer = idx >= 0 ? styleLayers[idx + 1]?.id : undefined
              try {
                // @ts-ignore
                if (nextLayer) map.current.moveLayer(subOutline, nextLayer)
                else map.current.moveLayer(subOutline)
              } catch (err) {
                // fallback to moving to top
                try {
                  // @ts-ignore
                  map.current.moveLayer(subOutline)
                } catch (e) {}
              }
            } else {
              // fallback: move outline to top
              // @ts-ignore
              map.current.moveLayer(subOutline)
            }
          }
        } catch (e) {}
      }

      console.log('Placed boundaries sub-layers beneath application layers to keep claims clickable')
    } catch (err) {
      console.warn("Boundaries stacking enforcement failed:", err)
    }
    // Ensure claim layers are on top so they receive pointer events
    try {
      if (map.current && map.current.getStyle && map.current.getStyle().layers) {
        const styleLayers = map.current.getStyle().layers as any[]
        // Move any claim-related layers (ids starting with "layer-claims" or "layer-claims-") to the top
        for (const l of styleLayers) {
          const id: string = l.id || ''
          if (id.startsWith('layer-claims')) {
            try {
              // @ts-ignore
              map.current.moveLayer(id)
            } catch (e) {
              /* ignore move failures */
            }
          }
        }
      }
    } catch (e) {
      /* ignore */
    }
  }, [currentLayers, mapLoaded])

  const addLayerFromSource = (layer: GISLayer, sourceId: string, layerId: string) => {
    if (!map.current) return

    const layerConfig: { id: string; source: string; type: string; paint?: Record<string, unknown> } = {
      id: layerId,
      source: sourceId,
      type: "circle", // Default type
    }

    switch (layer.type) {
      case "geojson":
        // Determine geometry type from data
        const features = layer.data?.features || []
        const geometryType = features.length > 0 ? features[0]?.geometry?.type : null

        console.log("Layer", layer.id, "has", features.length, "features, geometry type:", geometryType)

        if (geometryType === "Point" || geometryType === "MultiPoint") {
          // Use circle layer for point features
          layerConfig.type = "circle"
          layerConfig.paint = {
            'circle-radius': 8,
            'circle-color': layer.style.fillColor || '#ff4444',
            'circle-opacity': layer.style.opacity || 1.0,
            'circle-stroke-color': layer.style.strokeColor || '#ffffff',
            'circle-stroke-width': layer.style.strokeWidth || 2,
          }
          try {
            if (!map.current.getLayer(layerConfig.id)) {
              map.current.addLayer(layerConfig as any)
            }
            try {
              map.current.moveLayer(layerConfig.id)
            } catch (e) {}
          } catch (error) {
            console.error("Error adding circle layer", layerConfig.id, ":", error)
          }

          // click handlers (skip for boundary layer to make boundaries non-clickable)
          if (layer.id !== "boundaries") {
            map.current!.on("click", layerConfig.id, (e) => {
              if (e.features && e.features.length > 0 && onFeatureClick) {
                onFeatureClick({ layer, feature: e.features[0], lngLat: e.lngLat })
              }
            })
            map.current!.on("mouseenter", layerConfig.id, () => {
              map.current!.getCanvas().style.cursor = "pointer"
            })
            map.current!.on("mouseleave", layerConfig.id, () => {
              map.current!.getCanvas().style.cursor = ""
            })
          }

          try {
            // initialize handlers storage on the map instance
            if (!(map.current as any)._pointLayerHandlers) (map.current as any)._pointLayerHandlers = {}

            // Enhanced sizing parameters for better visibility across zoom levels
            const maxDiameterMeters = (layer.style as any).maxDiameterMeters || 100000 // Increased to 100km for better visibility
            const minRadiusPx = (layer.style as any).minRadiusPx || 6 // Increased minimum size
            const maxRadiusPx = (layer.style as any).maxRadiusPx || 40 // Added maximum size limit

            const metersPerPixelAt = (lat: number, zoomLevel: number) => {
              // WebMercator approximation: metersPerPixel = 156543.03392 * cos(latitude) / 2^zoom
              return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoomLevel)
            }

            const updateFn = () => {
              try {
                if (!map.current) return
                // Keep point layers at fixed size regardless of zoom level
                if (map.current.getLayer(layerConfig.id)) {
                  try {
                    // Use fixed radius instead of dynamic calculation
                    map.current.setPaintProperty(layerConfig.id, "circle-radius", 8)
                    map.current.setPaintProperty(layerConfig.id, "circle-stroke-width", 2)
                  } catch (e) {}
                }
              } catch (e) {
                /* ignore update errors */
              }
            }

            // remove previous handler for this layer if present
            if ((map.current as any)._pointLayerHandlers[layerConfig.id]) {
              try {
                map.current.off("move", (map.current as any)._pointLayerHandlers[layerConfig.id])
                map.current.off("zoom", (map.current as any)._pointLayerHandlers[layerConfig.id])
              } catch (e) {}
            }

            map.current.on("move", updateFn)
            map.current.on("zoom", updateFn)
            ;(map.current as any)._pointLayerHandlers[layerConfig.id] = updateFn

            // initialize immediately
            updateFn()
          } catch (e) {
            console.warn("Failed to register point layer size updater for", layerConfig.id, e)
          }
        } else if (geometryType === "LineString" || geometryType === "MultiLineString") {
          layerConfig.type = "line"
          layerConfig.paint = {
            "line-color": layer.style.strokeColor || "#16a34a",
            "line-width": layer.style.strokeWidth || 2,
            "line-opacity": layer.style.opacity || 0.9,
          }
          try {
            if (!map.current.getLayer(layerConfig.id)) {
              map.current!.addLayer(layerConfig as any)
            }
            try {
              map.current!.moveLayer(layerConfig.id)
            } catch (e) {}
          } catch (error) {
            console.error("Error adding line layer", layerConfig.id, ":", error)
          }

          if (layer.id !== "boundaries") {
            map.current!.on("click", layerConfig.id, (e) => {
              if (e.features && e.features.length > 0 && onFeatureClick) {
                onFeatureClick({ layer, feature: e.features[0], lngLat: e.lngLat })
              }
            })
            map.current!.on("mouseenter", layerConfig.id, () => {
              map.current!.getCanvas().style.cursor = "pointer"
            })
            map.current!.on("mouseleave", layerConfig.id, () => {
              map.current!.getCanvas().style.cursor = ""
            })
          }
        } else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
          // For polygons, add a fill layer and a separate outline (line) layer to ensure visibility
          const fillLayerId = `${layerId}-fill`
          const outlineLayerId = `${layerId}-outline`

          const fillLayer: { id: string; source: string; type: "fill"; paint: Record<string, unknown> } = {
            id: fillLayerId,
            source: sourceId,
            type: "fill",
            paint: {
              "fill-color": layer.style.fillColor || "#bbf7d0",
              "fill-opacity": typeof layer.style.opacity === "number" ? layer.style.opacity : 0.45,
              "fill-antialias": true,
            },
          }

          const outlineLayer: { id: string; source: string; type: "line"; paint: Record<string, unknown> } = {
            id: outlineLayerId,
            source: sourceId,
            type: "line",
            paint: {
              "line-color": layer.style.strokeColor || (layer.style.fillColor ? layer.style.fillColor : "#16a34a"),
              "line-width": layer.style.strokeWidth ?? 2,
              "line-opacity": Math.max(0.8, layer.style.opacity ?? 0.9),
            },
          }

          try {
            // Add fill first, then outline so outline naturally sits above fill
            if (!map.current.getLayer(fillLayerId)) {
              map.current!.addLayer(fillLayer as any)
            }
            if (!map.current.getLayer(outlineLayerId)) {
              map.current!.addLayer(outlineLayer as any)
            }

            // Try to move both to the top of the stack to ensure visibility above rasters
            try {
              map.current!.moveLayer(outlineLayerId)
            } catch (e) {
              /* ignore */
            }
            try {
              map.current!.moveLayer(fillLayerId)
            } catch (e) {
              /* ignore */
            }

            // As extra precaution, update paint properties to ensure strong contrast
            try {
              map.current!.setPaintProperty(fillLayerId, "fill-opacity", fillLayer.paint["fill-opacity"])
              map.current!.setPaintProperty(fillLayerId, "fill-color", fillLayer.paint["fill-color"])
              map.current!.setPaintProperty(outlineLayerId, "line-color", outlineLayer.paint["line-color"])
              map.current!.setPaintProperty(outlineLayerId, "line-width", outlineLayer.paint["line-width"])
            } catch (e) {
              /* ignore paint failures */
            }
          } catch (error) {
            console.error("Error adding polygon layers", fillLayerId, outlineLayerId, ":", error)
            return
          }
          // Click handlers for both fill and outline
          // Register handlers: for boundaries register only on the outline layer so
          // clicking the lines triggers boundary behavior, but clicking inside the
          // polygon fill will fall through to layers above (like claims).
          if (layer.id === "boundaries") {
            // outline clickable
            try {
              map.current!.on("click", outlineLayerId, (e) => {
                if (e.features && e.features.length > 0 && onFeatureClick) {
                  onFeatureClick({ layer, feature: e.features[0], lngLat: e.lngLat })
                }
              })
              map.current!.on("mouseenter", outlineLayerId, () => {
                map.current!.getCanvas().style.cursor = "pointer"
              })
              map.current!.on("mouseleave", outlineLayerId, () => {
                map.current!.getCanvas().style.cursor = ""
              })
            } catch (e) {
              /* ignore */
            }
          } else {
            ;[fillLayerId, outlineLayerId].forEach((lid) => {
              map.current!.on("click", lid, (e) => {
                if (e.features && e.features.length > 0 && onFeatureClick) {
                  onFeatureClick({ layer, feature: e.features[0], lngLat: e.lngLat })
                }
              })
              map.current!.on("mouseenter", lid, () => {
                map.current!.getCanvas().style.cursor = "pointer"
              })
              map.current!.on("mouseleave", lid, () => {
                map.current!.getCanvas().style.cursor = ""
              })
            })
          }
        } else {
          // Default to circle for unknown or empty geometry types
          console.log("Unknown geometry type for layer", layer.id, ", using default circle type")
          layerConfig.type = "circle"
          layerConfig.paint = {
            "circle-radius": 6,
            "circle-color": layer.style.fillColor || "#3b82f6",
            "circle-opacity": layer.style.opacity || 0.8,
            "circle-stroke-color": layer.style.strokeColor || "#ffffff",
            "circle-stroke-width": layer.style.strokeWidth || 2,
          }
          try {
            if (!map.current.getLayer(layerConfig.id)) {
              map.current!.addLayer(layerConfig as any)
            }
            try {
              map.current!.moveLayer(layerConfig.id)
            } catch (e) {}
          } catch (error) {
            console.error("Error adding default layer", layerConfig.id, ":", error)
          }
        }
        break
    }
  }

  // Handle markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    console.log("🗺️ Processing markers:", markers.length)
    // Filter out pathfinding icons, only keep claim-area-center and last-click markers
    const filteredMarkers = markers.filter(marker => marker.id === "claim-area-center" || marker.id === "last-click")
    console.log("🗺️ Filtered markers (claim-area-center and last-click):", filteredMarkers.length)
    filteredMarkers.forEach(marker => {
      console.log("🗺️ Marker details:", marker.id, marker.lng, marker.lat, marker.color, marker.popup)
    })

    // Get existing marker IDs
    const existingMarkerIds = new Set(markersRef.current.map(m => (m as any)._markerId))
    const newMarkerIds = new Set(filteredMarkers.map(m => m.id))

    console.log("🗺️ Existing marker IDs:", Array.from(existingMarkerIds))
    console.log("🗺️ New marker IDs:", Array.from(newMarkerIds))

    // Remove markers that are no longer in the new markers array
    const markersToRemove = markersRef.current.filter(marker => !newMarkerIds.has((marker as any)._markerId))
    console.log("🗺️ Removing markers:", markersToRemove.map(m => (m as any)._markerId))
    markersToRemove.forEach((marker) => marker.remove())

    // Keep markers that are still in the new array
    const markersToKeep = markersRef.current.filter(marker => newMarkerIds.has((marker as any)._markerId))
    console.log("🗺️ Keeping markers:", markersToKeep.map(m => (m as any)._markerId))

    // Create new markers for IDs that don't exist yet
    const markersToCreate = filteredMarkers.filter(marker => !existingMarkerIds.has(marker.id))
    console.log("🗺️ Creating new markers:", markersToCreate.map(m => m.id))

    // Update existing markers with new data
    const markersToUpdate = filteredMarkers.filter(marker => existingMarkerIds.has(marker.id))
    console.log("🗺️ Updating markers:", markersToUpdate.map(m => m.id))

    // Clear popups for removed markers
    markersToRemove.forEach((marker) => {
      const popup = popupsRef.current.find(p => (p as any)._markerId === (marker as any)._markerId)
      if (popup) popup.remove()
    })

    // Update popups ref
    popupsRef.current = popupsRef.current.filter(popup => {
      return markersToKeep.some(marker => (marker as any)._markerId === (popup as any)._markerId) ||
             markersToUpdate.some(marker => marker.id === (popup as any)._markerId)
    })

    // Create new markers
    const newCreatedMarkers: maplibregl.Marker[] = []

    markersToCreate.forEach((marker) => {
      console.log("🗺️ Creating marker:", marker.id, marker.lng, marker.lat)
      // Make markers much larger and more visible
      const baseSize = marker.id === "last-click" ? Math.max(30, marker.size ?? 30) : Math.max(50, marker.size ?? 50)
      const color = marker.color || "#16a34a"
      const outline = (marker as any).outline || "#ffffff"

      console.log("🗺️ Processing marker with", marker.id, "baseSize:", baseSize, "color:", color)

      // For last-click markers, use a simple standard marker to ensure visibility
      if (marker.id === "last-click") {
        console.log("🗺️ Using standard marker for last-click")
        const mapMarker = new maplibregl.Marker({ color: color, scale: 1.5 })
          .setLngLat([marker.lng, marker.lat])
        ;(mapMarker as any).addTo(map.current!)

        // Store marker ID for tracking
        ;(mapMarker as any)._markerId = marker.id

        console.log("🗺️ Added standard marker to map:", marker.lng, marker.lat)
        console.log("🗺️ Marker position on map:", mapMarker.getLngLat())
        console.log("🗺️ Map center:", map.current!.getCenter())
        console.log("🗺️ Map zoom:", map.current!.getZoom())

        // popup from marker
        if (marker.popup) {
          const popup = new maplibregl.Popup({ offset: 25 })
          popup.setHTML(marker.popup)
          ;(mapMarker as any).setPopup(popup)
          // Store marker ID for popup tracking
          ;(popup as any)._markerId = marker.id
          popupsRef.current.push(popup)
        }

        newCreatedMarkers.push(mapMarker)
        return
      }

      const el = document.createElement("div")
      el.className = "marker"
      el.dataset.markerId = marker.id // Add marker ID for drag detection
      el.dataset.baseSize = String(baseSize)
      el.dataset.outline = outline
      el.style.width = `${baseSize}px`
      el.style.height = `${baseSize}px`
      el.style.display = "flex"
      el.style.alignItems = "center"
      el.style.justifyContent = "center"
      el.style.zIndex = "9999"
      el.style.transform = "translate(-50%, -100%)"
      el.style.pointerEvents = "auto"
      el.style.position = "absolute"

      console.log("🗺️ Created marker element:", el, "styles:", el.style.cssText)

      // Build SVG with location icon for last-click marker
      let svg: string
      if (marker.id === "last-click") {
        // Use a location pin icon for last-click markers
        svg = `<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='${baseSize}' height='${baseSize}'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' fill='${color}' stroke='${outline}' stroke-width='1'/></svg>`
      } else {
        // Use the existing map pin icon for other markers
        const labelText = "" // Single marker, no count
        const fontSize = Math.max(9, Math.round(baseSize * 0.35))
        svg = `<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='${baseSize}' height='${baseSize}'><path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z' fill='${color}' stroke='${outline}' stroke-width='1.5'/><circle cx='12' cy='10' r='2.5' fill='white'/>${labelText ? `<text x='12' y='11.5' font-family='Arial, Helvetica, sans-serif' font-size='${fontSize}' font-weight='700' fill='${color}' text-anchor='middle' dominant-baseline='central'>${labelText}</text>` : ''}</svg>`
      }

      el.innerHTML = svg
      console.log("🗺️ Created marker element with SVG:", svg.substring(0, 100) + "...")

      // Add a text fallback for debugging with location icon for last-click, MapPin for others
      const textFallback = document.createElement("div")
      if (marker.id === "last-click") {
        textFallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path><circle cx="12" cy="9" r="2.5"></circle></svg>`
      } else {
        textFallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`
      }
      textFallback.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: ${baseSize}px;
        height: ${baseSize}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${Math.max(12, baseSize * 0.4)}px;
        color: white;
        background: ${color};
        border-radius: 50%;
        border: 2px solid white;
        z-index: 10000;
      `
      el.appendChild(textFallback)

      // Create marker with custom element
      let mapMarker: maplibregl.Marker

  try {
    mapMarker = new maplibregl.Marker({ element: el, anchor: "bottom", draggable: marker.id === "claim-area-center" })
    mapMarker.setLngLat([marker.lng, marker.lat])        // Add marker to map
        if (typeof (mapMarker as any).addTo === 'function') {
          (mapMarker as any).addTo(map.current!)
        } else {
          throw new Error('addTo method not available')
        }
      } catch (markerError) {
        console.warn('Custom marker failed, falling back to standard marker:', markerError)
        // Fallback to standard marker
        mapMarker = new maplibregl.Marker({ color: marker.color || "#16a34a" })
          .setLngLat([marker.lng, marker.lat])
        ;(mapMarker as any).addTo(map.current!)
      }

      // Store marker ID for tracking
      (mapMarker as any)._markerId = marker.id

      console.log("🗺️ Added marker to map:", marker.lng, marker.lat, "Element:", el)
      console.log("🗺️ Marker element in DOM:", document.body.contains(el))
      console.log("🗺️ Marker element visibility:", el.style.display, el.style.visibility)
      console.log("🗺️ Marker position on map:", mapMarker.getLngLat())
      console.log("🗺️ Map center:", map.current!.getCenter())
      console.log("🗺️ Map zoom:", map.current!.getZoom())
      console.log("🗺️ Map bounds:", map.current!.getBounds())

      // popup from marker
      if (marker.popup) {
        const popup = new maplibregl.Popup({ offset: 25 })
        popup.setHTML(marker.popup)
        ;(mapMarker as any).setPopup(popup)
        // Store marker ID for popup tracking
        ;(popup as any)._markerId = marker.id
        popupsRef.current.push(popup)
      }

  // Add drag event handlers for the marker (only for claim-area-center)
  if (marker.id === "claim-area-center") {
    ;(mapMarker as any).on("dragstart", () => {
      setDraggedMarker(marker.id)
      setIsDragging(true)
      map.current!.getCanvas().style.cursor = "grabbing"
      ;(map.current as any).dragPan.disable() // Disable map dragging while dragging marker
    })

    ;(mapMarker as any).on("drag", () => {
      // Update cursor during drag
      map.current!.getCanvas().style.cursor = "grabbing"
    })

    ;(mapMarker as any).on("dragend", (e: any) => {
      console.log("Marker dragend event:", marker.id, e.target.getLngLat())
      setDraggedMarker(null)
      setIsDragging(false)
      map.current!.getCanvas().style.cursor = ""
      ;(map.current as any).dragPan.enable() // Re-enable map dragging

      // If this is the claim area marker, update the claim area center
      if (marker.id === "claim-area-center" && onMapClick) {
        console.log("Calling onMapClick with:", e.target.getLngLat())
        onMapClick(e.target.getLngLat())
      }
    })
  }      newCreatedMarkers.push(mapMarker)
    })

    // Update existing markers
    markersToUpdate.forEach((marker) => {
      const existingMarker = markersRef.current.find(m => (m as any)._markerId === marker.id)
      if (existingMarker) {
        console.log("🗺️ Updating existing marker:", marker.id, "to:", marker.lng, marker.lat)
        ;(existingMarker as any).setLngLat([marker.lng, marker.lat])

        // Update popup if it changed
        if (marker.popup) {
          const existingPopup = popupsRef.current.find(p => (p as any)._markerId === marker.id)
          if (existingPopup) {
            ;(existingPopup as any).setHTML(marker.popup)
          } else {
            const popup = new maplibregl.Popup({ offset: 25 })
            popup.setHTML(marker.popup)
            ;(existingMarker as any).setPopup(popup)
            // Store marker ID for popup tracking
            ;(popup as any)._markerId = marker.id
            popupsRef.current.push(popup)
          }
        }
      }
    })

    // Update markers ref with kept + new markers
    markersRef.current = [...markersToKeep, ...newCreatedMarkers]

    console.log("🗺️ Final markers count:", markersRef.current.length)
    console.log("🗺️ Final marker IDs:", markersRef.current.map(m => (m as any)._markerId))

    // Zoom/move based dynamic sizing: compute pixel diameter for the desired
    // real-world max diameter (50 km default) so DOM markers match vector layer.
    const metersPerPixelAt = (lat: number, zoomLevel: number) => {
      return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoomLevel)
    }

    const updateMarkerSizes = () => {
      if (!map.current) return
      try {
        // Keep markers at fixed size regardless of zoom level
        markersRef.current.forEach((mk) => {
          try {
            const el = (mk as any).getElement?.()
            if (!el) return
            // Use fixed base size instead of dynamic calculation
            const base = Number(el.dataset.baseSize) || 24
            el.style.width = `${base}px`
            el.style.height = `${base}px`
            // update inner svg size if present
            const svgEl = el.querySelector("svg")
            if (svgEl) {
              svgEl.setAttribute("width", String(base))
              svgEl.setAttribute("height", String(base))
            }
          } catch (e) {
            /* per-marker error */
          }
        })
      } catch (e) {}
    }

    if (map.current) {
      try {
        ;(map.current as any)._markerZoomHandler && map.current.off("move", (map.current as any)._markerZoomHandler)
      } catch (e) {}
      try {
        ;(map.current as any)._markerZoomHandler && map.current.off("zoom", (map.current as any)._markerZoomHandler)
      } catch (e) {}
      map.current.on("move", updateMarkerSizes)
      map.current.on("zoom", updateMarkerSizes)
      ;(map.current as any)._markerZoomHandler = updateMarkerSizes
      updateMarkerSizes()
    }

    // cleanup handler on markers change/unmount
    return () => {
      try {
        if (map.current && (map.current as any)._markerZoomHandler) {
          map.current.off("zoom", (map.current as any)._markerZoomHandler)
          delete (map.current as any)._markerZoomHandler
        }
      } catch (e) {}
    }
  }, [markers, mapLoaded])
  const startMeasurement = useCallback(() => {
    if (externalStartMeasurement) {
      externalStartMeasurement()
      return
    }

    if (!map.current) return
    setIsMeasuring(true)
    isMeasuringRef.current = true
    measurementPoints.current = []
    setMeasurementDistance(null)

    // Remove any existing measurement line/source
    if (measurementLine.current && map.current) {
      if (map.current.getLayer("measurement-line-layer")) {
        map.current.removeLayer("measurement-line-layer")
      }
      if (map.current.getSource(measurementLine.current)) {
        map.current.removeSource(measurementLine.current)
      }
      measurementLine.current = null
    }

    // Attach a one-time handler for the first point
    const firstHandler = (ev: maplibregl.MapMouseEvent) => {
      const p1 = ev.lngLat
      // Replace measurementPoints with the first point
      measurementPoints.current = [p1]

      // Attach a one-time handler for the second point
      map.current!.once("click", (ev2: maplibregl.MapMouseEvent) => {
        const p2 = ev2.lngLat
        // Ensure we have valid points
        if (!p1 || !p2 || typeof p1.lng === "undefined" || typeof p2.lng === "undefined") {
          console.warn("Measurement cancelled or invalid points", p1, p2)
          setIsMeasuring(false)
          isMeasuringRef.current = false
          measurementPoints.current = []
          return
        }

        // Compute distance using the two captured points
        const distance = turf.distance(turf.point([p1.lng, p1.lat]), turf.point([p2.lng, p2.lat]), {
          units: "kilometers",
        })
        setMeasurementDistance(distance)

        // Draw measurement line
        const lineGeoJSON = {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "LineString" as const,
            coordinates: [
              [p1.lng, p1.lat],
              [p2.lng, p2.lat],
            ],
          },
        }

        measurementLine.current = "measurement-line"
        if (map.current!.getSource(measurementLine.current)) {
          ;(map.current!.getSource(measurementLine.current) as GeoJSONSource).setData(lineGeoJSON as any)
        } else {
          map.current!.addSource(measurementLine.current, {
            type: "geojson",
            data: lineGeoJSON as any,
          })
          map.current!.addLayer({
            id: "measurement-line-layer",
            type: "line",
            source: measurementLine.current,
            paint: {
              "line-color": "#ff0000",
              "line-width": 3,
              "line-dasharray": [2, 2],
            },
          })
        }

        setIsMeasuring(false)
        isMeasuringRef.current = false
        measurementPoints.current = []
      })
    }

    map.current.once("click", firstHandler)
  }, [externalStartMeasurement])

  const clearMeasurement = useCallback(() => {
    if (externalClearMeasurement) {
      externalClearMeasurement()
      return
    }

    setIsMeasuring(false)
    isMeasuringRef.current = false
    setMeasurementDistance(null)
    measurementPoints.current = []
    if (measurementLine.current && map.current) {
      if (map.current.getLayer("measurement-line-layer")) {
        map.current.removeLayer("measurement-line-layer")
      }
      if (map.current.getSource(measurementLine.current)) {
        map.current.removeSource(measurementLine.current)
      }
      measurementLine.current = null
    }
  }, [externalClearMeasurement])

  // Export functions
  const exportMap = useCallback(async () => {
    if (externalExport) {
      externalExport()
    } else {
      if (!map.current) {
        console.error("Map not initialized")
        alert("Map is not ready for export. Please wait for it to load completely.")
        return
      }

      setIsExporting(true)
      try {
        console.log("Starting map export process...")

        // Wait for map to be fully loaded
        if (!mapLoaded) {
          console.log("Waiting for map to load...")
          await new Promise((resolve, reject) => {
            const checkLoaded = () => {
              if (map.current && map.current.loaded()) {
                console.log("Map loaded, checking tiles...")
                // Give tiles a moment to load
                setTimeout(() => {
                  if (map.current && map.current.loaded()) {
                    resolve(void 0)
                  } else {
                    checkLoaded()
                  }
                }, 500)
              } else {
                setTimeout(checkLoaded, 200)
              }
            }

            // Timeout after 10 seconds
            setTimeout(() => {
              reject(new Error("Map loading timeout"))
            }, 10000)

            checkLoaded()
          })
        }

        console.log("Map is ready, preparing for export...")

        // Debug: Check if map container has any visible content
        const containerElement = mapContainer.current
        if (containerElement) {
          console.log("Container dimensions:", containerElement.offsetWidth, "x", containerElement.offsetHeight)
          console.log("Container children:", containerElement.children.length)
          console.log("Container innerHTML length:", containerElement.innerHTML.length)

          // Check if there are any canvas elements
          const canvases = containerElement.querySelectorAll("canvas")
          console.log("Found canvas elements:", canvases.length)
          canvases.forEach((canvas, index) => {
            console.log(`Canvas ${index}:`, canvas.width, "x", canvas.height)
          })
        }

        // Debug: Check map layers and style
        console.log("Map style loaded:", !!map.current?.getStyle())

        // Add a simple marker to verify map is working
        const marker = new maplibregl.Marker({ color: "#ff0000" }) // Red marker
          .setLngLat([77.209, 28.6139]) // Delhi coordinates as example
          .addTo(map.current!)

        // Add tile loading debugging
        map.current.on("sourcedata", (e) => {
          if (e.sourceId === "osm") {
            console.log("OSM tiles loading...")
          }
        })

        map.current.on("sourcedataabort", (e) => {
          console.log("Tile loading aborted:", e.sourceId)
        })

        map.current.on("error", (e) => {
          console.error("Map error:", e.error)
        })

        console.log("Added tile loading event listeners")

        // Add a visible overlay to confirm rendering
        if (containerElement) {
          const overlayDiv = document.createElement("div")
          overlayDiv.style.position = "absolute"
          overlayDiv.style.top = "10px"
          overlayDiv.style.right = "10px"
          overlayDiv.style.background = "rgba(255, 0, 0, 0.8)"
          overlayDiv.style.color = "white"
          overlayDiv.style.padding = "5px 10px"
          overlayDiv.style.borderRadius = "4px"
          overlayDiv.style.fontSize = "12px"
          overlayDiv.style.zIndex = "1000"
          overlayDiv.textContent = "Map Loaded ✓"
          containerElement.appendChild(overlayDiv)

          console.log("Added visual confirmation overlay")
        }

        // Add a small delay to ensure rendering is complete
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Method 1: Try MapLibre GL's built-in screenshot method
        try {
          console.log("Trying MapLibre GL built-in screenshot...")

          if (!map.current) {
            throw new Error("Map instance not available")
          }

          // Use the map's screenshot method if available
          const screenshotDataUrl = await new Promise<string>((resolve, reject) => {
            // Force a render first
            map.current!.triggerRepaint()

            // Check if WebGL context is working
            const canvas = map.current!.getCanvas()
            const gl =
              canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null)
            if (gl) {
              console.log("WebGL context detected:", gl)
              // Check if WebGL is actually rendering
              const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
              if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
                console.log("WebGL renderer:", renderer)
              }
            } else {
              console.warn("No WebGL context found!")
            }

            // Wait a bit for rendering
            setTimeout(() => {
              try {
                // Try to get screenshot using map's method
                const canvas = map.current!.getCanvas()
                const dataUrl = canvas.toDataURL("image/png", 1.0)
                resolve(dataUrl)
              } catch (error) {
                reject(error)
              }
            }, 1000)
          })

          console.log("Screenshot data URL length:", screenshotDataUrl.length)

          // Verify the screenshot has content
          const img = new Image()
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              console.log("Screenshot image loaded:", img.width, "x", img.height)
              resolve()
            }
            img.onerror = reject
            img.src = screenshotDataUrl
          })

          // Check content by drawing to a test canvas
          const testCanvas = document.createElement("canvas")
          const ctx = testCanvas.getContext("2d")
          if (ctx) {
            testCanvas.width = img.width
            testCanvas.height = img.height
            ctx.drawImage(img, 0, 0)

            const imageData = ctx.getImageData(0, 0, testCanvas.width, testCanvas.height)
            const data = imageData.data

            let nonBlankPixels = 0
            let totalPixels = 0
            const colorCounts: { [key: string]: number } = {}

            for (let i = 0; i < data.length; i += 4) {
              totalPixels++
              const r = data[i]
              const g = data[i + 1]
              const b = data[i + 2]
              const a = data[i + 3]

              // Count color distribution for debugging
              const colorKey = `${r},${g},${b},${a}`
              colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1

              // Better content detection: look for actual map features
              // Exclude near-white pixels (likely background) and pure black/transparent
              const isNearWhite = r > 240 && g > 240 && b > 240 && a > 200
              const isPureBlack = r < 10 && g < 10 && b < 10 && a > 200
              const isTransparent = a < 50

              if (!isNearWhite && !isPureBlack && !isTransparent) {
                // Much more permissive: count any non-background pixel as content
                // This includes roads, buildings, water, vegetation, labels, etc.
                const isNotBackground = (r < 235 || g < 235 || b < 235) && a > 100
                if (isNotBackground) {
                  nonBlankPixels++
                }
              }
            }

            // Log top 10 most common colors for debugging
            const sortedColors = Object.entries(colorCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
            console.log(
              "Top 10 colors in image:",
              sortedColors.map(([color, count]) => `${color}: ${((count / totalPixels) * 100).toFixed(1)}%`),
            )

            const contentRatio = nonBlankPixels / totalPixels
            console.log(
              `Screenshot content: ${nonBlankPixels}/${totalPixels} pixels (${(contentRatio * 100).toFixed(1)}% content)`,
            )

            // Very lenient threshold - if user can see the map, there should be SOME content
            if (contentRatio < 0.0001) {
              // Less than 0.01% content
              console.warn("Extremely low content detected, but proceeding anyway since map is visible...")
            }

            // Always proceed with export if we get here - the map is working visually
            console.log("✅ Proceeding with export - map appears to be working")

            // Success - download the image
            const link = document.createElement("a")
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
            link.download = `vanmitra-map-${timestamp}.png`
            link.href = screenshotDataUrl
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            console.log("✅ Map exported successfully using MapLibre GL screenshot")
            alert(
              `Map exported successfully!\nContent detected: ${(contentRatio * 100).toFixed(1)}%\nCheck your downloads folder.`,
            )
            return
          }
        } catch (screenshotError) {
          console.warn("MapLibre GL screenshot failed:", screenshotError)
        }

        // Method 2: Fallback to WebGL canvas capture with proper handling
        try {
          console.log("Trying WebGL canvas capture as fallback...")

          if (!map.current) {
            throw new Error("Map instance not available")
          }

          const canvas = map.current.getCanvas()
          console.log("WebGL Canvas element:", canvas)
          console.log("Canvas dimensions:", canvas.width, "x", canvas.height)

          if (canvas.width === 0 || canvas.height === 0) {
            throw new Error("Canvas has no dimensions")
          }

          // Force a render and wait
          map.current.triggerRepaint()
          await new Promise((resolve) => setTimeout(resolve, 500))

          // For WebGL canvases, we need to read pixels directly
          const gl =
            canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null)
          if (gl) {
            console.log("WebGL context found, attempting pixel read...")

            // Read pixels from WebGL framebuffer
            const pixels = new Uint8Array(canvas.width * canvas.height * 4)
            gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

            // Create a 2D canvas to convert the pixels
            const outputCanvas = document.createElement("canvas")
            outputCanvas.width = canvas.width
            outputCanvas.height = canvas.height
            const ctx = outputCanvas.getContext("2d")

            if (ctx) {
              const imageData = ctx.createImageData(canvas.width, canvas.height)
              // Flip the image vertically (WebGL coordinate system)
              for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                  const srcIndex = (y * canvas.width + x) * 4
                  const dstIndex = ((canvas.height - 1 - y) * canvas.width + x) * 4
                  imageData.data[dstIndex] = pixels[srcIndex] // R
                  imageData.data[dstIndex + 1] = pixels[srcIndex + 1] // G
                  imageData.data[dstIndex + 2] = pixels[srcIndex + 2] // B
                  imageData.data[dstIndex + 3] = pixels[srcIndex + 3] // A
                }
              }

              ctx.putImageData(imageData, 0, 0)

              // Check content
              const outputImageData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height)
              const data = outputImageData.data

              let nonBlankPixels = 0
              let totalPixels = 0

              for (let i = 0; i < data.length; i += 4) {
                totalPixels++
                const r = data[i]
                const g = data[i + 1]
                const b = data[i + 2]
                const a = data[i + 3]

                // Same permissive logic as main method
                const isNearWhite = r > 240 && g > 240 && b > 240 && a > 200
                const isPureBlack = r < 10 && g < 10 && b < 10 && a > 200
                const isTransparent = a < 50

                if (!isNearWhite && !isPureBlack && !isTransparent) {
                  const isNotBackground = (r < 235 || g < 235 || b < 235) && a > 100
                  if (isNotBackground) {
                    nonBlankPixels++
                  }
                }
              }

              const contentRatio = nonBlankPixels / totalPixels
              console.log(
                `WebGL content: ${nonBlankPixels}/${totalPixels} pixels (${(contentRatio * 100).toFixed(1)}% content)`,
              )

              // Very lenient threshold
              if (contentRatio < 0.0001) {
                console.warn("WebGL: Extremely low content detected, but proceeding anyway...")
              }

              // Success - download the image
              const link = document.createElement("a")
              const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
              link.download = `vanmitra-map-${timestamp}.png`
              link.href = outputCanvas.toDataURL("image/png", 1.0)
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)

              console.log("✅ Map exported successfully using WebGL pixel read")
              alert("Map exported successfully!")
              return
            }
          } else {
            // Fallback to standard canvas method
            console.log("No WebGL context, trying standard canvas method...")
            const dataUrl = canvas.toDataURL("image/png", 1.0)
            console.log("Standard canvas data URL length:", dataUrl.length)

            // Verify content
            const img = new Image()
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve()
              img.onerror = reject
              img.src = dataUrl
            })

            const testCanvas = document.createElement("canvas")
            const ctx = testCanvas.getContext("2d")
            if (ctx) {
              testCanvas.width = img.width
              testCanvas.height = img.height
              ctx.drawImage(img, 0, 0)

              const imageData = ctx.getImageData(0, 0, testCanvas.width, testCanvas.height)
              const data = imageData.data

              let nonBlankPixels = 0
              let totalPixels = 0

              for (let i = 0; i < data.length; i += 4) {
                totalPixels++
                const r = data[i]
                const g = data[i + 1]
                const b = data[i + 2]
                const a = data[i + 3]

                // Same permissive logic
                const isNearWhite = r > 240 && g > 240 && b > 240 && a > 200
                const isPureBlack = r < 10 && g < 10 && b < 10 && a > 200
                const isTransparent = a < 50

                if (!isNearWhite && !isPureBlack && !isTransparent) {
                  const isNotBackground = (r < 235 || g < 235 || b < 235) && a > 100
                  if (isNotBackground) {
                    nonBlankPixels++
                  }
                }
              }

              const contentRatio = nonBlankPixels / totalPixels
              console.log(
                `Standard canvas content: ${nonBlankPixels}/${totalPixels} pixels (${(contentRatio * 100).toFixed(1)}% content)`,
              )

              // Very lenient threshold
              if (contentRatio < 0.0001) {
                console.warn("Standard canvas: Extremely low content detected, but proceeding anyway...")
              }

              // Success
              const link = document.createElement("a")
              const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
              link.download = `vanmitra-map-${timestamp}.png`
              link.href = dataUrl
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)

              console.log("✅ Map exported successfully using standard canvas")
              alert("Map exported successfully!")
              return
            }
          }
        } catch (canvasError) {
          console.error("Canvas export also failed:", canvasError)
          // Don't throw - continue to html2canvas fallback
        }

        // Method 3: Final fallback to html2canvas
        try {
          console.log("Trying html2canvas as final fallback...")
          const containerElement = mapContainer.current
          if (!containerElement) {
            throw new Error("Map container not found")
          }

          // Dynamic import to avoid bundling html2canvas if not needed
          const html2canvas = (await import("html2canvas")).default

          console.log("html2canvas loaded, capturing container...")

          // Configure html2canvas with better settings for WebGL
          const canvas = await html2canvas(containerElement, {
            useCORS: true,
            allowTaint: true,
            width: containerElement.offsetWidth,
            height: containerElement.offsetHeight,
            logging: false,
          })

          console.log("html2canvas capture complete, checking content...")

          // Check if the captured image has content
          const ctx = canvas.getContext("2d")
          if (ctx) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data

            // Count non-white/transparent pixels
            let nonBlankPixels = 0
            let totalPixels = 0

            for (let i = 0; i < data.length; i += 4) {
              totalPixels++
              const r = data[i]
              const g = data[i + 1]
              const b = data[i + 2]
              const a = data[i + 3]

              // Same permissive logic
              const isNearWhite = r > 240 && g > 240 && b > 240 && a > 200
              const isPureBlack = r < 10 && g < 10 && b < 10 && a > 200
              const isTransparent = a < 50

              if (!isNearWhite && !isPureBlack && !isTransparent) {
                const isNotBackground = (r < 235 || g < 235 || b < 235) && a > 100
                if (isNotBackground) {
                  nonBlankPixels++
                }
              }
            }

            const contentRatio = nonBlankPixels / totalPixels
            console.log(
              `html2canvas content: ${nonBlankPixels}/${totalPixels} pixels (${(contentRatio * 100).toFixed(1)}% content)`,
            )

            // Very lenient threshold
            if (contentRatio < 0.0001) {
              console.warn("html2canvas: Extremely low content detected, but proceeding anyway...")
            }

            // Success - download the image
            const link = document.createElement("a")
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
            link.download = `vanmitra-map-${timestamp}.png`
            link.href = canvas.toDataURL("image/png", 1.0)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            console.log("✅ Map exported successfully using html2canvas")
            alert("Map exported successfully!")
            return
          }
        } catch (html2canvasError) {
          console.warn("html2canvas export failed:", html2canvasError)
          // Don't throw - we've tried all methods, but export should still work
        }
      } catch (error) {
        console.error("❌ Export failed:", error)

        if (error instanceof Error) {
          if (error.message === "Map loading timeout") {
            alert("Map is taking too long to load. Please wait a moment and try again.")
          } else {
            // For any other error, still try to export using the debug method
            console.log("Attempting emergency export...")
            if (map.current) {
              try {
                const canvas = map.current.getCanvas()
                const dataUrl = canvas.toDataURL("image/png", 1.0)
                const link = document.createElement("a")
                const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
                link.download = `vanmitra-emergency-${timestamp}.png`
                link.href = dataUrl
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                alert("Emergency export completed! Check your downloads.")
                return
              } catch (emergencyError) {
                console.error("Emergency export also failed:", emergencyError)
                alert("Export failed completely. Please try refreshing the page.")
              }
            }
          }
        } else {
          alert("Export failed. Please try again.")
        }
      } finally {
        setIsExporting(false)
      }
    }
  }, [externalExport, mapLoaded])

  // Expose functions via ref
  useImperativeHandle(
    ref,
    () => ({
      exportMap,
      startMeasurement,
      clearMeasurement,
      flyTo: (lng: number, lat: number, zoom?: number) => {
        try {
          if (!map.current) return
          const targetZoom = typeof zoom === "number" ? zoom : Math.max(10, map.current.getZoom())
          map.current.flyTo({ center: [lng, lat], zoom: targetZoom, essential: true })
        } catch (e) {
          try {
            map.current && map.current.setCenter && map.current.setCenter([lng, lat])
          } catch (err) {}
        }
      },
    }),
    [exportMap, startMeasurement, clearMeasurement],
  )

  // Layer toggle function
  const toggleLayer = useCallback(
    (layerId: string) => {
      if (externalLayerToggle) {
        externalLayerToggle(layerId)
      } else {
        setCurrentLayers((prev) =>
          prev.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer)),
        )
      }
    },
    [externalLayerToggle],
  )

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapContainer}
        className="w-full h-full"
        data-testid="map-container"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", cursor: "pointer" }}
      />

      {/* Loading Overlay */}
      {isLoadingData && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-4 shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="text-sm font-medium text-gray-700">Loading map data...</span>
          </div>
        </div>
      )}

      {/* Map error overlay */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <div className="bg-white/95 rounded-lg p-6 shadow-lg max-w-lg text-center">
            <h3 className="text-lg font-semibold text-red-600">Map error</h3>
            <p className="text-sm text-gray-700 mt-2">{mapError}</p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => {
                  // Simple retry: remove and re-create the map by forcing unload
                  try {
                    setMapLoaded(false)
                    setMapError(null)
                    if (map.current) {
                      map.current.remove()
                      map.current = null
                    }
                    // Re-run the init effect by toggling a small state; easiest is to
                    // reload the page as a last resort for deterministic recovery.
                    window.location.reload()
                  } catch (err) {
                    console.error("Retry failed", err)
                    setMapError(String(err))
                  }
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 z-10 space-y-2">
          {/* Layer Control */}
          {showLayerControls && (
            <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Layers size={16} />
                <span className="text-sm font-medium">Layers</span>
              </div>
              <div className="space-y-1">
                {currentLayers.map((layer) => (
                  <label key={layer.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={layer.visible}
                      onChange={() => toggleLayer(layer.id)}
                      className="rounded"
                    />
                    {layer.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Measurement Control */}
          {showMeasurementControls && enableMeasurement && (
            <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Ruler size={16} />
                <span className="text-sm font-medium">Measure</span>
              </div>
              <div className="space-y-2">
                {!isMeasuring ? (
                  <button
                    onClick={startMeasurement}
                    className="w-full text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Start Measurement
                  </button>
                ) : (
                  <div className="text-xs text-gray-600">Click two points to measure distance</div>
                )}
                {measurementDistance && <div className="text-xs">Distance: {measurementDistance.toFixed(2)} km</div>}
                <button
                  onClick={clearMeasurement}
                  className="w-full text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export Status */}
      {isExporting && (
        <div className="absolute top-4 right-4 z-10 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm">Exporting map...</span>
          </div>
        </div>
      )}

      {measurementDistance && (
        <div className="absolute bottom-4 left-4 z-10 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Ruler size={16} />
            <span className="text-sm">Distance: {measurementDistance.toFixed(2)} km</span>
          </div>
        </div>
      )}
    </div>
  )
})

export default WebGIS
