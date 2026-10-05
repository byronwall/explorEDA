# Outline
## Final language review

**explorEDA · Review 03 · 3 October 2026**

**Decision:** retain the flat `key=value` language. Add `calc name=expression` and `where.field=value`. Do not add a query sublanguage, indentation rules, implicit formulas, or another configuration hierarchy.

```text
eda 3 flat
source orders=salesRows
revenue:num=Revenue label="Revenue ($)"
cost:num=Cost
channel:cat=Channel

calc profit=revenue-cost
calc rate=revenue==0 ? null : profit/revenue
+ label="Margin" format=percent precision=1

scatter @profit x=revenue y=profit
+ color=channel size=3 where.profit=0..
row @channels channel where.channel=Web,Store
hist @distribution profit bins=24
metric @total sum=profit
table @records revenue,profit,rate,channel
```

This complete example has **two calculations, five charts, and two chart-owned filters in 14 nonblank lines**. Its longest line is **45 characters**. Nothing is indented. These are measured counts for the included fixture, not a measured usability multiplier.

The language remains readable in both directions: an agent can generate it from the source catalog, and a human can inspect each chart without expanding a settings tree. A new line is a readability choice; `+` identifies its owner explicitly.

**Delivery:** a final design recommendation, runnable TypeScript review checker, seven new examples, a local playground, and captured validation evidence. The checker emits native calculations and chart patches. It is not a complete saved-workspace compiler or an integrated chart runtime.

<!-- PAGE -->

## 1. The everyday grammar

Keep one predictable punctuation system. `=` binds a setting, `:` annotates a field type, `.` reaches a property, and `@` supplies a stable chart ID. Calculations use the existing expression model rather than executable JavaScript. [R1–R3]

| Task | Canonical spelling |
| --- | --- |
| Expected source | `source orders=salesRows` |
| Field contract | `revenue:num=Revenue` |
| Display metadata | `label="Revenue ($)"` |
| Calculation | `calc profit=revenue-cost` |
| Named chart roles | `scatter x=revenue y=profit` |
| One obvious input | `hist profit bins=24` |
| Row count or total | `metric count` / `metric sum=profit` |
| Numeric filter | `where.profit=0..` |
| Value selection | `where.channel=Web,Store` |
| Detailed native setting | `margin.left=64` |
| Optional continuation | `+ color=channel opacity=.55` |
| Explicit chart adjustment | `edit profit size=4` |

**Order is not meaning.** Chart-setting pairs can be reordered or wrapped without changing their meaning. The example below is the same chart in either order:

```text
scatter x=revenue y=profit where.profit=0..
scatter where.profit=0.. y=profit x=revenue
```

Scatter keeps explicit X and Y roles. A histogram or row chart has one obvious primary field, so `field=` is optional there. A table’s primary field list uses commas. `metric avg=profit` lowers to the native `average` aggregation; `metric sum=profit` lowers to a sum, not a formula.

Quotes protect spaces and punctuation. `where.product="A,B"` matches one literal category, while `where.product=A,B` selects two. Empty strings, empty arrays, missing values, and absent settings stay distinct. Never remove those distinctions merely to save characters.

<!-- PAGE -->

## 2. Sources without scaffolding

The source contract is optional. With no declaration, the host’s default `data` binding supplies exact field names. One declared source is selected automatically. Several declared sources require `use orders` before charts or calculations. This is a source catalog, not a join engine. The inspected workspace takes one source array. [R4, B1]

```text
source orders=salesRows
revenue:num=Revenue label="Revenue ($)"
cost:num=Cost
channel:cat=Channel
date:date="Order Date"
returned:bool=Returned
```

`revenue` is the authoring alias. `Revenue` is the exact native field name. The label is display text, never a binding target. The mapping does not rename the host’s input rows. Native display metadata is emitted under `fieldSettings.Revenue`. [R5]

The short types are `num`, `cat`, `date`, and `bool`. The long forms `numeric`, `categorical`, `datetime`, and `boolean` remain accepted. The date abbreviation names the existing datetime category; it does not create a new storage type.

When source, alias, and native names already match, omit repetition:

```text
source data
Revenue:num
Cost:num
Channel:cat
```

**An annotation checks; it does not convert.** `:num` checks the supplied source profile. Explicit `coerce=num` requests the native numeric type override. This distinction matters for numeric strings and failed conversions. Without a supplied catalog, binding and source-type checks remain deferred. [R5, B1]

```text
revenue=Revenue coerce=num
+ label="Revenue ($)" format=currency currency=USD
```

Declarations stay flat. A source’s field records end at the next source, `use`, calculation, chart, or edit. A following `+` belongs to the preceding declaration, not to whichever source happens to be selected. Prefer simple formula-compatible aliases; use exact bracket references in formulas for unusual raw names.

<!-- PAGE -->

## 3. Calculations are named values

A calculation is one definition, reused by any chart or filter in the workspace. Its result name is its identity; a display label can change independently. A formula consumes the remainder of its declaration line. Optional display metadata uses `+` pairs.

```text
calc profit=revenue-cost
+ label="Profit ($)" format=currency currency=USD

calc rate=revenue==0 ? null : profit/revenue
+ label="Margin" format=percent precision=1

calc segment=profit<0 ? "Loss" : "Profit"
scatter x=revenue y=profit color=segment
```

The rate is a fraction. Percent formatting changes its display, not its numerical value. The conditional avoids dividing by zero; it does not silently replace missing or invalid inputs with zero. The pinned calculator reports failures such as missing numeric values and division by zero. Actual row evaluation is still a separate validation step. [R2, R3]

**Dependencies, not declaration order.** Forward references are accepted. The checker resolves the dependency graph, rejects cycles and source-name collisions, and emits calculations in dependency order. Native definitions use `resultColumnName` and expression text; no AST is stored in saved settings. [R1, R2, R4]

```text
calc rate=profit/revenue
calc profit=revenue-cost
```

Bare identifiers bind authoring aliases. `"revenue"` is literal text; `["Revenue"]` is an exact native field reference. Alias expansion walks parsed field nodes, never replaces matching substrings inside strings or function names. Thus the native expression for profit is `(["Revenue"] - ["Cost"])`.

`calc profit:num=...` adds an optional result-type assertion. It does not coerce the formula. `calc "Net profit"=revenue-cost` preserves an unusual native result name exactly; refer to it later with `["Net profit"]`.

**Do not turn a line-length preference into formula grammar.** The formatter leaves complete calculation bodies intact. For a genuinely long formula, introduce a meaningful intermediate calculation, not arbitrary line-continuation syntax. Short formulas may remain unspaced; human-facing formatting can retain spaces around operators.

<!-- PAGE -->

## 4. Functions, conditions, and analytical scope

Use the native operators: arithmetic, comparisons, Boolean operators, and conditionals. Both the ternary and `if … then … else …` forms are recognized. Brackets quote native field references; they are not array indexing. [R1]

```text
calc keep=revenue>100 || channel=="Web"
calc adjusted=if returned then 0 else revenue
calc average=avg(revenue,cost)
calc month=formatDate(["Order Date"],"%Y-%m")
```

The inspected function registry supplies `sum`, `avg`, `min`, `max`, `count`, `formatDate`, and `extractDateComponent`; function names are case-insensitive. Their arity is checked. Unknown functions are errors, not plug-ins fetched from elsewhere. [R3]

| Expression | Scope and meaning |
| --- | --- |
| `calc profit=revenue-cost` | One result per source row. |
| `calc average=avg(revenue,cost)` | Average the two arguments within each row. |
| `calc n=count(revenue,cost)` | Count supplied arguments, not records. |
| `metric @total sum=profit` | Native chart aggregate over its applicable rows. |

**`sum(revenue)` does not sum the dataset.** The checker warns about single-argument row aggregate calls that look like a mistaken dataset aggregate. Totals belong in a metric or an existing grouped aggregate definition, not in an invented formula scope. [R3, R6]

Strict comparisons and cross-field OR belong in explicit Boolean calculations when needed. Then select that result on a chart capable of filtering it:

```text
calc keep=revenue>100 || channel=="Web"
table @selected revenue,channel,keep
+ where.keep=true
```

The calculated field is deliberately present in the table’s columns because this pinned table only applies filters for its columns. Do not hide a generated predicate field or silently attach it to an unrelated chart. [R7]

The expression emitter preserves native precedence with parentheses. In particular, the pinned grammar binds unary negation more tightly than exponentiation: `-2^2` means `(-2)^2`. Write `-(2^2)` for the other meaning. Decimal shorthand and exponent literals are normalized to native-compatible decimal text. No JavaScript evaluation, SQL, environment access, or network calls are part of this language.

<!-- PAGE -->

## 5. Filters stay ordinary pairs

`where` is a property namespace, not a query clause. The field is in the key; the selection is in the value. This keeps filters reorderable, individually editable, and compatible with ordinary `+` wrapping.

| Pair | Selection |
| --- | --- |
| `where.revenue=100..500` | Inclusive numeric interval. |
| `where.revenue=100..` | At least 100. |
| `where.revenue=..500` | At most 500. |
| `where.revenue=100` | Numeric equality: native range 100..100. |
| `where.channel=Web,Store` | Either of two exact category values. |
| `where.channel="Web,Store"` | One literal category containing a comma. |
| `where.cost=null` | Native missing-value selection. |
| `where.product="null"` | Literal text, not missing data. |
| `where.returned=false` | Boolean false. |
| `where.product.contains=Pro` | Native case-insensitive text containment. |
| `where.product.starts=Pro` | Native case-insensitive prefix match. |
| `where.product.ends=Pro` | Native case-insensitive suffix match. |
| `where.product.equals=Pro` | Native case-insensitive text equality. |
| `where.channel=[]` | Select no rows, not “clear.” |

Different fields combine with **AND**. Values within a list combine with **OR**. Missing-value selection includes the pinned engine’s blank/missing behavior. Case-insensitive text `.equals` deliberately differs from exact category selection. [R8]

```text
metric @orders count where.channel=Web,Store
+ where.revenue=100..500 where.returned=false
+ where.date=2026-10-01..2026-10-31
```

Date ranges require a datetime-typed field. A date-only upper bound includes that whole UTC day, following the native engine. Timestamp bounds require an explicit timezone in the proposed authoring rules; impossible dates and reversed ranges fail. [R8]

Ranges never use epsilon approximations for `<` or `>`. Use an explicit Boolean calculation for strict comparisons. Numeric value lists preserve native value identity; they are not numeric-coercion filters. The checker warns when numeric strings might not match numeric list members. Quote punctuation-bearing names with `where["Raw field"]=...`; quote literal wildcard or two-dot text instead of interpreting it as control syntax.

<!-- PAGE -->

## 6. Ownership is the critical filter rule

**A filter belongs to the chart where it is written, and participates in linked workspace filtering. It is not a private SQL WHERE for that chart.** This distinction preserves explorEDA’s model instead of inventing local-only chart populations. [R7–R9, B1]

```text
scatter @profit x=revenue y=profit
+ where.profit=0..
row @channels channel where.channel=Web,Store
```

Both selections participate in the shared result. A native scatter may retain dimmed context for rows failing its own selection. Therefore, drawn points, rows passing other charts, and rows passing every chart are not interchangeable populations. Clearing the scatter’s filter does not clear the row chart’s selection. [R9]

The checker verifies effect, not just object shape. At the pinned ref, support is chart-specific:

| Owner | Supported-subset constraint |
| --- | --- |
| Scatter | Numeric-axis range filters, categorical-axis value filters, and filters on its color field. Other choices can apply globally but misrepresent its own dimming state. |
| Histogram / ordinary bar | A filter on its own field. Do not imply unrelated fields are honored. |
| Row | A value filter on its own field. |
| Table | Filters for fields included in its columns. |
| Metric | The native definition evaluates each of its filters. |

These are inspected adapter constraints, not the desired permanent limits of the language. The production adapter may broaden them only when the renderer and its selection display agree. Unsupported effects fail the checker; exact JSON does not bypass the check. [R6–R9]

Two disjoint linked numeric ranges receive `W_LINKED_EMPTY`: each range may be valid, but their intersection cannot contain a row. An intentionally empty selection remains legal and receives a warning. A pair of independently filtered comparison cohorts requires an explicit population feature or separate workspace, neither of which is silently invented here.

The compact form makes ownership cheap to read: `where.profit=0..` appears beside the owning scatter. Its native array equivalent uses 53 characters including `+`; the new line uses 18, **66.0% fewer** for the same filter. This comparison excludes unchanged chart/source context.

<!-- PAGE -->

## 7. Safe edits without another settings tree

One explicit value per native property or filter field is the rule inside a declaration. Contradictory duplicates fail. A later intentional change names the chart with `edit`; chart IDs and calculation names are separate namespaces.

```text
scatter @p x=revenue y=profit size=3
+ where.profit=0..
row @c channel where.channel=Web

edit p size=4 where.profit=100..500
edit c where.channel=*
```

Editing one field filter replaces that field’s constraint, preserving the chart’s other filters. `where.FIELD=*` is allowed only in an edit and removes that field’s constraint. Quote `"*"` to match literal text. `edit p where=none` explicitly clears all filters owned by `p`. Empty lists still mean no matches. Never use `null` as a deletion command.

Competing edits to the same property fail rather than depending on last-writer wins. A broad all-filter reset conflicts with a competing field-filter edit. `edit` never renames a chart, changes its chart type, or modifies a calculation. To revise a formula, replace its original `calc` definition through a guarded text edit.

**Agent repairs must be transactional.** The CLI adds a SHA-256 digest of the exact source document to checker output. An apply request must match that digest and each edit’s `expectedText`. All ranges are validated before any edit is applied. Overlapping edits, stale text, and ambiguous simultaneous insertions fail.

```json
{
  "range": {
    "start": {"line": 5, "character": 20},
    "end": {"line": 5, "character": 24}
  },
  "expectedText": "cots",
  "newText": "cost"
}
```

The bundled complete repair request includes its actual document digest. Coordinates are zero-based UTF-16 positions with end-exclusive ranges; displayed diagnostic positions are one-based. CRLF and LF inputs are covered by repair tests. The pure `applyEdits` helper validates ranges/text; the CLI owns the SHA-256 precondition. Formatting is a separate operation and therefore creates a new source digest.

<!-- PAGE -->

## 8. The checker is part of the language

An agent should receive structured errors and the resolved meaning of its document, not just “invalid syntax.” The shipped checker returns diagnostic codes, locations, suggestions, related locations, native-name chart patches, calculation definitions, dependency origins, and filter ownership.

```text
E_CALC_FIELD       Unknown formula field cots
E_CALC_CYCLE       loop -> loop
E_FILTER_RANGE    Lower bound exceeds upper bound
E_FILTER_EFFECT   This owner would ignore/misdisplay it
E_CONFLICT        Two explicit values for one target
W_LINKED_EMPTY    Linked numeric ranges cannot overlap
```

Suggestions are advisory. No misspelled field, statistical meaning, function, or chart type is silently repaired. Unknown native settings fail within the supported subset. Missing host metadata is deferred, not passed.

The agent loop is: obtain the source catalog; write one coherent document with explicit IDs; run the checker; inspect resolved calculations and filter owners; repair only reported source ranges; recheck. Run the formatter after the document is semantically stable. Recheck again before handing output to a native compiler.

| Output / command | Use |
| --- | --- |
| `check --json` | Structured result with document digest. |
| `explain --chart ID` | One chart, its property/filter origins, calculations, and diagnostics. |
| `schema` | Supported chart kinds, type names, functions, and filter forms. |
| `apply FILE PATCH.json` | Guarded text edits; prints the result unless `--write` is explicit. |
| `format --width 50` | Wrap whole setting pairs; preserve formula bodies and comments. |

`ok: true` means the supported static subset passed. `productionReady: false` remains explicit. The result does not claim actual row values were evaluated, a full saved workspace was produced, or a browser renderer was exercised. CLI strict mode also blocks unresolved warnings, excluding explicit-edit informational messages.

Before production, require a pinned native schema/default set, complete native validation, data-aware calculation checks, and a representative render check. The final language design separates these gates so that adding syntax does not create a false green light.

<!-- PAGE -->

## 9. Exact settings and the production boundary

Common shorthand lowers to native settings; native paths remain available for the long tail. There is no mandatory `config` level.

```text
scatter @p x=revenue y=profit
+ size=3 opacity=.55 x.scale=symlog
+ margin.left=64 xAxis.grid=true xGridLines=6
```

Literal JSON handles arrays and uncommon object structures. Arrays are complete ordered values; arbitrary index edits do not acquire hidden merge semantics. Bracketed path segments address literal native map keys. Structural type and effect checking remain mandatory.

```text
table @rows
+ columns=[{"id":"r","field":"Revenue","width":180}]
+ filters=[{"type":"range","field":"Revenue","min":100}]
```

Use either `where` pairs or an exact `filters` array on a given chart, including its edit overlays. The prototype rejects mixed representations rather than guessing how a predicate identity should merge with an ordered native array. A complete native import/export adapter can normalize one representation into the other before edits.

**Exact native settings use exact native field names.** `x=revenue` resolves an authoring alias; `xField=Revenue` supplies a native name. The same exactness applies to field names inside literal native arrays. Calculations lower aliases structurally before becoming native expression text.

The complete language contract retains the prior review’s flat workspace settings and generic native-chart escape hatch. Every registered setting must be expressible through native property paths or literal native configuration, even where no shorthand exists. Those root/generic forms are **design requirements, not implemented checker features**. This delivery’s executable chart subset is scatter, histogram/bar, row, table, and metric. [B1]

A production compiler must build a full `SavedDataStructure`: deterministic IDs/defaults/layout, color scales, calculations, field metadata, aggregates, Rows settings, and chart settings. Source bindings remain outside that native structure. Do not spread the review checker’s partial patches into a renderer and call them a completed workspace. Preserve omitted-versus-empty values, native array order, source identity, and pinned defaults through round trips. [R4]

This is an authoring language over explorEDA, not a second calculation engine or a promise of new statistical chart layers.

<!-- PAGE -->

## 10. Validation and handoff

**275 automated tests passed**, including all 152 inherited tests unchanged and 123 new tests. New coverage includes expression parsing/lowering, dependencies and cycles, formula metadata, typed filters, date bounds, literal escaping, ownership checks, filter edits, and guarded source repairs. Strict TypeScript checking passed with TypeScript 5.8.3; tests ran on Node 22.16.0.

**261 emitted expressions were recognized by an independent native grammar check.** The oracle uses the calculation grammar extracted from the supplied `94bfe0b` deployment artifact and that artifact’s Ohm parser. This is syntax evidence, not a proof of native value evaluation. The calculation grammar and runtime contracts at the review’s pinned `226ffae6` ref were separately inspected. [R1–R3, R10]

**15 browser checks passed** for the self-contained playground: examples, dependencies, filters, clickable error ranges, typing, keyboard checking, formatting, reset, and narrow layouts. Views at 1280, 783, and 390 pixels were captured and inspected. Identical HTML bytes ran through `set_content`; direct `file://` navigation was blocked by administrator policy. File-open behavior, clipboard success, actual charts, and production Vite navigation are not certified.

| Gate | Delivered status |
| --- | --- |
| Final syntax and ownership rules | Specified with working examples. |
| Parser, lowering, static subset checker | Implemented and tested. |
| Native emitted formula grammar | Checked against the supplied baseline oracle. |
| Actual calculation values on data | Not evaluated in this delivery. |
| Full native schema/default expansion | Not implemented. |
| Native renderer / repository checks | Not run; no repository writes. |

The executable example is **448 characters**, including whitespace and final newline, with 14 nonblank lines and a 45-character maximum line. It keeps descriptive field names rather than optimizing for cryptic abbreviations. No user study, agent-success-rate study, or model-token benchmark was performed.

**Final recommendation:** freeze this surface syntax. Use ordinary pairs for settings and filters, explicit expressions for calculations, and stable IDs for edits. The next engineering task is native compilation and validation, not another syntax redesign.

The bundle includes source and compiled checker modules, a playground, seven new examples, inherited regression fixtures, review documents, a grammar oracle script, a guarded repair example, and machine-readable evidence. No branch, worktree, commit, push, pull request, or deployment was created.

<!-- PAGE -->

## Source basis and decisions closed

Repository facts are pinned to **`226ffae632239150b54b55e9b346386e5e1e66d4`** unless marked as a baseline oracle. No claim is made that this ref is the latest remote `main`. New syntax, adapter constraints, diagnostics, and ergonomics choices are design work. B1 is the supplied prior review, retained in the bundle.

| Ref | Inspected source / basis |
| --- | --- |
| R1 | `lib/calculations/parser/semantics.ts`: expression grammar, field-reference syntax, and dependencies. |
| R2 | `CalculationState.ts` and `engine/Calculator.ts`: naming/cycles, row evaluation, guarded branches, and numeric failures. |
| R3 | `functions/registry.ts`: row-wise functions, arity, numeric eligibility, and UTC date functions. |
| R4 | `SavedDataStructure.ts` and `ExplorEda.tsx`: saved formula text, workspace settings, and one data array. |
| R5 | `lib/fieldSettings.ts`: display metadata and explicit type conversion. |
| R6 | `MetricCard/definition.ts`: count, sum, average, and filter application. |
| R7 | `DataTable`, `RowChart`, and `BarChart` definitions: chart-specific filter application. |
| R8 | `FilterTypes.ts` and `hooks/applyFilter.ts`: range/value/text/date filters and missing/date-bound semantics. |
| R9 | `ScatterPlot/planScatterPoints.ts`, `scatterAxis.ts`, and `CrossfilterWrapper.ts`: own selection, dimming, and linked populations. |
| R10 | Supplied baseline deployment artifact at `94bfe0b325b9a19100def647e5555766a1f7eb9f`; native grammar oracle. Ohm API documentation explains recognition versus semantics. |
| B1 | Supplied Outline Flat review, especially source binding, exact settings, conflicts, and production boundaries. |

Clickable source links and the exact file paths are in `SOURCES.md`; all relevant new repository reads are through the connected GitHub source tools. Source review is not runtime certification.

| Alternative closed | Why it is not the canonical form |
| --- | --- |
| A trailing `where` query clause | Introduces a parsing mode and makes pair ordering matter. |
| Bare comparison operators on chart settings | Conflicts with assignment and exceeds native range semantics. |
| Positional scatter coordinates | Saves very little while hiding axis-role swaps. |
| Hidden Boolean predicate calculations | Conceals schema changes and filter provenance. |
| Silent last-writer wins | Makes generation and repair order change meaning. |
| Nested source/filter/config blocks | Reintroduces the editing burden this revision removes. |

**One compact representation; explicit analytical meaning; feedback with a source location.**
