"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/signin" })}
      className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold transition hover:bg-white/30"
    >
      Sair
    </button>
  );
}
