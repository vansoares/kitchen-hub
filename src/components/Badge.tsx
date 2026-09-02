import type { ItemStatus } from "@/types/item";

const STYLES: Record<ItemStatus, string> = {
  ok: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  acabando: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  vencendo: "bg-accent-400/20 text-accent-600 dark:bg-accent-500/30 dark:text-accent-400",
  vencido: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

const LABELS: Record<ItemStatus, string> = {
  ok: "Em dia",
  acabando: "Acabando",
  vencendo: "Vencendo",
  vencido: "Vencido",
};

export function Badge({ status }: { status: ItemStatus }) {
  return (
    <span className={`inline-block w-fit rounded-full px-3 py-0.5 text-xs font-semibold ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
