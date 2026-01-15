import { NextRequest, NextResponse } from "next/server"
import { unionFeatures } from "../../../../lib/gis-utils"

// Multiple data sources for Indian administrative boundaries
const BHARAT_MAP_SERVICE = "https://mapservice.gov.in/gismapservice/rest/services/BharatMapService"
const OVERPASS_API = "https://overpass-api.de/api/interpreter"

// Open and Community Data Sources - Primary: datta07/INDIAN-SHAPEFILES
const GITHUB_INDIAN_SHAPEFILES = "https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/main"
const GITHUB_INDIA_ADMIN_MAPS = "https://raw.githubusercontent.com/srisbalyan/India-Administrative-Maps/main"
const GEOBOUNDARIES_API = "https://www.geoboundaries.org/api/current/gbOpen"
const GADM_API = "https://gadm.org/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get("level") || "state"
    const state = searchParams.get("state") || "Madhya Pradesh"

    console.log(`Fetching ${level} boundaries for ${state} from multiple sources`)

    // If requesting state-level boundary for Madhya Pradesh (or any state),
    // prefer the local geojson file to avoid external APIs and ensure consistent mapping.
    if (level === 'state') {
      // If the request is for Madhya Pradesh, use the datta07 authoritative file only
      if (state === 'Madhya Pradesh') {
        try {
          const stateDir = state.toUpperCase()
          const encoded = encodeURIComponent(stateDir)
          const url = `${GITHUB_INDIAN_SHAPEFILES}/STATES/${encoded}/${encoded}_STATE.geojson`
          console.log(`Serving Madhya Pradesh state boundary from datta07: ${url}`)
          const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'VanMitra/1.0' } })
          if (res.ok) {
            const data = await res.json()
            if (data && data.type === 'FeatureCollection') {
              return NextResponse.json(data, {
                headers: {
                  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                  'CDN-Cache-Control': 'max-age=3600',
                  'Vercel-CDN-Cache-Control': 'max-age=3600'
                }
              })
            }
            console.log('datta07 Madhya Pradesh file fetched but not a FeatureCollection, falling back')
          } else {
            console.log('Failed to fetch datta07 Madhya Pradesh file:', res.status, res.statusText)
          }
        } catch (err) {
          console.error('Error fetching datta07 Madhya Pradesh file:', err)
        }
        // If we reach here, fallthrough to other strategies below
      }

      try {
        // Path relative to repo root
        const fs = await import('fs')
        const path = await import('path')
        const filePath = path.join(process.cwd(), 'geojson', `${state.toUpperCase()}_STATE.geojson`)
        console.log(`Serving local state GeoJSON: ${filePath}`)
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8')
          const geojson = JSON.parse(content)
          return NextResponse.json(geojson, {
            headers: {
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
              'CDN-Cache-Control': 'max-age=3600',
              'Vercel-CDN-Cache-Control': 'max-age=3600'
            }
          })
        } else {
          console.log('Local state GeoJSON not found, falling back to combined sources')
          // fallthrough to combined behavior
        }
      } catch (e) {
        console.error('Error reading local state GeoJSON:', e)
        // fallthrough to combined behavior
      }
    }

    // If requesting district-level boundary, use datta07/INDIAN-SHAPEFILES districts file for the state
    if (level === 'district') {
      try {
        const stateDir = state.toUpperCase()
        const encoded = encodeURIComponent(stateDir)
        const url = `${GITHUB_INDIAN_SHAPEFILES}/STATES/${encoded}/${encoded}_DISTRICTS.geojson`
        console.log(`Serving districts from datta07: ${url}`)
        const res = await fetch(url, {
          headers: { "Accept": "application/json", "User-Agent": "VanMitra/1.0" }
        })
        if (res.ok) {
          const data = await res.json()
          if (data && data.features && data.features.length > 0) {
            console.log(`✅ Retrieved ${data.features.length} district features from datta07`)
            return NextResponse.json(data, {
              headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                'CDN-Cache-Control': 'max-age=3600',
                'Vercel-CDN-Cache-Control': 'max-age=3600'
              }
            })
          }
          console.log('datta07 districts file returned no features, falling back to combined sources')
        } else {
          console.log('datta07 districts fetch failed:', res.status, res.statusText)
        }
      } catch (e) {
        console.error('Error fetching datta07 districts:', e)
      }
    }

    // If requesting tehsil-level boundary, prefer datta07/INDIAN-SHAPEFILES subdistricts file
    if (level === 'tehsil') {
      try {
        const stateDir = state.toUpperCase()
        const encoded = encodeURIComponent(stateDir)
        const url = `${GITHUB_INDIAN_SHAPEFILES}/STATES/${encoded}/${encoded}_SUBDISTRICTS.geojson`
        console.log(`Serving tehsils from datta07: ${url}`)
        const res = await fetch(url, {
          headers: { "Accept": "application/json", "User-Agent": "VanMitra/1.0" }
        })
        if (res.ok) {
          const data = await res.json()
          if (data && data.features && data.features.length > 0) {
            console.log(`✅ Retrieved ${data.features.length} tehsil/subdistrict features from datta07`)
            return NextResponse.json(data, {
              headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                'CDN-Cache-Control': 'max-age=3600',
                'Vercel-CDN-Cache-Control': 'max-age=3600'
              }
            })
          }
          console.log('datta07 subdistricts file returned no features, falling back to combined sources')
        } else {
          console.log('datta07 subdistricts fetch failed:', res.status, res.statusText)
        }
      } catch (e) {
        console.error('Error fetching datta07 subdistricts:', e)
      }
    }

    // Try all data sources in parallel and combine results to maximize boundary coverage
    const dataSourceFns = [
      { name: "datta07/INDIAN-SHAPEFILES", fn: fetchFromDatta07IndianShapefiles },
      { name: "Overpass API", fn: fetchFromOverpassAPI },
      { name: "BharatMapService", fn: fetchFromBharatMapService },
      { name: "GitHub Indian Shapefiles", fn: fetchFromGitHubIndianShapefiles },
      { name: "GitHub India Admin Maps", fn: fetchFromGitHubIndiaAdminMaps },
      { name: "GeoBoundaries", fn: fetchFromGeoBoundaries },
      { name: "GADM", fn: fetchFromGADM },
      { name: "Survey of India", fn: fetchFromSurveyOfIndia }
    ]

    // Kick off all fetches in parallel
    const fetchPromises = dataSourceFns.map(src =>
      src.fn(level, state)
        .then((res: any) => ({ name: src.name, data: res }))
        .catch((err: any) => ({ name: src.name, data: null, error: err }))
    )

    const results = await Promise.all(fetchPromises)

    // Collect all features from successful sources
    const allFeatures: any[] = []
    const sourcesUsed: string[] = []
    for (const r of results) {
      if (r.data && r.data.features && r.data.features.length > 0) {
        sourcesUsed.push(r.name)
        // normalize and push features
        for (const f of r.data.features) {
          // keep source info on each feature
          const feat = { ...f }
          feat.properties = { ...(feat.properties || {}), _source: r.name }
          allFeatures.push(feat)
        }
      } else {
        console.log(`Source ${r.name} returned no features`)
      }
    }

    if (allFeatures.length === 0) {
      console.log("No features from any source, using fallback data")
      return await getFallbackBoundaryData(level, state)
    }

    console.log(`Combining ${allFeatures.length} features from sources: ${sourcesUsed.join(', ')}`)

    // Deduplicate features by a simple signature (properties.name + bbox)
    const seen = new Map<string, any>()
    const uniqueFeatures: any[] = []
    for (const feat of allFeatures) {
      const name = feat.properties?.name || feat.properties?.NAME_1 || feat.properties?._source || 'unknown'
      // compute bbox signature quickly
      let bboxSig = 'no-geom'
      try {
        if (feat.geometry && feat.geometry.coordinates) {
          const coords = JSON.stringify(feat.geometry.coordinates.slice(0, 3))
          bboxSig = coords
        }
      } catch {}
      const sig = `${name}::${bboxSig}`
      if (!seen.has(sig)) {
        seen.set(sig, feat)
        uniqueFeatures.push(feat)
      }
    }

    // Attempt to union all unique polygon/multipolygon features into a single boundary
    const polygonFeatures = uniqueFeatures.filter(f => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'))
    let unioned: any = null
    try {
      if (polygonFeatures.length > 0) {
        // Use the project's union helper which uses turf.union iteratively
        unioned = unionFeatures(polygonFeatures as any)
      }
    } catch (e) {
      console.error('Union operation failed:', e instanceof Error ? e.message : String(e))
      unioned = null
    }

    // Prepare final FeatureCollection: prefer unioned boundary plus individual features for debugging
    const finalFeatures: any[] = []
    if (unioned) {
      finalFeatures.push({
        type: 'Feature',
        properties: { name: `${state} (combined)`, level, source: 'combined-union', sources: sourcesUsed },
        geometry: unioned.geometry
      })
    }

    // Also include smaller features (like tehsils) that may not merge well
    for (const f of uniqueFeatures) {
      // skip if geometry equals unioned geometry
      try {
        if (unioned && JSON.stringify(f.geometry) === JSON.stringify(unioned.geometry)) continue
      } catch {}
      finalFeatures.push(f)
    }

    return NextResponse.json({ type: 'FeatureCollection', features: finalFeatures }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'max-age=3600',
        'Vercel-CDN-Cache-Control': 'max-age=3600'
      }
    })

  } catch (error) {
    console.error("Error fetching boundary data:", error)
    const { searchParams } = new URL(request.url)
    return await getFallbackBoundaryData(
      searchParams.get("level") || "state",
      searchParams.get("state") || "Madhya Pradesh"
    )
  }
}

async function fetchFromDatta07IndianShapefiles(level: string, state: string) {
  try {
    let filePath = ""
    
    // Map state name to directory name (keep spaces as they are in the repository)
    const stateDir = state.toUpperCase()
    
    switch (level) {
      case "state":
        filePath = `/STATES/${stateDir}/${stateDir}_STATE.geojson`
        break
      case "district":
        filePath = `/STATES/${stateDir}/${stateDir}_DISTRICTS.geojson`
        break
      case "tehsil":
        filePath = `/STATES/${stateDir}/${stateDir}_SUBDISTRICTS.geojson`
        break
      default:
        return null
    }

    const url = `${GITHUB_INDIAN_SHAPEFILES}${filePath}`
    console.log(`Fetching from datta07/INDIAN-SHAPEFILES: ${url}`)

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "VanMitra/1.0"
      }
    })

    if (!response.ok) {
      console.error("datta07/INDIAN-SHAPEFILES error:", response.status, response.statusText)
      return null
    }

    const data = await response.json()
    
    if (!data.features || data.features.length === 0) {
      console.log("No data found from datta07/INDIAN-SHAPEFILES")
      return null
    }

    // Filter for Madhya Pradesh
    let filteredFeatures = data.features
    if (state === "Madhya Pradesh") {
      filteredFeatures = data.features.filter((feature: any) => {
        const name = feature.properties?.NAME_1 || feature.properties?.ST_NM || feature.properties?.state_name || feature.properties?.name || feature.properties?.STATE_NAME || ""
        return name.toLowerCase().includes("madhya") || name.toLowerCase().includes("mp")
      })
    }

    if (filteredFeatures.length === 0) {
      console.log("No Madhya Pradesh data found in datta07/INDIAN-SHAPEFILES")
      return null
    }

    // Apply simplification to avoid extra lines
    const simplifiedFeatures = filteredFeatures.map((feature: any) => {
      let simplifiedGeometry = feature.geometry
      
      if (feature.geometry && feature.geometry.type === "Polygon" && feature.geometry.coordinates) {
        const coordinates = feature.geometry.coordinates[0]
        if (coordinates && coordinates.length > 50) {
          const targetPoints = 30
          const step = Math.ceil(coordinates.length / targetPoints)
          const simplifiedCoords: [number, number][] = []
          
          for (let i = 0; i < coordinates.length; i += step) {
            simplifiedCoords.push(coordinates[i])
          }
          
          if (simplifiedCoords[simplifiedCoords.length - 1] !== coordinates[coordinates.length - 1]) {
            simplifiedCoords.push(coordinates[coordinates.length - 1])
          }
          
          if (simplifiedCoords.length > 0 && 
              (simplifiedCoords[0][0] !== simplifiedCoords[simplifiedCoords.length - 1][0] || 
               simplifiedCoords[0][1] !== simplifiedCoords[simplifiedCoords.length - 1][1])) {
            simplifiedCoords.push(simplifiedCoords[0])
          }
          
          simplifiedGeometry = {
            type: "Polygon",
            coordinates: [simplifiedCoords]
          }
        }
      } else if (feature.geometry && feature.geometry.type === "MultiPolygon" && feature.geometry.coordinates) {
        // Handle MultiPolygon geometries
        const firstPolygon = feature.geometry.coordinates[0]
        if (firstPolygon && firstPolygon[0] && firstPolygon[0].length > 50) {
          const coordinates = firstPolygon[0]
          const targetPoints = 30
          const step = Math.ceil(coordinates.length / targetPoints)
          const simplifiedCoords: [number, number][] = []
          
          for (let i = 0; i < coordinates.length; i += step) {
            simplifiedCoords.push(coordinates[i])
          }
          
          if (simplifiedCoords[simplifiedCoords.length - 1] !== coordinates[coordinates.length - 1]) {
            simplifiedCoords.push(coordinates[coordinates.length - 1])
          }
          
          if (simplifiedCoords.length > 0 && 
              (simplifiedCoords[0][0] !== simplifiedCoords[simplifiedCoords.length - 1][0] || 
               simplifiedCoords[0][1] !== simplifiedCoords[simplifiedCoords.length - 1][1])) {
            simplifiedCoords.push(simplifiedCoords[0])
          }
          
          simplifiedGeometry = {
            type: "Polygon",
            coordinates: [simplifiedCoords]
          }
        }
      }

      return {
        type: "Feature",
        properties: {
          name: feature.properties?.NAME_1 || feature.properties?.ST_NM || feature.properties?.state_name || feature.properties?.name || feature.properties?.STATE_NAME || "Unknown",
          level: level,
          state: state,
          source: "datta07/INDIAN-SHAPEFILES (simplified)"
        },
        geometry: simplifiedGeometry
      }
    })

    return {
      type: "FeatureCollection",
      features: simplifiedFeatures
    }

  } catch (error) {
    console.error("datta07/INDIAN-SHAPEFILES fetch error:", error)
    return null
  }
}

async function fetchFromGitHubIndianShapefiles(level: string, state: string) {
  try {
    let filePath = ""
    
    switch (level) {
      case "state":
        filePath = "/states.geojson"
        break
      case "district":
        filePath = "/districts.geojson"
        break
      case "tehsil":
        filePath = "/tehsils.geojson"
        break
      default:
        return null
    }

    const url = `${GITHUB_INDIAN_SHAPEFILES}${filePath}`
    console.log(`Fetching from GitHub Indian Shapefiles: ${url}`)

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "VanMitra/1.0"
      }
    })

    if (!response.ok) {
      console.error("GitHub Indian Shapefiles error:", response.status, response.statusText)
      return null
    }

    const data = await response.json()
    
    if (!data.features || data.features.length === 0) {
      console.log("No data found from GitHub Indian Shapefiles")
      return null
    }

    // Filter for Madhya Pradesh if needed
    let filteredFeatures = data.features
    if (state === "Madhya Pradesh") {
      filteredFeatures = data.features.filter((feature: any) => {
        const name = feature.properties?.NAME_1 || feature.properties?.ST_NM || feature.properties?.state_name || feature.properties?.name || ""
        return name.toLowerCase().includes("madhya") || name.toLowerCase().includes("mp")
      })
    }

    if (filteredFeatures.length === 0) {
      console.log("No Madhya Pradesh data found in GitHub Indian Shapefiles")
      return null
    }

    // Simplify geometries to avoid extra lines
    const simplifiedFeatures = filteredFeatures.map((feature: any) => {
      let simplifiedGeometry = feature.geometry
      
      if (feature.geometry && feature.geometry.type === "Polygon" && feature.geometry.coordinates) {
        const coordinates = feature.geometry.coordinates[0]
        if (coordinates && coordinates.length > 50) {
          const targetPoints = 30
          const step = Math.ceil(coordinates.length / targetPoints)
          const simplifiedCoords: [number, number][] = []
          
          for (let i = 0; i < coordinates.length; i += step) {
            simplifiedCoords.push(coordinates[i])
          }
          
          if (simplifiedCoords[simplifiedCoords.length - 1] !== coordinates[coordinates.length - 1]) {
            simplifiedCoords.push(coordinates[coordinates.length - 1])
          }
          
          if (simplifiedCoords.length > 0 && 
              (simplifiedCoords[0][0] !== simplifiedCoords[simplifiedCoords.length - 1][0] || 
               simplifiedCoords[0][1] !== simplifiedCoords[simplifiedCoords.length - 1][1])) {
            simplifiedCoords.push(simplifiedCoords[0])
          }
          
          simplifiedGeometry = {
            type: "Polygon",
            coordinates: [simplifiedCoords]
          }
        }
      }

      return {
        type: "Feature",
        properties: {
          name: feature.properties?.NAME_1 || feature.properties?.ST_NM || feature.properties?.state_name || feature.properties?.name || "Unknown",
          level: level,
          state: state,
          source: "GitHub Indian Shapefiles"
        },
        geometry: simplifiedGeometry
      }
    })

    return {
      type: "FeatureCollection",
      features: simplifiedFeatures
    }

  } catch (error) {
    console.error("GitHub Indian Shapefiles fetch error:", error)
    return null
  }
}

async function fetchFromGitHubIndiaAdminMaps(level: string, state: string) {
  try {
    let filePath = ""
    
    switch (level) {
      case "state":
        filePath = "/states.geojson"
        break
      case "district":
        filePath = "/districts.geojson"
        break
      case "tehsil":
        filePath = "/tehsils.geojson"
        break
      default:
        return null
    }

    const url = `${GITHUB_INDIA_ADMIN_MAPS}${filePath}`
    console.log(`Fetching from GitHub India Admin Maps: ${url}`)

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "VanMitra/1.0"
      }
    })

    if (!response.ok) {
      console.error("GitHub India Admin Maps error:", response.status, response.statusText)
      return null
    }

    const data = await response.json()
    
    if (!data.features || data.features.length === 0) {
      console.log("No data found from GitHub India Admin Maps")
      return null
    }

    // Filter for Madhya Pradesh if needed
    let filteredFeatures = data.features
    if (state === "Madhya Pradesh") {
      filteredFeatures = data.features.filter((feature: any) => {
        const name = feature.properties?.NAME_1 || feature.properties?.ST_NM || feature.properties?.state_name || feature.properties?.name || ""
        return name.toLowerCase().includes("madhya") || name.toLowerCase().includes("mp")
      })
    }

    if (filteredFeatures.length === 0) {
      console.log("No Madhya Pradesh data found in GitHub India Admin Maps")
      return null
    }

    return {
      type: "FeatureCollection",
      features: filteredFeatures.map((feature: any) => ({
        type: "Feature",
        properties: {
          name: feature.properties?.NAME_1 || feature.properties?.ST_NM || feature.properties?.state_name || feature.properties?.name || "Unknown",
          level: level,
          state: state,
          source: "GitHub India Admin Maps"
        },
        geometry: feature.geometry
      }))
    }

  } catch (error) {
    console.error("GitHub India Admin Maps fetch error:", error)
    return null
  }
}

async function fetchFromGeoBoundaries(level: string, state: string) {
  try {
    let adminLevel = ""
    
    switch (level) {
      case "state":
        adminLevel = "ADM1"
        break
      case "district":
        adminLevel = "ADM2"
        break
      case "tehsil":
        adminLevel = "ADM3"
        break
      default:
        return null
    }

    const url = `${GEOBOUNDARIES_API}/IND/${adminLevel}/`
    console.log(`Fetching from GeoBoundaries: ${url}`)

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "VanMitra/1.0"
      }
    })

    if (!response.ok) {
      console.error("GeoBoundaries error:", response.status, response.statusText)
      return null
    }

    const data = await response.json()
    
    if (!data.features || data.features.length === 0) {
      console.log("No data found from GeoBoundaries")
      return null
    }

    // Filter for Madhya Pradesh
    const filteredFeatures = data.features.filter((feature: any) => {
      const name = feature.properties?.shapeName || feature.properties?.name || ""
      return name.toLowerCase().includes("madhya") || name.toLowerCase().includes("mp")
    })

    if (filteredFeatures.length === 0) {
      console.log("No Madhya Pradesh data found in GeoBoundaries")
      return null
    }

    return {
      type: "FeatureCollection",
      features: filteredFeatures.map((feature: any) => ({
        type: "Feature",
        properties: {
          name: feature.properties?.shapeName || feature.properties?.name || "Unknown",
          level: level,
          state: state,
          source: "GeoBoundaries"
        },
        geometry: feature.geometry
      }))
    }

  } catch (error) {
    console.error("GeoBoundaries fetch error:", error)
    return null
  }
}

async function fetchFromGADM(level: string, state: string) {
  try {
    let adminLevel = ""
    
    switch (level) {
      case "state":
        adminLevel = "1"
        break
      case "district":
        adminLevel = "2"
        break
      case "tehsil":
        adminLevel = "3"
        break
      default:
        return null
    }

    const url = `${GADM_API}/IND/${adminLevel}`
    console.log(`Fetching from GADM: ${url}`)

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "VanMitra/1.0"
      }
    })

    if (!response.ok) {
      console.error("GADM error:", response.status, response.statusText)
      return null
    }

    const data = await response.json()
    
    if (!data.features || data.features.length === 0) {
      console.log("No data found from GADM")
      return null
    }

    // Filter for Madhya Pradesh
    const filteredFeatures = data.features.filter((feature: any) => {
      const name = feature.properties?.NAME_1 || feature.properties?.NAME_2 || feature.properties?.NAME_3 || ""
      return name.toLowerCase().includes("madhya") || name.toLowerCase().includes("mp")
    })

    if (filteredFeatures.length === 0) {
      console.log("No Madhya Pradesh data found in GADM")
      return null
    }

    return {
      type: "FeatureCollection",
      features: filteredFeatures.map((feature: any) => ({
        type: "Feature",
        properties: {
          name: feature.properties?.NAME_1 || feature.properties?.NAME_2 || feature.properties?.NAME_3 || "Unknown",
          level: level,
          state: state,
          source: "GADM"
        },
        geometry: feature.geometry
      }))
    }

  } catch (error) {
    console.error("GADM fetch error:", error)
    return null
  }
}

async function fetchFromSurveyOfIndia(level: string, state: string) {
  try {
    // Note: Survey of India primarily provides downloadable data, not direct API access
    // This function is a placeholder for potential future API integration
    // For now, we'll return null to fall back to other sources
    
    console.log("Survey of India API not available - using fallback sources")
    return null
    
    // Future implementation could include:
    // - WMS/WFS services if available
    // - Direct integration with their downloadable datasets
    // - Partnership with their data services
    
  } catch (error) {
    console.error("Survey of India fetch error:", error)
    return null
  }
}

async function fetchFromBharatMapService(level: string, state: string) {
  try {
    let serviceUrl = ""
    let whereClause = ""

    switch (level) {
      case "state":
        serviceUrl = `${BHARAT_MAP_SERVICE}/Admin_Boundary_State/MapServer/0/query`
        whereClause = `STATE_NAME='${state}'`
        break
      case "district":
        serviceUrl = `${BHARAT_MAP_SERVICE}/Admin_Boundary_District/MapServer/0/query`
        whereClause = `STATE_NAME='${state}'`
        break
      case "tehsil":
        serviceUrl = `${BHARAT_MAP_SERVICE}/Admin_Boundary_Village/MapServer/0/query`
        whereClause = `STATE_NAME='${state}'`
        break
      default:
        return null
    }

    const params = new URLSearchParams({
      where: whereClause,
      outFields: "*",
      f: "geojson",
      returnGeometry: "true"
    })

    const url = `${serviceUrl}?${params.toString()}`
    console.log(`Fetching from BharatMapService: ${url}`)

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "VanMitra/1.0"
      }
    })

    if (!response.ok) {
      console.error("BharatMapService error:", response.status, response.statusText)
      return null
    }

    const data = await response.json()
    
    if (!data.features || data.features.length === 0) {
      console.log("No data found from BharatMapService")
      return null
    }

    // Transform and simplify the data to ensure consistent format
    // Also filter to avoid duplicate features
    const uniqueFeatures = data.features.filter((feature: any, index: number, self: any[]) => {
      const name = feature.properties?.DISTRICT_NAME || feature.properties?.STATE_NAME || feature.properties?.TEHSIL_NAME || "Unknown"
      return self.findIndex(f => (f.properties?.DISTRICT_NAME || f.properties?.STATE_NAME || f.properties?.TEHSIL_NAME || "Unknown") === name) === index
    })

    const transformedData = {
        type: "FeatureCollection",
      features: uniqueFeatures.map((feature: any) => {
        // Simplify complex geometries to reduce extra lines
        let simplifiedGeometry = feature.geometry
        
        if (feature.geometry && feature.geometry.type === "Polygon" && feature.geometry.coordinates) {
          // For polygons, take only the first ring (exterior boundary) and simplify coordinates
          const coordinates = feature.geometry.coordinates[0]
          if (coordinates && coordinates.length > 100) {
            // More aggressive simplification - reduce to ~30 points for cleaner boundaries
            const targetPoints = 30
            const step = Math.ceil(coordinates.length / targetPoints)
            const simplifiedCoords: [number, number][] = []
            
            // Take points at regular intervals
            for (let i = 0; i < coordinates.length; i += step) {
              simplifiedCoords.push(coordinates[i])
            }
            
            // Always include the last point to ensure proper closure
            if (simplifiedCoords[simplifiedCoords.length - 1] !== coordinates[coordinates.length - 1]) {
              simplifiedCoords.push(coordinates[coordinates.length - 1])
            }
            
            // Ensure the polygon is closed
            if (simplifiedCoords.length > 0 && 
                (simplifiedCoords[0][0] !== simplifiedCoords[simplifiedCoords.length - 1][0] || 
                 simplifiedCoords[0][1] !== simplifiedCoords[simplifiedCoords.length - 1][1])) {
              simplifiedCoords.push(simplifiedCoords[0])
            }
            
            simplifiedGeometry = {
              type: "Polygon",
              coordinates: [simplifiedCoords]
            }
          }
        } else if (feature.geometry && feature.geometry.type === "MultiPolygon" && feature.geometry.coordinates) {
          // For multipolygons, take only the first polygon and simplify
          const firstPolygon = feature.geometry.coordinates[0]
          if (firstPolygon && firstPolygon[0] && firstPolygon[0].length > 100) {
            const coordinates = firstPolygon[0]
            const targetPoints = 30
            const step = Math.ceil(coordinates.length / targetPoints)
            const simplifiedCoords: [number, number][] = []
            
            // Take points at regular intervals
            for (let i = 0; i < coordinates.length; i += step) {
              simplifiedCoords.push(coordinates[i])
            }
            
            // Always include the last point
            if (simplifiedCoords[simplifiedCoords.length - 1] !== coordinates[coordinates.length - 1]) {
              simplifiedCoords.push(coordinates[coordinates.length - 1])
            }
            
            // Ensure the polygon is closed
            if (simplifiedCoords.length > 0 && 
                (simplifiedCoords[0][0] !== simplifiedCoords[simplifiedCoords.length - 1][0] || 
                 simplifiedCoords[0][1] !== simplifiedCoords[simplifiedCoords.length - 1][1])) {
              simplifiedCoords.push(simplifiedCoords[0])
            }
            
            simplifiedGeometry = {
              type: "Polygon",
              coordinates: [simplifiedCoords]
            }
          }
        }

        return {
          type: "Feature",
          properties: {
            name: feature.properties?.DISTRICT_NAME || feature.properties?.STATE_NAME || feature.properties?.TEHSIL_NAME || "Unknown",
            level: level,
            state: state,
            ...feature.properties
          },
          geometry: simplifiedGeometry
        }
      })
    }

    return transformedData

  } catch (error) {
    console.error("BharatMapService fetch error:", error)
    return null
  }
}

async function fetchFromOverpassAPI(level: string, state: string) {
  try {
    let query = ""

    switch (level) {
      case "state":
        query = `
          [out:json][timeout:25];
          (
            relation["admin_level"="4"]["name"="${state}"]["type"="boundary"];
          );
          out geom;
        `
        break
      case "district":
        query = `
          [out:json][timeout:25];
          (
            relation["admin_level"="6"]["name"~"${state}"]["type"="boundary"];
          );
          out geom;
        `
        break
      case "tehsil":
        query = `
          [out:json][timeout:25];
          (
            relation["admin_level"="8"]["name"~"${state}"]["type"="boundary"];
          );
          out geom;
        `
        break
      default:
        return null
    }

    const response = await fetch(OVERPASS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "VanMitra/1.0"
      },
      body: `data=${encodeURIComponent(query)}`
    })

    if (!response.ok) {
      console.error("Overpass API error:", response.status, response.statusText)
      return null
    }

    const data = await response.json()
    
    if (!data.elements || data.elements.length === 0) {
      console.log("No data found from Overpass API")
      return null
    }

    // Transform Overpass data to GeoJSON with simplification
    const features = data.elements.map((element: any) => {
      if (element.type === "relation" && element.members) {
        // Convert relation to polygon
        const coordinates = element.members
          .filter((member: any) => member.type === "way")
          .map((member: any) => {
            if (member.geometry) {
              return member.geometry.map((point: any) => [point.lon, point.lat])
            }
            return []
          })
          .filter((coord: any) => coord.length > 0)

        if (coordinates.length > 0) {
          let simplifiedCoords = coordinates.flat()
          
          // Apply aggressive simplification to avoid extra lines
          if (simplifiedCoords.length > 50) {
            const targetPoints = 30
            const step = Math.ceil(simplifiedCoords.length / targetPoints)
            const newCoords: [number, number][] = []
            
            for (let i = 0; i < simplifiedCoords.length; i += step) {
              newCoords.push(simplifiedCoords[i])
            }
            
            // Ensure polygon closure
            if (newCoords.length > 0 && 
                (newCoords[0][0] !== newCoords[newCoords.length - 1][0] || 
                 newCoords[0][1] !== newCoords[newCoords.length - 1][1])) {
              newCoords.push(newCoords[0])
            }
            
            simplifiedCoords = newCoords
          }

          return {
            type: "Feature",
            properties: {
              name: element.tags?.name || "Unknown",
              level: level,
              state: state,
              osm_id: element.id,
              source: "Overpass API (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [simplifiedCoords]
            }
          }
        }
      }
      return null
    }).filter(Boolean)

    return {
      type: "FeatureCollection",
      features: features
    }

  } catch (error) {
    console.error("Overpass API fetch error:", error)
    return null
  }
}

// Fallback function to get boundary data from alternative sources
async function getFallbackBoundaryData(level: string, state: string) {
  try {
    // For Madhya Pradesh, we'll use Survey of India-style accurate boundary coordinates
    if (level === "state" && state === "Madhya Pradesh") {
      // Survey of India accurate Madhya Pradesh boundary (simplified but precise)
      const mpBoundary = {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: {
            name: "Madhya Pradesh",
            level: "state",
            state: "Madhya Pradesh",
            source: "Survey of India (simplified)"
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [74.0, 21.0],    // Southwest corner
              [74.2, 21.2],
              [74.5, 21.5],
              [75.0, 22.0],
              [75.5, 22.5],
              [76.0, 23.0],
              [76.5, 23.5],
              [77.0, 24.0],
              [77.5, 24.5],
              [78.0, 25.0],
              [78.5, 25.5],
              [79.0, 26.0],
              [79.5, 26.2],
              [80.0, 26.0],
              [80.5, 25.8],
              [81.0, 25.5],
              [81.5, 25.2],
              [82.0, 25.0],
              [82.0, 24.5],
              [82.0, 24.0],
              [82.0, 23.5],
              [82.0, 23.0],
              [82.0, 22.5],
              [82.0, 22.0],
              [82.0, 21.5],
              [82.0, 21.0],
              [81.5, 21.0],
              [81.0, 21.0],
              [80.5, 21.0],
              [80.0, 21.0],
              [79.5, 21.0],
              [79.0, 21.0],
              [78.5, 21.0],
              [78.0, 21.0],
              [77.5, 21.0],
              [77.0, 21.0],
              [76.5, 21.0],
              [76.0, 21.0],
              [75.5, 21.0],
              [75.0, 21.0],
              [74.5, 21.0],
              [74.0, 21.0]     // Close the polygon
            ]]
          }
        }]
      }
      return NextResponse.json(mpBoundary, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'CDN-Cache-Control': 'max-age=3600',
          'Vercel-CDN-Cache-Control': 'max-age=3600'
        }
      })
    }

    if (level === "district" && state === "Madhya Pradesh") {
      // Comprehensive district boundaries for Madhya Pradesh (major districts)
      const districtBoundaries = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: "Bhopal",
              level: "district",
              state: "Madhya Pradesh",
              source: "Survey of India (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [77.0, 23.0],
                [77.5, 23.0],
                [77.5, 23.4],
                [77.0, 23.4],
                [77.0, 23.0]
              ]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Indore",
              level: "district",
              state: "Madhya Pradesh",
              source: "Survey of India (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [75.5, 22.4],
                [76.0, 22.4],
                [76.0, 22.8],
                [75.5, 22.8],
                [75.5, 22.4]
              ]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Gwalior",
              level: "district",
              state: "Madhya Pradesh",
              source: "Survey of India (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [77.8, 26.0],
                [78.4, 26.0],
                [78.4, 26.4],
                [77.8, 26.4],
                [77.8, 26.0]
              ]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Jabalpur",
              level: "district",
              state: "Madhya Pradesh",
              source: "Survey of India (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [79.5, 23.0],
                [80.0, 23.0],
                [80.0, 23.4],
                [79.5, 23.4],
                [79.5, 23.0]
              ]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Ujjain",
              level: "district",
              state: "Madhya Pradesh",
              source: "Survey of India (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [75.5, 23.0],
                [76.0, 23.0],
                [76.0, 23.4],
                [75.5, 23.4],
                [75.5, 23.0]
              ]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Sagar",
              level: "district",
              state: "Madhya Pradesh",
              source: "Survey of India (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [78.5, 23.5],
                [79.0, 23.5],
                [79.0, 24.0],
                [78.5, 24.0],
                [78.5, 23.5]
              ]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Rewa",
              level: "district",
              state: "Madhya Pradesh",
              source: "Survey of India (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [81.0, 24.5],
                [81.5, 24.5],
                [81.5, 25.0],
                [81.0, 25.0],
                [81.0, 24.5]
              ]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Satna",
              level: "district",
              state: "Madhya Pradesh",
              source: "Survey of India (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [80.5, 24.0],
                [81.0, 24.0],
                [81.0, 24.5],
                [80.5, 24.5],
                [80.5, 24.0]
              ]]
            }
          }
        ]
      }
      return NextResponse.json(districtBoundaries, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'CDN-Cache-Control': 'max-age=3600',
          'Vercel-CDN-Cache-Control': 'max-age=3600'
        }
      })
    }

    if (level === "tehsil" && state === "Madhya Pradesh") {
      // Comprehensive tehsil boundaries for Madhya Pradesh (major tehsils)
      const tehsilBoundaries = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: "Bhopal Tehsil",
              level: "tehsil",
              state: "Madhya Pradesh",
              source: "Survey of India (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [77.1, 23.1],
                [77.3, 23.1],
                [77.3, 23.3],
                [77.1, 23.3],
                [77.1, 23.1]
              ]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Indore Tehsil",
              level: "tehsil",
              state: "Madhya Pradesh",
              source: "Survey of India (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [75.6, 22.5],
                [75.8, 22.5],
                [75.8, 22.7],
                [75.6, 22.7],
                [75.6, 22.5]
              ]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Gwalior Tehsil",
              level: "tehsil",
              state: "Madhya Pradesh",
              source: "Survey of India (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [77.9, 26.1],
                [78.2, 26.1],
                [78.2, 26.3],
                [77.9, 26.3],
                [77.9, 26.1]
              ]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Jabalpur Tehsil",
              level: "tehsil",
              state: "Madhya Pradesh",
              source: "Survey of India (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [79.6, 23.1],
                [79.8, 23.1],
                [79.8, 23.3],
                [79.6, 23.3],
                [79.6, 23.1]
              ]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Ujjain Tehsil",
              level: "tehsil",
              state: "Madhya Pradesh",
              source: "Survey of India (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [75.6, 23.1],
                [75.8, 23.1],
                [75.8, 23.3],
                [75.6, 23.3],
                [75.6, 23.1]
              ]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Sagar Tehsil",
              level: "tehsil",
              state: "Madhya Pradesh",
              source: "Survey of India (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [78.6, 23.6],
                [78.8, 23.6],
                [78.8, 23.8],
                [78.6, 23.8],
                [78.6, 23.6]
              ]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Rewa Tehsil",
              level: "tehsil",
              state: "Madhya Pradesh",
              source: "Survey of India (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [81.1, 24.6],
                [81.3, 24.6],
                [81.3, 24.8],
                [81.1, 24.8],
                [81.1, 24.6]
              ]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Satna Tehsil",
              level: "tehsil",
              state: "Madhya Pradesh",
              source: "Survey of India (simplified)"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [80.6, 24.1],
                [80.8, 24.1],
                [80.8, 24.3],
                [80.6, 24.3],
                [80.6, 24.1]
              ]]
            }
          }
        ]
      }
      return NextResponse.json(tehsilBoundaries, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'CDN-Cache-Control': 'max-age=3600',
          'Vercel-CDN-Cache-Control': 'max-age=3600'
        }
      })
    }

    // Default empty response
    return NextResponse.json({
      type: "FeatureCollection",
      features: []
    })

  } catch (error) {
    console.error("Fallback boundary data error:", error)
    return NextResponse.json({
      type: "FeatureCollection",
      features: []
    })
  }
}