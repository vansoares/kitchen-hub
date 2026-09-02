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
  const recipes = Array.isArray(body.recipes) ? body.recipes : [];
  const items = Array.isArray(body.items) ? body.items : [];
  if (recipes.length === 0 && items.length === 0) {
    return NextResponse.json({ error: "Adicione pelo menos uma receita ou item" }, { status: 422 });
  }

  const menu = await menus.createMenu({
    name: body.name,
    quantity: Number(body.quantity) || 0,
    recipes: recipes.map((r: { recipeId: number; servings: number }) => ({
      recipeId: Number(r.recipeId),
      servings: Number(r.servings) || 1,
    })),
    items: items.map((i: { name: string; quantity: number; unit: string }) => ({
      name: i.name,
      quantity: Number(i.quantity) || 0,
      unit: i.unit || "un",
    })),
  });

  return NextResponse.json(menus.toMenuDetailDTO(menu), { status: 201 });
}
