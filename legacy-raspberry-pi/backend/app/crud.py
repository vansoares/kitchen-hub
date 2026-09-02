import datetime as dt
from typing import Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from . import models, schemas

# Items expiring within this many days are flagged "vencendo" (about to expire).
EXPIRY_WARNING_DAYS = 3


def compute_status(item: models.Item) -> str:
    today = dt.date.today()
    if item.expiry_date is not None:
        if item.expiry_date < today:
            return "vencido"
        if item.expiry_date <= today + dt.timedelta(days=EXPIRY_WARNING_DAYS):
            return "vencendo"
    if item.quantity <= item.min_quantity:
        return "acabando"
    return "ok"


def to_item_out(item: models.Item) -> schemas.ItemOut:
    base = schemas.ItemBase.model_validate(item, from_attributes=True)
    return schemas.ItemOut(
        **base.model_dump(),
        id=item.id,
        created_at=item.created_at,
        updated_at=item.updated_at,
        status=compute_status(item),
    )


def get_items(
    db: Session,
    search: Optional[str] = None,
    category: Optional[str] = None,
) -> list[models.Item]:
    query = db.query(models.Item)
    if search:
        like = f"%{search.lower()}%"
        query = query.filter(models.Item.name.ilike(like))
    if category:
        query = query.filter(models.Item.category == category)
    return query.order_by(models.Item.name).all()


def get_item(db: Session, item_id: int) -> Optional[models.Item]:
    return db.query(models.Item).filter(models.Item.id == item_id).first()


def get_categories(db: Session) -> list[str]:
    rows = db.query(models.Item.category).distinct().order_by(models.Item.category).all()
    return [r[0] for r in rows]


def _log(db: Session, item: models.Item, change: float, reason: str) -> None:
    db.add(models.ConsumptionLog(
        item_id=item.id,
        item_name=item.name,
        change=change,
        quantity_after=item.quantity,
        reason=reason,
    ))


def create_item(db: Session, data: schemas.ItemCreate) -> models.Item:
    item = models.Item(**data.model_dump())
    db.add(item)
    db.flush()  # get item.id before logging
    _log(db, item, item.quantity, "criacao")
    db.commit()
    db.refresh(item)
    return item


def update_item(db: Session, item: models.Item, data: schemas.ItemUpdate) -> models.Item:
    updates = data.model_dump(exclude_unset=True)
    old_quantity = item.quantity
    for field, value in updates.items():
        setattr(item, field, value)
    if "quantity" in updates and item.quantity != old_quantity:
        _log(db, item, item.quantity - old_quantity, "ajuste")
    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, item: models.Item) -> None:
    db.delete(item)
    db.commit()


def purchase_item(db: Session, item: models.Item, amount: float) -> models.Item:
    """Mark as bought: add stock and bump last_purchase_date."""
    item.quantity += amount
    item.last_purchase_date = dt.date.today()
    _log(db, item, amount, "compra")
    db.commit()
    db.refresh(item)
    return item


def consume_item(db: Session, item: models.Item, amount: float) -> models.Item:
    """Use up stock. Clamped at 0 - consumption can't go negative."""
    actual = min(amount, item.quantity)
    item.quantity -= actual
    _log(db, item, -actual, "consumo")
    db.commit()
    db.refresh(item)
    return item


def get_alerts(db: Session) -> list[models.Item]:
    today = dt.date.today()
    warning_date = today + dt.timedelta(days=EXPIRY_WARNING_DAYS)
    return (
        db.query(models.Item)
        .filter(
            or_(
                models.Item.quantity <= models.Item.min_quantity,
                models.Item.expiry_date <= warning_date,
            )
        )
        .order_by(models.Item.expiry_date.is_(None), models.Item.expiry_date)
        .all()
    )


def get_history(db: Session, item_id: Optional[int] = None, limit: int = 100) -> list[models.ConsumptionLog]:
    query = db.query(models.ConsumptionLog)
    if item_id is not None:
        query = query.filter(models.ConsumptionLog.item_id == item_id)
    return query.order_by(models.ConsumptionLog.timestamp.desc()).limit(limit).all()
