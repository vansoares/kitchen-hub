import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { Footer } from "@/components/Footer";

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "Esse email nao tem acesso a este KitchenHub.",
  Default: "Nao foi possivel entrar. Tente novamente.",
};

const FEATURES = [
  { icon: "📦", label: "Estoque" },
  { icon: "🍳", label: "Receitas" },
  { icon: "💰", label: "Gastos" },
];

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? ERROR_MESSAGES[params.error] ?? ERROR_MESSAGES.Default : null;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-brand-800">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500 text-4xl shadow-lg shadow-brand-500/30">
          🧺
        </div>

        <div>
          <h1 className="font-disp text-4xl font-bold tracking-tight text-brand-500 dark:text-brand-200">
            KitchenHub
          </h1>
          <p className="mt-2 text-brand-700 dark:text-brand-200/80">Sua despensa, de qualquer lugar.</p>
        </div>

        <div className="flex gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-1 rounded-2xl bg-brand-500/10 px-4 py-3 dark:bg-white/5"
            >
              <span className="text-xl">{f.icon}</span>
              <span className="text-xs font-bold text-brand-700 dark:text-brand-200">{f.label}</span>
            </div>
          ))}
        </div>

        {error && (
          <p className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <GoogleSignInButton callbackUrl={params.callbackUrl ?? "/"} />

        <p className="text-xs text-brand-900/40 dark:text-cream/40">
          Cada login ganha sua propria despensa - compartilhe depois se quiser
        </p>
      </div>

      <div className="absolute bottom-0 w-full">
        <Footer />
      </div>
    </main>
  );
}
