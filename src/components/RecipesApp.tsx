"use client";

import { useCallback, useEffect, useState } from "react";
import { RecipeForm } from "@/components/RecipeForm";
import { api } from "@/lib/apiClient";
import type { RecipeDTO } from "@/types/recipe";

export function RecipesApp() {
  const [recipes, setRecipes] = useState<RecipeDTO[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<RecipeDTO | null | "new">(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRecipes(await api.listRecipes(search || undefined));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(data: Record<string, unknown>) {
    if (editing && editing !== "new") {
      await api.updateRecipe(editing.id, data);
    } else {
      await api.createRecipe(data);
    }
    setEditing(null);
    load();
  }

  async function handleDelete(recipe: RecipeDTO) {
    if (!window.confirm(`Excluir a receita "${recipe.title}"?`)) return;
    await api.deleteRecipe(recipe.id);
    setEditing(null);
    load();
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Buscar receita..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[140px] flex-1 rounded-full bg-white px-5 py-2.5 font-medium outline-none placeholder:text-brand-300 dark:bg-brand-800 dark:text-cream"
        />
        <button
          onClick={() => setEditing("new")}
          className="font-disp rounded-full bg-accent-500 px-5 py-2.5 font-bold text-white shadow-sm"
        >
          + Nova receita
        </button>
      </div>

      {error && <p className="py-16 text-center text-brand-400">Erro ao carregar receitas: {error}</p>}
      {!error && loading && <p className="py-16 text-center text-brand-400">Carregando...</p>}
      {!error && !loading && recipes.length === 0 && (
        <p className="py-16 text-center text-brand-400">Nenhuma receita salva ainda.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <button
            key={recipe.id}
            onClick={() => setEditing(recipe)}
            className="flex flex-col gap-2 rounded-3xl bg-white p-5 text-left shadow-sm transition hover:shadow-md dark:bg-brand-800"
          >
            <h3 className="font-disp text-lg font-bold">{recipe.title}</h3>
            <span className="text-xs font-semibold text-brand-900/50 dark:text-cream/50">
              rende {recipe.servings} porcoes &middot; {recipe.ingredients.length} ingredientes
            </span>
            <ul className="mt-1 flex flex-col gap-0.5 text-sm text-brand-700 dark:text-brand-200">
              {recipe.ingredients.slice(0, 4).map((i) => (
                <li key={i.id}>
                  {i.quantity} {i.unit} {i.name}
                </li>
              ))}
              {recipe.ingredients.length > 4 && (
                <li className="text-brand-900/40 dark:text-cream/40">
                  +{recipe.ingredients.length - 4} outros
                </li>
              )}
            </ul>
          </button>
        ))}
      </div>

      {editing && (
        <RecipeForm
          initial={editing === "new" ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
