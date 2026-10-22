# R071 — Route documentation by the analytical task and its prerequisites

- ID: R071
- Category: Documentation and examples
- Priority: 81
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The documentation already goes beyond a chart list. `CHART_QUESTIONS` maps questions such as comparing categories or following time to several chart choices, and `WORKFLOWS` routes users to local folders, databases, notebooks, servers, or React embedding. `DocsSite` tests exercise the chooser and settings search. The remaining research opportunity is whether these routes help a person recognize the preparation and scope their task requires. A question about customer retention, for example, needs an entity and event definition before a chart choice can be useful.

Compare adding one prerequisite sentence to each existing question route with a small set of end-to-end task recipes that cross several guides. The sentence keeps navigation compact but may be insufficient for a task involving source preparation, filtering, and tracing. A recipe can demonstrate the complete reasoning but becomes another document to maintain. A third alternative is to improve search synonyms and related-page links without adding new pages. The study should preserve the existing catalogue, URLs, and chart chooser, which the completed landing-docs-entry initiative intentionally retained.

Begin with six realistic requests phrased without chart terminology: explain a total, compare unequal groups, inspect missing observations, review a time interval, validate a selected cohort, and save a repeatable notebook. Ask participants to choose a route, state the required data, and reach a visible result. Acceptance requires fewer dead ends and accurate recognition of prerequisites, using the existing examples where possible. Reject new recipes if they merely repeat chart pages, or if the same improvement comes from a brief prerequisite note and one well-chosen related link.

This follows the shipped navigation redesign rather than treating its older intent prose as proof that entry paths are missing. Maintenance cost should be measured as duplicated instructions and fixtures, not just page count. No application API change or dependency is expected. Confidence is medium because routing completeness is visible in source but task success has not been observed in this review. The investigation earns its place by testing whether documentation helps users formulate a valid analysis, while allowing a small editorial correction instead of a second help system or a catalogue expansion.

## References

- `apps/demo/src/docs/chooser.ts` — `CHART_QUESTIONS`, `ChartQuestion`. The docs already map analytical questions to chart choices.
- `apps/demo/src/landing/workflows.ts` — `WORKFLOWS`. Runtime entry routes already cover local, database, notebook, server, and React uses.
- `apps/demo/src/docs/DocsSite.test.tsx` — `shows the charts that answer the question picked`, `opens search with the keyboard and goes to a setting`. Navigation and search have focused tests.
- `apps/demo/src/docs/targets.ts` — `FLOWS`, `allTargets`. Major workflows are explicit documentation targets.
- `docs/intent/landing-docs-entry/intent-brief.md` — related intent; status and overlap are discussed above.
