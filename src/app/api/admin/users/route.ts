import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import type { AdminUserDTO } from "@/types/feature";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const [users, grants] = await Promise.all([
    prisma.appUser.findMany({ orderBy: { lastLoginAt: "desc" } }),
    prisma.featureGrant.findMany(),
  ]);

  const featuresByEmail = new Map<string, string[]>();
  for (const grant of grants) {
    const list = featuresByEmail.get(grant.userEmail) ?? [];
    list.push(grant.feature);
    featuresByEmail.set(grant.userEmail, list);
  }

  const dto: AdminUserDTO[] = users.map((u) => ({
    email: u.email,
    name: u.name,
    image: u.image,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt.toISOString(),
    features: featuresByEmail.get(u.email) ?? [],
  }));

  return NextResponse.json(dto);
}
