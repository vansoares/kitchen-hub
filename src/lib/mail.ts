import nodemailer from "nodemailer";
import type { ItemDTO, ItemStatus } from "@/types/item";

const STATUS_LABELS: Record<string, string> = {
  vencido: "Vencidos (repor)",
  acabando: "Acabando",
  vencendo: "Vencendo em breve",
};
const STATUS_ORDER: ItemStatus[] = ["vencido", "acabando", "vencendo"];

export class EmailNotConfigured extends Error {}

function formatBody(items: ItemDTO[]): string {
  const groups = new Map<string, ItemDTO[]>();
  for (const item of items) {
    const list = groups.get(item.status) ?? [];
    list.push(item);
    groups.set(item.status, list);
  }

  const lines = ["Lista de compras gerada pelo KitchenHub", ""];
  for (const status of STATUS_ORDER) {
    const group = groups.get(status);
    if (!group?.length) continue;
    lines.push(`${STATUS_LABELS[status]}:`);
    for (const item of group) {
      lines.push(`  - ${item.name} (${item.quantity} ${item.unit})`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export async function sendShoppingListEmail(items: ItemDTO[]): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM, SHOPPING_LIST_TO } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !(SHOPPING_LIST_TO || SMTP_USER)) {
    throw new EmailNotConfigured(
      "Envio de email nao configurado: defina SMTP_HOST, SMTP_USER, SMTP_PASSWORD e " +
        "SHOPPING_LIST_TO nas variaveis de ambiente (veja .env.example)."
    );
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT ?? 587) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  await transporter.sendMail({
    from: EMAIL_FROM || SMTP_USER,
    to: SHOPPING_LIST_TO || SMTP_USER,
    subject: `KitchenHub - Lista de compras (${items.length} ${items.length === 1 ? "item" : "itens"})`,
    text: formatBody(items),
  });
}
