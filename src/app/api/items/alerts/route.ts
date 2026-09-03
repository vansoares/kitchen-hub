import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as pantry from "@/lib/pantry";
import { toItemDTO } from "@/lib/status";
import { getUserEmail } from "@/lib/session";

export async function GET(req: NextRequest) {
  const userEmail = await getUserEmail();
  if (!userEmail) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const group = searchParams.get("group") ?? undefined;

  const items = await pantry.getAlerts(userEmail, group);
  return NextResponse.json(items.map(toItemDTO));
}
