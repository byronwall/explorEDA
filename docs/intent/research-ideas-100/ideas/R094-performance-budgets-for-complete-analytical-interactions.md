# R094 — Performance budgets for complete analytical interactions

- ID: R094
- Category: Measured performance
- Priority: 21
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The performance guide records concrete past costs and targeted fixes, including host echo restoration, per-row column lookup, and unnecessary chart rerenders. Guard tests now protect those patterns. That is stronger evidence than a generic claim that large data needs optimization. The remaining opportunity is to choose a few complete analytical interactions whose measured cost catches regressions outside those known mechanisms. A fast isolated reducer does not necessarily make a filter, formula apply, or restored view feel responsive to the user.

Compare a small production workload budget with retaining only structural guard tests and occasional profiling. A third option is an informational trend report rather than a hard gate. Choose fixtures that vary row count, width, category cardinality, and chart composition independently enough to reveal the cause of a slowdown. Separate preparation, filtering, planning, React rendering, layout, and paint. Use repeated cold and warm runs on a named build and machine; do not turn historical development timings into current universal performance promises.

The first study should profile a selection, formula application, restore, and view switch across three bounded fixtures, including a project host that echoes settings. Record visible completion and the dominant stage, then deliberately reintroduce one already understood costly pattern in an isolated future experiment to assess detection. Accept a budget only if it reliably flags meaningful task delay and yields an actionable diagnosis. Reject a benchmark gate when environment noise dominates, when it merely repeats an invariant test, or when maintenance exceeds the small set of regressions it can detect.

This is a high-confidence robustness follow-up to current-analysis-trust and a useful input to release-gated-checks, without changing CI or release policy now. Existing guards remain valuable and are not described as absent. No product timings were collected from the non-runnable packet. The likely cost is a compact fixture and measurement discipline rather than new infrastructure. It earns an early research slot because a solo developer benefits from knowing which few checks protect real user tasks before spending effort on broad optimization.

## References

- `docs/performance-checks.md` — `Patterns that keep edits cheap`, `January flights`. Documents measured historical fixes, production-versus-development limits, and representative interactions.
- `packages/explorEDA/src/test/providers/filterColumnLookups.test.ts` — `getFilterFunction`. Checks registered chart filter column access patterns.
- `packages/explorEDA/src/test/providers/displayOnlyKeys.test.ts` — `DISPLAY_ONLY_KEYS`. Protects display-only update classification.
- `packages/explorEDA/src/components/__tests__/chartRenderIsolation.test.tsx` — `SKIPPED`. Checks unrelated chart renders with explicit unsupported test cases.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/release-gated-checks/intent-brief.md` — related intent; status reconciled against implementation in the brief.
