# Product answers

Byron Wall, October 11, 2026, in response to ten product questions while shaping. Answers are condensed; quoted text is verbatim.

1. **Street job:** both finding sites in a city and recognizing a region, about equally.
2. **Default tiles:** should just work for a paying customer with no key or configuration. Maintaining tiles, or requiring users to, "sounds miserable." Do not hold back Leaflet for React 18; bump to React 19 if needed.
3. **Beyond the screen:** PNG export must include streets. A shared view should restore only through saved settings on the coming server; no URL query parameters for map views. Offline was not selected.
4. **Geography:** world, countries, then US detail. Wants country → state → county quality worldwide if practical, and is willing to maintain or link the GeoJSON. Users should not have to fetch files they obviously need, and should never get a blank map "until they contact support."
5. **Point scale:** a couple of thousand drawn directly; beyond that, aggregate and group until the user zooms in, or cap around 10k.
6. **Level selection:** infer the useful level from the data as "magic" as possible; let the user override; zooming in shows more detail.
7. **Boundary delivery:** provide boundaries up front or through a build process rather than a user-triggered fetch; compare options that respect this.
8. **Projection:** pick automatically by extent.
9. **Too many points:** group, then split on zoom.
10. **Points to regions:** add a derived calculation that associates latitude/longitude with a named region and stores the result, since it may be expensive.
