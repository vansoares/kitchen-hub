import { NextResponse } from "next/server";
import * as household from "@/lib/household";
import { getUserEmail } from "@/lib/session";

export async function DELETE(_req: Request, { params }: { params: Promise<{ email: string }> }) {
  const userEmail = await getUserEmail();
  if (!userEmail) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const targetEmail = decodeURIComponent((await params).email).toLowerCase();

  try {
    const info = await household.removeMember(userEmail, targetEmail);
    return NextResponse.json({ ...info, you: userEmail });
  } catch {
    return NextResponse.json({ error: "Essa pessoa nao faz parte da sua despensa" }, { status: 404 });
  }
}
