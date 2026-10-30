# Joint missingness — proposed notebook end state

**Status:** authored specification for the implementation plan. The `joint-missingness` chart, `patterns` alias, and M2 `inputSelection` alias are proposed additions and do not run on the supplied baseline. Finding syntax, `field ... as=`, null-token settings, named charts, and record links reuse existing notebook mechanisms.

**Data:** use `sixField.rows` from [fixture-data.json](fixture-data.json). The complete sections below use an embedded notebook whose `data` contains those twelve rows with unqualified keys `x`, `y`, `z`, `note`, `flag`, `w`, and `group`. Preserve r11’s absent `w` property and r12’s literal string `"Infinity"`. A project-folder query normally exposes source-qualified field keys; use the explicit adaptation in §D instead of assuming the same bare names are available.

**Reading:** every number refers to current query-output records. The `id` values are human-readable source identifiers, while runtime `__ID` positions are regenerated. The kept selectors below store pattern/rule meaning, not either kind of member list.

## A. M1 — exact patterns with kept findings

Copy the complete Markdown section below after M1 is implemented. It begins in the kept state with exact x/y OR exact note selected. The other diagnostic fields must be present for each selected exact pattern.

````markdown
# Which fields are missing together?

The chart’s current selection contains **{{selected}} of {{scope}} records
({{selected-share}})**. Its visible selection status names the current predicate.
[Open the selected records](#finding:selected), or
[open the full current scope](#finding:scope).

For group A, the same selection contains **{{selected-a}} of {{scope-a}}
records ({{share-a}})**. For group B, it contains **{{selected-b}} of
{{scope-b}} records ({{share-b}})**.

[Group A selected records](#finding:selected-a) ·
[Group B selected records](#finding:selected-b).

These rates describe the available records and the current selection.
They do not establish why values are absent.

```eda
field x as=numeric
field note as=categorical nullTokens[]=NA

chart joint-missingness @gaps fields[]=x,y,z,note,flag,w {
  title="Which fields are missing together?"
  patternSort=frequency
  patterns[]=
  patterns.0[]=x,y
  patterns.1[]=note
}

finding @selected count chart=@gaps
finding @scope count chart=@gaps population=eligible
finding @selected-share share selected scope digits=1

finding @selected-a count chart=@gaps where.group=A
finding @scope-a count chart=@gaps population=eligible where.group=A
finding @share-a share selected-a scope-a digits=1

finding @selected-b count chart=@gaps where.group=B
finding @scope-b count chart=@gaps population=eligible where.group=B
finding @share-b share selected-b scope-b digits=1
```
````

### Exact expected readings

| Finding | Value | Record membership |
|---|---:|---|
| selected | 4 | r05, r06, r07, r12 |
| scope | 12 | r01–r12 |
| selected-share | 33.3% displayed; exact 1/3 | Numerator is a subset of scope |
| selected-a | 3 | r05, r06, r07 |
| scope-a | 8 | r01–r08 |
| share-a | 37.5% | 3/8 |
| selected-b | 1 | r12 |
| scope-b | 4 | r09–r12 |
| share-b | 25.0% | 1/4 |

The group findings already use existing count/share syntax; they do not require M2’s comparison UI. A sibling notebook chart selecting group A must not change these numbers. A workspace `filter` or the gaps chart’s own `where.` restriction does change the base population.

### Exploration and persistence journey

1. Clear the current selection, then click x-only. The live `@gaps` finding changes to r02/r03/r08, count 3; the notebook source still contains the previously kept x/y-or-note selector. Clicking x-only without clearing would add it to that union and select seven records.
2. Choose Keep selection. The source records the x-only semantic pattern. One text callback occurs; the folder host reports save acknowledgment separately.
3. Reopen after successful save. Count is 3 and IDs are r02/r03/r08.
4. Correct r08.x from `"bad"` to `0`, then evaluate the kept notebook over the changed source. x-only becomes r02/r03, count 2; the saved predicate remains x-only.
5. Reverse source order. The same semantic business IDs remain selected; numeric runtime positions change.
6. Reset to kept returns the live chart to the current authored selector. Undo Keep restores only the prior authored selector through guarded verified writeback; it does not silently overwrite unrelated prose or change the live preview.

An unavailable referenced field makes these chart-bound findings unavailable. It does not turn a broken analysis into a valid zero or remove the saved restriction.

## B. M2 — compare a chosen finite-number input set

Add the following section to the same notebook after M2. Field preparation from section A continues to apply. The chart’s selector is independent of `@gaps`, because notebook selections stay local. The expected readings below start from the original fixture: if section A’s edit journey was followed, restore r08.x to `"bad"` first. Keeping the corrected `0` would admit r08 too, producing four finite-input records.

````markdown
## Current input requirement and selection

The input chart’s current selection contains **{{input-count}} of
{{input-scope}} records ({{input-share}})**. Read its visible required fields,
presence/finite-number rule, and admitted/excluded selection with this count.
This declared input check does not establish that every statistical method is
appropriate.

[Open the selected input records](#finding:input-count).

Group A contributes **{{input-a}} of {{input-scope-a}} ({{input-share-a}})**.
Group B contributes **{{input-b}} of {{input-scope-b}} ({{input-share-b}})**.

```eda
chart joint-missingness @inputs fields[]=x,y,z,note,flag,w {
  title="Chosen input requirements"
  groupField=group
  eligibility.fields[]=x,y,w
  eligibility.requirement=finite
  inputSelection=eligible
}

finding @input-count count chart=@inputs
finding @input-scope count chart=@inputs population=eligible
finding @input-share share input-count input-scope digits=1

finding @input-a count chart=@inputs where.group=A
finding @input-scope-a count chart=@inputs population=eligible where.group=A
finding @input-share-a share input-a input-scope-a digits=1

finding @input-b count chart=@inputs where.group=B
finding @input-scope-b count chart=@inputs population=eligible where.group=B
finding @input-share-b share input-b input-scope-b digits=1
```
````

### Exact expected readings

- Admitted: **r01, r07, r10**; 3/12 = 25.0%.
- Group A: r01/r07; 2/8 = 25.0%.
- Group B: r10; 1/4 = 25.0%.
- Switching the requirement to `present` admits r12 too: r01/r07/r10/r12; 4/12 = 33.3%.
- Selecting `inputSelection=ineligible` under the finite requirement selects r02/r03/r04/r05/r06/r08/r09/r11/r12; 9/12 = 75.0%.
- The first eight excluded records have required missing values. r12 has all required values present, but w is `"Infinity"` and fails the finite-number requirement.
- r10 is incomplete across the six diagnostic fields but has every required numeric input. r01’s zero is finite and its false flag is present.

Do not add `finding @gap difference share-a share-b`; the baseline comparison model does not support subtracting share findings. Show the two live rates. The M2 chart may display its own bounded descriptive percentage-point gap.

## C. Selector states that must remain distinct

These are alternative declarations, not settings to combine in one chart.

| Meaning | Proposed authored selector |
|---|---|
| No selection | Omit `patterns` and `inputSelection`, or remove the active selector with its `unset` form |
| Explicit active-empty | `patterns[]=` alone |
| All six chosen fields present | `patterns.0[]=` |
| Exactly x and y missing | `patterns.0[]=x,y` |
| Exactly x/y OR exactly note missing | `patterns.0[]=x,y` plus `patterns.1[]=note` |
| Finite admitted cohort | Finite eligibility settings plus `inputSelection=eligible` |
| Finite excluded cohort | Same rule plus `inputSelection=ineligible` |

A nonempty selector with no current matching rows remains selected. A cleared selection means every row in the chart’s base population. A zero denominator makes a share unavailable; it is not displayed as a valid percentage.

## D. Scope portability and save limits

### Project-folder query adaptation

Suppose the project has a source with ID `observations` and a query also named `observations` that preserves these twelve source rows. `evaluateProject.ts::sourceFrame` emits keys such as `observations.x`; the prefix is the **source ID**, which need not equal the query ID. Replace the two `field x` / `field note` preparation lines in section A with this native alias block, including the query binding:

```eda
eda query=observations
x=observations.x as=numeric
y=observations.y
z=observations.z
note=observations.note as=categorical nullTokens[]=NA
flag=observations.flag
w=observations.w
cohort=observations.group
```

Use `where.cohort=A` / `where.cohort=B` in all group findings and `groupField=cohort` in section B. The diagnostic `fields[]`, pattern subsets, and eligibility fields continue to use x/y/z/note/flag/w aliases; the compiler must resolve them to canonical qualified keys. `group` is a reserved alias name, so use `cohort`. For a differently named source or transformed query output, bind aliases to the actual output field keys. The original absent w property becomes a declared undefined output value in `sourceFrame`; it remains diagnostically missing, and provenance identifies the original input.

These native binding facts come from [`evaluateProject.ts::sourceFrame`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/analysis/evaluateProject.ts) and [`compile.ts` alias handling / `DSL_OTHER_KEYWORDS`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/dsl/compile.ts). The new chart and selector paths still require the implementation described in the plan.

### Scope and save contract

- A notebook section copied from a dashboard must reproduce its scope and field preparation. Peer-chart selections do not automatically become notebook-wide filters.
- M1 Copy notebook section supports explicit ordinary workspace/local restrictions and no active peer-chart selection. It must refuse an unsupported scope transfer instead of producing a broader analysis.
- The saved notebook binds to the current query/output grain. Original-source provenance requires the read-only result-row adapter specified in the plan; absent that adapter, records must be identified as current input/output records.
- Keep verifies text. The folder host’s existing save status reports whether that text reached disk. Reopen acceptance waits for successful save/flush.
- The proposed aliases must round-trip through compiler/exporter/Keep. Malformed selectors fail explicitly; schema disappearance retains a blocked named chart and its intent.

## E. Research verification boundary

Exact fixture memberships, parser/converter scalar behavior, and the distinction between raw and effective patterns were executed in the companion [verification program](verify-fixtures.mjs); [the log](verification-results.txt) reports 41 passing checks. This notebook, its new chart, Keep behavior, live findings integration, text round trips, and folder reopening remain implementation acceptance work.

See the [complete report](joint-missingness-report.md) and [implementation plan](joint-missingness-implementation-plan.md) for the decision, sources, milestones, and stable recommendation IDs.
