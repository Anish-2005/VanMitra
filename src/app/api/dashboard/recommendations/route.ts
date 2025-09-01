import { NextResponse } from "next/server";

export async function GET() {
  const recommendations = [
    { id: 1, village: "Sanchi Block A", scheme: "Jal Shakti - Borewell", score: 0.92, state: "Madhya Pradesh", district: "Bhopal" },
    { id: 2, village: "Agartala Block B", scheme: "MGNREGA - Water Harvesting", score: 0.87, state: "Tripura", district: "West Tripura" },
    { id: 3, village: "Puri Block C", scheme: "PM-KISAN - Support", score: 0.81, state: "Odisha", district: "Puri" },
    { id: 4, village: "Warangal Block D", scheme: "DAJGUA - Convergence", score: 0.76, state: "Telangana", district: "Warangal" },
  ];

  return NextResponse.json(recommendations);
}
