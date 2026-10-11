# Repository baseline

Inspected October 11, 2026, at `12bd64d359f03c54a50b1ff97f20f42284cf4dc6`.
Repository: <https://github.com/byronwall/explorEDA>.
The checkout was clean and detached before creating `codex/map-location-intent`.

| Area | Current source evidence | Research implication |
| --- | --- | --- |
| Map model | `packages/explorEDA/src/components/charts/Map/definition.ts`: one `map` type; point and region modes | Do not describe these as absent chart types. |
| Point settings | `MapSettingsPanel.tsx`: coordinates, label, color, size, radius, opacity, projection, center, zoom | Assess missing control and clarity against this baseline. |
| Geometry import | `RegionMapSettings.tsx`: file and paste import; shared asset selector; join preview | Improve an existing flow; do not recommend building import from scratch. |
| Accepted geometry | `src/lib/geometryAssets.ts`: nonempty Polygon/MultiPolygon FeatureCollection, finite WGS 84 coordinates, closed rings | Assess diagnostics, limits, topology, and useful type extensions separately. |
| Region joins | `regionMapPlan.ts`: typed keys, feature ID/property, shared duplicate-key region, count/sum/average, contributor IDs | Preserve join and metric meaning across renderers. |
| Context | `mapGeometry.ts`: World Atlas land-110m, graticule, Equal Earth/equirectangular, antimeridian-aware fitting | Street context and broader supplied geography remain new scope. |
| Save boundary | `src/types/SavedDataStructure.ts`: `geometryAssets`; map settings reference `geometryAssetId` | Do not duplicate geometry in each chart. Examine export and host callbacks. |
| Interaction | `PointMap.tsx`, `RegionMap.tsx`, `useMapPan.ts`, trace modules | Keep click selection, empty-space clearing, Alt-click tracing, keyboard use, and pan distinct. |
| Proof | `pointMap.test.tsx`, `regionMap.test.tsx` | Existing tests name coordinate validity, sizing, antimeridian, facets, overlapping rows, exact joins, holes, restore, and preview isolation. |
| Product examples | `apps/demo/src/demos/dashboardSettings.ts`, `regionMapGeometry.ts`, `analyses/earthquakes.ts`, `analyses/worldbank.ts` | Test both worldwide analysis and local custom boundaries. |
| Product docs | `README.md`, `apps/demo/src/docs/pages/map.mdx`, `docs/ui-defaults.md` | Research should preserve established chart behavior and distinguish documentation from runtime proof. |

Paths without a full prefix in map rows are relative to `packages/explorEDA/src/components/charts/Map/`. Other `src/` paths are relative to `packages/explorEDA/`.

The package is React and TypeScript. Dependencies include D3 Geo, TopoJSON Client, and World Atlas. The inspected manifest has no Leaflet or MapLibre dependency. This is a source review. It makes no claim that browser behavior or performance was verified.

Relevant commands:

```sh
pnpm --filter exploreda exec vitest run src/components/charts/Map/pointMap.test.tsx src/components/charts/Map/regionMap.test.tsx
pnpm --filter exploreda check-types
pnpm --filter demo dev
pnpm check:ui
pnpm check
```
