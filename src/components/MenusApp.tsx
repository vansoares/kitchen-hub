"use client";

import { useCallback, useEffect, useState } from "react";
import { MenuForm } from "@/components/MenuForm";
import { MenuDetailPanel } from "@/components/MenuDetailPanel";
import { api } from "@/lib/apiClient";
import type { MenuDTO } from "@/types/recipe";

export function MenusApp() {
  const [menus, setMenus] = useState<MenuDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<MenuDTO | null | "new">(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMenus(await api.listMenus());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(data: Record<string, unknown>) {
    if (editing && editing !== "new") {
      await api.updateMenu(editing.id, data);
    } else {
      await api.createMenu(data);
    }
    setEditing(null);
    load();
  }

  async function handleDelete(menu: MenuDTO) {
    if (!window.confirm(`Excluir o cardapio "${menu.name}"?`)) return;
    await api.deleteMenu(menu.id);
    setEditing(null);
    setViewingId(null);
    load();
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button
          onClick={() => setEditing("new")}
          className="font-disp rounded-full bg-accent-500 px-5 py-2.5 font-bold text-white shadow-sm"
        >
          + Novo cardapio
        </button>
      </div>

      {error && <p className="py-16 text-center text-brand-400">Erro ao carregar cardapios: {error}</p>}
      {!error && loading && <p className="py-16 text-center text-brand-400">Carregando...</p>}
      {!error && !loading && menus.length === 0 && (
        <p className="py-16 text-center text-brand-400">Nenhum cardapio salvo ainda.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setViewingId(menu.id)}
            className="flex flex-col gap-2 rounded-3xl bg-white p-5 text-left shadow-sm transition hover:shadow-md dark:bg-brand-800"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-disp text-lg font-bold">{menu.name}</h3>
              <span className="font-disp shrink-0 rounded-full bg-accent-500/15 px-3 py-1 text-sm font-bold text-accent-600 dark:text-accent-400">
                {menu.quantity} pronta{menu.quantity === 1 ? "" : "s"}
              </span>
            </div>
            <span className="text-xs font-semibold text-brand-900/50 dark:text-cream/50">
              {menu.recipes.length} {menu.recipes.length === 1 ? "receita" : "receitas"}
              {menu.items.length > 0 && <> &middot; {menu.items.length} itens soltos</>}
            </span>
            <ul className="mt-1 flex flex-col gap-0.5 text-sm text-brand-700 dark:text-brand-200">
              {menu.recipes.slice(0, 3).map((r) => (
                <li key={r.id}>
                  {r.recipeTitle} &times; {r.servings}
                </li>
              ))}
              {menu.items.slice(0, 3).map((i) => (
                <li key={i.id}>
                  {i.quantity} {i.unit} {i.name}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {editing && (
        <MenuForm
          initial={editing === "new" ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          onDelete={handleDelete}
        />
      )}

      {viewingId !== null && (
        <MenuDetailPanel
          menuId={viewingId}
          onClose={() => setViewingId(null)}
          onStockChange={load}
          onEdit={() => {
            const menu = menus.find((m) => m.id === viewingId) ?? null;
            setViewingId(null);
            setEditing(menu);
          }}
        />
      )}
    </div>
  );
}
