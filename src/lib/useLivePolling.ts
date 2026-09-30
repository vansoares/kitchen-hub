import { useEffect, useRef } from "react";

// "Ao vivo" sem websocket (o app roda em funcoes serverless): chama `fn` a cada
// `intervalMs` enquanto a aba esta visivel e uma vez ao voltar pra ela.
export function useLivePolling(fn: () => void, intervalMs = 5000) {
  const latest = useRef(fn);
  useEffect(() => {
    latest.current = fn;
  });

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") latest.current();
    };
    const id = setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [intervalMs]);
}
