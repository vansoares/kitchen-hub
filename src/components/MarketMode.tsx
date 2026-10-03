"use client";

import { useEffect, useMemo, useState } from "react";
import type { ItemGroup } from "@/types/item";

export interface MarketRow {
  key: string;
  name: string;
  detail: string;
  checked: boolean;
  group: ItemGroup;
}

const TABS: { group: ItemGroup; label: string }[] = [
  { group: "alimento", label: "🍽️ Alimentos" },
  { group: "limpeza_higiene", label: "🧴 Higiene e limpeza" },
];

interface Props {
  title: string;
  rows: MarketRow[];
  // chave do localStorage onde os precos digitados ficam guardados - assim um
  // refresh sem querer no meio do mercado nao faz a pessoa perder tudo.
  pricesStorageKey: string;
  // se informado, mostra a opcao de dar entrada no estoque ao finalizar.
  restockLabel?: string;
  onToggle: (key: string, checked: boolean) => void;
  // adiciona um item esquecido na hora; o grupo e o da aba aberta.
  onAdd?: (name: string, group: ItemGroup) => Promise<void>;
  onFinish: (result: { total: number; checkedKeys: string[]; restock: boolean }) => Promise<void>;
  onClose: () => void;
}

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function loadPrices(storageKey: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePrices(storageKey: string, prices: Record<string, string>) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(prices));
  } catch {
    /* localStorage indisponivel - precos so nao sobrevivem a um refresh */
  }
}

// Tela cheia pensada pro uso em pe, com uma mao, no corredor do mercado:
// linhas grandes, tela sempre acesa, total parcial do carrinho.
export function MarketMode({ title, rows, pricesStorageKey, restockLabel, onToggle, onAdd, onFinish, onClose }: Props) {
  const [tab, setTab] = useState<ItemGroup>("alimento");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [totalOverride, setTotalOverride] = useState<string | null>(null);
  const [restock, setRestock] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setPrices(loadPrices(pricesStorageKey)), [pricesStorageKey]);

  // Mantem a tela acesa enquanto o modo mercado esta aberto (quando o navegador suporta).
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    async function acquire() {
      try {
        const next = await navigator.wakeLock?.request("screen");
        if (next && cancelled) next.release().catch(() => {});
        else lock = next ?? null;
      } catch {
        /* wake lock negado ou indisponivel - tudo funciona, so a tela pode apagar */
      }
    }
    acquire();
    // o navegador solta o lock quando a aba fica oculta; pega de novo ao voltar.
    const onVisible = () => document.visibilityState === "visible" && acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release().catch(() => {});
    };
  }, []);

  // so a aba aberta aparece na lista; o carrinho/total continuam somando as duas.
  const tabRows = useMemo(() => rows.filter((r) => r.group === tab), [rows, tab]);
  const ordered = useMemo(
    () => [...tabRows.filter((r) => !r.checked), ...tabRows.filter((r) => r.checked)],
    [tabRows]
  );
  const checkedRows = rows.filter((r) => r.checked);
  const pricedSum = checkedRows.reduce((sum, r) => sum + (Number(prices[r.key]) || 0), 0);
  const total = totalOverride !== null ? Number(totalOverride) || 0 : pricedSum;
  const progress = rows.length === 0 ? 0 : Math.round((checkedRows.length / rows.length) * 100);

  function setPrice(key: string, value: string) {
    setPrices((prev) => {
      const next = { ...prev, [key]: value };
      savePrices(pricesStorageKey, next);
      return next;
    });
    setTotalOverride(null); // editar um preco volta a somar automaticamente
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name || !onAdd) return;
    setAdding(true);
    setError(null);
    try {
      await onAdd(name, tab);
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar item");
    } finally {
      setAdding(false);
    }
  }

  async function handleFinish() {
    setFinishing(true);
    setError(null);
    try {
      await onFinish({ total, checkedKeys: checkedRows.map((r) => r.key), restock: Boolean(restockLabel) && restock });
      savePrices(pricesStorageKey, {});
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao finalizar a compra");
    } finally {
      setFinishing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-cream dark:bg-brand-900">
      <div className="border-b border-brand-500/10 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-disp truncate text-xl font-bold text-brand-700 dark:text-brand-100">
              🛍️ {title}
            </h2>
            <p className="text-sm font-semibold text-brand-400 dark:text-brand-300">
              {checkedRows.length} de {rows.length} no carrinho
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Sair do modo mercado"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-lg font-bold text-brand-700 dark:text-brand-200"
          >
            ✕
          </button>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-500/10 dark:bg-white/10">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 flex gap-2" role="tablist">
          {TABS.map((t) => {
            const inTab = rows.filter((r) => r.group === t.group);
            const left = inTab.filter((r) => !r.checked).length;
            return (
              <button
                key={t.group}
                role="tab"
                aria-selected={tab === t.group}
                onClick={() => setTab(t.group)}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-bold transition ${
                  tab === t.group
                    ? "bg-brand-500 text-white"
                    : "bg-brand-500/10 text-brand-700 dark:text-brand-200"
                }`}
              >
                {t.label} ({left})
              </button>
            );
          })}
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto px-4 py-3">
        {tabRows.length === 0 && <p className="py-12 text-center text-brand-400">Nada nesta aba. 🎉</p>}
        {ordered.map((row) => (
          <li key={row.key} className="mb-2">
            <div
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                row.checked ? "bg-emerald-500/10" : "bg-white shadow-sm dark:bg-brand-800"
              }`}
            >
              <button
                onClick={() => onToggle(row.key, !row.checked)}
                aria-label={row.checked ? `Tirar ${row.name} do carrinho` : `Colocar ${row.name} no carrinho`}
                aria-pressed={row.checked}
                className="flex min-w-0 flex-1 items-center gap-3 py-1 text-left"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-lg font-extrabold ${
                    row.checked
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-brand-300 text-transparent dark:border-brand-400"
                  }`}
                >
                  ✓
                </span>
                <span className={`min-w-0 flex-1 ${row.checked ? "opacity-50" : ""}`}>
                  <span className={`block truncate text-lg font-bold text-brand-800 dark:text-cream ${row.checked ? "line-through" : ""}`}>
                    {row.name}
                  </span>
                  <span className="block truncate text-sm text-brand-400 dark:text-brand-300">{row.detail}</span>
                </span>
              </button>
              {row.checked && (
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="R$"
                  value={prices[row.key] ?? ""}
                  onChange={(e) => setPrice(row.key, e.target.value)}
                  aria-label={`Preço de ${row.name}`}
                  className="w-24 shrink-0 rounded-xl border-2 border-brand-500/20 bg-white px-2 py-2 text-center font-semibold outline-none focus:border-brand-500 dark:bg-brand-900 dark:text-cream"
                />
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 border-t border-brand-500/10 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-white/10 dark:bg-brand-800">
        {onAdd && (
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`Lembrou de algo? Adicionar em ${tab === "alimento" ? "alimentos" : "higiene e limpeza"}`}
              aria-label="Novo item"
              className="min-w-0 flex-1 rounded-full border-2 border-brand-500/20 bg-white px-4 py-2 text-sm outline-none focus:border-brand-500 dark:bg-brand-900 dark:text-cream"
            />
            <button
              type="submit"
              disabled={adding || !newName.trim()}
              className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
            >
              {adding ? "..." : "+ Item"}
            </button>
          </form>
        )}
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-brand-400 dark:text-brand-300">Total do carrinho</span>
          <label className="flex items-center gap-1">
            <span className="font-disp text-xl font-bold text-brand-600 dark:text-brand-200">R$</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={totalOverride ?? (pricedSum > 0 ? pricedSum.toFixed(2) : "")}
              placeholder="0,00"
              onChange={(e) => setTotalOverride(e.target.value)}
              aria-label="Total da compra"
              className="font-disp w-28 rounded-xl border-2 border-brand-500/20 bg-white px-2 py-1 text-right text-xl font-bold outline-none focus:border-brand-500 dark:bg-brand-900 dark:text-cream"
            />
          </label>
        </div>
        {restockLabel && (
          <label className="flex items-center gap-2 text-sm font-medium text-brand-700 dark:text-brand-200">
            <input
              type="checkbox"
              checked={restock}
              onChange={(e) => setRestock(e.target.checked)}
              className="h-5 w-5 accent-brand-500"
            />
            {restockLabel}
          </label>
        )}
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
        <button
          onClick={handleFinish}
          disabled={finishing || checkedRows.length === 0}
          className="font-disp rounded-full bg-accent-500 py-3 text-lg font-bold text-white shadow-sm disabled:opacity-40"
        >
          {finishing ? "Salvando..." : `Finalizar compra${total > 0 ? ` · ${formatMoney(total)}` : ""}`}
        </button>
      </div>
    </div>
  );
}
