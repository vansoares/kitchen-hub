import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// O middleware ja bloqueia requisicoes sem sessao valida, mas as rotas de API
// ainda precisam do email pra saber de quem e a despensa/receita/compra.
export async function getUserEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.email ?? null;
}
