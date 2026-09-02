import { useState } from "react";
import BarcodeScanner from "./BarcodeScanner.jsx";
import { api } from "../api.js";

const UNIDADES = ["un", "kg", "g", "l", "ml", "pct", "cx", "dz"];
const CATEGORIAS_SUGERIDAS = [
  "Graos e cereais", "Laticinios", "Hortifruti", "Carnes", "Limpeza",
  "Higiene", "Bebidas", "Congelados", "Temperos", "Outros",
];

const EMPTY = {
  name: "",
  quantity: 1,
  unit: "un",
  category: "Outros",
  min_quantity: 1,
  expiry_date: "",
  barcode: "",
};

export default function ItemForm({ initial, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }));
  const [scanning, setScanning] = useState(false);
  const [looking, setLooking] = useState(false);
  const isEditing = Boolean(initial?.id);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleBarcodeDetected(code) {
    setScanning(false);
    setField("barcode", code);
    setLooking(true);
    try {
      const result = await api.lookupBarcode(code);
      if (result.found) {
        setForm((f) => ({
          ...f,
          name: f.name || result.name || f.name,
          category: result.category || f.category,
        }));
      }
    } catch {
      /* lookup is best-effort; ignore failures and let the user type manually */
    } finally {
      setLooking(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...form,
      quantity: Number(form.quantity),
      min_quantity: Number(form.min_quantity),
      expiry_date: form.expiry_date || null,
      barcode: form.barcode || null,
    });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? "Editar item" : "Novo item"}</h2>

        {scanning ? (
          <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setScanning(false)} />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="campo">
              <label>Nome</label>
              <input
                required
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Ex: Arroz branco"
              />
            </div>

            <div className="campo">
              <label>Codigo de barras</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  value={form.barcode || ""}
                  onChange={(e) => setField("barcode", e.target.value)}
                  placeholder="Opcional"
                />
                <button type="button" className="btn btn-secundario" onClick={() => setScanning(true)}>
                  📷
                </button>
              </div>
              {looking && <small>Buscando produto...</small>}
            </div>

            <div className="linha-dupla">
              <div className="campo">
                <label>Quantidade</label>
                <input
                  type="number" step="0.01" min="0" required
                  value={form.quantity}
                  onChange={(e) => setField("quantity", e.target.value)}
                />
              </div>
              <div className="campo">
                <label>Unidade</label>
                <select value={form.unit} onChange={(e) => setField("unit", e.target.value)}>
                  {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="linha-dupla">
              <div className="campo">
                <label>Estoque minimo</label>
                <input
                  type="number" step="0.01" min="0"
                  value={form.min_quantity}
                  onChange={(e) => setField("min_quantity", e.target.value)}
                />
              </div>
              <div className="campo">
                <label>Categoria</label>
                <input
                  list="categorias"
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                />
                <datalist id="categorias">
                  {CATEGORIAS_SUGERIDAS.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>

            <div className="campo">
              <label>Data de validade</label>
              <input
                type="date"
                value={form.expiry_date || ""}
                onChange={(e) => setField("expiry_date", e.target.value)}
              />
            </div>

            <div className="modal-acoes">
              <button type="button" className="btn btn-secundario" onClick={onCancel}>Cancelar</button>
              {isEditing && (
                <button type="button" className="btn btn-perigo" onClick={() => onDelete(initial)}>
                  Excluir
                </button>
              )}
              <button type="submit" className="btn btn-primary">Salvar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
