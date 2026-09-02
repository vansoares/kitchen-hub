"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/apiClient";
import { Badge } from "@/components/Badge";
import type { ItemDTO, ItemGroup } from "@/types/item";

// So local: e um checklist de uso durante a ida ao mercado, nao precisa
// sincronizar entre dispositivos nem sobreviver a limpeza de dados do navegador.
const CHECKED_KEY = "kitchenhub:shopping-checked";
const SETTINGS_KEY = "kitchenhub:shopping-settings";

const GROUP_LABELS: Record<ItemGroup, string> = {
  alimento: "🍽️ Alimentos",
  limpeza_higiene: "🧴 Limpeza & Higiene",
};
const GROUP_ORDER: ItemGroup[] = ["alimento", "limpeza_higiene"];

interface ShoppingListSettings {
  groups: ItemGroup[];
  // null = usa o estoque minimo configurado em cada item (mesma regra dos alertas).
  // numero = ignora o minimo de cada item, mostra so quem tem <= esse valor.
  maxQuantity: number | null;
}

const DEFAULT_SETTINGS: ShoppingListSettings = { groups: [...GROUP_ORDER], maxQuantity: null };

function loadChecked(): Set<number> {
  try {
    const raw = localStorage.getItem(CHECKED_KEY);
    return new Set<number>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveChecked(checked: Set<number>) {
  try {
    localStorage.setItem(CHECKED_KEY, JSON.stringify([...checked]));
  } catch {
    /* localStorage indisponivel (modo privado etc.) - checklist so nao persiste */
  }
}

function loadSettings(): ShoppingListSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      groups: Array.isArray(parsed.groups) && parsed.groups.length > 0 ? parsed.groups : DEFAULT_SETTINGS.groups,
      maxQuantity: typeof parsed.maxQuantity === "number" ? parsed.maxQuantity : null,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: ShoppingListSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* idem - configuracao so nao persiste */
  }
}

function matchesSettings(item: ItemDTO, settings: ShoppingListSettings): boolean {
  if (!settings.groups.includes(item.group)) return false;
  if (item.status === "acabou") return true;
  const threshold = settings.maxQuantity ?? item.minQuantity;
  return item.quantity <= threshold;
}

export function ShoppingListPanel({ onClose }: { onClose: () => void }) {
  const [allItems, setAllItems] = useState<ItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [settings, setSettings] = useState<ShoppingListSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [totalSpent, setTotalSpent] = useState("");
  const [savingPurchase, setSavingPurchase] = useState(false);
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  useEffect(() => {
    setChecked(loadChecked());
    setSettings(loadSettings());
    api
      .listItems({})
      .then(setAllItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar lista"))
      .finally(() => setLoading(false));
  }, []);

  const items = useMemo(() => allItems.filter((item) => matchesSettings(item, settings)), [allItems, settings]);

  function toggle(id: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveChecked(next);
      return next;
    });
  }

  function clearChecks() {
    setChecked(new Set());
    saveChecked(new Set());
  }

  function updateSettings(patch: Partial<ShoppingListSettings>) {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }

  function toggleGroup(group: ItemGroup) {
    const has = settings.groups.includes(group);
    const nextGroups = has ? settings.groups.filter((g) => g !== group) : [...settings.groups, group];
    if (nextGroups.length === 0) return; // sempre precisa de pelo menos um grupo selecionado
    updateSettings({ groups: nextGroups });
  }

  async function handleRegisterPurchase() {
    const total = Number(totalSpent);
    if (!(total > 0)) return;
    setSavingPurchase(true);
    setPurchaseNotice(null);
    try {
      await api.createPurchase(total);
      setPurchaseNotice("Compra registrada!");
      setTotalSpent("");
      clearChecks();
    } catch (err) {
      setPurchaseNotice(err instanceof Error ? err.message : "Erro ao registrar compra");
    } finally {
      setSavingPurchase(false);
    }
  }

  const pendingCount = items.filter((i) => !checked.has(i.id)).length;
  const byGroup = GROUP_ORDER.map((g) => ({ group: g, items: items.filter((i) => i.group === g) })).filter(
    (section) => section.items.length > 0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-brand-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-500/10 px-4 py-3 dark:border-white/10 sm:px-6 sm:py-4">
          <div>
            <h2 className="text-lg font-bold text-brand-700 dark:text-brand-100 sm:text-xl">
              🛒 Lista de compras
            </h2>
            {!loading && (
              <p className="text-sm text-brand-400 dark:text-brand-300">
                {pendingCount} de {items.length} restando
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {checked.size > 0 && (
              <button
                onClick={clearChecks}
                className="rounded-lg bg-brand-500/10 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:text-brand-200"
              >
                Limpar
              </button>
            )}
            <button
              onClick={() => setShowSettings((v) => !v)}
              aria-label="Configurar lista de compras"
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                showSettings
                  ? "bg-brand-500 text-white"
                  : "bg-brand-500/10 text-brand-700 dark:text-brand-200"
              }`}
            >
              ⚙️
            </button>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="rounded-lg bg-brand-500/10 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:text-brand-200"
            >
              ✕
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="flex flex-col gap-4 border-b border-brand-500/10 bg-brand-500/5 px-4 py-4 dark:border-white/10 dark:bg-white/5 sm:px-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-brand-700 dark:text-brand-200">Tipos de produto</p>
              <div className="flex flex-wrap gap-2">
                {GROUP_ORDER.map((g) => (
                  <label
                    key={g}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      settings.groups.includes(g)
                        ? "bg-brand-500 text-white"
                        : "bg-white text-brand-700 dark:bg-brand-900 dark:text-brand-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={settings.groups.includes(g)}
                      onChange={() => toggleGroup(g)}
                      className="h-4 w-4 accent-brand-500"
                    />
                    {GROUP_LABELS[g]}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-brand-700 dark:text-brand-200">
                Quando mostrar um item
              </p>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-brand-700 dark:text-brand-200">
                  <input
                    type="radio"
                    name="criterio"
                    checked={settings.maxQuantity === null}
                    onChange={() => updateSettings({ maxQuantity: null })}
                    className="h-4 w-4 accent-brand-500"
                  />
                  Estoque minimo definido em cada item
                </label>
                <label className="flex flex-wrap items-center gap-2 text-sm text-brand-700 dark:text-brand-200">
                  <input
                    type="radio"
                    name="criterio"
                    checked={settings.maxQuantity !== null}
                    onChange={() => updateSettings({ maxQuantity: settings.maxQuantity ?? 2 })}
                    className="h-4 w-4 accent-brand-500"
                  />
                  <span>Quantidade igual ou menor que</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={settings.maxQuantity === null}
                    value={settings.maxQuantity ?? 2}
                    onChange={(e) => updateSettings({ maxQuantity: Number(e.target.value) })}
                    className="w-16 rounded-lg border-2 border-brand-500/20 bg-white px-2 py-1 text-center disabled:opacity-40 dark:bg-brand-900"
                  />
                  <span>unidades (qualquer categoria)</span>
                </label>
              </div>
            </div>
            <p className="text-xs text-brand-400 dark:text-brand-300">
              Itens acabados sempre aparecem, independente do criterio acima.
            </p>
          </div>
        )}

        <div className="overflow-y-auto p-4 sm:p-6">
          {loading && <p className="py-8 text-center text-brand-400">Carregando...</p>}
          {error && <p className="py-8 text-center text-red-500">{error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="py-8 text-center text-brand-400">Nada pra comprar agora. 🎉</p>
          )}

          <div className="flex flex-col gap-5">
            {byGroup.map((section) => (
              <div key={section.group}>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-400 dark:text-brand-300">
                  {GROUP_LABELS[section.group]}
                </h3>
                <ul className="flex flex-col gap-2">
                  {section.items.map((item) => {
                    const isChecked = checked.has(item.id);
                    return (
                      <li key={item.id}>
                        <label
                          className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition ${
                            isChecked ? "bg-brand-500/5 dark:bg-white/5" : "bg-brand-500/10 dark:bg-white/10"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggle(item.id)}
                            className="h-5 w-5 shrink-0 accent-brand-500"
                          />
                          <div className={`min-w-0 flex-1 ${isChecked ? "opacity-50 line-through" : ""}`}>
                            <div className="truncate font-semibold text-brand-800 dark:text-cream">
                              {item.name}
                            </div>
                            <div className="text-xs text-brand-400 dark:text-brand-300">
                              {item.quantity} {item.unit} · minimo {item.minQuantity}
                            </div>
                          </div>
                          <Badge status={item.status} />
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-brand-500/10 px-4 py-4 dark:border-white/10 sm:px-6">
          <p className="mb-2 text-sm font-semibold text-brand-700 dark:text-brand-200">
            Quanto voce gastou nessa compra?
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Valor total (R$)"
              value={totalSpent}
              onChange={(e) => setTotalSpent(e.target.value)}
              className="min-w-[140px] flex-1 rounded-full border-2 border-brand-500/20 bg-white px-4 py-2 outline-none focus:border-brand-500 dark:bg-brand-900 dark:text-cream"
            />
            <button
              onClick={handleRegisterPurchase}
              disabled={savingPurchase || !(Number(totalSpent) > 0)}
              className="font-disp rounded-full bg-accent-500 px-5 py-2 font-bold text-white disabled:opacity-40"
            >
              {savingPurchase ? "Salvando..." : "Registrar compra"}
            </button>
          </div>
          {purchaseNotice && (
            <p className="mt-2 text-sm font-semibold text-brand-600 dark:text-brand-200">{purchaseNotice}</p>
          )}
        </div>
      </div>
    </div>
  );
}
