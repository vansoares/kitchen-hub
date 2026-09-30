import type { Item } from "@prisma/client";
import type { ItemDTO, ItemGroup, ItemStatus } from "@/types/item";

export function computeStatus(item: Pick<Item, "quantity" | "minQuantity" | "inUse">): ItemStatus {
  // sem estoque mas com uma unidade em uso nao e alerta - a pessoa so quer saber que tem.
  if (item.quantity <= 0) return item.inUse ? "em_uso" : "acabou";
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
    group: item.group as ItemGroup,
    category: item.category,
    minQuantity: item.minQuantity,
    inUse: item.inUse,
    lastPurchaseDate: toIsoDate(item.lastPurchaseDate),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    status: computeStatus(item),
  };
}
