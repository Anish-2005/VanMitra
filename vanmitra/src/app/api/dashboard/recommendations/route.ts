import { NextResponse } from "next/server";

export async function GET() {
  const recommendations = [
    { id: 1, village: "Sundarbans Block A", scheme: "Jal Shakti - Borewell", score: 0.92, state: "West Bengal", district: "East Sundarbans" },
    { id: 2, village: "Sundarbans Block B", scheme: "MGNREGA - Water Harvesting", score: 0.87, state: "West Bengal", district: "East Sundarbans" },
    { id: 3, village: "Block C", scheme: "PM-KISAN - Support", score: 0.81, state: "Bihar", district: "Patna" },
    { id: 4, village: "Block D", scheme: "DAJGUA - Convergence", score: 0.76, state: "West Bengal", district: "North 24 Parganas" },
  ];

  return NextResponse.json(recommendations);
}
