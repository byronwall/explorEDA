# Notebook definition navigation — design report

**Decision:** build a compiler-backed definition inspector with small inline entry points, explicit source jumps and Return, direct and transitive consumer lists, and a searchable outline in the same temporary surface. Keep the notebook as the primary reading surface. An all-notebook graph is an optional later exploration, not a prerequisite.

**Baseline:** `byronwall/explorEDA`, `d3920a285f3755a8324998775deb131747e959f5`.

**Research date:** November 1, 2026, America/Indianapolis. Execution logs may use November 2 UTC.

**Status:** completed Design mission. All 26 complete supplied baseline files were read. Exact-ref supplemental source was obtained where composition and calculation validation required it. The feature was not implemented. Source findings, executed checks, independently derived fixture values and proposed behavior are identified separately below.

## 1. What to build

The reader should be able to answer three questions without interpreting saved settings or opening a separate development environment:

1. **Where does this plotted field or finding come from?** Open Definitions from the chart header, activate a definition name in a Defines row, or activate a standalone finding value. The inspector shows the current input, its formula or alias, its source location and its immediate inputs.
2. **What uses this definition?** Switch to Used by. Direct consumers appear first. Expand downstream consumers to see the actual intermediate path. Group composition details under their output, but preserve definition-level precision.
3. **How do I get back?** Go to source is an explicit action. A successful jump creates a Return entry that restores the logical reading location and focus, including across sheets and layout changes.

The proposed bundle is deliberately small:

| Surface | Chosen behavior |
|---|---|
| Chart header | A Definitions action with an accessible name such as “Definitions for Net in West.” It does not change plot clicks, brushing, Alt-click tracing or settings. |
| Defines row | Clickable names for aliases, calculations and findings in both definition-only and mixed blocks. |
| Prose finding | A definition action on a standalone live value. Existing records links keep their records behavior. Finding values already inside links remain noninteractive spans. |
| Focused inspector | One temporary surface, with **Uses** and **Used by**, a compact source excerpt, source state and Go to source. A secondary **Notebook** view is its searchable outline. |
| Source destination | A read-only source reveal at the definition by default; an explicit Edit source action when the host permits source editing. |
| Return | A visible notebook control after a successful jump. Inspector exploration alone does not move the document or add return history. |

Use the existing compact control scale and panel primitives. The inspector floats rather than resizing the notebook. Its ordinary and expanded widths are proposed as 360 and at most 640 CSS pixels; on a 390-pixel screen it becomes a full-width protected sheet. The exact layouts are design specifications, not browser measurements.

**Ship this capability.** Byron's request is the demand. There is no external adoption gate, prerequisite usability pilot or dependency on live-findings research PR507. Optional later evaluation can refine the graph view or density after useful navigation is available. Recommendations have stable `NDN-` IDs in [recommendations.md](recommendations.md).

## 2. What the baseline actually provides

Repository references below are to the supplied baseline, never to moving `main`. The source appendix gives every supplied file; the following findings are the ones that affect the decision.

### Shared compilation is already present

`compileNotebook` blanks prose while leaving EDA lines in their original positions, compiles the remaining file together, and assigns compiled declarations back to blocks. Definitions are global across the notebook; a sheet is a reading partition, not a namespace. The supplied test `shares definitions across blocks in any order` establishes forward use as intended existing behavior. A chart's declaration can precede its calculation or alias. [B1, B2, B3]

`NotebookBlockResult` exposes calculation, alias and finding **names**, chart ids/lines, diagnostics and `ok | invalid | frozen`. It does not expose resolved input occurrences, declaration identity, source-version provenance, reverse consumers or a navigation graph. A name in those arrays is not proof that a usable definition survived every compiler validation step. [B1]

### Existing navigation and source behavior have precise limits

| Verified baseline fact | Consequence for this feature |
|---|---|
| `NotebookBlockView` displays plain Defines text only when a block has no charts, no diagnostics and no open editor. Its early-return wrapper lacks a definition target. | Add actual targets and actions to definition-only and mixed blocks; changing only the text label is insufficient. |
| `lastValid` is keyed by numeric block index. | An inserted, deleted or reordered fence can associate old source with another block. Navigation and fallback identity must migrate together. |
| Stand-in text is appended after the real file during compilation. | Its synthetic compiled line cannot be used as an editable file line. Preserve a saved snippet origin and a separate current recovery target. |
| A stand-in is recompiled with current rows and other effective definitions. | “Last valid” describes source, not a historical value snapshot. |
| Anonymous chart ids use block position and within-block count. | They are helpful within a restricted edit pattern, not durable identities across structural edits. |
| Only the active sheet is mounted. A controlled `sheet` changes only after the host updates it. | A jump must await the prop acknowledgment and actual target registration before scrolling or focusing. A detached DOM reference cannot implement Return. |
| `notebookSections` trims and joins prose strings and places text beside figures. | Preserve source slices and occurrences through this transformation; matching rendered text afterward is unreliable. |
| Section `##` ids are plain slugs; duplicate headings are not disambiguated. Sheet ids are deduplicated slugs, but change on rename/reorder of duplicate titles. | Internal identity must be separate from title and host-facing sheet id. |
| `NotebookSourceEditor` debounces for 300 ms and flushes on unmount. | Explicitly flush and acknowledge a draft before navigation; unmounting first can apply text against a moved segment. |
| Without `onTextChange`, chart changes can remain on screen while source stays unchanged. | “Source read-only” does not mean noninteractive charts. The inspector must use current accepted chart settings or clearly state a source/current difference. |
| Markdown finding substitution runs over text tokens and can occur in a link label. | Reuse that token pipeline and never create nested links/buttons. Code, escaped braces and link destinations retain literal behavior. |

Evidence: `ExplorEdaNotebook` / `useNotebookResult`, `NotebookColumn`, `notebookSections`, `NotebookBlockView`; `NotebookSourceEditor`; `NotebookProse`; `writeBackSettings` / `declarationFor`; and the supplied controlled-sheet, source-edit and finding-focus tests. [B1, B4–B9]

### Compiler truth must win over convenient summaries

The compiler already has much of the semantic information needed. It collects aliases and calculation names, rewrites bare aliases, parses expressions, reads canonical dependencies, rejects cycles, resolves chart fields and filters, lowers findings and validates saved settings. The new work is retaining that information with provenance and exposing it consistently. [B10–B14]

Two baseline discrepancies need exact treatment:

- **Duplicate calculations:** the diagnostic says the first is used, but `skippedCalcs` receives the duplicated name and the final calculation filter removes both declarations. Dependents are also skipped. `compileNotebook` adds a similarly misleading first-definition warning. The existing test asserts diagnostics and statuses, not final calculations. Navigation must show no effective provider; correct the message and add the missing settings assertion in the supporting milestone. This mission does not propose a new first-wins language rule. [B1, B2, B10]
- **Bracketed aliases:** `rewriteFormula` leaves `["field"]` untouched. Bare `revenue` can resolve through `revenue:num=Revenue`; `["revenue"]` is an exact field reference and does not use that alias. With no actual `revenue` field, manager validation reports `Unknown field: revenue`. The compiler's manager-validation catch clears the calculation list. Retain unresolved attempts, but do not manufacture a successful alias route. [B10, B13, S2]

Likewise, charts listed in build summaries may be absent from final `settings.charts` after saved-data validation. Settings can roll back to defaults, and composition lowerers can drop individual invalid parts. Commit effective references only after the relevant acceptance step. [B10, S1, S3]

## 3. Primary-source comparison and interaction choice

These are current primary documents accessed for this mission. Product documentation describes capabilities, not measured usability in explorEDA. The research comparison separates old Observable precedent from the current product and distinguishes JupyterLab from its LSP extension.

| Source | Supported observation and design implication |
|---|---|
| [Observable Framework: Reactivity](https://observablehq.github.io/framework/reactivity) | References determine evaluation order independently of page order. Borrow the separation of reading order and dependency order, which explorEDA already supports; keep its constrained DSL and current evaluation model. |
| [Observable classic Minimap](https://observablehq.github.io/documentation/debugging/minimap) | The legacy minimap focuses direct connections and permits following transitive relationships. Its documentation explicitly identifies itself as old. Use it as a historical interaction precedent, not proof that this exact UI exists in Observable 2.0. |
| [Observable 2.0 system guide](https://observablehq.github.io/notebook-kit/system-guide) and [Notebook Kit](https://observablehq.github.io/notebook-kit/kit) | Current notebooks support cross-cell variables; the file format offers optional cell ids for stable editing. The useful distinction here is persistent cell identity versus source order, not adoption of Observable's runtime or HTML format. |
| [JupyterLab table of contents](https://jupyterlab.readthedocs.io/en/stable/user/toc.html) | Headings form clickable document navigation. This is a good reading outline but cannot alone answer which calculations feed a chart or which outputs consume a definition. |
| [JupyterLab URLs](https://jupyterlab.readthedocs.io/en/stable/user/urls.html) and [nbformat cell ids](https://nbformat.readthedocs.io/en/latest/format_description.html#cell-ids) | JupyterLab documents duplicate-heading ambiguity and experimental cell-id URL fragments. nbformat separately standardizes per-notebook cell ids. Do not confuse a locator format with an identity guarantee. |
| [JupyterLab LSP support](https://jupyterlab.readthedocs.io/en/stable/user/lsp.html) and [jupyterlab-lsp](https://github.com/jupyter-lsp/jupyterlab-lsp/blob/main/README.md) | The extension supplies definition/reference jumps and a jump-back command. Borrow an explicit return affordance; a language-server service is unnecessary for this local DSL. |
| [marimo: Understanding dataflow](https://docs.marimo.io/guides/editor_features/dataflow/) | A searchable variables explorer complements a focused minimap and optional graph. Its documentation notes that cell-level connections can include all variables defined by a cell. explorEDA should retain definition-level edges and group them only for presentation. |
| [Brown, Alhoori and Koop, HILDA 2023](https://faculty.cs.niu.edu/~dakoop/pubs/brown-hilda-dependency.pdf) | The dependency visualization comparison found no significant minimap-versus-DAG difference in time or accuracy. Synthetic tasks and fatigue limit transfer to this reader workflow. This paper does not establish that the chosen inspector beats a graph. |
| [Gather: Managing Messes in Computational Notebooks](https://microsoft.github.io/gather/) | Output-first code exploration is a strong precedent. Gather also preserves historical versions and gathers code that produced outputs. This proposal indexes effective current definitions and captured fallback source; it makes no equivalent execution-history claim. |
| [W3C dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), [focus visibility](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Use real buttons/disclosures, deliberate initial focus, Escape and focus restoration. Protect focus only in a modal sheet. Keep focused targets visible beside sticky controls; compact controls need adequate target size or spacing. |

### Comparison of the four requested options

| Option | Decision and tradeoff |
|---|---|
| Inline links alone | **Build as entry points, insufficient alone.** They make nearby definitions discoverable but cannot comfortably show filter roles, ambiguous source, multiple consumers, saved snippets or return history. Avoid turning every chart label into permanent link chrome. |
| Focused inspector | **Build as the primary relationship surface.** It can explain one definition precisely, show immediate uses and source state, and expand paths without moving the reader. Its temporary overlay fits the repository's existing UI rules. |
| Outline | **Build inside the same surface.** It solves “I know the name” and “show unused definitions” and provides sheet/heading context. A heading-only outline is insufficient; index definitions as well. |
| Whole-notebook graph | **Explore after the core ships.** It could help overview and branch comparison. It also needs layout, grouping, accessible navigation and usable narrow-screen behavior. The initial mission can be satisfied without those additional interactions. This is a design judgment, not a measured superiority claim. |

Authoring conventions such as a Definitions sheet and hand-written links remain useful examples, but they cannot maintain reverse consumers, account for last-valid source, or disambiguate moved definitions automatically. They are documentation aids rather than the capability itself.

## 4. The metadata contract

Expose one additive `NotebookCompileResult.navigation` snapshot. The compiler remains authoritative. A small notebook module holds types and projections; a component hook owns interaction state. There is no service, independent parser, graph database, general scheduler or event-sourced notebook system.

The following TypeScript is a **proposed data contract**, not implemented source. It deliberately distinguishes semantic names, snapshot node ids, source origins and durable locators.

```ts
type Revision = string;
type NodeId = string;       // Unique only in one navigation snapshot.
type BlockKey = string;     // Authored id or mapped session identity.

type TextRange = {
  start: number;            // UTF-16 code units, zero-based, inclusive.
  end: number;              // UTF-16 code units, zero-based, exclusive.
  line: number;             // One-based display/diagnostic coordinate.
  column: number;           // One-based UTF-16 column.
};

type Origin =
  | { kind: "current"; revision: Revision; range: TextRange }
  | {
      kind: "last-valid";
      snapshotId: string;
      blockKey: BlockKey;
      range: TextRange;     // Relative to captured block source.
      recoveryBlockKey?: BlockKey;
    }
  | { kind: "runtime"; chartId: string; settingPath: string }
  | { kind: "input"; field?: string };

type DefinitionState =
  | "active" | "shadowed" | "invalid" | "unresolved" | "partial";

type NavigationNode = {
  id: NodeId;
  kind: "raw-field" | "row-source" | "alias" | "calculation"
    | "finding" | "chart" | "population" | "prose"
    | "composition-part" | "field-contract";
  namespace: string;       // E.g. notebook:calculation, chart:x/scale.
  partKind?: string;       // E.g. scale/measure/unit/mark/label for composition.
  name: string;
  blockKey?: BlockKey;
  origin: Origin;
  state: DefinitionState;
  runtimeId?: string;      // When accepted settings supply one.
};

type ReferenceOccurrence = {
  id: string;
  consumer: NodeId;
  role: string;            // Typed union in implementation, e.g. size-field.
  written: string;
  origin: Origin;
  provider?: NodeId;
  canonicalField?: string;
  viaAlias?: NodeId;
  disposition: "effective" | "ignored" | "attempted";
  issue?: "unknown" | "ambiguous" | "invalid-provider" | "not-indexed";
};

type DependencyEdge = {
  from: NodeId;            // Provider -> consumer everywhere in JSON fixtures.
  to: NodeId;
  kind: "value" | "population" | "presentation" | "render" | "prose-value";
  roles: string[];
  occurrences: string[];   // Keep multiple sites, deduplicate destination counts.
};

type NavigationSnapshot = {
  revision: Revision;
  nodes: NavigationNode[];
  occurrences: ReferenceOccurrence[];
  edges: DependencyEdge[];
  relations: {            // Navigation/membership, never automatic value edges.
    from: NodeId;
    to: NodeId;
    kind: "contains" | "chart-binding" | "records-link" | "configures";
  }[];
  coverage: {
    family: string;
    state: "complete" | "partial";
    reason?: string;
  }[];
};
```

### Information already known versus new extraction

| Already available during compilation | Additional work |
|---|---|
| Declaration families, original spans, end lines and children | Retain source-owned ids and exact item intervals before mutable lowering changes arrays. |
| Global alias map and normalized calculation dependencies | Preserve each authored alias occurrence as well as the canonical field read. |
| Formula AST and dependency traversal | Extend the existing parser/semantics to retain identifier intervals; never tokenize formulas independently. |
| Resolved chart field/filter values and accepted settings | Record the role and occurrence, then discard effective records for rolled-back or rejected settings. |
| Findings' measured field, operands and chart binding | Retain definition locations and typed population relationships. |
| Notebook owner and stand-in ranges | Produce a source map from compiled coordinates to current file or captured block snapshot. |
| Markdown token pass for live finding values/records links | Retain prose occurrences and their interactive context before sections join prose. |
| Typed composition lowerer and retained parts | Add scoped local symbol/reference records and a typed field-use adapter beside it. |

`DslSpan` is insufficient for every selection today: decoded comma-list items have no individual item span. The implementation must add parser-owned offsets, not recover them by searching repeated text. Emoji and other non-BMP text require UTF-16 offsets because textarea selection uses that coordinate system. Normalize CRLF once for parsing and preserve a mapping if the host retains original CRLF text; never mix normalized offsets with an unnormalized editor value. [B11]

**Fixture-to-API mapping:** `expected-graph.json` is a denormalized acceptance oracle, not a value directly assignable to this proposed interface. Its stable symbolic ids identify expected roles; workers project compiler ids by namespace/name/block origin before comparison. Fixture `composition-scale`, `composition-measure`, etc. map to `kind="composition-part"` with `partKind`; its inline occurrence spans map to normalized `ReferenceOccurrence` records and edge occurrence ids. Fixture `source` values map to the appropriate `Origin`, and explicit fence `blockId` maps to the authored form of `BlockKey`. Its primary edge set is the **authored** route, so `Revenue → alias revenue → gross` is correct there; `canonicalCalculationReads` separately requires direct canonical reads of Revenue/Cost by gross. Compare those projections separately, including multiplicity, roles and source ranges.

### Source and current-output projections

Maintain an authored snapshot and an effective output overlay, both using the same definition resolver and typed reference descriptions:

- **Authored references** answer what the accepted source says and where it says it.
- **Current output references** read the accepted DataLayer configuration currently drawn. A changed setting can resolve to a source definition even when that setting has no source occurrence.
- **Last-valid source** is an origin on effective declarations, not a replacement for their current invalid text.
- **Attempted references** support diagnostics and repair navigation. They never become ordinary active edges.

Do not rebuild structural dependency metadata for every hover or row-value change. Recompute the live overlay when relevant field/filter/configuration references change. Selection changes can update population scope labels and finding values without reparsing notebook source. This is a performance design, not a measured runtime bound.

If an external/custom chart has no supported typed adapter, show “Some inputs are unavailable” with its known inputs. Do not label an empty extraction “No dependencies” or label a definition unused when an unindexed family could consume it. Add typed adapters next to existing chart/compiler knowledge rather than scanning arbitrary strings or guessing from `*Field` property names.

## 5. Exact name resolution and edge rules

### Raw fields, aliases and calculations

1. **Raw fields** come from the actual source-field inventory used by compilation. A raw field has an input origin and no invented notebook definition. The inspector can show its metadata and any source contract lines. An empty input with no field inventory does not prove that an unknown mentioned name is a real field. [B10]
2. **Aliases** target raw fields only. Alias-to-alias and alias-to-calculation chains are unsupported. The last valid alias declaration replaces an earlier valid alias with a warning; an invalid later alias does not erase an earlier valid binding. Keep shadowed occurrences available in the outline, with no active bare-name consumers assigned to them. [B10]
3. **Alias/raw collisions** follow current resolver precedence. A valid alias can shadow a raw spelling for ordinary `resolveField` sites. Calculation declarations cannot reuse a raw or alias name. Never invent a uniform “all namespaces are ambiguous” rule. [B10]
4. **Formula spellings** preserve language semantics. Bare aliases normalize; bracket field references are exact. Strings and function names are not field reads. `if … then … else …` records possible reads from both branches even if a selected row takes one branch. [B10, B13, B14]
5. **Chained calculations** bind across blocks and sheets, regardless of reading order. Retain canonical dependencies from the existing expression result. Do not persist random expression UUIDs as source identities. [B1, B10, B13]
6. **Duplicate/cyclic/failed calculations** have no effective provider if the final calculation settings exclude them. Preserve their authored occurrences with status and diagnostics. The duplicate-calculation diagnostic discrepancy is specifically covered by acceptance cases. [B10, S2]
7. **Unused** is a derived display state, not an error. It means zero effective consumers within complete indexed coverage. Definitions can be used by another definition, a filter, a composition part or prose even if their own block draws no chart.

For the example, the canonical read is `gross` reading `Revenue` and `Cost`. The authored path retains `revenue` as an alias between `Revenue` and `gross`. A composition using raw `Revenue` is not a direct consumer of the alias merely because both end at the same canonical field.

### Field contracts and configuration

`field Name …` configures an exact raw or successful calculated field; it does not introduce a new calculation or accept alias spelling as a general target. Alias `:num` is an expectation; `as=num` is a conversion. Both can carry settings attached to the canonical field. [B10]

Show these sites under **Field settings** with `configures` relations. Their accepted parsing/conversion settings apply to canonical readers, including readers that did not spell the alias. A field contract's Used by projection therefore follows readers of that canonical field, with a “Field settings” role. Keep that projection distinct from consumers of the alias name. Presentation-only settings can be labelled separately from value preparation. This prevents a bare-name dependency graph from claiming that an alias conversion affects only its lexical uses, or that a label change necessarily changes numeric results.

### Chart fields, filters and inferred inputs

Record every supported accepted input role: measure/grouping fields, X/Y and other axes, color, size, series, facets, table columns, ordering, local filters, authored selections and referenced aggregation/configuration inputs. A local `where.` field counts even when absent from the visible axes. `select.` is selection ownership, not the same thing as a local population restriction. A failed `where.` must not appear as a harmless ignored field while the chart is widened. Optional settings that roll back produce attempted/ignored occurrences, not active edges. [B10]

For an omitted table column list, the accepted table can use inferred columns. Represent those references as generated/inferred, located at the declaration for context, with no fabricated token position. A count consumes a row population, not an imaginary measure field named `count`, `*` or `__ID`. The compiler's real synthetic `__ID` has meaning only at supported field sites; do not introduce it merely to explain counts.

### Chart-bound findings require population endpoints

This is an essential correctness rule, not an optional diagram refinement. A finding bound with `chart=@net-total` reads the chart's eligible rows, optionally its own selection, then the finding's additional filters. Its reducer uses the finding's field. It never reads the chart's aggregate value. [B5, S7, S8]

Use separate logical population endpoints:

- `population:net-total:eligible`: provided rows after workspace and chart-local filters.
- `population:net-total:selected`: eligible rows after that chart's own selection.
- A chart-bound finding with `population=eligible` reads the first.
- A default chart-bound finding reads the second.
- An unbound finding reads the input population plus its own filters; workspace filters and other chart selections do not silently become dependencies.

`chart -> finding` remains a navigation binding so readers can visit the chart, but it is not a value-dependency edge. In the delivered fixture, the metric independently reads `net` and its population; the finding independently reads `net` and the selected population. Change the metric to `sum(gross)`: the chart's independently expected value becomes **250**, while the finding remains **125**. An untyped chart-to-finding edge would falsely make the finding depend on the chart's measure.

Workspace filter sources feed eligible populations; local filters feed their owning population; actual selection field references feed selected populations. Preserve these roles rather than flattening all inputs into an undifferentiated list. The parent chart's title or display format does not become a numeric input to its bound finding.

Metric findings and comparison findings keep existing validation. Comparisons can reference supported metric findings defined later, but do not acquire arbitrary nested comparison evaluation. Duplicate findings retain the first accepted binding and reject the later one. Findings, charts and calculations occupy distinct semantic namespaces. [B10, B5]

### Prose references

Reuse `NotebookProse`'s Markdown token pass. A `{{west-net}}` value and a `#finding:west-net` records link are distinct occurrences. The value is a displayed-value dependency; the records link is a navigation reference. For the example paragraph, Used by counts one displayed paragraph, while References can reveal both sites.

Do not scan rendered HTML or raw prose with a second broad regular expression. Code spans/fences, escaped braces and link destinations retain the existing exclusions. Ordinary external links keep their behavior. A value in a link label must not become a nested button. Missing finding references open an unavailable-definition explanation with the authored occurrence, not a guessed similar name. [B6]

### Composition

Exact-ref supplemental source confirms a separate local model: scales, aggregate measures, units, marks and insets. `resolveRef` uses an id first, then a unique appropriate label/name; marks and insets are scoped to a unit. A point's `x=` names a local scale, not a global field. `lowerComposition` does not receive the notebook alias resolver; copied field spellings must be interpreted according to its actual runtime schema. [S1, S3, S4]

Instrument that existing lowerer and its retained-part validation. Include typed field roles for scales, local measures and order fields, repeats/windows, mark value/size/color/category/series/ordering fields and supported filter-bearing parts. Include local references such as marks to scales, labels to measures, guides/legends to their referenced parts and coordinate-space references. A constant size or a title containing a calculation name has no field edge.

Keep chart membership separate from dependencies. An unused local measure does not affect every mark just because the chart contains it. Only retained visible parts contribute render edges to the output. Group local parts under the chart in the UI; preserve the actual paths for expansion and output deduplication.

Generated part ids and anonymous nested labels are revision-local. In particular, a nested `label @net-label` parses a name but the baseline lowerer discards it; the delivered fixture intentionally uses `label value=net-measure` and addresses it as an occurrence under unit `orders`. Do not promise an identity the stored model does not keep. [S1, S3]

## 6. Source identity and Return

### The smallest honest persistent contract

Add optional `id=` metadata to EDA fence information:

````markdown
```eda id=net
calc net = gross * 0.5
```
````

The baseline recognizes such a fence but discards the extra information. Capturing it is proposed behavior. Use a documented grammar such as `[A-Za-z][A-Za-z0-9_-]{0,63}`. Require uniqueness within one logical notebook. A duplicate id makes **both** occurrences ineligible for stable matching; give them distinct revision-local keys and a navigation diagnostic. Do not silently suffix authored ids or reject otherwise valid analytical output just because navigation metadata conflicts.

No automatic file-wide id insertion is required. Unannotated notebooks still work:

- In a session, retain an opaque block key through a known accepted segment/writeback transaction that preserves that block.
- For arbitrary whole-text replacement, reuse an unannotated key only when old and new block text match uniquely. Check both directions; identical duplicates are not unique.
- When a transaction splits/merges fences or an external change cannot be mapped, allocate new keys and invalidate the affected return/fallback associations.
- Never repair ambiguity with ordinal, nearest line, fuzzy text similarity or the first matching name.

Definition names remain semantic lookup keys. A locator can combine a stable block key with kind/name when unique. A known edit transaction may remap a renamed declaration. An arbitrary external rename preserves an explicitly identified block but leaves the old declaration locator unavailable unless an exact mapping is known. Do not silently follow another definition with the old name elsewhere.

This is smaller than persistent ids for every formula AST node or source token. It provides dependable block continuity where the author opts in, precise current-revision locations everywhere, and honest failure where history cannot be inferred.

### One coordinated memory API

Replace ordinal fallback memory once, in the same milestone as cross-edit navigation:

```ts
const memory = useRef(createNotebookMemory("project/orders.eda.md"));

<ExplorEdaNotebook
  text={text}
  data={rows}
  memory={memory}
  onTextChange={setText}
/>
```

`NotebookMemory` owns the logical document key, mapped block identities and captured last-valid sources. The component's navigation controller uses the same map. Without a host memory ref, identity is mount-local. A host that remounts the same logical document retains the ref; a host opening another document creates/reset its memory. A changed document key clears return history, pending movement and fallback associations.

Update all actual `lastValid` callers in one local client/server version. There is no long-lived adapter or speculative compatibility layer. This is a proposed public API change and needs the appropriate 0.x minor changeset under repository rules. The worker must search the complete checkout for call sites; the packet is not an exhaustive list of consumers. [B4, B15]

### Source ranges are observations, not identities

Each range belongs to an accepted revision. A current-file range selects current text only after that revision is confirmed. A last-valid range belongs to captured block text and opens a read-only excerpt labelled **Last working source · current data**. A separate **Open current source** action can go to the mapped invalid block for repair. It must never select an appended stand-in line in the current editor.

Named chart ids are useful anchors when uniquely accepted. Anonymous chart ids, anonymous composition parts, individual prose occurrences and duplicate headings require mapped session identity or current-revision scope. Multiple notebook instances prefix DOM ids so identical document titles cannot collide.

Sheets continue to use the existing host-facing slug contract. Before any movement, derive the target's current sheet from the current parsed source. Internal sheet and heading occurrence keys remain separate from slugs and titles. Duplicate headings have separate targets and breadcrumbs, such as “Definitions / Summary / second occurrence”; no new heading syntax is necessary.

### Navigation transaction

1. **Preview:** capture a provisional origin (document, logical output/prose anchor, current sheet/section, focus action and offset within the actual scroll container). Open the inspector without moving the document. Do not push history.
2. **Resolve:** Go to source or Edit source flushes a mounted source editor's pending draft without first unmounting it. If it emits text, wait for accepted host props. Recompile and resolve the destination again. A transformed revision must be remapped reliably; otherwise cancel movement while preserving the draft and preview.
3. **Switch:** if the destination is on another sheet, request its current host id once. An uncontrolled notebook can select it internally. A controlled notebook waits for `sheet` acknowledgment and actual target mounting. No arbitrary timeout or local override performs the jump.
4. **Commit:** after the target exists, add the origin to history and suppress the inspector's normal close-to-invoker autofocus for this successful jump. Dismiss it, wait for any focus trap, background inertness and scroll lock to release, then reveal/scroll the target and move focus with `preventScroll`. Read source focuses its heading; explicit Edit source selects the current declaration in the document textarea. Normal Close/Escape still restores the inspector invoker.
5. **Return:** resolve the stored logical origin, repeat any required controlled-sheet acknowledgment, restore its relative visible position and then focus its action. Resize or sections/column changes do not convert the old absolute `scrollY` into identity.

A pending request has a request id and revision; the latest request supersedes earlier ones. Cancel on document switch, target removal or ambiguous mapping. A controlled host with no change callback can still provide the source peek; the cross-sheet action explains that the host must open that sheet. An ignored request leaves the origin and history unchanged and offers Cancel.

If a return target was deleted, prefer a **known surviving** parent output/paragraph, then a known section, then the current version of its sheet, then notebook start. Announce the fallback, for example “The original chart was removed; returned to Results.” Never focus the block that inherited its old index. Keep a small bounded session return stack, proposed maximum 20 successful jumps, with no persisted browser-history integration. Escape dismisses the active surface; it does not silently perform Return. Do not intercept browser Alt+Left.

## 7. Invalid, partial and last-valid states

Treat state as orthogonal to source location and connectivity:

| State | Reader-facing result |
|---|---|
| Valid current definition | Current excerpt, normal Uses/Used by, source jump. |
| Unused valid definition | “No active consumers” only when coverage is complete; still searchable and source-accessible. |
| Shadowed alias | Show its declaration and the active replacement; assign active bare-name uses to the actual winner. |
| Invalid definition with no stand-in | Current diagnostic and attempted references, no effective provider or ordinary value edge. |
| Current invalid text with stand-in | Show the captured effective definition and separate repair location; last working source is evaluated with current data. |
| Partially retained composition | Show accepted parts and unresolved/dropped source separately; structural acceptance does not prove every field binding exists. |
| Current chart edited without writeback | Current input references resolve accurately; show the authored setting separately and mark the setting's source as changed on this page. |
| Removed/ambiguous target | Explain unavailability and keep a useful preview or known fallback. |

The fallback compiler is a finite sequence of existing compilations, not a historical execution log. A lexical/structural error can be identified before global compilation and replaced first. A semantic formula error can also cause its consumers to fail in the first pass; if those consumers have remembered source, more than the originally edited block may stand in. The fixtures distinguish “only the net block has fallback” from “all blocks have fallback.” Metadata follows the actual accepted source origins rather than asserting that exactly one block must freeze. [B1]

Do not turn these supporting corrections into a separate robustness mission. They are necessary to avoid plausible but false definition links in the new user-facing capability.

## 8. Responsive and keyboard contract

The original mockups are static design assets. They are not screenshots of implemented behavior. Layout choices use notebook/container width for sections, and available viewport bounds for overlays.

| Test width | Proposed layout |
|---|---|
| **1280 px** | Existing sections layout only when notebook container width is at least 960 and source editing is absent. A 360px temporary inspector overlays the right edge; expanded width is at most 640px. Opening it does not resize figures. If it would obscure the invoking content, anchor beside it or choose the available side. |
| **783 px** | Reading column. A 360px inspector stays within 16px viewport gutters and bounded height; the chart remains partly visible. Single overlay ownership, independent list/code scrolling, no page-level horizontal overflow. |
| **390 px** | Full-width sheet with header/actions kept visible, scrollable contents and protected focus. Background scroll is locked. Dismissal restores the invoking action. Long code scrolls within its own region. |

The inspector title/actions precede supporting text. Use 32px controls normally and 28px compact controls, semantic border/focus tokens, accessible names and existing tooltip primitives. Expanded size shows additional paths/source context rather than empty space. Touch-visible chart actions must not overlap titles. A source link is not an Inspect button, and existing plot gestures remain unchanged. [B16, B17]

Keyboard acceptance:

- Native buttons activate on Enter and Space; ordinary links keep their normal link semantics. No positive tab index.
- Uses/Used by use an existing accessible tab/segmented-control pattern with a single line, or ordinary labelled buttons; do not invent a partial ARIA tab pattern.
- Indirect-consumer disclosure exposes `aria-expanded`. Consumer lists are ordinary lists of actions, not an ARIA tree requiring unimplemented tree navigation.
- Desktop nonmodal inspection permits focus to leave; Escape closes the innermost temporary surface and restores its invoker when appropriate.
- The narrow modal sheet contains focus, has a visible close action, closes with Escape and restores focus. Nested editor Escape has priority; no hover tooltip consumes it.
- Edit source closes the inspector before opening/focusing the document editor. Escape in that editor closes it only after preserving pending text through the same flush/acknowledgment path, and focuses its block's source action. It does not reopen an inspector or silently discard an edit.
- Existing sheet ArrowLeft/ArrowRight/Home/End behavior remains. A pending programmatic sheet request must not focus an unmounted target.
- A successful source jump focuses a visible target below sticky controls. Return restores focus only after the origin is mounted.
- When the original invoker is gone, use the known logical fallback, announce it through a polite status region and do not focus `body` silently.
- Finding value refreshes preserve focus on surrounding links. Opening records and opening a definition remain distinct actions.

No timing or task-completion improvement has been measured. The proposed checks require real keyboard, pointer and touch-equivalent input at all three widths during implementation.

## 9. Exact fixture and expected results

[six-block.eda.md](six-block.eda.md) is the runnable source example and [fixture-data.json](fixture-data.json) provides four rows. The optional fence ids are proposed identity metadata; the baseline parser accepts the fences but does not retain those ids.

| Block | Content and purpose |
|---|---|
| `metric` | `@net-total`, `sum(net)`, local `Region=West`, and finding `@west-net`. It uses net before definition. |
| `revenue` | Alias `revenue:num=Revenue`. |
| `gross` | `gross = revenue - Cost`. |
| `net` | `net = gross * 0.5`. |
| `unused` | `unused = Cost * 2`, with zero active consumers. |
| `composition` | Scales for Revenue/net, local `sum(net)` measure, a label and a point sized by gross. |

The two sheets are Results and Definitions. The first paragraph contains one finding value and one records link. Exact source ranges and source-coordinate conventions are included in [expected-graph.json](expected-graph.json).

Independently calculated values:

| Row | Gross / net / unused |
|---|---|
| Revenue 100, Cost 40, West | 60 / 30 / 80 |
| Revenue 200, Cost 80, East | 120 / 60 / 160 |
| Revenue 150, Cost 60, West | 90 / 45 / 120 |
| Revenue 120, Cost 20, West | 100 / 50 / 40 |

West metric and finding: **125**. Composition's all-row net measure: **185**. Changing the chart measure to gross gives **250**, while the unchanged net finding remains **125**. Changing the first row's Revenue to 110 while using the last-valid net formula gives West net **130** and all-row net **190**; this demonstrates current-data evaluation of old source.

The proposed effective authored graph has **21 nodes and 27 dependency edges**, plus **8 nondependency relations**. These include explicit population and retained-render endpoints. They are fixture contract counts, not counts emitted by the baseline. The consumer query for net is exact:

- **Four direct consumers:** the metric, the finding, the composition net scale and its local net measure.
- **Four additional downstream nodes:** the composition point, label and chart, and the prose paragraph.
- **Three distinct displayed outputs:** Net in West, Comparison and the paragraph. Two paths to Comparison do not make two outputs.

The records link is a separate reference and does not add a second displayed paragraph. The chart-binding relation does not make the finding depend on the chart's aggregate value. The unused definition has no direct or indirect consumers.

[edge-cases.json](edge-cases.json) supplies language/state variants and [navigation-cases.json](navigation-cases.json) supplies the UI/navigation expectations. [acceptance-spec.md](acceptance-spec.md) explains how to turn them into a small set of meaningful tests. None of the proposed navigation cases is represented as a completed browser test.

## 10. Build order and delivery boundaries

The full worker plan is [implementation-plan.md](implementation-plan.md):

1. **M1 — Definition peek:** retain authoritative source/input metadata and let readers inspect ordinary chart fields, filters, aliases and calculations without moving the page.
2. **M2 — Source and Return:** ship keyed identity and last-valid memory together, source reveal/edit selection, cross-sheet acknowledgment and reliable return.
3. **M3 — Consumers:** complete reverse uses, prose findings and scoped composition, including population/value separation and output deduplication.
4. **M4 — Outline:** expose searchable sheet/heading/definition navigation and complete unused/invalid discovery in the same surface.

Every milestone names source modules, necessary tests, a `notebooks.mdx` section and the same runnable example. Responsive and keyboard checks start with M1. M4 is not an accessibility deferral. Retain React, TypeScript and pnpm. No new infrastructure or service is needed.

Value tracing remains a separate action. `CalculationTrace` already explains selected-row calculations and calculation dependents; finding records already explain contributing rows. Definition navigation can link to those existing tools where appropriate but neither replaces nor rebrands them. Live finding research PR507 is not an implementation dependency; the supplied baseline already contains the finding definitions and renderer used by this design. [B5, B7, B14, B18]

## 11. Verification performed and limits

### Actually performed

- Extracted and counted all **26** complete-file sections from the supplied packet; read every file in full across the source review. No baseline source edits were made.
- Read exact-ref supplemental composition lowering/validation, calculation-state validation and population/card behavior required to settle decisive questions.
- Executed unmodified `parseNotebook`, `notebookSheets`, `parseDocument`, `lowerComposition` and `isCompositionDefinition` on the six-block companion using Node 24 with module-path resolution. Result: six blocks, two sheets, zero parse/lowering problems, valid composition structure.
- Executed isolated source-function checks for alias rewriting and unknown-field validation, and parser/lowerer checks for fence metadata and discarded label ids. These isolated checks are not full-compiler tests.
- Independently calculated fixture arithmetic and checked the supplied dependency graph's consistency, source ranges and exact consumer queries. The included verifier checks the fixture contract; it is not a new DSL parser or implementation of the proposed feature.
- Inspected original mockup rendering as design-artifact QA. This does not establish production CSS behavior or accessibility conformance.

### Proposed, not performed

Full `compileNotebook`/`compileDocument` execution with the complete package, React rendering, source-writeback integration, real browser keyboard/pointer flows, accessibility tooling, performance benchmarking and `pnpm check`. The packet is complete for the requested 26-file reading contract, but it is not a complete installed application checkout. No production navigation feature was implemented, no commit/PR was created, and no external deployment or service was used.

See [verification-results.json](verification-results.json) for the exact executed scopes and [verify-fixtures.py](verify-fixtures.py) for the replayable companion checks.

## 12. Access status, sources read and remaining questions

**Access passed.** All 26 requested files were available and read. Exact-ref GitHub access also succeeded for the supplemental code needed to resolve composition and validation behavior. No decisive source remained unavailable for this design. Uninspected full-checkout integration points, such as every public export and host call site, are explicitly worker discovery tasks rather than invented evidence.

### All 26 supplied files

Paths are relative to the repository. `[B#]` references above point to these files/symbols at the pinned commit; the filenames below link to permanent source URLs.

| Ref | File read completely |
|---|---|
| B15 | [AGENTS.md](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/AGENTS.md) |
| B19 | [README.md](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/README.md) |
| B20 | [package.json](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/package.json) |
| B21 | [docs/agent-guide.md](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/docs/agent-guide.md) |
| B16 | [docs/ui-defaults.md](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/docs/ui-defaults.md) |
| B17 | [CODING_STANDARDS.md](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/CODING_STANDARDS.md) |
| B22 | [docs/research/DIRECTION.md](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/docs/research/DIRECTION.md) |
| B23 | [docs/intent/research-ideas-100/ideas/R066-notebook-definition-navigation.md](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/docs/intent/research-ideas-100/ideas/R066-notebook-definition-navigation.md) |
| B1 | [packages/explorEDA/src/lib/notebook/compileNotebook.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/notebook/compileNotebook.ts) — `compileNotebook`, `ownerOf`, stand-ins, result types |
| B2 | [packages/explorEDA/src/lib/notebook/compileNotebook.test.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/notebook/compileNotebook.test.ts) |
| B24 | [packages/explorEDA/src/lib/notebook/parseNotebook.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/notebook/parseNotebook.ts) |
| B3 | [packages/explorEDA/src/lib/notebook/sheets.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/notebook/sheets.ts) — `notebookSheets`, `sheetId` |
| B5 | [packages/explorEDA/src/lib/notebook/findings.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/notebook/findings.ts) — `evaluateFinding`, `comparisonProblem` |
| B9 | [packages/explorEDA/src/lib/notebook/writeBack.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/notebook/writeBack.ts) — `declarationFor`, `writeBackSettings` |
| B4 | [packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx) — `useNotebookResult`, `NotebookColumn`, `notebookSections`, `NotebookBlockView` |
| B8 | [packages/explorEDA/src/components/notebook/ExplorEdaNotebook.test.tsx](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.test.tsx) |
| B6 | [packages/explorEDA/src/components/notebook/NotebookProse.tsx](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/components/notebook/NotebookProse.tsx) |
| B7 | [packages/explorEDA/src/components/notebook/NotebookFindings.tsx](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/components/notebook/NotebookFindings.tsx) |
| B25 | [packages/explorEDA/src/components/notebook/NotebookSourceEditor.tsx](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/components/notebook/NotebookSourceEditor.tsx) |
| B10 | [packages/explorEDA/src/lib/dsl/compile.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/dsl/compile.ts) — `compileDocument`, `resolveField`, `rewriteFormula`, `buildFilter` |
| B11 | [packages/explorEDA/src/lib/dsl/parse.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/dsl/parse.ts) — `parseDocument`, `parseCalc`, source spans |
| B12 | [packages/explorEDA/src/lib/dsl/schema.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/dsl/schema.ts) |
| B13 | [packages/explorEDA/src/lib/calculations/parser/semantics.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/calculations/parser/semantics.ts) — `getDependencies`, expression construction |
| B14 | [packages/explorEDA/src/lib/calculations/engine/Calculator.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/calculations/engine/Calculator.ts) — conditional/short-circuit evaluation |
| B18 | [packages/explorEDA/src/components/calculations/CalculationTrace.tsx](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/components/calculations/CalculationTrace.tsx) |
| B26 | [apps/demo/src/docs/pages/notebooks.mdx](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/apps/demo/src/docs/pages/notebooks.mdx) |

Supplemental exact-ref files: `packages/explorEDA/src/lib/dsl/composition.ts` [S1]; `lib/calculations/CalculationState.ts` [S2]; `components/charts/Composition/validateComposition.ts` [S3]; `components/charts/Composition/compositionTypes.ts` [S4]; `lib/dsl/paths.ts` [S5]; `lib/dsl/print.ts` [S6]; `lib/chartPopulation.ts` [S7]; `components/charts/MetricCard/definition.ts` [S8]; `components/charts/MetricCard/MetricCard.tsx` [S9]; `hooks/CrossfilterWrapper.ts` [S10]; `providers/DataLayerProvider.tsx` [S11]; `components/charts/MetricCard/metricCardPlan.ts` [S12]. Each uses the same repository/commit prefix as B10. Composition lowering/validation and CalculationState were read completely; supporting types/utilities and population/card/provider modules were inspected for the decisive paths. In particular, S9 `MetricCard` uses S10 `getChartFilteredRowIds`; S10 `updateChartFilters` omits own selections in notebook `localSelections` mode, as set by S11. This proves why the metric consumes eligible rows while findings additionally apply their owning selection. These supplemental reads do not replace any of the 26 required reads.

### Open questions with defaults

- **Public naming:** default to Definitions, Uses, Used by and Return. Copy can be refined during implementation; the interaction contract is decided.
- **Persistent identity adoption:** support optional authored block ids and session identity immediately. Do not force a migration of every notebook file.
- **Graph overview:** retain as Explore after the main capability ships. No demand-study gate blocks the milestones.
- **External editor mapping:** unknown edits may invalidate a return target. An explicit host edit-map API can be explored later if concrete workflows require stronger continuity.
- **Complete checkout integration:** workers must locate all memory consumers and typed chart adapters, verify against current code and reconcile intervening changes. No source claim here silently moves to current main.

These questions do not block implementation of the recommended bundle. Access is complete for the mission; remaining checks are implementation work, not missing research deliverables.
