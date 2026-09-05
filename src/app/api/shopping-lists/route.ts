import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as shoppingLists from "@/lib/shoppingLists";
import { getHouseholdId, getUserEmail } from "@/lib/session";
import { hasFeature } from "@/lib/featureGrants";

export async function GET() {
  const email = await getUserEmail();
  const householdId = await getHouseholdId();
  if (!email || householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!(await hasFeature(email, "custom_shopping_lists"))) {
    return NextResponse.json({ error: "Funcionalidade nao liberada" }, { status: 403 });
  }

  const lists = await shoppingLists.getLists(householdId);
  return NextResponse.json(lists);
}

export async function POST(req: NextRequest) {
  const email = await getUserEmail();
  const householdId = await getHouseholdId();
  if (!email || householdId === null) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!(await hasFeature(email, "custom_shopping_lists"))) {
    return NextResponse.json({ error: "Funcionalidade nao liberada" }, { status: 403 });
  }

  const body = await req.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Nome e obrigatorio" }, { status: 422 });

  const list = await shoppingLists.createList(householdId, email, name);
  return NextResponse.json(list, { status: 201 });
}
