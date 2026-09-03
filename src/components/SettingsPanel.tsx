"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type AppSettings, type SortBy } from "@/lib/settings";
import type { ItemGroup } from "@/types/item";
import { HouseholdSection } from "@/components/HouseholdSection";

const GROUP_OPTIONS: { value: ItemGroup; label: string }[] = [
  { value: "alimento", label: "🍽️ Alimentos" },
  { value: "limpeza_higiene", label: "🧴 Limpeza & Higiene" },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "name", label: "Nome" },
  { value: "status", label: "Status" },
];

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function update(patch: Partial<AppSettings>) {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl dark:bg-brand-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-disp text-xl font-bold text-brand-700 dark:text-brand-100">⚙️ Configurações</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-700 dark:text-brand-200"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <section>
            <h3 className="mb-2 text-sm font-bold text-brand-700 dark:text-brand-200">Aba padrão ao abrir</h3>
            <div className="grid grid-cols-2 gap-2">
              {GROUP_OPTIONS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => update({ defaultGroup: g.value })}
                  className={`rounded-full px-3 py-2 text-sm font-bold transition ${
                    settings.defaultGroup === g.value
                      ? "bg-brand-500 text-white"
                      : "bg-brand-500/10 text-brand-700 dark:text-brand-200"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-bold text-brand-700 dark:text-brand-200">Ordenação padrão</h3>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => update({ defaultSort: s.value })}
                  className={`rounded-full px-3 py-2 text-sm font-bold transition ${
                    settings.defaultSort === s.value
                      ? "bg-brand-500 text-white"
                      : "bg-brand-500/10 text-brand-700 dark:text-brand-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-brand-700 dark:text-brand-200">O que mostrar</h3>

            <ToggleRow
              label="Resumo no topo (itens, atenção, gasto/mês)"
              checked={settings.showStats}
              onChange={(v) => update({ showStats: v })}
            />
            <ToggleRow
              label="Cards compactos (melhor pra celular)"
              checked={settings.compactCards}
              onChange={(v) => update({ compactCards: v })}
            />
            <ToggleRow
              label="Abrir já filtrando só alertas"
              checked={settings.defaultOnlyAlerts}
              onChange={(v) => update({ defaultOnlyAlerts: v })}
            />
          </section>

          <HouseholdSection />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-brand-500/5 px-3 py-2.5 dark:bg-white/5">
      <span className="text-sm font-medium text-brand-700 dark:text-brand-200">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 shrink-0 accent-brand-500"
      />
    </label>
  );
}
