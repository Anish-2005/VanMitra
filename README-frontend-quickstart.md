Quick frontend notes:

- MapLibre is initialized with OpenStreetMap raster tiles as a demo. When you have vector tiles or a Map style from a tile server (GeoServer, Titiler, PMTiles), update `components/MapComponent.tsx`.
- Use TanStack Query to fetch FRA claims and asset layers from the backend. The QueryClientProvider is set up in `pages/_app.tsx`.
- To add i18n, integrate `react-i18next` and wrap the app.

PowerShell run reminder:

```powershell
npm install
npm run dev
```
