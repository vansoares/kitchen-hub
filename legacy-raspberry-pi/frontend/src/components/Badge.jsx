const LABELS = {
  ok: "Em dia",
  acabando: "Acabando",
  vencendo: "Vencendo",
  vencido: "Vencido",
};

export default function Badge({ status }) {
  return <span className={`badge status-${status}`}>{LABELS[status] ?? status}</span>;
}
