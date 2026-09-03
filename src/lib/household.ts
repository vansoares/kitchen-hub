import { prisma } from "@/lib/prisma";

function defaultHouseholdName(userEmail: string): string {
  const prefix = userEmail.split("@")[0].split(".")[0] || "casa";
  return `Despensa de ${prefix.charAt(0).toUpperCase()}${prefix.slice(1)}`;
}

// Toda conta logada pertence a exatamente um household. No primeiro acesso
// de um email novo, cria uma despensa individual pra ele automaticamente -
// assim o comportamento pra quem mora sozinho continua o mesmo de antes.
export async function getOrCreateHouseholdId(userEmail: string): Promise<number> {
  const existing = await prisma.householdMember.findUnique({ where: { userEmail } });
  if (existing) return existing.householdId;

  return prisma.$transaction(async (tx) => {
    const again = await tx.householdMember.findUnique({ where: { userEmail } });
    if (again) return again.householdId;

    const household = await tx.household.create({ data: { name: defaultHouseholdName(userEmail) } });
    await tx.householdMember.create({ data: { userEmail, householdId: household.id } });
    return household.id;
  });
}

export interface HouseholdInfo {
  id: number;
  name: string;
  members: string[];
}

export async function getHouseholdInfo(userEmail: string): Promise<HouseholdInfo> {
  const householdId = await getOrCreateHouseholdId(userEmail);
  const household = await prisma.household.findUniqueOrThrow({
    where: { id: householdId },
    include: { members: { orderBy: { createdAt: "asc" } } },
  });
  return {
    id: household.id,
    name: household.name,
    members: household.members.map((m) => m.userEmail),
  };
}

export async function renameHousehold(userEmail: string, name: string): Promise<HouseholdInfo> {
  const householdId = await getOrCreateHouseholdId(userEmail);
  await prisma.household.update({ where: { id: householdId }, data: { name } });
  return getHouseholdInfo(userEmail);
}

// Move `targetEmail` pra dentro do household de `requesterEmail`. Se o
// alvo ja tinha outra despensa (individual ou de outra casa), ele deixa de
// enxergar os itens de la - so os dados do household novo passam a valer.
export async function addMember(requesterEmail: string, targetEmail: string): Promise<HouseholdInfo> {
  const householdId = await getOrCreateHouseholdId(requesterEmail);
  await prisma.householdMember.upsert({
    where: { userEmail: targetEmail },
    create: { userEmail: targetEmail, householdId },
    update: { householdId },
  });
  return getHouseholdInfo(requesterEmail);
}

// Remove `targetEmail` do household de `requesterEmail` (precisa ser o
// mesmo household). A pessoa removida ganha uma despensa individual nova
// na proxima vez que acessar o app, via getOrCreateHouseholdId.
export async function removeMember(requesterEmail: string, targetEmail: string): Promise<HouseholdInfo> {
  const householdId = await getOrCreateHouseholdId(requesterEmail);
  const target = await prisma.householdMember.findUnique({ where: { userEmail: targetEmail } });
  if (!target || target.householdId !== householdId) {
    throw new Error("Essa pessoa nao faz parte da sua despensa");
  }
  await prisma.householdMember.delete({ where: { userEmail: targetEmail } });
  return getHouseholdInfo(requesterEmail);
}
