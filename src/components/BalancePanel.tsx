"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import type { SpendingSummaryDTO } from "@/types/purchase";

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function BalancePanel({ onClose }: { onClose: () => void }) {
  const [summary, setSummary] = useState<SpendingSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api
      .getSpendingSummary()
      .then(setSummary)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar balanco"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id: number) {
    if (!window.confirm("Excluir esse lancamento?")) return;
    await api.deletePurchase(id);
    load();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-brand-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-500/10 px-6 py-4 dark:border-white/10">
          <h2 className="font-disp text-xl font-bold text-brand-700 dark:text-brand-100">💰 Balanco</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-brand-500/10 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:text-brand-200"
          >
            Fechar
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {loading && <p className="py-8 text-center text-brand-400">Carregando...</p>}
          {error && <p className="py-8 text-center text-red-500">{error}</p>}

          {summary && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-accent-500/10 p-4">
                  <div className="text-xs font-semibold text-brand-900/60 dark:text-cream/60">Este mes</div>
                  <div className="font-disp text-2xl font-bold text-accent-600 dark:text-accent-400">
                    {formatMoney(summary.totalThisMonth)}
                  </div>
                  <div className="text-xs text-brand-900/50 dark:text-cream/50">
                    {summary.countThisMonth} {summary.countThisMonth === 1 ? "compra" : "compras"}
                  </div>
                </div>
                <div className="rounded-2xl bg-brand-100 p-4 dark:bg-white/5">
                  <div className="text-xs font-semibold text-brand-900/60 dark:text-cream/60">Total geral</div>
                  <div className="font-disp text-2xl font-bold text-brand-600 dark:text-brand-200">
                    {formatMoney(summary.totalAllTime)}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-400">
                  Ultimas compras
                </h3>
                {summary.recent.length === 0 ? (
                  <p className="text-sm text-brand-400">Nenhuma compra registrada ainda.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {summary.recent.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between rounded-xl bg-brand-500/5 px-4 py-2.5 text-sm dark:bg-white/5"
                      >
                        <span>{formatDate(p.createdAt)}</span>
                        <span className="flex items-center gap-3">
                          <span className="font-disp font-bold">{formatMoney(p.total)}</span>
                          <button
                            onClick={() => handleDelete(p.id)}
                            aria-label="Excluir lancamento"
                            className="text-brand-900/30 hover:text-red-500 dark:text-cream/30 dark:hover:text-red-400"
                          >
                            ✕
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
