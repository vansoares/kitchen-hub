import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserFeatures } from "@/lib/featureGrants";
import type { MeDTO } from "@/types/feature";

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const features = await getUserFeatures(email);
  const dto: MeDTO = { email, isAdmin: session?.user?.isAdmin ?? false, features };
  return NextResponse.json(dto);
}
