from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db
from ..email_utils import EmailNotConfigured, send_shopping_list_email

router = APIRouter(prefix="/api/shopping-list", tags=["shopping-list"])


@router.post("/send", response_model=schemas.ShoppingListResult)
def send_shopping_list(db: Session = Depends(get_db)):
    """Manda por email os itens acabando/vencendo/vencidos - a lista do que falta comprar."""
    items = crud.get_alerts(db)
    if not items:
        return schemas.ShoppingListResult(sent=False, count=0, message="Nenhum item para comprar no momento.")

    payload = [
        {"name": i.name, "quantity": i.quantity, "unit": i.unit, "status": crud.compute_status(i)}
        for i in items
    ]
    try:
        send_shopping_list_email(payload)
    except EmailNotConfigured as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Falha ao enviar email: {e}")

    return schemas.ShoppingListResult(sent=True, count=len(items), message="Lista enviada com sucesso.")
