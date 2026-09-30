import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";

// Marcacoes ("ja peguei") da lista de compras automatica. Ficam no servidor,
// por casa, pra todo mundo que divide a despensa ver o mesmo carrinho.

export async function GET() {
  const householdId = await getHouseholdId();
  if (householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const rows = await prisma.shoppingCheck.findMany({ where: { householdId }, select: { itemId: true } });
  return NextResponse.json(rows.map((r) => r.itemId));
}

export async function PUT(req: NextRequest) {
  const householdId = await getHouseholdId();
  if (householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await req.json();
  const itemId = Number(body?.itemId);
  if (!Number.isInteger(itemId) || typeof body?.checked !== "boolean") {
    return NextResponse.json({ error: "itemId e checked sao obrigatorios" }, { status: 422 });
  }

  const item = await prisma.item.findFirst({ where: { id: itemId, householdId }, select: { id: true } });
  if (!item) return NextResponse.json({ error: "Item nao encontrado" }, { status: 404 });

  if (body.checked) {
    await prisma.shoppingCheck.upsert({
      where: { householdId_itemId: { householdId, itemId } },
      create: { householdId, itemId },
      update: {},
    });
  } else {
    await prisma.shoppingCheck.deleteMany({ where: { householdId, itemId } });
  }
  return new NextResponse(null, { status: 204 });
}

export async function DELETE() {
  const householdId = await getHouseholdId();
  if (householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  await prisma.shoppingCheck.deleteMany({ where: { householdId } });
  return new NextResponse(null, { status: 204 });
}
