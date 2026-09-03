import { prisma } from "@/lib/prisma";
import type { MonthlySpendingDTO, PurchaseDTO, SpendingSummaryDTO } from "@/types/purchase";

const MONTHS_IN_CHART = 6;

export function createPurchase(userEmail: string, total: number, note: string | null) {
  return prisma.purchase.create({ data: { userEmail, total, note } });
}

export function getPurchase(userEmail: string, id: number) {
  return prisma.purchase.findFirst({ where: { id, userEmail } });
}

export async function deletePurchase(userEmail: string, id: number) {
  const { count } = await prisma.purchase.deleteMany({ where: { id, userEmail } });
  if (count === 0) throw new Error("Compra nao encontrada");
}

export function toPurchaseDTO(p: { id: number; total: number; note: string | null; createdAt: Date }): PurchaseDTO {
  return { id: p.id, total: p.total, note: p.note, createdAt: p.createdAt.toISOString() };
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d: Date): string {
  const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Soma o gasto de cada um dos ultimos N meses (incluindo os sem nenhuma
// compra, que aparecem com total 0 - assim o grafico sempre tem os mesmos
// N pontos, nunca "pula" um mes vazio.
async function getMonthlySpending(userEmail: string, months: number): Promise<MonthlySpendingDTO[]> {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  start.setMonth(start.getMonth() - (months - 1));

  const purchases = await prisma.purchase.findMany({
    where: { userEmail, createdAt: { gte: start } },
    select: { total: true, createdAt: true },
  });

  const totals = new Map<string, number>();
  const order: { key: string; date: Date }[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    const key = monthKey(d);
    totals.set(key, 0);
    order.push({ key, date: d });
  }

  for (const p of purchases) {
    const key = monthKey(p.createdAt);
    totals.set(key, (totals.get(key) ?? 0) + p.total);
  }

  return order.map(({ key, date }) => ({
    month: key,
    label: monthLabel(date),
    total: Math.round((totals.get(key) ?? 0) * 100) / 100,
  }));
}

export async function getSpendingSummary(userEmail: string, recentLimit = 10): Promise<SpendingSummaryDTO> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [allTimeAgg, monthAgg, recent, monthly] = await Promise.all([
    prisma.purchase.aggregate({ _sum: { total: true }, where: { userEmail } }),
    prisma.purchase.aggregate({
      _sum: { total: true },
      _count: true,
      where: { userEmail, createdAt: { gte: startOfMonth } },
    }),
    prisma.purchase.findMany({ where: { userEmail }, orderBy: { createdAt: "desc" }, take: recentLimit }),
    getMonthlySpending(userEmail, MONTHS_IN_CHART),
  ]);

  return {
    totalAllTime: allTimeAgg._sum.total ?? 0,
    totalThisMonth: monthAgg._sum.total ?? 0,
    countThisMonth: monthAgg._count,
    recent: recent.map(toPurchaseDTO),
    monthly,
  };
}
