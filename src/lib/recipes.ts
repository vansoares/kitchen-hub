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

export function getRecipes(search?: string) {
  return prisma.recipe.findMany({
    where: search ? { title: { contains: search, mode: "insensitive" } } : undefined,
    include: withIngredients,
    orderBy: { title: "asc" },
  });
}

export function getRecipe(id: number) {
  return prisma.recipe.findUnique({ where: { id }, include: withIngredients });
}

export function createRecipe(data: RecipeInput) {
  return prisma.recipe.create({
    data: {
      title: data.title,
      servings: data.servings,
      instructions: data.instructions,
      ingredients: { create: data.ingredients },
    },
    include: withIngredients,
  });
}

export function updateRecipe(id: number, data: RecipeInput) {
  // Ingredientes sao substituidos por completo - mais simples que fazer diff
  // linha a linha, e a lista costuma ser pequena (poucas dezenas no maximo).
  return prisma.$transaction(async (tx) => {
    await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
    return tx.recipe.update({
      where: { id },
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

export function deleteRecipe(id: number) {
  return prisma.recipe.delete({ where: { id } });
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
