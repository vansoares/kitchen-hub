"use client";

import { useState, type FormEvent } from "react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { api } from "@/lib/apiClient";
import type { ItemDTO } from "@/types/item";

const UNIDADES = ["un", "kg", "g", "l", "ml", "pct", "cx", "dz"];
const CATEGORIAS_SUGERIDAS = [
  "Graos e cereais", "Laticinios", "Hortifruti", "Carnes", "Limpeza",
  "Higiene", "Bebidas", "Congelados", "Temperos", "Outros",
];

interface FormState {
  name: string;
  quantity: number | string;
  unit: string;
  category: string;
  minQuantity: number | string;
  expiryDate: string;
  barcode: string;
}

const EMPTY: FormState = {
  name: "",
  quantity: 1,
  unit: "un",
  category: "Outros",
  minQuantity: 1,
  expiryDate: "",
  barcode: "",
};

interface Props {
  initial: Partial<ItemDTO> | null;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  onDelete: (item: ItemDTO) => void;
}

export function ItemForm({ initial, onSave, onCancel, onDelete }: Props) {
  const [form, setForm] = useState<FormState>(() => ({
    ...EMPTY,
    ...(initial
      ? {
          name: initial.name ?? EMPTY.name,
          quantity: initial.quantity ?? EMPTY.quantity,
          unit: initial.unit ?? EMPTY.unit,
          category: initial.category ?? EMPTY.category,
          minQuantity: initial.minQuantity ?? EMPTY.minQuantity,
          expiryDate: initial.expiryDate ?? "",
          barcode: initial.barcode ?? "",
        }
      : {}),
  }));
  const [scanning, setScanning] = useState(false);
  const [looking, setLooking] = useState(false);
  const isEditing = Boolean(initial?.id);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleBarcodeDetected(code: string) {
    setScanning(false);
    setField("barcode", code);
    setLooking(true);
    try {
      const result = await api.lookupBarcode(code);
      if (result.found) {
        setForm((f) => ({
          ...f,
          name: f.name || result.name || f.name,
          category: result.category || f.category,
        }));
      }
    } catch {
      /* busca e best-effort; usuario pode preencher manualmente */
    } finally {
      setLooking(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave({
      ...form,
      quantity: Number(form.quantity),
      minQuantity: Number(form.minQuantity),
      expiryDate: form.expiryDate || null,
      barcode: form.barcode || null,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-brand-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-bold text-brand-700 dark:text-brand-100">
          {isEditing ? "Editar item" : "Novo item"}
        </h2>

        {scanning ? (
          <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setScanning(false)} />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Nome">
              <input
                required
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Ex: Arroz branco"
                className={inputClass}
              />
            </Field>

            <Field label="Codigo de barras">
              <div className="flex gap-2">
                <input
                  value={form.barcode}
                  onChange={(e) => setField("barcode", e.target.value)}
                  placeholder="Opcional"
                  className={`${inputClass} min-w-0 flex-1`}
                />
                <button
                  type="button"
                  onClick={() => setScanning(true)}
                  className="shrink-0 rounded-xl bg-brand-500/10 px-3 text-lg"
                >
                  📷
                </button>
              </div>
              {looking && <small className="text-brand-400">Buscando produto...</small>}
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
                  {CATEGORIAS_SUGERIDAS.map((c) => <option key={c} value={c} />)}
                </datalist>
              </Field>
            </div>

            <Field label="Data de validade">
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setField("expiryDate", e.target.value)}
                className={inputClass}
              />
            </Field>

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-xl bg-brand-500/10 py-2.5 font-semibold text-brand-700 dark:text-brand-200"
              >
                Cancelar
              </button>
              {isEditing && initial && (
                <button
                  type="button"
                  onClick={() => onDelete(initial as ItemDTO)}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 font-semibold text-white"
                >
                  Excluir
                </button>
              )}
              <button type="submit" className="flex-1 rounded-xl bg-brand-500 py-2.5 font-semibold text-white">
                Salvar
              </button>
            </div>
          </form>
        )}
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
