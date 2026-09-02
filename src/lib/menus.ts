import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AggregatedIngredientDTO, MenuDTO, MenuDetailDTO } from "@/types/recipe";

export interface MenuRecipeInput {
  recipeId: number;
  servings: number;
}

export interface MenuInput {
  name: string;
  recipes: MenuRecipeInput[];
}

const withRecipes = {
  recipes: {
    include: { recipe: { include: { ingredients: true } } },
    orderBy: { id: "asc" as const },
  },
};

type MenuWithRecipes = Prisma.MenuGetPayload<{ include: typeof withRecipes }>;

export function getMenus() {
  return prisma.menu.findMany({ include: withRecipes, orderBy: { name: "asc" } });
}

export function getMenu(id: number) {
  return prisma.menu.findUnique({ where: { id }, include: withRecipes });
}

export function createMenu(data: MenuInput) {
  return prisma.menu.create({
    data: {
      name: data.name,
      recipes: { create: data.recipes.map((r) => ({ recipeId: r.recipeId, servings: r.servings })) },
    },
    include: withRecipes,
  });
}

export function updateMenu(id: number, data: MenuInput) {
  return prisma.$transaction(async (tx) => {
    await tx.menuRecipe.deleteMany({ where: { menuId: id } });
    return tx.menu.update({
      where: { id },
      data: {
        name: data.name,
        recipes: { create: data.recipes.map((r) => ({ recipeId: r.recipeId, servings: r.servings })) },
      },
      include: withRecipes,
    });
  });
}

export function deleteMenu(id: number) {
  return prisma.menu.delete({ where: { id } });
}

export function toMenuDTO(menu: MenuWithRecipes): MenuDTO {
  return {
    id: menu.id,
    name: menu.name,
    recipes: menu.recipes.map((mr) => ({
      id: mr.id,
      recipeId: mr.recipeId,
      recipeTitle: mr.recipe.title,
      recipeServings: mr.recipe.servings,
      servings: mr.servings,
    })),
    createdAt: menu.createdAt.toISOString(),
    updatedAt: menu.updatedAt.toISOString(),
  };
}

// Soma os ingredientes de cada receita do cardapio, escalados pela proporcao
// "porcoes pedidas / porcoes base da receita". Agrupa por nome+unidade (sem
// diferenciar maiusculas/minusculas) pra "Arroz" e "arroz" virarem uma linha so.
export function aggregateIngredients(menu: MenuWithRecipes): AggregatedIngredientDTO[] {
  const totals = new Map<string, AggregatedIngredientDTO>();

  for (const menuRecipe of menu.recipes) {
    const scale = menuRecipe.servings / Math.max(1, menuRecipe.recipe.servings);
    for (const ingredient of menuRecipe.recipe.ingredients) {
      const key = `${ingredient.name.trim().toLowerCase()}__${ingredient.unit.trim().toLowerCase()}`;
      const existing = totals.get(key);
      const amount = ingredient.quantity * scale;
      if (existing) {
        existing.quantity += amount;
      } else {
        totals.set(key, { name: ingredient.name, unit: ingredient.unit, quantity: amount });
      }
    }
  }

  return [...totals.values()]
    .map((t) => ({ ...t, quantity: Math.round(t.quantity * 100) / 100 }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export function toMenuDetailDTO(menu: MenuWithRecipes): MenuDetailDTO {
  return { ...toMenuDTO(menu), totalIngredients: aggregateIngredients(menu) };
}
