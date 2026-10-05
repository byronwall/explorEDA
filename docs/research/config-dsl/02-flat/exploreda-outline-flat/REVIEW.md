# Outline Flat
## Same explicit chart roles. No required indentation.

**explorEDA DSL · Review 02 · 3 October 2026**

**Recommendation:** keep Outline’s named roles, but make a declaration a flat sequence of `key=value` pairs. Use `+` only when a declaration deserves another line. Put an optional expected type and raw-field mapping directly beside the field alias. Native property paths do not need a `config` wrapper.

```text
source orders=salesRows
revenue:num=Revenue label="Revenue ($)"
margin:num=Margin
category:cat=Category

scatter x=revenue y=margin color=category
+ x.scale=symlog size=3 opacity=.55
hist revenue bins=24
row category
table revenue,margin,category
```

This is the proposed everyday form. The source contract is optional. A single declared source is selected automatically; there is no mandatory `sources`, `fields`, or `use` scaffolding. Scatter’s X and Y remain explicit. Single-input charts may omit the redundant `field=`; tables may omit `fields=`.

| Earlier Outline | Outline Flat |
| --- | --- |
| Nest settings under a chart. | Put several pairs on one line. |
| Nest a label and `expect` under each field. | Write `revenue:num=Revenue label="Revenue ($)"`. |
| Enter `config`, then an object, then a property. | Write `margin.left=64` directly. |
| Indentation identifies the owner. | A declaration starts an owner; `+` explicitly continues it. |

**Measured on the same fully specified four-chart dashboard:** 46 nonblank lines become 20; 908 characters become 675; the maximum indentation becomes zero; the longest new line is 46 characters. Both documents produce equivalent JSON-visible source bindings, field metadata, and chart patches in the checker. These are fixture measurements, not a measured “10×” usability improvement.

**Included:** a working Flat front end, 152 passing tests, equivalent examples, machine-readable evidence, and a self-contained editable HTML playground. This remains a review prototype that emits patches, not a production native-settings compiler.

<!-- PAGE -->

## 1. Spend punctuation where it removes work

The larger improvement is not replacing every word with a symbol. It is removing nested structure that the setting names already describe. `x revenue` and `x=revenue` have the same character count. The equals sign makes each pair self-delimiting, so a title, an opacity, and another setting can share a line without special rest-of-line rules.

| Refinement considered | Decision and tradeoff |
| --- | --- |
| `x revenue y margin` | Retain only as the earlier grammar. Lists and free text still need contextual arity or separators. |
| `x:revenue y:margin` | As compact as equals, but competes visually with `revenue:num` type declarations. Not an additional accepted chart spelling in this prototype. |
| `x=revenue y=margin` | Recommend. An equals sign binds a value; a colon annotates a field’s expected type. Their jobs stay distinct. |
| `scatter revenue margin category` | Reject for scatter. A valid positional swap can silently reverse the intended axes. |
| `scatter x=revenue y=margin; opacity=.55` | Reject the extra separator. The equals signs already delimit assignments. |

One limited positional convenience is worthwhile: a chart with one obvious input need not name that input. Both forms below are accepted and equivalent:

```text
hist revenue bins=24
hist field=revenue bins=24

row category
row field=category

table revenue,margin
 table fields=revenue,margin
```

The leading space on the last line changes nothing. It is not a separate indentation mode. For tables, the primary input is one comma-list token, not an arbitrary number of whitespace-separated arguments. A quoted single field or a JSON string array handles names containing spaces or commas.

**Do not shorten the semantic parts.** Keep `color`, `opacity`, `margin.left`, and named statistical methods. Avoid `c`, `o`, numeric category codes, implicit X/Y order, or special sigils for every option. The language should be compact because it repeats less structure, not because its readers memorize more abbreviations.

There is intentionally one recommended surface syntax, not three competing “equally canonical” modes. The earlier grammar is retained in the bundle for comparison and regression tests, not mixed into a Flat document.

<!-- PAGE -->

## 2. Source contracts become small records

A source declaration names a host-supplied binding. Following field records describe that source until the next declaration boundary. No indentation, `fields` keyword, or closing token is required.

```text
source orders=salesRows label="Order book"
revenue:num=Revenue label="Revenue ($)"
margin:num=Margin label="Margin ($)"
category:cat=Category
order="Order ID"
```

Read `revenue:num=Revenue` as “the local field name revenue expects numeric values and refers to the raw field Revenue.” `label` is display text, never a binding target. The mapping does not rename the host’s rows.

| Part | Meaning |
| --- | --- |
| `source orders=salesRows` | Local source alias `orders`, host binding `salesRows`. No URL fetching. |
| `revenue` | Authoring alias, case-sensitive. |
| `:num` | Optional expected type, checked against supplied source metadata. |
| `=Revenue` | Optional exact raw field name. |
| `label="Revenue ($)"` | Optional native display label. |

The short type names are `num`, `cat`, `date`, and `bool`; the accepted long spellings are `numeric`, `categorical`, `datetime`, and `boolean`. `date` maps to the existing datetime category, not a new date-only representation. This removes `expect` without weakening its meaning. The distinction between checking and conversion is inherited from the original review. [B1, §3]

Omit repeated names rather than inventing shorter punctuation:

```text
source data
Revenue:num
Margin:num
Category:cat
```

`source data` binds the host key `data`. `Revenue:num` uses Revenue as both alias and raw name. An entirely omitted source section uses the host’s default `data` binding and its raw field names.

A long field record can wrap like any other record:

```text
revenue:num=Revenue label="Revenue ($)"
+ format=currency currency=USD precision=0
```

**Type checks never silently convert data.** `revenue=Revenue coerce=num` explicitly requests the native type override. With a type suffix as well, the suffix checks the pre-conversion source profile; chart compatibility uses the effective type. Without a host catalog, existence and inferred-type checks are deferred, not passed.

For several source contracts, declare them before charts and select exactly one with `use orders`. The next `source` closes the preceding contract; `use`, a chart, or an edit closes field declarations. The prototype rejects source changes after charts. A catalog of expected sources is not permission to join data or mix sources within a native workspace. [B1, §§2–3]

<!-- PAGE -->

## 3. Wrap for reading, not for parsing

Every setting can stay on its chart line. When a line becomes uncomfortable, move one or more complete pairs to a line beginning with `+`. Neither extra indentation nor a closing marker is needed.

```text
scatter @margin x=revenue y=margin opacity=.55
```

```text
scatter @margin x=revenue y=margin
+ opacity=.55
```

These forms have the same meaning. Leading spaces or tabs are cosmetic. Blank lines and comments do not end a continuation. A new declaration does. A malformed declaration breaks the continuation chain so that a later `+` cannot accidentally attach to an earlier valid chart.

`@margin` is an optional explicit ID; `id=margin` also works. It is not a field mapping or a title. IDs are optional for a sketch, but agent-maintained documents should keep them. Anonymous preview IDs are position-dependent and cannot be targeted by `edit`.

**A practical default is 50-character wrapping, not 50-character validity.** The formatter wraps at pair boundaries and never cuts a quoted value. A single long title or JSON value may exceed the target. Comment-containing statements are left unchanged rather than having their annotations silently relocated.

Here is the richer comparison fixture’s chart section. It retains all original chart titles, IDs, positions, point settings, margins, and table sort settings:

```text
scatter @margin-view x=revenue y=margin
+ color=category title="Revenue and margin"
+ x.scale=symlog size=3 opacity=.55 at=0,0,6,5
+ margin.top=16 margin.right=24 xGridLines=6

hist @revenue-distribution revenue bins=24
+ title="Revenue distribution" at=6,0,3,5

row @category-counts category
+ title="Orders by category" at=9,0,3,5

table @records order,revenue,margin
+ title="Selected orders" at=0,5,12,5
+ sortBy=Revenue sortDirection=desc
```

There is no advantage in forcing that first chart onto one 169-character line. The point is to stop forcing five short settings onto five separate indented lines. `+` lets the author group related settings, while the formatter offers an automatic alternative. The shipped 50-column comparison remains at or below 46 characters on every line.

<!-- PAGE -->

## 4. Native settings do not need a wrapper

Short names cover the common cases. Every other supported setting uses its exact native property path directly. This removes the most repetitive part of the earlier design.

```text
scatter x=revenue y=margin
+ size=3 opacity=.55 x.scale=symlog
+ margin.left=64 xAxis.grid=true xGridLines=6
```

`size` lowers to `pointSize`; `opacity` to `pointOpacity`; `x.scale` to `xAxis.scaleType`. `margin.left`, `xAxis.grid`, and `xGridLines` are already native paths. There is no hidden object scope and no need to enter a `config` block first.

**Shorthand references bind aliases; exact native properties carry native values.** `x=revenue` resolves the alias to Revenue. `xField=Revenue` uses the raw native name. `xField=revenue` does not silently expand the alias. This deliberately preserves the exact-config boundary from the first review. [B1, §8]

For uncommon object structures, pasted native configuration still works:

```text
scatter @margin
+ config={"xField":"Revenue","yField":"Margin"}
+ margin={"left":64,"right":24}
```

`config` must be a literal JSON object. Its properties join the same checked assignment set as direct paths. It does not bypass field, schema-subset, capability, or duplicate checks. Nonempty objects merge by property; arrays are complete ordered values.

```text
table @rows
+ columns=[{"id":"rev","field":"Revenue","width":180}]
+ globalSearch="true" sortBy=Revenue
```

Native filters retain their exact ownership and raw field names:

```text
scatter x=Revenue y=Margin
+ filters=[{"type":"range","field":"Revenue","min":100}]
```

That is a chart filter, not an implicit source query or a Rows search. Root Rows configuration belongs to the workspace target. The prior review documents why those scopes and renderer-specific filter behavior cannot be conflated. [B1, §9]

Quoted bracket segments address literal object keys, for example `seriesSettings["Net revenue"].lineWidth=2`. The parser can represent that path; the current subset checker still rejects unsupported line-chart properties. Arrays are replaced as a whole in this revision—`columns[0].width=180` is rejected rather than given ad hoc index-merge semantics. A full literal array can express the same final settings.

<!-- PAGE -->

## 5. Small grammar, deliberate guardrails

A declaration is a physical line, optionally followed by `+` lines. A pair is a key, an equals sign, and one value. This is not YAML, free-form English, JavaScript, or a query engine.

| Case | Rule |
| --- | --- |
| Spaces around `=` | Accepted: `x=Revenue`, `x = Revenue`. |
| Strings containing spaces | Quote them: `title="Revenue and margin"`. No rest-of-line guessing. |
| Primitive-looking text | Quote `"true"`, `"12"`, and `"null"` when they are text. |
| Lists of fields | `fields=revenue,margin` or `fields=["revenue","margin"]`. |
| A literal comma in a field | Quote one field or use a JSON string array; do not split the quoted name. |
| Layout | `at=0,0,6,5` means X, Y, width, height. JSON tuple syntax also works. |
| Numbers | Finite decimals and exponents; `.55` is allowed outside strict JSON. |
| Comments | `#` followed by whitespace/end-of-line at a token boundary. Quoted text and `#3479a8` are protected. |
| Empty values | `""`, `[]`, `{}`, and `null` are distinct. None means “delete.” |

**One explicit value per native property.** Within a declaration, shorthand and exact paths have equal standing. Two different assignments to the same final path fail. Identical repeats warn. Conflicts inside literal JSON objects also fail; the checker does not inherit JSON.parse’s silent last-key-wins behavior.

```text
scatter x=Revenue y=Margin size=3 pointSize=8
# Error: two explicit values for pointSize.
```

For an intentional later adjustment, name the chart:

```text
scatter @margin x=Revenue y=Margin size=3
edit margin size=8 margin.left=72
```

Edits resolve explicit IDs, including forward references. An edit overrides base declarations and carries origin information. Competing edits to the same path fail; changing an ID or type through an edit is rejected. This is a declarative overlay within the document, not a live mutation of a running workspace.

**A detached pair has no implicit owner.** An unprefixed `opacity=.5` line is an error even when indented. Use `+` for a nearby continuation or `edit margin opacity=.5` elsewhere. This is the small cost of making indentation entirely optional rather than supporting two subtly different ownership rules.

Remove an assignment to inherit a pinned default in the future complete compiler. Do not reinterpret null as removal. Empty facet selection, for example, must remain different from an omitted selection. [B1, §§8–9]

<!-- PAGE -->

## 6. Feedback is part of the authoring experience

The included playground runs the same checker as the command line. It supplies examples, local rechecking, a wrapping control, source-range navigation, normalized native-name patches, and the full structured response for an agent. It does not load data or call a chart runtime.

An agent’s loop is: read the source contract; emit a small document with stable IDs; check it; repair only the reported spans; recheck; inspect the normalized settings. A formatting pass is separate from a semantic change. Suggested field corrections are never applied automatically.

The intentionally invalid Flat fixture produces these diagnostics, among others:

```text
6:19  E_UNKNOWN_FIELD       reveneu -> revenue or Revenue
7:11  E_OPACITY             pointOpacity must be in [0,1]
7:23  E_UNSUPPORTED_SCALE   log is not effective here
8:3   E_UNKNOWN_CONFIG      pointSzie -> pointSize
11:1  E_CONTINUATION        detached opacity has no owner
```

The full captured output is in `evidence/invalid-diagnostics.txt`; messages above are shortened for this page. The `reveneu` diagnostic targets the misspelled value itself. Clicking it in the playground selects that token. The raw-property diagnostic suggests a spelling without accepting an unknown property as an extension.

The front end returns the following categories of evidence:

| Output | Why it matters |
| --- | --- |
| `diagnostics` | Stable codes, severities, source ranges, suggestions, and related locations. |
| `preview` | Resolved binding, field display settings, and native-name chart patches. |
| `origins` | The authoring assignment responsible for each final chart property path, including edits. |
| `validation` | Separate binding status, subset status, patches-only output, identity status, and unrun native runtime. |

Machine ranges are zero-based UTF-16 positions, end-exclusive; displayed CLI positions are one-based. The prototype preserves exact value spans for ordinary field errors and assignment spans for native property errors. Some inherited cross-property checks still highlight a declaration rather than a single value. Per-array-element origins and versioned automatic repair edits remain production work.

**No false green light:** `ok: true` means this supported subset passed, not that a full SavedDataStructure was produced. Missing host metadata remains deferred. The old renderer caveat remains: a property present in a broad native type is not necessarily honored by a specific renderer. The source basis here is the previously inspected contract, not a new remote repository verification. [B1, §§2, 11]

<!-- PAGE -->

## 7. Completeness without more everyday grammar

The compact form should be an authoring layer over native settings, not a competing rendering model. Keep the previous design’s separation of host bindings, native saved settings, and experimental scatter-lab settings. [B1, §§2, 8, 10]

**Production design requirement, not implemented checker syntax:** use a flat workspace declaration for native root settings. There is no reason to reintroduce indentation at this boundary.

```text
workspace gridSettings.columnCount=12
+ gridSettings.rowHeight=76
+ rowsSettings.sortBy=Revenue
+ rowsSettings.sortDirection=desc
```

A complete compiler must provide schema-backed native paths and a literal-config fallback for every registered chart family, even when no concise shorthand exists. A generic native import form can preserve whole settings without inventing bespoke grammar for camera positions, calculations, aggregates, markdown, or series styling:

```text
chart @note type=markdown config={...}
```

The ellipsis is a placeholder, not valid input. Both `workspace` and generic `chart` are intentionally rejected by this prototype. Their inclusion here specifies the next completeness boundary; it is not a claim that the bundled code supports the full native union.

| Keep simple now | Require before production |
| --- | --- |
| Small explicit shorthand dictionary. | Schemas and capability checks generated from or verified against native chart contracts. |
| Native paths and whole-array values. | Full root settings, all registered chart types, calculations, aggregates, and source-reference validation. |
| Source alias resolution in known field roles. | Pinned defaults, color-scale construction, deterministic layout and metadata, and complete output validation. |
| Explicit IDs and declarative edits. | Import/format/compile round trips that preserve values, array order, IDs, and omitted-versus-empty states. |
| No executable configuration. | Resource limits and safe object handling across every extension boundary. |

A source catalog still binds one native workspace to one host array. Multiple source-specific workspaces need explicit ownership in a later grammar, not an implicit source switch halfway through a chart list. The experimental scatter lab remains a separate target: native scatter cannot gain hexbin or confidence-region settings merely because exact JSON can spell those words. [B1, §10]

**Avoid a shorthand arms race.** Do not add range-query expressions, arithmetic on setting values, tuple abbreviations for every object, implicit joins, macros, reusable inheritance blocks, or clever punctuation for filter logic during this ergonomics pass. They would make “compact” harder to validate and harder to repair. Exact native values cover the long tail while the common authoring surface stays small.

**Source basis [B1]:** supplied prior DSL review, §§2–3 and §§8–11, retained in `reference/previous-review.md`. Its pinned repository ref is `226ffae632239150b54b55e9b346386e5e1e66d4`; no fresh repository review occurred. Flat syntax and evidence are new work. The repository was not modified.

<!-- PAGE -->

## 8. Evidence, limits, and the next decision

### Matched document comparison

Counts include whitespace and the final newline. Nonblank lines include the version header and source declarations. The new fixture retains the same information; it does not gain an apparent improvement by dropping IDs, titles, metadata, or layout.

| Measure | Earlier Outline → Flat |
| --- | --- |
| Characters | 908 → 675; 25.7% fewer. |
| Nonblank lines | 46 → 20; 56.5% fewer. |
| Total lines | 50 → 24. |
| Maximum indentation | 8 spaces → 0. |
| Longest physical line | 41 → 46 characters. |
| Normalized JSON-visible preview | Equivalent source binding, source label, field settings, and four chart patches. |

A deliberately unwrapped edition uses 655 characters and 12 lines, but its longest line is 169 characters. Saving another 20 characters is not worth making that form the default. The measured result favors compact records with optional wrapping, not absolute minimum line count. No model-token benchmark or human usability study was performed.

### What actually ran

**152 tests passed:** 100 new tests and 52 preserved earlier-checker tests. They cover equivalence, cosmetic indentation, source types, shorthand, exact config, conflicts, edits, recovery, unsafe input, and formatter idempotence. Strict TypeScript 5.8.3 checking passed; tests used Node 22.16.0. These are standalone review checks, not repository validation gates.

**13 browser checks passed:** examples, wrapping, clickable diagnostics, live input, keyboard checking, reset, machine output, and narrow layouts. Views at 1280, 783, and 390 pixels were inspected. Identical HTML bytes ran through `set_content`; managed-browser policy blocked `file://` navigation. Native charts and clipboard success were not certified.

The executable subset supports scatter, hist, bar, row, table, and metric. Full schemas, defaults, color scales, native rendering, round trips, workspace declarations, other chart families, and array-index edits remain unimplemented. The included catalog describes fixture metadata, not actual rows.

### Decision to carry forward

Adopt **Outline Flat** as the preferred surface syntax: equals-delimited pairs, inline expected types, direct native paths, optional `+` wrapping, and explicit X/Y roles. Keep unary-chart primary inputs as a small convenience. Freeze these rules before expanding capability.

Next, author and repair real saved workspaces against pinned native schemas. Compare task completion and review errors with the prior Outline; keep this prototype as a regression fixture.
