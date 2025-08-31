import { NextResponse } from "next/server";

export async function GET() {
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { id: 1, claimant: "A. Singh", status: "granted" },
        geometry: { type: "Polygon", coordinates: [[[88.78,21.92],[88.79,21.92],[88.79,21.91],[88.78,21.91],[88.78,21.92]]] }
      },
      {
        type: "Feature",
        properties: { id: 2, claimant: "B. Devi", status: "submitted" },
        geometry: { type: "Polygon", coordinates: [[[88.84,21.88],[88.85,21.88],[88.85,21.87],[88.84,21.87],[88.84,21.88]]] }
      }
    ]
  };

  return NextResponse.json(geojson);
}
