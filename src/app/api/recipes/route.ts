import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as recipes from "@/lib/recipes";
import { getUserEmail } from "@/lib/session";

export async function GET(req: NextRequest) {
  const userEmail = await getUserEmail();
  if (!userEmail) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? undefined;

  const list = await recipes.getRecipes(userEmail, search);
  return NextResponse.json(list.map(recipes.toRecipeDTO));
}

export async function POST(req: NextRequest) {
  const userEmail = await getUserEmail();
  if (!userEmail) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await req.json();

  if (!body?.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "Titulo e obrigatorio" }, { status: 422 });
  }
  if (!Array.isArray(body.ingredients)) {
    return NextResponse.json({ error: "ingredients deve ser uma lista" }, { status: 422 });
  }

  const recipe = await recipes.createRecipe(userEmail, {
    title: body.title,
    servings: Number(body.servings ?? 1),
    instructions: body.instructions || null,
    ingredients: body.ingredients.map((i: { name: string; quantity: number; unit: string }) => ({
      name: i.name,
      quantity: Number(i.quantity),
      unit: i.unit || "un",
    })),
  });

  return NextResponse.json(recipes.toRecipeDTO(recipe), { status: 201 });
}
