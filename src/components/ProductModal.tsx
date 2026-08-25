import { useState } from "react";
import type { FormEvent } from "react";
import { IconClose, IconTrendingUp } from "./Icons";
import { api, type Product, ApiError } from "../lib/api";
import { formatCOP } from "../lib/format";

export function ProductModal({
  product,
  onClose,
  onDone,
}: {
  product: Product | null; // null = crear nuevo
  onClose: () => void;
  onDone: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [costPrice, setCostPrice] = useState(product?.cost_price !== undefined ? String(product.cost_price) : "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [minStock, setMinStock] = useState(product?.min_stock !== undefined ? String(product.min_stock) : "5");
  const [quantity, setQuantity] = useState(product ? String(product.quantity) : "0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Cálculos de margen dinámicos
  const costNum = Number(costPrice) || 0;
  const priceNum = Number(price) || 0;
  const profit = priceNum - costNum;
  const marginPct = priceNum > 0 && costNum > 0 ? Math.round((profit / priceNum) * 100) : 0;
  const markupPct = costNum > 0 ? Math.round((profit / costNum) * 100) : 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || Number.isNaN(priceNum) || priceNum < 0) {
      setError("El nombre y el precio de venta son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      if (product) {
        await api.products.update(product.id, {
          name,
          sku: sku.trim() || undefined,
          category: category.trim() || undefined,
          description: description.trim() || undefined,
          cost_price: costNum >= 0 ? costNum : 0,
          price: priceNum,
          min_stock: Number(minStock) >= 0 ? Number(minStock) : 5,
        });
      } else {
        await api.products.create({
          name,
          sku: sku.trim() || undefined,
          category: category.trim() || undefined,
          description: description.trim() || undefined,
          cost_price: costNum >= 0 ? costNum : 0,
          price: priceNum,
          quantity: Number(quantity) || 0,
          min_stock: Number(minStock) >= 0 ? Number(minStock) : 5,
        });
      }
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar el producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay-backdrop center" onClick={onClose}>
      <div className="panel-wrap" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
        <form className="slide-panel glass" onSubmit={submit}>
          <div className="panel-head-row">
            <div>
              <div className="panel-title font-display" style={{ fontSize: 20 }}>
                {product ? "Editar producto" : "Nuevo producto"}
              </div>
              <div className="page-sub" style={{ marginTop: 2 }}>
                {product ? "Actualiza precios, costos y parámetros de stock" : "Registra un nuevo artículo en tu catálogo"}
              </div>
            </div>
            <button className="close-btn" onClick={onClose} type="button" aria-label="Cerrar">
              <IconClose size={14} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>

          {error && <div className="form-error" style={{ marginTop: 12 }}>{error}</div>}

          {/* Nombre y SKU */}
          <div className="field-grid-2" style={{ marginTop: 12 }}>
            <div className="field" style={{ flex: 1.6 }}>
              <span className="field-label">Nombre del producto *</span>
              <div className="field-input">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Martillo de uña 16oz"
                />
              </div>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <span className="field-label">SKU / Código</span>
              <div className="field-input">
                <input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ej. MRT-01"
                />
              </div>
            </div>
          </div>

          {/* Categoría y Descripción */}
          <div className="field-grid-2">
            <div className="field" style={{ flex: 1 }}>
              <span className="field-label">Categoría</span>
              <div className="field-input">
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ej. Herramientas, Pinturas..."
                />
              </div>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <span className="field-label">Stock Mínimo (Alerta)</span>
              <div className="field-input">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  placeholder="5"
                />
              </div>
            </div>
          </div>

          <div className="field">
            <span className="field-label">Descripción / Detalles</span>
            <div className="field-input">
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Especificaciones o notas adicionales"
                style={{ resize: "vertical" }}
              />
            </div>
          </div>

          {/* Costo vs Precio de Venta */}
          <div className="field-grid-2">
            <div className="field" style={{ flex: 1 }}>
              <span className="field-label">Costo de compra (COP)</span>
              <div className="field-input">
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <span className="field-label">Precio de venta (COP) *</span>
              <div className="field-input">
                <input
                  required
                  type="number"
                  min="0"
                  step="100"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Indicador de Margen en tiempo real */}
          {priceNum > 0 && (
            <div className="margin-preview-card">
              <div className="margin-preview-head">
                <div className="margin-preview-title">
                  <IconTrendingUp size={14} style={{ color: "var(--accent)" }} />
                  Análisis de Rentabilidad
                </div>
                <div className={`margin-badge ${marginPct >= 30 ? "good" : marginPct > 0 ? "normal" : "warn"}`}>
                  Margen: {marginPct}%
                </div>
              </div>
              <div className="margin-preview-grid">
                <div>
                  <div className="margin-label">Ganancia Bruta / ud</div>
                  <div className="margin-val font-display">{formatCOP(Math.max(0, profit))}</div>
                </div>
                <div>
                  <div className="margin-label">Margen s/ Venta</div>
                  <div className="margin-val">{marginPct}%</div>
                </div>
                <div>
                  <div className="margin-label">Markup s/ Costo</div>
                  <div className="margin-val">{costNum > 0 ? `+${markupPct}%` : "—"}</div>
                </div>
              </div>
            </div>
          )}

          {!product && (
            <div className="field" style={{ marginTop: 10 }}>
              <span className="field-label">Cantidad de Stock Inicial</span>
              <div className="field-input">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <div className="spacer" style={{ minHeight: 16 }} />
          <button className="btn-confirm" type="submit" disabled={loading}>
            {loading ? "Guardando…" : product ? "Guardar cambios" : "Crear producto"}
          </button>
          <button className="btn-cancel" onClick={onClose} type="button">
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
