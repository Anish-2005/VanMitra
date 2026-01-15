import React from "react"
import { Layers, Ruler } from "lucide-react"
import type { GISLayer } from "../WebGIS"

interface WebGISControlsProps {
  showControls: boolean
  showLayerControls: boolean
  showMeasurementControls: boolean
  enableMeasurement: boolean
  currentLayers: GISLayer[]
  isMeasuring: boolean
  measurementDistance: number | null
  isExporting: boolean
  onToggleLayer: (layerId: string) => void
  onStartMeasurement: () => void
  onClearMeasurement: () => void
}

export default function WebGISControls({
  showControls,
  showLayerControls,
  showMeasurementControls,
  enableMeasurement,
  currentLayers,
  isMeasuring,
  measurementDistance,
  isExporting,
  onToggleLayer,
  onStartMeasurement,
  onClearMeasurement,
}: WebGISControlsProps) {
  if (!showControls) return null

  return (
    <>
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        {/* Layer Control */}
        {showLayerControls && (
          <div className="bg-emerald-900/95 border border-emerald-700/50 rounded-3xl shadow-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <Layers size={16} className="text-emerald-300" />
              <span className="text-sm font-semibold text-white">Layers</span>
            </div>
            <div className="space-y-2">
              {currentLayers.map((layer) => (
                <label key={layer.id} className="flex items-center gap-3 text-sm text-emerald-300 hover:text-white transition-colors p-2 rounded-xl hover:bg-emerald-800/30">
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={() => onToggleLayer(layer.id)}
                    className="rounded border-emerald-600 bg-emerald-800/50 text-green-400 focus:ring-green-400 focus:ring-2"
                  />
                  <span className="font-medium">{layer.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Measurement Control */}
        {showMeasurementControls && enableMeasurement && (
          <div className="bg-emerald-900/95 border border-emerald-700/50 rounded-3xl shadow-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <Ruler size={16} className="text-emerald-300" />
              <span className="text-sm font-semibold text-white">Measure</span>
            </div>
            <div className="space-y-3">
              {!isMeasuring ? (
                <button
                  onClick={onStartMeasurement}
                  className="w-full text-sm bg-emerald-600 text-white px-4 py-2 rounded-2xl hover:bg-emerald-700 transition-all duration-200 font-medium"
                >
                  Start Measurement
                </button>
              ) : (
                <div className="text-xs text-emerald-400 bg-emerald-800/30 p-3 rounded-xl border border-emerald-700/30">
                  Click two points to measure distance
                </div>
              )}
              {measurementDistance && (
                <div className="text-xs text-emerald-300 bg-emerald-800/30 p-3 rounded-xl border border-emerald-700/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Distance: {measurementDistance.toFixed(2)} km
                  </div>
                </div>
              )}
              <button
                onClick={onClearMeasurement}
                className="w-full text-sm bg-gray-600 text-white px-4 py-2 rounded-2xl hover:bg-gray-700 transition-all duration-200 font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Status */}
      {isExporting && (
        <div className="absolute top-4 right-4 z-10 bg-emerald-900/95 border border-emerald-700/50 text-white px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-400 border-t-transparent"></div>
              <div className="absolute inset-0 rounded-full border-2 border-green-300/30 animate-ping"></div>
            </div>
            <span className="text-sm font-medium">Exporting map...</span>
          </div>
        </div>
      )}

      {/* Measurement Distance Display */}
      {measurementDistance && (
        <div className="absolute bottom-4 left-4 z-10 bg-emerald-900/95 border border-emerald-700/50 text-white px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <Ruler size={16} className="text-emerald-300" />
            <span className="text-sm font-medium">Distance: {measurementDistance.toFixed(2)} km</span>
          </div>
        </div>
      )}
    </>
  )
}