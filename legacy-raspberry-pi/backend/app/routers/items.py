from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/items", tags=["items"])


def _get_item_or_404(db: Session, item_id: int):
    item = crud.get_item(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item nao encontrado")
    return item


@router.get("", response_model=list[schemas.ItemOut])
def list_items(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    items = crud.get_items(db, search=search, category=category)
    return [crud.to_item_out(i) for i in items]


@router.get("/alerts", response_model=list[schemas.ItemOut])
def list_alerts(db: Session = Depends(get_db)):
    """Itens acabando (estoque <= minimo) ou vencendo/vencidos."""
    items = crud.get_alerts(db)
    return [crud.to_item_out(i) for i in items]


@router.get("/categories", response_model=list[str])
def list_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)


@router.get("/{item_id}", response_model=schemas.ItemOut)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = _get_item_or_404(db, item_id)
    return crud.to_item_out(item)


@router.post("", response_model=schemas.ItemOut, status_code=201)
def create_item(payload: schemas.ItemCreate, db: Session = Depends(get_db)):
    item = crud.create_item(db, payload)
    return crud.to_item_out(item)


@router.put("/{item_id}", response_model=schemas.ItemOut)
def update_item(item_id: int, payload: schemas.ItemUpdate, db: Session = Depends(get_db)):
    item = _get_item_or_404(db, item_id)
    item = crud.update_item(db, item, payload)
    return crud.to_item_out(item)


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = _get_item_or_404(db, item_id)
    crud.delete_item(db, item)


@router.post("/{item_id}/purchase", response_model=schemas.ItemOut)
def purchase_item(item_id: int, payload: schemas.StockChange, db: Session = Depends(get_db)):
    """Marca como comprado: incrementa estoque e atualiza data da ultima compra."""
    item = _get_item_or_404(db, item_id)
    item = crud.purchase_item(db, item, payload.amount)
    return crud.to_item_out(item)


@router.post("/{item_id}/consume", response_model=schemas.ItemOut)
def consume_item(item_id: int, payload: schemas.StockChange, db: Session = Depends(get_db)):
    """Registra consumo: decrementa estoque."""
    item = _get_item_or_404(db, item_id)
    item = crud.consume_item(db, item, payload.amount)
    return crud.to_item_out(item)


@router.get("/{item_id}/history", response_model=list[schemas.HistoryOut])
def item_history(item_id: int, db: Session = Depends(get_db)):
    _get_item_or_404(db, item_id)
    return crud.get_history(db, item_id=item_id)
