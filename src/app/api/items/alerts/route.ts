import { NextResponse } from "next/server";
import * as pantry from "@/lib/pantry";
import { toItemDTO } from "@/lib/status";

export async function GET() {
  const items = await pantry.getAlerts();
  return NextResponse.json(items.map(toItemDTO));
}
