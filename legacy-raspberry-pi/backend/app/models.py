import datetime as dt

from sqlalchemy import (
    Column, Integer, String, Float, Date, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship

from .database import Base


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    quantity = Column(Float, nullable=False, default=0)
    unit = Column(String, nullable=False, default="un")  # un, kg, g, l, ml, pct...
    category = Column(String, nullable=False, default="Outros", index=True)
    barcode = Column(String, nullable=True, index=True)

    # threshold below which the item shows up as "acabando"
    min_quantity = Column(Float, nullable=False, default=1)

    expiry_date = Column(Date, nullable=True)
    last_purchase_date = Column(Date, nullable=True)

    created_at = Column(DateTime, default=dt.datetime.utcnow)
    updated_at = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)

    logs = relationship("ConsumptionLog", back_populates="item", cascade="all, delete-orphan")


class ConsumptionLog(Base):
    """Every stock change (purchase, consumption, manual edit) is recorded here
    so the pantry has a consumption history, not just a current snapshot."""

    __tablename__ = "consumption_logs"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"))
    item_name = Column(String, nullable=False)  # denormalized so history survives item deletion
    change = Column(Float, nullable=False)  # positive = added stock, negative = consumed
    quantity_after = Column(Float, nullable=False)
    reason = Column(String, nullable=False)  # "compra" | "consumo" | "ajuste" | "criacao"
    timestamp = Column(DateTime, default=dt.datetime.utcnow, index=True)

    item = relationship("Item", back_populates="logs")
