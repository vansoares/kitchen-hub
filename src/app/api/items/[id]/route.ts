import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as pantry from "@/lib/pantry";
import { toItemDTO } from "@/lib/status";
import { getHouseholdId } from "@/lib/session";

type RouteParams = { params: Promise<{ id: string }> };

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) ? id : null;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const householdId = await getHouseholdId();
  if (householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const id = parseId((await params).id);
  if (id === null) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const item = await pantry.getItem(householdId, id);
  if (!item) return NextResponse.json({ error: "Item nao encontrado" }, { status: 404 });
  return NextResponse.json(toItemDTO(item));
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const householdId = await getHouseholdId();
  if (householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const id = parseId((await params).id);
  if (id === null) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const existing = await pantry.getItem(householdId, id);
  if (!existing) return NextResponse.json({ error: "Item nao encontrado" }, { status: 404 });

  const body = await req.json();
  const item = await pantry.updateItem(householdId, id, {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.quantity !== undefined ? { quantity: Number(body.quantity) } : {}),
    ...(body.unit !== undefined ? { unit: body.unit } : {}),
    ...(body.group !== undefined ? { group: body.group } : {}),
    ...(body.category !== undefined ? { category: body.category } : {}),
    ...(body.minQuantity !== undefined ? { minQuantity: Number(body.minQuantity) } : {}),
    ...(body.lastPurchaseDate !== undefined ? { lastPurchaseDate: body.lastPurchaseDate } : {}),
  });

  return NextResponse.json(toItemDTO(item));
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const householdId = await getHouseholdId();
  if (householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const id = parseId((await params).id);
  if (id === null) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const existing = await pantry.getItem(householdId, id);
  if (!existing) return NextResponse.json({ error: "Item nao encontrado" }, { status: 404 });

  await pantry.deleteItem(householdId, id);
  return new NextResponse(null, { status: 204 });
}
