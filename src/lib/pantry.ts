import { prisma } from "@/lib/prisma";
import { computeStatus } from "@/lib/status";
import type { Prisma } from "@prisma/client";

export interface ItemInput {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  barcode: string | null;
  minQuantity: number;
  expiryDate: string | null;
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

export function getItems(search?: string, category?: string) {
  return prisma.item.findMany({
    where: {
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export function getItem(id: number) {
  return prisma.item.findUnique({ where: { id } });
}

export async function getCategories(): Promise<string[]> {
  const rows = await prisma.item.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}

export function createItem(data: ItemInput) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.item.create({
      data: {
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        category: data.category,
        barcode: data.barcode,
        minQuantity: data.minQuantity,
        expiryDate: toDate(data.expiryDate),
        lastPurchaseDate: toDate(data.lastPurchaseDate),
      },
    });
    await logChange(tx, item.id, item.name, item.quantity, item.quantity, "criacao");
    return item;
  });
}

export async function updateItem(id: number, data: Partial<ItemInput>) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.item.findUniqueOrThrow({ where: { id } });
    const updated = await tx.item.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
        ...(data.unit !== undefined ? { unit: data.unit } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.barcode !== undefined ? { barcode: data.barcode } : {}),
        ...(data.minQuantity !== undefined ? { minQuantity: data.minQuantity } : {}),
        ...(data.expiryDate !== undefined ? { expiryDate: toDate(data.expiryDate) } : {}),
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

export function deleteItem(id: number) {
  return prisma.item.delete({ where: { id } });
}

export function purchaseItem(id: number, amount: number) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.item.findUniqueOrThrow({ where: { id } });
    const updated = await tx.item.update({
      where: { id },
      data: { quantity: current.quantity + amount, lastPurchaseDate: new Date() },
    });
    await logChange(tx, updated.id, updated.name, amount, updated.quantity, "compra");
    return updated;
  });
}

export function consumeItem(id: number, amount: number) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.item.findUniqueOrThrow({ where: { id } });
    const actual = Math.min(amount, current.quantity);
    const updated = await tx.item.update({
      where: { id },
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
export async function getAlerts() {
  const items = await prisma.item.findMany();
  return items
    .filter((item) => computeStatus(item) !== "ok")
    .sort((a, b) => {
      if (!a.expiryDate && !b.expiryDate) return 0;
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return a.expiryDate.getTime() - b.expiryDate.getTime();
    });
}

export function getHistory(itemId?: number, limit = 100) {
  return prisma.consumptionLog.findMany({
    where: itemId !== undefined ? { itemId } : undefined,
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}
