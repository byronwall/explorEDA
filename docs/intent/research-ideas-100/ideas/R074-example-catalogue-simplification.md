# R074 — Reduce example maintenance while preserving useful coverage

- ID: R074
- Category: Documentation and examples
- Priority: 57
- Kind: simplification
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The example system deliberately separates a curated catalogue from the larger set reachable by URL. `examples.ts` derives the catalogue from listed examples, while `coverage.ts` distinguishes implementation status, shown usage, reviewed assignments, and concrete gaps. The docs gate connects examples to chart pages and live demonstrations. The research question is whether the growing set contains redundant maintenance obligations that could be consolidated without losing a distinct analytical lesson or a rare interaction proof. A large catalogue is not itself evidence of useful breadth.

Compare retaining all examples with clearer ownership of their teaching roles against consolidating overlapping examples into a smaller representative set. A third option keeps small fixtures for automated checks but removes them from public discovery, preserving their stable URLs when needed. Judge overlap by analytical task, data shape, interaction, and evidence, not only by chart type. An example showing missing contributors may be indispensable even if several others use the same chart. Conversely, several stylistic variants may not justify separate reviewed assignments.

Start with one dense coverage family, such as scatter modes, and list what each linked example uniquely proves or teaches. Select a tentative smaller subset, then walk every affected documentation link, scripted example step, and declared review assignment on paper before any removal. Acceptance requires preserving every distinct lesson and explicit gap while reducing duplicated review effort. Reject consolidation if a unique interaction or semantic edge case becomes invisible, or if keeping redirects and alternate versions costs more than maintaining the original examples. Do not infer visual review from a source declaration.

This is a simplification follow-up to the completed landing-docs-entry work and the existing example-coverage discipline. No product behavior or public package API should change as a consequence of the research. The likely output is a small retain, combine, or unlist recommendation with evidence, not a quota for deleting examples. Confidence is medium because maintenance cost and usage are not measured in the packet. The candidate earns its place by respecting a single developer's capacity and making a smaller, more defensible set of examples an acceptable improvement alongside adding new analytical demonstrations.

## References

- `apps/demo/src/demos/examples.ts` — `catalogue`, `listed`. The public catalogue is a deliberate subset of all examples.
- `apps/demo/src/demos/coverage.ts` — `ImplementationStatus`, `ExampleUsageStatus`, `getFeatureReviewStatus`, `findCoverageErrors`. Implementation, usage, review, and coverage gaps are distinct.
- `apps/demo/src/demos/coverage.test.ts` — `keeps implementation, review, usage, and gaps distinct`. The separation is protected by tests.
- `apps/demo/src/docs/gate.ts` — `findDocsErrors`. Documentation depends on valid examples and their declared capabilities.
- `docs/intent/landing-docs-entry/intent-brief.md` — related intent; status and overlap are discussed above.
