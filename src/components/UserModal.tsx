import { useState } from "react";
import type { FormEvent } from "react";
import { IconClose } from "./Icons";
import { api, ApiError } from "../lib/api";

export function UserModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim() || !email.trim()) {
      setError("Nombre y correo son obligatorios.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await api.users.create({ email: email.trim(), password, full_name: fullName.trim(), org_role: role });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el usuario.");
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
              Nuevo usuario
            </div>
            <button className="close-btn" onClick={onClose} type="button" aria-label="Cerrar">
              <IconClose size={14} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="field">
            <span className="field-label">Nombre completo</span>
            <div className="field-input">
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nombre y apellido" autoComplete="name" />
            </div>
          </div>
          <div className="field">
            <span className="field-label">Correo</span>
            <div className="field-input">
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@negocio.com" autoComplete="email" />
            </div>
          </div>
          <div className="field">
            <span className="field-label">Contraseña</span>
            <div className="field-input">
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
            </div>
          </div>
          <div className="field">
            <span className="field-label">Rol</span>
            <div className="field-input">
              <select value={role} onChange={(e) => setRole(e.target.value as "admin" | "staff")} style={{ width: "100%", background: "transparent", border: "none", color: "inherit" }}>
                <option value="staff">Staff — usa el sistema, sin administrar</option>
                <option value="admin">Admin — también puede crear usuarios</option>
              </select>
            </div>
          </div>

          <div className="spacer" />
          <button className="btn-confirm" type="submit" disabled={loading}>
            {loading ? "Creando…" : "Crear usuario"}
          </button>
          <button className="btn-cancel" onClick={onClose} type="button">Cancelar</button>
        </form>
      </div>
    </div>
  );
}
