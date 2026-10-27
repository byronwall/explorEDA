# Local recommendation dispositions

Build means inclusion in the [proposed plan](../../intent/quantity-calculations/implementation-plan.md), not approval to ship. Reviewed against current main `9d64a021` and both complete Pro reports. No follow-up was needed.

| ID   | Disposition | Local decision and reason                                                                                                                                       |
| ---- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QC01 | Build       | Analyze the current scalar AST and compile numeric conversions; avoid object-valued data.                                                                       |
| QC02 | Build       | Explicit per-formula mode preserves current untyped calculations without false certification.                                                                   |
| QC03 | Build       | Separate declarations, raw parsing, and display; suffix edits cannot reinterpret measurements.                                                                  |
| QC04 | Build       | Start with a finite owned resolver and conventional unit grammar; no runtime registry.                                                                          |
| QC05 | Build       | Separate readings/differences and use anchored conversions; Kelvin multiplication restriction is product policy.                                                |
| QC06 | Build       | Distinguish unknown, unit `1`, percent scale, and explicit constructors.                                                                                        |
| QC07 | Build       | Validate intermediate operations and both branches while retaining lazy execution.                                                                              |
| QC08 | Build       | Exact optional meaning keys and pinned output contracts prevent declared conflicts and representation drift.                                                    |
| QC09 | Build       | Keep scalar caches and expose conversion steps in the existing trace.                                                                                           |
| QC10 | Build       | Add result descriptors to shared/private reducers. Preserve existing Pivot count formatting; this is not a new count-suffix fix.                                |
| QC11 | Build       | Conversion creates a new result identity; do not migrate an unknown set of numeric consumers.                                                                   |
| QC12 | Build       | Recompile dependents and clear whole caches in one Apply; use existing state holds.                                                                             |
| QC13 | Build       | Canonical field owners plus readonly inherited metadata avoid nested view copies.                                                                               |
| QC14 | Build       | Share compilation across row/query execution; retain per-query field environments.                                                                              |
| QC15 | Build       | Explicit JSON/text codecs are necessary; generic field export cannot carry nested declarations unaided.                                                         |
| QC16 | Build       | Notebook definition writeback is new work; current chart-only writeback does not supply it.                                                                     |
| QC17 | Build       | Pair current rows and metadata on refresh and use host history. No new row-identity promise or history engine.                                                  |
| QC18 | Build       | Preserve scalar CSV; flatten inherited declarations only at standalone snapshot export.                                                                         |
| QC19 | Build       | Ship docs and runnable examples with each visible milestone.                                                                                                    |
| QC20 | Explore     | Consider a narrow math.js adapter only when the finite vocabulary needs expansion; measure actual bundle costs.                                                 |
| QC21 | Defer       | Thermodynamics, log units, uncertainty, and calendar arithmetic need distinct semantics.                                                                        |
| QC22 | Defer       | Incremental invalidation, vectorization, and workers require measured latency.                                                                                  |
| QC23 | Avoid       | Hidden suffix/reference inference, automatic FX, broad ontology, quantity objects in rows, and renewed external-demand gates conflict with the chosen boundary. |

Keep implementation helper shapes provisional. The plan names responsibilities, not a required file count. Add no adapter layer unless an actual owner or execution boundary needs it. Numeric/temporal research remains separate unbuilt work.
