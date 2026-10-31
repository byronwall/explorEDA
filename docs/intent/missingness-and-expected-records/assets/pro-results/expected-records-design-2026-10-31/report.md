# Build explicit expected-record reconciliation

**Design research report · explorEDA**  
**Baseline:** `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`  
**Research date:** October 30, 2026, America/Indianapolis  
**Status:** Design proposal. No repository changes, PRs, or issues were made.

## 1. Decision and product boundary

**Build a saved reconciliation analysis that compares an explicitly declared expected population with an actual population and returns an inspectable ledger of keys.** Start with an expected-key table. Add a bounded calendar generator as a second way to produce the same expectations. Keep the result in the existing project/query system, expose it through a focused React interface, and let notebook findings count and link to its exact memberships.

The implementation should have one pure TypeScript reconciliation function and one dedicated two-input query step. Reuse source preparation, shared value parsing, real source references, project serialization, and notebook count/share arithmetic. Do not force the feature through lookup diagnostics or an expanded join.

The analyst should be able to answer:

- Which required keys have at least one actual observation?
- Which required keys have no actual observation in the declared actual population?
- Which expected keys are repeated in the expectation definition?
- Which actual keys have multiple records, and which exceed the chosen count policy?
- Which input rows cannot be matched because a key component is missing or invalid?
- Which actual keys were never declared as expectations?
- Which dates or keys were legitimately excluded, and why?
- Which exact expectation records, actual records, or schedule declarations support a notebook statement?

An absent observation is a relationship between an expectation and an actual population. It is not a blank measurement, a zero, an empty chart cell, or a failed file read. This distinction is the organizing principle of the feature.

### Recommended delivery sequence

1. **M1 — Exact reconciliation API and embedded result.** Typed composite keys, exact memberships, explicit exclusions, count policies, real evidence, and a focused React example.
2. **M2 — Saved project reconciliation.** Two-input query integration, source and scope selection, complete result inspector, JSON/text persistence, source availability, and folder reopen.
3. **M3 — Notebook findings and refresh.** Saved query binding, reusable key-count/share findings, origin-aware links, guarded text writeback, and durable key focus.
4. **M4 — Bounded date schedules.** Explicit roster, finite calendar bounds, daily/weekly cadence, named skips, generated provenance, and parity with an equivalent expected table.

Each release is independently useful. M1 is explicitly an embedding/API release; it must not advertise a complete saved notebook workflow. M2 completes the saved workspace capability. M3 completes the notebook handoff required by this mission. M4 expands how expectations are authored without replacing the table path.

The old outside-demand thresholds in R028 and the missingness intent are superseded by the supplied mission and `docs/research/DIRECTION.md`. Byron is the demand. No adoption study or external customer gate belongs in this plan. Joint missingness remains a separate capability.

## 2. Evidence, access, and what is known

### Evidence conventions

- **Fact:** observed in a supplied complete source file or a cited primary document.
- **Inference:** a consequence of those facts.
- **Proposal:** behavior recommended here and still requiring implementation.
- **Executed check:** the companion reference oracle was actually run against the exact fixture assertions. It is not the explorEDA implementation.

All repository statements refer to the fixed baseline above. Current main was not substituted. The packet has 19 complete files; it is a scoped source snapshot, not a runnable checkout. Imported UI, notebook-read, and snapshot modules that are absent from it are listed as implementation inspection seams, not described as if their bodies were available.

### Decisive baseline facts

| Supplied source and symbol | Fact and design consequence |
|---|---|
| `types/AnalysisProject.ts::SourceDefinition`, `RelationshipDefinition` | A source has one `entityKey: string`; each relationship endpoint has one field. Composite matching is a new boundary, not an existing capability. |
| `lib/analysis/evaluateProject.ts::sourceReferences` | Unique scalar entity keys receive typed references. Missing, nonscalar, or duplicate entity identities fall back to positions. This baseline identity check is less strict than the new reconciliation key-validity contract. Raw-row selection cannot automatically survive reorder in fallback cases. |
| `lib/analysis/sources.ts::sourceFromRows` | Import may infer a key or add a row-number field. An inferred record identifier is not an authored reconciliation grain. |
| `evaluateProject.ts::lookupFrame` | Lookup preserves input rows; only an unambiguous target is projected. Ambiguous targets remain contributors. It does not enumerate actual-only keys or define a completeness denominator. |
| `evaluateProject.ts::expandedFrame` | Expansion can multiply rows and retain input-side unmatched rows. Its JSON-pair identity already acknowledges delimiter collision risk. |
| `evaluateProject.ts::validateQuery`, `evaluateAnalysisQuery` | Every non-source operation currently has one input. Evaluation, stage accounting, dependency traversal, and revisions need an explicit two-input case. |
| `lib/analysis/projectFile.ts::selectAnalysisProjectView`, `validateAnalysisProjectFile` | View export follows dependencies and validation resolves fields. Both must retain and validate both branches. |
| `lib/notebook/findings.ts::comparisonProblem`, `compareFindings` | Shares are count/count comparisons with a subset check; a zero denominator is unavailable. These are a good fit for key coverage, not for arbitrary sum/sum ratios. |
| `lib/notebook/compileNotebook.ts::compileNotebook` | Notebook blocks compile as dashboard text, with source-line preservation and last-valid block support. A project query definition is not automatically a notebook block. |
| `lib/notebook/writeBack.ts::writeBackSettings` | Existing writeback iterates chart edits. It does not automatically save reconciliation configuration or new finding declarations. |
| `lib/project/folder.ts::readProjectFolder` | Missing/unreadable files or snapshots can yield `tables[id] = []`, while `missingSources` carries the failure separately. Reconciliation must receive that state. |
| `lib/project/writeFolder.ts::projectFileText` | Unchanged inferred sources and implicit source queries are preserved. Explicit source steps let the folder writer discover both inputs. |

Paths in this table are relative to `packages/explorEDA/src/`. Full path/symbol citations and the full reading inventory appear in section 15.

The current tests verify typed scalar mismatches, missing keys, ambiguous lookup contributors, positional uniqueness for duplicate source identities, project export closure, cycles, aggregate behavior, and text round trips. Those tests support reuse of ingredients; they do not establish a reconciliation product. [R08–R10]

## 3. Primary-source comparison

These are documentation-based comparisons. No competitor interface was interactively tested. No paid product or service is required by the recommendation.

| Reference | Documented behavior | Adopt, adapt, or avoid |
|---|---|---|
| **pandas merge** [S1] | Multiple key columns, outer/anti joins, membership indicators, and cardinality validation. Null keys on both sides can match. | Adopt visible membership and cardinality concepts. Reject invalid-key matching for absence claims. Group before presenting results; do not use expanded join rows as the denominator. |
| **Power Query merge** [S2] | Two source roles, ordered paired-column selection, type guidance, match preview, and several join kinds. | Adopt explicit field pairing and both source previews. Use analyst terms Expected/Actual. Display exact evaluated totals separately from any setup sample. |
| **Great Expectations** [S3, S4] | Compound uniqueness is distinct from single-column uniqueness. Result formats support identifying columns and mechanisms for retrieving failed members; some returned samples are capped. | Adopt independent duplicate-key diagnostics and exact evidence access. Label samples and pages. An absent expectation requires expectation evidence, because no failing actual row exists. |
| **tidyr complete** [S5] | Explicit expansion combines completion and joining; separate variables create combinations, while nesting restricts combinations. Newly introduced and pre-existing missing values can be treated differently. | Allow an explicitly authored roster/calendar product. Avoid treating observed category combinations as evidence of obligations. Preserve synthetic expectation provenance and never fill absent measures with zero. |
| **PostgreSQL generate_series** [S6] | Bounded series use start, stop, and step; timezone-aware generation accounts for daylight saving. | Borrow bounded generation, not its exact inclusive-stop contract. Save an exclusive end and positive cadence. Keep calendar dates distinct from elapsed durations. |
| **dbt relationships** [S7] | Checks child records against parents and excludes nulls unless a separate non-null test is applied. | Useful contrast: actual-to-expected reference validity does not prove expected-to-actual completeness. Account for invalid keys independently. |
| **RFC 5545 recurrence** [S8] | Explicit exclusions take precedence over inclusion and repeated generated instances are not extra occurrences. | Borrow named exclusions and inspectable recurrence provenance. Do not build full recurrence-rule support. |

The first three references provide complementary interaction and identity lessons; the remaining references resolve the expectation-generation and completeness boundary. The recommendation is an inference from this comparison, not a claim that any one tool supplies the proposed combined workflow.

### Why a grouped result is the right abstraction

A full outer join is useful for deriving presence but is a poor final analytical grain when keys repeat. Two expectation rows and three actual rows at one key can create six join pairs. The analyst needs one key, two expectation declarations, three actual input records, and all five pieces of evidence. A dedicated grouping operator expresses that directly.

A single lookup is smaller only if the task is narrowed to expected-to-actual enrichment. The mission also needs actual-only keys, explicit exclusions, invalid-key populations, composite matching, clear denominators, generated expectations, and notebook evidence. Reconstructing all of that around two lookups would be less direct than one operator.

### Alternatives considered

| Approach | Assessment |
|---|---|
| Expected table + one lookup | Useful baseline, insufficient for the complete membership model. |
| Two directional lookups plus aggregation | Requires union semantics, special counters, duplicate rules, and synthetic evidence anyway. More policy is scattered across steps. |
| Generic full outer join operator | Broadly useful but creates pair-grain output and exposes many unrelated join-design decisions. Defer as separate work. |
| Dedicated grouped reconciliation operator | **Choose.** One semantic boundary owns key preparation, memberships, evidence, and counts. Existing unary preparation remains reusable. |
| Chart-only diagnostic | Cannot honestly manufacture absent observations or own reusable expectations. A result view can visualize the analysis after the model exists. |
| General data-quality rules engine | Outside the mission. Adds orchestration and rule composition without improving this bounded analyst task. |

## 4. Complete analyst flow

### 4.1 Create and name the analysis

Add **Reconcile expected records** to the project analysis creation flow. The exact host component must be located by Codex; its implementation is outside the supplied packet.

The first screen asks for two explicit roles:

- **Expected:** a table whose rows declare keys that should be present.
- **Actual:** a table whose rows are the observations being compared.
- **Analysis name:** for example, “Daily station readings.”
- **Expectation description:** plain-language purpose, such as “One reading per active station per operating day.”

Show source names, current loaded counts, read state, and source revisions. Reusing one underlying source in both roles is allowed: planned and observed populations can legitimately be different branches of one source. Show that shared lineage and require explicit role selection. Never manufacture the expected roster from actual distinct values.

A missing source presents a repair action, not an empty-result success. An intentionally loaded empty source remains a valid input.

### 4.2 Define the grain with ordered field pairs

Provide one mapping row per key component:

- Expected field, actual field, short component label, and explicit comparison mode.
- Side-by-side raw examples with type badges.
- A concise key sentence: “One expectation key is Station + Operating date.”
- Warnings for mixed source types and values that the chosen mode cannot read.

The component order is part of the saved definition. Allow multiple components from the first release; otherwise common station/date and entity/period tasks would require fragile concatenated columns.

Do not default to the source `entityKey` as the matching key. Offer it as a selectable field, with a separate explanation: source row identity locates records; match keys identify the obligation being checked.

### 4.3 Review populations and count policy

Show **Expected population** and **Actual population** separately. Their saved preparation/filter branches and parameter bindings are visible. Start from all rows of each chosen source. A user may explicitly narrow either side.

The default count policy is **exactly one actual input row per required key**. Also support:

- **At least one:** minimum 1, no upper bound.
- **Exactly N:** minimum and maximum N.
- **Between N and M:** positive integer minimum, finite integer maximum.
- **At least N:** positive integer minimum, no upper bound.

Call these counts of actual input rows. They are not a claim of independent measurements or deduplicated real-world events. Source-ID ambiguity remains visible. If the domain requires morning and evening observations to be independently present, include a slot component rather than letting two morning rows satisfy an undifferentiated count of two.

First-release branches allow source, filter, and calculate steps. Expanded and aggregated actual branches are rejected with an explanation of their changed grain. No cross-query reference system is needed.

### 4.4 Preview exact accounting

The preview has two levels:

- **Definition review:** input rows, invalid key rows by side, distinct expected keys, expected duplicates, exclusion entries, and source availability.
- **Reconciliation review:** required keys, observed required keys, absent keys, unexpected keys, excluded keys with observations, and count-policy exceptions.

A preview may show a paginated record sample for readability, but the counts and memberships must come from the complete declared inputs. If computation is incomplete, say so and withhold authoritative rates.

Do not require the analyst to fix every invalid raw row before inspecting valid groups. Invalid raw keys are quarantined and counted. Invalid configuration, unavailable sources, incomplete reads, or failed dependency evaluation block the result.

### 4.5 Inspect the result

Use a summary above a single key table, with focused views:

- **Required:** all valid non-excluded expected keys.
- **Absent:** required keys with zero actual rows.
- **Matched:** required keys with at least one actual row.
- **Unexpected:** valid actual keys not declared in the expected population.
- **Excluded:** declared keys explicitly outside the required population.
- **Duplicates:** two separate lenses for repeated expected definitions and repeated actual keys.
- **Invalid keys:** separate expected and actual occurrence lists.

The table shows key components, membership, expected declaration count, actual row count, count-policy status, duplicate badges, and exclusion reason. A duplicate flag may appear beside Matched, Absent, Unexpected, or Excluded as applicable. Do not use a single mutually exclusive “duplicate” status.

Each result row opens an inspector with:

1. The exact typed key and its comparison modes.
2. The expectation policy and population.
3. Expected evidence.
4. Actual evidence.
5. Exclusion or invalidity explanation.
6. Actions appropriate to the evidence that exists.

On narrow screens, keep the selected key and summary visible and place these inspector sections vertically. Reuse the project’s React controls and keyboard patterns after reading the unprovided UI standards. Essential distinctions use text and counts, not color alone.

### 4.6 Legitimate actions for absent expectations

For an explicit expectation, show its real expected-source rows. For a generated expectation, show the roster row, saved schedule, candidate date, cadence decision, and any skip.

The actual section says **No matching actual rows in this population.** Valid actions are:

- Open the expected record or schedule definition.
- Copy the typed key or export absent keys.
- Inspect the source populations and filters.
- Add an explicit exclusion with a reason, previewing the denominator change.
- Save a notebook finding with a link back to these keys.

Do not offer “select actual source row” for absence. Passing an empty array to a generic selection action can mean “clear the filter and show everything”; the origin adapter must intercept that case and show an explicit empty evidence panel.

### 4.7 Save, narrate, refresh, and reopen

Save the definition as an `AnalysisQuery` containing a `ReconcileStep`, plus normal view settings and selected canonical group keys. Persist definitions and source data/references, not a cached derived ledger as the authority.

**Add to notebook** binds the notebook to this query and inserts live findings for required, observed, and absent keys plus a coverage share. A record link opens the same exact result memberships.

A source refresh evaluates a complete new snapshot and publishes it atomically. While refreshing, keep the last result visibly labeled as the previous revision. A failed refresh does not replace it with all-absent data.

On reopen, source paths and snapshots resolve first, the saved definition is validated, both branches evaluate, and the notebook receives the new result and provenance context. A missing file yields unavailable findings. A genuinely empty actual file yields absent required keys.

## 5. Identity, key preparation, and grain

### Three identities must remain distinct

| Identity | Meaning and persistence |
|---|---|
| Source row identity | Which original record supplied evidence. Existing `entityKey` and positional fallback remain unchanged. |
| Reconciliation key | The ordered typed tuple used to match an obligation to observations. New and independent of source identity. |
| Result row identity | A stable key for one reconciliation group, or a revision-scoped identifier for one invalid occurrence. |

For valid groups, derive result identity from the project/query/step namespace, a versioned key-specification identity, and an unambiguous canonical tuple. A new policy, exclusion reason, actual count, or presence status should not change a valid group’s key. Changing key fields, order, or comparison mode changes the identity space and requires focus to be revalidated.

Use tagged atoms and structural encoding. Illustrative canonical tuples:

```json
[["string","1"],["date","2026-10-26"]]
[["number",1],["date","2026-10-26"]]
[["boolean",false],["number",0]]
```

The first two are different. So are `["a|b","c"]` and `["a","b|c"]`. Do not join components with a delimiter or coerce everything to text.

The companion oracle uses this conceptual structure. Its internal token spelling is a fixture convention; Codex may use a different collision-free representation if memberships and identity guarantees remain equivalent.

### Matching-mode contract

| Mode | Accepted inputs and equality |
|---|---|
| `scalar` | Nonblank strings, finite numbers, and booleans. Preserve value and runtime type. Numeric `-0` and `0` are equal. No trimming of present text, case folding, Unicode normalization, or string/number conversion. |
| `date-only` | A complete, valid `YYYY-MM-DD` string. No month-only text, timestamps, implicit timezone conversion, or numeric epoch interpretation. Compare the calendar date. |
| `instant-ms` | A full supported ISO timestamp with explicit `Z` or numeric offset and at most three fractional digits. Validate calendar/time/offset ranges, then compare epoch milliseconds. Reject offset-free timestamps, reduced precision, leap seconds, and unsupported sub-millisecond precision. |

All components must be valid. Null, undefined, missing properties, empty/whitespace-only strings, NaN, infinities, unsupported objects, and malformed dates are invalid keys. Numeric zero and boolean false are valid. Text `"0"` is distinct from numeric `0`.

Use `valueParsing.ts::isMissingValue` and guarded shared date parsing. The baseline `parseDateText` accepts more forms than the proposed key modes, and rounds fractions to milliseconds. Its ISO preset alone is not the reconciliation contract. Add feature-local lexical, precision, and offset guards before calling it. Do not broaden or rewrite global parsing rules as incidental work. [R13]

Finite numeric keys mean the numeric values already loaded into JavaScript. Identifiers whose precision cannot be represented exactly should be supplied as strings; this feature cannot reconstruct digits lost during import.

### Date equality is not chronological filtering

Baseline `filterFrame` compares string operands lexically for relational operators. Equivalent instant strings with different offsets are not necessarily ordered chronologically by their text. [R09]

Therefore:

- A `date-only` matching field can be filtered chronologically as canonical full ISO dates only when that preparation is explicit.
- For instant-based source population filters, use an explicitly prepared finite epoch-millisecond field. The builder must not present raw offset-text comparison as time ordering.
- Normalizing a reconciliation key does not retroactively change an upstream filter.
- Rows filtered out before reconciliation are outside its input population. Source preview should expose excluded counts and, where available, raw invalid-key counts separately.
- Absence means absent from the chosen snapshot and population. It does not automatically mean overdue, late, or missing forever.

### Duplicate expectations and actual observations

A valid key is one obligation. Repeated expected rows do not create multiple obligations. Preserve every expected row, set `duplicateExpectedKey`, and count the key once in the required-key denominator.

The initial model uses one global count policy and key-level exclusions, so duplicate expected rows cannot disagree on row-specific eligibility or count targets. Per-key count fields and their conflict resolution are deferred. Additional metadata stays in evidence; no “first” expected label or measure is silently selected.

Actual rows are counted as input occurrences. `repeatedActualKey = actualCount > 1` is a neutral fact. Under exactly-one it implies excess; under minimum two/maximum three it may be correct. Duplicate source entity IDs remain separate provenance diagnostics. Never automatically deduplicate actual data or claim that two copies of one event are two independent measurements.

### Exclusions

Persist explicit exclusions as a typed key tuple and nonblank reason. They apply only to keys declared by the current expected population.

- An excluded key contributes no required obligation.
- Its expectation evidence remains visible.
- Actual rows at that key are **observed on excluded keys**, not unexpected.
- A key absent from the expected population cannot be made harmless by an orphan exclusion.
- After a filter or refresh removes an expected key, its saved exclusion remains visible as unused. It does not suppress an actual-only key.
- Malformed, duplicate, or conflicting exclusion entries are configuration errors. An unused but valid entry is a visible warning.
- Editing an exclusion shows before/after required-key counts and is one explicit saved edit.

The feature does not silently decide whether an exclusion is legitimate. It makes the analyst’s declaration visible and reviewable.

## 6. Membership algebra and denominator contract

This section is the normative mathematical contract. It applies to a ready evaluation of the declared populations.

Let:

- `Erows`, `Arows`: expected and actual input occurrences after their saved preparation/filter branches.
- `IE`, `IA`: invalid-key occurrences on the two sides.
- `KE`, `KA`: sets of valid typed keys present in those inputs.
- `e(k)`, `a(k)`: counts of expected and actual occurrences at key `k`.
- `X ⊆ KE`: valid declared keys explicitly excluded.
- `R = KE \ X`: required keys.
- `M = R ∩ KA`: matched required keys.
- `B = R \ KA`: absent required keys.
- `U = KA \ KE`: unexpected keys.

For key rows, primary presence is exactly one of:

- `matched`: key in M.
- `absent`: key in B.
- `unexpected`: key in U.
- `excluded`: key in X, whether or not actual rows exist.

Invalid occurrences have no valid key and no presence value. In the project result frame, they have `rowKind = invalid-expected` or `invalid-actual`. They are never lumped into absent or unexpected keys.

Independent memberships are:

- `DE = {k in KE : e(k) > 1}`.
- `DA = {k in KA : a(k) > 1}`.
- `XO = X ∩ KA`, the excluded keys with observations.
- Required keys with `a(k) < min`, `min ≤ a(k) ≤ max`, or `a(k) > max`, where an absent upper bound is infinite.

An absent key is also below minimum because minimum is positive. A matched key can also be below minimum. Repeated actual keys can be within policy. Expected duplicates can overlap absent, matched, or excluded keys. Actual duplicates can overlap matched, unexpected, or excluded keys. Those flags are not an additive partition.

### Exact count identities

```text
|Erows| = |IE| + sum over k in KE of e(k)
|Arows| = |IA| + sum over k in KA of a(k)

|KE| = |R| + |X|
|R| = |M| + |B|
|KA| = |M| + |X intersect KA| + |U|
|KE union KA| = |M| + |B| + |X| + |U|

expected duplicate excess rows = sum over k in KE of max(e(k) - 1, 0)
actual repeated-key excess rows = sum over k in KA of max(a(k) - 1, 0)

|Erows| = |IE| + |KE| + expected duplicate excess rows
|Arows| = |IA| + |KA| + actual repeated-key excess rows
```

Actual rows also partition into invalid occurrences, rows on required keys, rows on excluded keys, and rows on unexpected keys. Do not add duplicate counts to that partition: they are already contained in it.

### Which denominator answers which question?

| Question | Exact definition |
|---|---|
| Did every assessable required key appear? | Presence coverage = `|M| / |R|`. |
| Which required keys have no observation? | Absent share = `|B| / |R|`. |
| Which keys meet the minimum? | `count(k in R with a(k) ≥ min) / |R|`. |
| Which keys meet the entire range? | Within-policy share = `count(k in R with min ≤ a(k) ≤ max) / |R|`. |
| How much of the minimum record requirement was filled? | Minimum attainment = `sum(k in R, min(a(k), min)) / (min × |R|)`. Overfilled keys cannot compensate for underfilled keys. |
| Which valid actual rows belong to required expectations? | Required-row relevance = `sum(k in R, a(k)) / (|Arows| − |IA|)`. The denominator includes excluded and unexpected valid rows. |
| How often could a side not be matched? | Invalid-key rate = `|IE| / |Erows|` or `|IA| / |Arows|`, with the side named. |
| How much repetition exists? | Show repeated-key group count and excess-row count separately, with their own units. |

Use exact integers for numerators and denominators; round only display text. For a zero denominator, return no ratio and explain “no required keys,” “no actual rows,” or the applicable empty population. Do not return 100%.

Reject configured totals that exceed exact safe-integer representation, including a very large minimum multiplied by the required-key count. Do not publish a rounded integer as an exact denominator.

Presence coverage is explicitly **coverage of valid required keys**. If invalid expected rows exist, the denominator cannot include the unknown obligations those rows might represent. Show the invalid count beside the rate and do not label the whole definition complete. This does not prevent inspection of the valid groups.

A useful counterexample is expected `{A,B,C}` and actual `{A,A,C}`: input totals both equal three, yet B is absent and A repeats. Total-row equality is not completeness.

## 7. Saved model, public API, and evaluation architecture

### Saved definition

Keep the new step inside `AnalysisQuery`; do not create an unrelated top-level analysis registry.

Proposed shape:

```ts
type ReconciliationKeyMode = "scalar" | "date-only" | "instant-ms";

interface ReconciliationKeyPair {
  id: string;
  expectedFieldId: string;
  actualFieldId: string;
  mode: ReconciliationKeyMode;
}

interface ReconciliationExclusion {
  key: Array<string | number | boolean>;
  reason: string;
}

interface ReconcileStep {
  id: string;
  kind: "reconcile";
  expectedStepId: string;
  actualStepId: string;
  as: string;
  keyVersion: 1;
  keys: ReconciliationKeyPair[];
  observations: { min: number; max: number | null };
  exclusions: ReconciliationExclusion[];
}
```

The arrays of key components belong in configuration, not in raw source cells; the existing source-row validator accepts scalar cells. `as` defines the scalar result-field prefix. Labels and prose may be edited without changing matching semantics.

Use explicit empty arrays/default values in the normalized saved model so UI and text round trips have one canonical form. Do not store cached counts as authoritative configuration.

### Public API

Export the pure core separately from the project adapter:

```ts
reconcileRecords({
  definition,
  expected: { rows, fields, availability, revision, label },
  actual: { rows, fields, availability, revision, label },
}): ReconciliationResult
```

Each input row has a unique occurrence ID within its input revision, scalar values, and real source references. Each ready input also supplies an explicit field schema, even when empty; a nonexistent mapped field is a definition error, not an absence result. The function returns:

- A ready or blocked state with reasons.
- One group per valid union key.
- Invalid expected and actual occurrence lists.
- Exact side/member counts and ratios.
- Typed canonical keys and role-specific evidence.
- Definition/input revisions and warnings.

Invalid configuration produces a structured configuration error or validator failure before evaluation. Unavailable data produces a blocked result, not an exception masquerading as a valid empty result. Raw invalid keys produce inspectable invalid occurrence lists.

The same production function powers the public API, project step, inspector, and notebook adapter. Fixture expectations remain independently authored assertions against which that function is tested. Avoid separate matching implementations in UI and query code.

### Scalar result frame

The project adapter emits ordinary `AnalysisResultRow` objects:

- Valid keys: `rowKind=key`, `presence`, `required`, key component fields, `expectedCount`, `actualCount`, duplicate flags, `cardinality`, `minimumMet`, `withinPolicy`, `shortfall`, `excess`, and exclusion reason.
- Invalid occurrences: a side-specific `rowKind`, `required=false`, no presence/cardinality, one original occurrence, original key inputs, and component-level reasons.
- Field origins point to the reconciliation step. They do not pretend that synthetic result fields are raw actual columns.
- Non-applicable counts/policy values on invalid rows are null/undefined, not misleading zeros.

Thus charts and findings can use scalar fields while the metadata preserves the richer evidence. A generic unfiltered count over this mixed frame counts result rows; the built-in templates must explicitly restrict key or invalid-occurrence populations.

### Evidence extension

Choose a stage-owned immutable reconciliation evidence map, exposed by `AnalysisEvaluation.reconciliations`, with optional `AnalysisResultRow.reconciliationRefs` pointing to its exact group or invalid-occurrence entries. Filters and calculations preserve those references; aggregate results union them. The evidence map must distinguish:

- Expected source references.
- Actual source references.
- Generated expectation witness: schedule step, roster references, candidate date, cadence/skip decision.
- Invalid component details.
- Input and definition revision.

`sourceRows` and `contributors` remain real references only. For an absent explicit key they contain expected evidence and no actual evidence. For generated expectations, roster source rows can be real contributors, while the generated occurrence is a separate witness. Never fabricate an actual row key for absence.

### Dependency and stage integration

Introduce a small `inputStepIds(step)` switch for source, unary, reconcile, and later schedule. Reuse it in:

- Query validation/cycle traversal.
- Recursive evaluation and cache dependency collection.
- Project-file validation and field resolution.
- View export closure.
- DSL reference checking/export ordering.
- Revision input collection.
- Folder source promotion where needed.

Keep this helper direct; a general operator registry is unnecessary.

Add role-aware stage inputs and a typed reconciliation summary. Compatibility `inputCount` can be the sum of the two input occurrence counts, explicitly labeled as combined inputs. For any query depending on a reconciliation step, legacy `counts.source` should have a documented combined-input convention; no UI may interpret it as the expected denominator. All coverage comes from the dedicated summary. `excludedCount` is not overloaded to mean absent or skipped.

The final output row count includes valid key rows and invalid occurrence rows. Name that unit exactly.

### Input availability and dependency failures

Add an optional evaluation-options argument to `evaluateAnalysisQuery` carrying per-source runtime state. A supplied host array defaults to ready **for that supplied snapshot**. Folder adapters explicitly mark missing/unreadable/pathless unresolved inputs unavailable and propagate known partial-read state.

Private frames carry readiness. Reconcile blocks when either dependency is unavailable, known partial, or failed. Missing/invalid parameters and upstream calculation errors also block the initial implementation. This prevents a failed filter or calculation from creating a false all-absent result. Legitimate raw invalid key values remain quarantined data, not failed evaluation.

A source limit is part of the declared population only when the analyst intentionally names that limited dataset. Known truncation of an intended complete read is a blocked input. Do not infer truncation merely because a row count happens to equal a limit, and do not invent an external ingestion-certification system.

### Persistence choice

Keep `AnalysisProject.version=1` and the project-file envelope version 1 as an additive step extension. Older readers already reject unsupported operations; document the minimum feature version when shipped. Do not silently downgrade a reconciliation query into lookup steps.

Extend JSON validation, stringify/parse, and selected-view closure in the same release as the saved operator. Reuse the current special-value codec for source tables. A failed/unavailable table is omitted from portable bundles while its source definition remains; a deliberately empty ready table remains an explicit `[]`.

Do not export known-partial arrays as ready analysis inputs. Refuse that complete-bundle export with a concrete explanation. An explicit definitions-only export may omit those tables and reopen as unavailable. Folder snapshot caches must retain any known-partial marker through their existing metadata; if that marker cannot survive, do not reuse the cache as a ready reconciliation input. The unprovided snapshot module must be inspected before implementing this seam.

## 8. Text round trips and notebook findings

### Project text

Use explicit source branches and explicit input names. The following is proposed grammar, not syntax implemented by the baseline:

```text
query @daily-check "Daily station readings" glyph=R frame="reconciliation keys" {
  source @expected-rows expected
  source @actual-rows actual
  reconcile @reconciled expected=expected-rows actual=actual-rows as=rec key-version=1 min=1 max=1 {
    key @site expected.site actual.site mode=scalar
    key @day expected.day actual.day mode=date-only
    exclude values="[\"A\",\"2026-10-28\"]" reason="Planned maintenance"
  }
}
```

The quoted JSON value in an exclusion preserves typed scalar tuple values without introducing a general expression language. The parser must decode exactly one JSON array, validate its length/types against the key specification, and preserve explicit text-vs-number distinctions. `max=none` is the canonical text spelling of `max:null`.

Export in stable dependency order. Both branches precede reconcile; both inputs are always written, never inferred from the previous step. Preserve key order, comparison modes, min/max, all exclusions/reasons, source paths, and parameter bindings. Test model → text → model and text → model → canonical text.

The new grammar is intentionally explicit. Its tokenizer compatibility and diagnostics are future acceptance tests; this research did not run the repository parser.

### Notebook binding

Use one notebook input query for the first release. Locate `readNotebookText` through the actual notebook index export and reuse its existing query-binding convention if present. If there is no such convention, add a narrow `query @daily-check` binding declaration owned by the notebook-read adapter, remove/blank that declaration before dashboard compilation, and preserve file line numbers. Do not pass a project query body into `compileNotebook` as if it were a chart declaration.

The exact baseline binding syntax cannot be asserted because the read adapter is not supplied. The plan makes this an implementation lookup with a chosen fallback, not an unresolved semantic design.

### Findings reuse

Create four ordinary metric findings and a share:

```text
finding @required count where.rec.rowKind=key where.rec.required=true
finding @observed count where.rec.rowKind=key where.rec.presence=matched
finding @absent count where.rec.rowKind=key where.rec.presence=absent
finding @within count where.rec.rowKind=key where.rec.withinPolicy=true
finding @coverage share of=observed,required digits=1
```

These declaration spellings are proposed template text and must be reconciled with the unprovided dashboard finding grammar. Their normalized `FindingDefinition` semantics are exact: count the named subsets and divide observed count by required count. Never substitute a ratio of input row totals.

Example prose:

> Observations were present for {{observed}} of {{required}} valid required keys ({{coverage}}). Inspect the [absent expectations](#finding:absent).

The context bridge supplies the result revision, stable key-to-current-numeric-ID mapping, row-unit labels, availability, and role-specific provenance. All operands are evaluated against one revision. The runtime numeric IDs are not the persisted identity.

- Without a chart binding, these findings read the full reconciliation result plus their own predicates. This fits the baseline finding scope behavior.
- If an author intentionally binds a finding to a chart selection, its wording states that selected scope.
- Workspace/result display filters do not alter the saved source population or the headline denominator.
- An absent finding link opens result keys and expectation evidence. It does not open fabricated actual rows.
- An invalid-key finding counts input occurrences, explicitly naming Expected or Actual.
- Add `input-unavailable` to finding unavailable states and return it before interpreting an empty array as a count of zero.
- Preserve “no required keys” behavior for a zero denominator.
- Render scope and definition-quality qualifications beside findings, including invalid expected rows.

Existing shares accept counts, not sums. The first notebook release supports key coverage/minimum-met/within-policy shares. Actual-row totals may be individual sums of `actualCount`; do not present sum/sum ratios through the count-share API. A richer ratio finding is an Explore recommendation.

### Writeback and frozen text

Configuration edits write project text, not chart-only notebook writeback. Adding/editing finding declarations needs a narrow writer or guarded canonical insertion, followed by compile-and-compare validation. Preserve prose, comments, unrelated chart declarations, and line mapping.

A broken notebook block may show its last valid definition under the existing frozen mechanism. Clearly label which definition is active. Do not display new invalid text’s claim over old results as if it had been evaluated. A result from a failed data refresh is separately stale; frozen definition and stale data are different states.

## 9. Refresh and source provenance

Refresh preserves the meaning of the saved analysis while making changed evidence visible.

1. Capture the definition, bindings, and both immutable input arrays/states for one evaluation.
2. Build all group memberships and counters.
3. Assign one evaluation revision including both input identities, source states, and all relevant configuration.
4. Publish the result atomically.
5. Re-resolve selected canonical group keys.
6. Close or re-resolve evidence drawers whose raw-row references are positional.

The baseline revision uses process-local array identity rather than content hashes. Reuse it for runtime invalidation, but do not treat it as a durable cross-session dataset version. Folder reopen recomputes. A persistent content-hash history system is unnecessary for this mission. [R09]

A key-focused notebook finding can remain meaningful after an absent key becomes matched: its typed key still identifies the same obligation, while a predicate finding “currently absent” updates membership. A key that no longer exists becomes unresolved focus, not a different row at the same index.

If a source refresh has a partial or failed result, retain the previous successful result with a visible prior-revision label. Do not mix new expected data with old actual data and call the pair current unless the host explicitly selected those two snapshots. No ingestion monitoring or automatic scheduling is added.

## 10. Bounded schedule generation

### Why it is a second stage

An expected table is general, easy to inspect, and already fits source persistence. It can express irregular plans, specific sites, dates, slots, and externally authored obligations.

A schedule is a concise authoring tool for repetitive expectations. It adds semantics for calendar bounds, cadence, exceptions, roster identity, generated evidence, and candidate size. It should compile into the same reconciliation input contract, not introduce a second matcher.

### Chosen initial calendar contract

A schedule reads an explicit independent roster with one valid unique tuple per entity. It saves:

- Inclusive start date and exclusive end date.
- Date-only calendar semantics.
- Daily cadence with positive interval, or weekly cadence with explicit weekdays, interval, and anchor.
- A date output-field ID and roster component mappings.
- Explicit skipped dates/keys with reasons.
- A candidate limit checked before allocation.

**Generate every daily candidate in roster × [start, end).** Mark days not due under the cadence as excluded with a generated reason. Apply explicit skips as exclusions too. This deliberately retains the bounded skipped-calendar ledger.

This is a product choice, not a claim that PostgreSQL or RFC recurrence returns such a ledger. It enables an actual Saturday record at a known closed station to be explained as observed on an excluded day rather than an unknown key.

Daily cadence uses whole calendar-day offsets from the saved anchor. Weekly cadence uses Monday-based calendar weeks, an explicit anchor week, and named weekdays. Both include their anchors in the saved model so changing the visible start does not accidentally shift an every-other-week plan.

A duplicate or invalid roster tuple blocks generation with inspectable roster evidence. Do not silently multiply obligations or infer a deduplication rule. Table-based reconciliation remains available for messy expectations.

Use an initial **100,000 candidate** guard as a proposed product limit, not a measured performance claim. Count skipped candidates against it. If the bound is exceeded, ask the analyst to narrow the range/roster or provide an explicit expectation table; never silently truncate. Tune the limit only after targeted measurement.

### Actual population remains explicit

Schedule bounds define expected candidates. They do not silently filter actual rows. Actual keys outside the declared roster/window remain unexpected unless the analyst saves a visible actual-population filter.

This preserves detection of unknown entities. Automatically filtering actual rows to known roster values would hide precisely the unexpected records reconciliation should reveal.

The UI can offer “Use this date window for actual rows,” but applying it must create a visible saved input filter and show affected counts. Instant scopes still require explicitly prepared epoch fields; the initial schedule itself uses date-only keys.

### Generated provenance and parity

A generated expectation records:

- Schedule step and definition.
- Roster source reference.
- Candidate calendar date.
- Cadence decision.
- Explicit skip reason, if any.
- Evaluation revision.

It has no synthetic actual source row. The equivalent export contains both the candidate table and the keyed exclusion list. Optional required/excluded columns and reasons help people inspect the table, but those columns alone do not configure the chosen operator. Reconciliation of that table with its exclusion list must produce the same membership sets and metrics as the generated input.

Do not add daylight-saving recurrence, month-end rules, arbitrary holiday services, fuzzy time windows, or rolling “now” in this milestone. Those are separate semantic problems. A fixed saved end makes notebook replay deterministic.

## 11. Exact fixtures and reference checks

The complete machine-readable cases are in **exact-fixtures.json**, with an executable independent reference oracle in **verify-fixtures.mjs**. **fixture-guide.md** explains the cases, expected sets, exact fractions, and how to transfer them into repository tests.

The fixtures cover:

- A composite site/date key with one valid zero measurement.
- A required absent key.
- Repeated expected definitions and repeated actual observations.
- An actual key not declared by expectations.
- Excluded keys with and without observations.
- Invalid keys on each side.
- Numeric/string/boolean collisions and delimiter-shaped composite values.
- Existing rows with missing or invalid measures that still satisfy presence.
- Strict date-only and instant-millisecond preparation.
- Minimum/maximum observation counts.
- Empty required denominators.
- Loaded empty actual data versus unavailable data.
- Input filters versus output-display filters.
- Refresh/reorder identity.
- A bounded schedule and its equivalent explicit table.

The oracle checks explicitly authored expected memberships and exact integer counters. All 15 reconciliation cases and 20 key-codec vectors passed on Node v24.22.1. Additional checks cover count identities, input reorder, absent-to-matched identity, table/schedule parity, candidate limits, unused exclusions, and measurement-value invariance. It does not import explorEDA, patch the source packet, run the repository test suite, or prove browser integration. Its execution is a semantic consistency check on this proposal.

### Worked core fixture: exact memberships

F01 declares expected rows e1–e9 and actual rows a1–a10. The key is `(site, day)`, the policy is exactly one actual row, and A/Oct29 is excluded for “Planned closure.” All dates below are in 2026.

| Key | Expected / actual occurrence IDs | Membership and independent flags |
|---|---|---|
| A / Oct26 | e1 / a1 | Matched; a1 has a valid measure of 0. |
| A / Oct27 | e2 / a2, a3 | Matched; repeated actual key; over maximum. |
| A / Oct28 | e3, e4 / a4 | Matched; duplicate expected key; a4's measure is null. |
| B / Oct26 | e5 / a5 | Matched; within policy. |
| B / Oct27 | e6, e7 / none | Absent; duplicate expected key; below minimum. |
| A / Oct29 | e8 / a8 | Excluded; observed on an excluded key. |
| Z / Oct26 | none / a6, a7 | Unexpected; repeated actual key. |

Expected e9 has a missing site. Actual a9 has a missing site; a10 has an invalid date. They are invalid occurrences, not key memberships.

The exact accounting is:

- Expected occurrences: 9 = 1 invalid + 6 valid distinct keys + 2 excess duplicate occurrences.
- Actual occurrences: 10 = 2 invalid + 5 on required keys + 1 on an excluded key + 2 on an unexpected key.
- Valid key groups: 7 = 4 matched + 1 absent + 1 excluded + 1 unexpected.
- Required-key coverage: 4/5 = 80%; within-policy share: 3/5 = 60%.
- Valid actual-row relevance: 5/8 = 62.5%, a different question from key coverage.
- Expected duplicate groups: 2; actual repeated groups: 2. Those four flags are not added to the seven primary groups.

F10 adds a zero-valued observation a11 for B/Oct27: presence becomes 5/5 while the invalid expected declaration still qualifies any source-wide completeness claim. F09 instead filters the actual population to `value > 0`: A/Oct26 and A/Oct28 become absent within that narrower population, yielding 2/5 coverage. A display-only Absent lens must leave F01's 4/5 headline unchanged; the UI part of that assertion remains an implementation test.

A useful observation-count fixture has required keys A, B, C, D, actual counts 4, 2, 1, 0, and policy minimum 2/maximum 3:

- Presence coverage: 3/4.
- Minimum-met keys: 2/4.
- Within-policy keys: 1/4.
- Minimum attainment: (2 + 2 + 1 + 0)/8 = 5/8.
- Absent: D.
- Short of minimum: C and D.
- Over maximum: A.
- Repeated actual keys: A and B.

This demonstrates why presence, minimum fulfillment, count compliance, and duplication need different labels.

## 12. Recommendations and stable dispositions

These IDs are stable across the report and implementation plan.

| ID | Disposition | Recommendation |
|---|---|---|
| ER01 | Build | A named explicit-table reconciliation analysis with source roles, population review, and an inspectable key ledger. |
| ER02 | Build | One pure core plus a dedicated two-input query operator; preserve grouped evidence rather than join pairs. |
| ER03 | Build | Separate source identity from typed composite matching identity and stable result-key identity. |
| ER04 | Build | Propagate source/dependency availability before claiming absence; preserve it across refresh and reopen. |
| ER05 | Build | Exclusive key presence plus overlapping duplicate/count-policy flags and explicit denominator formulas. |
| ER06 | Build | Keyed exclusions with reasons, visible observed-on-excluded rows, and unused-exclusion diagnostics. |
| ER07 | Build | Saved expected/actual populations distinct from result-display filters and notebook selection scopes. |
| ER08 | Build | Honest expected/actual/generated provenance and revision-aware record actions. |
| ER09 | Build | JSON, DSL, view closure, and folder reopen in the same release as the saved operator. |
| ER10 | Build | Reuse notebook counts/shares through availability, unit, identity, and provenance adapters. |
| ER11 | Build | Bounded date-only roster/calendar generation with exact table parity and a candidate guard. |
| ER12 | Explore | Fixed UTC cadence and named-zone calendar schedules after their distinct identity and DST contracts are designed. |
| ER13 | Explore | Per-key count targets, unique-event count units, and observation-weighted notebook ratios. |
| ER14 | Explore | Worker evaluation or larger-scale indexing only after focused profiling of the real result/evidence UI. |
| ER15 | Defer | General full outer join, arbitrary cross-query references, and expanded/aggregated observation grains. |
| ER16 | Defer | Full RRULE, month-end/holiday engines, tolerance-window allocation, and automatic late/overdue classification. |
| ER17 | Avoid | Inferring expectations from observed category combinations, zero-filling absent measures, fuzzy matching, or choosing the first duplicate. |
| ER18 | Avoid | A general rules engine, ingestion monitoring, paid services, and outside-demand gates. |

Explore means a useful later design question, not a prerequisite to Build. Defer means explicitly outside these milestones. Avoid means incompatible with the selected boundary or the mission.

## 13. Main risks and open questions

### Main risk

The largest risk is **claiming absence over the wrong population or over unavailable data**, followed by losing the expected-side provenance when synthetic result rows pass through existing table and notebook machinery. The two-input algorithm itself is straightforward.

The implementation plan targets these boundaries with small exact tests: known empty versus missing, dependency failure versus empty filter, both-input closure, absent finding actions, and stable group identity after refresh. No broad robustness audit is proposed.

### Settled defaults

- Expected table first; schedule second.
- Composite matching from the first API release.
- Distinct expected-key coverage is the primary headline.
- Exactly one actual input row per required key by default.
- Positive minimum, optional upper bound.
- Duplicate expectation rows do not multiply obligations.
- Invalid keys are visible outside key denominators.
- Explicit excluded keys remain inspectable.
- End bounds are exclusive.
- Unknown input state blocks current absence claims.
- No automatic coercion, inferred expectations, or hidden deduplication.

### Open implementation questions with bounded resolutions

1. **Where does the current project host bind notebook input queries?** Inspect the exact `readNotebookText` export. Reuse its convention; otherwise add the narrow binding described in section 8.
2. **Where do existing snapshots encode read completeness?** Inspect the imported snapshot module. Propagate an existing marker or add a narrowly versioned marker; never reuse known-partial data as ready.
3. **How should the key table expose two evidence roles?** Inspect the project trace/Rows adapter. Add a reconciliation resolver instead of flattening both sides into an indistinguishable source action.
4. **Which public entrypoint exports the core?** Inspect package exports before adding symbols. Do not invent a second package or framework.
5. **Is 100,000 schedule candidates the right product limit?** Start with this explicit guard; adjust after one targeted performance assessment. The design does not depend on a guessed throughput claim.
6. **Which component owns view-specific lens/sort/selection state?** Prefer the existing view/settings mechanism after inspection. Keep all semantic input filters in the query definition.

These questions do not require a new demand study or user permission to begin implementation. They are specific code-location and integration checks for Codex.

## 14. External sources

All sources were consulted on October 30, 2026 in the client timezone. Source-derived descriptions are concise paraphrases; product proposals and fixture mathematics are original to this report.

- **S1 — pandas merge API:** https://pandas.pydata.org/docs/reference/api/pandas.merge.html  
  Supports multiple keys, membership indicators, cardinality validation, null-key caveat, and duplicate join examples.
- **S2 — Microsoft Power Query merge overview:** https://learn.microsoft.com/en-us/power-query/merge-queries-overview  
  Supports paired-column ordering, source roles, match preview, type guidance, and join choices.
- **S3 — Great Expectations uniqueness:** https://docs.greatexpectations.io/docs/reference/learn/data_quality_use_cases/uniqueness/  
  Supports compound-column uniqueness as a separate check.
- **S4 — Great Expectations result format:** https://docs.greatexpectations.io/docs/core/trigger_actions_based_on_results/choose_a_result_format/  
  Supports identifying columns, exact retrieval mechanisms, and bounded returned samples.
- **S5 — tidyr complete:** https://tidyr.tidyverse.org/reference/complete.html  
  Supports explicit expansion/nesting and differentiation of newly created versus existing missing values.
- **S6 — PostgreSQL 18 set-returning functions:** https://www.postgresql.org/docs/18/functions-srf.html  
  Supports bounded series and timezone-aware daylight-saving behavior.
- **S7 — dbt data tests, relationships:** https://docs.getdbt.com/reference/resource-properties/data-tests?version=2#relationships  
  Supports the direction of referential-integrity checks and separate null handling.
- **S8 — RFC 5545, exclusion dates and recurrence:** https://www.rfc-editor.org/rfc/rfc5545.html#section-3.8.5.1  
  Supports exclusion precedence and duplicate recurrence-instance treatment.

## 15. Repository evidence and complete reading inventory

All of the following complete files were read from the supplied packet. These citations identify paths and symbols at the stated baseline; they do not claim access to omitted imports.

- **R01:** `AGENTS.md` — React/TypeScript, pnpm, feature docs/examples, targeted verification, release rules.
- **R02:** `docs/agent-guide.md` — source map, parsing rule, immutable source data expectations, docs/example registration, browser verification widths.
- **R03:** `README.md` — embedded workspace, saved state, linked records, notebook/folder positioning.
- **R04:** `package.json` — pnpm 11.9.0 and workspace check scripts.
- **R05:** `docs/research/DIRECTION.md` — staged feature design, Byron as demand, no broad robustness audit, handoff expectations.
- **R06:** `docs/intent/research-ideas-100/ideas/R028-expected-record-reconciliation.md` — explicit expected keys versus bounded schedules; old demand threshold superseded.
- **R07:** `docs/intent/missingness-and-expected-records/intent-brief.md` — missing cells versus absent observations; explicit expected-set boundary.
- **R08:** `packages/explorEDA/src/types/AnalysisProject.ts` — `SourceDefinition`, `RelationshipDefinition`, `AnalysisStep`, `AnalysisResultRow`, `AnalysisStage`, `AnalysisEvaluation`.
- **R09:** `packages/explorEDA/src/lib/analysis/evaluateProject.ts` — `sourceReferences`, `lookupFrame`, `expandedFrame`, `calculateFrame`, `filterFrame`, `aggregateFrame`, `validateQuery`, `tableRevision`, `evaluateAnalysisQuery`.
- **R10:** `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts` — typed keys, ambiguity, duplicate source IDs, cycles, query/export dependencies, parameter behavior, text round trips.
- **R11:** `packages/explorEDA/src/lib/analysis/sources.ts` — `sourceFromRows`, `addSourceFromRows`, `singleTableProject`.
- **R12:** `packages/explorEDA/src/lib/analysis/projectFile.ts` — `encode`, `decode`, `selectAnalysisProjectView`, `stringifyAnalysisProject`, `parseAnalysisProject`, `validateAnalysisProjectFile`.
- **R13:** `packages/explorEDA/src/lib/valueParsing.ts` — `isMissingValue`, `parseNumber`, `finiteNumber`, `parseDateText`, `timeOfDay`, `timestampOf`, `dateBound`.
- **R14:** `packages/explorEDA/src/lib/notebook/compileNotebook.ts` — `blockProblems`, `compiledLines`, `compileNotebook`, frozen-block and line-mapping behavior.
- **R15:** `packages/explorEDA/src/lib/notebook/findings.ts` — `MetricFinding`, `ComparisonFinding`, `FindingContext`, `evaluateFinding`, `compareFindings`, `evaluateNotebookFindings`.
- **R16:** `packages/explorEDA/src/lib/notebook/writeBack.ts` — `writeBackChart`, `writeBackSettings`, splice/rewrite verification.
- **R17:** `packages/explorEDA/src/lib/dsl/project.ts` — `stepLines`, `compileStep`, `checkReferences`, `compileProjectText`, `exportProjectText`.
- **R18:** `packages/explorEDA/src/lib/project/folder.ts` — `ProjectFolder`, `readSnapshot`, `inferSource`, `readProjectFolder`.
- **R19:** `packages/explorEDA/src/lib/project/writeFolder.ts` — `declaredSource`, `projectFileText`, `analysisFileText`.

Repository baseline link: https://github.com/byronwall/explorEDA/tree/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6

## 16. Access and verification status

**Access:** complete access to the prompt and all 19 scoped baseline files. No decisive source required for this Design recommendation was missing. Omitted host/adapter implementation files remain explicit Codex inspection tasks.

**Checked:** complete source reading; primary-source research; independent integration and semantic review; exact fixture membership/count checks using the supplied standalone oracle. The fixture guide records the execution result.

**Not claimed:** repository build/typecheck/test execution, browser usability testing, competitor UI testing, production benchmarks, implementation, PR creation, or deployment.

**Proposed:** every new operator, API, UI, grammar extension, notebook bridge, availability change, and schedule capability described above.

**Original companions:** [implementation-plan.md](implementation-plan.md), [exact-fixtures.json](exact-fixtures.json), [verify-fixtures.mjs](verify-fixtures.mjs), and [fixture-guide.md](fixture-guide.md). The final response links every original file and the ZIP bundle individually.

