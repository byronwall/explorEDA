# Proof plan: joint missingness and analytical eligibility

**Date:** 2026-10-19  
**Repository:** https://github.com/byronwall/explorEDA  
**Authoritative supplied baseline:** `9b16d78e3ed0742ed4d5858c1939fec9e758b510`  
**Purpose:** Reject or bound the explanation-first product proposal before approving a new joint diagnostic.  
**Product implementation:** None. **Repository/UI proof:** Not run.

## 1. Separate executed arithmetic from proposed proof

| Work | Status | What it establishes |
| --- | --- | --- |
| Supplied source/test-text inspection | Executed | The contracts and assertions described below exist in the packet. Tests were not run. |
| Independent classification review | Executed | Two source audits and an independent review agreed on the enumerated fixture states. |
| Python set/count arithmetic | Executed | Exact partitions, marginals, pair/complete memberships, preview partitions, cohort contrasts, and empty-set arithmetic agree with the stated oracle. |
| Boolean/W arithmetic | Executed over explicit classifications | The fixture contains valid Boolean values, W has ten explicitly classified failures, and the complete intersection including W is empty. This is not parser execution. |
| Own-filter set arithmetic | Executed over an explicit selection set | Membership intersections/differences agree. No `applyFilter`, CrossfilterWrapper or React hook was executed. |
| Source helpers / Vitest / type checks / docs checks | **Proposed, not run** | Requires a runnable Codex checkout and omitted dependencies. |
| Author comparator / keyboard / trace / export / restore / widths | **Proposed, not run** | Requires the actual application and an observed author. |
| M1 explanation bundle | **Conditional proposal, not implemented** | May proceed only after the local source gate and a demonstrated gap. |

The executed program does **not** reimplement a parser. It aggregates a hand-reviewed classification table derived from the supplied `valueParsing.ts` and `fieldSettings.ts`. Passing it proves arithmetic consistency, not correctness of the application, a browser interaction, or demand. The complete program appears in Appendix B so this narrow executed check is reproducible.

The decision is in [joint-missingness-decision.md](joint-missingness-decision.md); stable dispositions JM-01–JM-09 are in [recommendations.md](recommendations.md). This companion is independently usable: it contains all fixture input, rules, expected sets, acceptance/rejection gates, and later commands.

## 2. Explicit ten-record fixture

### 2.1 Raw input: JSON-safe, no conversion settings

Each row is one existing measurement event. `id` is the stable domain key. Cohort A and B are deliberately constructed contrast populations; S contains semantic stress values. These labels imply no real protocol, source of missingness, or demand.

`r05` deliberately omits the `y` property. Reading it yields undefined; it is not the text `"undefined"`. All nonfinite examples are **strings**. JSON does not contain native NaN or Infinity. `r08.x` is numeric text and `r01.x` is valid zero. `flag=false` is a valid Boolean, separate from `r09.x=false`, which is not a numeric measurement.

```json
[
  {"id":"r01","cohort":"A","x":0,"y":10,"z":100,"flag":false,"w":"bad"},
  {"id":"r02","cohort":"A","x":null,"y":20,"z":200,"flag":true,"w":"bad"},
  {"id":"r03","cohort":"A","x":3,"y":null,"z":300,"flag":true,"w":"bad"},
  {"id":"r04","cohort":"A","x":4,"y":40,"z":null,"flag":true,"w":"bad"},
  {"id":"r05","cohort":"B","x":null,"z":null,"flag":true,"w":"bad"},
  {"id":"r06","cohort":"B","x":6,"y":60,"z":600,"flag":true,"w":"bad"},
  {"id":"r07","cohort":"B","x":7,"y":70,"z":700,"flag":true,"w":"bad"},
  {"id":"r08","cohort":"B","x":"8","y":80,"z":800,"flag":true,"w":"bad"},
  {"id":"r09","cohort":"S","x":false,"y":" ","z":"bad","flag":true,"w":"bad"},
  {"id":"r10","cohort":"S","x":"NA","y":"Infinity","z":"NaN","flag":true,"w":"bad"}
]
```

L = `{r01,r02,r03,r04,r05,r06,r07,r08,r09,r10}`, N=10. Stable-key uniqueness was checked. The script does not assign repository `__ID` values. A proposed local harness may map fixture keys to transient internal indices in input order, but must verify the mapping through actual rows/trace output. No refresh-identity guarantee is inferred.

### 2.2 Explicit conversion stage E1

Apply these settings to the raw input using the existing conversion contract. Keep `id` and `cohort` unchanged. No display-only option should initiate conversion.

```json
{
  "x":{"type":"numeric","nullTokens":["NA"]},
  "y":{"type":"numeric","nullTokens":["NA"]},
  "z":{"type":"numeric","nullTokens":["NA"]},
  "w":{"type":"numeric","nullTokens":["NA"]},
  "flag":{"type":"boolean"}
}
```

**R0 has no overrides, date presets, or null tokens.** A nonempty null-token list itself triggers conversion in `applyFieldSettings`/`buildConversionPreview`; it cannot already be active in the no-conversion stage.

Numeric eligibility at every arithmetic stage means exactly `finiteNumber(value) !== undefined`. R0 numeric projections do not assert how the UI infers a mixed column or whether it offers that column in a numeric picker. Matrix/parallel comparisons below require explicitly supplied numeric field kinds and E1 values. This avoids silently inventing type-inference behavior from the selected packet.

### 2.3 Exact effective values

`U` means an effective undefined value. `A` means the property remains absent: `applyFieldSettings` skips a field not present in the row. Both read as undefined, but the object representation is distinguished here. These are source-derived value expectations; the source conversion function was not executed.

| Key | Effective X / Y / Z | Conversion explanation |
| --- | --- | --- |
| r01 | `0 / 10 / 100` | All finite; zero retained. |
| r02 | `U / 20 / 200` | Raw X null becomes undefined without error. |
| r03 | `3 / U / 300` | Raw Y null becomes undefined without error. |
| r04 | `4 / 40 / U` | Raw Z null becomes undefined without error. |
| r05 | `U / A / U` | X/Z null become undefined; Y remains absent. |
| r06 | `6 / 60 / 600` | All finite. |
| r07 | `7 / 70 / 700` | All finite. |
| r08 | `8 / 80 / 800` | X changes from string `"8"` to numeric 8. |
| r09 | `U / U / U` | X false fails numeric conversion; Y blank is missing; Z bad text fails. |
| r10 | `U / U / U` | X matches configured `NA`; Y Infinity text and Z NaN text fail finite conversion. |

For every row, W becomes undefined with a conversion failure. `flag` remains false for r01 and true for the other nine keys. No imputations or deletions occur. Raw input must remain available independently of the effective undefined cells to explain their different causes.

**Source anchors:** `packages/explorEDA/src/lib/valueParsing.ts::{isMissingValue,parseNumber,finiteNumber,parseBoolean}`; `packages/explorEDA/src/lib/fieldSettings.ts::{convertFieldValue,applyFieldSettings,buildConversionPreview}`. The token match is exact/case-sensitive against trimmed text or `String(raw)`. This fixture uses only `NA`, so zero/false are not configured tokens.

## 3. Definitions and representation-specific partitions

Fields are ordered **X, Y, Z**. In every mask in this document, **1 = unavailable under the named rule; 0 = available under that rule**. No mask silently changes meaning.

- **Raw absence:** null or absent/undefined property only.
- **Raw shared-missing mask M0:** the repository's `isMissingValue`, including blank/whitespace text.
- **Raw numeric-unavailability mask U0:** no finite number from `finiteNumber`.
- **Effective shared-missing mask M1:** `isMissingValue` after explicit numeric conversion.
- **Effective numeric-unavailability mask U1:** no finite number after conversion.

U0 and U1 are equal for this fixture. M1 equals U1 for these explicitly converted numeric fields. M0 is different, and raw absence alone is different again. These equalities are computed fixture results, not universal claims.

### 3.1 Raw absence only, L, N=10

| Absent field | Exact members | Count |
| --- | --- | ---: |
| X | `{r02,r05}` | 2 |
| Y | `{r03,r05}` | 2 |
| Z | `{r04,r05}` | 2 |

Raw-absence exact patterns are `000={r01,r06,r07,r08,r09,r10}` (6), `100={r02}` (1), `010={r03}` (1), `001={r04}` (1), `111={r05}` (1). Other patterns are empty. r09's blank Y is not raw absence, but it is missing under the shared predicate.

### 3.2 All eight exact patterns, before/after conversion

| Pattern | R0 shared missing M0: keys; count | E1 shared missing M1: keys; count |
| --- | --- | --- |
| `000` | `{r01,r06,r07,r08,r10}`; 5 | `{r01,r06,r07,r08}`; 4 |
| `001` | `{r04}`; 1 | `{r04}`; 1 |
| `010` | `{r03,r09}`; 2 | `{r03}`; 1 |
| `011` | `{}`; 0 | `{}`; 0 |
| `100` | `{r02}`; 1 | `{r02}`; 1 |
| `101` | `{}`; 0 | `{}`; 0 |
| `110` | `{}`; 0 | `{}`; 0 |
| `111` | `{r05}`; 1 | `{r05,r09,r10}`; 3 |
| **Total** | **L; 10** | **L; 10** |

Shares have denominator 10: R0 nonzero shares are 50%, 10%, 20%, 10%, 10%; E1 shares are 40%, 10%, 10%, 10%, 30% in table order. The `000` pattern is never removed from accounting; its availability rule is the one named for that column.

**Numeric masks U0/U1** use exactly the E1 column above, before and after conversion. r10 is raw `000` under M0 but numeric `111`; no raw cell is missing under that predicate, yet none of its XYZ values is a finite measurement.

### 3.3 Exact field membership and numeric profile projections

| Field | R0 shared-missing set | Present but numerically ineligible in R0 |
| --- | --- | --- |
| X | `{r02,r05}` | `{r09,r10}` |
| Y | `{r03,r05,r09}` | `{r10}` |
| Z | `{r04,r05}` | `{r09,r10}` |

| Field | E1 missing set | Finite set, both R0 and E1 |
| --- | --- | --- |
| X | `{r02,r05,r09,r10}` | `{r01,r03,r04,r06,r07,r08}` |
| Y | `{r03,r05,r09,r10}` | `{r01,r02,r04,r06,r07,r08}` |
| Z | `{r04,r05,r09,r10}` | `{r01,r02,r03,r06,r07,r08}` |

For `calculateValueStatistics` with an explicitly supplied numeric type, `(nullCount, excludedCount, finite count)` is X `(2,2,6)`, Y `(3,1,6)`, Z `(2,2,6)` at R0 and `(4,0,6)` for each at E1. These are calculator expectations, not proof that the raw UI inferred those types.

For a nonnumeric type, the existing calculator counts only nullish values as `nullCount`. On the same raw Y values that produces 2, while a missing-only nullish filter also matches blank r09 and can return 3. Preserve that discrepancy for investigation; do not change the fixture to make every current label agree. [Source: `components/SummaryTable/utils/statisticsCalculator.ts::calculateValueStatistics`; `hooks/applyFilter.ts::applyFilter`; `lib/fieldProfiles.ts::buildValuesProfile`, all under `packages/explorEDA/src/`.]

## 4. Conversion-preview partitions, with exact members

`buildConversionPreview` counts errors first, then nullish raw/result values, then remaining values. Without requested conversion, “valid” is merely a retained non-nullish value. It does not perform a finite-number eligibility test.

### 4.1 R0 preview, no conversion, L

| Field | Valid keys | Missing / failed keys |
| --- | --- | --- |
| X | `{r01,r03,r04,r06,r07,r08,r09,r10}` (8) | Missing `{r02,r05}` (2); failed `{}` (0) |
| Y | `{r01,r02,r04,r06,r07,r08,r09,r10}` (8) | Missing `{r03,r05}` (2); failed `{}` (0) |
| Z | `{r01,r02,r03,r06,r07,r08,r09,r10}` (8) | Missing `{r04,r05}` (2); failed `{}` (0) |
| W | L (10) | Missing `{}`; failed `{}` |
| Flag | L (10) | Missing `{}`; failed `{}` |

Y's blank is in preview-valid but in shared-missing. X's false and token, and Y/Z's nonfinite text, are preview-valid at this stage. This is an essential control case against labeling a no-conversion count “chart-eligible.”

### 4.2 E1 conversion preview, raw L with explicit settings

| Field | Valid keys | Missing / failed keys |
| --- | --- | --- |
| X | `{r01,r03,r04,r06,r07,r08}` (6) | Missing `{r02,r05,r10}` (3); failed `{r09}` (1) |
| Y | `{r01,r02,r04,r06,r07,r08}` (6) | Missing `{r03,r05,r09}` (3); failed `{r10}` (1) |
| Z | `{r01,r02,r03,r06,r07,r08}` (6) | Missing `{r04,r05}` (2); failed `{r09,r10}` (2) |
| W | `{}` (0) | Missing `{}` (0); failed L (10) |
| Flag | L (10) | Missing `{}` (0); failed `{}` (0) |

Every row belongs to exactly one preview outcome per field. E1 profile missing X=4 equals preview-missing 3 plus failed 1; Y likewise 3+1; Z 2+2; W 0+10. The effective profile cannot separate those causes without the raw preview/provenance.

**First-eight example expectation:** for each X/Y/Z field, the ordinary non-nullish examples qualify in source order; failures also qualify. Because null/absent cells do not qualify, the selected rows need not be the first eight source records. The helper caps examples at eight and retains all failures; the current inspector initially renders twelve failures with a show-all option. No performance claim follows from those caps. [Source: `fieldSettings.ts::buildConversionPreview`; `FieldInspector.tsx`, Preview branch.]

## 5. Pairwise and complete-case record sets

### 5.1 Numeric eligibility on L, before and after conversion

| Analysis | Exact eligible keys | Count / L |
| --- | --- | ---: |
| X and Y | `{r01,r04,r06,r07,r08}` | 5 / 10 |
| X and Z | `{r01,r03,r06,r07,r08}` | 5 / 10 |
| Y and Z | `{r01,r02,r06,r07,r08}` | 5 / 10 |
| X, Y and Z | `{r01,r06,r07,r08}` | 4 / 10 |

Each pair has N=5 but different members. Exact pair exclusions are XY `{r02,r03,r05,r09,r10}`, XZ `{r02,r04,r05,r09,r10}`, YZ `{r03,r04,r05,r09,r10}`. The XYZ excluded union is `{r02,r03,r04,r05,r09,r10}` (6). Per-field unavailable counts add to 12; the distinct union is 6. Do not add overlapping marginal counts as though they were a partition.

The eligible finite records remain unchanged by the specified conversion. What changes is representation, the missing/failure accounting, and r08.X's scalar type.

### 5.2 Raw presence is not pair eligibility

Using only `!isMissingValue` on R0 would produce:

- XY present: `{r01,r04,r06,r07,r08,r10}` (6).
- XZ present: `{r01,r03,r06,r07,r08,r09,r10}` (7).
- YZ present: `{r01,r02,r06,r07,r08,r10}` (6).
- XYZ present: `{r01,r06,r07,r08,r10}` (5).

Those are descriptive raw-present sets, not chart contributors. They are included to reject a proof that treats “not missing” as equivalent to “finite numeric.”

### 5.3 Scatter's sequential buckets

`pairedStats` loops the supplied group IDs. It increments `missingX` when its first axis is unusable, otherwise increments `missingY` when the second is unusable, otherwise accepts the pair. The existing symbols partition exclusions; their labels do not identify raw-cell absence.

| Ordered axes, base L | First-axis unusable | Second-axis unusable after first is usable |
| --- | --- | --- |
| X then Y | `{r02,r05,r09,r10}` (4) | `{r03}` (1) |
| X then Z | `{r02,r05,r09,r10}` (4) | `{r04}` (1) |
| Y then Z | `{r03,r05,r09,r10}` (4) | `{r04}` (1) |

Every row also has the pair set from Section 5.1, so each ordered pair partitions `10 = 4 + 1 + 5`.

For XY, the independent four-way numeric-availability table is: **both usable** `{r01,r04,r06,r07,r08}` (5); **X only** `{r03}` (1); **Y only** `{r02}` (1); **neither** `{r05,r09,r10}` (3). Independent unusable Y has four members, not the one member in `missingY`.

Swapping X and Y preserves pairs but moves r02/r03 between the named sequential buckets. Because the full fixture has equal marginal unusability, the displayed bucket counts happen to remain 4 and 1. To demonstrate that order can change the counts too, use the explicitly named two-record sub-base `{r02,r05}`: X-first buckets are 2/0/pairs0; Y-first buckets are 1/1/pairs0. This is source-derived expected behavior for a proposed local helper check; it was not a source execution in this research.

A proposed visible explanation can say “X has no finite value: 4; of the remaining rows, Y has no finite value: 1; finite pairs: 5.” It must not rename these as independent raw missing rates. A four-way table would require its own counts; it cannot be fabricated from the sequential counters alone.

## 6. Equal marginals, different joint patterns, and the peer filter

### 6.1 Exact cohort sets at R0 and E1

A=`{r01,r02,r03,r04}`. B=`{r05,r06,r07,r08}`. Both have N=4. Within these two cohorts, raw shared-missing and effective missing masks agree; finite eligibility is unchanged by conversion.

| Result | Cohort A | Cohort B |
| --- | --- | --- |
| X missing | `{r02}`; 1/4 | `{r05}`; 1/4 |
| Y missing | `{r03}`; 1/4 | `{r05}`; 1/4 |
| Z missing | `{r04}`; 1/4 | `{r05}`; 1/4 |
| `000` | `{r01}`; 1/4 | `{r06,r07,r08}`; 3/4 |
| `100` | `{r02}`; 1/4 | `{}`; 0/4 |
| `010` | `{r03}`; 1/4 | `{}`; 0/4 |
| `001` | `{r04}`; 1/4 | `{}`; 0/4 |
| `111` | `{}`; 0/4 | `{r05}`; 1/4 |
| Other exact patterns | `{}` | `{}` |
| XY finite | `{r01,r04}`; 2/4 | `{r06,r07,r08}`; 3/4 |
| XZ finite | `{r01,r03}`; 2/4 | `{r06,r07,r08}`; 3/4 |
| YZ finite | `{r01,r02}`; 2/4 | `{r06,r07,r08}`; 3/4 |
| XYZ complete | `{r01}`; 1/4 | `{r06,r07,r08}`; 3/4 |

A finite fields: X `{r01,r03,r04}`; Y `{r01,r02,r04}`; Z `{r01,r02,r03}`. B finite X/Y/Z all `{r06,r07,r08}`.

For A, numeric preview X/Y/Z each reads valid 3, missing 1, failed 0 both without conversion and with E1 settings. The valid and missing sets are the complements shown above. For B each preview is valid `{r06,r07,r08}`, missing `{r05}`, failed empty. This statement concerns previews explicitly supplied the corresponding raw sub-base. The provider's UI preview base must be verified; do not assume a peer filter changes that preview automatically.

W's raw no-conversion preview in A is valid A (4); converted W preview fails A (4) and has no valid/missing inputs. In B the corresponding sets are B. Flag is valid for every included row under either preview. These do not change the three-field comparison.

### 6.2 Named stage transition

- **R0:** raw L; no settings; M0 counts X/Y/Z = 2/3/2; numeric pair counts 5/5/5; complete 4.
- **E1:** explicit conversion on L; M1 counts 4/4/4; numeric pair counts 5/5/5; complete 4.
- **P_A:** E1 plus peer `cohort=A`; inspection base A, N=4; missing 1/1/1; pairs 2/2/2; complete 1.
- **P_B:** E1 plus peer `cohort=B`; inspection base B, N=4; missing 1/1/1; pairs 3/3/3; complete 3.
- **R_A/R_B:** the same cohort filters applied before conversion. XYZ missing/pair/complete sets equal P_A/P_B for these nonstress cohorts. Raw preview semantics remain no-conversion semantics.

This difference can change an analyst's choice between a broad pairwise question and a narrow three-field profile. It does not establish that either cohort is unbiased, faulty, representative, or a market demand signal.

## 7. Own selection, peer context, and record inspection

**Proposed runtime proof; set arithmetic executed.** Hold E1 and peer A. Set this chart's own numeric X range to 0 through 1, inclusive. Zero is retained; the globally passing set is S=`{r01}`. The explicitly chosen range bounds are valid finite numbers; no unbounded-filter UI behavior is assumed.

| Surface / quantity | Exact expected population | Count |
| --- | --- | ---: |
| Loaded rows | L | 10 |
| Chart peer inspection base | A | 4 |
| Global all-filter rows | `{r01}` | 1 |
| XY eligible before own selection | `{r01,r04}` | 2 |
| XYZ complete before own selection | `{r01}` | 1 |
| XY selected eligible marks | `{r01}` | 1 |
| XY exclusions from the peer base | `{r02,r03}` | 2 |
| XYZ exclusions from the peer base | `{r02,r03,r04}` | 3 |

`useFilteredFieldProfiles(own)` can profile the currently controlled X field on A when the corresponding ownLive state is present; it excludes X's own filter and retains peers. Its Y/Z fields instead use globally filtered `{r01}` in this one-own-field case. **Global Fields/Summary calls without `own` use `{r01}` for X too.** A second own-field filter must be reapplied to the X profile base rather than silently ignored. [Source: `packages/explorEDA/src/hooks/useFilteredFieldProfiles.ts::rowsFor`, lines 88–127; provider ownership remains unexecuted.]

Rebuilding an exclusion view from S would yield zero missing/omitted rows and conceal the reason the eligible population narrowed. Proposed inspection must keep A as its named base, expose r02/r03 or r02/r03/r04 as appropriate, and preserve the peer cohort filter. Clearing an own selection must not clear the peer or change field settings.

### Matrix and parallel counters are not interchangeable

The following are expected planner results for explicit numeric snapshots; the planners were not executed.

| Population / own filter | Matrix selection and XYZ pair counts | Parallel XYZ selection / omission |
| --- | --- | --- |
| L, no own filter | `selectedCount=10`; each pair n=5; diagonal n=6 | Selected complete lines=4; omitted union=6 |
| A, no own filter | `selectedCount=4`; each pair n=2; diagonal n=3 | Selected complete lines=1; omitted union=3 |
| A, own X 0–1 | `selectedCount=1`; each pair n remains2 | Selected complete lines=1; omitted union remains3 |

Matrix selection includes live rows passing own filters even when they cannot contribute to a particular cell. Parallel selection is counted after completeness. Plot/statistic eligibility is also separate from clipping or nonpositive positions on a log scale. This fixture's proposed chart proof uses **linear axes with no manual clipping or size field** so those mechanisms cannot accidentally explain a missing record. [Sources: `ScatterMatrix/matrixPlan.ts::{planMatrixLayout,planMatrixSelection}`; `ParallelCoordinates/parallelPlan.ts::planParallelCoordinates`; `docs/ui-defaults.md`, axis rules.]

## 8. Empty populations and all-ineligible dimensions

### 8.1 Zero rows

Apply a peer cohort value not present in the fixture, explicitly denoted Q, or supply an empty snapshot in the proposed helper test. P=`{}`, N=0, in either representation.

- Every raw absence, missing, failed, finite, pair, complete and pattern member set is empty; every count is zero.
- No positive-frequency pattern row exists. An exhaustive arithmetic listing can show all eight zero counts, but the product need not render eight empty patterns.
- Shares are undefined because the denominator is zero. Proposed copy is “No rows in this scope,” not a 0/0 percentage or a claim that all rows are complete.
- `emptyFieldProfile` removes statistics; it does not guarantee a populated numeric `excludedCount` property. Verify current consumer handling.
- Empty **peer-filter scope with loaded L retained**: parallel has no lines/omitted IDs, liveCount0 and selectedCount0; matrix has empty live/selected IDs and n0 in cells. Domains still use `snapshot.allIds=L`, so finite XYZ domains stay based on the loaded values.
- Empty **source snapshot**, with both allIds and liveIds empty: configured numeric axes use the current no-value fallback domains; counts are again zero. W has a no-value domain even with loaded L because no source W is finite. Imported helpers and renderer empty-state behavior remain unexecuted.

### 8.2 All-ineligible numeric W on a nonempty base

R0 W is present `"bad"` on every row: raw shared-missing set empty, finite set empty, known-numeric nullCount0/excludedCount10. E1 W preview has valid0/missing0/failed10; effective W is missing on L, nullCount10/excludedCount0. There are still ten loaded rows.

| Explicit numeric configuration, base L | Expected result | Why |
| --- | --- | --- |
| XYZ | Complete `{r01,r06,r07,r08}` (4) | Three finite values per retained row. |
| XYZW | Complete `{}`; excluded L (10) | W is required and never finite. |
| Matrix includes W | W diagonal n0 and XW/YW/ZW n0; XYZ pair n5 unaffected | Cell eligibility is pairwise. |
| Parallel includes W | W remains; lines0; omittedIds=L; selectedCount0 | Numeric all-ineligible axes are not dropped. |

On peer A, the W excluded union is A (4); XYZ still has one complete row but XYZW has zero. After the own X range, matrix selectedCount remains1 while W cells remain n0; parallel selected lines remain0 with W present.

The parallel planner skips blank field names and can reject categorical axes above 40 non-null categories. It **does not drop all-ineligible numeric W**. A fallback axis domain 0..1 is not evidence of any usable values. If a user removes W, the field set and the analytical question must change visibly. [Source: `ParallelCoordinates/parallelPlan.ts`, retained-axis loop, domain calculation, `positionOf`, completeness loop.]

A separate corner case is **no retained axes**: the current planner can emit empty-coordinate `ys: []` records through vacuous completeness, and nearest-line inspection refuses fewer than two axes. Higher-level guards are absent. Proposed UI proof must keep “No analytical fields” distinct from meaningful 100% completeness. Do not fix or reinterpret that source behavior silently.

Native in-memory NaN/Infinity are covered only by source semantics, not by this JSON fixture: `parseNumber` preserves native numbers, `finiteNumber` rejects nonfinite results, and numeric conversion reports failure. An optional direct helper assertion for native nonfinite values belongs to the later proposed repository run, not this executed arithmetic record.

## 9. Proposed author task and baseline comparator

**All activity in this section is proposed and unrun.** Use one named author who can state a genuine measurement/import task. If none is available, retain the semantic proof but do not claim demand or approve a new diagnostic. This is a bounded local observation, not a broad usability study or a market sample.

### Author brief

“Import these ten keyed records. Explain which events can contribute to X–Y and to X/Y/Z before and after explicit numeric conversion. Compare cohorts A and B even though their field missing rates agree. Select cohort A and X 0–1. Identify the events excluded from the pair and the full profile while keeping cohort A selected. Finally explain what changes when W is included and when the cohort has no rows.”

Do not give the author the member-set answers before the first attempt. Tell them that the records are synthetic and that the goal is interpreting populations, not determining why data are missing.

### Comparator sequence

1. **B0 — Current product.** Use current Fields, conversion previews, existing scatter/matrix/parallel counts and traces, missing-only filtering, and Rows. Record the first incorrect denominator, inaccessible member set, or inability to state a predicate. T2's narrow conversion choice is expected to be adequately served; verify that rather than assume it fails.
2. **B1 — Current product plus one short recipe.** Supply the explicit rule and prepared indicators described below. Repeat only the failed tasks. If correctness and key access are now adequate within the effort gate, reject UI expansion and keep docs/example only.
3. **B2 — Minimal explanation revision, conditional.** Only if B1 fails, test the smallest existing-surface wording/scope correction addressing that failure. This can be a reviewable mock copy or later implementation of M1; no mock application was built in this research. Preserve the same record answers and observable gestures.

Record starts/stops, actions, assistance, final predicates/keys, and errors. A repeat may be easier through learning, so use a renamed isomorphic cohort or reverse task order for a second attempt and report order. One author is enough to reject a bad local idea, not enough to estimate population-wide preference or time savings.

### Ordinary indicator recipe: a serious small alternative

Preserve `id` and raw columns. From the same explicitly declared effective numeric values, prepare X/Y/Z availability flags and a single exact-pattern categorical field. Use current parsing semantics or explicit fixture truth data; do not implement another numeric parser or assume SQL/R/Python null rules agree automatically.

For this fixture a categorical `xyz_numeric_pattern` can map:

- `All three usable` → `{r01,r06,r07,r08}`.
- `X unavailable only` → `{r02}`.
- `Y unavailable only` → `{r03}`.
- `Z unavailable only` → `{r04}`.
- `All three unavailable` → `{r05,r09,r10}`.

Use a current count-by-category view and its existing trace/Rows route. Keep a separate raw cause description or preview for failures; the exact-pattern category does not explain cause. Naniar's authored `bind_shadow` documentation is a precedent for appending indicator columns, not a substitute parsing contract: https://naniar.njtierney.com/reference/bind_shadow.html (retrieved 2026-10-19).

Recompute indicators whenever the source or conversion settings change; a stale prepared field is not a live measure. Label this as author preparation, not a new native dynamic field/API. For a general dataset, use source-owned, documented preparation. If that author burden is the actual recurring failure, record it before considering JM-05.

## 10. Proposed keyboard and row-inspection flow

**Not executed.** Use the actual existing controls and accessible names after confirming the local source wiring. Do not invent a new shortcut, selector, trace API, or chart Inspect button.

1. Load the fixture with visible `id`, open Fields using its documented toolbar/shortcut route, and reach X's type/preview controls by keyboard. Confirm focus is visible and the popover does not hide the active field or scope.
2. Read no-conversion preview counts; choose explicit numeric type and `NA` token; read valid/missing/failed plus raw/runtime values. Apply. Verify the setting and any field-filter clearing through actual state, as the current copy promises. Reapply peer/own filters for the staged proof after conversion.
3. Use the current header trace control or focusable mark **Alt-Enter** for an included record; verify stable key r01 and finite zero. Repeat pointer Alt-click as a parallel input route. Exact focusability and entry points are not assumed proven by docs.
4. With peer A and the own X range active, reach XY exclusion members r02/r03 from a named pre-eligibility base. If the current header trace cannot expose them, use B1's pattern category/Rows baseline. If neither route preserves A and retrieves exact keys, record the failure rather than claim current trace support.
5. Reach the complete-case exclusions r02/r03/r04 and distinguish them from the pair exclusions. Close the inspector with Escape and verify focus return. Clear only the chart's own selection; confirm A remains.
6. Inspect W and the empty cohort. No disappearance of the requested W field, fabricated mark, 0/0 share, or missing keyboard exit is acceptable.
7. For any proposed change, repeat at **1280, 783, and 390 CSS-pixel widths** with real pointer and keyboard input. Verify field labels, active filters, count meanings, overflow, reachability, focus return, and source rows. Use light mode first and inspect required theme/focus behavior using existing tokens. No screenshots or browser observations were produced here.

The source rules require accessible names and existing trace gestures, compact nonmodal inspection, and matching docs/example work. The tooltip guidance contains a hover/focus policy discrepancy; the proof should check real controls and visible accessible labels without inventing a policy change. [Sources: `AGENTS.md`; `CODING_STANDARDS.md`; `docs/ui-defaults.md`; `FieldInspector.tsx`; six supplied MDX pages.]

## 11. Falsifiable success and rejection gates

These are **proposed evaluation thresholds**, chosen before the local observation. They are not achieved results, performance measurements, or population estimates.

| Gate | Success required | Reject or stop when |
| --- | --- | --- |
| G0: source access / callers | Codex confirms the declared/reconciled source, snapshot ownership, conversion-preview population, existing trace callers and key mapping. | Essential behavior still depends on an invented caller or an unverified global feature-absence claim. Stop M1 and name the missing path/evidence. |
| G1: numerical correctness | Every numeric count and key set in Sections 3–8 agrees for the stated representation/base; zero and valid Boolean false survive their proper roles. | Any count is “almost right,” failure is silently reclassified, or code uses truthiness/coercive replacement parsing. Repair the bounded issue before product proof. |
| G2: population comprehension | Author correctly distinguishes loaded10, peer4, XY2, XYZ1 and selected1 in A+own state, and explains A/B complete1/3 with equal marginals. | A correct number is attached to the wrong population, or a pattern is interpreted as mechanism/bias/error proof. |
| G3: exact inspection | Author retrieves the required stable keys, including excluded rows, without clearing the peer filter or silently changing representation. | Only eligible marks can be inspected, ordinals are mistaken for stable keys, or excluded rows vanish after own selection. |
| G4: baseline is adequate | B0 or B1 completes all requested interpretations/key sets with no assistance in a predeclared ten-minute session. | If it succeeds, reject new UI work for this task and keep the smallest documentation result. Ten minutes is a local session bound, not a speed benchmark. |
| G5: explanation revision earns cost | Where B1 failed, B2 corrects that exact failure; a previously correct task stays correct; at least one unnecessary scope-reset/navigation cycle is removed or previously blocked keys become reachable. | No improvement, a new meaning is introduced, or the fix requires a new API/filter engine. Do not claim a timing benefit without measuring it. |
| G6: accessibility / width | Exact tasks remain possible by keyboard and pointer at 1280/783/390, with readable labels and focus return. | A hidden count, unreachable action, ambiguous mask, or focus trap remains. |
| G7: diagnostic demand boundary | A named recurring joint-pattern task still defeats B1/B2, with a recorded decision changed by exact combinations. | Synthetic contrast alone, another vendor's feature, or visual preference is the only justification. Keep JM-05 deferred. |
| G8: scope | One bounded existing-surface bundle and same-milestone docs/example suffice. | Imputation, error scoring, monitoring, mechanism tests, expected-record reconciliation or broad redesign is necessary. Mission becomes NO-GO. |

For G4, inability to finish within ten minutes is a signal to examine the recorded obstacle, not proof that a new diagnostic is valuable. Participant familiarity, learning, preparation effort and keyboard support can explain the result. Preserve the actual observations and decisions instead of averaging one person's time into a market claim.

**Plausible outcome:** B0 already solves T2; B1 solves T1 with pattern indicators; one clear description of pair and complete-case counts solves T3. The appropriate product result is docs/example only, or a small explanation repair. No joint diagnostic follows.

## 12. At most one conditional proposed milestone: M1

**M1 — Explain current values and eligible rows in place, with one runnable companion example.** Status: proposed, gated by G0 and an observed B0/B1 failure. No code, docs page, example registration, package change or API was implemented by this research.

The milestone owns only the specific explanation/access gap observed. Reuse source producers; do not change their numerical partitions to match preferred labels. The following table pairs each possible piece of feature work with docs and the **same proposed runnable example**.

| Existing source target / prerequisite | Docs page or section in the same M1 | Runnable example in the same M1 |
| --- | --- | --- |
| `packages/explorEDA/src/components/SummaryTable/components/FieldInspector.tsx` and `components/FieldList/FieldRowReadings.tsx`; consult `lib/fieldSettings.ts`, `lib/fieldProfiles.ts`, `components/SummaryTable/utils/statisticsCalculator.ts` for existing meanings | `apps/demo/src/docs/pages/fields.mdx`: raw/effective values, missing-only, conversion outcomes; `summary.mdx`: finite contributors and field scope | Add proposed `joint-eligibility` entry in real `apps/demo/src/demos/examples.ts`, using this ten-record fixture, visible keys, Fields/Rows and the conversion stages. Proposed URL `/examples/joint-eligibility`, not a currently verified route. |
| Existing chart count/trace explanations, whose exact render/trace callers must first be inspected. Supplied producers are `components/charts/ScatterPlot/pairedSummary.ts`, `ScatterMatrix/matrixPlan.ts`, `ParallelCoordinates/parallelPlan.ts`, under `packages/explorEDA/src/` | `scatter.mdx`: sequential finite-pair exclusions; `scatter-matrix.mdx`: pairwise n/selection; `parallel-coordinates.mdx`: retained-axis completeness/W | The same `joint-eligibility` example contains XY scatter or matrix plus XYZ parallel, A/B selection, W, and empty scope. Use existing chart settings; no new diagnostic type. |
| `packages/explorEDA/src/hooks/useFilteredFieldProfiles.ts`, `hooks/applyFilter.ts`, `components/WorkspaceFilterEditor.tsx` as scope contracts; provider/snapshot/trace implementation must be read locally before any changed wiring | `filters.mdx`: peer/own/global inspection bases and preserving excluded keys; cross-link the relevant fields/chart sections | The same example includes peer A, own X 0–1, exclusion inspection, and a prepared categorical indicator comparator. Its scripted steps assert keys and reset only the intended selection. |

The chart planners expose data/note production; they are **not the uninspected UI consumers**. This report does not invent consumer filenames or claim the complete trace route is present in the packet. G0 must locate the real callers. If the explanation cannot be surfaced through existing controls, reduce M1 to docs/example or stop for review instead of adding an API.

The supplied agent guide identifies `apps/demo/src/docs/live/examples.ts`, `apps/demo/src/demos/coverage.ts`, `apps/demo/src/demos/coverage.test.ts`, `apps/demo/src/dashboardText.test.ts`, and the docs gate as companion registration/validation locations. Those paths were **documented, not supplied/read implementations**; Codex must inspect them before editing. M1 is not complete until the new example actually loads, its live steps run, and matching docs are verified. No separate “documentation later” milestone is allowed.

### Proposed later run sheet — none of these commands ran here

Use Codex's actual runnable checkout, existing pnpm/Node setup and repo test-timeout policy. The source packet cannot execute these commands. Run gates in the appropriate integration context; do not bypass checks, alter identities, or run broad builds concurrently across worktrees.

```bash
# PROPOSED ONLY: baseline contracts affected by the bounded explanation work.
pnpm --filter exploreda exec vitest run src/lib/fieldProfiles.test.ts src/lib/valueParsing.test.ts src/components/charts/ScatterPlot/summaryMarginals.test.ts src/components/charts/ScatterMatrix/matrixPlan.test.ts src/components/charts/ParallelCoordinates/parallelPlan.test.ts

# PROPOSED ONLY: conversion preview contract if that surface changes.
pnpm --filter exploreda exec vitest run src/lib/fieldSettings.test.ts
pnpm --filter exploreda check-types

# PROPOSED ONLY: required example registration / round trip and documentation.
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check

# PROPOSED ONLY: run once in the integration checkout when changes are ready.
pnpm check
pnpm check:pr
```

The six existing tests are a baseline, not sufficient proof of this fixture: the proposed local helper tests must add the exact key sets and relevant all-ineligible/empty/own-vs-peer cases where missing. Use independent expected sets, not an assertion that repeats the same implementation. For UI changes, the source requires screenshots and actual browser proof; Codex owns that work and Git/PR actions. A package-visible change requires the existing changeset workflow; a docs/example-only result follows its existing exemption. No release or deployment is part of M1.

## 13. Check ledger, unresolved limits, and next action

**Actually executed in this research:** safe source-packet extraction; source/test text reading; primary documentation retrieval; independent fixture arithmetic with key uniqueness, pattern/marginal reconciliation, exact pairs/complete sets, conversion outcome partitions, A/B contrasts, W/Boolean classification arithmetic, own selection set intersections and zero-population checks; local Markdown production; archive verification at delivery.

The final arithmetic run returned `PASS` and exit code 0. The source helpers, chart planners, provider, filters, trace UI and browser were not executed. The code below is the exact arithmetic program, not a runnable implementation of a product feature.

**Still unresolved:** actual caller/snapshot/preview populations; stable-key trace access for exclusions; current registry contents beyond the selected packet; layout/accessibility; current-product author effort; recurring demand. Missingness mechanism and inferential bias are outside the proof. Authoritative descriptions explain why a descriptive visual pattern cannot establish those mechanisms: https://stefvanbuuren.name/fimd/sec-idconcepts.html (retrieved 2026-10-19).

The queue's existing local trust journey stays first. Within its second item, the next falsifiable action is **G0 followed by one observed B0/B1 author attempt**, not another survey. If the current product plus a short recipe already yields correct predicates and exact excluded keys, reject additional UI work for that task and leave JM-05 deferred.

## Appendix A. Source claim register

All paths refer to the supplied baseline. These references are source/test observations, not execution evidence.

- `packages/explorEDA/src/lib/valueParsing.ts`: `isMissingValue` (15–21), `parseNumber` (32–37), `finiteNumber` (101–104), `parseBoolean` (119–124). Sole parsing authority; zero, false, blanks, numeric text and nonfinite rules.
- `packages/explorEDA/src/lib/fieldSettings.ts`: `convertFieldValue` (106–143), `applyFieldSettings` (310–336), `buildConversionPreview` (339–382). Conversion triggers, missing/failure distinction, row copies and example limits.
- `packages/explorEDA/src/components/SummaryTable/utils/statisticsCalculator.ts`: `calculateValueStatistics` (71–169). Numeric missing/excluded split and nonnumeric nullish-only counts.
- `packages/explorEDA/src/lib/fieldProfiles.ts`: `buildValuesProfile`, `emptyFieldProfile`, `buildFieldProfiles`. Known type, empty state, row property reading.
- `packages/explorEDA/src/hooks/useFilteredFieldProfiles.ts`: `useFilteredFieldProfiles`, `rowsFor` (88–127), `useFilteredRowCount`. Global, own-field and workspace-field bases.
- `packages/explorEDA/src/hooks/applyFilter.ts`: `applyFilter` (10–67); `packages/explorEDA/src/types/FilterTypes.ts`: value/range/text/date filter contracts. Missing-only value rule, finite numeric ranges; no dedicated joint/failure predicate type in the supplied declarations.
- `packages/explorEDA/src/components/SummaryTable/components/FieldInspector.tsx`: type/preview controls, failure entries, apply call; `packages/explorEDA/src/components/FieldList/FieldRowReadings.tsx`: missing-count control; `packages/explorEDA/src/components/WorkspaceFilterEditor.tsx`: `FieldFilter` and owner-aware profile call.
- `packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts`: `pairedStats` (29–103), `planPairedSummary`. Sequential finite-pair partition and statistical availability. `summaryMarginals.test.ts` read, not run.
- `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.ts`: `planMatrixLayout` (595 onward), cell n/diagonal counts, `pearson`, `planMatrixSelection` (825 onward); `matrixPlan.test.ts` read, not run. Trace imports/expectations do not establish executed trace behavior.
- `packages/explorEDA/src/components/charts/ParallelCoordinates/parallelPlan.ts`: retained axes (158–197), no-value domains (289–348), positions/completeness/selection (356–451), `findNearestLine` (560–595); `parallelPlan.test.ts` read, not run.
- `AGENTS.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, `docs/ui-defaults.md`, six MDX pages under `apps/demo/src/docs/pages/`, and targeted `apps/demo/src/demos/examples.ts`: feature/docs/example co-scope, prescribed gestures, widths and future commands.

## Appendix B. Exact executed arithmetic program

Save the block as `fixture_arithmetic.py` in a temporary directory and run `python3 fixture_arithmetic.py`. It writes `fixture-results.json` alongside itself and prints its narrow execution boundary. It needs only Python's standard library. No product package, parser emulation, web access, or application fixture installation is involved.

```python
"""Executed arithmetic over explicit source-derived classifications, not an application test.

No parser is reimplemented here. The classification table is a hand-reviewed
oracle derived from the supplied valueParsing.ts and fieldSettings.ts.
"""
from collections import defaultdict
from itertools import combinations, product
import json
from pathlib import Path

ROWS = [
    {"id":"r01","cohort":"A","x":0,"y":10,"z":100,"flag":False,"w":"bad"},
    {"id":"r02","cohort":"A","x":None,"y":20,"z":200,"flag":True,"w":"bad"},
    {"id":"r03","cohort":"A","x":3,"y":None,"z":300,"flag":True,"w":"bad"},
    {"id":"r04","cohort":"A","x":4,"y":40,"z":None,"flag":True,"w":"bad"},
    {"id":"r05","cohort":"B","x":None,"z":None,"flag":True,"w":"bad"},
    {"id":"r06","cohort":"B","x":6,"y":60,"z":600,"flag":True,"w":"bad"},
    {"id":"r07","cohort":"B","x":7,"y":70,"z":700,"flag":True,"w":"bad"},
    {"id":"r08","cohort":"B","x":"8","y":80,"z":800,"flag":True,"w":"bad"},
    {"id":"r09","cohort":"S","x":False,"y":" ","z":"bad","flag":True,"w":"bad"},
    {"id":"r10","cohort":"S","x":"NA","y":"Infinity","z":"NaN","flag":True,"w":"bad"},
]
# V finite; A null/absent; B blank; T configured token; H boolean in numeric
# field; X other conversion failure; N non-finite text. W is X for every row.
STATES = dict(zip([row["id"] for row in ROWS], [
    "VVV", "AVV", "VAV", "VVA", "AAA", "VVV", "VVV", "VVV", "HBX", "TNN"
]))
FIELDS = "xyz"
ALL = [row["id"] for row in ROWS]
assert len(ALL) == len(set(ALL)) == 10

def report(ids, converted):
    missing_codes = set("ABTHXN") if converted else set("AB")
    patterns = defaultdict(list)
    finite = {}
    missing = {}
    previews = {}
    for pos, field in enumerate(FIELDS):
        finite[field] = [key for key in ids if STATES[key][pos] == "V"]
        missing[field] = [key for key in ids if STATES[key][pos] in missing_codes]
        buckets = {name:[] for name in ("valid","missing","failed")}
        for key in ids:
            code = STATES[key][pos]
            kind = ("failed" if code in "HXN" else "missing" if code in "ABT" else "valid") if converted else ("missing" if code == "A" else "valid")
            buckets[kind].append(key)
        assert sum(map(len,buckets.values())) == len(ids)
        previews[field] = buckets
    for key in ids:
        pattern = "".join("1" if code in missing_codes else "0" for code in STATES[key])
        patterns[pattern].append(key)
    pairs = {a+b:[key for key in ids if key in finite[a] and key in finite[b]] for a,b in combinations(FIELDS,2)}
    complete = [key for key in ids if all(key in finite[field] for field in FIELDS)]
    sequential = {}
    for a,b in combinations(FIELDS,2):
        excluded_a = [key for key in ids if key not in finite[a]]
        excluded_b_after_a = [key for key in ids if key in finite[a] and key not in finite[b]]
        assert len(excluded_a)+len(excluded_b_after_a)+len(pairs[a+b]) == len(ids)
        sequential[a+b] = {"first_axis_unusable":excluded_a,"second_axis_unusable_after_first":excluded_b_after_a,"pairs":pairs[a+b]}
    assert sum(map(len,patterns.values())) == len(ids)
    for pos,field in enumerate(FIELDS):
        reconstructed = sorted(key for pattern,keys in patterns.items() if pattern[pos] == "1" for key in keys)
        assert reconstructed == sorted(missing[field])
    return {"N":len(ids),"ids":ids,"representation":"effective after conversion" if converted else "raw, no conversion", "missing_patterns":{pattern:patterns.get(pattern,[]) for pattern in map("".join,product("01",repeat=3))},"missing":missing,"finite":finite,"pairs":pairs,"complete":complete,"sequential_scatter":sequential,"conversion_preview":previews}

R0 = report(ALL, False)
E1 = report(ALL, True)
PA = report([row["id"] for row in ROWS if row["cohort"] == "A"], True)
PB = report([row["id"] for row in ROWS if row["cohort"] == "B"], True)
R_A = report(PA["ids"], False)
R_B = report(PB["ids"], False)
ZERO = report([], True)
assert R0["missing_patterns"] == {"000":["r01","r06","r07","r08","r10"],"001":["r04"],"010":["r03","r09"],"011":[],"100":["r02"],"101":[],"110":[],"111":["r05"]}
assert E1["missing_patterns"] == {"000":["r01","r06","r07","r08"],"001":["r04"],"010":["r03"],"011":[],"100":["r02"],"101":[],"110":[],"111":["r05","r09","r10"]}
assert R0["pairs"] == E1["pairs"] == {"xy":["r01","r04","r06","r07","r08"],"xz":["r01","r03","r06","r07","r08"],"yz":["r01","r02","r06","r07","r08"]}
assert R0["complete"] == E1["complete"] == ["r01","r06","r07","r08"]
assert {f:len(ids) for f,ids in PA["missing"].items()} == {f:len(ids) for f,ids in PB["missing"].items()} == {"x":1,"y":1,"z":1}
assert PA["complete"] == ["r01"] and PB["complete"] == ["r06","r07","r08"]
assert all(len(ids) == 2 for ids in PA["pairs"].values()) and all(len(ids) == 3 for ids in PB["pairs"].values())
assert ZERO["N"] == 0 and ZERO["complete"] == []
assert R_A["missing_patterns"] == PA["missing_patterns"] and R_A["pairs"] == PA["pairs"]
assert R_B["missing_patterns"] == PB["missing_patterns"] and R_B["pairs"] == PB["pairs"]

# Peer cohort A; a scatter's own X range includes 0 through 1.
# Explicit known numeric selection set avoids emulating applyFilter.
own_x = ["r01"]
live_a = PA["ids"]
own_context = {"peer_base":live_a,"own_x_selection":own_x,
               "all_filters_rows":own_x,
               "own_x_field_profile_base":live_a,
               "other_field_profile_base":own_x,
               "excluded_xy_from_peer_base":["r02","r03"],
               "excluded_xyz_from_peer_base":["r02","r03","r04"]}
assert set(own_context["excluded_xy_from_peer_base"]).isdisjoint(own_x)
assert "r01" in own_x # Valid numeric zero is retained.
# Extend the arithmetic with explicitly classified W/flag; still no parser.
w_states = {key: "X" for key in ALL}
w_finite = [key for key in ALL if w_states[key] == "V"]
w_failed = [key for key in ALL if w_states[key] == "X"]
complete_with_w = [key for key in E1["complete"] if key in w_finite]
W = {"raw_missing":[],"raw_finite":w_finite,"numeric_conversion_failures":w_failed,
     "effective_missing":w_failed,"effective_finite":w_finite,"complete_including_w":complete_with_w}
assert len(w_failed) == 10 and complete_with_w == []
flag_valid_keys = [row["id"] for row in ROWS if isinstance(row["flag"], bool)]
assert flag_valid_keys == ALL and ROWS[0]["flag"] is False
FLAG = {"valid_boolean_keys":flag_valid_keys,"missing":[],"failed":[],"false_keys":["r01"]}
assert set(PA["pairs"]["xy"]).intersection(own_x) == {"r01"}
assert set(live_a).difference(PA["pairs"]["xy"]) == set(own_context["excluded_xy_from_peer_base"])
assert set(live_a).difference(PA["complete"]) == set(own_context["excluded_xyz_from_peer_base"])
result = {"status":"ARITHMETIC EXECUTED; REPOSITORY/UI PROOF NOT RUN", "raw_fixture":ROWS,
          "states":STATES,"R0":R0,"E1":E1,"R_A":R_A,"R_B":R_B,"P_A":PA,"P_B":PB,"ZERO":ZERO,
          "own_filter_context":own_context,"all_ineligible_w":W,"boolean_flag":FLAG}
Path(__file__).with_name("fixture-results.json").write_text(json.dumps(result,indent=2)+"\n")
print("PASS: exact patterns, member sets, marginals, pair counts, complete cases, conversion-preview partitions, own/peer set arithmetic, and empty-population arithmetic.")
print("Not run: source helpers, Vitest, React app, filters/trace wiring, browser, accessibility, performance or author task.")
print(json.dumps({stage:{"N":value["N"],"marginal_missing":{f:len(ids) for f,ids in value["missing"].items()},"pairs":{pair:len(ids) for pair,ids in value["pairs"].items()},"complete":len(value["complete"])} for stage,value in {"R0":R0,"E1":E1,"P_A":PA,"P_B":PB,"ZERO":ZERO}.items()},indent=2))
```
