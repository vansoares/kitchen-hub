import type { ItemDTO } from "@/types/item";
import type { RecipeDTO } from "@/types/recipe";
import type { PurchaseDTO, SpendingSummaryDTO } from "@/types/purchase";
import type { HouseholdDTO } from "@/types/household";
import type { MeDTO, AdminUserDTO } from "@/types/feature";
import type { ShoppingListDTO, ShoppingListSummaryDTO } from "@/types/shoppingList";

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

  listRecipes: (search?: string) => request<RecipeDTO[]>(`/recipes${search ? `?search=${search}` : ""}`),
  getRecipe: (id: number) => request<RecipeDTO>(`/recipes/${id}`),
  createRecipe: (data: Record<string, unknown>) =>
    request<RecipeDTO>("/recipes", { method: "POST", body: JSON.stringify(data) }),
  updateRecipe: (id: number, data: Record<string, unknown>) =>
    request<RecipeDTO>(`/recipes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteRecipe: (id: number) => request<void>(`/recipes/${id}`, { method: "DELETE" }),

  getSpendingSummary: () => request<SpendingSummaryDTO>("/purchases"),
  createPurchase: (total: number, note?: string) =>
    request<PurchaseDTO>("/purchases", { method: "POST", body: JSON.stringify({ total, note }) }),
  deletePurchase: (id: number) => request<void>(`/purchases/${id}`, { method: "DELETE" }),

  getHousehold: () => request<HouseholdDTO>("/household"),
  renameHousehold: (name: string) =>
    request<HouseholdDTO>("/household", { method: "PUT", body: JSON.stringify({ name }) }),
  addHouseholdMember: (email: string) =>
    request<HouseholdDTO>("/household/members", { method: "POST", body: JSON.stringify({ email }) }),
  removeHouseholdMember: (email: string) =>
    request<HouseholdDTO>(`/household/members/${encodeURIComponent(email)}`, { method: "DELETE" }),

  getMe: () => request<MeDTO>("/me"),
  getAdminUsers: () => request<AdminUserDTO[]>("/admin/users"),
  setUserFeature: (email: string, feature: string, enabled: boolean) =>
    request<{ email: string; features: string[] }>(
      `/admin/users/${encodeURIComponent(email)}/features`,
      { method: "PUT", body: JSON.stringify({ feature, enabled }) }
    ),

  listShoppingLists: () => request<ShoppingListSummaryDTO[]>("/shopping-lists"),
  getShoppingList: (id: number) => request<ShoppingListDTO>(`/shopping-lists/${id}`),
  createShoppingList: (name: string) =>
    request<ShoppingListDTO>("/shopping-lists", { method: "POST", body: JSON.stringify({ name }) }),
  renameShoppingList: (id: number, name: string) =>
    request<ShoppingListSummaryDTO>(`/shopping-lists/${id}`, { method: "PUT", body: JSON.stringify({ name }) }),
  deleteShoppingList: (id: number) => request<void>(`/shopping-lists/${id}`, { method: "DELETE" }),
  addShoppingListItem: (listId: number, data: { name?: string; quantity?: number; unit?: string; itemId?: number }) =>
    request<ShoppingListDTO>(`/shopping-lists/${listId}/items`, { method: "POST", body: JSON.stringify(data) }),
  toggleShoppingListItem: (listId: number, itemId: number, checked: boolean) =>
    request<ShoppingListDTO>(`/shopping-lists/${listId}/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ checked }),
    }),
  removeShoppingListItem: (listId: number, itemId: number) =>
    request<ShoppingListDTO>(`/shopping-lists/${listId}/items/${itemId}`, { method: "DELETE" }),
};
