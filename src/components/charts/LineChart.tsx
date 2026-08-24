// Gráfico de línea con relleno de gradiente, calculado a partir de datos
// reales (no hardcoded). Un solo eje, una sola serie — sin doble eje.
export function LineChart({ values, labelForLast }: { values: number[]; labelForLast?: string }) {
  const width = 600;
  const height = 190;
  const padLeft = 8;
  const padRight = 20;
  const top = 16;
  const bottom = 178;

  if (!values.length) {
    return <div className="empty-note">Aún no hay suficientes movimientos para graficar una tendencia.</div>;
  }

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const usableWidth = width - padLeft - padRight;
  const step = values.length > 1 ? usableWidth / (values.length - 1) : 0;

  const points = values.map((v, i) => {
    const x = padLeft + step * i;
    const y = bottom - ((v - min) / range) * (bottom - top);
    return [x, y] as const;
  });

  const polyline = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath =
    `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)} ` +
    points.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(" ") +
    ` L${points[points.length - 1][0].toFixed(1)},${bottom} L${points[0][0].toFixed(1)},${bottom} Z`;

  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", flex: 1, minHeight: 140 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="orbitLineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3987e5" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#3987e5" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={padLeft} y1={bottom} x2={width - padRight} y2={bottom} stroke="#2c2c2a" strokeWidth="1" />
      <line x1={padLeft} y1={(top + bottom) / 2} x2={width - padRight} y2={(top + bottom) / 2} stroke="#22232f" strokeWidth="1" />
      <line x1={padLeft} y1={top} x2={width - padRight} y2={top} stroke="#22232f" strokeWidth="1" />
      <path d={areaPath} fill="url(#orbitLineFill)" />
      <polyline points={polyline} fill="none" stroke="#3987e5" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="4.5" fill="#0a0c13" stroke="#3987e5" strokeWidth="2.5" />
      {labelForLast && (
        <g>
          <rect x={Math.min(Math.max(lastX - 52, padLeft), width - padRight - 104)} y={Math.max(lastY - 42, 4)} width="104" height="30" rx="8" fill="#12141f" stroke="rgba(255,255,255,0.14)" />
          <text x={Math.min(Math.max(lastX, padLeft + 52), width - padRight - 52)} y={Math.max(lastY - 42, 4) + 19} textAnchor="middle" fontSize="11" fill="#f5f6fa" fontFamily="Manrope, sans-serif" fontWeight="700">
            {labelForLast}
          </text>
        </g>
      )}
    </svg>
  );
}
