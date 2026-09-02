import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as pantry from "@/lib/pantry";
import { toItemDTO } from "@/lib/status";

type RouteParams = { params: Promise<{ id: string }> };

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) ? id : null;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const id = parseId((await params).id);
  if (id === null) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const item = await pantry.getItem(id);
  if (!item) return NextResponse.json({ error: "Item nao encontrado" }, { status: 404 });
  return NextResponse.json(toItemDTO(item));
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const id = parseId((await params).id);
  if (id === null) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const existing = await pantry.getItem(id);
  if (!existing) return NextResponse.json({ error: "Item nao encontrado" }, { status: 404 });

  const body = await req.json();
  const item = await pantry.updateItem(id, {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.quantity !== undefined ? { quantity: Number(body.quantity) } : {}),
    ...(body.unit !== undefined ? { unit: body.unit } : {}),
    ...(body.group !== undefined ? { group: body.group } : {}),
    ...(body.category !== undefined ? { category: body.category } : {}),
    ...(body.barcode !== undefined ? { barcode: body.barcode } : {}),
    ...(body.minQuantity !== undefined ? { minQuantity: Number(body.minQuantity) } : {}),
    ...(body.expiryDate !== undefined ? { expiryDate: body.expiryDate } : {}),
    ...(body.lastPurchaseDate !== undefined ? { lastPurchaseDate: body.lastPurchaseDate } : {}),
  });

  return NextResponse.json(toItemDTO(item));
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const id = parseId((await params).id);
  if (id === null) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const existing = await pantry.getItem(id);
  if (!existing) return NextResponse.json({ error: "Item nao encontrado" }, { status: 404 });

  await pantry.deleteItem(id);
  return new NextResponse(null, { status: 204 });
}
