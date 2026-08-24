import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { LineChart } from "../components/charts/LineChart";
import { DonutChart } from "../components/charts/DonutChart";
import { BarList } from "../components/charts/BarList";
import { IconAlert } from "../components/Icons";
import { api, type DashboardMetrics, type TopProduct, type Transaction, type Product } from "../lib/api";
import { formatCOP, timeAgo } from "../lib/format";
import { useAuth } from "../lib/auth";

const LOW_STOCK_THRESHOLD = 10;

export function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.dashboard.metrics(), api.dashboard.topProducts(), api.dashboard.recentTransactions(), api.products.getAll()])
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

  const lowStock = products.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD);
  const outOfStock = products.filter((p) => p.quantity === 0);
  const lowNotOut = lowStock.length - outOfStock.length;
  const inStock = products.length - lowStock.length;

  const chronological = [...recent].reverse();
  let running = 0;
  const trendValues = chronological.map((t) => (running += t.quantity_change));

  const todayCutoff = Date.now() - 24 * 60 * 60 * 1000;
  const recentIn = recent.filter((t) => t.type === "IN" && new Date(t.created_at).getTime() >= todayCutoff).length;
  const recentOut = recent.filter((t) => t.type === "OUT" && new Date(t.created_at).getTime() >= todayCutoff).length;

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
          <div className="kpi-row">
            <div className="kpi-card hero glass">
              <div className="kpi-label">Valor total de inventario</div>
              <div className="kpi-value font-display">{formatCOP(metrics.total_value)}</div>
              <div className="kpi-sub">en {metrics.total_products} productos</div>
            </div>
            <div className="kpi-card glass">
              <div className="kpi-label">Productos activos</div>
              <div className="kpi-value font-display">{metrics.total_products}</div>
            </div>
            <div className="kpi-card warn glass">
              <div className="kpi-label"><IconAlert size={14} />Alertas de stock bajo</div>
              <div className="kpi-value font-display">{metrics.low_stock_products}</div>
              <div className="kpi-sub">requieren reposición</div>
            </div>
            <div className="kpi-card glass">
              <div className="kpi-label">Movimientos (24h)</div>
              <div className="kpi-value font-display">{metrics.recent_transactions}</div>
              {(recentIn > 0 || recentOut > 0) && (
                <div className="kpi-sub">{recentIn} entradas · {recentOut} salidas</div>
              )}
            </div>
          </div>

          <div className="chart-row">
            <div className="panel glass">
              <div className="panel-head">
                <div className="panel-title">Movimiento de stock</div>
                <div className="panel-note">Últimos {chronological.length} movimientos</div>
              </div>
              <LineChart values={trendValues} labelForLast={chronological.length ? `${trendValues[trendValues.length - 1] >= 0 ? "+" : ""}${trendValues[trendValues.length - 1]} uds` : undefined} />
            </div>

            <div className="panel glass">
              <div className="panel-head">
                <div className="panel-title">Estado del inventario</div>
              </div>
              <DonutChart
                centerLabel={String(products.length)}
                centerSub="productos"
                segments={[
                  { label: "En stock", value: inStock, color: "#0ca30c" },
                  { label: "Stock bajo", value: lowNotOut, color: "#fab219" },
                  { label: "Agotado", value: outOfStock.length, color: "#d03b3b" },
                ]}
              />
            </div>
          </div>

          <div className="bottom-row">
            <div className="panel glass">
              <div className="panel-head">
                <div className="panel-title">Más movimiento</div>
              </div>
              <BarList items={topProducts.slice(0, 4).map((p) => ({ label: p.name, value: p.transactions }))} />
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
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3ddc3d" strokeWidth={2.5}><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b3a6ff" strokeWidth={2.5}><path d="M12 5v14" /><path d="M5 12l7 7 7-7" /></svg>
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

          {lowStock.length > 0 && (
            <div className="alert-strip">
              <IconAlert size={18} style={{ color: "var(--status-warning)", flexShrink: 0 }} />
              <div className="alert-text">
                <b>{lowStock.length} producto{lowStock.length === 1 ? "" : "s"}</b> {lowStock.length === 1 ? "está" : "están"} por debajo del
                mínimo — {lowStock.slice(0, 2).map((p) => p.name).join(", ")}
                {lowStock.length > 2 ? ` y ${lowStock.length - 2} más.` : "."}
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
