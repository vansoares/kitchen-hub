// Thin fetch wrapper for the KitchenHub API.
//
// Relative "/api/..." paths work in every scenario we care about:
// - Vite dev server proxies /api to localhost:8000 (see vite.config.js)
// - Built app is served BY the FastAPI backend itself (same origin)
// - Accessed over Tailscale from the phone: still same origin as the page
const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* response had no JSON body */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listItems: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/items${qs ? `?${qs}` : ""}`);
  },
  getAlerts: () => request("/items/alerts"),
  getCategories: () => request("/items/categories"),
  getItem: (id) => request(`/items/${id}`),
  createItem: (data) => request("/items", { method: "POST", body: JSON.stringify(data) }),
  updateItem: (id, data) => request(`/items/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteItem: (id) => request(`/items/${id}`, { method: "DELETE" }),
  purchaseItem: (id, amount) =>
    request(`/items/${id}/purchase`, { method: "POST", body: JSON.stringify({ amount }) }),
  consumeItem: (id, amount) =>
    request(`/items/${id}/consume`, { method: "POST", body: JSON.stringify({ amount }) }),
  itemHistory: (id) => request(`/items/${id}/history`),
  globalHistory: (limit = 100) => request(`/history?limit=${limit}`),
  lookupBarcode: (code) => request(`/barcode/lookup/${code}`),
};
