import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { UserModal } from "../components/UserModal";
import { IconPlus } from "../components/Icons";
import { api, type TeamUser } from "../lib/api";
import { useAuth } from "../lib/auth";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Settings() {
  const { user } = useAuth();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const isAdmin = user?.org_role === "admin";

  const load = () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.users
      .getAll()
      .then(setUsers)
      .catch(() => setError("No se pudo cargar el equipo."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [isAdmin]);

  return (
    <Layout>
      <div className="page-head">
        <div>
          <div className="page-title font-display">Configuración</div>
          <div className="page-sub">Tu negocio y quién tiene acceso</div>
        </div>
      </div>

      {!isAdmin ? (
        <div className="panel glass">
          <div className="empty-note">Esta sección es solo para administradores de tu negocio.</div>
        </div>
      ) : (
        <div className="panel glass">
          <div className="panel-head">
            <div className="panel-title">Equipo</div>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <IconPlus size={14} style={{ color: "#0a0c13" }} />
              Agregar usuario
            </button>
          </div>

          {error && <div className="form-error">{error}</div>}
          {loading && !error && <div className="empty-note">Cargando equipo…</div>}
          {!loading && !error && users.length === 0 && (
            <div className="empty-note">Todavía eres el único usuario de este negocio.</div>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="feed">
              {users.map((u) => (
                <div className="feed-row" key={u.id}>
                  <div className="avatar font-display" style={{ width: 34, height: 34, fontSize: 13 }}>
                    {initials(u.full_name)}
                  </div>
                  <div className="feed-main">
                    <div className="feed-title">{u.full_name}</div>
                    <div className="feed-meta">{u.email}</div>
                  </div>
                  <div className={`pill ${u.org_role === "admin" ? "in" : "out"}`}>
                    {u.org_role === "admin" ? "Admin" : "Staff"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <UserModal
          onClose={() => setShowModal(false)}
          onDone={() => {
            setShowModal(false);
            load();
          }}
        />
      )}
    </Layout>
  );
}
