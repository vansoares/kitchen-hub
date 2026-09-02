"use client";

import { useEffect, useRef } from "react";

const ELEMENT_ID = "kitchenhub-scanner";

interface Props {
  onDetected: (code: string) => void;
  onClose: () => void;
}

/** Abre a camera do dispositivo e reporta o primeiro codigo de barras lido. */
export function BarcodeScanner({ onDetected, onClose }: Props) {
  const stoppedRef = useRef(false);

  useEffect(() => {
    let scanner: import("html5-qrcode").Html5Qrcode | null = null;
    stoppedRef.current = false;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (stoppedRef.current) return; // componente ja desmontou antes do modulo carregar
      scanner = new Html5Qrcode(ELEMENT_ID);
      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText) => {
            if (stoppedRef.current) return;
            stoppedRef.current = true;
            scanner?.stop().catch(() => {});
            onDetected(decodedText);
          },
          () => {
            /* ruido de "nao encontrado" por frame - ignorado de proposito */
          }
        )
        .catch((err) => {
          console.error("Nao foi possivel abrir a camera", err);
          onClose();
        });
    });

    return () => {
      stoppedRef.current = true;
      scanner?.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div id={ELEMENT_ID} className="mb-3 overflow-hidden rounded-2xl border-4 border-brand-500" />
      <button
        onClick={onClose}
        className="w-full rounded-xl bg-brand-500/10 py-2.5 font-semibold text-brand-700 dark:text-brand-200"
      >
        Cancelar leitura
      </button>
    </div>
  );
}
