"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* PWA installability is a nice-to-have, not critical - fail silently */
      });
    }
  }, []);

  return null;
}
