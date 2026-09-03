import { NextResponse } from "next/server";
import * as purchases from "@/lib/purchases";
import { getUserEmail } from "@/lib/session";

export async function GET() {
  const userEmail = await getUserEmail();
  if (!userEmail) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const summary = await purchases.getSpendingSummary(userEmail);
  return NextResponse.json(summary);
}

export async function POST(req: Request) {
  const userEmail = await getUserEmail();
  if (!userEmail) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await req.json();
  const total = Number(body?.total);

  if (!(total > 0)) {
    return NextResponse.json({ error: "Informe um valor total valido" }, { status: 422 });
  }

  const purchase = await purchases.createPurchase(userEmail, total, body?.note || null);
  return NextResponse.json(purchases.toPurchaseDTO(purchase), { status: 201 });
}
