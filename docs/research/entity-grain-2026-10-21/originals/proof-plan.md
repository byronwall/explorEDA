# R043 — Frozen oracle and proposed proof plan

**Repository:** [byronwall/explorEDA](https://github.com/byronwall/explorEDA).  
**Baseline:** `f4cacdde180e16ad814451a8c064e394535565d6`.  
**Date:** October 21, 2026.  
**Status:** source research complete; product, browser, SQL, and author proofs below are **proposed and unrun**.

## 1. How to read this plan

This file deliberately separates three layers:

| Layer | Meaning | Status |
| --- | --- | --- |
| Frozen normative oracle | A declared analytical question, exact membership, and explicit unresolved policy alternatives | Frozen independently before its author inspected reducers or outputs |
| Current source prediction | What the pinned code is expected to return for the stated construction | Source inspection plus independent arithmetic; no product calls |
| Follow-up proof | A complete-checkout reproduction, regression control, or author/browser task | Proposed; no pass is claimed |

Facts about code are cited by exact path and symbol. Predictions are inferences from those facts. Author comprehension and the value of a larger witness ledger are hypotheses. EG dispositions in recommendations.md are proposals. Matching an arithmetic table does not execute an evaluator; matching totals does not establish matching identity.

The recommended comparison contract requires the same filtered/grouped input scope, the same identity partition, the same reducer input values, the same measure eligibility, and the same agreement/empty/conflict policy. Source-occurrence and selected-value identities are equivalent only when their scoped classes have a bijection. Distinct field origins alone do not settle that question. Preserve source identity, typed keys, independent equal-valued events, missing-ID policy, and complete group provenance. [Sources: `summarizeGroup`][shared]; [`sourceReferences`, `aggregateFrame`][evaluator].

### Freeze provenance

An independent fixture author read the task prompt and fixed the following expectations at **2026-10-21T19:08:07.884586Z**, before reading either reducer, its tests, or computed results. A construction/provenance mapping was separately fixed before calculating outputs for that mapping. The original files were kept unchanged and their hashes rechecked after prediction.

| Frozen record | SHA-256 |
| --- | --- |
| Original human-readable oracle | `2c02dc6c3b50253605ea86bea79c9e452c05797ab1398f64b9fd00c216e0ef15` |
| Original machine-readable oracle | `d285f45c2486cdd56cc6c1a458b7b78216f4741a0e6b2cf131f3eb4d5c25b80d` |
| Concrete mapping addendum | `0d4ae6e59adb938101633883ddd57ccd90a8c99c2ce86383d66d74a42cad00bb` |

Section 2 reproduces the human-readable oracle with headings nested for this document; section 3 reproduces the construction mapping with code formatting normalized. Their original hashes identify the unmodified freeze records, **not** this assembled proof-plan file. The separate JSON is an audit record, not an extra required archive member; all declared expectations needed to use this plan are included below.

## 2. Frozen normative oracle

The following is the pre-prediction oracle, not an assertion that every proposed policy is implemented. In particular, its missing-value exclusion and measured-count alternatives must not be rewritten to match current project fallback behavior. The later recommendation is to preserve the different ordinary count populations, not add a new finite-value count feature.

Baseline under research: `f4cacdde180e16ad814451a8c064e394535565d6`.

**Evidence class:** normative/proposed oracle, not current product output and not a product test. The fixture author read only the attached R043 prompt before writing this file. Neither reducer, its tests, nor computed implementation results were inspected. Scope and exact membership precede arithmetic. The companion JSON is the machine-readable version of these declared expectations.

### Identity and eligibility contract

A **source occurrence** is one independently observed source row, regardless of repeated field labels. An expansion copies that occurrence and must not multiply an entity aggregate. A **value entity** is the typed, nonnull selected field value. Source and value contracts are equivalent only when the selected typed values define exactly the same partition of the scoped rows as source occurrences, and both select the same eligible measure population. Same numeric totals alone do not establish equivalence.

Typed values `number:1` and `string:1` remain distinct. A missing selected entity field is excluded from value identity, but a source occurrence with a missing selected label remains a real occurrence. Missing/duplicate *declared source keys* may require occurrence-specific fallback; they cannot authorize merging independent events.

`count()` below counts identity classes. `count(measure)` has an unresolved contract choice:

- **E — entity count:** count identity classes regardless of measure; the chosen measure does not alter population or impose scalar consistency.
- **V — valid numeric scalar count (proposed shared measured-population rule):** count identity classes with one agreed finite numeric scalar. Null/invalid measures are excluded. Conflicting raw measures make the measured result unavailable, pending explicit choice below.
- **P — present raw scalar count:** count identity classes with an agreed nonnull raw measure; invalid nonnull text counts. This is an alternative only; do not assume it is the library or SQL contract.

Numeric examples use numbers except the explicit invalid and representation-conflict values, so parsing is unambiguous. Zero is a numeric contributor. All-nonnumeric or empty eligible populations have proposed `sum = unavailable`, `average = unavailable`, never a fabricated observed zero; an implementation's empty-sum convention must be reported separately. Mean denominator is the exact accepted numeric entity set, not all rows or all entities.

For scalar conflicts, the proposed default is **whole-result unavailable** for V/P measured count, sum, and average. The alternative **exclude only conflicting entities** must be shown separately, including excluded membership; it is not silently adopted. E count and count without a measure can remain available because neither requires a scalar. For raw `10` versus `'10'`, strict raw agreement and parsed agreement are separate proposed alternatives.

### F1: main rows (nine rows; eight independent source occurrences)

`entity` is the intended source-key-equivalent field on the first eight rows. `label` deliberately merges the two independent A/B observations when copied into a derived field. A source-origin field uses the source occurrence partition even when its displayed values repeat. The copied/derived field has identical displayed values but is explicitly grouped by value. Amount is raw.

| Row | Source occurrence | entity | label | amount |
| --- | --- | --- | --- | --- |
| r1 | A | `string:A` | `string:shared` | `10` |
| r2 | A | `string:A` | `string:shared` | `10` |
| r3 | B | `string:B` | `string:shared` | `10` |
| r4 | NUM | `number:1` | `number:1` | `2` |
| r5 | STR | `string:1` | `string:1` | `3` |
| r6 | ZERO | `string:Z` | `string:Z` | `0` |
| r7 | NULL | `string:N` | `string:N` | `null` |
| r8 | BAD | `string:I` | `string:I` | `'bad'` |
| r9 | MISSING | `null` | `null` | `7` |

`r2` is an expansion of source A. `r3` is a separate source observation with the same label and same amount; it must remain distinct at source grain. Source occurrences are symbolic stable identities, not string-coerced field values.

#### F1-E: equivalent scope r1–r8, source occurrence versus typed `entity`

- Group rows: `{r1,r2,r3,r4,r5,r6,r7,r8}`.
- Group source set: `{A,B,NUM,STR,ZERO,NULL,BAD}`.
- Exact entity classes: `A:{r1,r2}; B:{r3}; number:1:{r4}; string:1:{r5}; Z:{r6}; N:{r7}; I:{r8}`.
- Canonical representatives (first row in input order): `{r1,r3,r4,r5,r6,r7,r8}`. Representative selection is an oracle naming convention, not permission to choose the first conflicting scalar.
- Expansion duplicate rows: `{r2}`; conflicting rows: `{}`; missing-identity rows: `{}`.
- Numeric contributing representatives: `{r1,r3,r4,r5,r6}`; numeric entity set `{A,B,number:1,string:1,Z}`.
- Numeric exclusions: `{r7:null,r8:invalid}`. E-count contributors are all seven representatives; P-count contributors are `{r1,r3,r4,r5,r6,r8}`.
- Expected `count()=7`; `count(measure): E=7 / V=5 / P=6`; `sum=25`; `average=25/5=5`.

#### F1-L: same rows r1–r8, intentionally different source-origin `label` versus copied `label`

- Source-origin `label` retains exactly F1-E's source partition and outputs: `count()=7`, E/V/P measured counts `7/5/6`, sum `25`, average `5`.
- Copied/derived `label` value classes: `shared:{r1,r2,r3}; number:1:{r4}; string:1:{r5}; Z:{r6}; N:{r7}; I:{r8}`.
- Group rows/source set remain F1-E's full sets; value representatives are `{r1,r4,r5,r6,r7,r8}`.
- Value-group repeats `{r2,r3}` have different meanings: r2 is an expansion; r3 is an independent event intentionally merged only by the chosen label-value question.
- Numeric contributing representatives `{r1,r4,r5,r6}`; numeric entity set `{shared,number:1,string:1,Z}`. Numeric exclusions `{r7:null,r8:invalid}`.
- Expected copied-label `count()=6`; `count(measure): E=6 / V=4 / P=5`; `sum=15`; `average=15/4=3.75`.
- These outputs must differ because partitions differ. Equality must not be forced by deduplicating A/B at source grain.

#### F1-M: missing selected identity r9 only

- Group rows `{r9}`, source membership `{MISSING}`.
- Source-origin identity: class `MISSING:{r9}`, representative and numeric contributor `{r9}`; `count()=1`, E/V/P measured counts `1/1/1`, sum `7`, average `7`.
- Value identity (`entity` or copied `label`): no classes, no representatives, no numeric contributors; excluded identity rows `{r9}`; `count()=0`, E/V/P measured counts `0/0/0`, proposed sum/average unavailable.

#### F1-A: all nine rows, checking that availability does not hide membership

- Source-origin group source set `{A,B,NUM,STR,ZERO,NULL,BAD,MISSING}`; classes F1-E plus `MISSING:{r9}`; representatives `{r1,r3,r4,r5,r6,r7,r8,r9}`; numeric representatives `{r1,r3,r4,r5,r6,r9}`.
- Source-origin expected `count()=8`; E/V/P measured counts `8/6/7`; sum `32`; average `32/6=16/3`.
- Value `entity` classes/representatives/contributors are F1-E's, with r9 excluded as missing identity. Full group source membership still includes MISSING. Expected `count()=7`; E/V/P measured counts `7/5/6`; sum `25`; average `5`.
- Copied `label` classes/representatives/contributors are F1-L's, with r9 excluded. Expected `count()=6`; E/V/P measured counts `6/4/5`; sum `15`; average `3.75`.

#### F1-Z/N/I/T: compact controls

- `{r6}` zero: source and value class `{ZERO:{r6}}`, one representative and numeric contributor; all counts `1`; sum `0`; average `0`.
- `{r7}` null: class `{NULL:{r7}}`, representative r7, no numeric contributor; count `1`; E/V/P measured count `1/0/0`; proposed sum/average unavailable.
- `{r8}` invalid: class `{BAD:{r8}}`, representative r8, no numeric contributor; count `1`; E/V/P measured count `1/0/1`; proposed sum/average unavailable.
- `{r4,r5}` typed-key control: classes `number:1:{r4}` and `string:1:{r5}`; representatives/contributors `{r4,r5}`; source set `{NUM,STR}`; all counts `2`; sum `5`; average `2.5`. Coercing identities to strings is forbidden.
- Filter-before-aggregate control `{r3,r6}`: source/value entity classes `{B:{r3},Z:{r6}}`; exact group source set `{B,ZERO}`; representatives/contributors `{r3,r6}`; all counts `2`; sum `10`; average `5`. No A row can re-enter through a global entity lookup.

### F2: scalar conflict, equivalent identities

Two expansion rows refer to the same source occurrence C and the same nonnull value key `string:C`; their *derived* raw measures differ: `c1=4`, `c2=6`. This is deliberately not two independent source events. Both identity policies define `C:{c1,c2}`. Group rows `{c1,c2}`, source set `{C}`, representative `{c1}` only as a naming convention; conflict membership `{c1,c2}`; accepted numeric contributors `{}` under whole-result-unavailable policy. Both raw numeric candidates must remain inspectable.

- `count()=1`; E measured count `1`.
- Proposed strict scalar policy: V/P measured count, sum and average all unavailable; responsible entity C and both rows must be discoverable.
- Entity-only exclusion alternative: V/P measured counts `0`, sum/average unavailable (no remaining eligible entities), exclusion set `{C}`, excluded rows `{c1,c2}`.
- Negative control: change only c2's amount from 6 to 4. All counts `1`; sum `4`; average `4`; contributor `{c1}`, duplicate `{c2}`.
- Add a valid independent entity D with row d1 amount9 to distinguish failure scope: whole-result policy keeps measured result unavailable; entity-only policy yields V/P count1, sum9, average9, contributors `{d1}`, excluded entity C and rows `{c1,c2}`. `count()=2`, E count2 in both policies.

### F3: raw-representation conflict (choice explicitly unresolved)

`q1` and `q2` are expansion copies of source Q and value key Q. Amounts are `10` (number) and `'10'` (string). Exact class `Q:{q1,q2}`, source set `{Q}`, group rows `{q1,q2}`. All identity counts and E measured count are `1`.

- Strict raw-agreement proposal: both rows are conflict membership; V/P count, sum and average unavailable, accepted numeric contributors `{}`.
- Parsed-numeric-agreement alternative: scalar10, representative/contributor `{q1}`, repeated numeric value row `{q2}`, V/P count1, sum10, average10.
- Negative control amounts both number10: V/P count1, sum10, average10, contributor `{q1}`, duplicate `{q2}`.

Do not silently select parsed agreement merely because both parse to 10. This is a policy choice, not an arithmetic error.

### F4: lookup expansion with missing/duplicate target source keys

The target source has a declared primary key `pk`, but lookup uses distinct nonnull `joinKey` values. Thus lookup matching is unambiguous even when declared source keys are broken. Missing/duplicate key diagnostics remain required. Target occurrence IDs below name source positions, not the broken primary-key values.

| Target occurrence | pk | joinKey | amount |
| --- | --- | --- | --- |
| T1 | `null` | `j1` | `5` |
| T2 | `'dup'` | `j2` | `8` |
| T3 | `'dup'` | `j3` | `8` |
| T4 | `'safe'` | `j4` | `9` |

Left records L1→j1, L2→j1, L3→j2, L4→j2, L5→j3, L6→j4 produce output rows k1…k6 respectively. Exact lookup pairings: `k1:{L1,T1}; k2:{L2,T1}; k3:{L3,T2}; k4:{L4,T2}; k5:{L5,T3}; k6:{L6,T4}`.

#### F4-S: source-origin target identity

- Group rows `{k1,k2,k3,k4,k5,k6}`.
- **Complete group source membership** `{L1,L2,L3,L4,L5,L6,T1,T2,T3,T4}`; target-entity membership `{T1,T2,T3,T4}`. These sets are intentionally different.
- Classes `T1:{k1,k2}; T2:{k3,k4}; T3:{k5}; T4:{k6}`. Occurrence fallback must preserve T2 separately from T3 despite their equal pk and amount.
- Representatives and numeric contributors `{k1,k3,k5,k6}`; expansion duplicates `{k2,k4}`; conflict/exclusion sets empty.
- All four count variants `4`; sum `5+8+8+9=30`; average `30/4=7.5`.

#### F4-V: copied target pk, value identity

- Classes `string:dup:{k3,k4,k5}; string:safe:{k6}`.
- Group source membership remains the full ten-source set. Representatives and numeric contributors `{k3,k6}`; missing-identity rows `{k1,k2}`; value repetitions `{k4,k5}`. k5 is an independent observation intentionally merged by the pk-value question, so this is not an equivalent source-grain comparison.
- All four count variants `2`; sum `17`; average `8.5`.

#### F4 negative control

Set T1.pk='one', T2.pk='two', T3.pk='three', retain T4.pk='safe'. Lookup pairings and source occurrences are unchanged. Both policies now have exactly the same four classes and expected all counts4, sum30, average7.5. This isolates primary-key validity and identity policy without changing numeric values or represented population.

### Freeze rule

These expected partitions, memberships, and alternatives are fixed before source-output prediction. Later source analysis may identify that the implementation uses E, V, P, another policy, or a different empty/conflict convention. Record those findings in a separate current-output table; never rewrite this oracle to match them. Proposed expectations are not claims that existing behavior is wrong. Runtime verification requires a complete checkout and remains a separate step.

### F2-min: minimal conflict with an unaffected entity (added before source-output examination)

This named control fixes the scalar-conflict policy independently of missing-value eligibility. All measures are nonnull finite numbers.

| Row | Source occurrence / selected typed entity | Raw amount |
| --- | --- | --- |
| x1 | `string:x` | `10` |
| x2 | `string:x` | `20` |
| y1 | `string:y` | `5` |

Exact classes `x:{x1,x2}; y:{y1}`, group rows `{x1,x2,y1}`, group sources `{x,y}`, canonical representatives `{x1,y1}`, conflict rows `{x1,x2}`. `count()=2`; E measured count2. Under proposed strict scalar agreement, V/P measured count, sum and average are whole-result unavailable; y remains a valid numeric candidate/contributor `{y1}` but cannot make the aggregate scalar available. Under explicit entity-only exclusion, V/P measured count1, sum5, average5; accepted numeric contributors `{y1}`, excluded entity `{x}` and rows `{x1,x2}`. Negative control changes x2 to10: all counts2, sum15, average7.5, numeric contributors `{x1,y1}`, duplicate row `{x2}`.

### F3-Z: optional signed-zero agreement edge (choice unresolved)

Two copies z1/z2 of source ZS and typed entity ZS have raw amounts +0 and -0. Identity classes are identical under both policies: `ZS:{z1,z2}`, source set `{ZS}`, canonical representative `{z1}`. Identity count and E measured count1. Under strict signed-zero-sensitive raw identity, scalar disagreement makes V/P measured count/sum/average unavailable; conflict rows `{z1,z2}`. Under ordinary numeric-zero agreement, both represent observed zero: V/P count1, sum0, average0, contributor `{z1}`, duplicate `{z2}`. Neither alternative changes zero into missing. This is an explicit edge decision, not a presumed required behavior.

## 3. Frozen construction and provenance mapping

This is a construction/provenance addendum, not computed product output. It leaves both original oracle files byte-identical. The original F1 source sets name focal event occurrences. The concrete project mapping below additionally includes expansion carrier records; these must not be mislabeled as numeric contributions.

### F1 mapping

Source `events` declares key `eventId`, with eight unique string IDs in this order: A, B, NUM, STR, ZERO, NULL, BAD, MISSING. Its fields `entity`, `label`, `amount` are exactly the frozen main table values (one row for A). The event ID is different from the nullable/typed selected entity field. Source `parts` declares key `partId`: p1/p2 reference event A; p3 B; p4 NUM; p5 STR; p6 ZERO; p7 NULL; p8 BAD; p9 MISSING. Relationship events.eventId -> parts.eventId expands as `part` after the events source stage. Result r_i has key `expand:events:string:<eventId>:parts:string:p<i>`. Each row's sourceRows and contributors are exactly `{events:string:<eventId>, parts:string:p<i>}`.

F1-E/L restrict to r1 through r8 before aggregate. Complete group references G are {events:A,events:B,events:NUM,events:STR,events:ZERO,events:NULL,events:BAD,parts:p1,parts:p2,parts:p3,parts:p4,parts:p5,parts:p6,parts:p7,parts:p8}: 15 references. Prefix shorthand events:A means sourceId=events,rowKey=events:string:A; parts:p1 means sourceId=parts,rowKey=parts:string:p1.

F1-A G adds {events:MISSING,parts:p9}: 17 references. F1-M G is {events:MISSING,parts:p9}. F1 typed control G is {events:NUM,events:STR,parts:p4,parts:p5}; zero G {events:ZERO,parts:p6}; null G {events:NULL,parts:p7}; invalid G {events:BAD,parts:p8}; filtered r3/r6 G {events:B,events:ZERO,parts:p3,parts:p6}.

Frozen F1-E numeric representative set {r1,r3,r4,r5,r6} has reference union {events:A,events:B,events:NUM,events:STR,events:ZERO,parts:p1,parts:p3,parts:p4,parts:p5,parts:p6}. This union is context attached to representatives; the amount originates only in those five event records. It is not the complete group G. F1-L copied-label representatives omit r3, whose event B remains in G.

A calc field `entityCopy` uses expression ["events.entity"]; `labelCopy` uses ["events.label"]. Their expected raw scalar values are unchanged. They intentionally lose source origin and invoke a value/fallback identity contract. Shared inputs use unique numeric __ID i-1 and the same displayed scalar fields; this local row ID is mapped back to r_i. All grouping uses one nonnull constant group to avoid null/undefined category normalization differences.

### F2/F2-min/F3/F3-Z mapping

Use `entities` keyed by entityId with one row per named entity; expand a `witnesses` source keyed by witnessId. The witness stores the raw measured amount; a direct calc copy may expose it as `amount`. F2-min witnesses x1/x2 belong to entity x and have amounts10/20; y1 belongs to y with amount5. Each result row carries the entity ref plus its distinct witness ref. G={entities:x,entities:y,witnesses:x1,witnesses:x2,witnesses:y1}. Both source-origin entities.entityId and derived entityCopy define x:{x1,x2}, y:{y1}. Shared inputs use those same typed values and unique __ID0/1/2. Choosing the first conflict scalar is disallowed. Negative control changes only x2 amount to10.

F2 uses entity C and witnesses c1/c2; optional D/d1 gives a second unaffected entity. F3 uses Q/q1/q2 and raw10/text10. F3-Z uses ZS/z1/z2 with numeric +0/-0; preserve sign in a TypeScript fixture (not JSON serialization). G for each consists of the named entity records and every witness record, even when a result is unavailable.

### F4 mapping

Use source `targets`, key `pk`, in frozen T1/T2/T3/T4 order, and source `left`, key `leftId`, L1 through L6. Relationship left.joinKey -> targets.joinKey is a lookup as `target`, not a lookup on the broken pk. Target reference keys are targets:row:0, targets:row:1, targets:row:2, targets:string:safe. Result k_i keeps row key `left:string:L<i>`; sourceRows are exactly the frozen pairings. Whole G has ten source-qualified refs. Target numeric representatives k1/k3/k5/k6 attach {left:L1,left:L3,left:L5,left:L6,T1,T2,T3,T4}, eight references; all six left records remain in G. A calc `pkCopy` uses ["target.pk"] for the derived comparison. The clean-key control changes only target pk as frozen; row references change to their valid keys but logical occurrence sets/pairings and expected values remain fixed.

### Execution status

This addendum is frozen before calculating outputs for this concrete evaluator construction. It is a proposed test construction; no evaluator or browser execution occurred.

## 4. Current source predictions — kept separate from the oracle

No reducer was invoked to produce these tables. U means the scalar is unavailable (`undefined` in the inspected result path), not zero. The ordered tuple is **(count without a measure, count with amount, sum, average)**. All grouping uses one nonnull constant group, avoiding unrelated null-versus-undefined category normalization. Shared inputs supply no overriding exclusion-reason sidecar. [Sources: `aggregateValues`, `summarizeGroup`, `calculateGroupedAggregate`][shared]; [`aggregateFrame`][evaluator]; [`categoryKey`, `categoryValue`][categories]; [`parseNumber`, `numericExclusionReason`][values].

### Main fixture

| Scope and identity | Shared prediction | Project prediction |
| --- | --- | --- |
| F1-E: r1–r8, source-equivalent entity | (7, 7, 25, 5) | Source-origin or copied nonnull entity: (7, 6, 25, 5) |
| F1-L: r1–r8, repeated label | (6, 6, 15, 3.75) | Source-origin: (7, 6, 25, 5); copied label: (6, 5, 15, 3.75) |
| F1-M: r9, missing selected entity | (0, 0, U, U) | Source-origin or copied-null fallback: (1, 1, 7, 7) |
| F1-A: all rows, entity | (7, 7, 25, 5) | Source-origin or copied entity: (8, 7, 32, 16/3) |
| F1-A: all rows, label | (6, 6, 15, 3.75) | Source-origin: (8, 7, 32, 16/3); copied label: (7, 6, 22, 4.4) |
| F1-Z: observed zero r6 | (1, 1, 0, 0) | (1, 1, 0, 0) |
| F1-N: null amount r7 | (1, 1, U, U) | (1, 0, U, U) |
| F1-I: invalid amount r8 | (1, 1, U, U) | (1, 1, U, U) |
| F1-T: typed identities r4/r5 | (2, 2, 5, 2.5) | (2, 2, 5, 2.5) |
| Filtered r3/r6 | (2, 2, 10, 5) | (2, 2, 10, 5) |

For F1-E, shared measured count includes r7/null, whereas project measured count excludes it. Both include r8/invalid nonnull text. Numeric membership agrees. The shared measured count is **not pure oracle E**: it counts all nonconflicting units but still invalidates the scalar for a measure conflict. Project measured count follows present-nonnull eligibility but excludes conflicting entities without invalidating the whole count. Neither ordinary behavior implies a new V count.

The project source-origin branch uses any originating source field, including label or nullable entity. A copied field has step origin; nonnull values group by typed value, while nullish values get a separate result-row fallback. Thus F1-A copied entity adds r9 to F1-E; copied label adds r9 to F1-L. F1-M source and copied results happen to agree, but their identity tokens differ. [Sources: `calculateFrame`, `aggregateFrame`][evaluator]; [`AnalysisField`][types].

### Conflict and agreement controls

| Case | Shared prediction | Project prediction |
| --- | --- | --- |
| F2: C has raw amounts 4 and 6 | (1, U, U, U) | (1, 0, U, U) |
| F2 plus unaffected D/9 | (2, U, U, U) | (2, 1, U, U) |
| F2 negative: both amounts 4 | (1, 1, 4, 4) | (1, 1, 4, 4) |
| F2-min: x has 10/20; y has 5 | (2, U, U, U) | (2, 1, U, U) |
| F2-min negative: x has 10/10; y has 5 | (2, 2, 15, 7.5) | (2, 2, 15, 7.5) |
| F3: Q has number 10 and string '10' | (1, U, U, U) | (1, 0, U, U) |
| F3 negative: both number 10 | (1, 1, 10, 10) | (1, 1, 10, 10) |
| F3-Z: one entity, +0 and -0 | (1, U, U, U) | (1, 1, 0, 0) |

F2-min is the smallest repair candidate with an unaffected entity. The partition `x:{x1,x2}; y:{y1}`, finite/non-null eligibility, and input scope agree. The count-with-measure difference isolates failure policy. Whole-result unavailability is the recommended proposal; explicitly labeled entity-only exclusion remains an alternative. The sum and average are unavailable in both current paths, even though y1 remains a valid numeric candidate. Selecting x1's value as the entity scalar is forbidden. The type comment on `AggregateMeasure.entityFieldId` says conflicting values are unavailable; the project count branch does not apply the numeric branch's whole-result guard. [Sources: `summarizeGroup`][shared]; [`aggregateFrame`][evaluator]; [`AggregateMeasure`][types].

F3 compares **values presented to the reducer before its numeric parsing**. It does not compare original file bytes or the shared `rawInputs` sidecar. Adapters may have already converted both representations to the same number. Test the direct reducer contract separately from UI reachability through field settings. F3-Z needs a TypeScript fixture because JSON serialization does not preserve negative zero. The signed-zero agreement policy remains unresolved and cannot silently change during extraction. [Sources: `Object.is` use in `summarizeGroup`][shared]; [`stable` in the evaluator][evaluator]; [`convertFieldValue`, `applyFieldSettings`][field-settings]; [`getAggregateResult`, `getColumnData`][data-layer].

### Missing/duplicate source-key controls

| F4 identity | Exact classes and selected rows | Predicted tuple |
| --- | --- | --- |
| Project source-origin target | `{k1,k2}\|{k3,k4}\|{k5}\|{k6}`; representatives `{k1,k3,k5,k6}` | (4, 4, 30, 7.5) |
| Shared selected target pk | `{k3,k4,k5}\|{k6}`; representatives `{k3,k6}`; missing-ID exclusions `{k1,k2}` | (2, 2, 17, 8.5) |
| Project copied target pk | `{k1}\|{k2}\|{k3,k4,k5}\|{k6}`; representatives `{k1,k2,k3,k6}` | (4, 4, 27, 6.75) |
| Negative: unique nonnull pks one/two/three/safe | Same four source/value classes; representatives `{k1,k3,k5,k6}` | (4, 4, 30, 7.5) everywhere |

The two null-copy identities in the third row are result-row identities, not T1's source identity. They cause the amount 5 to contribute twice. T2 and T3 then merge under the copied value 'dup'. A count of four therefore does not establish parity with the source-origin result. Source identity preserves both independent equal-valued target events.

Expected source diagnostics are one missing source key (T1) and two duplicate source-key rows (T2/T3). There is no missing or ambiguous relationship match because lookup uses the distinct joinKey. The target references are `targets:row:0`, `targets:row:1`, `targets:row:2`, `targets:string:safe`; the lookup output row keys remain `left:string:L1` through `left:string:L6`. [Sources: `sourceReferences`, `lookupFrame`, `aggregateFrame`][evaluator].

### Evidence payloads and exact source membership

Keep five categories separate: the full group source union G; identity classes; selected representatives; numeric contributions; and excluded or conflicting witnesses. A reference attached to a representative is contextual lineage, not proof that every attached record supplied the number.

| Scope | Predicted evidence and membership |
| --- | --- |
| F1-E numeric shared summary | All r1–r8 remain contributors. Included numeric rows `{r1,r3,r4,r5,r6}`; r2 repeats A; r7 is null/missing numeric; r8 is invalid numeric. Representatives of invalid units are not always separately identifiable from flags alone. |
| F1-E project sum/average | Per-measure records contain `{r1,r3,r4,r5,r6,r7,r8}`; numeric included `{r1,r3,r4,r5,r6}`; numeric excluded `{r7,r8}`. r2 is absent from this ledger, but remains in pre-aggregate data and G. Each sum/average ledger has its own entries. |
| F1-L copied-label project numeric ledger | Records `{r1,r4,r5,r6,r7,r8}`; numeric included `{r1,r4,r5,r6}`. r2/r3 do not become numeric representatives; event B remains in G. |
| F2-min shared measured operation | Contributors x1=false/conflict, x2=false/conflict, y1=true/input 5; all three row IDs remain. Shared rowCount is one nonconflicting unit; whole scalar U. No-measure count instead counts two entities. |
| F2-min project sum/average | Ledger only y1=true/input 5. Conflict witnesses x1/x2 are skipped before ledger creation. G still has `{entities:x,entities:y,witnesses:x1,witnesses:x2,witnesses:y1}`. No count ledger is populated. |
| F4 source-origin project | G is all six left and all four targets, ten references. Numeric representatives `{k1,k3,k5,k6}` attach `{L1,L3,L5,L6,T1,T2,T3,T4}`, eight references. All four targets supply amounts. |
| F4 shared selected pk | Full input evidence includes k1–k6. Numeric rows `{k3,k6}`; missing identities `{k1,k2}`; repeats `{k4,k5}`. Mapping those numeric rows back gives context `{L3,L6,T2,T4}`. T1/T3 remain in full input context. |
| F4 project copied pk | G remains all ten references. Numeric rows `{k1,k2,k3,k6}` attach `{L1,L2,L3,L6,T1,T2,T4}`, seven references. T1 supplies 5 twice; T3 remains in G but supplies no selected scalar. |

For F1-E, G has the seven focal event records plus parts p1–p8, fifteen references; numeric representative context has five event records plus parts p1,p3,p4,p5,p6, ten references. For copied-label F1-L, numeric context has events A,NUM,STR,ZERO plus parts p1,p4,p5,p6, eight references. F1-A G has eight event records plus nine part records, seventeen references. These exact sets, not just cardinalities, must be asserted in the eventual fixture. Section 3 defines the source-qualified spellings.

Shared repeat reasons apply when the unit's representative is eligible; repeated invalid units can give every row the numeric exclusion reason instead. A rendered input order plus entity grouping may then be necessary to infer the first-row unit. Project `evaluateAnalysisQuery` sums false-included ledger entries across measures into `excludedCount`; it is not a unique-source-row count. Adding omitted conflict/repeat witnesses changes that accounting. The inspected query UI does not display this count, so no visible zero-excluded defect is alleged. [Sources: `summarizeGroup`][shared]; [`aggregateFrame`, `evaluateAnalysisQuery`][evaluator]; [`Diagnostics`, `FlowStep`][query-flow].

## 5. Proposed complete-checkout proofs

**All rows in this section are pending.** Begin with the recorded pinned baseline or a review branch whose differences are explicitly recorded. Do not import an extracted file and describe it as the full supported application. Codex owns integration, dependency setup if needed, and the subsequent review PR.

### Minimal positive and negative controls

| Proof | Positive case and required assertions | Negative control / rejection gate |
| --- | --- | --- |
| P01 — conditional parity | F1-E source-origin and copied nonnull entity: compare exact classes, numeric reps, sum 25, mean 5, G, and ordinary measured-count eligibility separately | F1-L intentionally differs; reject a parity assertion that merges independent A/B |
| P02 — missing and broken identity | F1-M plus F4: assert source positional fallback, diagnostics, copied-null result-row fallback, shared missing-ID reasons, and complete G | Clean-key F4 must converge to four classes, sum 30, mean 7.5; reject an arbitrary first-match fix |
| P03 — measured-count conflict | F2-min through supported shared API and `evaluateAnalysisQuery`: show current U versus 1 with the same x/x/y partition, then adopt the explicit conflict policy in implementation review | Only change x2 to 10: both measured counts 2, sum 15, mean 7.5; retain count-without-measure 2 |
| P04 — scalar agreement | Direct F3 number/string inputs; separately inspect chart conversion reachability; retain reasons and conflict rows | Both number 10 yields one scalar 10. F3-Z remains a separate recorded policy choice; no incidental normalization |
| P05 — absence versus zero | Single null, invalid, zero, missing-ID, and empty selected population; assert membership, reasons, unavailable scalar, and zero as distinct outcomes | Zero contributes one valid number; null/invalid must not become observed zero |
| P06 — scope and pooling | Filter r3/r6 before aggregation; assert only B/ZERO and their carrier references. Pool original contributor inputs and recompute entities | No filtered-out A may re-enter; no average of displayed group averages; preserve all contributing input IDs |
| P07 — ordinary shop regression | Preserve source total 150; represented parent total 140; per-item parent repetition 310; correct once-per-order representatives | O5 unmatched remains present with item count 0 and unavailable item sum; do not force 150 and 140 to match |
| P08 — explanation | Identify x and exact x1/x2 conflict witnesses from current/proposed trace route, then exercise all-invalid, missing-ID, and zero cases | Equal values, independent equal-valued events, ordinary row count: no false conflict or unexplained disappearance |

The F2-min project construction is intentionally small: source `entities` keyed by `entityId` has x/y; source `witnesses` keyed by `witnessId` has x1/x2/y1 and amounts 10/20/5; expand witnesses from entities; aggregate the source-origin `entities.entityId` and witness amount. No calculated measure, missing key, or ambiguous lookup is needed. Compare the same raw x/x/y values in `summarizeGroup`. Assert the pre-aggregate row mapping before asserting scalars. The negative control changes only x2's amount.

For P05, shared empty `summarizeGroup` should be distinguished from `calculateGroupedAggregate` having no group rows; project global aggregate and grouped empty behavior likewise need explicit expected row cardinality. Do not invent a witness entity for an empty result. The supplied project tests already cover empty cases and are the starting point. [Sources: `calculateGroupedAggregate`][shared]; [`aggregateFrame`][evaluator]; [empty aggregate tests][project-tests].

P06 includes this **additional proposed pooling control**, not part of the original freeze and not executed: North has A/10; South has A/10, B/30, B/30. North entity sum 10, mean 10, count 1; South entity sum 40, mean 20, count 2. Pooling original inputs gives A/10 plus B/30: sum 40, mean 20, count 2, with all four input-row records retained. Summing displayed sums would give 50, and averaging displayed means would give 15; both ask a different question. Freeze the concrete IDs before implementation. [Source: `poolAggregateRows`][shared].

### Exact destinations and commands

Use the existing suites:

- `packages/explorEDA/src/lib/aggregates.test.ts` for direct shared identity, reasons, pooling, and scalar eligibility.
- `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts` for source/copy identity, source diagnostics, lookup/expand construction, group provenance, count conflict, and ordinary shop controls.
- Proposed optional shared fixture: `packages/explorEDA/src/test/fixtures/entityGrain.ts`. Keep it small; it is not created by this research.
- If a visible repair is implemented, add focused component coverage beside the changed existing consumer. Inspect the repository's actual component-test conventions first.

Run from a complete repository root after the minimal cases are integrated:

```sh
pnpm --filter exploreda exec vitest run src/lib/aggregates.test.ts src/test/lib/analysis/evaluateProject.test.ts
pnpm --filter exploreda check-types
```

Run the project-wide gate once before a review PR:

```sh
pnpm check
```

Record the exact tested commit, commands, exit statuses, observed failing/passing case, changed files, and any remaining gaps. These commands are supplied follow-up instructions, **not a transcript of this research**. A passing test must assert exact classes/source sets/reasons where relevant, not mirror the reducer algorithm or rely only on scalar equality.

### Repair gates

- **EG01:** GO for a contract table and narrow cases. Preserve distinct identities and ordinary count populations. Do not use a new V count to make the tables look equal.
- **EG02:** implementation GO only after P03 reproduces and whole-result unavailability is adopted in the subsequent implementation review. Keep no-measure count available. If explicit entity-only exclusion is chosen instead, document it and expose excluded membership; do not claim parity.
- **EG03:** first try the existing conflict message plus measure context and easy preceding-stage navigation. Do not promise exact automatic row focus from a diagnostic that lacks structured witness IDs. Expand per-measure witnesses only if the author task fails with the smaller repair.
- **EG04:** correct count-unit wording and show typed entity identity using existing evidence. No new Inspect button, generic provenance API, or saved identity setting.
- **EG06:** no extraction until identity, count eligibility, scalar agreement, exact reasons, pooling, scope, and complete source sets survive. Code duplication by itself does not pass that gate.

## 6. Proposed browser and author proofs

Run changed flows at **1280, 783, and 390 px**. Record screenshots, keyboard behavior, exact inputs, selected fields, and author answers. No browser or author proof was performed on the research packet.

### Shared and metric-card route

The inspected route is `MetricCard → ChartTraceScope → ChartTracePanel.TraceBody → MetricCardTraceBody → AggregateContributorTable`. Use existing Alt-click/Alt-Enter trace affordances and keyboard focus behavior, not a newly invented Inspect button. The count card clears its measure field; **measured-count P03 is an API/project proof, not a card-count proof**. Metric-card count deliberately hides input columns, and compact contributor tables can omit raw/type columns. [Sources: `MetricCard`][metric-card]; [`planMetricCard`][card-plan]; [`MetricCardTraceBody`][card-body]; [`AggregateContributorTable`][contributor-table]; [`ChartTracePanel`][trace-panel].

Tasks and pass criteria:

- Two equal copies of x: the author can distinguish two input rows, one selected entity, one included representative, and one repeat. An input-row count should come from contributors, not relabeling `rowCount` as all entities.
- F2-min in **sum/average mode**: the author can name x, x1, x2, both amounts, and y1's valid contribution while explaining why the scalar is unavailable.
- Typed number 1 versus string '1': the trace makes the two entity values distinguishable; column labels and reason text remain readable at every width.
- Null/invalid repeated units: all reasons remain recoverable even where included/repeat flags do not identify a representative explicitly.
- Ordinary row count and zero are negative controls. If the shared grouped table changes, also exercise its existing `BarTraceBody` consumer and pagination.

Pair this visible milestone with `apps/demo/src/docs/pages/metric-card.mdx`, **How it reads / proposed Read an entity trace**, and the proposed runnable folder listed below. Retain the current `metric-card` LiveExample control. [Sources: metric-card docs][card-doc]; [grouped bar trace consumer][bar-body].

### Project route and smallest author task

The inspected route includes `ChartTracePanel.QueryRowsLink`, `AnalysisChartContext.resultRows`, `ProjectQueryPanel`, `QueryFlow.Diagnostics`, and `QueryStageRows`. Trace IDs include all contributor IDs. Query-stage focus initially selects output rows; prior stages are selectable. Related records are group context and may include descendants, not a numeric contribution ledger. The related-source table initially shows 25 records. [Sources: `traceRowIds`][trace-rows]; [`QueryRowsLink`][trace-panel]; [`ProjectQueryPanel`][query-panel]; [`QueryStageRows`, `relatedRecords`][stage-rows].

The minimal author task is: **Explain the unavailable x/x/y sum, identify the responsible entity, and name exactly which witness rows disagree. Then explain why an otherwise valid y is not a complete available total.**

- First record whether the current UI can complete that task using its generic diagnostic code and prior-stage rows.
- Try only the selected diagnostic's existing message/measure context and clearer prior-stage navigation.
- Pass when an author identifies x, rows x1/x2, values 10/20, y1/5 as valid-but-insufficient for whole-result availability, and the complete group membership without calling all related records numeric contributors.
- Reject ledger expansion if the smaller route passes. If it fails, record the exact missing evidence before adding fields or rendering.
- If witnesses are retained in a later patch, recheck `excludedCount` accounting across multiple measures; repetitions, conflict witnesses, numeric invalidity, and unique input rows are different units.
- Negative controls: x2=10, independent events sharing a label, null-only numeric population, and observed zero. No false identity collapse or disappearance.

Pair the milestone with `apps/demo/src/docs/pages/project-folders.mdx`, **Query steps / proposed Explain an unavailable measure**, and the same runnable example. Preserve full group references, the all-row trace mapping, ordinary lookup, and filter scope. [Sources: `aggregateFrame`, `evaluateAnalysisQuery`][evaluator]; [`Diagnostics`][query-flow]; [project-folder docs][project-doc].

### Proposed common runnable example

Every visible EG01–EG05 milestone must update its named docs section **and** this same proposed folder together:

`docs/research/entity-grain-2026-10-21/examples/entity-grain/`

Expected files are `exploreda.eda`, `analysis.eda`, and `data/*.json`; an optional SQL lesson may add `data/preaggregate.sql`. It should expose clean source/copy parity, repeated independent labels, F4, x/x/y conflict, null/invalid/zero, and a small scope control. Use a TypeScript test for signed zero rather than pretend the JSON folder preserves its sign. This folder is a future integration destination, not an artifact included here.

The documented folder route is `npx exploreda <folder>`. Run it only in the implementation environment; this research did not download a CLI or install packages. Existing shop and metric-card examples remain controls. [Sources: project-folder docs][project-doc]; [shop fixture][shop]; [`AGENTS.md`][agents]; [`CODING_STANDARDS.md`][standards].

## 7. Optional preparation proof and historical limits

EG05 is optional. If implemented, compare a validated keyed child preaggregate plus lookup with direct entity aggregation under the **same selected parent/event population**. Carry event count, valid/non-null numeric-amount count, and amount sum. Assert absence versus all-null versus zero separately; do not deduplicate equal amounts with `SUM(DISTINCT amount)` or roll up unweighted averages. Dirty keys and invalid strings need an explicit authored policy before this clean-input recipe applies.

The official SQL support is confined to DuckDB aggregate eligibility/DISTINCT/empty behavior and left/semi join membership, accessed **2026-10-21**. The concrete recipe in report.md remains unexecuted, and the intended engine/driver must be verified before claiming it preserves types or author effort. [Official aggregate reference][duck-agg]; [official JOIN reference][duck-join].

Compare parent amounts once per selected parent; child-event sums are a separate metric. Do not turn the F2 scalar conflict into a child sum or choose its first value and call that equivalent.

The local prepared row is immediate provenance; underlying database witnesses are not automatically recovered. Reject the optional handoff if the author needs those witnesses and the proposed audit relation/workflow is more work than complete local rows. Pair the lesson with `project-folders.mdx`, **Query steps**, and the common runnable folder; read the current `database-sources.mdx` before editing its handoff guidance.

PR451's preparation decision is reused, but its **18-row author proof and exact-contributor inspection proof remain proposed and unrun**. This plan does not mark them passed or expand R043 into their entire study. [Historical pinned README][prior-readme]; [decisions DP-04/DP-05][prior-decisions]; [original proof plan][prior-proof].

## 8. Executed checks and explicit non-results

| Check | Executed result | What it does not prove |
| --- | --- | --- |
| Packet extraction | All 35 declared section SHA-256 values matched | No runnable checkout |
| Baseline source confirmation | All 28 baseline packet files byte-matched exact-ref GitHub content | No branch checkout or application execution |
| Supplemental consumer/dependency inspection | 18 additional exact-baseline files read with declared scope in report.md | No whole-repository audit or all-import coverage |
| Freeze integrity | Original normative Markdown, JSON, and mapping hashes unchanged after prediction | No policy choice made by current code |
| Independent arithmetic and set checks | Forty recorded arithmetic/membership/integrity assertions passed; a separate derivation checked typed partitions and F4 source/value classes from literal rows | No product tests, runtime outputs, or browser outcomes |
| Deliverable validation | UTF-8, four Markdown byte/hash records, exactly five ZIP members, CRC, and standalone/archive byte equality checked | No implementation approval or deployed change |

**Not executed:** evaluator or shared reducer calls; Vitest; component tests; type/build checks; `pnpm check`; parser/calculator execution; SQL; browser layouts/screenshots; author tasks; PR451 proofs; performance tests. The artifact validation above is packaging evidence only.

**Next action:** targeted complete-checkout P01–P03/P07 verification, followed by the smallest EG03/EG04 author/trace proof if those visible changes are pursued. Retaining separate contracts is already a successful bounded research conclusion. Implementation remains gated on the stated evidence, not on invented customer demand.

## References

All repository links use the pinned baseline unless explicitly labeled historical. The symbol names throughout this file identify the relevant functions; source-read scopes and supplemental inventory are in report.md.

[shared]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/aggregates.ts
[evaluator]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/evaluateProject.ts
[types]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/types/AnalysisProject.ts
[categories]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/categories.ts
[values]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/valueParsing.ts
[field-settings]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/fieldSettings.ts
[data-layer]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/DataLayerProvider.tsx
[project-tests]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts
[metric-card]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/MetricCard/MetricCard.tsx
[card-plan]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts
[card-body]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/MetricCard/MetricCardTraceBody.tsx
[contributor-table]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/BarChart/GroupedAggregateInspector.tsx
[bar-body]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/BarChart/BarTraceBody.tsx
[trace-panel]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx
[trace-rows]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/trace/traceRows.ts
[query-panel]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/ProjectQueryPanel.tsx
[query-flow]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/QueryFlow.tsx
[stage-rows]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/QueryStageRows.tsx
[card-doc]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/src/docs/pages/metric-card.mdx
[project-doc]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/src/docs/pages/project-folders.mdx
[shop]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/fixtures/shopProject.ts
[agents]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/AGENTS.md
[standards]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/CODING_STANDARDS.md
[prior-readme]: https://github.com/byronwall/explorEDA/blob/0984715cb4c0c85d0d6efa8436ab38368bd20ae1/docs/research/data-preparation-boundary-2026-10-16/README.md
[prior-decisions]: https://github.com/byronwall/explorEDA/blob/0984715cb4c0c85d0d6efa8436ab38368bd20ae1/docs/research/data-preparation-boundary-2026-10-16/decisions.md
[prior-proof]: https://github.com/byronwall/explorEDA/blob/0984715cb4c0c85d0d6efa8436ab38368bd20ae1/docs/research/data-preparation-boundary-2026-10-16/originals/proof-plan.md
[duck-agg]: https://duckdb.org/docs/2.0/sql/functions/aggregates
[duck-join]: https://duckdb.org/docs/2.0/sql/query_syntax/from

