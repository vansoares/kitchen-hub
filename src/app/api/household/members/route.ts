import { NextResponse } from "next/server";
import * as household from "@/lib/household";
import { getUserEmail } from "@/lib/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const userEmail = await getUserEmail();
  if (!userEmail) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await req.json();
  const targetEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(targetEmail)) {
    return NextResponse.json({ error: "Email invalido" }, { status: 422 });
  }

  const info = await household.addMember(userEmail, targetEmail);
  return NextResponse.json({ ...info, you: userEmail });
}
