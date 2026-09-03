import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as purchases from "@/lib/purchases";
import { getHouseholdId } from "@/lib/session";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const householdId = await getHouseholdId();
  if (householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const existing = await purchases.getPurchase(householdId, id);
  if (!existing) return NextResponse.json({ error: "Compra nao encontrada" }, { status: 404 });

  await purchases.deletePurchase(householdId, id);
  return new NextResponse(null, { status: 204 });
}
