import { NextResponse } from "next/server";
import * as menus from "@/lib/menus";

export async function GET() {
  const list = await menus.getMenus();
  return NextResponse.json(list.map(menus.toMenuDTO));
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body?.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "Nome e obrigatorio" }, { status: 422 });
  }
  if (!Array.isArray(body.recipes) || body.recipes.length === 0) {
    return NextResponse.json({ error: "Escolha pelo menos uma receita" }, { status: 422 });
  }

  const menu = await menus.createMenu({
    name: body.name,
    recipes: body.recipes.map((r: { recipeId: number; servings: number }) => ({
      recipeId: Number(r.recipeId),
      servings: Number(r.servings) || 1,
    })),
  });

  return NextResponse.json(menus.toMenuDetailDTO(menu), { status: 201 });
}
