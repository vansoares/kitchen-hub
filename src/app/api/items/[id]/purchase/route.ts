import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as pantry from "@/lib/pantry";
import { toItemDTO } from "@/lib/status";
import { getHouseholdId } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const householdId = await getHouseholdId();
  if (householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const id = Number((await params).id);
  const body = await req.json();
  const amount = Number(body?.amount);

  if (!Number.isInteger(id)) return NextResponse.json({ error: "Id invalido" }, { status: 422 });
  if (!(amount > 0)) return NextResponse.json({ error: "amount deve ser positivo" }, { status: 422 });

  const existing = await pantry.getItem(householdId, id);
  if (!existing) return NextResponse.json({ error: "Item nao encontrado" }, { status: 404 });

  const item = await pantry.purchaseItem(householdId, id, amount);
  return NextResponse.json(toItemDTO(item));
}
