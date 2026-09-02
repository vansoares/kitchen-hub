"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/signin" })}
      className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium transition hover:bg-white/25"
    >
      Sair
    </button>
  );
}
