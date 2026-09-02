"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import type { MenuDetailDTO } from "@/types/recipe";

interface Props {
  menuId: number;
  onClose: () => void;
  onEdit: () => void;
  onStockChange?: () => void;
}

export function MenuDetailPanel({ menuId, onClose, onEdit, onStockChange }: Props) {
  const [menu, setMenu] = useState<MenuDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api
      .getMenu(menuId)
      .then(setMenu)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar cardapio"))
      .finally(() => setLoading(false));
  }

  useEffect(load, [menuId]);

  async function handlePrepare() {
    await api.prepareMenu(menuId, 1);
    load();
    onStockChange?.();
  }

  async function handleConsume() {
    await api.consumeMenu(menuId, 1);
    load();
    onStockChange?.();
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
          <h2 className="font-disp text-xl font-bold text-brand-700 dark:text-brand-100">
            {menu?.name ?? "Cardapio"}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="rounded-full bg-brand-500/10 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:text-brand-200"
            >
              Editar
            </button>
            <button
              onClick={onClose}
              className="rounded-full bg-brand-500/10 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:text-brand-200"
            >
              Fechar
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6">
          {loading && <p className="py-8 text-center text-brand-400">Carregando...</p>}
          {error && <p className="py-8 text-center text-red-500">{error}</p>}

          {menu && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between rounded-2xl bg-accent-500/10 p-4">
                <div>
                  <div className="text-xs font-semibold text-brand-900/60 dark:text-cream/60">
                    Porcoes prontas no freezer
                  </div>
                  <div className="font-disp text-3xl font-bold text-accent-600 dark:text-accent-400">
                    {menu.quantity}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleConsume}
                    aria-label="Comi uma porcao"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-xl font-extrabold text-red-500 dark:bg-red-500/20 dark:text-red-300"
                  >
                    −
                  </button>
                  <button
                    onClick={handlePrepare}
                    aria-label="Preparei mais uma porcao"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-xl font-extrabold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                  >
                    +
                  </button>
                </div>
              </div>

              {menu.recipes.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-400">Receitas</h3>
                  <ul className="flex flex-col gap-1">
                    {menu.recipes.map((r) => (
                      <li key={r.id} className="text-sm">
                        {r.recipeTitle} &times; {r.servings} porcoes
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {menu.items.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-400">
                    Itens soltos
                  </h3>
                  <ul className="flex flex-col gap-1">
                    {menu.items.map((i) => (
                      <li key={i.id} className="text-sm">
                        {i.quantity} {i.unit} {i.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-400">
                  Quantidades totais
                </h3>
                {menu.totalIngredients.length === 0 ? (
                  <p className="text-sm text-brand-400">Sem ingredientes.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {menu.totalIngredients.map((i) => (
                      <li
                        key={`${i.name}-${i.unit}`}
                        className="flex items-center justify-between rounded-xl bg-brand-500/5 px-4 py-2.5 text-sm dark:bg-white/5"
                      >
                        <span className="font-semibold">{i.name}</span>
                        <span className="font-disp font-bold">
                          {i.quantity} {i.unit}
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
