# Independent primary-source checks

Checked October 11, 2026. These checks support later review of Pro's output. They do not select a renderer.

- [Leaflet API reference](https://leafletjs.com/reference.html): TileLayer loads tiles from a URL template and supports attribution. The current reference identifies itself as `2.0.0-alpha.1`. Select and verify an intended release before using API examples. A renderer selection does not settle the tile provider.
- [MapLibre source specification](https://maplibre.org/maplibre-style-spec/sources/): the style model supports separate vector and raster sources. Tiled sources carry URLs, bounds, zoom limits, and attribution. Assess provider data and styles separately from the renderer.
- [OpenStreetMap standard tile policy](https://operations.osmfoundation.org/policies/tiles/): the public raster service prohibits bulk prefetch and offline downloads. Ordinary interactive viewing has different conditions. A proposed offline map feature needs a source whose terms permit that use. This statement concerns the standard tile service, not every OSM-derived provider.

No provider request test, rendering benchmark, legal review, or production approval was performed.

## Checks after collection

- [World Atlas repository](https://github.com/topojson/world-atlas): archived March 3, 2023; README identifies Natural Earth 4.1.0 as its source. Existing package use does not establish a current country catalog.
- [Natural Earth 110m countries](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/): the publisher lists version 5.1.1 and describes its default de facto boundary convention. We did not download or audit its full key set.
- [React Leaflet v5 release](https://github.com/PaulLeCam/react-leaflet/releases/tag/v5.0.0): React 19 is required. The current explorEDA manifest advertises React 18 or 19. Wrapper selection must preserve that contract or receive explicit approval to change it.
- [React Leaflet introduction](https://react-leaflet.js.org/docs/start-introduction/): Leaflet owns layer DOM. Props are immutable unless documented otherwise. Its browser dependency and lifecycle need a local proof.

Local source checks also confirm the Escape guard difference, missing plain background handlers, and asset-before-assignment order. The reconciliation preserves their runtime uncertainty.
