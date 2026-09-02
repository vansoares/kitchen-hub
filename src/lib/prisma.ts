import { PrismaClient } from "@prisma/client";

// Em dev, o Next.js recarrega modulos a cada mudanca de arquivo; sem isso,
// cada reload criaria uma nova PrismaClient e esgotaria as conexoes do banco.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
