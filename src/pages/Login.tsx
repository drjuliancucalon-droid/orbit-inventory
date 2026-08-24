import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OrbitBackground } from "../components/OrbitBackground";
import { OrbitLogo, IconMail, IconLock, IconRetail, IconManufacturing, IconDistribution } from "../components/Icons";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <OrbitBackground />
      <div className="auth-content">
        <div className="pitch">
          <div className="brand">
            <OrbitLogo size={28} />
            <span className="brand-name font-display" style={{ fontSize: 20 }}>Orbit</span>
          </div>
          <div className="pitch-title font-display">
            Tu inventario,
            <br />
            siempre <em>en órbita</em>.
          </div>
          <div className="pitch-sub">
            Control de stock, compras y movimientos en un solo lugar — para retail, manufactura, distribución o
            cualquier negocio que maneje inventario.
          </div>
          <div className="trust-label">Hecho para</div>
          <div className="trust-row">
            <div className="trust-chip"><IconRetail size={14} />Retail</div>
            <div className="trust-chip"><IconManufacturing size={14} />Manufactura</div>
            <div className="trust-chip"><IconDistribution size={14} />Distribución</div>
          </div>
        </div>

        <form className="auth-card" onSubmit={onSubmit}>
          <div className="card-title font-display">Iniciar sesión</div>
          <div className="card-sub">Bienvenido de nuevo a tu espacio de trabajo</div>

          {error && <div className="form-error">{error}</div>}

          <div className="field">
            <span className="field-label">Correo electrónico</span>
            <div className="field-input">
              <IconMail size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@negocio.com"
                autoComplete="email"
              />
            </div>
          </div>
          <div className="field">
            <span className="field-label">Contraseña</span>
            <div className="field-input">
              <IconLock size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: 13, fontSize: 14 }}>
            {loading ? "Ingresando…" : "Iniciar sesión"}
          </button>

          <div className="foot-note">
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
