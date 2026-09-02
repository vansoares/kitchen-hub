import type { ItemDTO } from "@/types/item";
import type { MenuDetailDTO, MenuDTO, RecipeDTO } from "@/types/recipe";
import type { PurchaseDTO, SpendingSummaryDTO } from "@/types/purchase";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.error || body.detail || detail;
    } catch {
      /* sem corpo JSON - mantem o statusText */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  listItems: (params: { search?: string; category?: string; group?: string } = {}) => {
    const entries = Object.entries(params).filter(([, v]) => v) as [string, string][];
    const qs = new URLSearchParams(entries).toString();
    return request<ItemDTO[]>(`/items${qs ? `?${qs}` : ""}`);
  },
  getAlerts: (group?: string) => request<ItemDTO[]>(`/items/alerts${group ? `?group=${group}` : ""}`),
  getCategories: (group?: string) =>
    request<string[]>(`/items/categories${group ? `?group=${group}` : ""}`),
  createItem: (data: Record<string, unknown>) =>
    request<ItemDTO>("/items", { method: "POST", body: JSON.stringify(data) }),
  updateItem: (id: number, data: Record<string, unknown>) =>
    request<ItemDTO>(`/items/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteItem: (id: number) => request<void>(`/items/${id}`, { method: "DELETE" }),
  purchaseItem: (id: number, amount: number) =>
    request<ItemDTO>(`/items/${id}/purchase`, { method: "POST", body: JSON.stringify({ amount }) }),
  consumeItem: (id: number, amount: number) =>
    request<ItemDTO>(`/items/${id}/consume`, { method: "POST", body: JSON.stringify({ amount }) }),
  lookupBarcode: (code: string) =>
    request<{ found: boolean; name?: string | null; category?: string | null }>(`/barcode/${code}`),

  listRecipes: (search?: string) => request<RecipeDTO[]>(`/recipes${search ? `?search=${search}` : ""}`),
  getRecipe: (id: number) => request<RecipeDTO>(`/recipes/${id}`),
  createRecipe: (data: Record<string, unknown>) =>
    request<RecipeDTO>("/recipes", { method: "POST", body: JSON.stringify(data) }),
  updateRecipe: (id: number, data: Record<string, unknown>) =>
    request<RecipeDTO>(`/recipes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteRecipe: (id: number) => request<void>(`/recipes/${id}`, { method: "DELETE" }),

  listMenus: () => request<MenuDTO[]>("/menus"),
  getMenu: (id: number) => request<MenuDetailDTO>(`/menus/${id}`),
  createMenu: (data: Record<string, unknown>) =>
    request<MenuDetailDTO>("/menus", { method: "POST", body: JSON.stringify(data) }),
  updateMenu: (id: number, data: Record<string, unknown>) =>
    request<MenuDetailDTO>(`/menus/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteMenu: (id: number) => request<void>(`/menus/${id}`, { method: "DELETE" }),
  prepareMenu: (id: number, amount: number) =>
    request<{ id: number; quantity: number }>(`/menus/${id}/prepare`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),
  consumeMenu: (id: number, amount: number) =>
    request<{ id: number; quantity: number }>(`/menus/${id}/consume`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  getSpendingSummary: () => request<SpendingSummaryDTO>("/purchases"),
  createPurchase: (total: number, note?: string) =>
    request<PurchaseDTO>("/purchases", { method: "POST", body: JSON.stringify({ total, note }) }),
  deletePurchase: (id: number) => request<void>(`/purchases/${id}`, { method: "DELETE" }),
};
