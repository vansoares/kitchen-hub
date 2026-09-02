import type { ItemDTO } from "@/types/item";
import { Badge } from "@/components/Badge";

const BG_BY_STATUS: Record<string, string> = {
  ok: "bg-emerald-50 dark:bg-emerald-950/40",
  acabando: "bg-amber-50 dark:bg-amber-950/40",
  vencendo: "bg-accent-500/10 dark:bg-accent-500/15",
  vencido: "bg-red-50 dark:bg-red-950/40",
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

interface Props {
  item: ItemDTO;
  onConsume: (item: ItemDTO) => void;
  onPurchase: (item: ItemDTO) => void;
  onEdit: (item: ItemDTO) => void;
}

export function ItemCard({ item, onConsume, onPurchase, onEdit }: Props) {
  return (
    <div className={`flex flex-col gap-3 rounded-3xl p-5 shadow-sm transition hover:shadow-md ${BG_BY_STATUS[item.status]}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-disp text-lg font-bold">{item.name}</h3>
          <span className="text-xs font-semibold text-brand-900/50 dark:text-cream/50">{item.category}</span>
        </div>
        <Badge status={item.status} />
      </div>

      <div className="font-disp text-3xl font-bold">
        {item.quantity} <span className="text-base font-semibold text-brand-900/50 dark:text-cream/50">{item.unit}</span>
      </div>

      <div className="text-xs font-semibold text-brand-900/50 dark:text-cream/50">
        minimo {item.minQuantity}
        {item.expiryDate && <> &middot; valida {formatDate(item.expiryDate)}</>}
        {item.lastPurchaseDate && <> &middot; compra {formatDate(item.lastPurchaseDate)}</>}
      </div>

      <div className="mt-1 flex items-center gap-3">
        <button
          onClick={() => onConsume(item)}
          aria-label="Usar uma unidade"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl font-extrabold text-red-500 transition hover:bg-red-200 dark:bg-red-500/20 dark:text-red-300"
        >
          −
        </button>
        <button
          onClick={() => onPurchase(item)}
          aria-label="Marcar como comprado"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-extrabold text-emerald-600 transition hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300"
        >
          +
        </button>
        <button
          onClick={() => onEdit(item)}
          aria-label="Editar item"
          className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-900/10 text-base text-brand-900/60 transition hover:bg-brand-900/20 dark:bg-white/10 dark:text-cream/70"
        >
          ✎
        </button>
      </div>
    </div>
  );
}
