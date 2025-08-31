import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    claims: 1240,
    grants: 380,
    assets: 4120,
    priorityVillages: 4,
    timeSeries: [120, 180, 240, 300, 220, 260, 310, 380, 420, 480],
  };

  return NextResponse.json(payload);
}
