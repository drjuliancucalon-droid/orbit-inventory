import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { TransactionPanel } from "../components/TransactionPanel";
import { ProductModal } from "../components/ProductModal";
import { IconPlus, IconEdit, IconTrash, IconArrowUp, IconArrowDown } from "../components/Icons";
import { api, type Product, ApiError } from "../lib/api";
import { formatCOP } from "../lib/format";

const LOW_STOCK_THRESHOLD = 10;
type Filter = "all" | "low" | "out";

function statusOf(p: Product): { cls: "good" | "warn" | "bad"; label: string } {
  if (p.quantity === 0) return { cls: "bad", label: "Agotado" };
  if (p.quantity <= LOW_STOCK_THRESHOLD) return { cls: "warn", label: "Stock bajo" };
  return { cls: "good", label: "En stock" };
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [movingProduct, setMovingProduct] = useState<Product | null>(null);
  const [movingType, setMovingType] = useState<"IN" | "OUT">("IN");
  const [editingProduct, setEditingProduct] = useState<Product | null | "new">(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = () => {
    api.products
      .getAll()
      .then(setProducts)
      .catch(() => setError("No se pudieron cargar los productos."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = products.filter((p) => {
    if (filter === "low") return p.quantity > 0 && p.quantity <= LOW_STOCK_THRESHOLD;
    if (filter === "out") return p.quantity === 0;
    return true;
  });

  const removeProduct = async (id: string) => {
    try {
      await api.products.remove(id);
      setConfirmDeleteId(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar el producto.");
      setConfirmDeleteId(null);
    }
  };

  return (
    <Layout>
      <div className="page-head">
        <div className="page-title-row">
          <div className="page-title font-display">Productos</div>
          <div className="page-count">{products.length} producto{products.length === 1 ? "" : "s"}</div>
        </div>
        <div className="head-actions">
          <button className={`chip${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>Todos</button>
          <button className={`chip${filter === "low" ? " active" : ""}`} onClick={() => setFilter("low")}>Stock bajo</button>
          <button className={`chip${filter === "out" ? " active" : ""}`} onClick={() => setFilter("out")}>Agotado</button>
          <button className="btn-primary" onClick={() => setEditingProduct("new")}>
            <IconPlus size={14} style={{ color: "#0a0c13" }} />
            Agregar producto
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}
      {loading && !error && <div className="empty-note">Cargando productos…</div>}
      {!loading && !error && filtered.length === 0 && <div className="empty-note">No hay productos que coincidan con este filtro.</div>}

      <div className="grid">
        {filtered.map((p) => {
          const status = statusOf(p);
          return (
            <div className="p-card glass glass-hover" key={p.id}>
              <div className="p-top">
                <div>
                  <div className="p-name">{p.name}</div>
                  {p.description && <div className="p-cat">{p.description}</div>}
                </div>
                <div className={`status-dot ${status.cls}`}><span className="d" /> {status.label}</div>
              </div>
              <div className="p-mid">
                <span className="p-qty font-display">{p.quantity}</span>
                <span className="p-unit">unidades</span>
                <span className="p-price">{formatCOP(p.price)}</span>
              </div>

              {confirmDeleteId === p.id ? (
                <div className="p-actions">
                  <button className="btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
                  <button
                    className="move-btn"
                    style={{ flex: 1, background: "rgba(208,59,59,0.18)", color: "#ef6a6a", border: "1px solid rgba(208,59,59,0.4)" }}
                    onClick={() => removeProduct(p.id)}
                  >
                    Confirmar borrado
                  </button>
                </div>
              ) : (
                <div className="p-actions">
                  <button
                    className="move-btn in"
                    onClick={() => { setMovingType("IN"); setMovingProduct(p); }}
                  >
                    <IconArrowUp size={12} />Entrada
                  </button>
                  <button
                    className="move-btn out"
                    onClick={() => { setMovingType("OUT"); setMovingProduct(p); }}
                  >
                    <IconArrowDown size={12} />Salida
                  </button>
                  <button className="icon-sm" onClick={() => setEditingProduct(p)} aria-label="Editar">
                    <IconEdit size={13} style={{ color: "var(--text-secondary)" }} />
                  </button>
                  <button className="icon-sm" onClick={() => setConfirmDeleteId(p.id)} aria-label="Eliminar">
                    <IconTrash size={13} style={{ color: "var(--text-secondary)" }} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {movingProduct && (
        <TransactionPanelWithDefault
          product={movingProduct}
          defaultType={movingType}
          onClose={() => setMovingProduct(null)}
          onDone={() => { setMovingProduct(null); load(); }}
        />
      )}

      {editingProduct && (
        <ProductModal
          product={editingProduct === "new" ? null : editingProduct}
          onClose={() => setEditingProduct(null)}
          onDone={() => { setEditingProduct(null); load(); }}
        />
      )}
    </Layout>
  );
}

// Pequeño envoltorio para abrir el panel ya con el tipo de movimiento que el
// usuario eligió desde la tarjeta (Entrada o Salida), en vez de forzarlo a
// reelegir dentro del panel.
function TransactionPanelWithDefault(props: { product: Product; defaultType: "IN" | "OUT"; onClose: () => void; onDone: () => void }) {
  return (
    <TransactionPanel
      product={props.product}
      defaultType={props.defaultType}
      onClose={props.onClose}
      onDone={props.onDone}
      key={props.product.id + props.defaultType}
    />
  );
}
