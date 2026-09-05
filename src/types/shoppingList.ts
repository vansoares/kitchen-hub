export interface ShoppingListItemDTO {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  itemId: number | null;
}

export interface ShoppingListSummaryDTO {
  id: number;
  name: string;
  createdBy: string;
  createdAt: string;
  itemCount: number;
  checkedCount: number;
}

export interface ShoppingListDTO extends ShoppingListSummaryDTO {
  items: ShoppingListItemDTO[];
}
