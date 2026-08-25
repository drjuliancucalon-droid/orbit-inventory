type Segment = { label: string; value: number; color: string };

// Dona con leyenda — proporciones calculadas a partir de los valores reales.
// Los colores de status se le pasan desde afuera (nunca decorativos aquí).
export function DonutChart({ segments, centerLabel, centerSub }: { segments: Segment[]; centerLabel: string; centerSub: string }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const gap = 3; // separación visual entre segmentos, en unidades de arco

  const arcs = segments.reduce<{
    arcList: Array<Segment & { length: number; offset: number; pct: number }>;
    offset: number;
  }>(
    (acc, s) => {
      const raw = total > 0 ? (s.value / total) * circumference : 0;
      const length = Math.max(raw - gap, 0);
      const arc = { ...s, length, offset: -acc.offset, pct: total > 0 ? Math.round((s.value / total) * 100) : 0 };
      return {
        arcList: [...acc.arcList, arc],
        offset: acc.offset + raw,
      };
    },
    { arcList: [], offset: 0 }
  ).arcList;

  return (
    <div className="donut-wrap">
      <svg width="150" height="150" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} fill="none" stroke="#1c1e29" strokeWidth="20" />
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx="90"
            cy="90"
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth="20"
            strokeDasharray={`${a.length} ${circumference}`}
            strokeDashoffset={a.offset}
            transform="rotate(-90 90 90)"
            strokeLinecap="round"
          />
        ))}
        <text x="90" y="85" textAnchor="middle" fontSize="26" fontWeight="700" fill="#f5f6fa" fontFamily="Space Grotesk, sans-serif">
          {centerLabel}
        </text>
        <text x="90" y="104" textAnchor="middle" fontSize="10.5" fill="#6b7191" fontFamily="Manrope, sans-serif">
          {centerSub}
        </text>
      </svg>
      <div className="legend">
        {arcs.map((a, i) => (
          <div className="legend-row" key={i}>
            <span className="legend-dot" style={{ background: a.color }} />
            {a.label}
            <span className="legend-val">{a.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
