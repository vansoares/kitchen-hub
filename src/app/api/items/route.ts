import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as pantry from "@/lib/pantry";
import { toItemDTO } from "@/lib/status";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const items = await pantry.getItems(search, category);
  return NextResponse.json(items.map(toItemDTO));
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body?.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "Nome e obrigatorio" }, { status: 422 });
  }

  const item = await pantry.createItem({
    name: body.name,
    quantity: Number(body.quantity ?? 0),
    unit: body.unit ?? "un",
    category: body.category ?? "Outros",
    barcode: body.barcode ?? null,
    minQuantity: Number(body.minQuantity ?? 1),
    expiryDate: body.expiryDate ?? null,
    lastPurchaseDate: body.lastPurchaseDate ?? null,
  });

  return NextResponse.json(toItemDTO(item), { status: 201 });
}
