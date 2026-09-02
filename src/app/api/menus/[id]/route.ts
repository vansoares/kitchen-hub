import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as menus from "@/lib/menus";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const menu = await menus.getMenu(id);
  if (!menu) return NextResponse.json({ error: "Cardapio nao encontrado" }, { status: 404 });
  return NextResponse.json(menus.toMenuDetailDTO(menu));
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const existing = await menus.getMenu(id);
  if (!existing) return NextResponse.json({ error: "Cardapio nao encontrado" }, { status: 404 });

  const body = await req.json();
  if (!body?.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "Nome e obrigatorio" }, { status: 422 });
  }

  const menu = await menus.updateMenu(id, {
    name: body.name,
    quantity: Number(body.quantity) || 0,
    recipes: (body.recipes ?? []).map((r: { recipeId: number; servings: number }) => ({
      recipeId: Number(r.recipeId),
      servings: Number(r.servings) || 1,
    })),
    items: (body.items ?? []).map((i: { name: string; quantity: number; unit: string }) => ({
      name: i.name,
      quantity: Number(i.quantity) || 0,
      unit: i.unit || "un",
    })),
  });

  return NextResponse.json(menus.toMenuDetailDTO(menu));
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const existing = await menus.getMenu(id);
  if (!existing) return NextResponse.json({ error: "Cardapio nao encontrado" }, { status: 404 });

  await menus.deleteMenu(id);
  return new NextResponse(null, { status: 204 });
}
