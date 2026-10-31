# Exact fixtures and verification guide

**Companions:** [exact-fixtures.json](exact-fixtures.json) and [verify-fixtures.mjs](verify-fixtures.mjs)  
**Design:** [report.md](report.md) and [implementation-plan.md](implementation-plan.md)  
**Baseline:** `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`  
**Status:** independently authored design assertions, checked by a standalone reference oracle.

## 1. What was actually run

The final suite passed on **Node v24.22.1**:

- **15 exact reconciliation cases** with manually specified memberships, occurrence IDs, counters, and numerator/denominator pairs.
- **20 key-codec vectors** covering type distinctions, false, zero, negative zero, blanks, undefined, NaN, infinities, unsupported objects, composite collisions, strict dates, and instant precision.
- Source-row and key-group count identities.
- Table/generated-schedule equivalence.
- Input reorder invariance.
- Absent-to-matched canonical matching-key stability.
- Candidate-limit rejection before allocation.
- Invalid/missing measurement invariance.
- Stale schedule skips and unused exclusion validation.

The oracle is dependency-free and imports only Node built-ins. It does not import, modify, build, or run explorEDA. It is a reference calculation for this Design proposal.

**Not executed:** React interactions, project DSL parsing, notebook compilation, serialized project/folder round trips, real refresh actions, source read adapters, or production performance tests. Display-filter isolation is explicitly logged as a future integration requirement.

## 2. Run sheet

Keep the two files in the same directory. The script resolves the JSON relative to its own file, so it works regardless of the current shell directory.

```bash
# Run the complete standalone design fixture suite.
node verify-fixtures.mjs

# Expected final summary:
# [fixture] PASS all 15 reconciliation cases; exact counts,
# overlap-safe identities, schedule equivalence, refresh keys,
# and key vectors verified
#
# A NOTE states that display-filter isolation still needs project/UI tests.
# A LIMIT line identifies repository and browser checks that were not run.
```

No installation, package manager command, network access, or repository checkout is needed for this check. Future repository implementation uses pnpm as specified in the plan.

## 3. Fixture format and units

Each case defines:

- `keyModes`: one comparison mode per ordered tuple component.
- `observationPolicy`: minimum and maximum actual input rows per required key.
- `expectedSource` and `actualSource`: loaded or unavailable/partial input, with exact occurrence IDs.
- `exclusions`: typed tuple plus reason.
- `expectedResult`: explicitly authored result, independent of the evaluator.

Occurrence IDs such as e1 and a1 identify original fixture records. They are not business matching keys. Multiple IDs can share one match tuple.

The fixture state `loaded` corresponds to proposed production input state `ready`. Its result state `unavailable` corresponds to proposed production `blocked`. These fixture names do not prescribe the final TypeScript field spelling.

The oracle uses one first invalid-component reason per occurrence. Production may show every invalid component, but it must count each bad record once.

### Output conventions

- `groups` has one entry per valid union key.
- Primary `presence` is matched, absent, unexpected, or excluded.
- `duplicateExpectedKey` and `repeatedActualKey` are overlapping flags.
- `cardinality` is short, within, or over for required keys; null for excluded/unexpected keys.
- Invalid expected/actual input lists are separate from groups.
- `unusedExclusions` contains valid declarations that do not apply to a current expected key.
- Ratios retain exact numerator and denominator. A zero denominator has `available:false`.
- Unavailable inputs return no current groups or metrics. Their empty arrays are not valid empty-population evidence.

The fixture JSON uses explicit hydration instructions only for JavaScript values that ordinary JSON cannot represent, such as undefined, NaN, infinities, and negative zero. A null placeholder with a hydration instruction is not itself the test input. The script applies the stated transformation before key preparation.

## 4. Case inventory

| Case | Exact result | Main distinction |
|---|---|---|
| F01-core | 5 required; 4 matched, 1 absent; 1 excluded, 1 unexpected | Full small composite-key ledger with overlapping flags and invalids. |
| F02-typed | 6 required; 4 matched, 2 absent; 2 unexpected | Number/text/Boolean differences and preserved nonblank whitespace. |
| F03-composite | 5 required; 2 matched, 3 absent; 1 unexpected | Structural tuple identity, delimiter collisions, and component types. |
| F04-count-policy | Presence3/4; minimum attainment5/8; within bounds1/4 | Minimum/maximum counts differ from presence and repetition. |
| F05-unbounded | 2/2 present and within policy | Multiple actual rows can be legitimate. |
| F06-no-expectations | 0 required, 1 unexpected; ratio unavailable | Empty denominator is not 100%. |
| F07-known-empty-actual | 2 required, both absent; coverage0/2 | Loaded empty is meaningful evidence. |
| F08-unavailable-actual | No current memberships or metrics | Missing source is not loaded empty. |
| F09-actual-input-filter | 5 required; 2 matched, 3 absent | Saved actual population changes the semantic answer. |
| F10-refresh | 5 matched, 0 absent; coverage5/5 | New actual record changes presence without changing its match key. |
| F11-instant-precision | 2 valid required keys matched; 1 unexpected; invalids separate | Equivalent offsets match; naive/finer-precision values do not. |
| F12-explicit-schedule-table | 4 required, 3 matched, 1 absent; 3 excluded; 1 unexpected | Explicit retained calendar candidates and reasons. |
| F13-generated-schedule | Same memberships/counts as F12 | Generator changes expectation provenance, not reconciliation math. |
| F14-unused-exclusion | A absent; B unexpected; exclusion B unused | A stale exclusion cannot hide an actual-only key. |
| F15-known-partial-actual | No current memberships or metrics | A partial read cannot support a complete absence claim. |

The complete row lists and expected outputs live in the JSON, rather than being abbreviated to just totals.

## 5. F01: exact source records and result

The business key is `(site, day)`. The expected source uses unique record IDs even where the business key repeats. The policy is min1/max1. A/Oct29 is excluded for “Planned closure.” Dates in this section are in 2026.

### Expected input

| Source IDs | Match key | Meaning |
|---|---|---|
| e1 | A / Oct26 | One expected declaration. |
| e2 | A / Oct27 | One expected declaration. |
| e3, e4 | A / Oct28 | Two declarations of one key. |
| e5 | B / Oct26 | One expected declaration. |
| e6, e7 | B / Oct27 | Two declarations of one key. |
| e8 | A / Oct29 | Declared but explicitly excluded. |
| e9 | null / Oct26 | Invalid expected key. |

### Actual input

| Source IDs | Match key | Measure |
|---|---|---|
| a1 | A / Oct26 | 0 |
| a2, a3 | A / Oct27 | 5 and 7 |
| a4 | A / Oct28 | null |
| a5 | B / Oct26 | 9 |
| a6, a7 | Z / Oct26 | 3 and 4 |
| a8 | A / Oct29 | 8 |
| a9 | null / Oct26 | 1 |
| a10 | A / not-a-date | 1 |

The record with value zero is present. The record with a null measure is also present. The separate measurement-variant check replaces a5’s measure with `"not-a-number"` and then removes the property; both variants keep the same record memberships and counts.

### Exact membership sets

- Matched: A/Oct26, A/Oct27, A/Oct28, B/Oct26.
- Absent: B/Oct27.
- Excluded: A/Oct29.
- Unexpected: Z/Oct26.
- Duplicate expected keys: A/Oct28 and B/Oct27.
- Repeated actual keys: A/Oct27 and Z/Oct26.
- Invalid expected occurrence: e9.
- Invalid actual occurrences: a9 and a10.
- Below minimum: B/Oct27.
- Within bounds: A/Oct26, A/Oct28, B/Oct26.
- Over maximum: A/Oct27.

B/Oct27 is both absent and duplicate-expected. Z/Oct26 is both unexpected and repeated-actual. These overlaps are essential assertions.

### Exact totals and denominators

```text
Expected records:
9 = 1 invalid + 8 valid occurrences
8 = 6 distinct valid keys + 2 excess expected occurrences
6 distinct keys = 5 required + 1 excluded

Actual records:
10 = 2 invalid + 8 valid occurrences
8 = 5 rows on required keys + 1 on excluded keys + 2 on unexpected keys
8 = 6 distinct actual keys + 2 excess actual occurrences

Valid union groups:
7 = 4 matched + 1 absent + 1 excluded + 1 unexpected

Presence coverage = 4/5 = 80%
Within-policy share = 3/5 = 60%
Required-row relevance = 5/8 = 62.5%

Expected duplicate groups = 2
Expected rows participating in those groups = 4
Excess expected occurrences beyond one per key = 2

Repeated actual groups = 2
Actual rows participating in those groups = 4
Excess actual occurrences beyond one per key = 2
```

The invalid expected row has no placeable valid key. Thus 4/5 is coverage of **valid required keys**, not proof about every possible obligation in the original expectation file.

## 6. Count-policy and scope examples

### F04: minimum two, maximum three

Actual counts are A4, B2, C1, D0.

| Metric | Exact value | Interpretation |
|---|---|---|
| Presence | 3/4 | A, B, and C have at least one row. |
| Minimum-met keys | 2/4 | A and B have at least two rows. |
| Within bounds | 1/4 | Only B is between two and three. |
| Minimum attainment | 5/8 | A contributes2, B2, C1, D0 toward eight required minimum units. |

A’s four rows do not compensate for D’s absence. C is matched but short. B is repeated but valid under policy.

### F09: actual input filter

The explicit actual population is `value > 0`. It excludes a1 and a4 while leaving the expected population unchanged.

- Matched becomes A/Oct27 and B/Oct26.
- Absent becomes A/Oct26, A/Oct28, and B/Oct27.
- Coverage becomes 2/5.
- The interpretation is “no matching observation in the positive-value actual population.”

This is intentionally not a display filter. Merely opening the Absent result lens must keep F01’s 4/5 header. That UI property remains a future integration test.

### F10: refresh

Add a11 at B/Oct27 with measure zero.

- B/Oct27 changes absent → matched.
- Coverage changes 4/5 → 5/5.
- Within bounds changes 3/5 → 4/5 because A/Oct27 still exceeds maximum.
- e9 remains an invalid expected declaration; “100% valid-key coverage” still needs that qualification.
- The canonical matching token for B/Oct27 is unchanged.

The oracle checks the matching token. Full project-namespaced result selection and source-row refresh behavior must still be verified in the production adapters.

## 7. Calendar schedule parity

F12 and F13 compare the same actual observations with two equivalent expectation definitions.

- Explicit roster: West.
- Interval: October26 inclusive through November02 exclusive.
- Every date in the interval is a candidate.
- Monday–Friday are due.
- October28 is skipped for planned maintenance.
- Weekend candidates are retained as excluded.

| Candidate | Expected disposition | Actual membership |
|---|---|---|
| West / Oct26 | Required | s1; matched, value0. |
| West / Oct27 | Required | s2/s3; matched, repeated, over maximum. |
| West / Oct28 | Excluded: maintenance | No actual row. |
| West / Oct29 | Required | Absent. |
| West / Oct30 | Required | s4; matched. |
| West / Oct31 | Excluded: not scheduled weekday | s5; observed on excluded key. |
| West / Nov01 | Excluded: not scheduled weekday | No actual row. |
| East / Oct26 | Never declared | s6; unexpected. |

Exact totals: seven expected candidates, four required keys, three matched, one absent, three excluded, one unexpected, six actual rows. Presence is 3/4; within-policy share is 2/4.

The parity comparison ignores only expectation provenance IDs: explicit IDs e26… versus generated schedule occurrence IDs. It compares all memberships, counts, flags, reasons, invalid lists, and ratios.

The complete proposed materialization must export both the candidate table and the typed exclusion list. Required/excluded columns are useful documentation but do not replace the operator configuration.

The oracle implements the weekday fixture generator. General daily intervals and every-other-week anchor behavior are specified in the plan and remain implementation tests.

## 8. Porting fixtures into project tests

Keep the fixture source-record ID separate from the composite business key. For F01, a project adapter can map rows as follows:

```ts
// Proposed fixture adaptation for the future ReconcileStep integration.
// fixture is F01-core from exact-fixtures.json.
const expectedRows = fixture.expectedSource.rows.map((row) => ({
  id: row.id,
  site: row.key[0],
  day: row.key[1],
}));

const actualRows = fixture.actualSource.rows.map((row) => ({
  id: row.id,
  site: row.key[0],
  day: row.key[1],
  value: row.value,
}));

const reconcileStep = {
  id: "check",
  kind: "reconcile",
  expectedStepId: "expected-rows",
  actualStepId: "actual-rows",
  as: "rec",
  keyVersion: 1,
  keys: [
    {
      id: "site",
      expectedFieldId: "expected.site",
      actualFieldId: "actual.site",
      mode: "scalar",
    },
    {
      id: "day",
      expectedFieldId: "expected.day",
      actualFieldId: "actual.day",
      mode: "date-only",
    },
  ],
  observations: { min: 1, max: 1 },
  exclusions: [
    { key: ["A", "2026-10-29"], reason: "Planned closure" },
  ],
} as const;

console.log("[fixture] expected / actual rows", {
  expected: expectedRows.length, // 9
  actual: actualRows.length,     // 10
});
```

Declare both sources with `entityKey: "id"`; declare site as unknown/string according to the case, day as date metadata, and all scalar fields explicitly. Use separate source steps named expected-rows and actual-rows.

Under the supplied baseline’s source reference convention, the absent expected records would be:

```ts
[
  { sourceId: "expected", rowKey: "expected:string:e6", entityKey: "e6" },
  { sourceId: "expected", rowKey: "expected:string:e7", entityKey: "e7" },
]
```

There is no corresponding actual-source reference.

For saved typed-key test files, prefer JSON rows so numeric1 and text“1” are representable without CSV inference ambiguity. Test actual import/type handling separately after inspecting the unprovided table parser.

Do not generate expected outputs by invoking the same production reducer under test. Copy the explicit fixture assertions or adapt their shape while preserving their independent values.

## 9. Remaining implementation checks

The exact oracle establishes the selected membership algebra, not the full feature. Codex still needs the focused acceptance checks in the plan:

- Two-input graph validation, revision collection, and selected-view closure.
- Source availability through folder, analysis, and notebook adapters.
- Missing/invalid parameter and calculation-error blocking.
- JSON and project text semantic round trips.
- Query-to-notebook binding and finding grammar.
- Exact provenance links, including the empty-actual-selection trap.
- Display-filter isolation.
- Stable group focus and revision-local positional evidence.
- Partial-read export/reopen behavior.
- Bounded general cadence anchors and generator persistence.
- React keyboard and wide/intermediate/narrow interactions.
- Docs and runnable example registration.

**Access status:** all 19 supplied scoped source files were read for the design. No repository changes were made.

**Checked:** 15 cases, 20 codec vectors, and the additional semantic checks above passed.

**Proposed:** the API, UI, saved model, DSL, notebook bridge, and folder/schedule integration remain implementation work.

**Original artifacts:** [report.md](report.md), [implementation-plan.md](implementation-plan.md), [exact-fixtures.json](exact-fixtures.json), and [verify-fixtures.mjs](verify-fixtures.mjs). Individual download links and a ZIP are supplied in the final response.

