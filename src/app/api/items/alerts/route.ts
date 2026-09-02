import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as pantry from "@/lib/pantry";
import { toItemDTO } from "@/lib/status";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const group = searchParams.get("group") ?? undefined;

  const items = await pantry.getAlerts(group);
  return NextResponse.json(items.map(toItemDTO));
}
