import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as purchases from "@/lib/purchases";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const existing = await purchases.getPurchase(id);
  if (!existing) return NextResponse.json({ error: "Compra nao encontrada" }, { status: 404 });

  await purchases.deletePurchase(id);
  return new NextResponse(null, { status: 204 });
}
