import datetime as dt
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ItemBase(BaseModel):
    name: str
    quantity: float = 0
    unit: str = "un"
    category: str = "Outros"
    barcode: Optional[str] = None
    min_quantity: float = 1
    expiry_date: Optional[dt.date] = None
    last_purchase_date: Optional[dt.date] = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    """All fields optional: PATCH-style partial update."""
    name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    barcode: Optional[str] = None
    min_quantity: Optional[float] = None
    expiry_date: Optional[dt.date] = None
    last_purchase_date: Optional[dt.date] = None


class ItemOut(ItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: dt.datetime
    updated_at: dt.datetime
    status: str = "ok"  # computed: "ok" | "acabando" | "vencendo" | "vencido"


class StockChange(BaseModel):
    amount: float = Field(gt=0, description="Quantidade a somar/subtrair do estoque")


class HistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_id: int
    item_name: str
    change: float
    quantity_after: float
    reason: str
    timestamp: dt.datetime


class ShoppingListResult(BaseModel):
    sent: bool
    count: int
    message: str


class BarcodeLookupOut(BaseModel):
    found: bool
    barcode: str
    name: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
