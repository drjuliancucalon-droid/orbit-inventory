import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { OrbitBackground } from "./OrbitBackground";
import { OrbitLogo, IconDashboard, IconBox, IconSwap, IconChart, IconGear, IconBell, IconSearch, IconChevronDown } from "./Icons";
import { useAuth } from "../lib/auth";

const NAV_ITEMS = [
  { to: "/", label: "Panel", icon: IconDashboard },
  { to: "/products", label: "Productos", icon: IconBox },
  { to: "/products", label: "Transacciones", icon: IconSwap, disabled: true },
  { to: "/products", label: "Reportes", icon: IconChart, disabled: true },
  { to: "/settings", label: "Configuración", icon: IconGear },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <>
      <OrbitBackground />
      <div className="app-shell">
        <aside className="sidebar glass">
          <div className="brand">
            <OrbitLogo />
            <span className="brand-name font-display">Orbit</span>
          </div>

          <nav className="nav">
            {NAV_ITEMS.map((item, i) => {
              const Icon = item.icon;
              const active = item.to === location.pathname && !item.disabled;
              const content = (
                <>
                  <Icon size={18} />
                  {item.label}
                </>
              );
              return item.disabled ? (
                <div key={i} className="nav-item" style={{ opacity: 0.45, cursor: "default" }} title="Próximamente">
                  {content}
                </div>
              ) : (
                <Link key={i} to={item.to} className={`nav-item${active ? " active" : ""}`}>
                  {content}
                </Link>
              );
            })}
          </nav>

          <div className="nav-spacer" />

          <div className="workspace">
            <div className="workspace-badge font-display">FT</div>
            <div className="workspace-text">
              <div className="name">Ferretería El Tornillo</div>
              <div className="role">Plan Negocios</div>
            </div>
            <IconChevronDown size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          </div>
          <button className="logout-link" onClick={() => logout()} style={{ textAlign: "left" }}>
            Cerrar sesión
          </button>
        </aside>

        <div className="main">
          <div className="topbar">
            <div className="search">
              <IconSearch size={15} />
              <input placeholder="Buscar productos, movimientos…" />
            </div>
            <div className="topbar-spacer" />
            <div className="icon-btn">
              <IconBell size={17} style={{ color: "var(--text-secondary)" }} />
              <div className="badge-dot">3</div>
            </div>
            <div className="avatar font-display">{user ? initials(user.full_name) : "…"}</div>
          </div>

          <div className="content">{children}</div>
        </div>
      </div>
    </>
  );
}
