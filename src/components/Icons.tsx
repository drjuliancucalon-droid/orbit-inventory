// Iconos SVG trazados a mano (stroke-based), consistentes con el concepto
// visual de Orbit. Nunca emoji.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, ...props }: IconProps) {
  return { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, ...props };
}

export function OrbitLogo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="2.6" fill="#a597ff" />
      <ellipse cx="12" cy="12" rx="10" ry="4.4" stroke="#8b7cfa" strokeWidth="1.4" transform="rotate(-24 12 12)" />
      <circle cx="20.2" cy="8.6" r="1.6" fill="#2dd4c8" />
    </svg>
  );
}

export const IconDashboard = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /></svg>
);
export const IconBox = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 8l9-5 9 5-9 5-9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>
);
export const IconSwap = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 7h13l-3-3" /><path d="M20 17H7l3 3" /></svg>
);
export const IconChart = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 20V10" /><path d="M12 20V4" /><path d="M20 20v-7" /></svg>
);
export const IconGear = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.55V21a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1-1.55 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.55-1H3a2 2 0 110-4h.09a1.7 1.7 0 001.55-1 1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34H9a1.7 1.7 0 001-1.55V3a2 2 0 114 0v.09a1.7 1.7 0 001 1.55 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87V9a1.7 1.7 0 001.55 1H21a2 2 0 110 4h-.09a1.7 1.7 0 00-1.55 1z" /></svg>
);
export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
);
export const IconBell = (p: IconProps) => (
  <svg {...base(p)}><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 01-3.4 0" /></svg>
);
export const IconChevronDown = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 9l6 6 6-6" /></svg>
);
export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 5v14" /><path d="M5 12h14" /></svg>
);
export const IconMinus = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 12h14" /></svg>
);
export const IconEdit = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>
);
export const IconTrash = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></svg>
);
export const IconArrowUp = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></svg>
);
export const IconArrowDown = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 5v14" /><path d="M5 12l7 7 7-7" /></svg>
);
export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
);
export const IconAlert = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /></svg>
);
export const IconClose = (p: IconProps) => (
  <svg {...base(p)}><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
);
export const IconMail = (p: IconProps) => (
  <svg {...base(p)}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 6 10-6" /></svg>
);
export const IconLock = (p: IconProps) => (
  <svg {...base(p)}><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></svg>
);
export const IconRetail = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 9l9-6 9 6v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" /></svg>
);
export const IconManufacturing = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.34 1.87 2 2 0 11-2.83 2.83A1.7 1.7 0 0015 19.4a1.7 1.7 0 00-1 1.55V21a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1-1.55 1.7 1.7 0 00-1.87.34 2 2 0 11-2.83-2.83A1.7 1.7 0 004.6 15a1.7 1.7 0 00-1.55-1H3a2 2 0 110-4h.09A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.34-1.87 2 2 0 112.83-2.83A1.7 1.7 0 009 4.6a1.7 1.7 0 001-1.55V3a2 2 0 114 0v.09a1.7 1.7 0 001 1.55 1.7 1.7 0 001.87-.34 2 2 0 112.83 2.83A1.7 1.7 0 0019.4 9a1.7 1.7 0 001.55 1H21a2 2 0 110 4h-.09a1.7 1.7 0 00-1.55 1z" /></svg>
);
export const IconDistribution = (p: IconProps) => (
  <svg {...base(p)}><rect x="1" y="7" width="14" height="10" rx="1.5" /><path d="M15 10h4l3 3v4h-7z" /><circle cx="6" cy="19" r="1.6" /><circle cx="18" cy="19" r="1.6" /></svg>
);
export const IconMagicLink = (p: IconProps) => (
  <svg {...base(p)}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></svg>
);
export const IconGrid = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
);
export const IconCheckbox = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="3" width="18" height="18" rx="4" /></svg>
);
export const IconDownload = (p: IconProps) => (
  <svg {...base(p)}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
export const IconUpload = (p: IconProps) => (
  <svg {...base(p)}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}><polyline points="20 6 9 17 4 12" /></svg>
);
export const IconFileSpreadsheet = (p: IconProps) => (
  <svg {...base(p)}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /><line x1="12" y1="13" x2="12" y2="17" /></svg>
);
export const IconTrendingUp = (p: IconProps) => (
  <svg {...base(p)}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
);
export const IconFilter = (p: IconProps) => (
  <svg {...base(p)}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
);
export const IconClipboard = (p: IconProps) => (
  <svg {...base(p)}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
);
export const IconTable = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>
);

