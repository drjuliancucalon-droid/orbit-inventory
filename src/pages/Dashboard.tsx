import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { LineChart } from "../components/charts/LineChart";
import { DonutChart } from "../components/charts/DonutChart";
import { BarList } from "../components/charts/BarList";
import { IconAlert, IconTrendingUp } from "../components/Icons";
import { api, type DashboardMetrics, type TopProduct, type Transaction, type Product } from "../lib/api";
import { formatCOP, timeAgo } from "../lib/format";
import { useAuth } from "../lib/auth";

export function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.dashboard.metrics(),
      api.dashboard.topProducts(),
      api.dashboard.recentTransactions(),
      api.products.getAll(),
    ])
      .then(([m, t, r, p]) => {
        setMetrics(m);
        setTopProducts(t);
        setRecent(r);
        setProducts(p);
      })
      .catch(() => setError("No se pudo cargar el panel. Intenta recargar la página."))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.full_name?.split(" ")[0] ?? "";
  const today = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

  // Cálculo de alertas según min_stock individual de cada producto
  const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= (p.min_stock ?? 5));
  const outOfStock = products.filter((p) => p.quantity === 0);
  const inStock = products.filter((p) => p.quantity > (p.min_stock ?? 5));

  const chronological = [...recent].reverse();
  const trendValues = chronological.reduce<number[]>((acc, t) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
    acc.push(prev + t.quantity_change);
    return acc;
  }, []);

  const recentIn = recent.filter((t) => t.type === "IN").length;
  const recentOut = recent.filter((t) => t.type === "OUT").length;


  return (
    <Layout>
      <div className="page-head">
        <div>
          <div className="page-title font-display">{firstName ? `Buenas, ${firstName}` : "Panel"}</div>
          <div className="page-sub">Esto es lo que está pasando en tu inventario</div>
        </div>
        <div className="page-date" style={{ textTransform: "capitalize" }}>{today}</div>
      </div>

      {error && <div className="form-error">{error}</div>}
      {loading && !error && <div className="empty-note">Cargando datos reales de tu inventario…</div>}

      {!loading && !error && metrics && (
        <>
          {/* Fila de KPIs Financieros y Operativos */}
          <div className="kpi-row">
            <div className="kpi-card hero glass">
              <div className="kpi-label">Valor total de inventario (PVP)</div>
              <div className="kpi-value font-display">{formatCOP(metrics.total_value)}</div>
              <div className="kpi-sub">
                Costo inversión: {formatCOP(metrics.total_cost_value ?? 0)}
              </div>
            </div>

            <div className="kpi-card glass">
              <div className="kpi-label">
                <IconTrendingUp size={14} style={{ color: "var(--status-good-text)" }} />
                Margen Bruto Proyectado
              </div>
              <div className="kpi-value font-display" style={{ color: "var(--status-good-text)" }}>
                {metrics.avg_margin_pct ?? 0}%
              </div>
              <div className="kpi-sub">
                Utilidad potencial: {formatCOP(metrics.potential_profit ?? 0)}
              </div>
            </div>

            <div className="kpi-card warn glass">
              <div className="kpi-label">
                <IconAlert size={14} /> Alertas de Stock Bajo
              </div>
              <div className="kpi-value font-display">{lowStock.length + outOfStock.length}</div>
              <div className="kpi-sub">
                {outOfStock.length > 0 ? `${outOfStock.length} agotados · ` : ""}
                {lowStock.length} por reponer
              </div>
            </div>

            <div className="kpi-card glass">
              <div className="kpi-label">Movimientos (24h)</div>
              <div className="kpi-value font-display">{metrics.recent_transactions}</div>
              {(recentIn > 0 || recentOut > 0) ? (
                <div className="kpi-sub">{recentIn} entradas · {recentOut} salidas</div>
              ) : (
                <div className="kpi-sub">{metrics.total_products} productos registrados</div>
              )}
            </div>
          </div>

          <div className="chart-row">
            <div className="panel glass">
              <div className="panel-head">
                <div className="panel-title">Flujo de movimientos de stock</div>
                <div className="panel-note">Últimos {chronological.length} movimientos</div>
              </div>
              <LineChart
                values={trendValues}
                labelForLast={
                  chronological.length
                    ? `${trendValues[trendValues.length - 1] >= 0 ? "+" : ""}${trendValues[trendValues.length - 1]} uds`
                    : undefined
                }
              />
            </div>

            <div className="panel glass">
              <div className="panel-head">
                <div className="panel-title">Estado de abastecimiento</div>
              </div>
              <DonutChart
                centerLabel={String(products.length)}
                centerSub="artículos"
                segments={[
                  { label: "En stock", value: inStock.length, color: "#0ca30c" },
                  { label: "Stock bajo", value: lowStock.length, color: "#fab219" },
                  { label: "Agotado", value: outOfStock.length, color: "#d03b3b" },
                ]}
              />
            </div>
          </div>

          <div className="bottom-row">
            <div className="panel glass">
              <div className="panel-head">
                <div className="panel-title">Productos con mayor rotación</div>
              </div>
              <BarList
                items={topProducts.slice(0, 4).map((p) => ({
                  label: p.name,
                  value: p.transactions,
                }))}
              />
            </div>

            <div className="panel glass">
              <div className="panel-head">
                <div className="panel-title">Actividad reciente</div>
              </div>
              {recent.length === 0 ? (
                <div className="empty-note">Todavía no hay movimientos registrados.</div>
              ) : (
                <div className="feed">
                  {recent.slice(0, 6).map((t) => (
                    <div className="feed-row" key={t.id}>
                      <div className={`feed-icon ${t.type === "IN" ? "in" : "out"}`}>
                        {t.type === "IN" ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3ddc3d" strokeWidth={2.5}>
                            <path d="M12 19V5" />
                            <path d="M5 12l7-7 7 7" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b3a6ff" strokeWidth={2.5}>
                            <path d="M12 5v14" />
                            <path d="M5 12l7 7 7-7" />
                          </svg>
                        )}
                      </div>
                      <div className="feed-main">
                        <div className="feed-title">{t.product_name ?? "Producto"}</div>
                        <div className="feed-meta">{timeAgo(t.created_at)}</div>
                      </div>
                      <div className={`pill ${t.type === "IN" ? "in" : "out"}`}>
                        {t.type === "IN" ? "+" : "−"}{Math.abs(t.quantity_change)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(lowStock.length > 0 || outOfStock.length > 0) && (
            <div className="alert-strip">
              <IconAlert size={18} style={{ color: "var(--status-warning)", flexShrink: 0 }} />
              <div className="alert-text">
                <b>{lowStock.length + outOfStock.length} producto{lowStock.length + outOfStock.length === 1 ? "" : "s"}</b>{" "}
                requieren atención —{" "}
                {[...outOfStock, ...lowStock].slice(0, 2).map((p) => p.name).join(", ")}
                {lowStock.length + outOfStock.length > 2
                  ? ` y ${lowStock.length + outOfStock.length - 2} más.`
                  : "."}
              </div>
              <Link to="/products" className="alert-cta" style={{ textDecoration: "none" }}>
                Ver productos
              </Link>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
