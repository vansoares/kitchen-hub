import type { Item } from "@prisma/client";
import type { ItemDTO, ItemGroup, ItemStatus } from "@/types/item";

// Itens que vencem em ate esse numero de dias ganham o status "vencendo".
export const EXPIRY_WARN_DAYS = 3;

// "Hoje" sempre no fuso do Brasil: o servidor roda em UTC e, sem isso, a
// partir das 21h o dia ja viraria pra quem esta em Sao Paulo.
function todayIso(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

function toIsoDate(d: Date | null): string | null {
  if (!d) return null;
  return new Date(d).toISOString().slice(0, 10);
}

export function daysUntil(expiryIso: string | null): number | null {
  if (!expiryIso) return null;
  const ms = Date.parse(`${expiryIso}T00:00:00Z`) - Date.parse(`${todayIso()}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export function computeStatus(
  item: Pick<Item, "quantity" | "minQuantity" | "inUse" | "expiryDate">
): ItemStatus {
  // sem estoque mas com uma unidade em uso nao e alerta - a pessoa so quer saber que tem.
  if (item.quantity <= 0) return item.inUse ? "em_uso" : "acabou";

  const days = daysUntil(toIsoDate(item.expiryDate));
  if (days !== null) {
    if (days < 0) return "vencido";
    if (days <= EXPIRY_WARN_DAYS) return "vencendo";
  }

  if (item.quantity <= item.minQuantity) return "acabando";
  return "ok";
}

// Status que merecem atencao (contador, filtro "Alertas", notificacoes).
export function isAlertStatus(status: ItemStatus): boolean {
  return status !== "ok" && status !== "em_uso";
}

export function toItemDTO(item: Item): ItemDTO {
  const expiryDate = toIsoDate(item.expiryDate);
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
    expiryDate,
    daysToExpiry: daysUntil(expiryDate),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    status: computeStatus(item),
  };
}
