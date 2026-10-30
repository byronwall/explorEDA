# Explore exact missingness patterns and keep their meaning

Build a registered Joint missingness chart over effective values. Show exact missing/present patterns with counts, shares, and complete record traces.
Keep its semantic selection in JSON, Dashboard text, and notebook text. Then add group comparisons and chosen-input checks.
This plan is a research disposition. It does not authorize implementation or release.

Baseline checked: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`, October 30, 2026.
Refreshed main still matches this baseline. See the [research summary](../../research/joint-missingness-design-2026-10-30/README.md),
[checked evidence and dispositions](../../research/joint-missingness-design-2026-10-30/evidence.md), and
[all nine original Pro results](assets/pro-results/joint-missingness-design-2026-10-30/README.md).

## Contract

- Choose 2–12 fields. Each exact pattern names missing fields; every other chosen field must be present.
- Multiple patterns form a union of whole signatures. Independent field choices cannot represent that union.
- Use `isMissingValue` on effective columns from `getColumnData`, including calculated outputs.
- Null, undefined, absent properties, and blank text are missing. Zero and false are present unless authored preparation changes them.
- Unconverted invalid or nonfinite values can be present. Explicit failed conversion can make them effectively missing.
- Keep raw input and conversion/calculation explanations in trace. Do not add failure counts to effective-missing counts.
- One observation means one current input or query-output row. Source contributors have a separate count.

Let `S` contain all current input rows. Let `L` apply this chart's ordinary local restrictions.
Let `B` apply workspace and peer filters to `L`, excluding this chart's own selector.
Let `Q` apply the semantic selector to `B`. Every pattern share uses `|B|`.
Notebook peers do not narrow `B`, because notebook selections stay local.
Rows-drawer search and filters do not redefine the chart's denominator.

An active selector includes the chart's local population in its outgoing predicate.
Without a selector, the chart contributes no outgoing restriction. Resolve column getters once before testing rows.

| State                                | Meaning                                                                          |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| No selector                          | No outgoing restriction; selected notebook count equals scope count.             |
| Present selector with `patterns: []` | Active-empty; count zero.                                                        |
| `patterns: [[]]`                     | All chosen fields present.                                                       |
| Kept pattern with no current matches | Retain its meaning; count zero.                                                  |
| Valid empty scope with known fields  | Count zero; share unavailable.                                                   |
| Missing field definition             | Retain blocked intent; findings unavailable; an active selector matches no rows. |

Clear removes the selector. Toggling off the last selected pattern also clears it.
A declared field absent from individual rows remains a known field with missing values.
A missing schema field is unavailable, rather than a new all-missing cohort.

## M1 — Exact patterns, records, and kept notebooks

**Outcome:** choose fields, select patterns, inspect all matching rows, keep the selector, and reopen correct notebook findings.
The main risk is silent population widening during text writeback or reload.
This milestone works on current main. It does not depend on the selection-refresh implementation.

### First proof

Use the original [fixture](assets/pro-results/joint-missingness-design-2026-10-30/fixture-data.json).
Apply numeric conversion to `x` and categorical null token `NA` to `note`. Leave `w` unconverted.
Mount the provider and notebook findings. Select exact `{x,y}` OR exact `{note}`.
Require `r05,r06,r07,r12`, selected count 4, scope count 12, and share 1/3.
Selecting A in a sibling notebook chart must leave those results unchanged.
Save/recompile/reopen the selector, reverse input order, and verify the same business IDs.
Separately keep x-only and correct `r08.x` to zero. Require only `r02,r03` after re-evaluation.

### Implementation route

1. Add `components/charts/JointMissingness/definition.ts`, a pure core/plan, renderer/settings, and a shared paged record body.
   Store chosen fields and sort order in ordinary chart settings. Add the chart to existing unions and registry.
2. Add a dedicated `missingness-pattern` filter with `field: "__ID"` and canonical field-subset arrays.
   Save meaning, not masks, display positions, or member IDs. Field order is display only.
   Permit this filter only in its owning chart's `filters`. Keep scalar `applyFilter` unchanged in meaning.
   Update common save validation before chart dispatch, filter status labels, accessibility field discovery, and clear behavior.
3. Use owner-excluded live chart items for `B`. Reuse local-population helpers for outgoing selection.
   Pass a small field-existence context through the definition/registry/Crossfilter seam where needed.
   Derive existence from declared field names, every declared type key, observed fields, and calculation names.
   Requested chart fields are not schema evidence. Resolve missingness availability before reducing findings.
4. Render an UpSet-style pattern matrix beside frequency bars, count, and share.
   Pin all-present, including zero members. Page 20 ordinary patterns and 50 trace records.
   Counts and selections use every row. Show omitted pattern and represented-record counts.
   Retain selected zero-count patterns in a reachable selected-pattern view.
   Use a textual pattern label, keyboard selection, and existing Alt-trace behavior.
5. Extend trace dispatch and `traceRowIds`. Pattern, union, finding, and Chart data routes must return matching memberships.
   `ChartDataPreview` currently takes 100 rows and omits notebook-local selection application.
   Add a chart-specific path to the shared paged record body. Do not change unrelated previews.
   Use raw/effective detail lazily. Identify notebook rows as current query outputs until source lineage is actually available.
6. Extend saved chart/filter validation, DSL compile/export, `CHART_SETTING_KEYS`, and reference descriptions together.
   Canonicalize structural field subsets. Reject outside-universe fields, sparse lists, and foreign selector owners.
   Invalid text must not become a successful unselected chart. Retain valid blocked intent after schema disappearance.
7. Add explicit notebook Keep selection and Reset to kept actions through existing verified `writeBackChart` machinery.
   Ordinary clicks remain exploratory. Keep writes only the selector and any required stable chart name.
   Test the mounted parent's text echo, not only pure writeback equality.
   A guarded Undo Keep changes only its prior authored selector and preserves unrelated prose.
   Reuse existing host Undo where it already covers this action; do not add a general history store.
8. Preserve authored selection through unrelated text/settings edits. Field-set changes clear it in runtime and text atomically.
   Display reordering preserves it. Passive recomputation emits no settings edit.
   Reopen supplied kept settings over current rows; do not promise arbitrary unkept selection survival across remounts.
9. Keep existing named count/share findings. Add a narrow unavailable result for a broken chart, including dependent shares.
   The headless findings helper reads raw columns today. Supply effective/calculated columns explicitly or report unavailable.
   Forward query field schema through notebook reading and the folder host, including known empty results and `unknown` types.
10. Reuse `ProjectWorkspace` notebook text state, `FolderSaver`, and `App.reload` flush behavior.
    Keep confirms text editing. Only acknowledged host save status confirms writing the folder.
    Do not create another writer or transaction system.

Key existing files are `types/{ChartTypes,FilterTypes,SavedDataStructure}.ts`, `charts/{registry,registerAllCharts}.ts`,
`providers/DataLayerProvider.tsx`, `hooks/CrossfilterWrapper.ts`, `lib/chartPopulation.ts`, and `utils/saveDataUtils.ts`.
Also change the relevant trace, preview, field-picker, notebook, DSL, docs-kit, and folder-host files named above.
Use scoped field profiles in the picker; existing field-specific owner exclusions cannot establish a common joint denominator.

### Text and findings

Use native indexed path syntax. The `patterns` alias lowers to the owning semantic filter.
It is not a second saved selection property.

```text
chart joint-missingness @gaps fields[]=x,y,z,note,flag,w {
  patterns[]=
  patterns.0[]=x,y
  patterns.1[]=note
}
finding @selected count chart=@gaps
finding @scope count chart=@gaps population=eligible
finding @share share selected scope digits=1
```

No `patterns` means no selector. `patterns[]=` alone means active-empty.
`patterns.0[]=` means all-present. `patterns=unset` clears it.
Resolve aliases to canonical field keys. Do not add a nested JSON parser.
Generic filter paths need the same strict ownership checks.
Current automatic writeback excludes filters; Keep requires an explicit path.
Generated live prose must describe the current selection without hardcoding a pattern count or changing requirement.

### Proof and documentation

- Assert every exact fixture pattern and partition total 12. Effective missing-cell total is 16 across 72 cells.
- Exact x/y has two rows; inclusive x/y has three. Ship exact semantics only.
- Exact x OR y has `r02,r03,r04,r08`; exclude both-missing and all-present rows.
- Local A without a selector leaves the workspace at 12 while this chart reads 8.
  With the active union, outgoing IDs are `r05,r06,r07`, count 3/8.
- Test active-empty, all-present, zero-match selection, empty known schema, schema loss/recovery, conversion and calculated outputs.
- Assert one settings callback per user action. Keep emits one text callback and survives the parent echo.
- Test save failure, retained in-memory edits, refused reload after failed flush, retry, and fresh folder reopen.
- With 101 matching rows, trace pages contain 50/50/1. All record routes still account for 101.
- Reversed rows and appended matching rows re-evaluate semantic predicates. No saved positions establish membership.
- Test pointer/keyboard/Alt-trace at 1280, 783, and 390 pixels, long names, empty scope, and 12-field overflow.
- Image export includes stage, exactness, denominator, legend, selection, and omission notice. Omit editing controls.

Ship `apps/demo/src/docs/pages/joint-missingness.mdx`, settings reference descriptions, and linked sections in
`fields.mdx`, `dashboard-text.mdx`, `notebooks.mdx`, and `project-folders.mdx`.
Register runnable `joint-missingness` and equal-marginals examples in `examples.ts`, `coverage.ts`, and docs live examples.
The equal-marginals fixture must show complete cases 1/4 versus 3/4 despite identical 25% marginal rates.
Run targeted core/provider/notebook/DSL/save tests, demo coverage/text tests, docs checks, real browser flows, and export proof.
Run `pnpm check` once and add a minor changeset when implementing this new package capability.

## M2 — Group consequences and chosen inputs

**Outcome:** compare within-group shares and keep a chosen presence/finite-number cohort with the same record guarantees.
The main risk is a correct count paired with the wrong denominator or a silently changed selector.

Extend the same settings/core/plan/trace files. Add one optional group field and a required subset of diagnostic fields.
Reuse typed category identity. A missing-group bucket includes blanks and uses existing `[null]` matching.
Display eight named groups plus an explicit remainder; include all records in totals and traces.
The remainder is not a literal category or an implicit cohort action.
Do not add arbitrary group-pattern cell unions.

Define Have values with `!isMissingValue` and Finite numbers with `finiteNumber !== undefined`.
Admitted and excluded are complements inside `B`. Selecting one replaces the pattern selector in one update.
An eligibility selector reads its owning rule. Keep saves that rule with the selector; Reset and Undo guard both.
Required-field edits re-evaluate meaning. A diagnostic field-set edit retains the rule only if its required subset remains valid.

Use normal `eligibility.fields[]` and `eligibility.requirement` settings with a chart-only `inputSelection` alias.
Reject simultaneous pattern and input selectors. Existing per-group count/share findings suffice.
Do not subtract share findings with the current restricted `difference` finding model.
The chart can show an unrounded descriptive percentage-point gap.
Generated category text must recompile to the same typed membership; string/number collisions can require refusing that export.

Acceptance uses the original twelve rows:

| Reading           | Members                    | Result                                                       |
| ----------------- | -------------------------- | ------------------------------------------------------------ |
| Selected union, A | r05,r06,r07                | 3/8 = 37.5%                                                  |
| Selected union, B | r12                        | 1/4 = 25%                                                    |
| A minus B         | Same two group populations | 12.5 percentage points                                       |
| x/y/w present     | r01,r07,r10,r12            | 4/12                                                         |
| x/y/w finite      | r01,r07,r10                | 3/12                                                         |
| Finite exclusions | All other rows             | 9/12: eight with required missingness, one present nonfinite |

Verify unequal-group pooled rates, zero groups, typed categories, missing groups, and remainder accounting.
Test JSON/text/Keep/reopen for both selector kinds. A field-absent analysis remains unavailable rather than merely ineligible.
Extend the docs page, text/notebook reference, settings descriptions, and runnable `joint-missingness-groups` example together.
Include live-example steps for counts, exact IDs, requirement changes, and acknowledged folder reopen.
Run targeted tests and all M1 persistence/browser/export checks that the extension changes. Run `pnpm check` once before its PR.

## Limits and later decisions

Page rendering while preserving complete analysis. At twelve fields, binary patterns cannot exceed 4,096.
A compact runtime signature cache may help; never persist masks or duplicate every pattern/group's full ID array.
Measure cold/warm rebuild, selection, record opening, and memory before adding workers or a hard computation cutoff.
Pro's 12-million-cell guard and 100 ms target are unmeasured proposals, not accepted release limits.
If a measured limit is needed, propagate an explicit unavailable state; never substitute sampled exactness.

Defer a separate Copy notebook section action. M1 already supports notebook authoring and kept text.
Any later export must preserve preparation, aliases, source binding, typed scope, and peer-selection meaning.
Explore a read-only notebook provenance adapter only when original-source navigation is included.
Current query-output records are sufficient for this plan's first contract and must be labeled accurately.
Defer raw selectable patterns, inclusive intersections, arbitrary cross-group unions, and rate-gap findings.
Avoid mechanism diagnosis, imputation, quality grades, expected-record generation, and a separate rules engine.
