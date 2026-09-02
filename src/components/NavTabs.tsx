"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Despensa" },
  { href: "/receitas", label: "Receitas" },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex max-w-5xl gap-2 px-4 pt-4">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`font-disp rounded-full px-4 py-2 text-sm font-bold transition ${
              active
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-brand-100 text-brand-600 hover:bg-brand-200 dark:bg-white/5 dark:text-brand-200"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
