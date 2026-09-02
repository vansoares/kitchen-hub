import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { Footer } from "@/components/Footer";

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "Esse email nao tem acesso a este KitchenHub.",
  Default: "Nao foi possivel entrar. Tente novamente.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? ERROR_MESSAGES[params.error] ?? ERROR_MESSAGES.Default : null;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-brand-500 dark:text-brand-200">
          KitchenHub
        </h1>
        <p className="mt-2 text-brand-700 dark:text-brand-200/80">Sua despensa, de qualquer lugar.</p>
      </div>

      {error && (
        <p className="max-w-xs rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <GoogleSignInButton callbackUrl={params.callbackUrl ?? "/"} />

      <div className="absolute bottom-0 w-full">
        <Footer />
      </div>
    </main>
  );
}
