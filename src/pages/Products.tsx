import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { TransactionPanel } from "../components/TransactionPanel";
import { ProductModal } from "../components/ProductModal";
import { ImportModal } from "../components/ImportModal";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconDownload,
  IconUpload,
  IconSearch,
  IconTrendingUp,
  IconFileSpreadsheet,
} from "../components/Icons";
import { api, type Product, ApiError } from "../lib/api";
import { exportProductsToExcel, exportProductsToCSV } from "../lib/csvHelper";
import { formatCOP } from "../lib/format";

type StatusFilter = "all" | "in_stock" | "low" | "out";

function statusOf(p: Product): { cls: "good" | "warn" | "bad"; label: string } {
  const min = p.min_stock ?? 5;
  if (p.quantity === 0) return { cls: "bad", label: "Agotado" };
  if (p.quantity <= min) return { cls: "warn", label: `Stock bajo (≤${min})` };
  return { cls: "good", label: "En stock" };
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [movingProduct, setMovingProduct] = useState<Product | null>(null);
  const [movingType, setMovingType] = useState<"IN" | "OUT">("IN");
  const [editingProduct, setEditingProduct] = useState<Product | null | "new">(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState("");

  const load = () => {
    api.products
      .getAll()
      .then(setProducts)
      .catch(() => setError("No se pudieron cargar los productos."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Extraer lista única de categorías existentes
  const categories = Array.from(
    new Set(products.map((p) => p.category?.trim()).filter((c): c is string => Boolean(c)))
  );

  const filtered = products.filter((p) => {
    // Filtro por estado
    const min = p.min_stock ?? 5;
    if (statusFilter === "in_stock" && (p.quantity <= min || p.quantity === 0)) return false;
    if (statusFilter === "low" && (p.quantity === 0 || p.quantity > min)) return false;
    if (statusFilter === "out" && p.quantity > 0) return false;

    // Filtro por categoría
    if (categoryFilter !== "all" && p.category?.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }

    // Filtro por búsqueda
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      const matchCat = p.category?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchCat && !matchDesc) return false;
    }

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

  const handleExportExcel = () => {
    exportProductsToExcel(products, `inventario_orbit_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExportCSV = () => {
    exportProductsToCSV(products, `inventario_orbit_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleImportDone = (importedCount: number) => {
    setShowImportModal(false);
    load();
    setSuccessToast(`¡Se importaron exitosamente ${importedCount} productos!`);
    setTimeout(() => setSuccessToast(""), 4000);
  };

  const totalStockCount = filtered.reduce((acc, p) => acc + p.quantity, 0);
  const totalValuation = filtered.reduce((acc, p) => acc + p.price * p.quantity, 0);

  return (
    <Layout>
      <div className="page-head">
        <div className="page-title-row">
          <div className="page-title font-display">Inventario de Productos</div>
          <div className="page-count">
            {products.length} producto{products.length === 1 ? "" : "s"} · {totalStockCount} unidades ({formatCOP(totalValuation)})
          </div>
        </div>

        <div className="head-actions">
          <button
            className="btn-ghost"
            onClick={handleExportExcel}
            disabled={products.length === 0}
            title="Exportar catálogo completo a formato Microsoft Excel (.XLSX)"
          >
            <IconFileSpreadsheet size={14} style={{ color: "#10b981" }} />
            Exportar Excel (.xlsx)
          </button>

          <button
            className="btn-ghost"
            onClick={handleExportCSV}
            disabled={products.length === 0}
            title="Exportar catálogo a CSV"
          >
            <IconDownload size={14} />
            Exportar CSV
          </button>

          <button
            className="btn-ghost"
            onClick={() => setShowImportModal(true)}
            title="Cargar o rellenar productos de forma masiva"
          >
            <IconUpload size={14} />
            Cargar / Importar
          </button>

          <button className="btn-primary" onClick={() => setEditingProduct("new")}>
            <IconPlus size={14} style={{ color: "#0a0c13" }} />
            Nuevo producto
          </button>
        </div>
      </div>

      {successToast && (
        <div className="toast-banner">
          {successToast}
        </div>
      )}

      {error && <div className="form-error">{error}</div>}

      {/* Barra de Búsqueda y Filtros */}
      <div className="filters-bar glass">
        <div className="search-box">
          <IconSearch size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, SKU, código de barras o categoría…"
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")} type="button">
              ×
            </button>
          )}
        </div>

        <div className="filter-chips-row">
          <div className="chips-group">
            <span className="chips-label">Estado:</span>
            <button
              className={`chip${statusFilter === "all" ? " active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              Todos ({products.length})
            </button>
            <button
              className={`chip${statusFilter === "in_stock" ? " active" : ""}`}
              onClick={() => setStatusFilter("in_stock")}
            >
              En stock
            </button>
            <button
              className={`chip${statusFilter === "low" ? " active" : ""}`}
              onClick={() => setStatusFilter("low")}
            >
              Stock bajo
            </button>
            <button
              className={`chip${statusFilter === "out" ? " active" : ""}`}
              onClick={() => setStatusFilter("out")}
            >
              Agotado
            </button>
          </div>

          {categories.length > 0 && (
            <div className="chips-group">
              <span className="chips-label">Categoría:</span>
              <button
                className={`chip${categoryFilter === "all" ? " active" : ""}`}
                onClick={() => setCategoryFilter("all")}
              >
                Todas
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  className={`chip${categoryFilter === c ? " active" : ""}`}
                  onClick={() => setCategoryFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && !error && <div className="empty-note">Cargando catálogo…</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state-box glass">
          <div className="empty-title">No se encontraron productos</div>
          <div className="empty-sub">
            {search || statusFilter !== "all" || categoryFilter !== "all"
              ? "Prueba cambiando o restableciendo los filtros de búsqueda."
              : "Comienza agregando tu primer producto o importa tu inventario desde Excel."}
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn-primary" onClick={() => setEditingProduct("new")}>
              <IconPlus size={14} style={{ color: "#0a0c13" }} />
              Agregar producto
            </button>
            <button className="btn-ghost" onClick={() => setShowImportModal(true)}>
              <IconUpload size={14} />
              Importar CSV
            </button>
          </div>
        </div>
      )}

      {/* Grid de Productos */}
      <div className="grid">
        {filtered.map((p) => {
          const status = statusOf(p);
          const cost = p.cost_price ?? 0;
          const price = p.price ?? 0;
          const profitPerUnit = Math.max(0, price - cost);
          const marginPct = price > 0 && cost > 0 ? Math.round((profitPerUnit / price) * 100) : 0;
          const totalVal = p.quantity * price;

          return (
            <div className="p-card glass glass-hover" key={p.id}>
              <div className="p-top">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="p-tags-row">
                    {p.sku && <span className="sku-badge">{p.sku}</span>}
                    {p.category && <span className="category-badge">{p.category}</span>}
                  </div>
                  <div className="p-name">{p.name}</div>
                  {p.description && <div className="p-cat">{p.description}</div>}
                </div>
                <div className={`status-dot ${status.cls}`}>
                  <span className="d" /> {status.label}
                </div>
              </div>

              {/* Cantidad y Precios */}
              <div className="p-mid">
                <div>
                  <span className="p-qty font-display">{p.quantity}</span>
                  <span className="p-unit">uds</span>
                  {p.min_stock !== undefined && (
                    <span className="p-min-sub">(mín: {p.min_stock})</span>
                  )}
                </div>
                <div className="p-price-block">
                  <div className="p-price font-display">{formatCOP(p.price)}</div>
                  {cost > 0 && (
                    <div className="p-cost-sub">
                      Costo: {formatCOP(cost)}
                    </div>
                  )}
                </div>
              </div>

              {/* Barra de Rentabilidad & Valor */}
              <div className="p-financial-strip">
                <div className="financial-col">
                  <span className="fin-label">Valor en stock</span>
                  <span className="fin-val font-display">{formatCOP(totalVal)}</span>
                </div>
                {cost > 0 && (
                  <div className="financial-col right">
                    <span className="fin-label">Margen Bruto</span>
                    <span className="margin-indicator">
                      <IconTrendingUp size={11} /> {marginPct}% ({formatCOP(profitPerUnit)}/u)
                    </span>
                  </div>
                )}
              </div>

              {confirmDeleteId === p.id ? (
                <div className="p-actions">
                  <button
                    className="btn-ghost"
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="move-btn"
                    style={{
                      flex: 1,
                      background: "rgba(208,59,59,0.18)",
                      color: "#ef6a6a",
                      border: "1px solid rgba(208,59,59,0.4)",
                    }}
                    onClick={() => removeProduct(p.id)}
                  >
                    Confirmar borrado
                  </button>
                </div>
              ) : (
                <div className="p-actions">
                  <button
                    className="move-btn in"
                    onClick={() => {
                      setMovingType("IN");
                      setMovingProduct(p);
                    }}
                  >
                    <IconArrowUp size={12} /> Entrada
                  </button>
                  <button
                    className="move-btn out"
                    onClick={() => {
                      setMovingType("OUT");
                      setMovingProduct(p);
                    }}
                  >
                    <IconArrowDown size={12} /> Salida
                  </button>
                  <button
                    className="icon-sm"
                    onClick={() => setEditingProduct(p)}
                    aria-label="Editar"
                    title="Editar producto"
                  >
                    <IconEdit size={13} style={{ color: "var(--text-secondary)" }} />
                  </button>
                  <button
                    className="icon-sm"
                    onClick={() => setConfirmDeleteId(p.id)}
                    aria-label="Eliminar"
                    title="Eliminar producto"
                  >
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
          onDone={() => {
            setMovingProduct(null);
            load();
          }}
        />
      )}

      {editingProduct && (
        <ProductModal
          product={editingProduct === "new" ? null : editingProduct}
          onClose={() => setEditingProduct(null)}
          onDone={() => {
            setEditingProduct(null);
            load();
          }}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onDone={handleImportDone}
        />
      )}
    </Layout>
  );
}

function TransactionPanelWithDefault(props: {
  product: Product;
  defaultType: "IN" | "OUT";
  onClose: () => void;
  onDone: () => void;
}) {
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
