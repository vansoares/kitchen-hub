"use client";

import { useState, type FormEvent } from "react";
import type { RecipeDTO } from "@/types/recipe";

const UNIDADES = ["un", "kg", "g", "l", "ml", "pct", "xicara", "colher"];

interface IngredientRow {
  name: string;
  quantity: number | string;
  unit: string;
}

interface Props {
  initial: RecipeDTO | null;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  onDelete: (recipe: RecipeDTO) => void;
}

export function RecipeForm({ initial, onSave, onCancel, onDelete }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [servings, setServings] = useState<number | string>(initial?.servings ?? 4);
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    initial?.ingredients.map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit })) ?? [
      { name: "", quantity: 1, unit: "un" },
    ]
  );
  const isEditing = Boolean(initial?.id);

  function updateRow(index: number, patch: Partial<IngredientRow>) {
    setIngredients((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setIngredients((rows) => [...rows, { name: "", quantity: 1, unit: "un" }]);
  }

  function removeRow(index: number) {
    setIngredients((rows) => rows.filter((_, i) => i !== index));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave({
      title,
      servings: Number(servings) || 1,
      instructions: instructions || null,
      ingredients: ingredients
        .filter((r) => r.name.trim())
        .map((r) => ({ name: r.name.trim(), quantity: Number(r.quantity) || 0, unit: r.unit })),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl dark:bg-brand-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-disp mb-4 text-xl font-bold text-brand-700 dark:text-brand-100">
          {isEditing ? "Editar receita" : "Nova receita"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-brand-500 dark:text-brand-300">Titulo</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Feijoada"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-brand-500 dark:text-brand-300">Porcoes (rende)</span>
            <input
              type="number" min="1" step="1"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              className={inputClass}
            />
          </label>

          <div>
            <span className="text-sm font-semibold text-brand-500 dark:text-brand-300">Ingredientes</span>
            <div className="mt-2 flex flex-col gap-2">
              {ingredients.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={row.name}
                    onChange={(e) => updateRow(i, { name: e.target.value })}
                    placeholder="Nome"
                    className={`${inputClass} min-w-0 flex-1`}
                  />
                  <input
                    type="number" step="0.01" min="0"
                    value={row.quantity}
                    onChange={(e) => updateRow(i, { quantity: e.target.value })}
                    className={`${inputClass} w-20`}
                  />
                  <select
                    value={row.unit}
                    onChange={(e) => updateRow(i, { unit: e.target.value })}
                    className={`${inputClass} w-24`}
                  >
                    {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="shrink-0 rounded-full bg-red-100 px-3 text-red-600 dark:bg-red-500/20 dark:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRow}
              className="mt-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-bold text-brand-600 dark:bg-white/10 dark:text-brand-200"
            >
              + Ingrediente
            </button>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-brand-500 dark:text-brand-300">Modo de preparo</span>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={4}
              placeholder="Opcional"
              className={`${inputClass} resize-none`}
            />
          </label>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-full bg-brand-500/10 py-2.5 font-semibold text-brand-700 dark:text-brand-200"
            >
              Cancelar
            </button>
            {isEditing && initial && (
              <button
                type="button"
                onClick={() => onDelete(initial)}
                className="flex-1 rounded-full bg-red-500 py-2.5 font-semibold text-white"
              >
                Excluir
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
