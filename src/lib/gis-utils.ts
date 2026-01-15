// src/lib/gis-utils.ts
import * as turf from '@turf/turf';

// Types
export interface GeoPoint {
  lng: number;
  lat: number;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeoFeature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';
    coordinates: any;
  };
  properties: Record<string, any>;
}

// Utility functions
export const createGeoJSONPoint = (lng: number, lat: number, properties: Record<string, any> = {}): GeoFeature => ({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [lng, lat]
  },
  properties
});

export const createGeoJSONPolygon = (coordinates: number[][][], properties: Record<string, any> = {}): GeoFeature => ({
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates
  },
  properties
});

export const createGeoJSONLineString = (coordinates: number[][], properties: Record<string, any> = {}): GeoFeature => ({
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates
  },
  properties
});

export const calculateDistance = (point1: GeoPoint, point2: GeoPoint, units: 'kilometers' | 'meters' = 'kilometers'): number => {
  return turf.distance(
    turf.point([point1.lng, point1.lat]),
    turf.point([point2.lng, point2.lat]),
    { units }
  );
};

export const calculateArea = (coordinates: number[][][], units: 'square-kilometers' | 'square-meters' = 'square-kilometers'): number => {
  const polygon = turf.polygon(coordinates);
  return turf.area(polygon) / (units === 'square-kilometers' ? 1000000 : 1);
};

export const getBounds = (features: GeoFeature[]): GeoBounds => {
  const bbox = turf.bbox(turf.featureCollection(features));
  return {
    west: bbox[0],
    south: bbox[1],
    east: bbox[2],
    north: bbox[3]
  };
};

export const bufferGeometry = (feature: GeoFeature, distance: number, units: 'kilometers' | 'meters' = 'kilometers'): GeoFeature | null => {
  try {
    const buffered = turf.buffer(feature as any, distance, { units });
    return (buffered as GeoFeature) || null;
  } catch {
    return null;
  }
};

export const intersectFeatures = (feature1: GeoFeature, feature2: GeoFeature): GeoFeature | null => {
  try {
    const intersection = turf.intersect(feature1 as any, feature2 as any);
    return (intersection as GeoFeature) || null;
  } catch {
    return null;
  }
};

export const unionFeatures = (features: GeoFeature[]): GeoFeature | null => {
  try {
    if (features.length === 0) return null;
    if (features.length === 1) return features[0];

    let result = features[0];
    for (let i = 1; i < features.length; i++) {
      const unioned = turf.union(result as any, features[i] as any);
      if (unioned) {
        result = unioned as GeoFeature;
      }
    }
    return result;
  } catch {
    return null;
  }
};

// FRA (Forest Rights Act) specific utilities
export const validateFRABoundary = (boundary: GeoFeature): boolean => {
  // Check if it's a valid polygon
  if (boundary.geometry.type !== 'Polygon') return false;

  // Check area (FRA claims should be reasonable size)
  const area = calculateArea(boundary.geometry.coordinates);
  return area > 0 && area < 100; // Less than 100 sq km
};

export const generateFRAClaimId = (): string => {
  return `FRA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Asset mapping utilities
export const categorizeAssets = (assets: GeoFeature[]): Record<string, GeoFeature[]> => {
  const categories: Record<string, GeoFeature[]> = {};

  assets.forEach(asset => {
    const category = asset.properties.category || 'uncategorized';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(asset);
  });

  return categories;
};

// Map styling utilities
export const getAssetStyle = (assetType: string) => {
  const styles: Record<string, { fillColor?: string; strokeColor: string; strokeWidth: number; opacity: number }> = {
    'water-body': {
      fillColor: '#3b82f6',
      strokeColor: '#1e40af',
      strokeWidth: 2,
      opacity: 0.6
    },
    'forest': {
      fillColor: '#16a34a',
      strokeColor: '#15803d',
      strokeWidth: 1,
      opacity: 0.7
    },
    'habitation': {
      fillColor: '#f59e0b',
      strokeColor: '#d97706',
      strokeWidth: 2,
      opacity: 0.8
    },
    'road': {
      strokeColor: '#374151',
      strokeWidth: 3,
      opacity: 0.9
    },
    'boundary': {
      strokeColor: '#dc2626',
      strokeWidth: 2,
      opacity: 1
    }
  };

  return styles[assetType] || {
    fillColor: '#6b7280',
    strokeColor: '#4b5563',
    strokeWidth: 1,
    opacity: 0.8
  };
};

// Coordinate conversion utilities
export const dmsToDecimal = (degrees: number, minutes: number, seconds: number, direction: 'N' | 'S' | 'E' | 'W'): number => {
  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }
  return decimal;
};

export const decimalToDMS = (decimal: number, isLatitude: boolean): { degrees: number; minutes: number; seconds: number; direction: string } => {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesDecimal = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = (minutesDecimal - minutes) * 60;

  let direction: string;
  if (isLatitude) {
    direction = decimal >= 0 ? 'N' : 'S';
  } else {
    direction = decimal >= 0 ? 'E' : 'W';
  }

  return { degrees, minutes, seconds, direction };
};

// Export utilities
export const exportToGeoJSON = (features: GeoFeature[], filename: string = 'export.geojson') => {
  // Accept either an array of features or a FeatureCollection-like input
  const geojson: GeoJSON.FeatureCollection = Array.isArray(features) ? { type: 'FeatureCollection', features } : features;

  try {
    const dataStr = JSON.stringify(geojson, null, 2);
    const blob = new Blob([dataStr], { type: 'application/vnd.geo+json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.download = filename;
    // Firefox requires the element be added to the document
    document.body.appendChild(linkElement);
    linkElement.click();
    // cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
      try { document.body.removeChild(linkElement); } catch {}
    }, 1000);
  } catch {
    // Fallback to old data URI method if Blob/URL fails
    try {
      const dataStr = JSON.stringify(geojson);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', filename);
      document.body.appendChild(linkElement);
      linkElement.click();
      setTimeout(() => { try { document.body.removeChild(linkElement); } catch {} }, 500);
    } catch (e) {
      console.error('Failed to export GeoJSON', e);
      throw e;
    }
  }
};

export const exportToKML = (features: GeoFeature[], filename: string = 'export.kml') => {
  // Basic KML export (simplified)
  let kml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  kml += '<kml xmlns="http://www.opengis.net/kml/2.2">\n';
  kml += '<Document>\n';

  features.forEach((feature, index) => {
    kml += `<Placemark id="feature-${index}">\n`;
    if (feature.properties.name) {
      kml += `<name>${feature.properties.name}</name>\n`;
    }
    kml += '<Point>\n';
    kml += `<coordinates>${feature.geometry.coordinates[0]},${feature.geometry.coordinates[1]},0</coordinates>\n`;
    kml += '</Point>\n';
    kml += '</Placemark>\n';
  });

  kml += '</Document>\n</kml>';

  const dataUri = 'data:text/xml;charset=utf-8,'+ encodeURIComponent(kml);
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', filename);
  linkElement.click();
};
