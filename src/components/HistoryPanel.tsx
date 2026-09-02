"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import type { HistoryEntryDTO } from "@/types/item";

const REASON_LABELS: Record<string, string> = {
  criacao: "Criado",
  compra: "Compra",
  consumo: "Consumo",
  ajuste: "Ajuste",
};

export function HistoryPanel({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<HistoryEntryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .globalHistory(100)
      .then(setEntries)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar historico"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-brand-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-500/10 px-6 py-4 dark:border-white/10">
          <h2 className="text-xl font-bold text-brand-700 dark:text-brand-100">Historico</h2>
          <button
            onClick={onClose}
            className="rounded-lg bg-brand-500/10 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:text-brand-200"
          >
            Fechar
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          {loading && <p className="py-8 text-center text-brand-400">Carregando...</p>}
          {error && <p className="py-8 text-center text-red-500">{error}</p>}
          {!loading && !error && entries.length === 0 && (
            <p className="py-8 text-center text-brand-400">Nenhum evento ainda.</p>
          )}

          <ul className="flex flex-col gap-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-xl bg-brand-500/5 px-4 py-2.5 text-sm dark:bg-white/5"
              >
                <div>
                  <span className="font-semibold text-brand-800 dark:text-cream">{entry.itemName}</span>
                  <span className="ml-2 text-brand-400 dark:text-brand-300">
                    {REASON_LABELS[entry.reason] ?? entry.reason}
                  </span>
                </div>
                <div className="text-right">
                  <div
                    className={`font-bold ${
                      entry.change >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {entry.change >= 0 ? "+" : ""}
                    {entry.change}
                  </div>
                  <div className="text-xs text-brand-400 dark:text-brand-300">
                    {new Date(entry.timestamp).toLocaleString("pt-BR")}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
