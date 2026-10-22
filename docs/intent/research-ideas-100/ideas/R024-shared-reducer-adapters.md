# R024 — Keep chart and composition wrappers faithful to shared reducers

- ID: R024
- Category: Composed graphics
- Priority: 16
- Kind: simplification
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Composition’s donut and waterfall marks already reuse native chart reducers. `waterfallPlan` calls `planBridge` or `planAccumulate`, and `donutNodes` calls `planDonut`; this is a useful simple design. The wrappers still prepare their own color order, source metadata, and glyph traces. For example, `donutOrder` constructs string keys while the reducer uses typed category keys. That observation identifies a comparison to investigate, not a confirmed user-visible defect. Sharing arithmetic alone does not prove every surrounding interpretation remains equivalent.

Compare preserving the current wrappers with a narrow input-and-result adapter that carries typed identity, exclusions, and contributor meaning consistently. A third outcome is to remove only a redundant coercion or document an intentional presentation difference after evidence appears. Do not build a generic chart-to-composition framework. Color order may legitimately differ from slice rank, and a repeat naturally restricts population. The research should first define which claims must agree when a native chart and a composition mark intentionally describe the same rows and measure.

The first experiment would prepare typed categories such as numeric 1 and text 1, converted numeric values, missing inputs, negative or zero totals, and enough categories to create Other. Compare the native plan with the composition wrapper on the same population. Acceptance requires agreement in amounts, membership, exclusions, and identity while allowing documented visual differences. Reject a shared adapter if it hides simple direct calls behind a broad abstraction or if every observed difference is intentional. A suspected mismatch should become a small reproducer before any implementation is proposed.

The likely benefit is lower maintenance at an existing reuse boundary, with low or moderate cost depending on the evidence. Public settings need not change if an internal adapter suffices. This follows composed graphics and current-analysis-trust without claiming that shared reducers are absent or requiring another end-to-end testing program. Confidence is high that the seam deserves examination because both implementations are present and easily compared. Actual discrepancies and their effect on real reports remain unverified; the investigation can reasonably conclude that the current wrappers are sufficiently clear.

## References

- Repository: `packages/explorEDA/src/components/charts/Composition/partsMarks.ts` — `waterfallPlan`, `donutOrder`, `donutNodes`. Composition wraps native reducers but prepares color ordering and glyph metadata separately.
- Repository: `packages/explorEDA/src/components/charts/Donut/donutPlan.ts` — `planDonut`, `DonutInput`. The native donut reducer accepts raw inputs and exclusion reasons and uses typed category keys.
- Repository: `packages/explorEDA/src/components/charts/Waterfall/waterfallPlan.ts` — `planBridge`, `planAccumulate`. Native waterfall preparation is already shared.
- Repository: `packages/explorEDA/src/components/charts/Composition/partsMarks.test.ts` — `bridges each repeat's plan to its actual, as the chart does`, `pools the smaller categories into Other`. Existing examples verify representative composition reuse.
- Related intent: `docs/intent/composed-analytical-graphics/intent-brief.md`.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
