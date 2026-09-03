import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateHouseholdId } from "@/lib/household";

// O middleware ja bloqueia requisicoes sem sessao valida, mas as rotas de API
// ainda precisam do email pra saber quem esta pedindo.
export async function getUserEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.email ?? null;
}

// Despensa, receitas e compras sao todas por household (casa), nao por
// login individual - varias pessoas podem compartilhar a mesma.
export async function getHouseholdId(): Promise<number | null> {
  const email = await getUserEmail();
  if (!email) return null;
  return getOrCreateHouseholdId(email);
}
