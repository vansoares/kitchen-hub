import type { ItemGroup } from "@/types/item";

// Preferencias de exibicao do app - so local (por dispositivo), no mesmo
// espirito das configuracoes da lista de compras (kitchenhub:shopping-settings).
const SETTINGS_KEY = "kitchenhub:settings";
export const SETTINGS_EVENT = "kitchenhub:settings-changed";

export type SortBy = "name" | "status";

export interface AppSettings {
  defaultGroup: ItemGroup;
  defaultSort: SortBy;
  defaultOnlyAlerts: boolean;
  showStats: boolean;
  compactCards: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultGroup: "alimento",
  defaultSort: "name",
  defaultOnlyAlerts: false,
  showStats: true,
  compactCards: true,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event(SETTINGS_EVENT));
  } catch {
    /* localStorage indisponivel (modo privado etc.) - configuracao so nao persiste */
  }
}
