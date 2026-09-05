import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { ShoppingListDTO, ShoppingListSummaryDTO } from "@/types/shoppingList";

type ListWithItems = Prisma.ShoppingListGetPayload<{ include: { items: true } }>;

function toSummaryDTO(list: { id: number; name: string; createdBy: string; createdAt: Date; items: { checked: boolean }[] }): ShoppingListSummaryDTO {
  return {
    id: list.id,
    name: list.name,
    createdBy: list.createdBy,
    createdAt: list.createdAt.toISOString(),
    itemCount: list.items.length,
    checkedCount: list.items.filter((i) => i.checked).length,
  };
}

function toDTO(list: ListWithItems): ShoppingListDTO {
  return {
    ...toSummaryDTO(list),
    items: list.items.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      checked: i.checked,
      itemId: i.itemId,
    })),
  };
}

export async function getLists(householdId: number): Promise<ShoppingListSummaryDTO[]> {
  const lists = await prisma.shoppingList.findMany({
    where: { householdId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return lists.map(toSummaryDTO);
}

export async function getList(householdId: number, id: number): Promise<ShoppingListDTO | null> {
  const list = await prisma.shoppingList.findFirst({
    where: { id, householdId },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });
  return list ? toDTO(list) : null;
}

export async function createList(householdId: number, createdBy: string, name: string): Promise<ShoppingListDTO> {
  const list = await prisma.shoppingList.create({
    data: { householdId, createdBy, name },
    include: { items: true },
  });
  return toDTO(list);
}

export async function renameList(householdId: number, id: number, name: string): Promise<ShoppingListSummaryDTO> {
  await prisma.shoppingList.updateMany({ where: { id, householdId }, data: { name } });
  const list = await prisma.shoppingList.findFirstOrThrow({ where: { id, householdId }, include: { items: true } });
  return toSummaryDTO(list);
}

export async function deleteList(householdId: number, id: number): Promise<void> {
  const { count } = await prisma.shoppingList.deleteMany({ where: { id, householdId } });
  if (count === 0) throw new Error("Lista nao encontrada");
}

interface AddItemInput {
  itemId?: number;
  name?: string;
  quantity?: number;
  unit?: string;
}

export async function addItem(householdId: number, listId: number, input: AddItemInput): Promise<ShoppingListDTO> {
  const list = await prisma.shoppingList.findFirst({ where: { id: listId, householdId } });
  if (!list) throw new Error("Lista nao encontrada");

  if (input.itemId !== undefined) {
    const pantryItem = await prisma.item.findFirst({ where: { id: input.itemId, householdId } });
    if (!pantryItem) throw new Error("Item da despensa nao encontrado");
    await prisma.shoppingListItem.create({
      data: {
        listId,
        itemId: pantryItem.id,
        name: pantryItem.name,
        unit: pantryItem.unit,
        quantity: input.quantity ?? 1,
      },
    });
  } else {
    const name = input.name?.trim();
    if (!name) throw new Error("Nome e obrigatorio");
    await prisma.shoppingListItem.create({
      data: { listId, name, unit: input.unit ?? "un", quantity: input.quantity ?? 1 },
    });
  }

  return (await getList(householdId, listId))!;
}

export async function toggleItem(
  householdId: number,
  listId: number,
  itemId: number,
  checked: boolean
): Promise<ShoppingListDTO> {
  const list = await prisma.shoppingList.findFirst({ where: { id: listId, householdId } });
  if (!list) throw new Error("Lista nao encontrada");

  const { count } = await prisma.shoppingListItem.updateMany({ where: { id: itemId, listId }, data: { checked } });
  if (count === 0) throw new Error("Item nao encontrado na lista");

  return (await getList(householdId, listId))!;
}

export async function removeItem(householdId: number, listId: number, itemId: number): Promise<ShoppingListDTO> {
  const list = await prisma.shoppingList.findFirst({ where: { id: listId, householdId } });
  if (!list) throw new Error("Lista nao encontrada");

  await prisma.shoppingListItem.deleteMany({ where: { id: itemId, listId } });
  return (await getList(householdId, listId))!;
}
