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

export function getRecipes(householdId: number, search?: string) {
  return prisma.recipe.findMany({
    where: {
      householdId,
      ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
    },
    include: withIngredients,
    orderBy: { title: "asc" },
  });
}

export function getRecipe(householdId: number, id: number) {
  return prisma.recipe.findFirst({ where: { id, householdId }, include: withIngredients });
}

export function createRecipe(householdId: number, data: RecipeInput) {
  return prisma.recipe.create({
    data: {
      householdId,
      title: data.title,
      servings: data.servings,
      instructions: data.instructions,
      ingredients: { create: data.ingredients },
    },
    include: withIngredients,
  });
}

export function updateRecipe(householdId: number, id: number, data: RecipeInput) {
  // Ingredientes sao substituidos por completo - mais simples que fazer diff
  // linha a linha, e a lista costuma ser pequena (poucas dezenas no maximo).
  return prisma.$transaction(async (tx) => {
    const existing = await tx.recipe.findFirstOrThrow({ where: { id, householdId } });
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

export async function deleteRecipe(householdId: number, id: number) {
  const { count } = await prisma.recipe.deleteMany({ where: { id, householdId } });
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
