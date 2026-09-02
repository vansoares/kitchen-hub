import { useCallback, useEffect, useState } from "react";
import ItemCard from "../components/ItemCard.jsx";
import ItemForm from "../components/ItemForm.jsx";
import { api } from "../api.js";

export default function Pantry() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [onlyAlerts, setOnlyAlerts] = useState(false);
  const [editing, setEditing] = useState(null); // null = fechado, {} = novo, item = editar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemList, cats] = await Promise.all([
        onlyAlerts
          ? api.getAlerts()
          : api.listItems({ ...(search ? { search } : {}), ...(category ? { category } : {}) }),
        api.getCategories(),
      ]);
      setItems(itemList);
      setCategories(cats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, category, onlyAlerts]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleConsume(item) {
    await api.consumeItem(item.id, 1);
    load();
  }

  async function handlePurchase(item) {
    await api.purchaseItem(item.id, 1);
    load();
  }

  async function handleSave(data) {
    if (editing?.id) {
      await api.updateItem(editing.id, data);
    } else {
      await api.createItem(data);
    }
    setEditing(null);
    load();
  }

  async function handleDelete(item) {
    if (!window.confirm(`Excluir "${item.name}" da despensa?`)) return;
    await api.deleteItem(item.id);
    setEditing(null);
    load();
  }

  return (
    <div className="content">
      <div className="toolbar">
        <input
          type="search"
          placeholder="Buscar item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas categorias</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          className={onlyAlerts ? "btn btn-terracota" : "btn btn-secundario"}
          onClick={() => setOnlyAlerts((v) => !v)}
        >
          ⚠ Alertas
        </button>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          + Novo item
        </button>
      </div>

      {error && <div className="vazio">Erro ao carregar despensa: {error}</div>}
      {!error && loading && <div className="vazio">Carregando...</div>}
      {!error && !loading && items.length === 0 && (
        <div className="vazio">
          {onlyAlerts ? "Nenhum item acabando ou vencendo. 🎉" : "Nenhum item encontrado."}
        </div>
      )}

      <div className="item-grid">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onConsume={handleConsume}
            onPurchase={handlePurchase}
            onEdit={setEditing}
          />
        ))}
      </div>

      {editing && (
        <ItemForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
