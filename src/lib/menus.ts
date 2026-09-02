import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AggregatedIngredientDTO, MenuDTO, MenuDetailDTO } from "@/types/recipe";

export interface MenuRecipeInput {
  recipeId: number;
  servings: number;
}

export interface MenuItemInput {
  name: string;
  quantity: number;
  unit: string;
}

export interface MenuInput {
  name: string;
  quantity: number;
  recipes: MenuRecipeInput[];
  items: MenuItemInput[];
}

const withRecipes = {
  recipes: {
    include: { recipe: { include: { ingredients: true } } },
    orderBy: { id: "asc" as const },
  },
  items: { orderBy: { id: "asc" as const } },
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
      quantity: data.quantity,
      recipes: { create: data.recipes.map((r) => ({ recipeId: r.recipeId, servings: r.servings })) },
      items: { create: data.items },
    },
    include: withRecipes,
  });
}

export function updateMenu(id: number, data: MenuInput) {
  return prisma.$transaction(async (tx) => {
    await tx.menuRecipe.deleteMany({ where: { menuId: id } });
    await tx.menuItem.deleteMany({ where: { menuId: id } });
    return tx.menu.update({
      where: { id },
      data: {
        name: data.name,
        quantity: data.quantity,
        recipes: { create: data.recipes.map((r) => ({ recipeId: r.recipeId, servings: r.servings })) },
        items: { create: data.items },
      },
      include: withRecipes,
    });
  });
}

export function deleteMenu(id: number) {
  return prisma.menu.delete({ where: { id } });
}

// "Preparei X" - engorda o estoque de porcoes/marmitas prontas (ex: fez uma
// fornada grande e guardou no freezer).
export function prepareMenu(id: number, amount: number) {
  return prisma.menu.update({ where: { id }, data: { quantity: { increment: amount } } });
}

// "Comi 1" - tira do estoque, nunca deixa negativo.
export async function consumeMenuStock(id: number, amount: number) {
  const current = await prisma.menu.findUniqueOrThrow({ where: { id } });
  const actual = Math.min(amount, current.quantity);
  return prisma.menu.update({ where: { id }, data: { quantity: current.quantity - actual } });
}

export function toMenuDTO(menu: MenuWithRecipes): MenuDTO {
  return {
    id: menu.id,
    name: menu.name,
    quantity: menu.quantity,
    recipes: menu.recipes.map((mr) => ({
      id: mr.id,
      recipeId: mr.recipeId,
      recipeTitle: mr.recipe.title,
      recipeServings: mr.recipe.servings,
      servings: mr.servings,
    })),
    items: menu.items.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity, unit: i.unit })),
    createdAt: menu.createdAt.toISOString(),
    updatedAt: menu.updatedAt.toISOString(),
  };
}

// Soma os ingredientes de cada receita do cardapio, escalados pela proporcao
// "porcoes pedidas / porcoes base da receita", mais os itens soltos (sem
// escala - sao quantidades diretas). Agrupa por nome+unidade (sem diferenciar
// maiusculas/minusculas) pra "Arroz" e "arroz" virarem uma linha so.
export function aggregateIngredients(menu: MenuWithRecipes): AggregatedIngredientDTO[] {
  const totals = new Map<string, AggregatedIngredientDTO>();

  function add(name: string, unit: string, amount: number) {
    const key = `${name.trim().toLowerCase()}__${unit.trim().toLowerCase()}`;
    const existing = totals.get(key);
    if (existing) {
      existing.quantity += amount;
    } else {
      totals.set(key, { name, unit, quantity: amount });
    }
  }

  for (const menuRecipe of menu.recipes) {
    const scale = menuRecipe.servings / Math.max(1, menuRecipe.recipe.servings);
    for (const ingredient of menuRecipe.recipe.ingredients) {
      add(ingredient.name, ingredient.unit, ingredient.quantity * scale);
    }
  }
  for (const item of menu.items) {
    add(item.name, item.unit, item.quantity);
  }

  return [...totals.values()]
    .map((t) => ({ ...t, quantity: Math.round(t.quantity * 100) / 100 }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export function toMenuDetailDTO(menu: MenuWithRecipes): MenuDetailDTO {
  return { ...toMenuDTO(menu), totalIngredients: aggregateIngredients(menu) };
}
