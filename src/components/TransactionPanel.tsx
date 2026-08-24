import { useState } from "react";
import { IconClose, IconBox, IconMinus, IconPlus, IconArrowRight } from "./Icons";
import { api, type Product, ApiError } from "../lib/api";

// El flujo de "mover stock" rediseñado: entrada y salida son dos botones
// igual de visibles (nunca un valor por defecto escondido), con una vista
// previa del stock resultante ANTES de confirmar.
export function TransactionPanel({
  product,
  defaultType = "IN",
  onClose,
  onDone,
}: {
  product: Product;
  defaultType?: "IN" | "OUT";
  onClose: () => void;
  onDone: () => void;
}) {
  const [type, setType] = useState<"IN" | "OUT">(defaultType);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resulting = product.quantity + qty * (type === "IN" ? 1 : -1);
  const invalid = resulting < 0;

  const submit = async () => {
    if (invalid) return;
    setError("");
    setLoading(true);
    try {
      await api.transactions.create({ product_id: product.id, quantity_change: qty * (type === "IN" ? 1 : -1), type });
      await api.products.update(product.id, { quantity: resulting });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo registrar el movimiento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="panel-wrap" onClick={(e) => e.stopPropagation()}>
        <div className="slide-panel glass">
          <div className="panel-head-row">
            <div>
              <div className="panel-title font-display" style={{ fontSize: 20 }}>Mover stock</div>
              <div className="panel-note">Registra una entrada o salida</div>
            </div>
            <button className="close-btn" onClick={onClose} aria-label="Cerrar">
              <IconClose size={14} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>

          <div className="product-strip">
            <div className="p-icon"><IconBox size={18} style={{ color: "#a597ff" }} /></div>
            <div>
              <div className="p-name" style={{ fontSize: 14 }}>{product.name}</div>
              <div className="p-stock">Stock actual: {product.quantity} unidades</div>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <span className="field-label">Tipo de movimiento</span>
          <div className="segmented">
            <button className={`seg-btn${type === "IN" ? " sel-in" : ""}`} onClick={() => setType("IN")} type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3}><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></svg>
              Entrada
            </button>
            <button className={`seg-btn${type === "OUT" ? " sel-out" : ""}`} onClick={() => setType("OUT")} type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3}><path d="M12 5v14" /><path d="M5 12l7 7 7-7" /></svg>
              Salida
            </button>
          </div>

          <span className="field-label">Cantidad</span>
          <div className="stepper">
            <button className="step-btn" onClick={() => setQty((q) => Math.max(1, q - 1))} type="button" disabled={qty <= 1}>
              <IconMinus size={16} style={{ color: "var(--text-secondary)" }} />
            </button>
            <div className="step-val font-display">{qty}</div>
            <button className="step-btn" onClick={() => setQty((q) => q + 1)} type="button">
              <IconPlus size={16} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>

          <div className="preview">
            <span className="preview-num font-display">{product.quantity}</span>
            <span className="preview-arrow"><IconArrowRight size={16} /></span>
            <span className={`preview-num after font-display${invalid ? " bad" : ""}`}>{resulting} unidades</span>
          </div>
          {invalid && <div className="form-error">No hay suficiente stock para esta salida.</div>}

          <div className="spacer" />
          <button className="btn-confirm" onClick={submit} disabled={loading || invalid} type="button">
            {loading ? "Procesando…" : `Confirmar ${type === "IN" ? "entrada" : "salida"} de stock`}
          </button>
          <button className="btn-cancel" onClick={onClose} type="button">Cancelar</button>
        </div>
      </div>
    </div>
  );
}
