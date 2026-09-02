"use client";

import { useEffect, useRef, useState } from "react";

interface ActionMenuItem {
  label: string;
  onClick: () => void;
}

export function ActionMenu({ items }: { items: ActionMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Mais acoes"
        aria-expanded={open}
        className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold transition ${
          open ? "bg-brand-500 text-white" : "bg-brand-100 text-brand-600 dark:bg-white/10 dark:text-brand-200"
        }`}
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl bg-white py-1.5 shadow-xl ring-1 ring-black/5 dark:bg-brand-800">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className="block w-full px-4 py-3 text-left text-sm font-semibold text-brand-700 transition hover:bg-brand-100 dark:text-brand-200 dark:hover:bg-white/10"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
