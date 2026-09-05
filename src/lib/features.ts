// Catalogo de features controladas pelo admin. Sem dependencia de Prisma
// de proposito - e importado tanto no servidor quanto em componentes
// client (painel de admin) so pra pegar labels.
export const FEATURES = [
  {
    key: "household_sharing",
    label: "🏠 Despensa compartilhada",
    description: "Deixa a pessoa convidar outra conta pra dividir a mesma despensa, receitas e compras.",
  },
  {
    key: "custom_shopping_lists",
    label: "📝 Listas de compras personalizadas",
    description: "Deixa a pessoa criar listas de compras do zero, alem da lista automatica de itens acabando.",
  },
] as const;

export type FeatureKey = (typeof FEATURES)[number]["key"];

export function isFeatureKey(value: string): value is FeatureKey {
  return FEATURES.some((f) => f.key === value);
}
