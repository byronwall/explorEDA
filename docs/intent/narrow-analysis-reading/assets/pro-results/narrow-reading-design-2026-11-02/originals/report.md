# Narrow analytical reading for explorEDA

Build an **ordered analysis reader using the existing chart panels**, with clear population summaries and a focused evidence view that returns readers to the chart or sentence they came from. Make it an opt-in `presentation="reader"` on saved workspaces and notebooks; keep authoring desktop-oriented. Derive a stable reading order for existing saves, let desktop authors name and order small chart groups, preserve notebook source order and chart-local selections, and expose exact inputs through the existing header trace and finding-record paths. This adds a substantial reading capability without a second chart renderer, a new selection graph, or generated conclusions.

Design date: **2 November 2026**. Baseline: **`d3920a285f3755a8324998775deb131747e959f5`**. Status: **Design proposal; implementation belongs to Codex.** Stable decisions are listed in [recommendations.md](recommendations.md); the build sequence and exact acceptance criteria are in [implementation-plan.md](implementation-plan.md).

## 1. Decision and intended outcome

The reader should answer four questions at 390 CSS pixels as reliably as it does at 1280:

1. **What am I reading?** Analysis title, row meaning, units, source, authored groups, and the current sheet remain apparent.
2. **Which population does this statement describe?** Source total, workspace restrictions, chart-local restrictions, selections, and numeric exclusions are named separately.
3. **What does the author claim, and what changed when I filtered?** Authored prose stays authored; deterministic findings update only under their declared scope.
4. **Which exact records support this value?** A header action or prose link opens the actual input records and exclusions, then returns to the original reading position.

This is a document-like presentation of the same analytical state. It is useful on a narrow desktop embed, with browser zoom, and on a phone. Width changes arrangement, never the definition of a population. A reader may select, clear, search evidence, and follow records; they do not need settings, axis editing, chart creation, formulas, or a second mobile composition canvas.

The recommended hybrid has three parts:

- **Ordered reader:** the primary surface. Charts, source notes, authored text, and findings have an explicit DOM order. Group boundaries explain relationships.
- **Focused chart and evidence:** a temporary excursion from the reader. It uses the same panel and trace plans, with a persistent scope heading and a deliberate Back action.
- **Existing flowing workspace:** retained for existing integrations and authoring. It is not redefined as the complete reading contract.

M1 is intentionally useful before author-authored groups exist: old saves get a stable coordinate-derived reading order, editing is disabled explicitly, analytical selection remains available, scope stays visible, and the existing header tracing path is discoverable. M2 makes longer evidence and focus excursions dependable. M3 applies the tools to native notebooks. M4 adds saved groups and desktop previews.

## 2. Access and evidence discipline

**Observed source.** The entire attached prompt and all **28 complete files** in the 7,265-line packet were read before research and design. The packet identifies the requested baseline. Eleven supplementary files were then fetched through GitHub with that exact commit explicitly supplied; relevant integration sections were inspected. No claims use moving `main`.

**Executed checks.** The packet's original `chartGridPlacement.ts` was imported directly by Node 24 and its pure width/flow functions executed. The independent fixture oracle computed exact record sets and arithmetic. These are specific execution results, not browser observations.

**Not executed.** The full repository, React application, notebook compiler, package test suite, Playwright flows, screen reader, keyboard, touch, and rendering at 1280/783/390 were not run. The packet is sufficient for this Design decision, but is not a runnable checkout. The screen companion is a proposal, not a screenshot of explorEDA.

**Important scope clarification.** The packet already contains chart-owned `finding` definitions, `evaluateFindings`, comparison operands, and `NotebookFindingsProvider`. They are available building blocks. The prompt's unbuilt live-findings, empty-selection recovery, and definition-navigation research proposals are not assumed to have shipped. This design uses only the inspected capabilities; it does not require their proposed broader machinery. [R8–R10]

## 3. What the baseline actually provides

### Three different width boundaries

| Surface | Source-backed behavior | Consequence for this design |
| --- | --- | --- |
| Workspace grid | `ChartGridLayout` uses `containerWidth > 0 && containerWidth < 960`; `narrowColumnCount` returns two columns from 640, otherwise one. Narrow flow disables grid drag/resize and omits `onLayoutChange`. | This protects saved geometry. It does not disable chart settings, selections, traces, or every editing gesture. |
| Notebook sections | `NotebookColumn` uses the measured article width. `layout="sections"`, no text-edit callback, and width at least 960 enable the section layout. Narrower or editable notebooks use source-segment column rendering. | Notebook reading order and grouping must be considered separately from the workspace grid. |
| Docs examples | `LiveExample.useWideViewport` uses a viewport media query. The exact-ref supplementary `paths.ts` defines `LIVE_MIN_WIDTH = 1024`; `capture` overrides this. | A 783px example container inside a 1280px browser can still be live today. The docs screenshot switch is not a library reader breakpoint. |

Sources: [R1, R2, R6, R11, R19]. The `960` and `1024` thresholds describe existing code, not an empirical optimum for the proposed reader.

### Existing strengths to retain

- **One reusable panel.** `GridChartPanel` memoizes `PlotChartPanel`; notebooks already reuse it. Its comparator compares value props but skips function identities. Reader callbacks that capture navigation state must be stable or read current refs. [R3]
- **One mounted focused panel.** `PlotChartPanel` places `expanded ? DialogContent(panel) : panel` under a single `ChartTraceScope`. This is a useful extension point. Do not render a second copy in a new overlay. [R15]
- **Exact trace semantics.** `ChartTraceScope` stores owner/kind/id/revision and resolves the current source plan. Stale selections clear. `ChartTracePanel` has a row finder and a browseable list of trace targets. [R7]
- **Existing finding evidence.** `NotebookProse` turns `#finding:name` links into records actions; `NotebookFindingsProvider` uses `MetricCardTraceBody` for calculation inputs and displays comparison operands separately. It closes evidence when the finding revision changes. [R8–R10]
- **Native notebook narrative.** Markdown segments, `eda` blocks, and sheet headings already define a document. Definitions span the notebook; selections stay with their owner chart because the provider receives `localSelections`. [R6, R8, R12]
- **Host-owned persistence.** `savedData` restores settings; `onStateChange` reports meaningful analytical state changes. `saveToStructure()` explicitly selects saved fields. A new type alone will not persist new reading metadata. [R4, R16]

### Constraints the reader must address

1. **Geometry is not a semantic order.** `flowTwoColumns` sorts by saved `y`, then `x`, and fills the shorter column. The phone layout projection instead assigns `y: index` from the chart array. `PlotManager` renders children in chart-array order. A reader must render the chosen order in the DOM, not rely on absolute positions or CSS `order`. [R1, R2, R14]
2. **`readOnly` means more than nonauthoring.** `PlotManager` sets `inert` on the chart area, status, and editing/configuration toolbars. Reusing it would also block the desired analytical interaction. [R4, R14]
3. **Panel editing is distributed.** Titles, axes, field roles, shortcuts, configuration, and details Settings are wired into `PlotChartPanel`. Hiding a Settings icon does not establish a reading mode. [R15]
4. **A selected count and a valid-measure count are different.** `FindingResult.ids` includes all reducer inputs; its plan identifies included and excluded contributors. A four-row mean may use three numeric values. [R10, R18]
5. **Notebook sections can regroup prose.** `notebookSections` collects a section's notes, including text after charts, separately from its blocks. That is deliberate existing presentation, but is insufficient to promise exact claim/evidence adjacency for a reader. [R6]

These are design constraints, not a clipping-audit backlog. The feature should give readers a coherent analytical workflow rather than accumulating isolated width fixes.

## 4. Alternatives and primary-source comparison

### The three candidate approaches

| Approach | Best use and material tradeoff | Decision |
| --- | --- | --- |
| Improve the flowing grid | Small change; keeps familiar tiles and simultaneous context. Spatial closeness still does not specify a claim's evidence, and shorter-column packing complicates narrative/focus order. | Retain for compatibility and authoring. Insufficient as the full capability. |
| Explicit ordered analysis reader | Provides a stable document, source notes, group headings, scope, and claim/evidence adjacency. Requires small metadata and interaction-policy changes. | Build as the primary presentation. Reuse current panels and notebook semantics. |
| Focused chart plus evidence | Gives dense data and one difficult chart room; enables exact verification and meaningful return. It hides neighboring views during the excursion. | Build as the secondary task flow, not a carousel-only replacement for the document. |

A screenshot can remain a useful docs fallback. It cannot satisfy selection, scope changes, or exact-record tasks. A textual summary alone also loses visual comparison and cannot safely infer conclusions from chart pixels.

### What the strongest analogies contribute

| Primary source | Relevant documented capability | Decision for explorEDA |
| --- | --- | --- |
| Tableau device layouts [E1] | Device arrangements reuse a dashboard; independent layouts require separate maintenance. | Save small reading metadata referring to existing chart IDs, while retaining desktop geometry. Avoid a second phone canvas. |
| Tableau Stories [E2] | Authored story points and captions remain connected to original sheets. | Add author-controlled order and grouping around existing visualizations. Keep continuous scrolling instead of mandatory slides. |
| Tableau View Data [E3] | Data access distinguishes the current selection from the whole view, and aggregate summaries from underlying records. | Name the evidence population. A generic row table or aggregate output is not automatically the exact contributing source set. |
| Power BI mobile guidance [E4] | Top-to-bottom related visuals; side-by-side layouts mainly for compact single-value visuals; avoid nested vertical scrolling. | Use a reading column and adjacent metric pairs where they fit. Keep long evidence in an intentional dedicated surface. |
| Power BI phone focus [E5] | Focus enlarges one visual; its selection context carries back to the report. | Share state across focus and reading; preserve the origin and explicit return. Keep explorEDA's header-trace interaction rule. |
| Observable Framework engineering article [E6] | Responsive grids and container-sized redraws combine narrative, cards, plots, and tables. | Use ordinary document layout and existing measured chart dimensions. Do not introduce a separate rendering library. |
| Olli and Vega-Lite [E7, E8] | Olli exposes structured keyboard navigation from chart semantics; Vega-Lite provides explicit mark descriptions for SVG. | Derive DOM summaries and target lists from plans. Explore richer navigation later; no new adapter dependency in M1–M4. |
| Radix Dialog [E9] | Controlled overlays, modal/nonmodal operation, focus hooks, and portal containers. | Extend the existing primitive and panel lifecycle. A new overlay library has no demonstrated need. |

**Research interpretation.** Hoffswell, Li, and Liu's CHI 2020 work studies responsive visualization transformations, including changes beyond resizing. It motivates preserving meaning through rearrangement, but does not validate these breakpoints or explorEDA's usability. Segel and Heer's narrative-visualization framework makes author-directed order plus reader exploration a coherent design choice. Neither paper supports invented prose conclusions or automatic omission of important evidence. [E10, E11]

**Rejected variations.** Do not create a mobile copy of each chart, silently suppress low-priority charts, replace the analysis with a stack of generated claims, or force one chart per swipe. Those approaches either duplicate maintenance, lose evidence, or weaken comparison. A reader can still jump to a group or focus one panel without losing the document.

## 5. Concrete reading journeys

### A. Open a saved order analysis, then check a number

At 390px, the reader opens **Inside the order book**. A short author-supplied description says one row is one order and revenue is USD. The source note remains reachable as text. The opening group contains **Active orders by region**, **Selected orders**, and **Selected revenue**, in that order. A compact scope strip says **10 selected · 12 source rows**, with **Workspace · Active: true** visible or available in the filter list.

The reader selects East through the existing chart gesture or a manual selection control. The group now explains:

- Regions: **4 selected of 10 eligible orders**. The other regional bars provide context.
- Selected orders: **4**.
- Selected revenue: **$600 from 3 valid values; 1 excluded input**.
- The persistent workspace scope: **4 selected · 12 source rows**; Active and East filters have named owners.

They choose **Records** in the revenue header. The evidence heading identifies the chart, sum, population, and data revision. It shows O01, O02, O03, and O04; O04 is marked missing and excluded from revenue. Closing restores the revenue header's focus and the reader's previous scroll position. It does not clear East or change saved geometry.

### B. Read an authored notebook claim and its live comparison

The **Regions** sheet has two deliberately different statements:

- **Author's note · all active orders, no selection:** East accounts for 4 of 10 active orders (40%). Adjacent evidence links use chartless findings with explicit `active=true` and `region=East` predicates, so their support does not change when the reader selects another region.
- **Current region-chart selection:** the chart selects `{{n}}` of `{{eligible}}` active orders, with average `{{mean-revenue}}`. Those existing findings follow only `@regions`.

After East is selected, the live statement is 4 of 10, average $200. The comparison of selected Web and Store averages changes from −$75.00 to $0.00. Its evidence has two operand sections: Web inputs O01/O03 and Store inputs O02/O04, with O04 excluded. Never represent this comparison as one merged list whose denominator is unexplained.

The reader switches to **Channels and data quality** and selects Web. That chart shows 5 of 10, average $200. Returning to Regions still shows 4 of 10. The notebook must not display a global “2 selected” count by intersecting East and Web across sheets.

### C. Recover orientation after empty or invalid inputs

The reader follows the quality examples. O07 produces a valid zero. O08 produces **no valid values**, with its raw `bad` input available. Wholesale has count **0** and average **no rows**. The surface names the restriction and offers the existing clear/reset interaction where appropriate; it does not silently widen the population, invent a cause, or require a new recovery engine.

If data or scope changes while evidence is open, that evidence is invalidated. The reader sees a brief status message, returns to the origin, and can reopen current evidence. Old record IDs must not remain under a newly computed value.

## 6. Population and meaning contract

### Five distinct quantities

Let `R` be the host-supplied rows for the current analysis, not an upstream database's unknown full population. Let `W` be the rows satisfying workspace filters. For chart `c`, let `L_c` be its saved local population restrictions and `S_c` its own selection test.

**Linked workspace:**

```text
workspace selected = R ∩ W ∩ every chart selection
chart eligible(c) = R ∩ W ∩ L_c ∩ selections of other charts
chart selected(c) = chart eligible(c) ∩ S_c
valid measure inputs(c) = inputs selected by the actual measure plan
```

`W` is written as a restriction above; it does not mean an extra copy of the data. A chart's local `where` restriction defines that chart's population and must not be promoted into a workspace filter.

**Notebook:** because selections are local, eligible is `R ∩ W ∩ L_c`, and selected is eligible intersected with `S_c`. Another chart's selection does not enter either expression. A chartless finding instead starts from **all `R`**, applies only its own finding filters, and ignores workspace filters and chart selections. [R8, R10, R17]

The phrase **eligible** must always name its owner. It is not a universal denominator shared by all charts. In the dashboard fixture with East and Web selected, global selected is 2; the region chart has 5 eligible rows because it leaves out its own East selection, while the channel chart has 4 eligible rows because it leaves out its own Web selection. Both select O01 and O03. This is expected linked-chart context, not a count defect.

**Implementation boundary:** `CrossfilterWrapper.getChartFilteredRowIds()` starts from all active filters, including the chart's own selection in linked mode. It is therefore not the correct source of a linked chart's eligible denominator. Use that chart's current positive `liveItems`/existing plan, whose dimension group excludes its own filter and already applies its local population; then apply the owner selection for selected. The notebook evaluator's use of `getChartFilteredRowIds()` works under its `localSelections` configuration. Do not copy that call into the workspace reader and rename it “eligible.” [R17]

### Labels that preserve interpretation

| Fact | Display rule | Authority |
| --- | --- | --- |
| Source total | “12 source orders”; name the row grain. | Count derived; grain supplied by author/host. |
| Current linked selection | “4 selected · 12 source”; name filter owners. | Existing store/crossfilter, not pixels. |
| Chart eligible/selected | “4 selected of 10 eligible for Regions.” | Owner's plan/live items and selection. |
| Chart-local filter | “This chart · Channel: Web”; keep it near the title. | Saved chart settings; read-only in reader. |
| Valid numeric inputs | “3 valid values · 1 excluded”; retain all 4 candidate records. | Metric/trace plan, including exclusion reasons. |
| Table evidence search | “1 matching of 2 evidence rows”; global selection remains 2. | Local evidence UI state only. |
| Comparison | Name operands, field, aggregation, units, and denominator. | Existing comparison definition/results. |
| Authored conclusion | Clearly associate it with its declared source scope. | Human text; never inferred from rendered marks. |

A count without a unit defaults to **rows**, not orders, customers, transactions, or distinct entities. The fixture can say orders because it explicitly declares one row per order. An entity-count metric must preserve its existing `entityLabel` and metric definition; the reader must not reinterpret it as a row count. [R18]

### What authors supply and what the reader derives

- **Authors supply:** purpose, interpretation, meaningful group names, narrative order when geometry is insufficient, row-grain wording, units if not encoded in field settings, source attribution, and limits on a conclusion. They write the surrounding notebook sentence so it remains true under permitted interactions.
- **The reader derives:** titles from existing chart settings/field labels, field names and roles, active filter ownership, candidate counts, valid contributors, exact record IDs, numeric findings, comparison operands, and unavailable states. It can state “Average revenue” or “4 of 10 selected”; it cannot state “East performs best” without authored text or an explicitly implemented analysis that establishes that claim.
- **No inferred adjacency:** a metric being geometrically near a chart does not prove it shares the chart's scope. Groups make association explicit, while each member still shows its actual population.
- **No inferred freshness:** a source note's publication date is authored metadata. A runtime revision is an invalidation key, not proof of when an external data source was updated.

### Empty, invalid, missing, and incomparable findings

Reuse the existing vocabulary and result states:

- Count with no input rows: **0**.
- Numeric measure with no rows: **no rows**.
- Nonempty input with no valid numeric values: **no valid values**.
- Undeclared finding: **unknown finding**.
- Nonfinite arithmetic: **not a finite number**.
- Share whose part includes records outside its whole: **not part of its whole**.
- Share with a zero-row denominator: unavailable, not 0%.

These states are carried from `FindingResult`, not synthesized by a responsive wrapper. Source/compiler errors also remain visible. `BlockProblems` already distinguishes a frozen last-valid block from a current result; the reader must never describe its historical output as live evidence. **Proposal:** apply the locked interaction policy and keyboard inertness to frozen chart output, while leaving diagnostics readable. The baseline CSS uses opacity and `pointer-events: none`; that alone does not establish keyboard inactivity. [R6, R10]

Host loading and query errors stay host-owned. A successfully supplied `data=[]` is an empty source, not evidence that a fetch failed. No source-status API is added in this mission; the host should show its load/error state before rendering available analysis rows. Notebook compiler diagnostics are a separate, already exposed condition.

## 7. Ordering, grouping, and width behavior

### Existing saves: deterministic fallback

In reader mode, resolve charts once into a stable order: saved `layout.y`, then `layout.x`, then original array index. The array index is an explicit final tie-breaker. Render that order directly in DOM order at every width. Do not persist the fallback just because the reader opened, and never write flowed pixel positions or narrow sizes into `chart.layout`.

The six-chart specimen intentionally stores its array in this order:

`trend, rows, revenue, regions, channels, orders`

Its coordinate-derived reading order is:

`regions, orders, revenue, channels, trend, rows`

The existing two-column pure function places these at `(x,y,w)` = `(0,0,1)`, `(1,0,1)`, `(1,2,1)`, `(0,6,2)`, `(0,10,1)`, `(1,10,1)`. Those values were executed against the actual source. The phone projection's array-based order and the DOM child order were source-inspected, not rendered. See [six-chart-order.json](fixtures/six-chart-order.json) and [verify-layout.mjs](fixtures/verify-layout.mjs).

### Authored groups: a small saved extension

Save `reading: { version: 1, groups: [{ id, title?, chartIds }] }`. The group array is its order, and `chartIds` is the within-group order. References are to existing charts, including any existing Markdown or metric-card charts. There is no duplicate chart definition, prose language, or per-device geometry.

Resolution rules are explicit:

1. Use the first occurrence of each existing chart ID.
2. Keep an unavailable-evidence slot for a missing referenced chart, and diagnose repeated references without duplicating the chart or its trace scope.
3. Omit genuinely empty groups (`chartIds: []`). A group whose referenced evidence is missing keeps its unavailable slots; desktop authoring names the references that need repair.
4. Append all unlisted live charts as an ungrouped remainder in deterministic coordinate order. Never silently discard a chart.
5. A malformed structure or unsupported `reading.version` fails normal settings validation. This proposal does not invent an existing tolerant import or recovery API.

At desktop width, a simple **Reading order** list offers move-up/down and group assignment alongside preview widths. Dragging may be an enhancement; keyboard-accessible moves are sufficient. One committed order edit produces one history step. No phone authoring surface is needed.

### Native notebooks: source remains authoritative

Notebook reading mode preserves the authored prose/block sequence even on wide screens. Do not extract all prose into a separate notes column if that changes which claim follows which chart. Use `##` headings as section boundaries and existing `#` sheets as navigation; do not apply saved workspace reading groups to notebook text or maintain two competing orders.

For future wide paired prose/figures, require an explicit local grouping in native notebook semantics before rearrangement. That is outside M1–M4. The first notebook reader keeps a clear source-ordered column, adds the shared scope/evidence tools, and uses all available width when a chart genuinely needs it.

### Proposed presentation at the required widths

| Container width | Reading presentation | Focus/evidence presentation |
| --- | --- | --- |
| 1280 | A bounded document, group headings and optional contents navigation. Ordinary charts stay in a clear sequence; adjacent compact metrics may share one row. The existing workspace can still show saved geometry. | Existing details architecture can show chart and evidence side by side if both remain legible. |
| 783 | Full-width chart sequence. Adjacent metrics in the same authored group may pair if each has at least 240px; no masonry or independent columns. | Focused chart above evidence or a modal evidence surface. Controls remain outside horizontal table overflow. |
| 390 | One column, including metrics. Titles and source notes wrap; scope is concise with an explicit full-filter list. | Full-width evidence sheet, Back/Close and scope fixed in its own header, one vertical scroll owner, local horizontal table overflow. |

The 240px metric minimum and these reader arrangements are design choices to verify, not measured thresholds. The `960/640` legacy grid rules and docs `1024` viewport rule remain separately documented. Add a 320-equivalent-width check for reflow; passing 390 alone does not establish WCAG reflow conformance. [E12]

## 8. Touch, keyboard, and exact-record interaction

### A visible header path, not an Alt-key requirement

In reader presentation, retain the existing trace action but give it the visible label **Records**, an accessible name such as **Records for Active orders by region**, and a tooltip explaining that it opens traceable objects and their inputs. Workspace presentation can retain its established icon treatment. This is a deliberate reader-specific affordance in the chart header, not an Inspect button on a mark.

The Records entry opens:

1. The existing trace target browser, with its full category/object labels.
2. A selected object's existing trace body and candidate inputs.
3. A named source-row finder as a secondary route, not the only route for users who do not know internal row IDs.

Keep **Browse chart objects** expanded when no object is selected, with a searchable bounded target list when needed. Touch readers can choose East without long-press or an Alt key. Keyboard readers use Tab to Records, Enter/Space to open it, and ordinary controls to choose a target. Existing Alt-click/Alt-Enter remains a shortcut. Normal mark clicks continue to select; they must not switch to inspection because the reader is narrow. [R5, R7]

Offer a manual **Selection** control in the header/status area using the existing filter controls for the chart's selection fields. It supplies the same exact action without requiring a tiny mark or a drag. For chart types whose gesture cannot be safely used while scrolling, retain touch scrolling and expose the manual control or focused chart; do not reinterpret every vertical drag as a brush.

### Evidence presentation and return

Use compact nonmodal trace popovers where they fit. A narrow or explicitly expanded evidence view is a deliberate modal surface because it occupies the reading area and must protect focus. At 390px it fills the available viewport using dynamic viewport units and safe-area padding. At larger widths it may use the existing details shell, with evidence instead of Settings as the reader's default tab.

The main reader and the evidence sheet each have one vertical scroll owner while active. Table columns may scroll horizontally inside their own labeled region. Scope, Back/Close, search, and paging must remain outside that horizontal overflow.

Lifecycle requirements:

- Capture the invoking element, owning chart/group/sheet, actual scroll root, and scroll offsets before opening. Do not assume the browser window is the scroll root; embedded workspaces may scroll inside a host container.
- Initially focus the evidence heading with `tabIndex=-1` for structured content. Do not make a whole large table the dialog's single `aria-describedby` string.
- Trap focus only when the surface is modal; make the outside content genuinely inert then. Escape closes an inner editor/popover before it closes the evidence surface.
- On normal close, restore the original scroll root and then focus the connected invoker with `preventScroll`. If it disappeared, focus the owning chart header, then group heading, then active sheet heading.
- On data/selection invalidation, close or return to the object browser, announce **“The inputs changed; reopen records for the current value.”**, and use the same connected-origin fallback. Do not silently replace records under the old number.
- On sheet change, close evidence belonging to the outgoing sheet and retain its position only for a later revisit. Focus the newly selected tab/heading and use that sheet's own reading position; never restore the old sheet's scroll/focus over the host's new choice. An external host-directed sheet change follows the same rule.
- Do not steal global browser history. M2 provides an explicit Back/Close action. URL navigation and stable record deep links remain a later host-level extension.

These choices follow WAI-ARIA dialog guidance and existing Radix lifecycle hooks; they require real-input validation. [E9, E15]

**Single-panel detail.** The existing expanded panel can be reused, but moving a React subtree can change trace-source registrations. “One mounted chart” alone does not prove retained trace identity. Opening the records sheet can keep the original chart mounted behind it. If an already selected object is promoted to focused chart view, carry a logical target intent and re-resolve it after registration; do not persist a React-generated owner ID or display stale evidence. This transition receives a specific M2 test.

### Dense records: reuse the complete contributor table

The exact-ref lookup resolves an important implementation choice:

- `MetricCardTraceBody` passes the complete `plan.contributors` list to `AggregateContributorTable` in `components/charts/BarChart/GroupedAggregateInspector.tsx`.
- That table pages **50 records at a time** over the complete list. It does not cap the population. The `Used` column identifies included rows or an exclusion reason.
- `ChartDataPreview` is different: it shows at most **100** rows or aggregate groups. `fill=true` changes height, not this limit. It cannot become complete evidence merely by opening it full-screen. [R20–R22]

Extend the contributor table with evidence-local search, sorting, and All/Included/Excluded choices. Derive these display subsets from the original exact contributor set; keep the analytical value and full input/inclusion counts visible. Page size remains 50 initially. Reset/clamp page state when the local subset or evidence revision changes. A 101-record case must expose pages of 50, 50, and 1.

Add optional display-only business-key and full-record details keyed by `sourceId`. For this fixture, show `order_id` beside the internal source-row index. Do not set a metric's `entityField` to obtain a convenient label: that would change aggregation meaning. Preserve raw input, parsed input when relevant, and exclusion reason. Numeric cells align right; missing values use the shared `null` treatment. Long text and expanded record details wrap.

Use native table semantics and `aria-sort` for active sorts. Do not turn a read-only table into an ARIA grid solely because headers contain buttons. Pagination and sort/search operate within evidence, not global `rowsSettings`. For enormous evidence, keep paging and bounded DOM; a new virtualization engine is not required by this feature. [E16]

### Supported and unsupported changes in the reader

| Action | Reader behavior | Scope consequence |
| --- | --- | --- |
| Select a mark or use its manual control | Supported where the existing chart defines selection. | Linked in workspace; owner-local in notebook. |
| Clear one chart's selection | Supported through a named header action. | Clears that selection only; preserves authored `where` restrictions. |
| Change/add/remove workspace filters | Supported through existing filter controls; full ownership remains visible. | Affects workspace-linked charts and notebook eligible populations. Chartless findings remain independent. |
| Search/sort/page evidence | Supported locally. | Does not change charts, findings, global Rows settings, or selected count. |
| Reset interactions | Restore the reader session's opening analytical settings, explicitly named. | Restores saved initial selections/workspace filters; not a hidden “remove every restriction.” |
| Modify chart-local `where`, fields, formulas, scales, titles, layout, source text | Desktop authoring/Explore-copy workflow. | No authoring mutation through reader handlers or shortcuts. |
| Reorder columns in an evidence presentation | Optional local display operation. | Never rewrites an authored chart or its global row configuration. |

Scope remains visible after every supported filtering action. A compact footer shows the source and selection count plus active owners; a `+N more` control opens the full filter list. A focused evidence view repeats its relevant scope in its own header. A notebook footer names the current chart owner when there is a selection; it never pretends every chart shares one selected set.

## 9. Titles, source notes, comparisons, and accessible summaries

The reader's semantic summary is a small addition to the existing panel: chart title, chart type/field roles, row grain if known, scope counts, and a named Records action. Where a plan exposes a metric, add its aggregation, units, included/excluded counts, and comparison basis. Reuse formatters and existing plan outputs. Do not parse SVG labels or infer text from the chart image.

- **Titles:** preserve complete wording. Wrap rather than clamp away the population or time period. An optional collapsed full-title disclosure is acceptable only if the full name remains available to keyboard and touch. A chart whose title repeats a section can share a heading via `aria-labelledby`; do not leave the trace action with an inaccessible or ambiguous name.
- **Source notes:** keep the full text immediately after its chart or claim group, and expose notebook source notes in document order. At narrow widths, the existing one-line chart note needs a wrapping reader treatment. Source attribution cannot become hover-only metadata.
- **Comparison context:** retain shared category colors, fields, units, aggregation, and existing scale semantics. Do not crop a comparison's denominator or quietly rebase an axis to the current selection. Focused views repeat the relevant comparator or provide a clear return to its neighboring group.
- **Unknown facts:** an unavailable count is not zero. A renderer without a supported numeric summary still gets a title, field roles, available scope, and existing evidence actions; it does not receive a fabricated finding.
- **Announcements:** announce the committed selection/scope change once, through a shared polite status region. Avoid announcing every numeric token during a brush or duplicating the entire paragraph. Existing `NotebookProse` preserves surrounding DOM and focused links when finding values update; retain that behavior. [R8]

Accessible descriptions complement the chart and records; they do not replace the visualization. Olli is a useful future comparison for richer semantic navigation, but an adapter project would be unnecessary scope for a single maintainer now. Vega-Lite's SVG-specific descriptions also do not establish Canvas accessibility. [E7, E8]

### Compact controls and touch targets

Keep the repository's compact 32px visual controls and semantic tokens (`--border`, `--input`, `--ring`, `--destructive`, `--warning`). For coarse pointers, allocate nonoverlapping 40–44px hit areas to Records, Back/Close, filter controls, and paging. This is a product choice; WCAG 2.2 AA's minimum target-size criterion is 24×24 with defined exceptions, not a universal 44px requirement. Finding links in prose can use comfortable line height without turning the paragraph into oversized buttons. [R5; E13]

Match visual order to DOM order and retain normal tab order. Keep the sticky scope strip from hiding focus using real reserved space, scroll padding/margins, and safe-area allowances. Test bottom rows with the on-screen keyboard and zoom. Data tables may need two-dimensional layout; their captions, search, scope labels, and pagination still need to reflow. [E12, E14, E16, E17]

There is a small baseline documentation disagreement: `CODING_STANDARDS.md` requests tooltips on hover and keyboard focus, while `ui-defaults.md` says focus return should not open tooltips. Keep accessible names and visible focus unconditional. Reuse the existing tooltip wrapper and avoid announcing a redundant tooltip when returning from evidence; reconcile the wording during implementation rather than creating another tooltip system.

## 10. Component, persistence, and host boundary

The complete type-only sketch is [reader-contracts.ts](reader-contracts.ts). It proposes direct modules, not a reader framework.

```ts
type ExplorEdaReadingProps = {
  presentation?: "workspace" | "reader";
};

type NotebookReadingProps = {
  presentation?: "notebook" | "reader";
};

type SavedReadingV1 = {
  version: 1;
  groups: { id: string; title?: string; chartIds: string[] }[];
};

type PanelInteractionMode = "edit" | "read" | "locked";
```

### Reuse versus new work

- **Reuse:** `DataLayerProvider`, chart definitions/renderers/plans, `GridChartPanel`, `PlotChartPanel`, `ChartTraceScope`, `ChartTracePanel`, `NotebookProse`, `NotebookFindingsProvider`, `MetricCardTraceBody`, the contributor table, and existing Radix wrappers.
- **Small new modules:** an ordered reader layout, order resolver, scope summary, reading navigation/return helper, and desktop reading-order editor. Extract the existing notebook chart-height logic if both presentations need it; do not duplicate sizing heuristics across two new systems.
- **Explicit policy:** pass the internal interaction mode as a value prop through the memoized panel. Gate title/axis/field/legend editing, settings, layout controls, context menus, and authoring shortcuts. `readOnly=true` keeps its established stronger lock; it is not silently reinterpreted as interactive reading.
- **Evidence view:** parameterize the existing panel/trace shell and use contributor plans for records. Keep chart-data previews explicitly limited. No generic adapter registry, new renderer, or automatic narrative service is needed.

### Three different state lifetimes

1. **Saved authored state:** chart settings, desktop geometry, existing findings, and optional reading groups. Notebook prose/ordering remain in notebook source.
2. **Current analytical state:** selections and workspace filters in the existing provider. `onStateChange` keeps its documented analytical meaning. Reader mode does not silently suppress these callbacks or create a competing selection store.
3. **Transient navigation:** open evidence, focused chart, current evidence page/search/sort, scroll positions, and return elements. None belongs in `SavedDataStructure`, an analysis export, or undo history.

The host decides whether a reading session's analytical changes should be persisted. A published reader can omit `onStateChange` or keep it in session state, while a saved exploration can save it. Do not echo every callback directly into `savedData`; the API remains a restore boundary, even though the provider fingerprints matching echoes. For notebooks, `presentation="reader"` must not rewrite source through `onTextChange` when selections change. An explicit desktop authoring action can still switch to the ordinary editable presentation. Existing `sheet/defaultSheet/onSheetChange` remain the sheet boundary; no new duplicate sheet state is necessary. [R4, R6, R16]

Optional future `onReaderNavigate({groupId?, chartId?})` can inform a host outline or URL without exposing DOM nodes or raw rows. M1–M4 do not require a controlled router or stable record URL format.

### Persistence and migration

Add `reading` to every relevant provider initialization/reset/restore/save path and its stable fingerprint. Validate version, structural types, nonempty IDs, and unique group IDs. Chart references can become semantically stale and receive the resolver behavior above. Existing saves without `reading` remain valid and unchanged on mere opening/resizing.

The extension is additive to settings; it does not require changing `SavedAnalysisStructure.version = 1`. The package feature should receive the repository's normal minor changeset when implemented. There is no automatic rewrite of desktop `layout`, no row serialization in `onStateChange`, and no promise that older package versions will preserve unknown reading metadata on save. Document that downgrade risk. [R5, R9, R16]

Changing presentation or width must not generate an authoring undo step. Existing render-time normalizations may already occur; test the **delta after initial stabilization**, excluding the generated `metadata.modifiedAt` when comparing semantic saves. Preserve those existing host semantics while ensuring the reader contributes zero extra persistence events for navigation alone.

## 11. Deterministic fixture and what it proves

The complete [orders.json](fixtures/orders.json) contains 12 synthetic orders with six fields. O01–O10 are active. East has O01–O04; West O05–O07; North O08–O10. O04 has missing revenue, O08 has `bad`, and O07 has valid zero. O11 and O12 are inactive. The fixture's native [notebook.eda.md](fixtures/notebook.eda.md) has two sheets, a scoped author claim, chart-owned findings, comparison evidence, and source notes.

| Population | Records and valid revenue inputs | Exact result |
| --- | --- | --- |
| All source | 12 records; 10 valid | Sum 3,900; mean 390 |
| Active | 10 records; 8 valid | Sum 1,900; mean 237.5 |
| Active East | O01–O04; O01/O02/O03 valid | Sum 600; mean 200; share 40.0% of active |
| Active Web | O01/O03/O05/O07/O08; four valid | Sum 800; mean 200 |
| Active Store | O02/O04/O06/O09/O10; four valid | Sum 1,100; mean 275 |
| Active East and Web | O01/O03; both valid | Sum 400; mean 200 |

All fifteen populations, exact source-row indices, candidate business keys, valid/excluded keys, and failure expectations are in [expected.json](fixtures/expected.json). The fixture oracle was executed successfully. It verifies independent arithmetic and membership, not product state or parsing. It intentionally limits inputs to numeric literals, `null`, and `bad`; it is not a replacement for `valueParsing.ts`.

The six-chart fixture specifies titles, field roles, stored rectangles, an intentionally scrambled array, expected old flow, proposed group order, and a local-filter variant. It is explicitly **a design specification, not a serialized `SavedDataStructure`**. Codex should instantiate actual settings with the baseline chart factories or DSL rather than pretend the fixture's abbreviated fields are importable settings.

The highest-value acceptance tasks are:

1. At each required width, identify **4 selected / 10 eligible / 12 source**, without confusing missing revenue with a missing order.
2. Follow the $200 notebook average to **O01–O04**, identify O04's exclusion, and return to the same sentence with focus and scroll preserved.
3. Select East and Web in the dashboard: global **2**, region eligible **5**, channel eligible **4**. Evidence search for O03 returns **1 of 2**, with global selected still **2**.
4. Select East and Web on different notebook sheets: Regions remains **4 of 10**, Channels is **5 of 10**. Return to Regions without intersection or reset.
5. Find the author claim's fixed-scope evidence after a different live selection. It still identifies the original active-East population.
6. Distinguish valid zero, invalid-only input, empty input, missing finding, and an invalid part/whole share. The East/Web invalid share identifies O02 and O04 as outside the whole.
7. Open evidence, replace the data array, and ensure stale source-row indices are invalidated. In a reversed array O01 moves from index 0 to 11 and O03 from 2 to 9; their business keys do not change.

These tasks are specified for implementation acceptance. Only the independent numerical portions and the baseline pure flow were executed here.

A chartless finding is independent of selection, not frozen in time: it recomputes if the host supplies different data content. The fixed 4/10 claim in this notebook is explicitly about immutable `orders.json`. Hosts publishing historical claims must keep the corresponding data and prose together; this reader does not store historical row snapshots or automatically revise authored conclusions. Data replacement invalidates current evidence even when a business key still exists.

## 12. Release sequence and main risks

| Milestone | Independently useful result | Main risk |
| --- | --- | --- |
| M1 — ordered reader | Opt-in workspace reader, deterministic DOM order, explicit read policy, visible scope, reachable header trace. | Hidden editing handlers still mutate state, or eligibility is derived from the wrong filtered set. |
| M2 — exact evidence | Focused single-panel/evidence flow, complete paginated contributors, local evidence search, focus/scroll return and invalidation. | Generic chart-data preview is mistaken for complete source evidence, or trace registration changes during focus transitions. |
| M3 — notebook reading | Native source-order reader, owner-local scope, existing finding links, sheet return, source notes, and live narrow docs examples. | A global selected count or text writeback changes notebook meaning; stale author prose is presented as a live conclusion. |
| M4 — authored groups | Small persisted group/order metadata, keyboard desktop authoring and width previews, backwards-compatible legacy fallback. | Save/restore silently drops metadata, duplicates a chart, or changes desktop rectangles. |

Every milestone includes its docs section, runnable example, tests, and a package changeset where applicable. The separate implementation plan names exact existing/new files, gates, and numerical expectations. No milestone waits for outside demand, a survey, or an unbuilt proposal.

**Maintenance discipline:** keep the order resolver and navigation helper direct, pass stable callbacks through `GridChartPanel`, subscribe per chart rather than to the entire store, and avoid recomputing every record count on unrelated layout changes. Build six-panel correctness first. Defer virtualization or lazy panel mounting until a measured cost justifies it; unmounting charts can also unregister trace sources and complicate return.

**Support boundary:** release the documented reader tasks for the verified chart set and notebook fixtures. Do not claim universal touch authoring or that every 3D/map/composition gesture works identically on a phone. Readers still get source information and existing evidence where available; unsupported gesture-specific operations remain in focused/desktop exploration.

## 13. Primary external references

These sources were checked on 2 November 2026. Product documentation supplies analogies and interface behavior, not measured explorEDA outcomes. Current Radix docs show a newer release than the packet's declared range; this design relies on already-used wrappers/hooks and does not require a dependency upgrade.

- **E1 — Tableau, device layouts:** https://help.tableau.com/current/pro/desktop/en-us/dashboards_dsd_create.htm
- **E2 — Tableau, Stories:** https://help.tableau.com/current/pro/desktop/en-us/story_create.htm
- **E3 — Tableau, underlying data:** https://help.tableau.com/current/pro/desktop/en-us/inspectdata_viewdata.htm
- **E4 — Microsoft, mobile report design:** https://learn.microsoft.com/en-us/power-bi/create-reports/power-bi-create-mobile-optimized-report-best-practices
- **E5 — Microsoft, phone report focus/filtering:** https://learn.microsoft.com/en-us/power-bi/explore-reports/mobile/mobile-apps-view-phone-report
- **E6 — Observable, responsive dashboard engineering:** https://old.observablehq.com/blog/big-insights-small-spaces — official engineering article; Framework API pages were not independently available through the retrieval route, so no current API/version claim is made.
- **E7 — Blanco, Zong, Satyanarayan, Olli, IEEE VIS Posters 2022:** https://vis.csail.mit.edu/pubs/olli/ — semantic-navigation concept; current package compatibility and release health were not established.
- **E8 — Vega-Lite, mark descriptions:** https://vega.github.io/vega-lite/docs/mark.html — SVG accessibility attributes, not a blanket Canvas claim.
- **E9 — Radix Dialog:** https://www.radix-ui.com/primitives/docs/components/dialog
- **E10 — Hoffswell, Li, Liu, CHI 2020:** https://idl.uw.edu/papers/responsive-vis ; DOI https://doi.org/10.1145/3313831.3376777
- **E11 — Segel and Heer, InfoVis/TVCG 2010:** https://idl.uw.edu/papers/narrative ; DOI https://doi.org/10.1109/TVCG.2010.179
- **E12 — W3C, reflow:** https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- **E13 — W3C, target size:** https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- **E14 — W3C, focus not obscured:** https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
- **E15 — WAI-ARIA APG, modal dialog:** https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- **E16 — WAI-ARIA APG, table:** https://www.w3.org/WAI/ARIA/apg/patterns/table/
- **E17 — W3C, DOM/visual order technique:** https://www.w3.org/WAI/WCAG22/Techniques/css/C27
- **E18 — WAI-ARIA APG, tabs:** https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ — preserve the current tab relationships and keyboard movement; verify activation latency before changing activation behavior.

## 14. Repository evidence map

All repository references below are at the named baseline. `src/` in this map means **`packages/explorEDA/src/`**; full paths are used elsewhere where changes are assigned. The GitHub baseline can be browsed at https://github.com/byronwall/explorEDA/tree/d3920a285f3755a8324998775deb131747e959f5 .

- **R1:** `src/components/ChartGridLayout.tsx` — `ChartGridLayout`, `isNarrow`, `layout`, `onLayoutChange`, `isDraggable`, `isResizable`.
- **R2:** `src/components/chartGridPlacement.ts` — `NARROW_GRID_WIDTH`, `narrowColumnCount`, `flowTwoColumns`; `chartGridPlacement.flow.test.ts`; `components/__tests__/ChartGridLayout.test.tsx`.
- **R3:** `src/components/GridChartPanel.tsx` — `GridChartPanel`, `sameGridPanelProps`.
- **R4:** `src/components/ExplorEda.tsx` — `ExplorEdaProps`, `Workspace`, public exports; root `README.md` — host boundary and desktop support statement.
- **R5:** `AGENTS.md`, `CODING_STANDARDS.md`, `docs/agent-guide.md`, `docs/ui-defaults.md`, `docs/research/DIRECTION.md` — workflow, tokens, chart interaction rules, docs/example gates, evidence standards.
- **R6:** `src/components/notebook/ExplorEdaNotebook.tsx` — `ExplorEdaNotebook`, `NotebookColumn`, `notebookSections`, `NotebookSectionsView`, `NotebookBlockView`, `SheetTabs`, `BlockProblems`, `chartHeight`; `notebook.css`.
- **R7:** `src/components/charts/ChartTraceControl.tsx` — `ChartTraceControl`; `charts/trace/ChartTracePanel.tsx` — `ChartTracePanel`, `TraceBody`, `WorkspaceFilterNote`; `ChartTraceScope.tsx` — registration, target resolution, stale clearing, `useTraceRevision`.
- **R8:** `src/components/notebook/NotebookProse.tsx` — token replacement, records links, `useLayoutEffect`; `NotebookFindings.tsx` — `useFindingResults`, `NotebookFindingsProvider`, `FindingRecords`, `OperandRecords`.
- **R9:** `src/types/SavedDataStructure.ts` — saved settings, finding definitions, analysis version.
- **R10:** `src/lib/notebook/findings.ts` — `evaluateFinding`, `evaluateFindings`, `comparisonProblem`, `compareFindings`, `findingFor`, `evaluateNotebookFindings`, `UNAVAILABLE_TEXT`.
- **R11:** `apps/demo/src/docs/live/LiveExample.tsx` — `useWideViewport`, `wide`, fetch gate, screenshot branch, capture override.
- **R12:** `apps/demo/src/docs/live/NotebookFindingsExample.tsx`; `apps/demo/src/docs/pages/notebooks.mdx` — local examples, published scope and notebook syntax.
- **R13:** `apps/demo/src/demos/examples.ts` — catalogue/example registration and existing realistic order examples; `docs/intent/research-ideas-100/ideas/R063-narrow-analysis-reading.md` — earlier candidate, not a fixed solution or demand gate.
- **R14, supplementary:** `src/components/PlotManager.tsx` — `inert` policy, chart array rendering, scope bar.
- **R15, supplementary:** `src/components/PlotChartPanel.tsx` — `ChartTraceInspector`, title/axis actions, header actions, expanded single-panel path under `ChartTraceScope`.
- **R16, supplementary:** `src/providers/DataLayerProvider.tsx` — `saveToStructure`, restore, fingerprint/callback effects; `src/utils/saveDataUtils.ts` — `validateSavedData`, parse/stringify boundaries.
- **R17, supplementary:** `src/hooks/CrossfilterWrapper.ts` — `localSelections`, `getAllData`, `getFilteredRowIds`, `getChartFilteredRowIds`; `src/lib/chartPopulation.ts` — local population restriction.
- **R18, supplementary:** `src/components/charts/MetricCard/metricCardPlan.ts` — `MetricCardPlan`, `planMetricCard`, contributor/identity counts.
- **R19, supplementary:** `apps/demo/src/docs/paths.ts` — `LIVE_MIN_WIDTH = 1024`.
- **R20, supplementary:** `src/components/charts/MetricCard/MetricCardTraceBody.tsx` — `MetricCardTraceBody`, complete contributor inputs and scope.
- **R21, supplementary:** `src/components/charts/BarChart/GroupedAggregateInspector.tsx` — `AggregateContributorTable`, `PAGE_SIZE = 50`, full-list pagination.
- **R22, supplementary:** `src/components/ChartDataPreview.tsx` — first-100 cap, aggregate-versus-source preview, `fill` sizing.

## 15. Closing handoff

### Access status and files read

**Access sufficient for Design.** The full attached packet was read. Exact-ref GitHub access also succeeded for the eleven supplementary files listed above. No decisive design input is missing. The absence of a runnable full checkout limits execution claims, not the recommendation.

The 28 complete packet files read were:

1. `AGENTS.md`
2. `README.md`
3. `CODING_STANDARDS.md`
4. `docs/agent-guide.md`
5. `docs/ui-defaults.md`
6. `docs/research/DIRECTION.md`
7. `package.json`
8. `packages/explorEDA/package.json`
9. `packages/explorEDA/src/components/ChartGridLayout.tsx`
10. `packages/explorEDA/src/components/chartGridPlacement.ts`
11. `packages/explorEDA/src/components/chartGridPlacement.flow.test.ts`
12. `packages/explorEDA/src/components/__tests__/ChartGridLayout.test.tsx`
13. `packages/explorEDA/src/components/GridChartPanel.tsx`
14. `packages/explorEDA/src/components/ExplorEda.tsx`
15. `packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx`
16. `packages/explorEDA/src/components/notebook/notebook.css`
17. `packages/explorEDA/src/components/notebook/NotebookProse.tsx`
18. `packages/explorEDA/src/components/notebook/NotebookFindings.tsx`
19. `packages/explorEDA/src/components/charts/ChartTraceControl.tsx`
20. `packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx`
21. `packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx`
22. `packages/explorEDA/src/lib/notebook/findings.ts`
23. `packages/explorEDA/src/types/SavedDataStructure.ts`
24. `apps/demo/src/docs/live/LiveExample.tsx`
25. `apps/demo/src/docs/live/NotebookFindingsExample.tsx`
26. `apps/demo/src/docs/pages/notebooks.mdx`
27. `apps/demo/src/demos/examples.ts`
28. `docs/intent/research-ideas-100/ideas/R063-narrow-analysis-reading.md`

### Checks performed versus proposals

- **Performed:** complete source inspection; exact-ref supplementary reads; primary-source retrieval; original pure layout functions executed; independent fixture arithmetic executed; type-only contract parsed/executed with Node type stripping; companion consistency and visual artifact inspection.
- **Not performed:** strict `tsc` typechecking; notebook compilation; shipped finding/aggregate execution; full package tests; browser/screen-reader/touch/keyboard testing; any usability measurement. A temporary compiler fetch did not complete, so no typecheck success is claimed.
- **Proposed:** M1–M4, component changes, new props, saved groups, evidence-local controls, identity labels, focus/scroll restoration, scope summaries, narrow live docs, and every black-box acceptance gate.

### Deliverables

- [report.md](report.md)
- [implementation-plan.md](implementation-plan.md)
- [recommendations.md](recommendations.md)
- [reader-contracts.ts](reader-contracts.ts)
- [reader-and-evidence.svg](reader-and-evidence.svg) and [reader-and-evidence.png](reader-and-evidence.png) — illustrative proposal, not product screenshots.
- [orders.json](fixtures/orders.json)
- [expected.json](fixtures/expected.json)
- [notebook.eda.md](fixtures/notebook.eda.md)
- [six-chart-order.json](fixtures/six-chart-order.json)
- [verify-fixtures.mjs](fixtures/verify-fixtures.mjs)
- [verify-layout.mjs](fixtures/verify-layout.mjs)

### Open questions for integration

These are bounded implementation questions, not gates on demand or design:

1. Which existing header/filter-control seam can expose manual selection without also exposing field/settings edits? Inspect the current shared filter components before extracting another one.
2. Does every supported renderer keep a logical trace target resolvable through a focused-panel remount? Verify metric, row, scatter, facet, and title targets; use a named unavailable state when a target no longer exists.
3. Should the host offer a display-only record label by callback or by field name? Start with an optional field-name choice using existing field settings and a source-row-index fallback; do not imply persistent identity across refresh.
4. What happens to reading metadata through Dashboard-text export/import? The JSON path must round-trip in M4. Inspect the current DSL's warning/export behavior and explicitly report unsupported group metadata rather than claim lossless DSL support.
