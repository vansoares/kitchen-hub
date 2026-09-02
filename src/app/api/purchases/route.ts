import { NextResponse } from "next/server";
import * as purchases from "@/lib/purchases";

export async function GET() {
  const summary = await purchases.getSpendingSummary();
  return NextResponse.json(summary);
}

export async function POST(req: Request) {
  const body = await req.json();
  const total = Number(body?.total);

  if (!(total > 0)) {
    return NextResponse.json({ error: "Informe um valor total valido" }, { status: 422 });
  }

  const purchase = await purchases.createPurchase(total, body?.note || null);
  return NextResponse.json(purchases.toPurchaseDTO(purchase), { status: 201 });
}
