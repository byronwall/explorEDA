# R080 — A credible selective-chart integration contract

- ID: R080
- Category: Embedding and package contracts
- Priority: 87
- Kind: simplification
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The package README advertises explicit chart registration for smaller integrations. `chartRegistry` provides that primitive, while importing `ExplorEda` runs `registerAllCharts`. The baseline build entry map and lean verification script, retrieved from GitHub at the same commit, demonstrate a registry-plus-bar consumer. They do not by themselves prove a complete selectively registered workspace. Research should establish what users can actually build through the supported package surface, rather than assume tree shaking removes every unwanted built-in from the main component.

Compare keeping selective registration as an advanced chart-building primitive with exposing a small workspace entry that receives an explicit registry. A simpler third outcome is to narrow the documentation to the route already supported and avoid another component entry. Audit the current chart entry map against actual registry types before treating coverage differences as intentional or defective. The decision should consider filtering, settings editors, saved-state rejection for unregistered charts, and the burden of explaining registration order to an embedding developer.

The first experiment would pack the baseline package in a runnable checkout and assemble two tiny React consumers: the ordinary workspace and a bar-plus-table integration. Measure transferred and parsed code, then perform a selection, settings edit, save, and restore. Record accidental imports of the full entry and missing required APIs. Accept an expanded route only if it produces a materially smaller usable experience with a concise example. Reject it if the only saving comes from omitting the workspace functionality the host actually needs.

This is a simplification investigation within the embedded track of runtime-modes, not a request for arbitrary third-party chart plugins or a framework migration. A new registry injection boundary could affect many imports, so documentation correction is a valid successful outcome. Confidence is medium: the source makes the package seam clear, but no fresh bundle or consumer build was run. Its value is keeping a public integration promise credible while avoiding a second maintained application surface without demonstrated benefit.

## References

- `packages/explorEDA/src/charts/registry.ts` — `ChartRegistryImpl`, `chartRegistry`. Provides typed registration for built-in chart settings.
- `packages/explorEDA/src/components/ExplorEda.tsx` — `registerAllCharts`, `ExplorEda`. The main component entry registers all built-ins.
- `packages/explorEDA/entries.json` — `entries`. Supplemental GitHub source at the baseline; maps published chart and core entries.
- `packages/explorEDA/scripts/verify-lean-bundle.mjs` — `chartRegistry.register`. Supplemental GitHub source checks a registry-plus-bar consumer, rather than a complete workspace.
- `docs/intent/runtime-modes/intent-brief.md` — related intent; status reconciled against implementation in the brief.
