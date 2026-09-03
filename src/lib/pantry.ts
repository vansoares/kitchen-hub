import { prisma } from "@/lib/prisma";
import { computeStatus } from "@/lib/status";
import type { Prisma } from "@prisma/client";

export interface ItemInput {
  name: string;
  quantity: number;
  unit: string;
  group: string;
  category: string;
  minQuantity: number;
  lastPurchaseDate: string | null;
}

function toDate(iso: string | null | undefined): Date | null {
  return iso ? new Date(iso) : null;
}

async function logChange(
  tx: Prisma.TransactionClient,
  itemId: number,
  itemName: string,
  change: number,
  quantityAfter: number,
  reason: "criacao" | "compra" | "consumo" | "ajuste"
) {
  await tx.consumptionLog.create({
    data: { itemId, itemName, change, quantityAfter, reason },
  });
}

export function getItems(userEmail: string, search?: string, category?: string, group?: string) {
  return prisma.item.findMany({
    where: {
      userEmail,
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      ...(category ? { category } : {}),
      ...(group ? { group } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export function getItem(userEmail: string, id: number) {
  return prisma.item.findFirst({ where: { id, userEmail } });
}

export async function getCategories(userEmail: string, group?: string): Promise<string[]> {
  const rows = await prisma.item.findMany({
    where: { userEmail, ...(group ? { group } : {}) },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}

export function createItem(userEmail: string, data: ItemInput) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.item.create({
      data: {
        userEmail,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        group: data.group,
        category: data.category,
        minQuantity: data.minQuantity,
        lastPurchaseDate: toDate(data.lastPurchaseDate),
      },
    });
    await logChange(tx, item.id, item.name, item.quantity, item.quantity, "criacao");
    return item;
  });
}

export async function updateItem(userEmail: string, id: number, data: Partial<ItemInput>) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.item.findFirstOrThrow({ where: { id, userEmail } });
    const updated = await tx.item.update({
      where: { id: current.id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
        ...(data.unit !== undefined ? { unit: data.unit } : {}),
        ...(data.group !== undefined ? { group: data.group } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.minQuantity !== undefined ? { minQuantity: data.minQuantity } : {}),
        ...(data.lastPurchaseDate !== undefined
          ? { lastPurchaseDate: toDate(data.lastPurchaseDate) }
          : {}),
      },
    });
    if (data.quantity !== undefined && data.quantity !== current.quantity) {
      await logChange(
        tx,
        updated.id,
        updated.name,
        updated.quantity - current.quantity,
        updated.quantity,
        "ajuste"
      );
    }
    return updated;
  });
}

export async function deleteItem(userEmail: string, id: number) {
  const { count } = await prisma.item.deleteMany({ where: { id, userEmail } });
  if (count === 0) throw new Error("Item nao encontrado");
}

export function purchaseItem(userEmail: string, id: number, amount: number) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.item.findFirstOrThrow({ where: { id, userEmail } });
    const updated = await tx.item.update({
      where: { id: current.id },
      data: { quantity: current.quantity + amount, lastPurchaseDate: new Date() },
    });
    await logChange(tx, updated.id, updated.name, amount, updated.quantity, "compra");
    return updated;
  });
}

export function consumeItem(userEmail: string, id: number, amount: number) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.item.findFirstOrThrow({ where: { id, userEmail } });
    const actual = Math.min(amount, current.quantity);
    const updated = await tx.item.update({
      where: { id: current.id },
      data: { quantity: current.quantity - actual },
    });
    await logChange(tx, updated.id, updated.name, -actual, updated.quantity, "consumo");
    return updated;
  });
}

// Prisma nao suporta comparar duas colunas da mesma linha (quantity <= minQuantity)
// no filtro `where`, entao o status - que ja precisa ser calculado em JS mesmo -
// e usado diretamente para filtrar. Despensas domesticas sao pequenas, entao
// trazer tudo e filtrar em memoria e mais simples que SQL raw aqui.
export async function getAlerts(userEmail: string, group?: string) {
  const items = await prisma.item.findMany({ where: { userEmail, ...(group ? { group } : {}) } });
  return items
    .filter((item) => computeStatus(item) !== "ok")
    .sort((a, b) => (a.quantity === b.quantity ? 0 : a.quantity - b.quantity));
}
