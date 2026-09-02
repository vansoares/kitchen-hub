import { NextResponse } from "next/server";
import * as pantry from "@/lib/pantry";
import { toItemDTO } from "@/lib/status";
import { EmailNotConfigured, sendShoppingListEmail } from "@/lib/mail";

export async function POST() {
  const items = await pantry.getAlerts();
  if (items.length === 0) {
    return NextResponse.json({ sent: false, count: 0, message: "Nenhum item para comprar no momento." });
  }

  try {
    await sendShoppingListEmail(items.map(toItemDTO));
  } catch (err) {
    if (err instanceof EmailNotConfigured) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: `Falha ao enviar email: ${message}` }, { status: 502 });
  }

  return NextResponse.json({ sent: true, count: items.length, message: "Lista enviada com sucesso." });
}
