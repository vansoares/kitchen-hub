export type ItemStatus = "ok" | "acabando" | "vencendo" | "vencido";

export interface ItemDTO {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  barcode: string | null;
  minQuantity: number;
  expiryDate: string | null; // ISO date (yyyy-mm-dd)
  lastPurchaseDate: string | null;
  createdAt: string;
  updatedAt: string;
  status: ItemStatus;
}

export interface HistoryEntryDTO {
  id: number;
  itemId: number | null;
  itemName: string;
  change: number;
  quantityAfter: number;
  reason: string;
  timestamp: string;
}
