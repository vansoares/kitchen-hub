import type { HistoryEntryDTO, ItemDTO } from "@/types/item";

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
  itemHistory: (id: number) => request<HistoryEntryDTO[]>(`/items/${id}/history`),
  globalHistory: (limit = 100) => request<HistoryEntryDTO[]>(`/history?limit=${limit}`),
  lookupBarcode: (code: string) =>
    request<{ found: boolean; name?: string | null; category?: string | null }>(`/barcode/${code}`),
};
