import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header({ userName, userImage }: { userName?: string | null; userImage?: string | null }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 bg-brand-500 px-5 py-4 text-white shadow-md dark:bg-brand-700">
      <h1 className="text-xl font-bold tracking-tight">🧺 KitchenHub</h1>
      <div className="flex items-center gap-3">
        {userImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={userImage}
            alt={userName ?? "Usuario"}
            referrerPolicy="no-referrer"
            className="h-8 w-8 rounded-full border-2 border-white/40"
          />
        )}
        <ThemeToggle />
        <SignOutButton />
      </div>
    </header>
  );
}
