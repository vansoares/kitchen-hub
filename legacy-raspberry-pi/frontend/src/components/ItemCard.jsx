import Badge from "./Badge.jsx";

function formatDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function ItemCard({ item, onConsume, onPurchase, onEdit }) {
  return (
    <div className={`item-card status-${item.status}`}>
      <div className="linha1">
        <h3>{item.name}</h3>
        <span className="categoria">{item.category}</span>
      </div>

      <Badge status={item.status} />

      <div className="quantidade">
        {item.quantity} {item.unit}
        <span style={{ fontSize: "0.7rem", fontWeight: 400, color: "var(--texto-suave)" }}>
          {" "}(minimo {item.min_quantity})
        </span>
      </div>

      {item.expiry_date && (
        <div className="validade">Validade: {formatDate(item.expiry_date)}</div>
      )}
      {item.last_purchase_date && (
        <div className="validade">Ultima compra: {formatDate(item.last_purchase_date)}</div>
      )}

      <div className="item-actions">
        <button className="acao-consumir" onClick={() => onConsume(item)} title="Usar 1 unidade">
          − Usar
        </button>
        <button className="acao-comprar" onClick={() => onPurchase(item)} title="Marcar como comprado">
          + Comprei
        </button>
        <button className="acao-editar" onClick={() => onEdit(item)} title="Editar item">
          ✎
        </button>
      </div>
    </div>
  );
}
