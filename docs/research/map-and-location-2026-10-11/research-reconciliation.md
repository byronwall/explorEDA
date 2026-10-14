# Research reconciliation

Reviewed October 11, 2026, against baseline `12bd64d359f03c54a50b1ff97f20f42284cf4dc6`. This records proposed intent changes, not approval to implement them.

## Evidence retained and reviewed

The [original package](pro/README.md) contains ten companion files and the ZIP. All ten separate downloads match the ZIP members. The [collection manifest](collection-manifest.json) records their hashes. No original was edited.

The review covered the report, intent amendments, recommendations, proof plan, repository audit, both CSVs, source ledger, and verification record. The source ledger contains 123 external primary-source records. We independently checked selected material claims; we did not repeat every external retrieval. See [primary-source checks](primary-source-checks.md).

The research separates publisher claims, source inspection, proposals, and unverified behavior. Keep those distinctions. The matrix contains 87 documented, 72 conditional, 36 unknown, and three documented unsupported entries. Unknown means the reviewed sources did not establish support. It does not mean a product lacks the feature.

## What the broad comparison changes

The [matrix](pro/capability-matrix.csv) covers ten product families through eleven entries and eighteen dimensions. Power BI Azure Maps and Shape map are separate entries. It includes Tableau, Looker Studio, Superset, Metabase, ECharts, Plotly, Vega, Observable Plot, and kepler.gl.

The useful common patterns are separate data and context controls, clear geometry binding, readable names independent of join keys, and saved views. A street renderer does not supply a data catalog, exact source selection, export rights, or complete keyboard interaction. The richer tools also show where scope can expand into a GIS workbench.

The revised intent therefore centers on four content groups: analytical marks, reference boundaries, basemap context, and data labels. It retains the existing typed joins and shared assets. It treats reference labels, provider behavior, and image export as separate concerns. Product feature counts do not select an architecture.

## Disposition of every recommendation

IDs refer to the unchanged [recommendations](pro/recommendations.json). “Adopt” means include in the proposed intent. “Investigate” means retain a hypothesis. Neither means implemented or approved.

| ID      | Disposition                           | Intent treatment and limit                                                                                                                                        |
| ------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MAP-001 | Adopt                                 | Preserve exact source identity, analytical states, traces, and D3/SVG as the starting default.                                                                    |
| MAP-002 | Adopt, verify                         | Prioritize background clearing and draft isolation. Source omissions are confirmed; full product failures need reproduction.                                      |
| MAP-003 | Adopt, qualify                        | Improve polygon import errors and measured limits. Define assignment failure and draft asset retention before choosing a transaction design.                      |
| MAP-004 | Adopt                                 | Extend typed join diagnostics. Keep numeric and string keys distinct; do not add silent matching or coercion.                                                     |
| MAP-005 | Investigate                           | Test bounded content controls, independent display names, and one reference overlay beneath points. One analytical layer is a first-slice proposal.               |
| MAP-006 | Investigate                           | Audit one country pack first. Compare World Atlas with fresh Natural Earth; do not assume existing land supplies country joins.                                   |
| MAP-007 | Adopt, qualify                        | Preserve pack provenance and saved geometry. Add only metadata and loading behavior needed by the selected pack. No catalog service is required.                  |
| MAP-008 | Adopt                                 | Preserve zero, empty, invalid, unmatched, contributor counts, valid-input denominators, and stable scales. No new statistics platform.                            |
| MAP-009 | Investigate                           | Compare Leaflet/raster and MapLibre/vector with common fixtures. Choose at most one optional street engine; neither is selected.                                  |
| MAP-010 | Adopt, investigate                    | Separate provider configuration from chart state. Verify actual origins, attribution, token scope, terms, and local analytical data. No provider is approved.     |
| MAP-011 | Adopt, qualify                        | Preserve geographic view meaning and host history. A separate detailed camera is a hypothesis; do not copy D3 zoom into tile zoom.                                |
| MAP-012 | Adopt                                 | Prove selection, inspection, clearing, and navigation with keyboard, touch, and alternatives to dragging. Existing focus handlers are partial evidence.           |
| MAP-013 | Investigate                           | Measure overlap and workload costs before adding a renderer. Test exact coincident-record access before choosing aggregates.                                      |
| MAP-014 | Adopt, investigate                    | Separate saved analysis, text DSL, and image export. Prove local output first; detailed capture and permission remain separate checks.                            |
| MAP-015 | Defer                                 | Clusters, bins, and heatmaps need a concrete density task and exact contributor semantics. They are not required to harden current maps.                          |
| MAP-016 | Defer                                 | Advanced classification and automatic normalization stay outside the first slice. Prepared measures and stable continuous scales remain supported intent.         |
| MAP-017 | Defer broad catalog; retain expansion | Additional national packs remain part of the desired direction. Select them from actual dashboards after the country-pack proof. No permanent country-only limit. |
| MAP-018 | Defer                                 | Offline street archives and PMTiles need a demonstrated task, suitable rights, and a complete resource package.                                                   |
| MAP-019 | Adopt boundary                        | Keep routing, geocoding infrastructure, spatial joins/databases, editing/repair, arbitrary CRS, and 3D outside the current initiative.                            |
| MAP-020 | Reject added platform scope           | Do not build competing permanent street stacks, a universal scene model, or a plugin platform for the comparison.                                                 |

## Geography choices retained

The [catalog](pro/geography-catalog.csv) contains ten candidates. These are alternatives and future options, not ten promised releases.

| Candidate                               | Treatment                                                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| World Atlas countries 110m              | Compare as the smallest first proof. Audit numeric-string IDs, missing codes, age, and territorial coverage. |
| World Atlas countries 50m               | Defer until the coarser source fails a real display task. Prove key parity before substitution.              |
| Natural Earth countries 110m, 5.1.1     | Compare as a maintained source for the first pack. Final conversion and alias coverage remain unverified.    |
| Census states and equivalents           | Retain as a possible demand-led national pack. No U.S.-first commitment.                                     |
| Census counties and equivalents         | Defer until a dashboard needs this level. Preserve string codes and vintage.                                 |
| Natural Earth global Admin 1            | Defer broad support because coverage, codes, and maintenance need further audit.                             |
| geoBoundaries gbOpen country ADM1       | Retain as a conditional source. Audit each layer; incomplete source terms block the example reviewed by Pro. |
| Statistics Canada provinces/territories | Retain as a national option. The 2021 candidate is deliberately pinned, not claimed as latest.               |
| Statistics Canada census divisions      | Defer until this finer level serves a concrete task.                                                         |
| ONS local authority districts           | Retain as another national option. Verify export coordinates, codes, date, and notices.                      |

Compare World Atlas's archived Natural Earth 4.1 source with the publisher's current 5.1.1 country source. Neither headline establishes current legal boundaries or exact dashboard coverage. A numeric country ID does not directly match the World Bank demo's alpha-3 codes. Source archive size does not measure runtime cost. Supplied and custom geometry should use the existing shared-asset route.

## Source findings checked locally

- `PointMap.tsx` clears live filters on Escape without the draft callback guard used in `RegionMap.tsx`.
- Point-map SVG has no plain background click handler. Region-map SVG handles Alt inspection there. Full wrapper behavior still needs a browser check.
- `RegionMapSettings.importGeometry` inserts an asset before assigning it through the settings callback. A synchronous callback failure can leave the asset inserted.

These source observations agree with the [repository audit](pro/repository-review.md). They are not reproduced browser defects. Existing map tests use a distinct preview ID and bypass the file/paste importer. Five existing tests passed in our checkout after Pro received the source packet.

## Qualifications to the proposed proofs

All eight [Pro proofs](pro/proof-plan.md) remain **not run**. They cover baseline interactions, import, joins/metrics, catalog, settings/save behavior, renderers/performance, provider/export, and accessibility. They remain research inputs to a later implementation plan.

Use the smallest fixtures that can change a decision. The proposed hardware profile, 1k/10k/50k workloads, 100 ms selection, 500 ms filter, and 30 fps targets are hypotheses. They are not measured limits, a required lab purchase, or release promises. Scale testing only when earlier results justify it.

The research's isolated-checkout suggestion does not authorize another Git worktree. Existing project rules require Byron's explicit request. Use the existing checkout or a small disposable harness unless that changes.

Preserving saved analyses and the advertised React 18/19 contract are concrete existing obligations. Do not expand those into a general compatibility framework. A dual-camera representation, automatic provider fallback, per-engine histories, or support for multiple deployed versions is not settled. Prefer a clear unavailable-context state and an explicit outline choice. Do not silently substitute export output.

Asset reuse also needs a product decision. State-hold batches notifications; it does not provide rollback. Unused assets may be intentional. The proof must establish the intended import result before prescribing deletion or transactional infrastructure.

React Leaflet v5 requires React 19. A compatible wrapper or direct integration must be evaluated without silently narrowing current host support. The renderer comparison must include lifecycle, resize, facets, accessible inspection, and request behavior. No external service was purchased or configured.

## Review boundary

Byron should review the intent and proposed first slice. Renderer, provider, pack membership, import-retention policy, and final controls remain open. No shape, implementation milestones, feature changes, or release are approved by this research.

The [run record](research-run.md) reports actual local checks separately from Pro's package validation. It also records the final-message connection interruption and successful collection from the file library.
