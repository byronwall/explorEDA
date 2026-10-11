# Independent primary-source checks

Checked October 11, 2026. These checks support later review of Pro's output. They do not select a renderer.

- [Leaflet API reference](https://leafletjs.com/reference.html): TileLayer loads tiles from a URL template and supports attribution. The current reference identifies itself as `2.0.0-alpha.1`. Select and verify an intended release before using API examples. A renderer selection does not settle the tile provider.
- [MapLibre source specification](https://maplibre.org/maplibre-style-spec/sources/): the style model supports separate vector and raster sources. Tiled sources carry URLs, bounds, zoom limits, and attribution. Assess provider data and styles separately from the renderer.
- [OpenStreetMap standard tile policy](https://operations.osmfoundation.org/policies/tiles/): the public raster service prohibits bulk prefetch and offline downloads. Ordinary interactive viewing has different conditions. A proposed offline map feature needs a source whose terms permit that use. This statement concerns the standard tile service, not every OSM-derived provider.

No provider request test, rendering benchmark, legal review, or production approval was performed.
