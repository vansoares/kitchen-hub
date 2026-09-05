import { prisma } from "@/lib/prisma";
import type { FeatureKey } from "@/lib/features";

export async function getUserFeatures(email: string): Promise<FeatureKey[]> {
  const grants = await prisma.featureGrant.findMany({
    where: { userEmail: email },
    select: { feature: true },
  });
  return grants.map((g) => g.feature as FeatureKey);
}

export async function hasFeature(email: string | null, key: FeatureKey): Promise<boolean> {
  if (!email) return false;
  const grant = await prisma.featureGrant.findUnique({
    where: { userEmail_feature: { userEmail: email, feature: key } },
  });
  return grant !== null;
}

export async function setFeatureEnabled(email: string, key: FeatureKey, enabled: boolean): Promise<void> {
  if (enabled) {
    await prisma.featureGrant.upsert({
      where: { userEmail_feature: { userEmail: email, feature: key } },
      create: { userEmail: email, feature: key },
      update: {},
    });
  } else {
    await prisma.featureGrant.deleteMany({ where: { userEmail: email, feature: key } });
  }
}
