# R073 — Challenge example conclusions with deliberate counterexamples

- ID: R073
- Category: Documentation and examples
- Priority: 9
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The repository already grounds example claims in executable evidence. `evaluateFinding` computes daily finding values, `corpus.test.ts` checks publication findings, and the curated analysis tests verify totals, joins, and selected statements against source tables. The research opportunity is stronger adversarial review of the meaning of those claims. A calculation can faithfully reproduce a number while the surrounding sentence still overstates its population, denominator, or interpretation. This candidate focuses on authoring and checking credible example conclusions, not replacing existing tests or building a general reproducibility platform.

Compare a compact claim contract recording population, measure, comparator, and qualification with a reviewer-written counterexample for each important headline. The contract makes assumptions explicit and may support existing finding declarations. Counterexamples exercise meaning directly, such as adding a missing record, reversing a comparison in one subgroup, or changing the reference period. A smaller alternative is to revise examples so their claims stay narrowly descriptive. Avoid insisting that every sentence becomes a machine-readable assertion; dataset context and causal caveats often need human judgment.

Start with three existing example headlines and their available test definitions. In a later authorized runnable checkout, perturb only the relevant fixture assumptions and ask whether the claim is recomputed, rejected, or still displayed misleadingly. Acceptance requires each headline to name its scope and have at least one meaningful change that would falsify or qualify it. Reject a new claim schema if it duplicates `DailyFinding` without catching a new class of error. Reject a test that merely reuses the same calculation and therefore cannot expose a mistaken denominator or population.

This follows current-analysis-trust and the established example-coverage workflow. The supplied packet omits the underlying public datasets, so no published finding was recomputed here and no numerical defect is alleged. Maintenance should remain small: a few high-value claims, reusable author guidance, and independent expected examples where appropriate. Confidence is high in the value of credible examples, while the actual incidence of semantic overstatement is unknown. The investigation earns its place by strengthening the product's evidence and teaching quality at once, with a clear option to narrow wording rather than add another validation subsystem.

## References

- `apps/demo/src/daily/findings.ts` — `DailyFinding`, `evaluateFinding`. Daily numeric findings are already declared and evaluated.
- `apps/demo/src/daily/corpus.test.ts` — `daily visualization corpus`. Corpus tests provide an existing verification framework.
- `apps/demo/src/demos/analyses/analyses.test.ts` — `states findings that match the query result`, `keeps every flight and its distance total through the lookups`. Curated analyses already verify arithmetic and source-preservation claims.
- `apps/demo/src/demos/exampleViews.ts` — `penguinViews`. Authored analytical headlines provide concrete review subjects.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status and overlap are discussed above.
