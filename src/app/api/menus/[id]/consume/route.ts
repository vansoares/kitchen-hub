import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as menus from "@/lib/menus";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const body = await req.json();
  const amount = Number(body?.amount);

  if (!Number.isInteger(id)) return NextResponse.json({ error: "Id invalido" }, { status: 422 });
  if (!(amount > 0)) return NextResponse.json({ error: "amount deve ser positivo" }, { status: 422 });

  const existing = await menus.getMenu(id);
  if (!existing) return NextResponse.json({ error: "Cardapio nao encontrado" }, { status: 404 });

  const menu = await menus.consumeMenuStock(id, amount);
  return NextResponse.json({ id: menu.id, quantity: menu.quantity });
}
