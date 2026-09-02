"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/apiClient";
import type { MenuDTO, RecipeDTO } from "@/types/recipe";

const UNIDADES = ["un", "kg", "g", "l", "ml", "pct", "xicara", "colher"];

interface Selection {
  recipeId: number;
  servings: number | string;
}

interface ItemRow {
  name: string;
  quantity: number | string;
  unit: string;
}

interface Props {
  initial: MenuDTO | null;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  onDelete: (menu: MenuDTO) => void;
}

export function MenuForm({ initial, onSave, onCancel, onDelete }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [quantity, setQuantity] = useState<number | string>(initial?.quantity ?? 0);
  const [recipes, setRecipes] = useState<RecipeDTO[]>([]);
  const [selections, setSelections] = useState<Selection[]>(
    initial?.recipes.map((r) => ({ recipeId: r.recipeId, servings: r.servings })) ?? []
  );
  const [itemRows, setItemRows] = useState<ItemRow[]>(
    initial?.items.map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit })) ?? []
  );
  const isEditing = Boolean(initial?.id);

  useEffect(() => {
    api.listRecipes().then(setRecipes).catch(() => {});
  }, []);

  function toggleRecipe(recipe: RecipeDTO) {
    setSelections((prev) => {
      const exists = prev.find((s) => s.recipeId === recipe.id);
      if (exists) return prev.filter((s) => s.recipeId !== recipe.id);
      return [...prev, { recipeId: recipe.id, servings: recipe.servings }];
    });
  }

  function setServings(recipeId: number, servings: string) {
    setSelections((prev) => prev.map((s) => (s.recipeId === recipeId ? { ...s, servings } : s)));
  }

  function addItemRow() {
    setItemRows((rows) => [...rows, { name: "", quantity: 1, unit: "un" }]);
  }

  function updateItemRow(index: number, patch: Partial<ItemRow>) {
    setItemRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeItemRow(index: number) {
    setItemRows((rows) => rows.filter((_, i) => i !== index));
  }

  const filledItems = itemRows.filter((r) => r.name.trim());
  const canSave = selections.length > 0 || filledItems.length > 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave({
      name,
      quantity: Number(quantity) || 0,
      recipes: selections.map((s) => ({ recipeId: s.recipeId, servings: Number(s.servings) || 1 })),
      items: filledItems.map((r) => ({
        name: r.name.trim(),
        quantity: Number(r.quantity) || 0,
        unit: r.unit,
      })),
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
          {isEditing ? "Editar cardapio" : "Novo cardapio"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-brand-500 dark:text-brand-300">Nome</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Marmitas de frango"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-brand-500 dark:text-brand-300">
                Porcoes prontas
              </span>
              <input
                type="number" min="0" step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <div>
            <span className="text-sm font-semibold text-brand-500 dark:text-brand-300">
              Receitas (opcional)
            </span>
            {recipes.length === 0 && (
              <p className="mt-2 text-sm text-brand-400">Nenhuma receita salva ainda.</p>
            )}
            <div className="mt-2 flex flex-col gap-2">
              {recipes.map((recipe) => {
                const selection = selections.find((s) => s.recipeId === recipe.id);
                return (
                  <div
                    key={recipe.id}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                      selection ? "bg-brand-100 dark:bg-white/10" : "bg-brand-500/5 dark:bg-white/5"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(selection)}
                      onChange={() => toggleRecipe(recipe)}
                      className="h-5 w-5 accent-brand-500"
                    />
                    <span className="flex-1 text-sm font-semibold">{recipe.title}</span>
                    {selection && (
                      <>
                        <input
                          type="number" min="1" step="1"
                          value={selection.servings}
                          onChange={(e) => setServings(recipe.id, e.target.value)}
                          className="w-16 rounded-lg border-2 border-brand-500/20 bg-white px-2 py-1 text-center dark:bg-brand-900"
                        />
                        <span className="text-xs text-brand-400">porcoes</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-sm font-semibold text-brand-500 dark:text-brand-300">
              Itens soltos (sem precisar de receita)
            </span>
            <div className="mt-2 flex flex-col gap-2">
              {itemRows.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={row.name}
                    onChange={(e) => updateItemRow(i, { name: e.target.value })}
                    placeholder="Ex: Frango grelhado"
                    className={`${inputClass} min-w-0 flex-1`}
                  />
                  <input
                    type="number" step="0.01" min="0"
                    value={row.quantity}
                    onChange={(e) => updateItemRow(i, { quantity: e.target.value })}
                    className={`${inputClass} w-20`}
                  />
                  <select
                    value={row.unit}
                    onChange={(e) => updateItemRow(i, { unit: e.target.value })}
                    className={`${inputClass} w-24`}
                  >
                    {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeItemRow(i)}
                    className="shrink-0 rounded-full bg-red-100 px-3 text-red-600 dark:bg-red-500/20 dark:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItemRow}
              className="mt-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-bold text-brand-600 dark:bg-white/10 dark:text-brand-200"
            >
              + Item
            </button>
          </div>

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
            <button
              type="submit"
              disabled={!canSave}
              className="font-disp flex-1 rounded-full bg-accent-500 py-2.5 font-bold text-white disabled:opacity-40"
            >
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
