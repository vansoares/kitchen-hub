"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ItemCard } from "@/components/ItemCard";
import { ItemForm } from "@/components/ItemForm";
import { HistoryPanel } from "@/components/HistoryPanel";
import { ShoppingListPanel } from "@/components/ShoppingListPanel";
import { api } from "@/lib/apiClient";
import type { ItemDTO, ItemGroup, ItemStatus } from "@/types/item";

type Notice = { type: "success" | "error"; text: string } | null;
type SortBy = "name" | "expiry" | "status";

const STATUS_PRIORITY: Record<ItemStatus, number> = { vencido: 0, vencendo: 1, acabando: 2, ok: 3 };

const GROUP_TABS: { value: ItemGroup; label: string }[] = [
  { value: "alimento", label: "🍽️ Alimentos" },
  { value: "limpeza_higiene", label: "🧴 Limpeza & Higiene" },
];

function sortItems(items: ItemDTO[], sortBy: SortBy): ItemDTO[] {
  const sorted = [...items];
  if (sortBy === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  } else if (sortBy === "status") {
    sorted.sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);
  } else if (sortBy === "expiry") {
    sorted.sort((a, b) => {
      if (!a.expiryDate && !b.expiryDate) return 0;
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return a.expiryDate.localeCompare(b.expiryDate);
    });
  }
  return sorted;
}

export function PantryApp() {
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [group, setGroup] = useState<ItemGroup>("alimento");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [onlyAlerts, setOnlyAlerts] = useState(false);
  const [editing, setEditing] = useState<Partial<ItemDTO> | null>(null); // null=fechado, {}=novo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [showHistory, setShowHistory] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);

  const sortedItems = useMemo(() => sortItems(items, sortBy), [items, sortBy]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemList, cats] = await Promise.all([
        onlyAlerts ? api.getAlerts(group) : api.listItems({ search, category, group }),
        api.getCategories(group),
      ]);
      setItems(itemList);
      setCategories(cats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [search, category, group, onlyAlerts]);

  function handleGroupChange(next: ItemGroup) {
    setGroup(next);
    setCategory(""); // categorias sao especificas de cada grupo
  }

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  async function handleConsume(item: ItemDTO) {
    await api.consumeItem(item.id, 1);
    load();
  }

  async function handlePurchase(item: ItemDTO) {
    await api.purchaseItem(item.id, 1);
    load();
  }

  async function handleSave(data: Record<string, unknown>) {
    try {
      if (editing?.id) {
        await api.updateItem(editing.id, data);
      } else {
        await api.createItem(data);
      }
      setEditing(null);
      load();
    } catch (err) {
      setNotice({ type: "error", text: err instanceof Error ? err.message : "Erro ao salvar item" });
    }
  }

  async function handleDelete(item: ItemDTO) {
    if (!window.confirm(`Excluir "${item.name}" da despensa?`)) return;
    await api.deleteItem(item.id);
    setEditing(null);
    load();
  }

  return (
    <div>
      <div className="mb-4 flex gap-2 rounded-full bg-brand-100 p-1.5 dark:bg-white/5">
        {GROUP_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleGroupChange(tab.value)}
            className={`font-disp flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition ${
              group === tab.value
                ? "bg-brand-500 text-white shadow-sm"
                : "text-brand-600 hover:bg-white/60 dark:text-brand-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Buscar item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[140px] flex-1 rounded-full bg-white px-5 py-2.5 font-medium outline-none placeholder:text-brand-300 dark:bg-brand-800 dark:text-cream"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="min-w-[140px] rounded-full bg-white px-5 py-2.5 font-medium text-brand-600 outline-none dark:bg-brand-800 dark:text-cream"
        >
          <option value="">Todas categorias</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="min-w-[140px] rounded-full bg-white px-5 py-2.5 font-medium text-brand-600 outline-none dark:bg-brand-800 dark:text-cream"
        >
          <option value="name">Ordenar: Nome</option>
          <option value="expiry">Ordenar: Validade</option>
          <option value="status">Ordenar: Status</option>
        </select>
        <button
          onClick={() => setOnlyAlerts((v) => !v)}
          className={`rounded-full px-4 py-2.5 font-bold transition ${
            onlyAlerts
              ? "bg-accent-500 text-white"
              : "bg-brand-100 text-brand-600 dark:bg-white/10 dark:text-brand-200"
          }`}
        >
          ⚠ Alertas
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className="rounded-full bg-brand-100 px-4 py-2.5 font-bold text-brand-600 transition dark:bg-white/10 dark:text-brand-200"
        >
          🕒 Historico
        </button>
        <button
          onClick={() => setShowShoppingList(true)}
          className="rounded-full bg-brand-100 px-4 py-2.5 font-bold text-brand-600 transition dark:bg-white/10 dark:text-brand-200"
        >
          🛒 Lista de compras
        </button>
        <button
          onClick={() => setEditing({})}
          className="font-disp rounded-full bg-accent-500 px-5 py-2.5 font-bold text-white shadow-sm transition hover:bg-accent-600"
        >
          + Novo item
        </button>
      </div>

      {error && <p className="py-16 text-center text-brand-400">Erro ao carregar despensa: {error}</p>}
      {!error && loading && <p className="py-16 text-center text-brand-400">Carregando...</p>}
      {!error && !loading && items.length === 0 && (
        <p className="py-16 text-center text-brand-400">
          {onlyAlerts ? "Nenhum item acabando ou vencendo. 🎉" : "Nenhum item encontrado."}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onConsume={handleConsume}
            onPurchase={handlePurchase}
            onEdit={setEditing}
          />
        ))}
      </div>

      {editing && (
        <ItemForm
          initial={editing}
          defaultGroup={group}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          onDelete={handleDelete}
        />
      )}

      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
      {showShoppingList && <ShoppingListPanel onClose={() => setShowShoppingList(false)} />}

      {notice && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl px-4 py-3 text-center font-medium shadow-lg ${
            notice.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {notice.text}
        </div>
      )}
    </div>
  );
}
