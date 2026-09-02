import type { ItemStatus } from "@/types/item";

const STYLES: Record<ItemStatus, string> = {
  ok: "bg-emerald-500 text-white",
  acabando: "bg-amber-500 text-white",
  acabou: "bg-red-500 text-white",
};

const LABELS: Record<ItemStatus, string> = {
  ok: "Em dia",
  acabando: "Acabando",
  acabou: "Acabou",
};

export function Badge({ status }: { status: ItemStatus }) {
  return (
    <span className={`inline-block w-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
