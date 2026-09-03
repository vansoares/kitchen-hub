import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as purchases from "@/lib/purchases";
import { getUserEmail } from "@/lib/session";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userEmail = await getUserEmail();
  if (!userEmail) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const existing = await purchases.getPurchase(userEmail, id);
  if (!existing) return NextResponse.json({ error: "Compra nao encontrada" }, { status: 404 });

  await purchases.deletePurchase(userEmail, id);
  return new NextResponse(null, { status: 204 });
}
