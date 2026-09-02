import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const ELEMENT_ID = "kitchenhub-scanner";

/** Opens the device camera and reports the first decoded barcode via onDetected. */
export default function BarcodeScanner({ onDetected, onClose }) {
  const scannerRef = useRef(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode(ELEMENT_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          if (stoppedRef.current) return;
          stoppedRef.current = true;
          scanner.stop().catch(() => {});
          onDetected(decodedText);
        },
        () => {
          /* per-frame "not found" noise - ignored on purpose */
        }
      )
      .catch((err) => {
        console.error("Nao foi possivel abrir a camera", err);
        onClose();
      });

    return () => {
      stoppedRef.current = true;
      scanner.stop().catch(() => {});
    };
  }, [onDetected, onClose]);

  return (
    <div>
      <div id={ELEMENT_ID} className="scanner-box" />
      <button className="btn btn-secundario" onClick={onClose} style={{ width: "100%" }}>
        Cancelar leitura
      </button>
    </div>
  );
}
