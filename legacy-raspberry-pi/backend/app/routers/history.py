from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("", response_model=list[schemas.HistoryOut])
def global_history(limit: int = 100, db: Session = Depends(get_db)):
    """Historico de consumo/compras de toda a despensa, mais recente primeiro."""
    return crud.get_history(db, limit=limit)
