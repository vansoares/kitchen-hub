import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { isFeatureKey } from "@/lib/features";
import { setFeatureEnabled, getUserFeatures } from "@/lib/featureGrants";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const targetEmail = decodeURIComponent((await params).email).toLowerCase();
  const body = await req.json();
  const { feature, enabled } = body ?? {};

  if (typeof feature !== "string" || !isFeatureKey(feature)) {
    return NextResponse.json({ error: "Feature invalida" }, { status: 422 });
  }
  if (typeof enabled !== "boolean") {
    return NextResponse.json({ error: "enabled precisa ser true/false" }, { status: 422 });
  }

  await setFeatureEnabled(targetEmail, feature, enabled);
  const features = await getUserFeatures(targetEmail);
  return NextResponse.json({ email: targetEmail, features });
}
