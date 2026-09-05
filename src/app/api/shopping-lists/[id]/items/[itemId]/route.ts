import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as shoppingLists from "@/lib/shoppingLists";
import { getHouseholdId, getUserEmail } from "@/lib/session";
import { hasFeature } from "@/lib/featureGrants";

type RouteParams = { params: Promise<{ id: string; itemId: string }> };

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) ? id : null;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const email = await getUserEmail();
  const householdId = await getHouseholdId();
  if (!email || householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!(await hasFeature(email, "custom_shopping_lists"))) {
    return NextResponse.json({ error: "Funcionalidade nao liberada" }, { status: 403 });
  }

  const { id, itemId } = await params;
  const listId = parseId(id);
  const shoppingListItemId = parseId(itemId);
  if (listId === null || shoppingListItemId === null) {
    return NextResponse.json({ error: "Id invalido" }, { status: 422 });
  }

  const body = await req.json();
  if (typeof body?.checked !== "boolean") {
    return NextResponse.json({ error: "checked precisa ser true/false" }, { status: 422 });
  }

  try {
    const list = await shoppingLists.toggleItem(householdId, listId, shoppingListItemId, body.checked);
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro ao atualizar item" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const email = await getUserEmail();
  const householdId = await getHouseholdId();
  if (!email || householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!(await hasFeature(email, "custom_shopping_lists"))) {
    return NextResponse.json({ error: "Funcionalidade nao liberada" }, { status: 403 });
  }

  const { id, itemId } = await params;
  const listId = parseId(id);
  const shoppingListItemId = parseId(itemId);
  if (listId === null || shoppingListItemId === null) {
    return NextResponse.json({ error: "Id invalido" }, { status: 422 });
  }

  try {
    const list = await shoppingLists.removeItem(householdId, listId, shoppingListItemId);
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro ao remover item" }, { status: 404 });
  }
}
