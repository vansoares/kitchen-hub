// So os emails aqui enxergam o painel de admin (/admin) e conseguem
// liberar features pra outras contas. Mesmo padrao de ALLOWED_EMAILS em
// auth.ts, so que controla acesso ao painel, nao login no app.
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}
