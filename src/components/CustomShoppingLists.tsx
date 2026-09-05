"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import type { ShoppingListSummaryDTO } from "@/types/shoppingList";
import { ShoppingListDetail } from "@/components/ShoppingListDetail";

export function CustomShoppingLists({ onClose }: { onClose: () => void }) {
  const [lists, setLists] = useState<ShoppingListSummaryDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  function load() {
    api
      .listShoppingLists()
      .then(setLists)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar listas"));
  }

  useEffect(load, []);

  async function createList(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError(null);
    try {
      const list = await api.createShoppingList(name);
      setNewName("");
      load();
      setSelectedId(list.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar lista");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-brand-800"
        onClick={(e) => e.stopPropagation()}
      >
        {selectedId !== null ? (
          <ShoppingListDetail
            listId={selectedId}
            onBack={() => {
              setSelectedId(null);
              load();
            }}
            onDeleted={() => {
              setSelectedId(null);
              load();
            }}
          />
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 border-b border-brand-500/10 px-4 py-3 dark:border-white/10 sm:px-6 sm:py-4">
              <h2 className="text-lg font-bold text-brand-700 dark:text-brand-100 sm:text-xl">📝 Minhas listas</h2>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="rounded-lg bg-brand-500/10 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:text-brand-200"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6">
              {error && <p className="mb-3 text-sm font-medium text-red-500">{error}</p>}
              {!lists && !error && <p className="py-8 text-center text-brand-400">Carregando...</p>}
              {lists?.length === 0 && (
                <p className="py-8 text-center text-brand-400">Nenhuma lista ainda. Crie a primeira abaixo!</p>
              )}
              <ul className="flex flex-col gap-2">
                {lists?.map((list) => (
                  <li key={list.id}>
                    <button
                      onClick={() => setSelectedId(list.id)}
                      className="flex w-full items-center justify-between gap-2 rounded-xl bg-brand-500/10 px-4 py-3 text-left transition hover:bg-brand-500/20 dark:bg-white/10 dark:hover:bg-white/20"
                    >
                      <span className="min-w-0 truncate font-semibold text-brand-800 dark:text-cream">
                        {list.name}
                      </span>
                      <span className="shrink-0 text-xs text-brand-400 dark:text-brand-300">
                        {list.checkedCount}/{list.itemCount}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <form
              onSubmit={createList}
              className="flex gap-2 border-t border-brand-500/10 px-4 py-4 dark:border-white/10 sm:px-6"
            >
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome da nova lista (ex: Churrasco de sabado)"
                className="min-w-0 flex-1 rounded-full border-2 border-brand-500/20 bg-white px-4 py-2 outline-none focus:border-brand-500 dark:bg-brand-900 dark:text-cream"
              />
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="font-disp shrink-0 rounded-full bg-accent-500 px-5 py-2 font-bold text-white disabled:opacity-40"
              >
                + Nova lista
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
