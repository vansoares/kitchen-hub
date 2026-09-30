export type ItemStatus = "ok" | "acabando" | "acabou" | "em_uso";
export type ItemGroup = "alimento" | "limpeza_higiene";

export interface ItemDTO {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  group: ItemGroup;
  category: string;
  minQuantity: number;
  inUse: boolean;
  lastPurchaseDate: string | null;
  createdAt: string;
  updatedAt: string;
  status: ItemStatus;
}
