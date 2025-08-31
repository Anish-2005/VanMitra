import { NextResponse } from "next/server";

export async function GET() {
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { id: 'v1', name: 'Village A' },
        geometry: { type: 'Polygon', coordinates: [[[88.76,21.95],[88.81,21.95],[88.81,21.9],[88.76,21.9],[88.76,21.95]]] }
      }
    ]
  };

  return NextResponse.json(geojson);
}
