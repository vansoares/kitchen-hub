"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import type { ShoppingListDTO } from "@/types/shoppingList";
import type { ItemDTO } from "@/types/item";

export function ShoppingListDetail({
  listId,
  onBack,
  onDeleted,
}: {
  listId: number;
  onBack: () => void;
  onDeleted: () => void;
}) {
  const [list, setList] = useState<ShoppingListDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pantryItems, setPantryItems] = useState<ItemDTO[]>([]);
  const [freeText, setFreeText] = useState("");
  const [pickedItemId, setPickedItemId] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    api
      .getShoppingList(listId)
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar lista"));
  }

  useEffect(load, [listId]);
  useEffect(() => {
    api.listItems({}).then(setPantryItems).catch(() => {});
  }, []);

  async function addFreeItem(e: React.FormEvent) {
    e.preventDefault();
    const name = freeText.trim();
    if (!name) return;
    setBusy(true);
    setError(null);
    try {
      setList(await api.addShoppingListItem(listId, { name }));
      setFreeText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao adicionar item");
    } finally {
      setBusy(false);
    }
  }

  async function addPantryItem(e: React.FormEvent) {
    e.preventDefault();
    if (!pickedItemId) return;
    setBusy(true);
    setError(null);
    try {
      setList(await api.addShoppingListItem(listId, { itemId: Number(pickedItemId) }));
      setPickedItemId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao adicionar item");
    } finally {
      setBusy(false);
    }
  }

  async function toggleItem(itemId: number, checked: boolean) {
    try {
      setList(await api.toggleShoppingListItem(listId, itemId, checked));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao atualizar item");
    }
  }

  async function removeItem(itemId: number) {
    try {
      setList(await api.removeShoppingListItem(listId, itemId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao remover item");
    }
  }

  async function deleteList() {
    if (!list || !window.confirm(`Apagar a lista "${list.name}"?`)) return;
    try {
      await api.deleteShoppingList(listId);
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao apagar lista");
    }
  }

  if (!list) {
    return (
      <div className="p-6">
        {error ? <p className="text-red-500">{error}</p> : <p className="text-brand-400">Carregando...</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-brand-500/10 px-4 py-3 dark:border-white/10 sm:px-6">
        <button
          onClick={onBack}
          aria-label="Voltar"
          className="rounded-lg bg-brand-500/10 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:text-brand-200"
        >
          ← Voltar
        </button>
        <h3 className="min-w-0 flex-1 truncate font-bold text-brand-800 dark:text-cream">{list.name}</h3>
        <button onClick={deleteList} className="shrink-0 text-xs font-bold text-red-500">
          apagar lista
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {error && <p className="mb-3 text-sm font-medium text-red-500">{error}</p>}
        {list.items.length === 0 && <p className="py-6 text-center text-brand-400">Lista vazia.</p>}
        <ul className="flex flex-col gap-2">
          {list.items.map((item) => (
            <li key={item.id}>
              <div
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                  item.checked ? "bg-brand-500/5 dark:bg-white/5" : "bg-brand-500/10 dark:bg-white/10"
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => toggleItem(item.id, e.target.checked)}
                  className="h-5 w-5 shrink-0 accent-brand-500"
                />
                <div className={`min-w-0 flex-1 ${item.checked ? "opacity-50 line-through" : ""}`}>
                  <div className="truncate font-semibold text-brand-800 dark:text-cream">{item.name}</div>
                  <div className="text-xs text-brand-400 dark:text-brand-300">
                    {item.quantity} {item.unit}
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remover ${item.name}`}
                  className="shrink-0 text-xs font-bold text-red-500"
                >
                  remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 border-t border-brand-500/10 px-4 py-3 dark:border-white/10 sm:px-6">
        <form onSubmit={addFreeItem} className="flex gap-2">
          <input
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Novo item (nome livre)"
            className="min-w-0 flex-1 rounded-full border-2 border-brand-500/20 bg-white px-4 py-2 text-sm outline-none focus:border-brand-500 dark:bg-brand-900 dark:text-cream"
          />
          <button
            type="submit"
            disabled={busy || !freeText.trim()}
            className="shrink-0 rounded-full bg-accent-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            Adicionar
          </button>
        </form>
        <form onSubmit={addPantryItem} className="flex gap-2">
          <select
            value={pickedItemId}
            onChange={(e) => setPickedItemId(e.target.value)}
            className="min-w-0 flex-1 rounded-full border-2 border-brand-500/20 bg-white px-4 py-2 text-sm outline-none dark:bg-brand-900 dark:text-cream"
          >
            <option value="">Ou escolha um item da despensa...</option>
            {pantryItems.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy || !pickedItemId}
            className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
}
