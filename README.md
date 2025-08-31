
# VanMitra — Frontend

This repository contains a Next.js prototype frontend for VanMitra (Atlas & DSS).

Local quickstart (PowerShell):

```powershell
cd "c:\Users\ANISH\Documents\PROJECTS\VanMitra"
npm install
npm run dev
```

Available pages
- `/` — Dashboard
- `/map` — Interactive VanMitra map (MapLibre)
- `/dss` — Decision Support
- `/admin` — Admin tools (placeholder)
- `/public` — Public view (sanitized)
- `/login` — Simple prototype login

APIs (mock)
- `GET /api/claims` — sample GeoJSON claims
- `GET /api/recommendations` — sample DSS recommendations

What I implemented
- Animated, forest-themed UI using Tailwind + Framer Motion
- Map with MapLibre consuming local mock GeoJSON and interactive popups
- Layer controls and legend UI
- Lightweight auth context + login page (prototype)
- Mock DSS recommendations API endpoint

Next steps you can ask me to implement
- Wire real backend (FastAPI) and PostGIS integration
- Add Keycloak OIDC flows and role-based UI
- Build ML serving endpoints for asset mapping
- Add offline map tile support and mobile PWA mode
