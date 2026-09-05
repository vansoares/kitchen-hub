import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as shoppingLists from "@/lib/shoppingLists";
import { getHouseholdId, getUserEmail } from "@/lib/session";
import { hasFeature } from "@/lib/featureGrants";

type RouteParams = { params: Promise<{ id: string }> };

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) ? id : null;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const email = await getUserEmail();
  const householdId = await getHouseholdId();
  if (!email || householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!(await hasFeature(email, "custom_shopping_lists"))) {
    return NextResponse.json({ error: "Funcionalidade nao liberada" }, { status: 403 });
  }

  const listId = parseId((await params).id);
  if (listId === null) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const body = await req.json();
  const itemId = body?.itemId !== undefined ? Number(body.itemId) : undefined;
  const quantity = body?.quantity !== undefined ? Number(body.quantity) : undefined;

  if (itemId === undefined && (typeof body?.name !== "string" || !body.name.trim())) {
    return NextResponse.json({ error: "Informe um nome ou um item da despensa" }, { status: 422 });
  }

  try {
    const list = await shoppingLists.addItem(householdId, listId, {
      itemId,
      name: body?.name,
      unit: body?.unit,
      quantity,
    });
    return NextResponse.json(list, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro ao adicionar item" }, { status: 404 });
  }
}
