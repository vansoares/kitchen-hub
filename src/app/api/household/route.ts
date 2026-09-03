import { NextResponse } from "next/server";
import * as household from "@/lib/household";
import { getUserEmail } from "@/lib/session";

export async function GET() {
  const userEmail = await getUserEmail();
  if (!userEmail) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const info = await household.getHouseholdInfo(userEmail);
  return NextResponse.json({ ...info, you: userEmail });
}

export async function PUT(req: Request) {
  const userEmail = await getUserEmail();
  if (!userEmail) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await req.json();
  if (!body?.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Nome e obrigatorio" }, { status: 422 });
  }

  const info = await household.renameHousehold(userEmail, body.name.trim());
  return NextResponse.json({ ...info, you: userEmail });
}
