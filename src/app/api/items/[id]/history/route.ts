import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as pantry from "@/lib/pantry";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const existing = await pantry.getItem(id);
  if (!existing) return NextResponse.json({ error: "Item nao encontrado" }, { status: 404 });

  const history = await pantry.getHistory(id);
  return NextResponse.json(history);
}
