# Explicit, reusable join-key preparation for explorEDA

**Design recommendation · 25 October 2026**  
**Repository evidence:** the complete supplied packet at commit `95832bd473884aeae23453af0888b4ca5187820d`.  
**Companion:** [implementation-plan.md](implementation-plan.md).

## 1. What to build

**Build named join keys owned by a source, with explicit preparation rules, a review of changed matches, and exact access to the original records.** Relationships select either an existing raw field or one of these named keys. A source can reuse the same key in several relationships, on either endpoint and in either traversal direction. The original table, its field values, and its entity key remain unchanged.

The first release must be a complete analyst workflow: create a scalar text key in Schema; select **Trim text**, **Unicode NFC**, and/or **Lowercase A–Z**; compare saved and draft memberships; inspect collisions and original rows; explicitly accept any cardinality change; apply once; use lookup or expansion; undo through the host; save and reopen through the supported project formats. Ship the documentation and a runnable multi-source example with this release.

Follow with two independently useful releases:

1. **M1 — reusable text keys and complete review:** scalar keys, explicit text operations, source reuse, both traversal directions, exact evidence, persistence, worker integration, and responsive authoring.
2. **M2 — deliberate integer identifiers:** a separate decimal safe-integer convention that can intentionally equate number `7`, text `"7"`, and text `"007"`.
3. **M3 — structural composite keys:** ordered components with independent preparations, typed equality, and no delimiter concatenation.

These are proposed product changes for Codex and Byron to review. Byron supplies the demand. There is no outside-user, incident, survey, or usability-study prerequisite. PR523 category mappings, PR518 wide-to-long, PR525 ordered difference, and PR524 parameterized local notebooks are unbuilt adjacent proposals, not prerequisites or assumed APIs.

### The central design distinction

A **join key** answers “which records are eligible to match under this authored convention?” An **entity key** answers “which original record is this?” A normalization may intentionally give several records one join key. It must never merge those records, change their identity, deduplicate an expansion, or quietly select one lookup candidate.

The capability is source-owned but execution is shared: one small resolver prepares ordered component values for a raw source record or an already-reached query input row. Schema preview, evaluation, and record inspection call that resolver. There is no second preparation engine in notebooks, serializers, or chart code.

## 2. Stable recommendation register

The identifiers below are stable across both deliverables. **Build** means included in this proposed plan, subject to Codex and Byron’s review.

| ID / disposition | Recommendation | Reason |
| --- | --- | --- |
| **JK-01 · Build** | Source-owned named definitions in `SourceDefinition.joinKeys`, separate from raw fields and `entityKey`. | Preparation becomes reusable without rewriting supplied records or inventing query-output sources. |
| **JK-02 · Build** | One matching contract for Schema, evaluation, and inspection, retaining raw strict semantics. | The current independent paths otherwise disagree when keys are prepared. |
| **JK-03 · Build** | Explicit trim, NFC, and ASCII lowercase in M1, in a fixed visible order. | These solve common encoding differences without implicit type conversion or locale guesses. |
| **JK-04 · Build** | Typed eligibility and explicit missing/invalid reasons; failed preparation never falls back to the raw key. | An invalid value must not create an accidental identity. |
| **JK-05 · Build** | Exact saved/draft pair deltas, duplicate and collision groups, and original-record membership. | A higher match count can conceal incorrect attachment or multiplication. |
| **JK-06 · Build** | Explicit direction/component bindings and a narrow runtime source-occurrence map. | Two aliases of one source must remain distinguishable during matching and inspection. |
| **JK-07 · Build** | Explicit cardinality changes; preserve the difference between lookup and expansion. | Many-to-many work is legitimate, while an ambiguous lookup must remain unavailable. |
| **JK-08 · Build** | Complete persistence, worker, refresh, selection, and notebook-consumption integration in M1. | A preparation feature is incomplete if a saved project or refreshed source changes its meaning silently. |
| **JK-09 · Build** | Explicit decimal safe-integer identifiers in M2. | Numeric reconciliation is useful, but leading-zero collapse must be deliberate. |
| **JK-10 · Build** | Typed structural composite keys in M3. | Component structure prevents delimiter and cross-type collisions. |
| **JK-11 · Build** | Documentation, runnable examples, and pointer/keyboard acceptance in every feature milestone. | Each release must be understandable and usable end to end. |
| **JK-12 · Build** | Measure integrated preparation, review, and expansion before adding persistent caches or product limits. | The relevant costs are different, especially for large match products. |
| **JK-13 · Explore** | A later exact, typed manual-exception mechanism independent of PR523. | Exceptions are useful, but precedence, scope, and refresh behavior need a separate small design. |
| **JK-14 · Explore** | Full Unicode case folding, locale-specific casing, and compatibility normalization. | Their equivalence rules can erase meaningful distinctions; ASCII lowercase and NFC have a clearer first boundary. |
| **JK-15 · Defer** | Query-output relationship endpoints and general preparation graphs. | They require dependency, grain, and lifecycle semantics beyond this source-key capability. |
| **JK-16 · Avoid** | Fuzzy matching, automatic repairs, implicit coercion, entity merging, and concatenated composite strings. | They undermine explicit match intent or exact original-record inspection. |

## 3. Evidence and choice of data boundary

### 3.1 Confirmed repository facts

The following are **facts from the supplied code**, not predictions about a current checkout beyond the packet.

- `RelationshipDefinition` has a single `sourceId`/`fieldId` endpoint on each side and a declared cardinality. `SourceDefinition` separately owns `entityKey` and raw `fields`. `AnalysisScalar` is string, number, boolean, null, or undefined. [R-types]
- `lookupFrame` and `expandedFrame` index the target’s supplied raw rows. They exclude null, undefined, and NaN, preserve scalar types through `Map`, and currently allow empty strings and infinities. Numeric `-0` and `+0` compare equally. [R-evaluate] (`lookupFrame`, `expandedFrame`)
- A lookup always retains its input row. Exactly one target supplies projected fields. Multiple targets leave those fields unavailable, add all candidates to `contributors`, and add no chosen target to `sourceRows`. Expansion emits each matched target, or a single unmatched parent when `keepUnmatched` is set. [R-evaluate]
- `relationshipSide` recognizes source-field origin or a source-qualified field ID. `calculateFrame` runs against the current input row and gives its output a step origin. A calculated “canonical” column is therefore not automatically a usable relationship endpoint; it also does not prepare the raw target table. The calculation registry and `Calculator` do not solve this ownership problem. [R-evaluate]; [R-calculations]
- `relationshipEditing.countMatches` is independent of the evaluator and skips only nullish keys; unlike evaluation, it can count NaN matches. `queryEditing.relationshipDirection` implements another endpoint resolver. `QueryStageRows.relatedRecords` performs additional raw-field matching through `matchingSourceRows`. The feature must integrate all these paths, not only the two evaluator operators. [R-relationship]; [R-query]; [R-rows]
- `projectFile.ts` has separate validation/provenance logic in `fieldsAt`; text export/compile and folder/notebook workflows are additional persistence seams. Source-owned definitions fit these formats, but no route currently understands them. [R-json]; [R-dsl]; [R-folder]; [R-notebook]
- Project edits are controlled through `ExplorEdaProject.onProjectChange({project, view})`; undo/history and durable storage belong to the host. The library does not own every saved view simply because `views` is supplied for Schema information. [R-component]

**Inference:** a query-calculation recipe is insufficient for this mission. The correct bounded change is a new source-key definition and shared matching boundary, with enough occurrence information to inspect the actual records.

### 3.2 Current primary-source comparison

Current official documentation was retrieved on 25 October 2026. These are documented capabilities, not claims that the products were installed or tested during this mission.

| Tool | Documented approach | Design implication for explorEDA |
| --- | --- | --- |
| **Tableau Prep** | Join profiles expose included/excluded populations and let analysts isolate records. Cleaning operations can occur before or after a join, with phase depending on the operation and its inputs. [S1]; [S2] | Adopt bilateral review and record drilldown. Give source keys one explicit pre-match phase rather than hiding placement in editing context. |
| **Power Query** | Merges select one or multiple column pairs; component order matters and compatible data types are important. `Table.AddColumn` derives values from each input row; nested joins can subsequently expand related rows. [S3]; [S4]; [S5] | Derive a reusable key without overwriting the original. Make component order and expansion visible. Do not import a broad query language merely to prepare keys. |
| **OpenRefine** | A derived column can preserve the original. Expressions have previews and explicit error choices, but transformations are one-time operations rather than live cell formulas. Clustering requires selection/approval. [S6]; [S7]; [S8] | Keep raw/prepared values together and require explicit application. Persist a definition that recomputes on refresh; do not silently retain a raw value after preparation fails. Fuzzy clustering stays out of scope. |
| **Polars** | Join APIs separate null matching, cardinality validation, and output ordering. Multiple key expressions are supported; many-to-many validation is explicitly different from uniqueness checks. [S9]; [S10] | Treat eligibility, multiplicity, and row order as separate contracts. Preserve every pair, and let authors choose many-to-many. |
| **DuckDB** | Explicit casts and `TRY_CAST` support authored conversions, but comparison operators also use combination casting across types. [S11]; [S12] | Upstream SQL is a useful alternative, but a generic SQL equality or cast is not an independent oracle for explorEDA’s strict typed identifiers. |

The recommendation is a design synthesis. None of these sources establishes that explorEDA should copy every feature or default of those products.

### 3.3 Alternatives considered

| Boundary | Advantages | Decision and cost |
| --- | --- | --- |
| **Source-owned derived key projections** | Reusable across relationships; raw target rows can be prepared; reverse traversal is symmetric; definitions survive source refresh. | **Choose.** Keep keys in their own namespace, visible in Schema and inspectors. They are not ordinary writable source columns or entity IDs. |
| **Relationship-local preparation** | Quick to author for a single link; few initially visible objects. | Reject as the owner. Editing a relationship may create/select source-owned keys in one transaction, but duplicating hidden recipes per relationship makes reuse and cross-relationship impact harder to explain. |
| **Query-output endpoints** | Can use arbitrary calculations, filters, aggregation, and reshaping. | Defer. They introduce relation dependencies, cycles, output grain, query parameters, and retention questions. This is a larger feature, not a small endpoint extension. |
| **Upstream preparation** | SQL/Polars/Power Query can supply a fully prepared table; useful for complex or expensive work. | Keep supported as an escape path. It does not satisfy the requested interactive feature, and explorEDA can inspect only the rows actually supplied—not unprovided upstream records. |

The old preparation summary is historical evidence. Its conservative “test existing workflow” recommendation and R041’s earlier possibility of a recipe do not override the explicit new-feature mission or `DIRECTION.md`. [R-direction]; [R-history]

## 4. Smallest coherent model and execution design

### 4.1 Persisted public types

This is a proposed type sketch, not an application patch. The operation list is intentionally small. M1 accepts exactly one component and its three text operations; M2 enables `decimal-integer`; M3 enables multiple components.

```ts
export type JoinKeyTransform =
  | "trim"
  | "nfc"
  | "ascii-lower"
  | "decimal-integer";

export type JoinKeyComponent = {
  fieldId: string; // Raw source field, never another prepared key.
  transforms: JoinKeyTransform[];
};

export type JoinKeyDefinition = {
  id: string;     // Stable within its source; rename does not change it.
  name: string;
  components: JoinKeyComponent[];
};

export type RelationshipEndpoint =
  | { sourceId: string; fieldId: string; keyId?: never }
  | { sourceId: string; keyId: string; fieldId?: never };

export type RelationshipInputBinding = {
  side: "from" | "to";
  fieldIds: string[]; // Current-frame fields, in endpoint component order.
};

// Add to SourceDefinition:
// joinKeys?: JoinKeyDefinition[];
// Replace RelationshipDefinition.from/to with RelationshipEndpoint.
// Add to LookupStep and ExpandStep:
// inputBinding?: RelationshipInputBinding;
```

Rules:

- A raw endpoint keeps its current meaning. Its effective key has one component.
- A prepared endpoint references a key owned by the same source. Its components reference existing raw fields only.
- Key IDs and field IDs have separate namespaces. `entityKey` must still reference a raw field. A prepared key cannot be selected as the source entity key or a parameter’s entity identity.
- If either endpoint is prepared, the query step stores `inputBinding`. It selects the direction and actual input occurrence. `inputBinding` and legacy `inputFieldId` are mutually exclusive.
- Existing raw/raw steps keep their stored form and resolution behavior. No bulk migration of strict files is required.
- Names are labels; IDs are references. An edit preserves IDs. “Duplicate key” creates a new ID so one relationship can diverge without changing other consumers.
- Definitions do not reference views, bindings, remote services, other keys, arbitrary expressions, or query output. This avoids cycles and keeps preparation deterministic over one supplied row.

### 4.2 Runtime provenance needed for exact inspection

Direction plus field IDs is sufficient for computing a tuple, but not for identifying original records after the same source has appeared twice. Add two small runtime extensions:

```ts
// Source-field branch of AnalysisField.origin:
// { sourceId: string; fieldId: string; occurrenceId?: string }

// Additional property on AnalysisResultRow:
// sourceOccurrences?: Record<string, AnalysisSourceReference[]>;
```

`occurrenceId` is the introducing source, lookup, or expansion step ID. It is not an alias parsed from a display string. Every component in one binding must have the correct raw-field origin and the same occurrence ID. Filters/calculations retain source origins; a calculation-origin field is still not a source-key component.

The occurrence map holds **selected original records**:

- Source step: its own reference.
- Unique lookup: exactly its selected target.
- Ambiguous/missing lookup: an empty target occurrence; candidates remain separate in `contributors`/match review.
- Expansion: the selected target for that output pair; unmatched retention has an empty target occurrence.
- Filter/calculation: preserve the map.
- Aggregate: union and deduplicate references within each occurrence for inspection.

Do not flatten an aggregate’s occurrence members back into multiple join inputs. A grouped frame can follow a prepared key only when all of that key’s raw components survive as grouped source-origin fields. Prepare the grouped row once. Otherwise that relationship is unavailable at this stage, with the missing components named.

The optional markers preserve additive public typing, not an optional evaluator obligation: every fresh source/lookup/expansion path, including legacy raw paths and unavailable-target field projections, supplies occurrence origins and selected/empty occurrence entries. If an externally supplied result lacks that evidence, recompute from the known snapshot or mark inspection unavailable; never choose the first reference with the same source ID. A missing or ambiguous prior lookup still exposes its declared component columns with undefined values, so a following key is unavailable rather than structurally missing.

These additions are serializable through a worker message but are not saved in project definitions or source files. The existing flat `sourceRows`, `contributors`, and result row-key formats remain available. This is bounded evidence for source occurrences, not a general lineage platform. Fixture F4 demonstrates why the extra information is necessary.

### 4.3 One shared path for both endpoints

Use small functions/modules, not a pluggable execution framework:

1. **Resolve an endpoint** to raw field components and authored transforms. For raw fields, retain the legacy eligibility policy.
2. **Resolve a query binding** against current fields and occurrence origins. Static validation and the builder use the same resolver.
3. **Prepare ordered scalar values** through shared identifier helpers. Target values come from the raw source table; input values come from the explicitly bound current-frame fields.
4. **Build target buckets** containing original row positions and references. Never use row-object identity as the membership key: repeated positions must remain distinct even if a host reused the same object instance.
5. **Match each input occurrence** against the bucket. Produce counts, candidate references, and either the existing lookup or expansion result behavior.
6. **Inspect** using the same prepared keys and immutable source snapshot. Original references/positions identify records; displayed canonical strings do not.

Return a discriminated internal key result: an eligible typed tuple, or unavailable component issues carrying the component index and a reason such as missing, empty, nonfinite, unsupported type, invalid integer syntax, or unsafe integer. Retain raw values through source/frame references. Add focused `AnalysisDiagnostic` codes for invalid prepared keys and relationship-cardinality conflicts, with optional relationship/key/component identifiers; keep detailed row membership in review evidence rather than duplicating a large pair set into diagnostics.

Proposed focused modules are `lib/analysis/joinKeys.ts`, `relationshipMatching.ts`, and `relationshipBindings.ts`. Put raw-value parsing operations in `lib/valueParsing.ts` as identifier-specific helpers, consistent with repository rules. Extract a shared source-reference helper if needed to keep evaluation and inspection’s original-record identities aligned; preserve the existing identity contract. [R-standards]; [R-parsing]; [R-identity]

This is a single semantic pipeline even though a pure preparation function may be called for both a query row and a target source row. It is not a separately executed source transformation query. Per-evaluation indexes are ordinary algorithmic working state; a persistent cache across evaluations is not part of M1.

### 4.4 Schema and reusable keys

Show a **Join keys** section inside each source in Schema, below raw fields and separate from the entity-key marker. Each item shows the name, original field names, component types, and selected operations. Relationship endpoints label the named key and can reveal its raw components. In the diagram, the edge terminates at the key item rather than pretending the prepared value is a physical source column.

A key edit lists all relationships and queries that consume it, plus known views. If `views` is absent, say the current view is the known view and that other host views may also use the project. Do not claim a complete view inventory. Avoid a general usage database: source→key→relationship→query references are already small project metadata.

`lib/schema/schemaGraph.ts` and the worker protocol implementation are imported by supplied code but their complete files are not in the packet. Their precise integration edits must be inspected in Codex’s checkout; the source-owned boundary does not depend on an unseen API being present.

## 5. Matching semantics authors can understand

### 5.1 Raw strict compatibility versus prepared eligibility

An unprepared relationship retains its current memberships. Adding the feature alone must not change them.

| Input value | Existing raw endpoint | Proposed prepared endpoint |
| --- | --- | --- |
| Finite number, including a fraction | Typed numeric equality. | Same value/type unless integer conversion is explicitly selected. |
| Text `"7"` and `"007"` | Different text values; neither equals number `7`. | Remain distinct under text operations; can merge only under explicit integer conversion. |
| Boolean | Matches the same boolean only. | Preserved by text operations; rejected by integer conversion. |
| `null`, `undefined`, `NaN` | No match. | No match; retain separate missing/nonfinite reason in evidence. |
| `Infinity`, `-Infinity` | Can match the same numeric infinity today. | Invalid nonfinite identifier; no match. Raw relationships are unchanged. |
| Empty string `""` | Matches another empty string today. | Unavailable empty identifier, even with no transforms. |
| Whitespace-only text | Matches the exact same text. | Remains literal text without trim; authored trim can produce an empty unavailable key. |
| Numeric `-0`, `+0` | Equal. | Equal; the canonical numeric component is zero. |
| Text `"-0"`, `"0"` | Different. | Different until integer conversion is selected. |
| Date-looking string | Exact text, regardless of field metadata. | Exact text subject only to selected text operations; no date parsing. |
| Native `Date`, object, array, bigint, symbol | Outside the supported scalar source-file contract. | Reject as unsupported; do not invent object or timestamp equality. |

The prepared-key eligibility policy is explicit in the editor and preview: **Empty or nonfinite prepared keys do not match.** It is not an invisible “trim everything” policy. There is no shared missing-value token: two unavailable values never match.

A zero-candidate row is unmatched, but review must distinguish why: missing/empty input, invalid conversion, eligible input without a target, or an unavailable source. An unavailable source does not establish zero candidates.

### 5.2 Fixed operation order

Enabled operations execute as this subsequence:

**Trim text → Unicode NFC → Lowercase A–Z → Decimal integer ID**

Store the selected operations in that order. Reject duplicates, unknown operations, and out-of-order declarations. The UI offers compact toggles/options, not arbitrary code or an operation-reordering tool. Identity keys with an empty operation list are allowed and still use prepared eligibility.

- **Trim text:** apply JavaScript’s standard boundary-whitespace trim only to strings. It includes standard whitespace/line terminators, including a boundary nonbreaking space; it does not remove internal whitespace or a zero-width space. The implementation must guard the string type before calling it so the generic standard function cannot stringify a number. [S14]
- **Unicode NFC:** apply canonical normalization to strings only. It can equate composed and decomposed representations such as `é` and `e` plus a combining acute accent. It does not provide compatibility folding; fullwidth `Ａ` remains distinct from ASCII `A`. Unicode explicitly distinguishes canonical from compatibility equivalence. [S13]
- **Lowercase A–Z:** replace only ASCII uppercase letters with their lowercase forms. It is not `toLocaleLowerCase`, not full Unicode lowercase, and not case folding. The label must say A–Z rather than promising general case-insensitive matching. Numbers and booleans pass through with their original types.
- **Decimal integer ID, M2:** an explicit type-changing operation described below; it is terminal.

Order matters. NFC before ASCII lowercase makes precomposed `É` and `E\u0301` behave alike; both become `É`, and neither is equated with `é` by ASCII lowercase. Allowing arbitrary ordering would make canonically equivalent strings behave differently under that restricted case rule. F2 pins this behavior.

The default new key has no transformations until the author selects them. Choosing “Prepare…” may prefill the source field and name, but must not automatically enable case or numeric conversion.

### 5.3 Identifiers are not measurements

Do not call `parseNumber`, `finiteNumber`, or `isExactNumberText` to decide integer identifier identity. Those helpers serve different contracts. The supplied `parseNumber` accepts measurement-style decimal/exponent text and leading zeros; the source’s existing parsing helper also has its own inference rules. [R-parsing]

**Proposed M2 contract:**

- Accept a numeric value only when `Number.isSafeInteger(value)` is true.
- Accept text only when the entire string matches `[+-]?[0-9]+`, then its integer magnitude is at most `9007199254740991`.
- Trimming occurs only if selected earlier. `" 7 "` without trim is invalid.
- A deliberate conversion maps `"007"`, `"+007"`, and numeric `7` to numeric `7`; it maps `"-000"` and numeric `-0` to numeric zero.
- Reject `"7.0"`, `"7e0"`, `"0x7"`, units, commas, Unicode digit substitutions, booleans, fractional numbers, and unsafe integers. Never round or truncate.
- Preserve the raw value and an invalid reason. Do not replace the source value with null or a sentinel, and do not fall back to exact raw matching after a failed conversion.

For arbitrary-length IDs, keep text. This release does not introduce bigint source cells, decimal arithmetic, date canonicalization, or automatic reconstruction of lexical data already lost by an importer.

### 5.4 Composite keys

M3 makes a key an ordered nonempty tuple. Both endpoints must have the same arity. Each component keeps its prepared scalar type, with the same signed-zero behavior as scalar keys. A missing, invalid, empty, or unavailable component makes the whole tuple unavailable. There is no partial match and no missing-equals-missing rule.

Use structural typed components, for example:

```text
[["string", "US"], ["number", 7]]
[["string", "US"], ["string", "7"]]
```

Those are distinct tuples. `["a|b", "c"]` and `["a", "b|c"]` must also remain distinct. An internal JSON array of typed component tokens or a nested map is acceptable; joining printed components with a separator is not. `categoryKey` can encode eligible scalar components, but `categoryEqual` must not become the join comparator because it treats missing values and NaN as equal. [R-categories]

One raw scalar endpoint can be paired with a one-component prepared endpoint. A raw scalar endpoint cannot be paired with a two-component key. Authors may use an untransformed component next to a normalized component; they do not need to convert all components to one type.

### 5.5 Manual exceptions and operations not selected

A later exact exception table could map a typed raw value/tuple to an authored typed canonical value, scoped to a source key. This is useful for `"UK" → "GB"` or a known legacy code. It is **Explore**, not a hidden dependency of M1–M3. Before implementation, decide whether exceptions run before or after regular preparation, whether they apply by raw value or stable record identity, and how overlapping exceptions are rejected. Mapping by row position is unsuitable for reusable exceptions.

Do not adopt PR523’s proposed category-mapping API as if it exists. Do not use fuzzy candidates, similarity thresholds, accent removal, punctuation deletion, transliteration, NFKC, or locale-specific case conversion in the first three milestones. Upstream preparation remains available when those transformations are appropriate and explicitly owned elsewhere.

## 6. Analyst workflow, counts, and application rules

### 6.1 Author, review, apply, and undo

An unused source key can be authored and saved without inventing a relationship. Its preview contains source values, eligibility, and collisions only. Pair deltas and cardinality appear when a relationship or explicit opposite endpoint is selected.

1. **Start in Schema.** Choose a relationship endpoint or a source’s Join keys section. Select an existing named key, or create one from a visible raw field. Both endpoint names remain visible while editing.
2. **Edit a local draft.** Select operations in the fixed order. Show the prepared eligibility policy. A reused key lists affected relationships/queries and known views; “Duplicate key” offers an isolated alternative.
3. **Review Saved and Draft against the same source snapshot.** Default to complete supplied sources. Show input/target row counts, eligible/missing/invalid rows, matching pairs, unique versus multiple candidates, and exact added/removed pairs. A new key compares with strict matching on the same raw components; an existing key compares with its saved definition. For composites, label the no-transform structural comparison as a proposed baseline, not an existing shipped raw composite relationship.
4. **Open a changed bucket or pair.** Show raw typed components and prepared components on both sides. Expose exact original IDs and complete membership through paging/search. A bounded first page is labeled; it is not the population used for counts. A prepared display value is never the record ID.
5. **Review relationship and query effects.** A source-scope comparison describes every supplied row once. A selected query-stage comparison describes the input occurrences reaching that step and its full raw target source. Do not mix these scopes in one count. Existing lookup operations remain lookup.
6. **Apply one immutable project change.** Commit key definitions, endpoint changes, prepared input bindings for affected steps, and explicitly selected cardinality changes together. If required bindings are ambiguous, show the affected steps for selection before Apply. Never silently guess one alias.
7. **Edit or undo.** Reopening the key starts a new draft from the saved definition. Cancel/Escape discards draft changes. One successful Apply produces one `onProjectChange`; the host records one undo step. Undo restores definitions and relationships, then reevaluates. No internal history service is added.
8. **Save and reopen.** Persist definitions and references; recompute prepared values from current source rows. The demo must demonstrate host undo/redo and a save/reopen route; library hosts retain ownership of storage and history.

When migrating an existing consumer, first resolve its direction and source occurrence under the old project, including its stored `inputFieldId` and legacy resolution preference. Map the proposed components onto that same occurrence in the new upstream frame, then write `inputBinding` and remove `inputFieldId` in the transaction. A missing or nonunique mapping needs explicit repair before Apply. Key component reorder/addition uses the same captured occurrence; never select the first eligible alias under the new definition.

Draft review must not create charts, move the saved layout, filter other views, or emit host state changes. The wide review panel can show Saved/Draft side by side; narrow layouts can use short tabs while preserving endpoint names and counts. The UI remains compact and defaults to the host’s theme. [R-ui]; [R-component]

### 6.2 Count vocabulary

For a selected traversal, let `N` be current input row occurrences, `T` all supplied target rows, and `d(i)` the number of candidates for input occurrence `i`.

| Label | Exact definition |
| --- | --- |
| Input rows | `N`, after any preceding query steps in stage scope; every source row once in Schema scope. |
| Target rows | `T`, the complete supplied target table, not the number matched or visible. |
| Eligible input/target rows | Rows with a usable key under their endpoint’s policy. |
| Distinct eligible keys | Per-side distinct typed scalar/tuple values; not a record count. |
| Matched input rows | `M = count(d(i) > 0)`. |
| Unmatched input rows | `U = N - M`, with reasons separated. An unavailable source is not counted as a completed no-match result. |
| Inputs with multiple matches | `A = count(d(i) > 1)`, not “ambiguous keys.” |
| Matched target records | Unique original target row positions/references participating in at least one pair. |
| Matching pairs | `P = sum(d(i))`. Repeated input occurrences each contribute their pairs. |
| Extra rows from expansion | `P - M`. |
| Lookup output | `N`; target fields are available only for `d(i) = 1`. |
| Expansion output | `P`; with `keepUnmatched`, `P + U`. |

Counts use complete supplied populations, while rendered tables may show the first 25 rows initially and provide paging/search. “First 25 of 2,438” describes display. It is not a processing limit or an estimate. If a count has not finished, label it pending; do not substitute a sample count.

### 6.3 Distinct conditions, not one “duplicate” warning

- **Pre-existing duplicate key:** several original rows on the same side share one raw typed scalar/tuple. Right rows R4 and R5 in F1 are an example. They remain two records.
- **Normalization collision:** distinct raw typed values/tuples on the same side become the same eligible prepared key. R4/R5/R6 under lowercase contain two raw values and three records. A bucket can contain both a collision and a pre-existing duplicate subgroup.
- **Unmatched key:** an eligible key has no candidate on the opposite side. Missing and invalid values are separately explained.
- **One-to-many expansion:** the query intentionally emits every pair. Repetition is expected; the consequence for sums must be visible.
- **Reconciled encoding:** one raw value on each side becomes equal after preparation. This is not a same-side collision merely because the raw spellings differed.

Keep **selected source records**, **ambiguous matching candidates**, and **other related records** visibly separate. The existing two-level child traversal in `relatedRecords` can show extra records that did not contribute to the selected result. It must use the shared matching contract, but its extra rows must not enter contributor counts or be presented as evidence of that result.

Show, for each collision bucket: prepared key; number of records per side; number of distinct raw typed values per side; pre-existing duplicate subgroups; exact record IDs; and pair/output consequences. Missing/invalid values never join a collision bucket through a shared sentinel.

### 6.4 When Apply is blocked or allowed

**Block structural defects:** unknown source/key/component, invalid transform order, duplicate definition ID, wrong tuple arity, missing binding, mixed source occurrences, calculated-origin component, unsupported operation, or an unresolved semantic edit caused by a concurrent project change. A key cannot reference another key, and an entity key cannot reference a prepared key.

**Require explicit cardinality change when the proposed full-source matched relation violates the declaration:**

- Many-to-one: each FROM record has at most one TO candidate.
- One-to-many: each TO record has at most one FROM candidate.
- One-to-one: both conditions.
- Many-to-many: neither side is required to be unique.

These are **matched-row multiplicity** rules, evaluated on complete supplied source populations. They are not global uniqueness constraints on all raw keys. Duplicate buckets with no opposite-side match are warnings; they do not yet violate the matched relation. This deliberately differs from a system such as Polars that offers full-column uniqueness validation. [S9]

An existing repeated target with one matching source row is enough to violate many-to-one, even if no normalization collision was introduced. Conversely, many left raw values may normalize to one key and still satisfy many-to-one when the target has one record. F3 pins that case. Do not force many-to-many solely because there is a source-side collision.

A reused key edit validates every affected relationship. Apply is one transaction containing every required, explicitly chosen declaration change. The panel may offer suggested valid cardinalities, but selection remains explicit.

**Allow** missing/invalid conversion rows and intentional collisions when the authored relation is structurally valid and cardinality is compatible. Show their exact effects. Requiring all rows to match would make ordinary left joins impossible.

**Keep lookup semantics:** even after a relationship becomes many-to-many, an existing lookup remains a lookup and gives unavailable target fields for multiple candidates. The author separately chooses an expansion, using the existing explicit query workflow. No first-match selection, deduplication, or automatic operation conversion.

**Unavailable evidence:** if an affected source is unavailable, interactive Apply of a semantic key/relationship change waits for a complete preview. Preserve the draft. Existing saved definitions may load with unavailable sources and remain saveable; a storage roundtrip must not depend on all files currently being reachable. Nonsemantic renaming does not need a match proof.

**Refresh is different from authoring:** if fresh source rows violate a saved cardinality, retain the saved definition, report the violation, and retain existing lookup ambiguity/expansion behavior. Do not discard records, rewrite the declaration, or prevent the source from refreshing. This is a diagnostic about the current relation, not a silent repair.

### 6.5 Exact deltas without allocating every pair

For the same input and target populations, compute old and new keys per original row. Old/new pair totals are sums of bucket-size products. To count unchanged pairs, group both sides by the structural pair `(oldKey, newKey)`; a row is eligible for this joint group only when both keys are usable.

```text
commonPairs = sum(leftCount[oldKey,newKey] * rightCount[oldKey,newKey])
addedPairs  = newPairs - commonPairs
removedPairs = oldPairs - commonPairs
```

This yields exact counts without materializing a Cartesian product. Enumerate a bounded visible page of changed pairs lazily from the relevant groups. Index members remain complete and inspectable.

The shortcut is not sufficient if editing a reused key changes earlier query stages and therefore the current stage’s input membership. For stage-level comparison, reevaluate saved and draft query prefixes on the same source snapshot, align input occurrence identities, and then compare their relations. Do not report Schema-scope deltas as if they proved a downstream query’s delta. Final query output remains the ordinary evaluator’s responsibility.

## 7. Complete analysis lifecycle

### 7.1 Query steps, filters, and multiple views

- **Source:** source keys reference supplied raw fields. No original row is mutated or discarded.
- **Calculate:** calculations still consume the current frame. They neither redefine source-owned keys nor become eligible components by adopting a similar label.
- **Filter before matching:** limits input occurrences. It does not filter the raw target table or change the source-key definition.
- **Filter after matching:** limits emitted lookup/expansion rows. It does not retroactively narrow the relationship’s complete-source collision review.
- **Aggregate:** matching after grouping is allowed only when every component survives as a grouped source-origin field. One group remains one match input, even if its occurrence map contains many originals.
- **Views:** views with different bindings or filters share the key definition but may have different input-stage memberships. Changing a key reevaluates every consuming query when its view is used. The project callback does not claim to have rewritten all host-owned saved view states.
- **Lookup/expansion reuse:** keys are computed from either raw targets or bound input fields with the same resolver. A successful prior projection can supply another relationship, including reverse traversal. The occurrence binding prevents accidental selection of a different alias of the same source.

The data boundary remains complete **supplied** rows. It cannot make claims about remote database rows that were never delivered or reconstruct upstream transformations not included in the project. [R-evaluate]; [R-step]; [R-analysis-text]

### 7.2 Draft versus applied evaluation

A draft has a concrete base project and table snapshot. Saved and draft results must use those same arrays. A semantic source refresh or external key-definition edit makes the old preview stale: retain the form, clear its application eligibility, and recompute. Do not silently rebase and apply a preview the analyst has not reviewed.

For a purely unrelated project edit, the implementation may preserve the draft by copying its key change onto the new project only after confirming all referenced definitions and tables still match the draft base. This is a local dependency check, not a version-coexistence system. A conflicting edit to the same key or relationship requires a visible reload/compare choice.

### 7.3 Worker coherence

`useAnalysisEvaluation` already drops stale request IDs and retains the previous completed evaluation while pending. It sends tables when the outer `tables` object changes. However, the next request ID is assigned in an effect, so immediately after an input change the old finished state can briefly still appear ready. [R-hook] (`useWorkerEvaluation`)

Add an in-memory identity of the requested inputs—project, tables, query ID, bindings—to the completed result. Compare it synchronously during render. A mismatch immediately makes old result-dependent actions unavailable, even before the effect posts a request. This also covers changing key definitions without changing raw tables.

While pending:

- Prior rows may remain visible with an updating label and their completed scope.
- Trace opening, row selection, and original-record resolution must not combine those rows with current project/tables.
- Hide a stale open trace synchronously; the effect can then clear its local state.
- A `readOnly` flag alone is insufficient because read-only mode deliberately permits inspection.
- Apply the guard to chart trace callbacks, Query stage rows, and relationship record drilldowns.

Draft preview uses the same matching code and generation discipline in direct and worker modes. A worker message may request a preview operation, but it must not implement different transforms. Check the actual protocol/worker modules in the integration checkout. No prepared values are transferred as saved source data.

### 7.4 Refresh, reorder, and identity

`evaluateAnalysisQuery` already includes participating source definitions and immutable table-array revisions in its evaluation revision. Source-owned `joinKeys` therefore enter that dependency naturally. The host must replace the changed source array **and the outer tables object**; in-place edits are unsupported. [R-evaluate] (`tableRevision`, `revision`; R-hook)

Keep the current original-row identity rules. A prepared key never becomes `entityKey`, never changes an expansion’s parent/target identity, and never proves uniqueness of an original record.

- With stable unique entity IDs, reorder changes emitted order but preserves pair membership and structural result keys.
- Missing/duplicate original entity IDs use position-based references today. Those references are exact only inside their source snapshot.
- Review buckets should retain source row positions plus references, so every original occurrence is visible even when values or object instances repeat. Resolve them against the captured snapshot, not a fresh array with the same index.
- Nonfinite/otherwise unreliable entity identifiers receive no new refresh-continuity guarantee from this feature. Snapshot membership remains inspectable; do not broaden the mission into entity-key repair.

### 7.5 Selection and trace behavior

A key edit can keep a lookup parent’s result key while changing its target evidence. Therefore a stable result key is not a reason to retain an open trace. Recompute or close traces whenever the evaluation inputs change.

For query views affected by preparation:

- Rebind selections whose result keys remain present and whose original identity references are stable. Removed keys remain visibly unresolved. Existing one-way unresolved sentinels require explicit reselection; do not promise automatic recovery if an ID later reappears.
- Treat a selection depending on position as valid only for the same source arrays in the same mounted view. Do not restore it from a reopened file merely because `source:row:3` still exists.
- Use a per-view, **per-selected-key** in-memory map of the source arrays under which the user selected that key. Only an explicit numeric selection from the current ready evaluation can grant this scope. An echoed saved string, unresolved sentinel, layout edit, or selection of a different row cannot grant it.
- Observe the actual row-filter selection action at the existing internal store/action seam before granting positional scope. A numeric value in `onStateChange` is insufficient proof: a layout callback can re-emit an old numeric ID. If the action provenance is unavailable, fail closed. Persisted raw numeric `__ID` selections also become unresolved on load; a same-snapshot explicit selection can establish scope. Clearing and selecting again handles the current one-way sentinel.
- A narrow optional `eligibleKeys` argument to `decodeAnalysisRowKeys` can enforce this. Apply the same eligibility to `selectedRowKeys` and `inspection.rowKey`.
- Count unresolved selections from decoded settings or a runtime rejection list. The current component counts them from saved settings, which would hide newly rejected entries. [R-rowkeys]; [R-component]

The first implementation may conservatively require scope when any selected `sourceRows` reference is positional/unreliable. This can expire a parent selection after lookup to a positional target even though its parent key is stable. Document that conservative behavior rather than adding a general persisted identity-dependency system. Never classify stability by searching a key string for `:row:`; a real entity ID can contain that text.

### 7.6 Unavailable versus empty sources

A successfully loaded empty array means zero supplied rows. A missing table means unavailable. `folder.ts` currently inserts empty arrays for some unreadable/missing sources while also retaining `missingSources` and `problems`; consumers given only tables lose the distinction. [R-folder] (`readProjectFolder`)

The smallest preferred integration is to omit table entries for missing/unreadable sources and retain the existing diagnostics. Check callers before changing that representation. If a host relies on placeholders, forward its existing availability metadata explicitly instead. Do not infer that an intentionally empty source is unavailable.

Existing raw lookup behavior may keep parents with unavailable projected fields; expansion currently fails for an unavailable target. Preserve those operator outcomes unless a separate change is reviewed. Review must display unavailable evidence, not a confirmed zero-match population.

## 8. Persistence and host ownership

### 8.1 Project JSON

Keep the additive version-1 shape. Existing raw files remain readable with unchanged memberships; new prepared-key files need a reader that supports the added fields. This is not a promise of forward compatibility with an old binary.

Validate:

- Unique key IDs within a source; known transforms in fixed order; nonempty components; raw field references.
- Valid raw/prepared endpoint discriminators; matching tuple arity; known prepared key references.
- `inputBinding` direction, component order/count, raw origins, and one occurrence; no coexistence with legacy `inputFieldId`.
- `entityKey` remains a raw field reference.
- Unsupported operations are errors, not ignored settings.

Update `projectFile.ts`’s `fieldsAt` provenance checks together with the shared binding resolver. Selected-view export already retains both endpoint sources; source ownership carries their definitions with them. Do not serialize target indexes, prepared arrays, review snapshots, or `sourceOccurrences` into project files. [R-json]

A representative proposed definition:

```json
{
  "id": "customer-key",
  "name": "Customer code",
  "components": [
    {"fieldId": "customer_code", "transforms": ["trim", "nfc", "ascii-lower"]}
  ]
}
```

A query’s proposed prepared lookup binding:

```json
{
  "id": "customer",
  "kind": "lookup",
  "inputStepId": "orders",
  "relationshipId": "order-customer",
  "as": "customer",
  "inputBinding": {"side": "from", "fieldIds": ["orders.customer_code"]}
}
```

### 8.2 Project text and folders

Retain existing raw relationship syntax byte-for-byte on unchanged strict fixtures. Introduce explicit source children and prepared endpoint blocks using the existing parser’s declaration structure:

```text
source @orders key=id path=data/orders.json {
  field id string
  field customer_code string
  join-key @customer-key "Customer code" {
    component customer_code trim nfc ascii-lower
  }
}

source @customers key=id path=data/customers.json {
  field id string
  field customer_code string
  join-key @customer-key "Customer code" {
    component customer_code trim nfc ascii-lower
  }
}

relate @order-customer many-to-many {
  from orders key=customer-key
  to customers key=customer-key
}

query @orders-with-customers glyph=◆ {
  source orders
  expand customer via=order-customer input-side=from input-fields=orders.customer_code keep-unmatched
}
```

The relationship’s cardinality in this example is intentionally explicit. A mixed endpoint uses `field=customer_code` on its raw side. A composite binding uses the existing list-token pattern, for example `input-fields=orders.country,orders.customer_code`; individually quote a field ID containing spaces. Reverse traversal uses `input-side=to`. The compiler must preserve component order rather than sorting it.

Required seams: `sourceLines`/`compileSource`, `relationshipLine`/`compileRelationship`, `stepLines`/`compileStep`, and `checkReferences` in `lib/dsl/project.ts`. Do not route identifier literals through the generic `scalar()` parser or ignore unsupported transform words through permissive setting warnings. [R-dsl]

Folder ownership follows source ownership:

- A shared source’s key definition saves in project text.
- A source local to an analysis file keeps its key definition in that file’s source declaration.
- Preserve original source file bytes. `projectFileText`, `analysisFileText`, and `exportSourceText` write definitions, not transformed data.
- An inferred source’s short declaration should retain its short raw metadata when only `joinKeys` changes; otherwise `declaredSource`’s whole-object comparison may unnecessarily expand inferred field metadata. This is a bounded serializer adjustment.
- After inference, validate key component fields against the loaded schema. If inference cannot run because a file is unavailable, report that state rather than claiming the field is absent from a successfully loaded table. [R-folder]; [R-write-folder]

### 8.3 Analyses, notebooks, and parameters

`readAnalysisText` evaluates each view with its bindings. `readNotebookText` currently evaluates the named query with `{}` and has no bindings property on `NotebookContext`. Notebook chart compilation and writeback do not own project relationship definitions. [R-analysis-text]; [R-notebook]; [R-notebook-write]

Therefore:

- Existing parameterized **analysis views** can use prepared relationships now. Parameters filter/query rows; they do not alter source-key conventions.
- Existing **unparameterized notebooks** consume prepared relationships through the same evaluator.
- A notebook key edit belongs in Schema/project state. `writeBackChart` and `writeBackSettings` keep their chart-only responsibility and preserve unrelated prose/comments.
- A frozen notebook chart block preserves the last valid chart declaration, not an old source-data or join snapshot.
- Parameterized local notebooks remain PR524’s separate unbuilt work. When that proposal ships, forwarding bindings into the same evaluator is the compatibility seam. Do not implement it as a dependency here.

### 8.4 Export and callbacks

`onProjectChange` reports the applied project/view transaction once. `onStateChange` still reports chart/filter settings. The host may echo settings; the in-memory selection scope must survive a same-snapshot echo without treating echoed stale keys as newly selected. Read-only views allow valid inspection but never apply key changes.

Project export retains original tables and definitions. A flattened query-result export, when used, represents emitted rows; it is not a replacement for the source project. Do not inject transient prepared tokens into raw CSV/JSON exports or claim upstream lineage in a flattened file. A selected-view project export must retain both relationship sources and their required key definitions.

## 9. Exact fixtures and independently checked expected results

The following tables are normative proposed fixtures. Their pair memberships and totals were checked with an independent scratch oracle; they are not claims that the unbuilt feature passed application tests. Use unique original `id` values as entity keys unless a fixture explicitly tests positional identity. Run lookup and expansion as separate evaluator operations over the same candidate relation. A saved lookup can remain ambiguous even when the relationship permits many-to-many; the builder should offer only operations appropriate to the chosen direction.

### F1 — Typed identifiers, collisions, and multiplication

Each source has a separate unique `id` field used as its entity key. The join field is `code`; the left `amount` is a measurement and is not prepared. `∅` below means unavailable, not a key that can match another `∅`. Type labels in the raw column are normative.

#### Left table

| Row ID | Raw code | Amount | Trim | Trim + ASCII lowercase | Trim + integer |
| --- | --- | ---: | --- | --- | --- |
| L1 | number `7` | 10 | number `7` | number `7` | number `7` |
| L2 | text `"7"` | 20 | text `"7"` | text `"7"` | number `7` |
| L3 | text `"007"` | 30 | text `"007"` | text `"007"` | number `7` |
| L4 | text `" A "` | 40 | text `"A"` | text `"a"` | ∅ invalid integer |
| L5 | text `"a"` | 50 | text `"a"` | text `"a"` | ∅ invalid integer |
| L6 | null | 60 | ∅ missing | ∅ missing | ∅ missing |
| L7 | text `"   "` | 70 | ∅ empty | ∅ empty | ∅ empty |
| L8 | text `"bad"` | 80 | text `"bad"` | text `"bad"` | ∅ invalid integer |
| L9 | text `"A"` | 90 | text `"A"` | text `"a"` | ∅ invalid integer |
| L10 | text `""` | 100 | ∅ empty | ∅ empty | ∅ empty |

Original amount sum = **550**. The source rows never change.

#### Right table

| Row ID | Raw code | Trim | Trim + ASCII lowercase | Trim + integer |
| --- | --- | --- | --- | --- |
| R1 | number `7` | number `7` | number `7` | number `7` |
| R2 | text `"7"` | text `"7"` | text `"7"` | number `7` |
| R3 | text `"007"` | text `"007"` | text `"007"` | number `7` |
| R4 | text `"A"` | text `"A"` | text `"a"` | ∅ invalid integer |
| R5 | text `"A"` | text `"A"` | text `"a"` | ∅ invalid integer |
| R6 | text `"a"` | text `"a"` | text `"a"` | ∅ invalid integer |
| R7 | null | ∅ missing | ∅ missing | ∅ missing |
| R8 | text `""` | ∅ empty | ∅ empty | ∅ empty |
| R9 | text `"bad"` | text `"bad"` | text `"bad"` | ∅ invalid integer |
| R10 | text `"   "` | ∅ empty | ∅ empty | ∅ empty |

#### Exact pair lists, in emitted order

The pair record `(Lx,Ry,amount)` means the complete original Lx row, the complete original Ry row under the chosen alias, and unchanged left amount. This is sufficient to reconstruct every projected field without inventing records.

```text
Strict:
(L1,R1,10), (L2,R2,20), (L3,R3,30), (L5,R6,50),
(L7,R10,70), (L8,R9,80), (L9,R4,90), (L9,R5,90), (L10,R8,100)

Trim:
(L1,R1,10), (L2,R2,20), (L3,R3,30), (L4,R4,40), (L4,R5,40),
(L5,R6,50), (L8,R9,80), (L9,R4,90), (L9,R5,90)

Trim + ASCII lowercase:
(L1,R1,10), (L2,R2,20), (L3,R3,30),
(L4,R4,40), (L4,R5,40), (L4,R6,40),
(L5,R4,50), (L5,R5,50), (L5,R6,50),
(L8,R9,80), (L9,R4,90), (L9,R5,90), (L9,R6,90)

Trim + integer:
(L1,R1,10), (L1,R2,10), (L1,R3,10),
(L2,R1,20), (L2,R2,20), (L2,R3,20),
(L3,R1,30), (L3,R2,30), (L3,R3,30)
```

`keepUnmatched` inserts one `(Lx,undefined,amount)` in left input order for each row with zero candidates. The exact unmatched sets are strict `{L4,L6}`, trim and lowercase `{L6,L7,L10}`, integer `{L4,L5,L6,L7,L8,L9,L10}`. Their amounts are in the left table; no ambiguous parent is treated as unmatched.

#### Exact lookup outputs

All ten lookup rows keep IDs L1…L10 and amounts 10…100. The target assignment vectors in that order are:

```text
Strict:  [R1,R2,R3,undefined,R6,undefined,R10,R9,undefined,R8]
Trim:    [R1,R2,R3,undefined,R6,undefined,undefined,R9,undefined,undefined]
Lower:   [R1,R2,R3,undefined,undefined,undefined,undefined,R9,undefined,undefined]
Integer: [undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined]
```

For strict L9, contributors include R4 and R5, but sourceRows includes neither target. For lowercase L4/L5/L9, contributors include R4/R5/R6, but no target is selected. In the occurrence sidecar the lookup target occurrence is empty for these ambiguous rows. Unmatched L6 has no target candidates at all.

#### Counts and totals

| Measure | Strict | Trim | Trim + ASCII lowercase | Trim + integer |
| --- | ---: | ---: | ---: | ---: |
| Input rows / target rows | 10 / 10 | 10 / 10 | 10 / 10 | 10 / 10 |
| Eligible input rows | 9 | 7 | 7 | 3 |
| Eligible target rows | 9 | 7 | 7 | 3 |
| Distinct eligible input key values | 9 | 6 | 5 | 1 |
| Distinct eligible target key values | 8 | 6 | 5 | 1 |
| Matched key values | 8 | 6 | 5 | 1 |
| Input rows with ≥1 candidate | 8 | 7 | 7 | 3 |
| Distinct matched target rows | 9 | 7 | 7 | 3 |
| Unique lookup inputs | 7 | 5 | 4 | 0 |
| Ambiguous lookup inputs | 1 | 2 | 3 | 3 |
| Unmatched inputs | 2 | 3 | 3 | 7 |
| Matching pairs / inner output rows | 9 | 9 | 13 | 9 |
| Added pairs relative to strict | 0 | 2 | 6 | 6 |
| Removed pairs relative to strict | 0 | 2 | 2 | 6 |
| Lookup output rows | 10 | 10 | 10 | 10 |
| Lookup amount sum | 550 | 550 | 550 | 550 |
| Inner expansion amount sum | 540 | 450 | 680 | 180 |
| keepUnmatched output rows | 11 | 12 | 16 | 16 |
| keepUnmatched amount sum | 640 | 680 | 910 | 670 |
| Inner sum once per original left entity | 450 | 320 | 320 | 60 |
| keepUnmatched sum once per left entity | 550 | 550 | 550 | 550 |

These totals deliberately differ because an expanded row is a pair, not a distinct parent. No deduplication is silently performed. Existing `AggregateMeasure.entityFieldId` can express a distinct-parent sum; a prepared key is never that entity field.

#### Changed memberships and classifications

- Trim adds L4–R4 and L4–R5; removes L7–R10 and L10–R8 due to the prepared empty policy. Left `{L4,L9}` now has one prepared A key but two raw typed values: a normalization collision. Right `{R4,R5}` was already duplicate A; this is a pre-existing duplicate, not a new normalization collision.
- Lowercase adds L4–R4/R5/R6, L5–R4/R5, L9–R6 relative to strict; removes the same blank pairs. Left `{L4,L5,L9}` collapses three raw values. Right `{R4,R5,R6}` collapses raw values A and a, while retaining the pre-existing A duplicate. Show both facts: two raw values, three records, one pre-existing duplicate subgroup.
- Integer adds the six cross-type/leading-zero combinations among L1…L3 and R1…R3, and removes all six nonnumeric strict pairs. Both sides now have three records, three raw typed values, and one numeric key. This is an authored collision, not an implicit correction.
- Cardinality counts use **row multiplicity**, not the number of raw variants. For these target duplicate groups a forward many-to-one or one-to-one declaration cannot be newly applied unchanged. Strict F1 permits one-to-many (and many-to-many) because its eligible left keys are unique. Trim, lowercase, and integer conventions require many-to-many for the matched buckets that repeat on both sides. The authored lookup still yields unavailable targets for ambiguous rows even after a valid many-to-many declaration. The analyst must explicitly choose expansion for pair output.

#### Reverse traversal

Reverse candidates are exactly the same pair set with endpoints swapped. Reverse emitted order follows right input order and then left target order; the order of the written reversed set is not an output-order guarantee.

| Reverse result | Strict | Trim | Lower | Integer |
| --- | ---: | ---: | ---: | ---: |
| Input rows | 10 | 10 | 10 | 10 |
| Matched input rows | 9 | 7 | 7 | 3 |
| Unique lookup inputs | 9 | 5 | 4 | 0 |
| Ambiguous lookup inputs | 0 | 2 | 3 | 3 |
| Unmatched input rows | 1 | 3 | 3 | 7 |
| Inner rows | 9 | 9 | 13 | 9 |
| keepUnmatched rows | 10 | 12 | 16 | 16 |

Strict reverse R4 and R5 each uniquely select L9; forward L9 is ambiguous. This proves that ambiguity and declared cardinality must be evaluated relative to traversal direction.

#### Reorder, refresh, and filter checks

- Reverse both raw row arrays, preserving the stable IDs: sorted pair memberships, key classifications, counts and totals are unchanged. Emission order follows new input/target order. Pair row keys remain stable because they encode source record identities, not array positions.
- Add target R11 with raw code `" a "` under lowercase convention: exactly three new pairs L4–R11, L5–R11, L9–R11. There are 16 pairs, eight matched targets, seven matched parents, 19 keepUnmatched outputs, inner sum 860, outer sum 1090. Target a bucket has four records, three raw values A/a/padded-a, and the old A duplicate subgroup. A new immutable source array/revision must replace old evidence.
- Filter the left input to `amount >= 50` before lowercase expansion: six inputs, seven matched pairs (L5×R4/R5/R6, L8×R9, L9×R4/R5/R6), three unmatched inputs, ten keepUnmatched outputs, inner amount sum 500, outer sum 730. The raw target table still has ten rows. Applying the same amount filter after matching gives the same pair set but different stage input/output counts.
- Filter after lowercase expansion to `right.id == "R4"`: exactly `(L4,R4,40),(L5,R4,50),(L9,R4,90)`, amount sum180. Schema complete-source collision counts remain source counts and do not claim to describe this filtered output.

### F2 — Unicode and edge scalars

Each row below is an isolated pair of one-record sources. Do not combine these rows into one join fixture, because repeated right literals would introduce additional candidates.

| Left versus right | Raw strict match | Trim → NFC → ASCII-lower match |
| --- | --- | --- |
| `"e\u0301"` versus `"é"` | No | Yes; both `"é"` |
| `"É"` versus `"E\u0301"` | No | Yes; both `"É"` |
| `"Ａ"` versus `"A"` | No | No; fullwidth A is not NFKC-folded |
| `"I"` versus `"i"` | No | Yes |
| `"İ"` versus `"i"` | No | No; no Turkish locale casing |
| `"ß"` versus `"ss"` | No | No; no Unicode casefold |
| `"\u00a0A\u00a0"` versus `"a"` | No | Yes; boundary NBSP trimmed |
| `"\u200bA\u200b"` versus `"a"` | No | No; zero-width space remains |
| `"A\u00a0B"` versus `"a b"` | No | No; internal whitespace remains |
| boolean true versus text `"true"` | No | No; type retained |
| boolean false versus boolean false | Yes | Yes |
| number -0 versus number +0 | Yes | Yes |
| Infinity versus Infinity | Yes | No; prepared nonfinite unavailable |
| -Infinity versus -Infinity | Yes | No |
| NaN versus NaN | No | No |
| null versus null | No | No |
| undefined versus undefined | No | No |
| `""` versus `""` | Yes | No; prepared empty unavailable |
| `"   "` versus `"   "` | Yes | No because trim was selected |
| `"2026-01-02"` versus `"2026-01-02T00:00:00Z"` | No | No; no date parsing (text operation also lowers T/Z) |

Additional numeric convention assertions against right numeric7: text `"7"`, `"007"`, `"+007"`, number7 pass; `" 7 "` passes only with trim. `"7.0"`, `"7e0"`, `"0x7"`, `"7kg"`, boolean true, number7.5 all fail. Against right numeric0, `"-000"`, numeric-0, and numeric0 match deliberately. `"9007199254740991"` converts safely; `"9007199254740992"` and numeric9007199254740992 fail. A year-like string `"2026"` converts if integer convention is explicitly chosen; field labels do not infer date intent.

Without trim, a prepared identity/ASCII-only key preserves whitespace-only strings literally. Empty string is still unavailable. A date-looking string remains a string; an actual Date object is unsupported in prepared keys and is not silently converted. Current raw runtime object identity is outside the scalar public contract and should not be elevated into a new date equality promise.

### F3 — structural composites

These are a proposed composite-key fixture; the present baseline cannot author composite relationships. “Exact” means proposed typed structural components with no transforms and the prepared missing/empty gate, not a claim that composite execution shipped.

| Left ID | Component tuple | Amount |
| --- | --- | ---: |
| C1 | `[text "a\|b", text "c"]` | 5 |
| C2 | `[text "a", text "b\|c"]` | 7 |
| C3 | `[number 7, text "x"]` | 11 |
| C4 | `[text "7", text "x"]` | 13 |
| C5 | `[text " A ", text "US"]` | 17 |
| C6 | `[text "a", text "us"]` | 19 |
| C7 | `[text "a", null]` | 23 |
| C8 | `[text "a", text ""]` | 29 |

| Right ID | Component tuple |
| --- | --- |
| D1 | `[text "a\|b", text "c"]` |
| D2 | `[text "a", text "b\|c"]` |
| D3 | `[number 7, text "x"]` |
| D4 | `[text "7", text "x"]` |
| D5 | `[text "a", text "us"]` |
| D6 | `[text "a", null]` |
| D7 | `[text "a", text ""]` |

Exact and trim-only pairs: `(C1,D1,5),(C2,D2,7),(C3,D3,11),(C4,D4,13),(C6,D5,19)`. Five inner outputs sum55; eight outer outputs sum124. Lookup has eight rows, five unique targets, three unmatched, no ambiguity.

Trim + ASCII lowercase pairs add only `(C5,D5,17)`. Six inner outputs sum72; eight outer outputs sum124. C5 and C6 form a source normalization collision; D5 is unique, so many-to-one is valid. Reverse lookup at D5 is ambiguous with candidates C5/C6; reverse expansion has six rows, reverse keepUnmatched eight (D6 and D7 are unmatched).

C1 and C2 would both naïvely concatenate to `"a|b|c"`; their structural pairs must stay distinct. C3 and C4 must stay distinct until integer conversion is deliberately applied to that component on both sides. A single missing, invalid, or empty component makes the entire tuple unavailable; D6 and D7 never match C7/C8. No partial tuple, separator escaping convention, or missing-equals-missing rule.

#### F3 additional integer-component convention

Apply `trim → decimal-integer` to component one only, and leave component two unchanged, on both F3 endpoints. Only C3/C4 and D3/D4 remain eligible; the alphabetic first components fail conversion. Exact pairs are `(C3,D3,11)`, `(C3,D4,11)`, `(C4,D3,13)`, `(C4,D4,13)`.

There are two matched input rows, two matched target records, one matched tuple value, two ambiguous lookup inputs, four inner output rows totaling **48**, and ten `keepUnmatched` rows totaling **148**. Lookup still has eight rows totaling **124**, with every target assignment unavailable. This is a deliberately unsuitable convention for much of the fixture; the preview must expose its exclusions rather than present “numeric conversion succeeded” as a blanket success.


### F4 — occurrence identity and exact inspection

Source `tasks` has one stable row T1 with `primary="a"`, `secondary="a"`, `amount=10`. Source `people` has stable rows P1 `{code:" A ",label:"Ann"}` and P2 `{code:"a",label:"Amy"}`. Both relationships use trim+ASCII lowercase; both query operations explicitly expand and cardinality is many-to-many.

1. `task-source` starts T1.
2. `primary-expand`, alias `primary`, yields `(T1,P1)` and `(T1,P2)`.
3. `secondary-expand`, alias `secondary`, yields exactly `(T1,P1,P1)`, `(T1,P1,P2)`, `(T1,P2,P1)`, `(T1,P2,P2)`. Total amount40; distinct original task amount10.

For row `(T1,P1,P2)`, exact occurrence membership must be:

```ts
sourceOccurrences: {
  "task-source": [{ sourceId: "tasks", rowKey: "tasks:string:T1", entityKey: "T1" }],
  "primary-expand": [{ sourceId: "people", rowKey: "people:string:P1", entityKey: "P1" }],
  "secondary-expand": [{ sourceId: "people", rowKey: "people:string:P2", entityKey: "P2" }],
}
```

`primary.code` origin has occurrenceId `primary-expand`; `secondary.code` uses `secondary-expand`. A key binding to `["primary.code"]` must inspect P1 raw code `" A "`; a binding to `["secondary.code"]` must inspect P2 raw code `"a"`. Both prepare to `"a"`, so neither the sourceId nor prepared-value equality can recover this distinction. An input binding component list mixing two occurrences is invalid, even if its sourceIds and raw fieldIds match.

For a selected lookup the target occurrence contains one ref. For ambiguous/unmatched lookup it is empty; candidates remain separate evidence/contributors. Expansion records its one chosen target. Filtering and calculation preserve maps. Aggregation unions refs **per occurrence** but does not make absent component fields available for future joins. These arrays are runtime evidence, never serialized into project JSON/text/notebook definitions.


### F5 — Snapshot identity when original entity IDs are duplicated

Use a left source whose declared entity key is `id`:

| Snapshot occurrence | Supplied fields | Strict/prepared key |
| --- | --- | --- |
| position 0, label `first` | `id="dup", code="a"` | text `"a"` |
| position 1, label `second` | `id="dup", code="b"` | text `"b"` |

The right source has stable records G1 with `code="a"` and G2 with `code="b"`. Both strict and an identity prepared key produce exactly `(first,G1)` and `(second,G2)`. Review shows both originals, the duplicate-entity-ID issue, and their separate snapshot positions. Preparation must not rewrite `id` to `code` or collapse the two originals.

Reverse the left array in a new immutable snapshot. The content-level pairs remain the same, but old `left:row:0` now points at different contents. A previous positional selection must be unresolved, never silently follow the new occupant. Two repeated positions that reference the same JavaScript object must likewise remain two positions in bucket membership. These are proposed product acceptance cases, not a demand for an identity migration system.

## 10. Oracle, executed checks, and performance evidence

### 10.1 Independent oracle

The executed fixture oracle used manually authored typed prepared columns and literal expected pair lists, with a nested-loop comparison. It did not import explorEDA, the proposed matching index, or a proposed normalizer. This avoids generating expected results from the implementation under test.

A minimal reusable oracle is:

```python
# Each key is a tuple of (type_tag, value) components.
# None means unavailable. Use "number", "string", and "boolean" tags.
# Source values and expected prepared keys are authored independently.
def pair_oracle(left, right):
    result = []
    for l in left:
        for r in right:
            if l["key"] is None or r["key"] is None:
                continue
            if l["key"] == r["key"]:
                result.append((l["id"], r["id"], l["amount"]))
    return result

left = [
    {"id": "L1", "key": (("number", 7),), "amount": 10},
    {"id": "L2", "key": (("string", "7"),), "amount": 20},
    {"id": "L3", "key": (("string", "007"),), "amount": 30},
]
right = [
    {"id": "R1", "key": (("number", 7),)},
    {"id": "R2", "key": (("string", "7"),)},
    {"id": "R3", "key": (("string", "007"),)},
]
expected = [("L1", "R1", 10), ("L2", "R2", 20), ("L3", "R3", 30)]
assert pair_oracle(left, right) == expected
print("Typed baseline fixture passed:", expected)
```

For full F1, use the complete tables and pair lists above. Separately test the product normalizer against the literal prepared-key columns, then test its matcher/evaluator against the literal pair and output lists. Do not build the expectation by calling `categoryKey`, `prepareJoinKey`, or the product resolver.

### 10.2 What was actually checked

**Executed in this research workspace:**

- Complete reading and structural extraction of all 45 supplied file sections at the named baseline.
- Retrieval of the current official sources listed below.
- A standalone nested-loop oracle for F1 exact pairs, lookup assignments, expansion/outer output counts and totals, reverse memberships, reorder invariance, and the R11 refresh addition.
- The proposed F3 exact/trim/lower structural pair lists, the additional integer-component pair/count/total arithmetic, and twenty isolated F2 expected comparisons over manually enumerated outputs.
- Eight JavaScript string-primitive probes covering NFC, ASCII replacement, nonbreaking/zero-width spaces, and the NFC ordering witness.
- A reference-only timing probe described next.

**Not executed:** application tests, product normalizer/evaluator changes, worker tests, JSON/DSL/folder/notebook integration tests, browser authoring/keyboard acceptance, full expansion stress tests, or a production performance benchmark. F4/F5 and the additional F3 integer-component case are independently enumerated acceptance fixtures. The source packet is an evidence set, not an installed full application checkout.

### 10.3 Measured reference cost probe

A scratch Node probe prepared complete synthetic text arrays using standard trim/NFC/ASCII lowercase and typed JSON tokens. Raw keys on both sides were `" K" + zeroPad6(i % distinctKeys) + " "`, with distinct-key counts 10,000, 100,000, 25,000, and 1 respectively. It separately measured preparation of both sides, building a target bucket index plus counting every pair, and materializing the first 25 exact pair records. Seven measured samples followed one warmup; values below are medians. Explicit garbage collection preceded each timed sample and was outside the timed section. No persistent cache or processing limit was used.

Environment: Node **v24.22.1**, Linux x64, reported AMD EPYC 9V74 CPU; nine logical CPUs reported and eight available parallelism slots. This shared container is not Byron’s browser hardware.

| Complete synthetic population | Exact pairs counted | Median timings: prepare / index+count / first 25 |
| --- | ---: | --- |
| 10,000 left × 10,000 right, unique keys | 10,000 | 14.054 / 1.575 / 0.035 ms |
| 100,000 × 100,000, unique keys | 100,000 | 127.540 / 26.263 / 0.066 ms |
| 100,000 × 100,000, 25,000 keys with four rows per side | 400,000 | 104.382 / 14.792 / 0.035 ms |
| 10,000 × 10,000, one shared key | 100,000,000 | 9.341 / 0.411 / 0.008 ms |

**Only 25 output records were materialized in each case.** Counting 100 million pairs by bucket sizes is fundamentally different from creating 100 million result objects. These measurements omit application evaluation, original-reference/occurrence allocations, React rendering, worker transfer/startup, snapshot retention, and full output allocation. They are not a product latency promise and do not justify a hard row cap or a cache.

**Inference:** complete counts and a first page can be inexpensive even when full expansion is very large. Show the exact prospective pair/output count before the analyst chooses expansion. Keep display paging independent of computation. Do not run a large expansion merely to obtain its preview count.

### 10.4 Required integrated measurement before optimization

M1 includes a development probe against the actual shared resolver, Schema draft preview, worker/direct path, and a real query view. Measure cold and repeated runs for 10k/100k rows, unique keys, controlled duplicate buckets, Unicode text, and a large single bucket. Record preparation, indexing, delta counts, first visible records, worker transfer, end-to-end interaction p50/p95, allocated result rows, and available memory measurements. Record hardware/runtime and exact input/key distributions.

Measure modest complete expansions separately from count-only stress. Never present a count-only result as expansion throughput. If a large requested expansion cannot be completed, return an explicit failed/cancelled evaluation; never silently truncate the relationship. Add persistent caching, memory ceilings, or product warning thresholds only after the measured bottleneck and desired behavior are concrete. Stale request results must already be discarded; cooperative cancellation can be added if the measured work blocks interaction.

## 11. Shippable milestones and acceptance boundary

The companion plan names file changes, exact tests, commands, docs, and examples in execution order.

| Milestone | Complete analyst capability | Main risk |
| --- | --- | --- |
| **M1** | Author/reuse scalar text keys; review exact deltas, duplicates, collisions, and originals; apply with explicit cardinality/bindings; evaluate, undo, save, reopen, refresh, and inspect in direct/worker modes. | Updating the evaluator but missing preview, inspector, static validation, or persistence paths. |
| **M2** | Deliberately reconcile integer encodings, review lost leading zeros and failed conversions, and reuse/save the convention. | Accidentally reusing measurement parsing or silently rounding identifiers. |
| **M3** | Author ordered typed components, inspect component-level changes, and traverse composites in both directions and repeated source occurrences. | Concatenation, cross-alias binding, or multiplying a grouped input by its contributor count. |

Every milestone includes the relevant sections of `apps/demo/src/docs/pages/join-keys.mdx`, its registered project example `join-key-preparation`, and the same pointer and keyboard workflow at **1280, 783, and 390 CSS pixels**. Source evidence confirms the ordinary demo example model supports `project`/`tables`; the inline docs live-example type currently does not. Link the docs to the full project demo in M1 rather than assuming an inline project renderer exists. [R-demo]; [R-live]; [R-catalogue]

Use accessible selects as well as pointer gestures. At 390px use a viewport-bounded sheet/tabbed review, with a scrollable data table and fixed reachable actions; do not compress field names into unintelligible badges. Escape closes the deepest editor and restores focus. Preview row limits are labeled, unsupported Apply is explained inline, read-only mode cannot mutate definitions, and all changed flows must work without dragging. Follow the existing border/focus tokens in light and dark themes. [R-ui]

Register a dedicated Playwright test/project or extend an existing matching pattern: `apps/demo/playwright.config.ts` has restrictive named projects, so creating an unreferenced test file is not sufficient. Run the documented targeted pnpm checks during implementation, and `pnpm check` once for a broad completed change. Package behavior changes need a minor changeset; no publishing is requested. [R-agents]; [R-guide]; [R-playwright]

## 12. Rejected options, uncertainty, and open product decisions

### Decisions made by this report

- Source ownership, separate key namespace, explicit prepared endpoint, direct raw target preparation, occurrence-aware binding, and original record preservation.
- Fixed operation order; ASCII-only casing; NFC rather than NFKC; strict safe-integer conversion; typed tuples.
- Prepared empty/nonfinite values do not match; unprepared relationships retain their existing behavior.
- Cardinality checks describe the complete-source matched relation; unmatched duplicates remain visible warnings.
- Ambiguous lookup remains unavailable; expansion retains every pair.
- Source-owned persistence is mandatory in M1; no unbuilt proposal becomes a prerequisite.

### Remaining decisions that do not block M1

1. **Manual exceptions:** whether a later mapping is by exact raw value or stable record identity, and its precedence relative to transformations. Keep it outside M1–M3.
2. **Broader Unicode behavior:** whether full case folding or named locale conversions are valuable enough to expose. Current defaults intentionally make no such promise.
3. **Measured UI/performance policy:** choose any cache strategy, cooperative cancellation threshold, or expansion warning threshold from the integrated measurements. The reference timings are insufficient to decide them.
4. **Positional-selection refinement:** retain the conservative invalidation rule initially; a later narrow runtime identity-dependency model may preserve more selections without claiming durable positional identity.
5. **Exact implementation names:** Codex may reuse existing helpers/test suites found in the full checkout. Preserve the contract and stable JK IDs; avoid duplicate implementations merely to match a proposed filename.

### Material limitations

- The packet contains the decisive types, matching/evaluation, UI, persistence, and notebook seams. It omits complete schema-graph internals, worker protocol/implementation, importer internals, and some host/demo test renderers. Those are inspect-first integration seams, not missing inputs that prevent choosing this design. No claims here depend on those modules already supporting preparation.
- The supplied tables are authoritative values. If an importer has already changed text `"007"` to number `7`, preparation cannot reconstruct the original spelling. Preserve raw supplied types and document that boundary.
- Native Date source cells are not supported by `AnalysisScalar`/source-file validation even though the project codec contains a Date tag. This design does not turn that codec detail into a date-join guarantee. [R-types]; [R-json]
- JavaScript’s native NFC implementation is used; this report does not establish behavior for newly assigned Unicode characters across every possible engine version. Pin the stated fixtures and test supported runtimes. A Unicode version coexistence framework is not warranted for this feature.
- No usability participants or external demand evidence were gathered or claimed. They are not acceptance gates for this mission.

## 13. Sources and complete reading coverage

### Primary external sources

All were retrieved from official publishers on **25 October 2026**. The current DuckDB stable links redirected to its 2.0 documentation; the Unicode annex retrieved was revision 58 for Unicode 18.0.0. Those facts identify the documentation read, not the browser runtime’s Unicode version.

- **S1:** Tableau, [Aggregate, Join, or Union Data](https://help.tableau.com/current/prep/en-us/prep_combine.htm) — join profiles, included/excluded populations, clause inspection.
- **S2:** Tableau, [Clean and Shape Data](https://help.tableau.com/current/prep/en-us/prep_clean.htm) — cleaning phase and operation ordering.
- **S3:** Microsoft, [Merge queries overview](https://learn.microsoft.com/en-us/power-query/merge-queries-overview) — multi-column pairs, order, type compatibility, expansion.
- **S4:** Microsoft, [Table.AddColumn](https://learn.microsoft.com/en-us/powerquery-m/table-addcolumn) — row-derived columns.
- **S5:** Microsoft, [Table.NestedJoin](https://learn.microsoft.com/en-us/powerquery-m/table-nestedjoin) — equality over selected key columns and nested result rows.
- **S6:** OpenRefine, [Column editing](https://openrefine.org/docs/manual/columnediting) — preserving originals through derived columns.
- **S7:** OpenRefine, [Expressions](https://openrefine.org/docs/manual/expressions) — previews, error choices, one-time transformations.
- **S8:** OpenRefine, [Cell editing](https://openrefine.org/docs/manual/cellediting) — transformations and review of suggested clusters.
- **S9:** Polars, [DataFrame.join](https://docs.pola.rs/api/python/stable/reference/dataframe/api/polars.DataFrame.join.html) — null equality, multiplicity validation, and output ordering.
- **S10:** Polars, [Joins user guide](https://docs.pola.rs/user-guide/transformations/joins/) — multiple key expressions and join shapes.
- **S11:** DuckDB, [Comparisons](https://duckdb.org/docs/2.0/sql/expressions/comparison_operators) — combination casting.
- **S12:** DuckDB, [Casting](https://duckdb.org/docs/2.0/sql/expressions/cast) — explicit conversion and failure behavior.
- **S13:** Unicode Consortium, [Unicode Standard Annex #15: Normalization Forms](https://www.unicode.org/reports/tr15/) — canonical versus compatibility normalization and stability qualifications.
- **S14:** Ecma International/TC39, [String text-processing specification](https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.trim) — trim and normalize primitives.

### Repository sources read in full

All 45 packet files were read completely across the research work. Paths below are relative to the repository root. The grouped labels used in this report identify the concrete paths and relevant symbols; they are not claims about files outside the supplied packet.

**Guidance and historical direction — 8 files**

- **R-agents:** `AGENTS.md` — feature docs/examples, pnpm verification, changesets.
- **R-guide:** `docs/agent-guide.md` — code map, host/state seams, docs/example registration, commands.
- **R-standards:** `CODING_STANDARDS.md` — raw-value parsing and UI rules.
- **R-ui:** `docs/ui-defaults.md` — compact controls, visible fields, nonmodal inspection, viewport/keyboard checks.
- `README.md` — library/host/data/storage boundary.
- **R-direction:** `docs/research/DIRECTION.md` — Byron is demand; staged feature design over conservative historical gates.
- **R-history:** `docs/intent/research-ideas-100/ideas/R041-join-key-preparation.md`; `docs/research/data-preparation-boundary-2026-10-16/README.md` — earlier framing only.

**Types, evaluation, and fixtures — 6 files**

- **R-types:** `packages/explorEDA/src/types/AnalysisProject.ts` — all public project, relationship, source, result, stage, and view types.
- **R-evaluate:** `packages/explorEDA/src/lib/analysis/evaluateProject.ts` — `sourceFrame`, `sourceReferences`, `relationshipSide`, `lookupFrame`, `expandedFrame`, `calculateFrame`, `aggregateFrame`, `evaluateAnalysisQuery`, revision logic.
- **R-json:** `packages/explorEDA/src/lib/analysis/projectFile.ts` — validation, `fieldsAt`, JSON codec, selected-view export.
- **R-hook:** `packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts` — direct/worker lifecycle and pending results.
- `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts` — existing strict equality, lookup/expansion and revision tests.
- `packages/explorEDA/src/test/fixtures/shopProject.ts` — project/query/source fixture patterns.

**Authoring and original-record inspection — 10 files**

- **R-relationship:** `packages/explorEDA/src/components/project/relationshipEditing.ts`; `relationshipEditing.test.ts` in the same directory — `countMatches`, cardinality UI, relationship proposals.
- **R-query:** `packages/explorEDA/src/components/project/queryEditing.ts` — `relationshipDirection` and query mutation helpers.
- **R-step:** `packages/explorEDA/src/components/project/stepEditing.ts` — `queryFields`, `usableRelationships`, `followRelationship`.
- `packages/explorEDA/src/components/project/ProjectSchemaPanel.tsx` — current local relationship draft/Apply flow.
- `packages/explorEDA/src/components/project/QueryRelationshipBuilder.tsx` — lookup/summary/expansion selection.
- **R-rows:** `packages/explorEDA/src/components/project/QueryStageRows.tsx` — `relatedRecords`, original-source display and bounded pages.
- **R-identity:** `packages/explorEDA/src/components/project/sourceRowIdentity.ts` — source identities, resolution, raw matching helper.
- **R-rowkeys:** `packages/explorEDA/src/components/project/analysisRowKeys.ts` — encoded selections and unresolved sentinel behavior.
- **R-component:** `packages/explorEDA/src/components/ExplorEdaProject.tsx` — callbacks, field/result mapping, Schema integration, trace state.

**Project text and folders — 6 files**

- **R-dsl:** `packages/explorEDA/src/lib/dsl/project.ts`; `project.test.ts` in the same directory — compile/export/reference validation.
- **R-folder:** `packages/explorEDA/src/lib/project/folder.ts`; `folder.test.ts` in the same directory — source loading/inference, local ownership, unavailable sources.
- **R-write-folder:** `packages/explorEDA/src/lib/project/writeFolder.ts` — project/analysis file serialization and declarations.
- **R-analysis-text:** `packages/explorEDA/src/lib/project/analysisText.ts` — parameterized analysis evaluation and chart text.

**Notebooks — 5 files**

- **R-notebook:** `packages/explorEDA/src/lib/notebook/readNotebook.ts`; `compileNotebook.ts`; `compileNotebook.test.ts` — named query evaluation and chart block compilation.
- **R-notebook-write:** `packages/explorEDA/src/lib/notebook/writeBack.ts`; `writeBack.test.ts` — chart-only text writeback and preservation.

**Scalar and calculation helpers — 4 files**

- **R-parsing:** `packages/explorEDA/src/lib/valueParsing.ts` — measurement, boolean, and date conversion contracts.
- **R-categories:** `packages/explorEDA/src/lib/categories.ts` — typed category keys, equality, and labels.
- **R-calculations:** `packages/explorEDA/src/lib/calculations/functions/registry.ts`; `packages/explorEDA/src/lib/calculations/engine/Calculator.ts` — existing expression function/evaluation boundary.

**Docs, demo, and browser registration — 6 files**

- `apps/demo/src/docs/pages/project-folders.mdx`; `apps/demo/src/docs/pages/notebooks.mdx` — current public workflows and examples.
- **R-catalogue:** `apps/demo/src/docs/catalogue.ts` — documentation registration.
- **R-live:** `apps/demo/src/docs/live/examples.ts` — existing inline example shape.
- **R-demo:** `apps/demo/src/demos/examples.ts` — project-capable examples and registrations.
- **R-playwright:** `apps/demo/playwright.config.ts` — named browser test projects and patterns.

## Closing handoff

**Access:** complete prompt and all 45 supplied source files read at the requested baseline; no decisive source input is missing. **Checks:** source inspection, primary-source research, independent fixture/string checks, and a reference timing probe were executed. Product implementation, integration tests, browser checks, and integrated performance measurements are proposed for Codex. No application repository changes were made.

**Deliverables:** [design-report.md](design-report.md) and [implementation-plan.md](implementation-plan.md), also packaged together in `join-key-design.zip`.

**Open questions:** manual-exception semantics, broader Unicode casing, measured optimization thresholds, and whether later work should preserve additional positional-dependent selections. None is an outside-demand gate or a blocker to the chosen first milestone.

[R-agents]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/AGENTS.md
[R-guide]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/docs/agent-guide.md
[R-standards]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/CODING_STANDARDS.md
[R-ui]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/docs/ui-defaults.md
[R-direction]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/docs/research/DIRECTION.md
[R-history]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/docs/intent/research-ideas-100/ideas/R041-join-key-preparation.md
[R-types]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/types/AnalysisProject.ts
[R-evaluate]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/evaluateProject.ts
[R-json]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/projectFile.ts
[R-hook]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts
[R-relationship]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/relationshipEditing.ts
[R-query]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/queryEditing.ts
[R-step]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/stepEditing.ts
[R-rows]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/QueryStageRows.tsx
[R-identity]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/sourceRowIdentity.ts
[R-rowkeys]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/analysisRowKeys.ts
[R-component]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/ExplorEdaProject.tsx
[R-dsl]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/dsl/project.ts
[R-folder]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/project/folder.ts
[R-write-folder]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/project/writeFolder.ts
[R-analysis-text]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/project/analysisText.ts
[R-notebook]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/readNotebook.ts
[R-notebook-write]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/writeBack.ts
[R-parsing]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/valueParsing.ts
[R-categories]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/categories.ts
[R-calculations]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/calculations/engine/Calculator.ts
[R-catalogue]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/docs/catalogue.ts
[R-live]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/docs/live/examples.ts
[R-demo]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/demos/examples.ts
[R-playwright]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/playwright.config.ts
[S1]: https://help.tableau.com/current/prep/en-us/prep_combine.htm
[S2]: https://help.tableau.com/current/prep/en-us/prep_clean.htm
[S3]: https://learn.microsoft.com/en-us/power-query/merge-queries-overview
[S4]: https://learn.microsoft.com/en-us/powerquery-m/table-addcolumn
[S5]: https://learn.microsoft.com/en-us/powerquery-m/table-nestedjoin
[S6]: https://openrefine.org/docs/manual/columnediting
[S7]: https://openrefine.org/docs/manual/expressions
[S8]: https://openrefine.org/docs/manual/cellediting
[S9]: https://docs.pola.rs/api/python/stable/reference/dataframe/api/polars.DataFrame.join.html
[S10]: https://docs.pola.rs/user-guide/transformations/joins/
[S11]: https://duckdb.org/docs/2.0/sql/expressions/comparison_operators
[S12]: https://duckdb.org/docs/2.0/sql/expressions/cast
[S13]: https://www.unicode.org/reports/tr15/
[S14]: https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.trim
