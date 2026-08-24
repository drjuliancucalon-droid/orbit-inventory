import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OrbitBackground } from "../components/OrbitBackground";
import { OrbitLogo, IconMail, IconLock, IconRetail } from "../components/Icons";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [organizationName, setOrganizationName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await register({ email, password, full_name: fullName, organization_name: organizationName });
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear la cuenta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <OrbitBackground />
      <div className="auth-content" style={{ justifyContent: "center" }}>
        <form className="auth-card" onSubmit={onSubmit}>
          <div className="brand" style={{ marginBottom: 24 }}>
            <OrbitLogo size={26} />
            <span className="brand-name font-display">Orbit</span>
          </div>
          <div className="card-title font-display">Crea tu espacio de trabajo</div>
          <div className="card-sub">Empieza a llevar tu inventario en órbita</div>

          {error && <div className="form-error">{error}</div>}

          <div className="field">
            <span className="field-label">Nombre del negocio</span>
            <div className="field-input">
              <IconRetail size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <input required value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="Ej. Ferretería El Tornillo" autoComplete="organization" />
            </div>
          </div>
          <div className="field">
            <span className="field-label">Nombre completo</span>
            <div className="field-input">
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre" autoComplete="name" />
            </div>
          </div>
          <div className="field">
            <span className="field-label">Correo electrónico</span>
            <div className="field-input">
              <IconMail size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@negocio.com" autoComplete="email" />
            </div>
          </div>
          <div className="field">
            <span className="field-label">Contraseña</span>
            <div className="field-input">
              <IconLock size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: 13, fontSize: 14 }}>
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>

          <div className="foot-note">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
