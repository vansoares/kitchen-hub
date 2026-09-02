export interface PurchaseDTO {
  id: number;
  total: number;
  note: string | null;
  createdAt: string;
}

export interface MonthlySpendingDTO {
  month: string; // "yyyy-mm"
  label: string; // "Set", "Out"...
  total: number;
}

export interface SpendingSummaryDTO {
  totalAllTime: number;
  totalThisMonth: number;
  countThisMonth: number;
  recent: PurchaseDTO[];
  monthly: MonthlySpendingDTO[];
}
