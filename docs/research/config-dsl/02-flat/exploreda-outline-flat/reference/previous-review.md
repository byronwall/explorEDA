# explorEDA chart DSL
## Three syntax proposals and a checker contract

**Design review · 3 October 2026**  
**Recommended direction:** Outline, with named clauses and indentation.  
**Status:** Language proposals plus a runnable, limited TypeScript review checker. No repository integration or native chart compiler is claimed.

---

## 1. Decision in brief

Build a small authoring language over explorEDA’s existing settings, not a second visualization engine. One line declares a chart. Common settings use short words; indentation carries additional settings. An optional source contract supplies short field aliases and readable display labels. An exact `config` layer reaches settings that do not deserve shorthand.

**Recommend Outline.** It makes X and Y explicit, stays readable during review, and supports both compact headers and vertical editing. Phrase is more conversational but needs more grammar. Slots is shorter, but a swapped pair of numeric fields can be syntactically valid and analytically wrong. These are design judgments, not measured usability results.

All three proposals use the same binding rules, detailed-configuration language, target settings, and checker. Only chart-header ergonomics differ. Do not initially ship three equally preferred languages: compare them here, then select one canonical format.

| Candidate | Character of the language | Principal tradeoff |
| --- | --- | --- |
| **Outline** | Named clauses: `scatter x revenue y margin` | A few extra role words buy explicitness and predictable edits. |
| **Phrase** | Controlled phrases: `scatter margin against revenue` | Reads like an analytical question, but Y-before-X and special grammar need discipline. |
| **Slots** | Positional arguments: `scatter revenue margin` | Fewest header characters, but position carries meaning that is not written down. |

The guiding rule is **generous input, precise meaning**. Accept harmless spelling and formatting variants. Never silently guess a field, discard an unknown setting, change a statistical method, or choose a different source.

### What is included

The package includes equivalent four-chart documents in all three dialects, source contracts, detailed-config examples, an intentionally invalid document, a dependency-free TypeScript checker, tests, and captured diagnostic output. Sections describing defaults, formulas, multi-workspace documents, a full native compiler, and a scatter-lab adapter are proposals, not implemented checker features.

## 2. Repository boundary and evidence

The previous scatter review used `94bfe0b325b9a19100def647e5555766a1f7eb9f`. This review re-read `main`, which resolved to **`226ffae632239150b54b55e9b346386e5e1e66d4`**, and inspected the relevant contracts at that exact ref. The inspected settings union includes Metric Card, which was not in the earlier baseline union. [R1, R2, R7]

| Observed contract | Evidence | Consequence for this language |
| --- | --- | --- |
| Workspace settings contain charts, calculations, grid settings, metadata and color scales, plus optional Rows, field settings and aggregates. | `SavedDataStructure` [R3] | Compile to that structure. Keep authoring-only source bindings beside it, not inside invented native properties. |
| `ExplorEda` receives one `data` array and optional `savedData`. | `ExplorEda` [R4] | A source catalog is not a join engine. A native workspace binds one source. |
| Field settings expose label, type, format, precision, unit, currency, date preset and null tokens. The inspected interface has no alias property. | `FieldSettings` [R5] | DSL aliases are compile-time names. Emit canonical raw field names and existing display metadata. |
| Chart definitions provide default factories and boolean validation; saved-data codecs add validation. | `ChartDefinition`, defaults and codecs [R2, R6, R8] | Reuse them, but add location-aware diagnostics, reference checks and effect checks. |
| The generic axis union is broader than scatter’s actual implementation. Scatter selects numeric linear/symlog or inferred categorical bands; it computes its own domains. | `AxisSettings`, `planScatterAxis` [R2, R9] | A type-valid property is not proof that it changes this renderer. Report unsupported or ineffective settings. |
| Bar settings include `binCount` and `aggregateId`; Metric Card has `aggregation` and `measureField`; table columns have IDs, fields and optional widths. | Chart definitions [R7, R10, R11] | Shorthand needs explicit lowering rules, not guesses based on chart names. |

The prior scatter-lab bundle has a separate `Settings` interface and `exploreda-scatter-lab` format. Its hexbin, density and ellipse settings were deliberately not added to native saved-workspace settings. Section 10 keeps that boundary. [A1]

## 3. Shared source mapping

The following optional section is identical in all three dialects. The full runnable dashboard examples include it; later chart-only excerpts omit it to make the syntax differences visible.

```text
sources
  orders salesRows
    label Order book
    fields
      revenue Revenue
        label Revenue ($)
        expect numeric
        format currency
        currency USD
      margin Margin
        label Margin ($)
        expect numeric
      category Category
        expect categorical
      region Region
        expect categorical
      order Order ID
use orders
```

The source line is `alias [hostBinding]`: `orders` is the document’s name; `salesRows` is the key the host supplies. Omit the second name when they match. `label Order book` describes the source for the host/editor; it is not a new native workspace setting.

Within `fields`, the first token is the alias and the rest of the line is the raw field name. Thus `order Order ID` does not need quotes. A child `label` is the display name. `revenue` lowers to `Revenue`; it does **not** rename the input rows or become the display label. Native output includes `fieldSettings.Revenue.label` and the specified format settings. [R5]

**Expected type and conversion are different.** `expect numeric` checks the source contract without modifying data. Proposed `coerce numeric` explicitly requests the existing numeric type override. Check expectations against the source profile before coercion; check chart compatibility against the effective type after coercion. Do not substitute one for the other.

### Binding rules

Resolve an exact alias first, then an exact canonical raw field name in the selected source. Reject an alias that shadows a different existing raw field. Field names are case-sensitive. Display labels never participate in binding; duplicate labels may warn, but must not redirect a reference.

Unlisted source fields are allowed: `fields` is an expected-field contract, not an exhaustive projection. Missing required fields are errors when a host catalog is available. `optional true` permits an unused field to be absent; a chart that actually uses that absent field still fails. Without host metadata, mark existence/type checks as **deferred**, not successful. Never infer a missing source from a similar name.

With no `sources` section, the host’s default `data` binding supplies canonical names:

```text
scatter x Revenue y Margin
  title Revenue and margin
  opacity .55
```

A field with spaces in a compact header needs quotes, such as `x "Net revenue"`. A rest-of-line title can remain unquoted. Quote names containing significant comment markers or leading/trailing whitespace.

Multiple expected sources and explicit per-source workspace blocks are described in Section 10. They do not imply joins or cross-source filtering.

## 4. Candidate A — Outline

**Grammar idea:** chart kind followed by named clauses. The same clause can stay on the chart line or move onto an indented line. Values with fixed arity make compact headers deterministic.

```text
scatter x revenue y margin color category
  id margin-view
  title Revenue and margin
  x scale symlog
  points 3
  opacity .55
  at 0 0 6 5
  config
    margin
      top 16
      right 24
    xGridLines 6

hist field revenue bins 24
  id revenue-distribution
  title Revenue distribution
  at 6 0 3 5

row field category
  id category-counts
  title Orders by category
  at 9 0 3 5

table fields order revenue margin
  id records
  title Selected orders
  at 0 5 12 5
  config
    sortBy Revenue
    sortDirection desc
```

Fixed-arity clauses also work together on the header:

```text
scatter x revenue y margin color category opacity .55 points 3
```

Move any named clause onto its own indented line to expose one setting per diff. Variadic `fields` and `title` consume the rest of their segment. Use a new line, or an optional semicolon before another inline clause: `table fields order revenue; title Orders`. Words inside a title never become settings.

**Strengths.** Roles are visible, settings move between inline and indented forms, and edits are local. Unknown keywords are easy to underline. Most common configuration needs no colons, commas, braces or quotation marks.

**Weaknesses.** `x`, `y`, `field` and `fields` cost characters. Variadic clauses require a line boundary or delimiter. An unrestricted collection of shorthand synonyms could grow into a second settings schema; keep a small, documented vocabulary and use `config` for the long tail.

**Best fit.** Agent generation reviewed by developers, configuration stored in source control, and charts that acquire additional settings over time. This is the proposed canonical language.

## 5. Candidate B — Phrase

**Grammar idea:** a bounded set of readable analytical phrases, not free-form natural language. The first field in a scatter sentence is Y: **margin against revenue** means margin vertically and revenue horizontally.

```text
scatter margin against revenue colored by category
  id margin-view
  title Revenue and margin
  x scale symlog
  points 3
  opacity .55
  at 0 0 6 5
  config
    margin
      top 16
      right 24
    xGridLines 6

hist revenue into 24 bins
  id revenue-distribution
  title Revenue distribution
  at 6 0 3 5

row category
  id category-counts
  title Orders by category
  at 9 0 3 5

table order revenue margin
  id records
  title Selected orders
  at 0 5 12 5
  config
    sortBy Revenue
    sortDirection desc
```

Only the headers differ from Outline. Details deliberately use the shared compact setting language; inventing conversational syntax for every margin, table column or camera coordinate would undermine terseness.

The proposed phrase catalog can later include `line revenue over day` and `bar sum revenue by region`, with explicit lowering to a series field or grouped aggregate. Those extensions are proposals; the review checker does not accept them today. Do not let `by` simultaneously mean color, grouping and faceting. In scatter headers, only `colored by` selects color; use the shared `facet` setting for facets.

**Strengths.** The primary relationship reads like an analytical question. A controlled phrase can explain an aggregation more naturally than a list of property names. It can be approachable to readers who do not think in serialized settings.

**Weaknesses.** Y-before-X differs from the other candidates and is easy to misremember. More chart types require more productions. Requests such as “sales by region by channel” are ambiguous unless the language refuses them or asks for specific clauses. Familiar English is not permission to guess.

**Best fit.** A human-facing teaching or narrative authoring layer with a narrow chart vocabulary. It is less attractive as the only format for an entire configuration surface.

## 6. Candidate C — Slots

**Grammar idea:** fixed positional signatures for chart headers, followed by the same indented details. Scatter uses **X Y [COLOR]**. Hist uses **FIELD [BIN_COUNT]**. Table takes a field list.

```text
scatter revenue margin category
  id margin-view
  title Revenue and margin
  x scale symlog
  points 3
  opacity .55
  at 0 0 6 5
  config
    margin
      top 16
      right 24
    xGridLines 6

hist revenue 24
  id revenue-distribution
  title Revenue distribution
  at 6 0 3 5

row category
  id category-counts
  title Orders by category
  at 9 0 3 5

table order revenue margin
  id records
  title Selected orders
  at 0 5 12 5
  config
    sortBy Revenue
    sortDirection desc
```

Use a semicolon to leave the positional header before adding inline details:

```text
scatter revenue margin category; opacity .55; points 3
```

An omitted trailing optional argument is simply absent. Do not add placeholders for hypothetical future slots. For example, a scatter with no color but an explicit opacity uses `scatter revenue margin; opacity .55`, not an unexplained dash in the third position.

**Strengths.** Shortest headers, few repeated words, and a simple fixed-arity parser for common charts. A compact document can be scanned as a chart inventory.

**Weaknesses.** Meaning depends on memorized signatures. Two numeric fields can be swapped without any type error. Adding a new positional argument is a compatibility hazard. Variadic table/series arguments force a delimiter before other settings. It becomes less advantageous as detailed configuration grows.

**Best fit.** Expert-authored sketches or an optional input convenience normalized into Outline. Do not make an agent’s smallest possible header more important than a reviewer’s ability to catch a wrong mapping.

## 7. Comparison using equivalent documents

The included dashboards normalize to identical source bindings, field display settings and four chart patches in the prototype tests. Measurements below count Unicode characters in the actual UTF-8 example files, including whitespace and newlines; these examples contain only ASCII. Header totals include the three line breaks joining the four headers. Full-document totals include each dialect’s version header and identical source/detail sections.

| Candidate | Four chart headers | Complete four-chart example |
| --- | --- | --- |
| Outline | 121 characters | 908 characters |
| Phrase | 116 characters | 902 characters |
| Slots | 87 characters | 872 characters |

Slots saves **28.1%** against Outline on the four headers, but **4.0%** across the complete document. This is a narrow fixture comparison, not a claim about all dashboards. Character counts are not model-token counts; no tokenizer benchmark or human usability study was performed.

| Review concern | Outline | Phrase / Slots |
| --- | --- | --- |
| Detect a swapped X/Y mapping | Roles are explicit next to the fields. | Phrase uses Y-before-X; Slots requires remembering X-before-Y. |
| Add a rare native setting | Shared `config` block. | The same block; neither alternative improves this part. |
| Agent repair after a typo | Usually a field or keyword token. | Phrase must also repair a production; Slots can have valid but unintended roles. |
| Review a growing chart | Move clauses onto separate lines without changing roles. | Headers remain compact, but detailed forms converge on the same shared language. |
| Keep grammar stable | Add named clauses sparingly. | Phrase adds productions; Slots must freeze positional signatures. |

**Recommendation:** select Outline for the first production implementation. An importer may accept Slots later and print explicit Outline. Defer Phrase unless user testing demonstrates a meaningful advantage for the intended readers.

## 8. Shared detailed configuration — the completeness layer

Common aliases are a convenience, not a new limit on what can be configured. Native properties keep their actual spelling under `config`. Shorthand expands aliases; raw config uses canonical native field names and exact values.

```text
scatter x revenue y margin
  points 3
  config
    margin
      left 64
    xAxis
      grid true
    xGridLines 6
```

`points` lowers to `pointSize`; `x` lowers to `xField`. `config` leaves `xAxis.grid` and `xGridLines` as native property names. A color clause needs both a field and an eventual native color-scale definition/ID; a production compiler must materialize that scale from host data or an explicit scale declaration, not assume that `colorField` alone finishes the work. [R2, R6]

### Objects, arrays, empty values and awkward keys

Object indentation is punctuation-free. Ordered collections use `list` and `item`; an item with children is an object. This distinguishes an array from an object without relying on a chart-specific guess.

```text
table fields order revenue
  config
    columns list
      item
        id order-column
        field Order ID
        width 140
      item
        id revenue-column
        field Revenue
        width 180
    globalSearch "true"
```

Empty arrays and objects use `[]` and `{}`. `null` is a value, not deletion. Thus `visibleFacetIds []` means explicitly show no facets; omission preserves the native default behavior. The inspected facet contract explicitly distinguishes those two states. [R2]

Use a quoted key when the actual native object key contains spaces or punctuation. This line-chart example is part of the complete proposal, not the prototype’s supported chart subset:

```text
line x Day series Revenue
  config
    seriesSettings
      "Revenue"
        lineWidth 2
        showPoints false
```

A compact property path can be written as `config xAxis.grid true`. An exact path may use JSON Pointer, for example `config /xAxis/grid true`. JSON Pointer defines how path segments identify object/array values, including escaping `~` and `/`; use that standard rather than inventing another quoting scheme. [S1]

The complete compiler should also accept `config json` followed by an indented literal JSON object. This is the fallback for pasted, fully specified native configurations, including large arrays. The prototype accepts inline JSON values and indented objects/lists, but not a multiline `config json` block.

### Full expressiveness contract

Every native chart type can be declared by its registered type name, even without a custom shorthand signature. The native target covers the inspected 17-type union, including 3D scatter, pivot, summary, markdown, Sankey, parallel coordinates, calendar, heatmap, ECDF, Metric Card and color legend. This is proposed compiler coverage, not implemented prototype coverage. [R2]

At workspace scope, `config` addresses the `SavedDataStructure` root. Within a chart, it addresses that chart. The complete fallback can therefore preserve metadata, grid settings, calculations, colors, field settings, aggregate definitions and Rows settings as well as every chart-specific property. [R3]

A generic `chart` declaration whose config supplies the native type and ID is the raw import form. In a named chart declaration, `config.type` must agree with the declaration; an ID conflict is likewise an error. Change the explicit identity/type instead of silently creating a different chart.

**Unknown is not the same as advanced.** A valid rare native property passes through exact config. A misspelled or unsupported property fails. An explicit archival mode may preserve unknown future data without executing it, but must label it unvalidated and must not return a successful runnable compilation.

## 9. Generosity without ambiguity

The complete lexer accepts blank lines, LF/CRLF, arbitrary consistent space indentation, optional `:` or `=` after a setting key, single or double quoted tokens, and a small fixed alias vocabulary such as `colour` → `color` and `histogram` → `hist`. The canonical printer uses lowercase keywords, two spaces, double quotes only when needed, and no optional punctuation. Names and labels retain their original case.

A comment begins with `#` at a token boundary followed by whitespace/end-of-line. Consequently `#3479a8` is a value, while `# explanation` is a comment. Quoted strings and literal text/JSON blocks protect their contents. Do not parse a hex color as a comment or rewrite text inside a formula.

Bare numeric settings accept decimals such as `.55` and finite exponent notation. `true`, `false` and `null` are typed values in raw config. Primitive-looking text needs quotes. In typed boolean shorthand only, the full design can accept `on`/`off`; raw config retains exact boolean literals. Tabs, broken indentation, conflicting duplicate keys, unknown fields and unknown options are diagnostic errors, not opportunities for silent repair.

### Ownership of additional lines

An indented setting belongs to its enclosing chart. A new unindented chart starts a new declaration. An unindented `opacity .5` must not silently modify whichever chart happened to precede it.

The complete design provides an explicit continuation/edit form for settings elsewhere in the document:

```text
scatter x revenue y margin
  id margin-view

edit margin-view opacity .5

edit margin-view
  config
    margin
      left 72
```

Collect IDs before resolving edits, so forward references can receive meaningful diagnostics. Multiple edits assigning different values to the same property at the same precedence level are errors. This form is intentionally explicit; the prototype rejects `edit` as outside its scope.

### Precedence and reset

Use fixed precedence, independent of textual location: pinned native defaults; document/workspace defaults; chart shorthand; chart exact config; explicit `edit` overlays. Report every conflicting cross-level override with both locations and the resulting value. Conflicts within one level are errors; identical duplicates can warn. Do not use accidental last-write-wins behavior.

Merge objects by property. Replace arrays as complete ordered values; do not concatenate filters or columns merely because both sides are arrays. Repeated shorthand `filter` declarations intentionally build one filter array, while an explicit config array replaces it. A proposed `unset PATH` removes that optional key from final output after expansion, rather than treating `null` as omission; deleting a required property fails validation. Removing the author’s override to inherit a default is a separate editor operation.

Filter ownership must stay explicit. A chart-level `filter` lowers to that chart’s `filters` array and participates in the native chart’s linked-filter behavior. A root `config.rowsSettings.filters` value belongs to Rows instead; a table’s search is not automatically a chart filter. Validate which filter fields each renderer actually honors. For example, the inspected Data Table filter function ignores a field absent from its configured columns, so the production checker should flag that ineffective request. [R3, R11]

`at X Y WIDTH HEIGHT` uses zero-based grid coordinates and positive integer sizes. When absent, the production formatter/compiler should use a pinned deterministic auto-layout. It must not move explicit layouts or silently rely on later UI compaction.

### Stable identities and versioning

Keep `id` optional for sketches, but do not promise stable identity for anonymous charts after insertion or reorder. A formatter should offer to persist generated IDs; existing IDs survive settings and layout edits. The prototype emits a position-dependent preview ID with `W_AUTO_ID` when one is absent.

Use an optional `eda 1 outline` header and a host-supplied target profile. For checked-in agent output, pin the grammar version, target capability manifest and default profile in the document or a lock file. Repeated compilation must not introduce new UUIDs, new timestamps, palette order changes or surprise default drift. Preserve supplied metadata; capture new metadata once when a workspace is first created.

## 10. Workspace features and the scatter-lab boundary

### More than one expected source

The complete proposal permits multiple contracts and explicit workspaces. Each workspace produces its own native settings plus a source binding. There are no implicit joins or linked filters across separate native instances. [R4]

```text
sources
  orders salesRows
    fields
      revenue Revenue
      margin Margin
  stock inventoryRows
    fields
      sku SKU
      quantity Quantity

workspace sales
  use orders
  scatter x revenue y margin

workspace inventory
  use stock
  table fields sku quantity
```

This is proposed syntax. The runnable review checker accepts one implicit workspace and rejects `workspace` explicitly rather than pretending to support it.

The complete Outline vocabulary can add a small number of workspace declarations, keeping their lowering visible:

```text
calc contribution Revenue - Cost

aggregate revenue-by-region
  group region
  sum revenue

bar field revenue
  config aggregateId revenue-by-region
```

`calc` stores formula text in the existing calculation structure. Formula expressions should initially use canonical native field names and the repository’s existing formula grammar, not a competing expression language. The alias map applies to DSL field-reference clauses, not arbitrary substrings in formula text. Any later formula alias support must rewrite parsed field references, never do string substitution. [R3, R8]

An aggregate declaration lowers to a named workspace aggregate and a chart reference to its ID. Validate its measure, group and reference consistency. A calculation cycle, unresolved aggregate or incompatible field must produce a diagnostic at the declaration/reference, not a renderer crash.

Markdown content needs a proposed literal `text` block: remove the block’s structural indentation, preserve the remainder and trailing newlines, and suspend DSL/comment parsing until dedent. Export it through the native markdown setting. Similarly, raw config can preserve serialized 3D camera values and ordered nested arrays without inventing a concise clause for each value.

### Experimental settings remain a different target

An optional future adapter can reuse the same object syntax for the prior lab’s actual setting names:

```text
lab comparison
  config
    analysisScope selected
    referenceScope full
    scoreScope analysis
    analysisSpace data
    layers
      hex true
      densityContours true
      dataEllipse true
      meanRegion false
    method
      hexRadius 14
      bandwidth 20
      coverage .95
```

This is a **proposed adapter**, not a valid native scatter chart. It would expand against the lab’s fixture/default settings and validate its separate format. The field names above come from the supplied lab source bundle. The distinction between `dataEllipse` and `meanRegion`, and between analysis/reference/scoring scope, must survive normalization. [A1]

A native-target checker should reject `hex`, `densityContours` or `meanRegion` as native scatter properties unless the target renderer actually gains those capabilities. Supporting an exact-config escape hatch does not make experimental features exist.

## 11. The checker is part of the language

An agent needs more than a parser returning true or false. The proposed production toolchain has one deterministic semantic core with three front ends during evaluation. A chart can parse, bind, and validate structurally yet still request an ineffective renderer option; report these stages separately.

### Validation pipeline

1. **Parse without guessing.** Preserve tokens, indentation, comments and source ranges. Recover at the next chart/workspace boundary after malformed input so one bad chart does not hide independent errors.
2. **Resolve and lower.** Bind source/field names, IDs, calculations, aggregates, colors and edits. Expand shorthand to typed settings patches, tracking a source origin for every output path.
3. **Validate and materialize.** Apply pinned defaults and exact-config precedence. Check native types, array/object structure, required properties, bounds, cross-references, layout and renderer capabilities. Materialize data-dependent color scales only from real bindings or complete domain metadata.
4. **Return evidence, not just a verdict.** Emit diagnostics, partial authoring state, normalized preview and setting provenance. Only a fully successful compile yields executable native settings. Draft previews must not be confused with valid saved workspaces.

Schema validation should reject unknown properties rather than silently ignore them. If a JSON Schema implementation is used, its `additionalProperties`/`unevaluatedProperties` behavior must be configured deliberately, especially across combined schemas. JSON Schema allows extra properties by default. [S2]

Generate or mechanically verify structural schemas against the discriminated TypeScript settings union, but maintain a small renderer-capability layer for supported scales, field roles and effect checks. The inspected scatter axis demonstrates why a broad type union alone is insufficient. [R2, R9]

### Diagnostics for people and agents

Use stable codes; severity; an exact token/block range; chart/workspace ID; native property path; expected and actual values; related locations; and suggested fixes. Machine positions are zero-based UTF-16 line/character pairs, with end-exclusive ranges. CLI locations are one-based. That representation is compatible with the Language Server Protocol’s diagnostic/range concepts; completion and code actions can be added without changing the semantic checker. [S3]

The included invalid fixture actually produces these independent findings:

```text
21:11 E_UNKNOWN_FIELD       reveneu → revenue or Revenue
23:3  E_OPACITY             pointOpacity must be in [0, 1]
24:5  E_UNSUPPORTED_SCALE   log is not an effective scatter option
25:3  E_UNKNOWN_CONFIG      pointSzie is not a native setting
28:1  E_EXPECT_NUMERIC      categorical field used for hist
28:21 E_BINS                binCount must be positive
```

This is a shortened display of captured prototype diagnostics, not hypothetical test output. The typo is left unchanged in the partial preview; suggestions are never auto-applied. The full output is in `evidence/invalid-diagnostics.json`.

A proposed production repair item adds a bounded edit and its applicability:

```json
{
  "code": "E_UNKNOWN_FIELD",
  "chartId": "broken",
  "path": "/xField",
  "range": {
    "start": { "line": 20, "character": 10 },
    "end": { "line": 20, "character": 17 }
  },
  "fixes": [{
    "replacement": "revenue",
    "applicability": "suggested",
    "reason": "Declared alias for Revenue"
  }]
}
```

A typo suggestion can change meaning and therefore is not a safe automatic fix. Safe fixes are limited to semantics-preserving formatting or an explicitly documented alias. Include a document hash/version with edits so an agent cannot apply stale ranges after another change. Suppress cascading errors when an unresolved symbol already explains them.

### Proposed TypeScript API

```ts
type CompileResult =
  | {
      ok: true;
      settings: SavedDataStructure;
      binding: SourceBinding;
      diagnostics: Diagnostic[];
      origins: SettingOriginMap;
    }
  | {
      ok: false;
      diagnostics: Diagnostic[];
      partial: AuthoringDocument;
    };

check(text, context);      // Diagnostics and staged status.
compile(text, context);    // Native output only on success.
format(text, options);     // One canonical representation.
explain(text, chartId);    // Values, defaults and origins.
```

This API is a design sketch; the shipped prototype exports its separately documented `check()` interface. Keep the compiler independent of React. Feed a successful result into an explicit workspace restore/apply action; do not feed invalid drafts or every keystroke into the running workspace.

### Agent feedback loop

Give the agent the pinned capability summary, field contract and one valid example. Ask for the document only. Run the checker; return the changed chart block plus structured diagnostics, not an entire repository dump. Apply only accepted edits against the matching document version, recheck, and inspect the expanded settings or rendering before acceptance. Limit repair attempts and surface unresolved errors rather than allowing an endless speculative rewrite.

A production CLI should distinguish success, invalid input, binding-required, and tool failure. The included review CLI has the smaller convention: exit 0 for subset success, 1 for language/check errors and 2 for input/tool failure. Deferred bindings remain explicit in JSON; exit 0 is not certification of native execution.

## 12. What the runnable checker proves

**52 tests pass**, and the pure TypeScript module passes a strict `tsc --noEmit` check in this environment. Tests cover all three headers, equivalent dashboard patches, source aliases, native-name raw references, field/type errors, duplicate IDs/settings, explicit override precedence, arrays, empty arrays, quoting, comments, malformed input recovery, unsafe keys, and selected renderer-effect constraints.

The prototype supports `scatter`, `hist`/`histogram`, `bar`, `row`, `table` and `metric`, one implicit workspace, source contracts, common settings, a subset of native raw-config checking, object/list values, and machine diagnostics. It emits **patch previews**, not a complete `SavedDataStructure`. In particular it does not create native color scales or expand chart default factories.

It does **not** implement full native-schema validation, all 17 chart types, a canonical printer, expression parsing, full-schema round trips, defaults/edits/workspace declarations, the lab adapter, browser tests, or repository integration. Unsupported top-level proposal declarations fail with `E_REVIEW_LIMIT`; arbitrary unseen native options are not assumed supported. Do not use this prototype as the production acceptance gate for arbitrary saved analyses.

All commands below run from the extracted package root; no package installation is required for the checker. The actual test environment used Node 22.16.0. Type stripping is used only to run this dependency-free review source; it is not a proposed change to explorEDA’s repository runtime.

```sh
# Test the checker and its three front ends.
node --experimental-strip-types --test checker/checker.test.mjs

# Check a valid document against the illustrative host catalog.
node --experimental-strip-types checker/cli.mjs \
  examples/dashboard.outline.eda \
  --catalog examples/catalog.json --json

# Inspect actionable errors; this command intentionally exits 1.
node --experimental-strip-types checker/cli.mjs \
  examples/invalid.outline.eda \
  --catalog examples/catalog.json --json

# Type-check the pure module with a local TypeScript compiler.
tsc --strict --noEmit --target ES2022 --module ESNext \
  --lib ES2022,DOM checker/checker.ts
```

## 13. Production acceptance and implementation order

First prove semantic preservation with the native representation, then optimize short syntax. No syntax preference should waive correctness gates.

| Gate | Required proof | Failure to avoid |
| --- | --- | --- |
| Full configuration coverage | Import/export fixtures for every registered chart type and every workspace-level setting, including nested arrays and unusual keys. | A terse language that silently loses rare settings. |
| Raw round trip | Native JSON → exact DSL → native JSON preserves IDs, metadata, ordered arrays, explicit empties and all supported values. | “Equivalent-looking” charts with different saved state. |
| Canonical stability | Printing twice is stable; printing and reparsing preserve semantics. | Agent diffs that continually churn syntax or defaults. |
| Cross-dialect comparison | Matched inputs lower to the same fully expanded native settings. | A misleading syntax comparison using different chart semantics. |
| Checker accuracy | Golden diagnostic ranges, recovery tests, property fuzzing and negative capability tests. | A green check on ignored or misspelled options. |
| Runtime agreement | Apply generated native settings to actual data; compare with equivalent JSON configuration in browser tests. | A successful parser confused with working charts. |

“Round trip” means equality of the supported serialized JSON values, not JavaScript object identity or byte-for-byte whitespace. Optional `undefined` properties are normalized by the existing settings serialization boundary. Special values in raw data belong to the separate full-analysis codec; the chart DSL should not quietly become a raw-row transport. [R3, R8]

**Implementation order.** Start with the source contract, location-preserving parser and exact-config fallback. Add the schema/capability manifest and native adapter. Prove raw round trips across the registry before broad shorthand expansion. Then implement Outline clauses and the formatter, followed by editor diagnostics and an agent repair corpus. Keep alternate dialects as research fixtures until there is evidence to maintain them.

**Safety limits.** No arbitrary JavaScript, executable expressions outside the existing formula grammar, network fetches, implicit file includes, environment interpolation or dynamic plugin loading. Host code supplies data. Bound document size, nesting, chart count and diagnostics. Reject unsafe object paths and prototype-pollution keys. Do not fix dangerous inputs by evaluating them.

**Review decisions.** Confirm Outline as the canonical format; confirm source aliases remain authoring-only with one source per native workspace; and confirm exact config stays strictly checked rather than becoming an “anything goes” bag. Those choices determine the compiler contract more than the exact keyword spelling.

## References and provenance

Repository links below are pinned to the inspected commit. They support statements about existing contracts; the syntax and compiler architecture in this document are proposals.

**[R1] Repository ref.** `byronwall/explorEDA`, `main` read through the connected GitHub service on 3 October 2026; resolved ref `226ffae632239150b54b55e9b346386e5e1e66d4`. The prior task used `94bfe0b325b9a19100def647e5555766a1f7eb9f`.

**[R2] Chart contracts.** `packages/explorEDA/src/types/ChartTypes.ts`: `ChartSettings`, `BaseChartSettings`, `AxisSettings`, `ChartDefinition`, facet settings. [Pinned source](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/types/ChartTypes.ts).

**[R3] Saved workspace and analysis.** `packages/explorEDA/src/types/SavedDataStructure.ts`. [Pinned source](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/types/SavedDataStructure.ts).

**[R4] Public integration.** `packages/explorEDA/src/components/ExplorEda.tsx`: `ExplorEda` and its `data`, `savedData`, `onStateChange` props. [Pinned source](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/components/ExplorEda.tsx).

**[R5] Field metadata and conversion.** `packages/explorEDA/src/lib/fieldSettings.ts`: `FieldSettings`, `getFieldSettingsError`, `convertFieldValue`. [Pinned source](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/lib/fieldSettings.ts).

**[R6] Default settings.** `packages/explorEDA/src/utils/defaultSettings.ts`. [Pinned source](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/utils/defaultSettings.ts).

**[R7] Metric Card.** `packages/explorEDA/src/components/charts/MetricCard/definition.ts`. [Pinned source](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/components/charts/MetricCard/definition.ts).

**[R8] Native codecs.** `packages/explorEDA/src/utils/saveDataUtils.ts`: `parseSavedData`, `stringifySavedData`, full-analysis special-value handling. [Pinned source](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/utils/saveDataUtils.ts).

**[R9] Effective scatter axes.** `packages/explorEDA/src/components/charts/ScatterPlot/scatterAxis.ts`: `planScatterAxis`. [Pinned source](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/components/charts/ScatterPlot/scatterAxis.ts).

**[R10] Bar settings.** `packages/explorEDA/src/components/charts/BarChart/definition.ts`. [Pinned source](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/components/charts/BarChart/definition.ts).

**[R11] Data Table.** `packages/explorEDA/src/components/charts/DataTable/definition.ts`. [Pinned source](https://github.com/byronwall/explorEDA/blob/226ffae632239150b54b55e9b346386e5e1e66d4/packages/explorEDA/src/components/charts/DataTable/definition.ts).

**[A1] Supplied scatter-lab bundle.** Prior conversation asset `scatter-test-bed-source.zip`; inspected entries `apps/demo/src/scatter-lab/types.ts` and `settings.ts`. This is local experimental source, not evidence of a merged native feature.

**[S1] JSON Pointer.** IETF RFC 6901, syntax and evaluation of references into JSON values. [Reference](https://www.rfc-editor.org/rfc/rfc6901).

**[S2] JSON Schema objects.** Official documentation for `properties`, `additionalProperties` and `unevaluatedProperties`. [Reference](https://json-schema.org/understanding-json-schema/reference/object).

**[S3] Language Server Protocol.** Microsoft LSP 3.17, diagnostic and range structures. [Reference](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/).
