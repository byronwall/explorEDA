# Proposed amendments to the map-and-location intent

**Status: proposed for review, not applied.** These amendments refine the attached `docs/intent/map-and-location/intent-brief.md`. They do not authorize implementation, a provider agreement, repository changes or a PR. The current handoff ends with this research package; the receiving Codex workflow can incorporate it later under its own authorization.

## 1. Durable intent to retain

People should build useful dashboards from location-bearing data without becoming GIS specialists. Both point and region maps deserve clearer behavior, dependable custom polygon GeoJSON, useful supplied geography and understandable control of rendered content. Recognizable streets and place labels are desirable for some local tasks. Worldwide comparison, city sites and custom service districts remain the reference jobs.

The product remains a small embedded React and TypeScript analysis workspace. Exact selection, linked filtering, source trace, meaningful metric states, facets and save/restore are part of the map's analytical contract. Renderer choice, a simple/detailed split, catalog contents and delivery order remain open mechanisms.

## 2. Derived requirements to add

These are research-derived requirements proposed for review, not additional direct user instructions.

- **Separate content roles.** Users can understand which elements are analytical marks, reference boundaries, basemap context and data labels. Presentation changes preserve source IDs, typed joins, aggregation inputs, denominators, color domains and trace targets. Analytical-mode/key changes have an explicit reset policy. Reference geometry does not acquire selection or metric meaning accidentally. See MAP-005 and MAP-011.
- **Harden the existing import.** File and paste import already support Polygon/MultiPolygon FeatureCollections and shared assets. Improve diagnostics, supported-geometry explanations, complexity reporting and coherent commit. Preserve canonical geometry and provenance. Validation and winding adaptation do not imply topology repair. See MAP-003.
- **Keep joins explicit.** Retain exact typed keys and deliberate grouping of multiple features under one region key. Extend the existing all-source join preview with useful mismatch/type samples and clear unused-geometry counts. Do not silently coerce codes, guess names or multiply contributors by polygon fragments. See MAP-004.
- **Keep analytical meaning visible.** Distinguish a valid zero, no in-scope rows, no valid measure and an unmatched record. Explain valid-input denominators and preserve stable scales. Prefer appropriately prepared rates for comparable regions without adding automatic normalization. See MAP-008.
- **Preserve practical interaction.** Click selects, empty space clears the chart's own selection, Alt inspection remains distinct, and pan/cancel must not clear filters. Draft settings must not mutate committed chart state. Keyboard, touch and single-pointer navigation need task-level proofs. See MAP-002 and MAP-012.
- **Make geography reproducible.** Ready-made packs have an audited key contract, geographic unit, version/reference date, terms/notice and update owner. Reuse saved assets; do not silently refresh old analyses. See MAP-006–007.
- **Make external context explicit.** The host owns approved providers, resource origins, public-token configuration and usage/attribution constraints. Preserve analysis when context is unavailable. Prove request behavior and export permission separately from renderer capability. See MAP-009–010 and MAP-014.

## 3. Implementation hypotheses to test

Keep D3/SVG as the default and compare Leaflet with raster presets against MapLibre with a curated vector style for **at most one optional street renderer**. Fixed raster labels may be sufficient; independent vector labels or a measured workload advantage may justify greater cost. No winner is selected.

A compact content model may use Point/Region analytical modes, None/Land/Streets context, one noninteractive boundary overlay beneath points and a display label independent of the join key. Persistent point labels should begin with a narrow selected-label proof. Avoid a general layer composer.

The first catalog may contain one versioned country pack. Compare existing World Atlas convenience with a fresh Natural Earth-derived pack, including missing IDs and explicit aliases for the World Bank demo. National subdivisions remain demand-led. Lazy host-origin acquisition plus existing saved assets is a delivery hypothesis, not a required new service.

A detailed camera may be stored separately from the existing D3 center/zoom. Translate geographic extent rather than copying zoom numbers; preserve old analyses. Measure current SVG before considering Canvas or aggregated density.

## 4. Deferred scope and acceptance

Defer global administrative coverage, clustering/bins/heat surfaces, advanced classification, automatic statistical denominators, offline street packages and additional regional packs until a concrete task earns their maintenance cost. Geocoding infrastructure, routing, geometry editing/repair, spatial joins/databases, arbitrary CRS and 3D terrain remain outside this initiative's default scope. Do not create a renderer plugin platform or maintain both candidate street engines merely because they were prototyped.

Use P01–P08 in [proof-plan.md](proof-plan.md): current safety and metric truth first, then import/catalog/state, then conditional renderer/provider/export and integrated accessibility. Every proof is currently **not run**. If street rendering fails, retain the useful D3, import and catalog improvements and keep detailed context pending.

Repository seams and primary evidence for each proposed change are in [recommendations.json](recommendations.json); baseline facts are in [repository-review.md](repository-review.md). The initial intent remains authoritative until reviewed amendments are accepted.
