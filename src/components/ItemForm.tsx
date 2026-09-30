"use client";

import { useState, type FormEvent } from "react";
import type { ItemDTO, ItemGroup } from "@/types/item";

const UNIDADES = ["un", "kg", "g", "l", "ml", "pct", "cx", "dz"];

const GROUPS: { value: ItemGroup; label: string }[] = [
  { value: "alimento", label: "🍽️ Alimento" },
  { value: "limpeza_higiene", label: "🧴 Limpeza/Higiene" },
];

const CATEGORIAS_POR_GRUPO: Record<ItemGroup, string[]> = {
  alimento: ["Graos e cereais", "Laticinios", "Hortifruti", "Carnes", "Bebidas", "Congelados", "Temperos", "Outros"],
  limpeza_higiene: ["Limpeza", "Higiene", "Outros"],
};

interface FormState {
  name: string;
  quantity: number | string;
  unit: string;
  group: ItemGroup;
  category: string;
  minQuantity: number | string;
  inUse: boolean;
  expiryDate: string;
}

function emptyForm(defaultGroup: ItemGroup): FormState {
  return {
    name: "",
    quantity: 1,
    unit: "un",
    group: defaultGroup,
    category: "Outros",
    minQuantity: 1,
    inUse: false,
    expiryDate: "",
  };
}

interface Props {
  initial: Partial<ItemDTO> | null;
  defaultGroup: ItemGroup;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  onDelete: (item: ItemDTO) => void;
}

export function ItemForm({ initial, defaultGroup, onSave, onCancel, onDelete }: Props) {
  const [form, setForm] = useState<FormState>(() => ({
    ...emptyForm(defaultGroup),
    ...(initial
      ? {
          name: initial.name ?? "",
          quantity: initial.quantity ?? 1,
          unit: initial.unit ?? "un",
          group: initial.group ?? defaultGroup,
          category: initial.category ?? "Outros",
          minQuantity: initial.minQuantity ?? 1,
          inUse: initial.inUse ?? false,
          expiryDate: initial.expiryDate ?? "",
        }
      : {}),
  }));
  const isEditing = Boolean(initial?.id);
  const categoriasSugeridas = CATEGORIAS_POR_GRUPO[form.group];

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleGroupChange(group: ItemGroup) {
    setForm((f) => ({
      ...f,
      group,
      category: CATEGORIAS_POR_GRUPO[group].includes(f.category) ? f.category : "Outros",
    }));
  }

  // marcar "em uso" num item sem estoque ja conta como 1 unidade.
  function handleInUseChange(inUse: boolean) {
    setForm((f) => ({
      ...f,
      inUse,
      quantity: inUse && !(Number(f.quantity) > 0) ? 1 : f.quantity,
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave({
      ...form,
      quantity: Number(form.quantity),
      minQuantity: Number(form.minQuantity),
      expiryDate: form.expiryDate || null,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl dark:bg-brand-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-disp text-xl font-bold text-brand-700 dark:text-brand-100">
            {isEditing ? "Editar item" : "Novo item"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-700 dark:text-brand-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Tipo">
              <div className="grid grid-cols-2 gap-2">
                {GROUPS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => handleGroupChange(g.value)}
                    className={`rounded-full px-3 py-2 text-sm font-bold transition ${
                      form.group === g.value
                        ? "bg-brand-500 text-white"
                        : "bg-brand-500/10 text-brand-700 dark:text-brand-200"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Nome">
              <input
                required
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Ex: Arroz branco"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantidade">
                <input
                  type="number" step="0.01" min="0" required
                  value={form.quantity}
                  onChange={(e) => setField("quantity", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Unidade">
                <select value={form.unit} onChange={(e) => setField("unit", e.target.value)} className={inputClass}>
                  {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Estoque minimo">
                <input
                  type="number" step="0.01" min="0"
                  value={form.minQuantity}
                  onChange={(e) => setField("minQuantity", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Categoria">
                <input
                  list="categorias"
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                  className={inputClass}
                />
                <datalist id="categorias">
                  {categoriasSugeridas.map((c) => <option key={c} value={c} />)}
                </datalist>
              </Field>
            </div>

            <Field label="Validade (opcional)">
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setField("expiryDate", e.target.value)}
                className={inputClass}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm font-semibold text-brand-500 dark:text-brand-300">
              <input
                type="checkbox"
                checked={form.inUse}
                onChange={(e) => handleInUseChange(e.target.checked)}
                className="h-4 w-4 accent-sky-500"
              />
              Tem uma unidade em uso
            </label>

            <div className="mt-2 flex items-center gap-2">
              {isEditing && initial && (
                <button
                  type="button"
                  onClick={() => onDelete(initial as ItemDTO)}
                  aria-label="Excluir item"
                  title="Excluir item"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-lg text-red-500 transition hover:bg-red-200 dark:bg-red-500/20 dark:text-red-300"
                >
                  🗑
                </button>
              )}
              <button type="submit" className="font-disp flex-1 rounded-full bg-accent-500 py-2.5 font-bold text-white">
                Salvar
              </button>
            </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full min-w-0 rounded-xl border-2 border-brand-500/20 bg-white px-3 py-2 text-brand-900 outline-none focus:border-brand-500 dark:bg-brand-900 dark:text-cream";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-brand-500 dark:text-brand-300">{label}</span>
      {children}
    </label>
  );
}
