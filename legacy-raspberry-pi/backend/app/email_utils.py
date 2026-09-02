"""Envio da lista de compras por email via SMTP.

Credenciais vem de variaveis de ambiente (arquivo .env na pasta backend/,
veja .env.example) - nunca ficam hardcoded no codigo.
"""
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM") or SMTP_USER
EMAIL_TO = os.getenv("SHOPPING_LIST_TO") or SMTP_USER

STATUS_LABELS = {
    "vencido": "Vencidos (repor)",
    "acabando": "Acabando",
    "vencendo": "Vencendo em breve",
}
STATUS_ORDER = ["vencido", "acabando", "vencendo"]


class EmailNotConfigured(Exception):
    pass


def _format_body(items: list[dict]) -> str:
    groups: dict[str, list[dict]] = {}
    for item in items:
        groups.setdefault(item["status"], []).append(item)

    lines = ["Lista de compras gerada pelo KitchenHub", ""]
    for status in STATUS_ORDER:
        group = groups.get(status)
        if not group:
            continue
        lines.append(f"{STATUS_LABELS[status]}:")
        for item in group:
            lines.append(f"  - {item['name']} ({item['quantity']} {item['unit']})")
        lines.append("")

    return "\n".join(lines)


def send_shopping_list_email(items: list[dict]) -> None:
    if not (SMTP_HOST and SMTP_USER and SMTP_PASSWORD and EMAIL_TO):
        raise EmailNotConfigured(
            "Envio de email nao configurado: defina SMTP_HOST, SMTP_USER, "
            "SMTP_PASSWORD e SHOPPING_LIST_TO em backend/.env (veja .env.example)."
        )

    msg = MIMEMultipart()
    msg["Subject"] = f"KitchenHub - Lista de compras ({len(items)} itens)"
    msg["From"] = EMAIL_FROM
    msg["To"] = EMAIL_TO
    msg.attach(MIMEText(_format_body(items), "plain", "utf-8"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
