import type { ItemDTO } from "@/types/item";
import { Badge } from "@/components/Badge";

const BG_BY_STATUS: Record<string, string> = {
  ok: "bg-emerald-50 dark:bg-emerald-950/40",
  acabando: "bg-amber-50 dark:bg-amber-950/40",
  acabou: "bg-red-50 dark:bg-red-950/40",
  em_uso: "bg-sky-50 dark:bg-sky-950/40",
  vencendo: "bg-orange-50 dark:bg-orange-950/40",
  vencido: "bg-rose-100 dark:bg-rose-950/50",
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function expiryLabel(days: number | null) {
  if (days === null) return "Validade";
  if (days < 0) return `Venceu ha ${-days} dia${days === -1 ? "" : "s"}`;
  if (days === 0) return "Vence hoje";
  if (days === 1) return "Vence amanha";
  return `Vence em ${days} dias`;
}

interface Props {
  item: ItemDTO;
  onConsume: (item: ItemDTO) => void;
  onPurchase: (item: ItemDTO) => void;
  onToggleInUse: (item: ItemDTO) => void;
  onEdit: (item: ItemDTO) => void;
  compact?: boolean;
}

export function ItemCard({ item, onConsume, onPurchase, onToggleInUse, onEdit, compact }: Props) {
  return (
    <div
      className={`flex flex-col shadow-sm transition hover:shadow-md ${BG_BY_STATUS[item.status]} ${
        compact ? "gap-1 rounded-xl p-2.5" : "gap-3 rounded-3xl p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className={`font-disp truncate font-bold ${compact ? "text-sm" : "text-lg"}`}>{item.name}</h3>
          <span className={`font-semibold text-brand-900/50 dark:text-cream/50 ${compact ? "text-[11px]" : "text-xs"}`}>
            {item.category}
          </span>
        </div>
        <Badge status={item.status} />
      </div>

      <div className={`font-disp font-bold ${compact ? "text-lg" : "text-3xl"}`}>
        {item.quantity} <span className="text-sm font-semibold text-brand-900/50 dark:text-cream/50">{item.unit}</span>
      </div>

      <div className={`font-semibold text-brand-900/50 dark:text-cream/50 ${compact ? "text-[11px]" : "text-xs"}`}>
        minimo {item.minQuantity}
        {item.lastPurchaseDate && <> &middot; compra {formatDate(item.lastPurchaseDate)}</>}
      </div>

      {item.expiryDate && item.quantity > 0 && (
        <div
          className={`font-semibold ${compact ? "text-[11px]" : "text-xs"} ${
            item.status === "vencido"
              ? "text-rose-700 dark:text-rose-300"
              : item.status === "vencendo"
                ? "text-orange-600 dark:text-orange-300"
                : "text-brand-900/50 dark:text-cream/50"
          }`}
        >
          {expiryLabel(item.daysToExpiry)} &middot; {formatDate(item.expiryDate)}
        </div>
      )}

      <div className={`flex items-center gap-1.5 ${compact ? "mt-0.5" : "mt-1 gap-3"}`}>
        <button
          onClick={() => onConsume(item)}
          aria-label="Usar uma unidade"
          className={`flex shrink-0 items-center justify-center rounded-full bg-red-100 font-extrabold text-red-500 transition hover:bg-red-200 dark:bg-red-500/20 dark:text-red-300 ${
            compact ? "h-7 w-7 text-base" : "h-11 w-11 text-xl"
          }`}
        >
          −
        </button>
        <button
          onClick={() => onPurchase(item)}
          aria-label="Marcar como comprado"
          className={`flex shrink-0 items-center justify-center rounded-full bg-emerald-100 font-extrabold text-emerald-600 transition hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 ${
            compact ? "h-7 w-7 text-base" : "h-11 w-11 text-xl"
          }`}
        >
          +
        </button>
        <button
          onClick={() => onToggleInUse(item)}
          aria-label={item.inUse ? "Desmarcar em uso" : "Marcar como em uso"}
          aria-pressed={item.inUse}
          className={`flex shrink-0 items-center justify-center rounded-full font-bold transition ${
            item.inUse
              ? "bg-sky-500 text-white hover:bg-sky-600"
              : "bg-sky-100 text-sky-600 hover:bg-sky-200 dark:bg-sky-500/20 dark:text-sky-300"
          } ${compact ? "h-7 px-2.5 text-[11px]" : "h-11 px-4 text-sm"}`}
        >
          {item.inUse ? "Em uso ✓" : "Em uso"}
        </button>
        <button
          onClick={() => onEdit(item)}
          aria-label="Editar item"
          className={`ml-auto flex shrink-0 items-center justify-center rounded-full bg-brand-900/10 text-brand-900/60 transition hover:bg-brand-900/20 dark:bg-white/10 dark:text-cream/70 ${
            compact ? "h-7 w-7 text-xs" : "h-11 w-11 text-base"
          }`}
        >
          ✎
        </button>
      </div>
    </div>
  );
}
