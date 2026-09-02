import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as recipes from "@/lib/recipes";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const recipe = await recipes.getRecipe(id);
  if (!recipe) return NextResponse.json({ error: "Receita nao encontrada" }, { status: 404 });
  return NextResponse.json(recipes.toRecipeDTO(recipe));
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const existing = await recipes.getRecipe(id);
  if (!existing) return NextResponse.json({ error: "Receita nao encontrada" }, { status: 404 });

  const body = await req.json();
  if (!body?.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "Titulo e obrigatorio" }, { status: 422 });
  }

  const recipe = await recipes.updateRecipe(id, {
    title: body.title,
    servings: Number(body.servings ?? 1),
    instructions: body.instructions || null,
    ingredients: (body.ingredients ?? []).map((i: { name: string; quantity: number; unit: string }) => ({
      name: i.name,
      quantity: Number(i.quantity),
      unit: i.unit || "un",
    })),
  });

  return NextResponse.json(recipes.toRecipeDTO(recipe));
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const existing = await recipes.getRecipe(id);
  if (!existing) return NextResponse.json({ error: "Receita nao encontrada" }, { status: 404 });

  await recipes.deleteRecipe(id);
  return new NextResponse(null, { status: 204 });
}
