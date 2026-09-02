"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ItemCard } from "@/components/ItemCard";
import { ItemForm } from "@/components/ItemForm";
import { ShoppingListPanel } from "@/components/ShoppingListPanel";
import { BalancePanel } from "@/components/BalancePanel";
import { ActionMenu } from "@/components/ActionMenu";
import { api } from "@/lib/apiClient";
import { DEFAULT_SETTINGS, loadSettings, SETTINGS_EVENT, type AppSettings, type SortBy } from "@/lib/settings";
import type { ItemDTO, ItemGroup, ItemStatus } from "@/types/item";

type Notice = { type: "success" | "error"; text: string } | null;

const STATUS_PRIORITY: Record<ItemStatus, number> = { acabou: 0, acabando: 1, ok: 2 };

const GROUP_TABS: { value: ItemGroup; label: string }[] = [
  { value: "alimento", label: "🍽️ Alimentos" },
  { value: "limpeza_higiene", label: "🧴 Limpeza & Higiene" },
];

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function sortItems(items: ItemDTO[], sortBy: SortBy): ItemDTO[] {
  const sorted = [...items];
  if (sortBy === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  } else if (sortBy === "status") {
    sorted.sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);
  }
  return sorted;
}

interface Stats {
  totalItems: number;
  alerts: number;
  spentThisMonth: number;
}

export function PantryApp({ userName }: { userName?: string | null }) {
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
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
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Aplica a aba/ordenacao/filtro padrao salvos so uma vez, logo apos a
  // hidratacao (pra nao divergir da renderizacao inicial no servidor) - depois
  // disso quem manda e a navegacao do usuario na tela, nao mais as preferencias.
  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setGroup(s.defaultGroup);
    setSortBy(s.defaultSort);
    setOnlyAlerts(s.defaultOnlyAlerts);
  }, []);

  // Preferencias de exibicao (resumo/densidade dos cards) continuam
  // atualizando ao vivo se a pessoa mexer nas configuracoes durante o uso.
  useEffect(() => {
    function refreshSettings() {
      setSettings(loadSettings());
    }
    window.addEventListener(SETTINGS_EVENT, refreshSettings);
    return () => window.removeEventListener(SETTINGS_EVENT, refreshSettings);
  }, []);

  // Atalhos do PWA (manifest "shortcuts") abrem "/?open=lista" ou "/?open=novo" -
  // le a query string direto do browser pra nao precisar de Suspense boundary
  // que useSearchParams exigiria aqui.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const open = params.get("open");
    if (open === "lista") setShowShoppingList(true);
    if (open === "novo") setEditing({});
  }, []);

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

  // Resumo do topo: numeros gerais da despensa, independente dos filtros/aba
  // ativos - por isso busca separado do `load()` principal.
  const loadStats = useCallback(async () => {
    try {
      const [allItems, alerts, spending] = await Promise.all([
        api.listItems({}),
        api.getAlerts(),
        api.getSpendingSummary(),
      ]);
      setStats({ totalItems: allItems.length, alerts: alerts.length, spentThisMonth: spending.totalThisMonth });
    } catch {
      /* resumo e cosmetico - falha aqui nao deve travar a tela principal */
    }
  }, []);

  function handleGroupChange(next: ItemGroup) {
    setGroup(next);
    setCategory(""); // categorias sao especificas de cada grupo
  }

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  async function handleConsume(item: ItemDTO) {
    await api.consumeItem(item.id, 1);
    load();
    loadStats();
  }

  async function handlePurchase(item: ItemDTO) {
    await api.purchaseItem(item.id, 1);
    load();
    loadStats();
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
      loadStats();
    } catch (err) {
      setNotice({ type: "error", text: err instanceof Error ? err.message : "Erro ao salvar item" });
    }
  }

  async function handleDelete(item: ItemDTO) {
    if (!window.confirm(`Excluir "${item.name}" da despensa?`)) return;
    await api.deleteItem(item.id);
    setEditing(null);
    load();
    loadStats();
  }

  const firstName = userName?.split(" ")[0];
  const today = capitalize(
    new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
  );

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-disp text-2xl font-bold">
          {firstName ? `Oi, ${firstName}! 👋` : "Sua despensa"}
        </h2>
        <p className="text-sm text-brand-900/50 dark:text-cream/50">{today}</p>
      </div>

      {stats && settings.showStats && (
        <div className="mb-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white p-4 dark:bg-brand-800">
            <div className="text-xs font-semibold text-brand-900/50 dark:text-cream/50">Itens</div>
            <div className="font-disp text-2xl font-bold text-brand-600 dark:text-brand-200">
              {stats.totalItems}
            </div>
          </div>
          <button
            onClick={() => setOnlyAlerts(true)}
            className="rounded-2xl bg-accent-500/10 p-4 text-left transition hover:bg-accent-500/20"
          >
            <div className="text-xs font-semibold text-brand-900/50 dark:text-cream/50">Atencao</div>
            <div className="font-disp text-2xl font-bold text-accent-600 dark:text-accent-400">
              {stats.alerts}
            </div>
          </button>
          <button
            onClick={() => setShowBalance(true)}
            className="rounded-2xl bg-brand-100 p-4 text-left transition hover:bg-brand-200 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <div className="text-xs font-semibold text-brand-900/50 dark:text-cream/50">Gasto/mes</div>
            <div className="font-disp text-xl font-bold text-brand-600 dark:text-brand-200">
              {formatMoney(stats.spentThisMonth)}
            </div>
          </button>
        </div>
      )}

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

      <div className="mb-5 flex flex-col gap-2">
        <input
          type="search"
          placeholder="Buscar item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full bg-white px-5 py-2.5 font-medium outline-none placeholder:text-brand-300 dark:bg-brand-800 dark:text-cream"
        />

        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="min-w-0 flex-1 rounded-full bg-white px-4 py-2.5 font-medium text-brand-600 outline-none dark:bg-brand-800 dark:text-cream"
          >
            <option value="">Todas categorias</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="min-w-0 flex-1 rounded-full bg-white px-4 py-2.5 font-medium text-brand-600 outline-none dark:bg-brand-800 dark:text-cream"
          >
            <option value="name">Ordenar: Nome</option>
            <option value="status">Ordenar: Status</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
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
          <div className="flex-1" />
          <ActionMenu
            items={[
              { label: "🛒 Lista de compras", onClick: () => setShowShoppingList(true) },
              { label: "💰 Balanco", onClick: () => setShowBalance(true) },
            ]}
          />
          <button
            onClick={() => setEditing({})}
            className="font-disp rounded-full bg-accent-500 px-5 py-2.5 font-bold text-white shadow-sm transition hover:bg-accent-600"
          >
            + Novo item
          </button>
        </div>
      </div>

      {error && <p className="py-16 text-center text-brand-400">Erro ao carregar despensa: {error}</p>}
      {!error && loading && <p className="py-16 text-center text-brand-400">Carregando...</p>}
      {!error && !loading && items.length === 0 && (
        <p className="py-16 text-center text-brand-400">
          {onlyAlerts ? "Nenhum item acabando ou acabado. 🎉" : "Nenhum item encontrado."}
        </p>
      )}

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${settings.compactCards ? "gap-3" : "gap-4"}`}>
        {sortedItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onConsume={handleConsume}
            onPurchase={handlePurchase}
            onEdit={setEditing}
            compact={settings.compactCards}
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

      {showShoppingList && (
        <ShoppingListPanel
          onClose={() => {
            setShowShoppingList(false);
            loadStats();
          }}
        />
      )}
      {showBalance && (
        <BalancePanel
          onClose={() => {
            setShowBalance(false);
            loadStats();
          }}
        />
      )}

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
