"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  // Evita mostrar o icone errado por um instante antes do useEffect rodar.
  if (isDark === null) return <div className="h-8 w-9" />;

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className="flex h-8 w-9 items-center justify-center rounded-lg bg-white/15 text-sm transition hover:bg-white/25"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
