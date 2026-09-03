import { NextResponse } from "next/server";
import * as purchases from "@/lib/purchases";
import { getHouseholdId } from "@/lib/session";

export async function GET() {
  const householdId = await getHouseholdId();
  if (householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const summary = await purchases.getSpendingSummary(householdId);
  return NextResponse.json(summary);
}

export async function POST(req: Request) {
  const householdId = await getHouseholdId();
  if (householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await req.json();
  const total = Number(body?.total);

  if (!(total > 0)) {
    return NextResponse.json({ error: "Informe um valor total valido" }, { status: 422 });
  }

  const purchase = await purchases.createPurchase(householdId, total, body?.note || null);
  return NextResponse.json(purchases.toPurchaseDTO(purchase), { status: 201 });
}
