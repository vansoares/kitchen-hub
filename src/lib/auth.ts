import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Por padrao qualquer conta Google pode logar - cada uma ganha sua propria
// despensa (household) automaticamente e decide se quer compartilhar com
// outra conta depois. ALLOWED_EMAILS e opcional: so existe pra quem quiser
// voltar a restringir o login a uma lista fixa de emails (separada por virgula).
function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowList = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowList.length === 0) return true;
  return allowList.includes(email.toLowerCase());
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({ user }) {
      return isAllowedEmail(user.email);
    },
  },
};
