// Colores categóricos, en orden fijo (nunca ciclados), tomados de la paleta
// validada: azul, aqua, magenta, naranja — separados del acento de marca.
const SERIES_COLORS = ["#3987e5", "#199e70", "#d55181", "#d95926"];

type Item = { label: string; value: number };

export function BarList({ items }: { items: Item[] }) {
  if (!items.length) {
    return <div className="empty-note">Todavía no hay movimientos suficientes para este ranking.</div>;
  }
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="bar-list">
      {items.map((item, i) => (
        <div className="bar-item" key={item.label}>
          <div className="bar-label" title={item.label}>{item.label}</div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${Math.max((item.value / max) * 100, 4)}%`, background: SERIES_COLORS[i % SERIES_COLORS.length] }}
            />
          </div>
          <div className="bar-val">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
