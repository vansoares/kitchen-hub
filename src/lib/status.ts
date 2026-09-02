import type { Item } from "@prisma/client";
import type { ItemDTO, ItemStatus } from "@/types/item";

// Itens vencendo dentro desse numero de dias entram no status "vencendo".
export const EXPIRY_WARNING_DAYS = 3;

function toDateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function computeStatus(item: Pick<Item, "quantity" | "minQuantity" | "expiryDate">): ItemStatus {
  const today = toDateOnly(new Date());

  if (item.expiryDate) {
    const expiry = toDateOnly(new Date(item.expiryDate));
    if (expiry < today) return "vencido";
    const warningCutoff = new Date(today);
    warningCutoff.setDate(warningCutoff.getDate() + EXPIRY_WARNING_DAYS);
    if (expiry <= warningCutoff) return "vencendo";
  }

  if (item.quantity <= item.minQuantity) return "acabando";
  return "ok";
}

function toIsoDate(d: Date | null): string | null {
  if (!d) return null;
  return new Date(d).toISOString().slice(0, 10);
}

export function toItemDTO(item: Item): ItemDTO {
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    barcode: item.barcode,
    minQuantity: item.minQuantity,
    expiryDate: toIsoDate(item.expiryDate),
    lastPurchaseDate: toIsoDate(item.lastPurchaseDate),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    status: computeStatus(item),
  };
}
