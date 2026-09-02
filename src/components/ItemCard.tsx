import type { ItemDTO } from "@/types/item";
import { Badge } from "@/components/Badge";

const BORDER_BY_STATUS: Record<string, string> = {
  ok: "border-l-emerald-400",
  acabando: "border-l-amber-400",
  vencendo: "border-l-accent-500",
  vencido: "border-l-red-500",
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
    <div
      className={`flex flex-col gap-2 rounded-2xl border-l-4 bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-brand-800 ${BORDER_BY_STATUS[item.status]}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold">{item.name}</h3>
        <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs text-brand-700 dark:bg-white/10 dark:text-brand-100">
          {item.category}
        </span>
      </div>

      <Badge status={item.status} />

      <div className="text-2xl font-bold text-brand-600 dark:text-brand-200">
        {item.quantity} <span className="text-base font-medium">{item.unit}</span>
        <span className="ml-2 text-xs font-normal text-brand-400 dark:text-brand-300">
          minimo {item.minQuantity}
        </span>
      </div>

      {item.expiryDate && (
        <div className="text-xs text-brand-500 dark:text-brand-300">
          Validade: {formatDate(item.expiryDate)}
        </div>
      )}
      {item.lastPurchaseDate && (
        <div className="text-xs text-brand-500 dark:text-brand-300">
          Ultima compra: {formatDate(item.lastPurchaseDate)}
        </div>
      )}

      <div className="mt-1 flex gap-2">
        <button
          onClick={() => onConsume(item)}
          className="flex-1 rounded-xl bg-red-500/10 py-2 text-sm font-bold text-red-600 transition hover:bg-red-500/20 dark:text-red-400"
        >
          − Usar
        </button>
        <button
          onClick={() => onPurchase(item)}
          className="flex-1 rounded-xl bg-emerald-500/10 py-2 text-sm font-bold text-emerald-600 transition hover:bg-emerald-500/20 dark:text-emerald-400"
        >
          + Comprei
        </button>
        <button
          onClick={() => onEdit(item)}
          className="rounded-xl bg-brand-500/10 px-3 text-sm font-bold text-brand-600 transition hover:bg-brand-500/20 dark:text-brand-200"
        >
          ✎
        </button>
      </div>
    </div>
  );
}
