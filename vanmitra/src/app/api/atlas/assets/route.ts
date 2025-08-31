import { NextResponse } from "next/server";

export async function GET() {
  const geojson = {
    type: "FeatureCollection",
    features: [
      { type: "Feature", properties: { id: 1, type: 'pond' }, geometry: { type: 'Point', coordinates: [88.8,21.9] } },
      { type: "Feature", properties: { id: 2, type: 'farm' }, geometry: { type: 'Point', coordinates: [88.82,21.88] } }
    ]
  };

  return NextResponse.json(geojson);
}
