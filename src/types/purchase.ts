export interface PurchaseDTO {
  id: number;
  total: number;
  note: string | null;
  createdAt: string;
}

export interface SpendingSummaryDTO {
  totalAllTime: number;
  totalThisMonth: number;
  countThisMonth: number;
  recent: PurchaseDTO[];
}
