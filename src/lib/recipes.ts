import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { RecipeDTO } from "@/types/recipe";

export interface IngredientInput {
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeInput {
  title: string;
  servings: number;
  instructions: string | null;
  ingredients: IngredientInput[];
}

const withIngredients = { ingredients: { orderBy: { id: "asc" as const } } };

export function getRecipes(userEmail: string, search?: string) {
  return prisma.recipe.findMany({
    where: {
      userEmail,
      ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
    },
    include: withIngredients,
    orderBy: { title: "asc" },
  });
}

export function getRecipe(userEmail: string, id: number) {
  return prisma.recipe.findFirst({ where: { id, userEmail }, include: withIngredients });
}

export function createRecipe(userEmail: string, data: RecipeInput) {
  return prisma.recipe.create({
    data: {
      userEmail,
      title: data.title,
      servings: data.servings,
      instructions: data.instructions,
      ingredients: { create: data.ingredients },
    },
    include: withIngredients,
  });
}

export function updateRecipe(userEmail: string, id: number, data: RecipeInput) {
  // Ingredientes sao substituidos por completo - mais simples que fazer diff
  // linha a linha, e a lista costuma ser pequena (poucas dezenas no maximo).
  return prisma.$transaction(async (tx) => {
    const existing = await tx.recipe.findFirstOrThrow({ where: { id, userEmail } });
    await tx.recipeIngredient.deleteMany({ where: { recipeId: existing.id } });
    return tx.recipe.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        servings: data.servings,
        instructions: data.instructions,
        ingredients: { create: data.ingredients },
      },
      include: withIngredients,
    });
  });
}

export async function deleteRecipe(userEmail: string, id: number) {
  const { count } = await prisma.recipe.deleteMany({ where: { id, userEmail } });
  if (count === 0) throw new Error("Receita nao encontrada");
}

type RecipeWithIngredients = Prisma.RecipeGetPayload<{ include: typeof withIngredients }>;

export function toRecipeDTO(recipe: RecipeWithIngredients): RecipeDTO {
  return {
    id: recipe.id,
    title: recipe.title,
    servings: recipe.servings,
    instructions: recipe.instructions,
    ingredients: recipe.ingredients.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
    })),
    createdAt: recipe.createdAt.toISOString(),
    updatedAt: recipe.updatedAt.toISOString(),
  };
}
