# orbit-inventory

Frontend multi-tenant para Orbit Inventory — React 18 + Vite + Cloudflare Pages.

## Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite 5
- **Estado global:** Zustand
- **Routing:** React Router v6
- **Gráficas:** Chart.js 4
- **Deploy:** Cloudflare Pages

## Setup Local

```bash
npm install
cp .env.example .env.local    # agrega la URL del backend
npm run dev
```

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|--------|
| `VITE_API_URL` | URL del Worker stocket-be | `https://stocket-be.tu-subdominio.workers.dev` |

## Deploy en Cloudflare Pages

```bash
npm run build
npx wrangler pages deploy dist --project-name orbit-inventory
```

O conecta este repo desde el dashboard de Cloudflare Pages para despliegue continuo en cada `git push`.

## Estructura

```
src/
├── components/     # Componentes reutilizables (Layout, modales, tablas)
├── pages/          # Vistas (Dashboard, Products, Login, Register)
├── store/          # Zustand stores (authStore, productStore)
├── lib/            # Cliente HTTP (api.ts)
└── App.tsx         # Router principal + PrivateRoute guard
```

## Relacionado

- Backend: [stocket-be](https://github.com/drjuliancucalon-droid/stocket-be)
