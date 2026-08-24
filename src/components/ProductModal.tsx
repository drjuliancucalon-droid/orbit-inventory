import { useState } from "react";
import type { FormEvent } from "react";
import { IconClose } from "./Icons";
import { api, type Product, ApiError } from "../lib/api";

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
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [quantity, setQuantity] = useState(product ? String(product.quantity) : "0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const priceNum = Number(price);
    if (!name.trim() || Number.isNaN(priceNum)) {
      setError("Nombre y precio son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      if (product) {
        await api.products.update(product.id, { name, description, price: priceNum });
      } else {
        await api.products.create({ name, description, price: priceNum, quantity: Number(quantity) || 0 });
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
      <div className="panel-wrap" onClick={(e) => e.stopPropagation()}>
        <form className="slide-panel glass" onSubmit={submit}>
          <div className="panel-head-row">
            <div className="panel-title font-display" style={{ fontSize: 20 }}>
              {product ? "Editar producto" : "Nuevo producto"}
            </div>
            <button className="close-btn" onClick={onClose} type="button" aria-label="Cerrar">
              <IconClose size={14} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="field">
            <span className="field-label">Nombre</span>
            <div className="field-input">
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Teclado mecánico" />
            </div>
          </div>
          <div className="field">
            <span className="field-label">Descripción</span>
            <div className="field-input">
              <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" style={{ resize: "vertical" }} />
            </div>
          </div>
          <div className="field">
            <span className="field-label">Precio</span>
            <div className="field-input">
              <input required type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
            </div>
          </div>
          {!product && (
            <div className="field">
              <span className="field-label">Cantidad inicial</span>
              <div className="field-input">
                <input type="number" min="0" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
              </div>
            </div>
          )}

          <div className="spacer" />
          <button className="btn-confirm" type="submit" disabled={loading}>
            {loading ? "Guardando…" : product ? "Guardar cambios" : "Crear producto"}
          </button>
          <button className="btn-cancel" onClick={onClose} type="button">Cancelar</button>
        </form>
      </div>
    </div>
  );
}
