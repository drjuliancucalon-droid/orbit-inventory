// Fondo inmersivo animado: blobs de gradiente en movimiento lento + anillos
// girando + textura de grano sutil. Puramente decorativo (aria-hidden).
export function OrbitBackground({ rings = true }: { rings?: boolean }) {
  return (
    <div className="orbit-bg" aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      {rings && (
        <svg className="orbit-ring" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="190" stroke="#8b7cfa" strokeWidth="1" />
          <circle cx="200" cy="200" r="150" stroke="#2dd4c8" strokeWidth="1" />
          <circle cx="200" cy="200" r="110" stroke="#e8598f" strokeWidth="1" />
        </svg>
      )}
      <div className="noise" />
    </div>
  );
}
