
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
 
Marker sizing and real-world diameter
- The app now enforces a maximum real-world diameter for point/circle layers and DOM markers so very small polygons still show up but they won't visually explode when zoomed out.
- Default maximum diameter: 50 km (50,000 meters).
- Per-layer override: set `layer.style.maxDiameterMeters` (number, meters) when adding a `GISLayer` to the `WebGIS` component.
- Per-marker override: set `marker.maxDiameterMeters` on individual markers passed to `WebGIS`.
- The conversion uses a WebMercator approximation (meters per pixel computed from map center latitude and zoom). This is approximate but fast for interactive updates.
