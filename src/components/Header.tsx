import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsMenuButton } from "@/components/SettingsMenuButton";

export function Header({
  userName,
  userImage,
  isAdmin,
}: {
  userName?: string | null;
  userImage?: string | null;
  isAdmin?: boolean;
}) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between gap-3 rounded-b-3xl bg-brand-500 px-5 pb-4 text-white shadow-md dark:bg-brand-700"
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
    >
      <h1 className="font-disp text-xl font-bold tracking-tight">🧺 KitchenHub</h1>
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link
            href="/admin"
            aria-label="Admin"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-base transition hover:bg-white/25"
          >
            🔑
          </Link>
        )}
        {userImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={userImage}
            alt={userName ?? "Usuario"}
            referrerPolicy="no-referrer"
            className="h-9 w-9 rounded-full border-2 border-white"
          />
        )}
        <SettingsMenuButton />
        <ThemeToggle />
        <SignOutButton />
      </div>
    </header>
  );
}
