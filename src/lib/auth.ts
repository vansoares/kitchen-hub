import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// App de uso pessoal: qualquer conta Google poderia logar por padrao, entao
// restringimos ao(s) email(s) em ALLOWED_EMAILS (lista separada por virgula).
// Sem essa variavel configurada, o acesso fica aberto - defina em producao.
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
