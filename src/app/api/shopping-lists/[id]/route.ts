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

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const email = await getUserEmail();
  const householdId = await getHouseholdId();
  if (!email || householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!(await hasFeature(email, "custom_shopping_lists"))) {
    return NextResponse.json({ error: "Funcionalidade nao liberada" }, { status: 403 });
  }

  const id = parseId((await params).id);
  if (id === null) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const list = await shoppingLists.getList(householdId, id);
  if (!list) return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  return NextResponse.json(list);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const email = await getUserEmail();
  const householdId = await getHouseholdId();
  if (!email || householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!(await hasFeature(email, "custom_shopping_lists"))) {
    return NextResponse.json({ error: "Funcionalidade nao liberada" }, { status: 403 });
  }

  const id = parseId((await params).id);
  if (id === null) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  const body = await req.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Nome e obrigatorio" }, { status: 422 });

  try {
    const list = await shoppingLists.renameList(householdId, id, name);
    return NextResponse.json(list);
  } catch {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const email = await getUserEmail();
  const householdId = await getHouseholdId();
  if (!email || householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!(await hasFeature(email, "custom_shopping_lists"))) {
    return NextResponse.json({ error: "Funcionalidade nao liberada" }, { status: 403 });
  }

  const id = parseId((await params).id);
  if (id === null) return NextResponse.json({ error: "Id invalido" }, { status: 422 });

  try {
    await shoppingLists.deleteList(householdId, id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }
}
