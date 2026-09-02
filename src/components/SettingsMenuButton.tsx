"use client";

import { useState } from "react";
import { SettingsPanel } from "@/components/SettingsPanel";

export function SettingsMenuButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Configurações"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm transition hover:bg-white/30"
      >
        ⚙️
      </button>
      {open && <SettingsPanel onClose={() => setOpen(false)} />}
    </>
  );
}
