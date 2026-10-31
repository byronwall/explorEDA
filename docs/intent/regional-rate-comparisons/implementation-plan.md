# Build regional comparisons with explicit exposure

Build a saved regional comparison from numerator totals and exposure, with a map, ranked table, and notebook finding.
Then add event records with a separate exposure source and explicit numerator filters.
One query result supplies values, availability, group selection, and source evidence to every view.

Status: proposed plan for review. Build dispositions select planning scope; they do not approve implementation.
Reviewed against `origin/main` at `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6` on October 31, 2026.

Read the [research summary](../../research/regional-rates-design-2026-10-31/README.md),
[local evidence](../../research/regional-rates-design-2026-10-31/evidence.md), and
[all eight original Pro artifacts](assets/pro-results/README.md).
The original report, contract, and plan remain proposals. This local plan controls delivery order.

## Meaning and limits

The calculation is `scale × N / D` for one typed region, UTC interval, population, and boundary version.
Accept nonnegative safe-integer event counts and positive finite exposure. Exposure can be fractional.
Keep population estimate reference dates and release vintages separate from observation windows and geometry versions.
Reference populations and measured exposure have different meanings; neither establishes a proportion of eligible people.

Require one exposure observation per full requested grain. Identical duplicates also block the initial result.
Keep candidates, arithmetic contributors, exclusions, and coverage evidence separate for each input role.
Prepared records supply their own provenance; they do not imply access to unimported events.

Coverage can be a field or an explicit scoped assertion with attribution.
Loaded-empty events establish zero only with complete collection. Missing prepared N remains unavailable.
Partial, unknown, and not-collected states preserve observed evidence without publishing a complete rate.
A missing source overrides a stale complete-collection assertion. Do not derive coverage from the last event.

Pool only explicitly requested, disjoint regions with compatible scope and units.
Divide total N by total D. Do not average rates or silently omit unavailable members.
Known N and D remain readable independently when the quotient is unavailable.

No universal metric language, paid service, automatic boundary crosswalk, smoothing, or causal interpretation is required.
The pending reusable-output and quantity plans are useful neighbors, not prerequisites.

## M1 — Prepared regional comparison, saved end to end

**Outcome:** import one authoritative region-period table, compare its N/D values, inspect its records, and reopen the notebook.
This is a smaller release than Pro's combined prepared/event M1. It retains a complete analyst workflow.

**Code:** all `src/` paths below are under `packages/explorEDA/`.

- Extend `src/types/AnalysisProject.ts` with `grouped-rate` and role evidence.
  Its two explicit predecessors can name the same prepared stage in this milestone.
- Add small `src/lib/rates/` modules for types, typed grain, evaluation, pooling, and result adaptation.
  Reuse `AnalysisSourceReference` and `valueParsing`; do not copy the companion's standalone types wholesale.
- Extend `src/lib/analysis/evaluateProject.ts`, `projectFile.ts`, and `src/lib/dsl/project.ts`.
  Share a small dependency helper across evaluation, cycle checks, validation, revision dependencies, and selected-view closure.
  Validate field mappings against the correct branch. Reject unknown semantic settings and unsupported step versions.
- Extend `src/lib/analysis/analysisWorkerProtocol.ts` and `useAnalysisEvaluation.ts` with availability and rate context.
  Keep the current source upload and request-ID coordination. Do not introduce a second worker manager or cancellation transport.
- Reuse `src/components/ExplorEdaProject.tsx` result-row projection, trace context, and `onProjectChange({project, view})`.
  Add one narrow runtime rate adapter. Keep raw evidence out of `onStateChange` settings.
- Extend `Map/definition.ts`, `RegionMap.tsx`, `RegionMapSettings.tsx`, `regionMapPlan.ts`, and the existing trace surface.
  Add a geometry adapter and compact comparison setup/trace components. Add a ranked table using the current table shell.
  Map settings bind query/step and quantity; arithmetic stays in the query.
- Extend `src/lib/notebook/readNotebook.ts`, findings, declaration compilation, and mounted notebook context.
  Keep full evaluation/availability alongside scalar rows. Add an explicit-group pooled rate finding using the same adapter.
- Extend `src/utils/saveDataUtils.ts`, Dashboard text compile/export, project text, and notebook writeback.
  Round-trip semantic group keys, both input IDs, field/literal bindings, coverage, and quantity-specific reference domains.
- Extend `src/lib/project/folder.ts`, `writeFolder.ts`, and `apps/app/src/ProjectWorkspace.tsx`.
  Carry `missingSources`, pass notebook rate context, and reuse the existing ordered `FolderSaver`.
  Project definition edits belong in project text; chart edits belong in their existing analysis/notebook owner.

Select semantic groups, including zero and unavailable groups. Provider row IDs remain transient projection positions.
Pin geometry identity: rate mode bypasses automatic country/state/county substitution during zoom.
Use separate reference domains for rate, N, and exposure. Keep bounds through filtering and reopen.
Show actual overflow after refresh and offer explicit rebase. Render a zero-only legend when all valid values are zero.

**Proof:** prepared fixture RR-F02 gives A=10, B=40, C=0 per 1,000.
A+B pool is 100/7; its mean rate is 25. A+B+C pool is 100/9.
Add a prepared unknown-coverage D=500 exposure; including D makes the pool unavailable.
Missing prepared N never becomes zero. Test duplicates, conflicting D, zero D, fractional counts, and safe-integer limits.
Check RR-F24–26 and RR-F36–38 against exact expected values.
Production arithmetic must avoid needless intermediate overflow and must reject unsafe count sums.
Round trips must preserve typed `1` versus `"1"`, literal-versus-field metadata, same-stage input roles, and both dependency references.
Test group selection, duplicate polygons, pinned zoom, one committed callback, host echo, missing-file reopen, and notebook evidence parity.

**Docs/example:** add `apps/demo/src/docs/pages/regional-rates.mdx` and link from `map.mdx` and `notebooks.mdx`.
Add a registered `apps/demo/src/demos/regionalRates.tsx` prepared comparison and a folder example under
`apps/demo/public/examples/regional-rates/`, with project text, notebook, prepared CSV, and geometry.
Register docs coverage and live steps. Verify select, trace, finding, save, and reopen at 1280, 783, and 390 px.

**Main risk:** the notebook or saved folder retains scalar values while losing the source context that establishes their meaning.
Do not release until the full context survives both paths.

## M2 — Event records plus separate exposure

**Outcome:** count original events, compare with an authoritative exposure table, and filter a covered subtype without changing D.

**Code:** extend rate evaluation/scope, both query branches, project validation/text, worker context, setup, trace, and notebook adapters.
Complete two-source export closure and source-availability propagation through `ProjectWorkspace` and `ExplorEdaProject`.
Count exactly one original occurrence per event input row. Reject expansion duplicates and collapsed rows containing several event references.
Keep every excluded source row reachable through prior-stage evidence.

Use dedicated numerator predicates with explicit category coverage. Ordinary result-row filtering changes displayed groups, not N/D.
Arbitrary raw-chart filters need an explicit role binding; do not infer propagation from matching column names.
Use half-open UTC intervals. Unsupported partial-window or population changes cannot silently reuse a fixed denominator.
Build the typed union of both inputs and requested groups. Geometry alone supplies no zero or exposure.
An in-window event with unknown region blocks potentially affected groups; an invalid timestamp blocks its known region.
A conclusively out-of-window orphan does not block the interval. A known unmatched E is its own unavailable group.

**Proof:** RR-F01 yields A=12/1,200×1,000=10, B=8/200×1,000=40, C=0, D unavailable.
RR-F17 repair filtering gives A=5/2, B=10, C=0 with unchanged exposure contributors.
The selected A+B+C pool becomes 25/9. C has no event members and retains `exposure:dC`.
Check loaded-empty versus failed source, duplicate D, time/boundary/population mismatch, typed keys, and source-local ID collisions.
Use RR-F08–23, F27–29, F32–33, and F39–46. Add real query tests for duplicated occurrences after expansion.
Test denominator-only refresh, late worker replies, transient selection writeback, and full two-source bundle/reopen evidence.
Known unavailable members must not disappear from pooled findings.

**Docs/example:** extend `regional-rates.mdx` with event input, fixed exposure, scope, and coverage.
Add registered `apps/demo/src/demos/regionalRateEvents.tsx` and a two-source folder example.
Its scripted steps compare count/rate ranks, select C, inspect both roles, filter repair, and reopen the pooled finding.
Verify pointer and keyboard use at all three widths.

**Main risk:** a filter changes the event population while the UI implies that both inputs changed together.
Keep filter roles and collection scope visible.

## M3 — Supported windows, strata, and exposure preparation

**Outcome:** compare supported periods/populations and explicitly extract one exposure observation from repeated values.

**Code:** extend rate grain/scope/evaluation/pooling, project text and validation, setup, and notebook bindings.
Add a small explicit exposure-preparation operation. Preserve one arithmetic representative and every backing record.
Reject conflicts. Require explicit declarations for disjoint populations and additive exposure intervals.
Do not infer disjointness from different labels or from polygon appearance.
Do not sum repeated population snapshots, overlapping windows, or fixed exposure repeated across subtype facets.

**Proof:** RR-F04 extracts population 200 from three rows and yields 15 per 1,000, with all three backing records.
RR-F07 collapses identical D only by explicit policy; RR-F35 conflicts remain unavailable.
Disjoint 2/100 and 3/150 person-day intervals pool to 1/50 events per person-day.
Two snapshots of 100 residents must not silently become a population of 200.
Test overlapping strata, unsupported windows, mismatched boundary versions, and all policy/text round trips.

**Docs/example:** add “Supported windows and populations” and “Extract exposure” sections to `regional-rates.mdx`.
Register `apps/demo/src/demos/regionalRatePeriods.tsx` and its folder notebook with duplicate/conflicting exposure examples.
Verify scopes, trace, and reopen at the required widths.

**Main risk:** repeated or overlapping exposure appears additive. Keep declared grain and represented records inspectable.

## M4 — Explicit live comparison findings

**Outcome:** bind several notebook statements and views to an explicit group set or an opt-in chart selection.
Basic explicit-group findings already ship in M1.

**Code:** extend notebook declarations/findings/writeback, `NotebookFindings.tsx`, rate adapter, and existing host callback paths.
Retain query/step, quantity, selected group set, scope, and revision for both operands of a comparison.
Compare compatible rates only. Reuse the project callback; do not add another settings or history architecture.

**Proof:** A+B+C reads 100/9, repair reads 25/9, and including unknown D makes every bound consumer unavailable.
Test stale/disappeared group keys, source reorder, host echo, atomic edits, late results, and surrounding prose preservation.
Keep the full transient `filters` array out of notebook writes; do not only check its first token.
Author semantic selections through explicit finding edits, then recompile and compare.

**Docs/example:** add “Rate findings and embedded hosts” to `regional-rates.mdx` and `notebooks.mdx`.
Register `apps/demo/src/demos/regionalRateNotebook.tsx` with a controlled host, replaceable exposure, and a saved notebook.
Verify bound statements and source evidence at the required widths.

**Main risk:** text silently follows a different selection from the chart. Every finding must name its binding.

## Explore and deferred scope

Prototype RR-06 count-model intervals before planning a release. For N=0, D=400, scale=1,000,
the proposed two-sided 95% Poisson upper rate is `2.5 × ln(40)`, approximately 9.2221986353.
The one-sided upper limit is `2.5 × ln(20)`, approximately 7.4893306839.
These are different model statements; neither repairs unknown collection or uncertain exposure.
If promoted, pair a vetted method and exact tests with `regional-rate-uncertainty.mdx` and a registered runnable example.

Explore RR-20 eligible-entity proportions separately. N≤D alone does not establish subset membership.
Defer smoothing, standardization, boundary crosswalk computation, and a universal semantic platform.
Use the [local dispositions](../../research/regional-rates-design-2026-10-31/decisions.md) for all 23 recommendations.

## Verification and review boundary

Implementation workers must add focused tests for values, memberships, persistence, and callback behavior in each milestone.
Use existing map, query, notebook, worker, project-file, and folder test suites for integration.
Run demo coverage and Dashboard text tests after registering examples; run docs checks and scripted docs examples.
Use `pnpm shot` for real UI evidence at 1280, 783, and 390 px.
Each package-visible PR needs a changeset. Run `pnpm check` once before opening its implementation PR.

This research PR changes docs and preserves original artifacts only.
The [evidence record](../../research/regional-rates-design-2026-10-31/evidence.md) distinguishes local checks from Pro's reported results.
