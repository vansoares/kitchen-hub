import { prisma } from "@/lib/prisma";
import type { PurchaseDTO, SpendingSummaryDTO } from "@/types/purchase";

export function createPurchase(total: number, note: string | null) {
  return prisma.purchase.create({ data: { total, note } });
}

export function getPurchase(id: number) {
  return prisma.purchase.findUnique({ where: { id } });
}

export function deletePurchase(id: number) {
  return prisma.purchase.delete({ where: { id } });
}

export function toPurchaseDTO(p: { id: number; total: number; note: string | null; createdAt: Date }): PurchaseDTO {
  return { id: p.id, total: p.total, note: p.note, createdAt: p.createdAt.toISOString() };
}

export async function getSpendingSummary(recentLimit = 10): Promise<SpendingSummaryDTO> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [allTimeAgg, monthAgg, recent] = await Promise.all([
    prisma.purchase.aggregate({ _sum: { total: true } }),
    prisma.purchase.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.purchase.findMany({ orderBy: { createdAt: "desc" }, take: recentLimit }),
  ]);

  return {
    totalAllTime: allTimeAgg._sum.total ?? 0,
    totalThisMonth: monthAgg._sum.total ?? 0,
    countThisMonth: monthAgg._count,
    recent: recent.map(toPurchaseDTO),
  };
}
