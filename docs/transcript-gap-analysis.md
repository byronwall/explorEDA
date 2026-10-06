# explorEDA transcript gaps — current reconciliation

Reviewed on 2026-10-05 against `362db58082df9c1b57c2305a49823a1dae385081`.
This is also the revision used by ChatGPT Pro. No application code changed in this review.

**Next action: choose a small trust verification batch before another chart expansion.**
The main missing capabilities are reusable intermediate results, source identity, and a host workflow for saved analyses.
Relative date controls and content auto-fit offer smaller improvements.
See the [priority report](reviews/pro-gap-analysis-2026-10-05/priorities.md).

This document replaces the mixed September/October gap list. It retains all 92 original outcome IDs.
The [prior report](reviews/pro-gap-analysis-2026-10-05/prior-transcript-gap-analysis.md) preserves every old passage and repair record.
The [review index](reviews/pro-gap-analysis-2026-10-05/README.md) links all imported reports and reconciliation files.

## Method, evidence, and status definitions

Pro reread all 20 transcripts. This review reconciles its ledger with the current repository records and selected source paths.
It does not claim a new full transcript audit or complete runtime audit.
Current support below means source support or a repository contract within its stated boundary.
Remaining gaps include missing capabilities, optional scope, and missing proof. These states do not imply a reproduced defect.

Pro completed zero fresh application browser tests. Its browser was blocked before the application loaded.
This review performed no new application browser tests. Historical browser evidence remains historical.
The [chart guide](analytical-chart-coverage.md) records the waived cross-view comparisons and browser restores.
Those waivers remain in force. This report proposes a new bounded batch; it does not reopen the retired initiative.

The product accepts one in-memory scalar table. The host owns acquisition, routing, and storage.
The supported workspace minimum is 1024 CSS pixels. Narrow checks do not establish mobile support.
Core intent describes importance, not authorization. Candidate, exploratory, and parked goals remain separate from approved work.

## Main findings

- Eighteen view types now exist. Grouped and stacked bars, UTC summaries, area, bubble and density modes have delivered contracts.
- Header distributions, column dragging, Clear sort, and filter-owner navigation close old missing-control claims.
- Mark traces now cover many aggregate families. Inspection has grown; general reusable intermediate inputs remain partial.
- R18 numeric eligibility and R19 formatting repairs remain fixed records. Their new consumers need proof, not duplicate repairs.
- Advanced scatter analysis and compact authoring have plans. A merged planning PR does not supply runtime support.
- The matrix has 52 rows and 182 assignments. Its 37 historical reviewed assignments do not prove all current combinations.

## Outcome register

Each row keeps the original ID. Evidence labels resolve in the source index below.
The [machine ledger](reviews/pro-gap-analysis-2026-10-05/reconciliation.json) preserves the prior row, Pro assessment, review decision, and proof scenarios.

## Input data, schema, and source scope

| ID / outcome / intent | Current support | Remaining gap / proof |
| --- | --- | --- |
| DATA-01 · Load an unknown table and begin useful inspection · Core | One in-memory scalar table through host rows, CSV or flattened JSON; data import and full-analysis reopen are wired in the host. [T01] [T09] [T13] [INV] [HOST] | No import-time schema preflight; flattening does not preserve rich collections as semantic cells. **Kind:** capability and verification. |
| DATA-02 · Know field types, missingness and distributions before charting · Core | Profiles and inspectors exist. Rows always shows header distributions. Table charts show them by default and can disable them. [T02] [T09] [T13] [TABLE] [THDR] [NUM] | The old missing-inline-distribution claim is closed. Population scope and constant/all-invalid fields need current browser proof. Import preflight remains DATA-03. **Kind:** verification. |
| DATA-03 · Correct inference without losing source values · Specific | The inventory describes type overrides, null tokens, date presets, preview and Apply with raw rows preserved. [T09] [INV] [BASE] | Import-time preview and durable source-schema binding are separate gaps; re-test conversions and dependent filters rather than infer correctness from settings existence. **Kind:** capability and verification. |
| DATA-04 · Know source identity and the grain of one record · Core | Raw/effective rows and positional __ID support inspection within a loaded snapshot. [T11] [T13] [T15] [INV] | No durable source key, row-grain description, source fingerprint/version or recorded flattening lineage is established. Reordering can change identity. **Kind:** capability and verification. |
| DATA-05 · Analyze related tables at their correct grain · Core / parked | One analytical source table remains the declared workspace boundary. Region Map joins that table to geometry. [T11] [T13] [T15] [INV] [CHART] | Geometry joins are not a general multi-source catalogue, relational joins, key diagnostics or analysis-grain selection. **Kind:** parked or task-dependent capability. |
| DATA-06 · Distinguish available, loaded and visible data · Core / remote scope parked | Full loaded, globally filtered and peer-filtered populations are described and counts are exposed. [T12] [T13] [INV] [FILTER] | No remote available population or stable working-set layer. All source means the loaded in-memory source, not all possible records. **Kind:** capability and verification. |
| DATA-07 · Load only needed fields and records while exposing availability · Candidate / parked | The host fetches whole examples and accepts complete local data arrays. [T13] [INV] [HOST] | No dependency-driven projection, server aggregation pushdown or incremental loading protocol is established. **Kind:** parked or task-dependent capability. |
| DATA-08 · Reuse named transformed tables as analytical inputs · Core / architecture open | Named grouped summaries provide a reusable definition. Many newer chart transforms retain contributor information. [T11] [T13] [T15] [T16] [T17] [INV] [CHART] [ROLL] | Traceable internal arrays and shared reducers are not arbitrary named, composable intermediate sources. Pivot/model output reuse remains a distinct extension. **Kind:** capability and verification. |
| DATA-09 · Find observations that should exist but are absent · Specific | Existing profiles identify missing cells in present records; time views can reveal empty periods visually. [T13] [INV] [CHART] | Expected key sets, sampling plans and missing-observation reconciliation are not established. A blank cell and an absent record have different denominators. **Kind:** parked or task-dependent capability. |

## Dashboard experience and saved analysis

| ID / outcome / intent | Current support | Remaining gap / proof |
| --- | --- | --- |
| DASH-01 · Create useful views with few choices · Core | Without saved settings, the current default opens Summary and a source table. Saved layouts take precedence. Fields offers chart creation and quick previews. [T09] [T12] [T13] [INV] | Default role selection and chart eligibility explanations remain uneven. A quick preview must not create a chart or alter saved layout. **Kind:** capability and verification. |
| DASH-02 · Keep several named analyses without losing state · Specific | Charts, Rows and Calculations are modes within one workspace, with panel state retained. [T12] [INV] [HOST] | These are not named dashboard tabs, independent analysis sessions, dirty-state indicators or navigation history. **Kind:** parked or task-dependent capability. |
| DASH-03 · Preserve meaningful applied configuration · Core | Settings/full-analysis JSON, applied formulas, layout, field settings and Rows settings are described; the host captures emitted state. [T08] [T12] [INV] [HOST] [CHART] | Draft formulas remain local. Source rows belong to the full bundle, not settings-only JSON. New modes and geometry assets need current end-to-end roundtrip proof. **Kind:** verification. |
| DASH-04 · Save and reopen an analysis · Core | The host parses and validates full-analysis JSON before replacing data and settings; settings-only restore is the embedding path. [T08] [HOST] [INV] | Manual JSON restore is not durable named storage, autosave or recovery after closing the browser. Keep the host/package ownership distinction. **Kind:** capability and verification. |
| DASH-05 · Share small states by URL and organize larger saved views · Candidate | URLs select examples; storage-neutral package state can be owned by a host. [T08] [HOST] [INV] | Live layout/filter state is not shown as a shareable URL contract. Dataset/project ownership and named view catalogues remain outside the reviewed host. **Kind:** parked or task-dependent capability. |
| DASH-06 · Separate saved layout from temporary selection and recover decisions · Specific / candidate | Applied filters are included in saved chart settings. [T08] [T12] [INV] [BASE] [CHART] | No explicit filter-free template save, workspace undo, checkpoint history or restored-state diff is established. **Kind:** capability and verification. |
| DASH-07 · Edit near the result and judge changes · Core preference | Field distributions and typed table controls are near the data; calculation and field inspectors have draft previews. [T08] [T17] [TABLE] [THDR] [INV] [PLAN] | General chart settings and advanced model/density controls do not have a uniform live editing contract. Planned DSL authoring does not count as delivered editing. **Kind:** capability and verification. |
| DASH-08 · Rearrange and focus a dashboard without losing meaning · Core | Panels move, resize, duplicate and expand; facets have focus/paging; filter owners now have navigation/highlighting. [T12] [T14] [INV] [FILTER] [PLOT] | Per-facet pinning and clear duplicate-filter ownership remain separate concerns. Current focus/scroll geometry has not been browser-verified here. **Kind:** capability and verification. |

## Filtering, selection, and linked views

| ID / outcome / intent | Current support | Remaining gap / proof |
| --- | --- | --- |
| FILT-01 · Explain exactly which population a view represents · Core | Active counts, local Rows/search labels and owner navigation are active. Chart traces describe additional populations and exclusions. [T06] [T12] [FILTER] [INV] [CHART] | No universal row-exclusion explanation or ordered filter funnel is established. Peer-filtered mark totals can legitimately differ from global row totals. **Kind:** capability and verification. |
| FILT-02 · Compose filters predictably, including the same field twice · Core | The workspace model intersects independent chart predicates; selected categorical pairs are two intersected field filters. [T12] [INV] [CHART] | Arbitrary unions of category pairs need pair predicates, not independent lists. Effective intersection counts and contradiction explanations remain verification/product gaps. **Kind:** capability and verification. |
| FILT-03 · Find the chart that owns an active filter · Specific | FilterChip labels invoke onShowChart, pointer/focus invokes highlight, and PlotManager wires the callback in Charts and Rows. X alone removes the filter. [T12] [FILTER] [PLOT] | Do not build a second jump-to-owner feature. Prove focus, overflow popovers, expanded panels and keyboard navigation in the real browser. **Kind:** verification. |
| FILT-04 · Reset the current loaded-data subset reliably · Core | Clear all is wired to the provider and explicitly labels chart filters, table searches and Rows filters. [T06] [T12] [FILTER] [BASE] | Reset is scoped to loaded data; it is not a reset of a future remote working set. Verify all scopes and new chart predicates together. **Kind:** verification. |
| FILT-05 · Keep persistent base constraints and independent filter groups · Candidate / parked | Independent workspace instances are a host composition option. [T12] [T15] [INV] | No in-workspace filter islands or stable base-filter layer is established. Do not interpret peer filtering as independent filter groups. **Kind:** parked or task-dependent capability. |
| FILT-06 · Combine graphical ranges with exact input · Core | Range settings, typed column controls and exact-bound disclosure in filter tooltips are present; numeric cell menus create exact or one-sided filters. [T06] [T12] [FILTER] [THDR] [TMENU] | Not every brush has adjacent manual inputs. Display rounding and exact comparison need a documented common contract. **Kind:** capability and verification. |
| FILT-07 · Express unbounded threshold selections · Specific | Filter labels and numeric cell actions support at-or-above/at-or-below intervals with omitted bounds. [T06] [FILTER] [TMENU] [BASE] | A one-sided filter control is not evidence that dragging to a brush edge saves an unbounded interval that remains open after new data arrives. **Kind:** capability and verification. |
| FILT-08 · Reach rare, missing and equal-looking category values · Core | Row charts now expose searchable/paged Other members and select actual typed values, not a displayed Other label. [T06] [T09] [CHART] [NUM] | Prove stable saved membership after resize, rank changes and restore. This does not establish one universal category picker across all controls. **Kind:** capability and verification. |
| FILT-09 · Search intended values and explain each match · Core | The table search reads every resolved row field except __ID. Hidden source fields therefore participate. Calculated fields join resolved rows. [T06] [T09] [BASE] [TABLE] [INV] | No visible-field-only search option or match highlighting was found in the reviewed table paths. This is a missing option, not evidence that current substring search is broken. **Kind:** capability and verification. |
| FILT-10 · Provide richer queries without harming simple search · Candidate | Substring and typed controls form the baseline. [T06] [T09] [BASE] [INV] | Fuzzy matching, token queries and a unified language remain optional design choices, not necessary failures of the scalar explorer. **Kind:** parked or task-dependent capability. |
| FILT-11 · Select dates with explicit calendar semantics · Core | UTC daily Calendar views, day/week/month line rollups, period/series selection and date controls now exist. [T07] [CHART] [ROLL] | Relative rolling versus completed periods, quarter/year presets and calendar stepping are not supplied by those additions. Freeze or encode the reference time for any future relative filter. **Kind:** capability and verification. |
| FILT-12 · Use distributions to guide filters · Specific / candidate | Inline table/header graphics, field inspection and Calendar views provide substantial distribution-guided interaction. Re-clicking a header mark can clear its filter. [T06] [T07] [TABLE] [THDR] [CHART] | No-inline-histogram is stale. More domain-specific natural-break or calendar-density pickers remain narrower optional scope; verify population counts now. **Kind:** capability and verification. |

## Tables, field inspection, and formatting

| ID / outcome / intent | Current support | Remaining gap / proof |
| --- | --- | --- |
| TABLE-01 · Hide, recover and reorder columns · Core | The active table mounts a header drag hook and context menu with hide, show hidden, move left/right/first and selected-column settings. [T02] [TABLE] [THDR] [TMENU] | Named column sets and broader durable view ownership remain absent from the reviewed slice. Keyboard access and width/order restore require current proof. **Kind:** capability and verification. |
| TABLE-02 · Choose useful widths and adjust them quickly · Core | Name-based default width, pointer resize, keyboard resize and Reset width are active. [T02] [TABLE] [THDR] [TMENU] | No content-aware auto-fit or double-click fit is present in the reviewed header/menu paths. Reset width returns a name-based default, not a content fit. **Kind:** capability and verification. |
| TABLE-03 · Sort correctly and return to source order · Core | Clear sort is active in the context menu. The header itself toggles ascending/descending. Natural sorting is described in the inventory. [T09] [THDR] [TMENU] [INV] | Do not say source-order reset is missing. A third header-click reset remains a preference gap; null ordering and natural-order accuracy need independent fixture proof. **Kind:** capability and verification. |
| TABLE-04 · Use readable aliases while preserving canonical names · Core | Field settings provide display labels/descriptions and filter chips use shared labels. [T02] [T09] [FILTER] [TMENU] [INV] | Automatic prefix cleanup and alias history are optional follow-ups; verify header, copied canonical names and exported field identity remain distinct. **Kind:** capability and verification. |
| TABLE-05 · Keep display formatting consistent and analytically truthful · Core | Shared chip formatting includes extra exact-bound disclosure; R19 is recorded fixed for details, counts and variance units. [T02] [T08] [T09] [FILTER] [BASE] [INV] | Do not repeat the old currency-count bug as current fact. Test axes, new trace dialogs and every aggregate's units; a single table example is insufficient. **Kind:** capability and verification. |
| TABLE-06 · Read long and structured text without losing meaning · Specific | Compact scalar cells and raw-value access are described; copy-value and copy-row actions now exist. [T04] [TMENU] [INV] [BASE] | Wrapping, chosen truncation side, code/newline presentation, persistent row detail and configurable row heights are not established. Copying is not rich in-place reading. **Kind:** capability and verification. |
| TABLE-07 · Render tag collections, images, histories and related records · Specific / parked | The declared data model remains scalar; JSON flattens nested objects/arrays. [T04] [T05] [INV] | No typed rich-cell extension contract is established. Indexed tag columns do not preserve a collection as one semantic field. **Kind:** parked or task-dependent capability. |
| TABLE-08 · Adapt to a small number of records or very wide records · Candidate | The table remains the common record presentation. [T01] [T19] [INV] [PLAN] | Transpose, record cards and automatic small-record layouts are not established. A generic templating DSL is neither a prerequisite nor a delivered substitute. **Kind:** parked or task-dependent capability. |
| TABLE-09 · Bookmark records or retain interesting cohorts · Specific | Active chart filters can describe a temporary subset and saved JSON can retain them. [T01] [T08] [INV] | Stable row bookmarks, tags and a named cohort collection are not established. Durable source identity is a dependency, not a reason to add a bookmark icon alone. **Kind:** capability and verification. |
| TABLE-10 · Inspect calculated values alongside source records · Core | DataTable merges calculated column values into resolvedRows, then passes them into filtering and the displayed body; calculation inspectors are described. [T11] [T13] [T15] [TABLE] [BASE] [INV] | Current correctness across edit, filter, sort, search, copy and export must be re-proved together. Scalar inspection is not an aggregate computation graph. **Kind:** verification. |
| TABLE-11 · Export the rows and values being inspected · Specific | The active table supplies filteredRows to the toolbar; the baseline records CSV escaping, ordering and derived-value repairs. [T11] [T15] [TABLE] [BASE] | Browser download inspection was previously incomplete and is blocked here. Prove exported IDs/order/values, quoting, and field names against the visible scope. **Kind:** verification. |
| TABLE-12 · Edit cells or apply conditional formatting only when useful · Candidate | Display formatting and copy/filter cell actions are present; they are not edits. [T02] [T04] [T09] [TMENU] [INV] | Inline mutation, typed validation/undo and a general conditional-rule engine are not established. These remain task-dependent, not universal EDA obligations. **Kind:** parked or task-dependent capability. |

## Calculations and reusable transformations

| ID / outcome / intent | Current support | Remaining gap / proof |
| --- | --- | --- |
| CALC-01 · Create scalar derived fields · Core | The recorded evaluator supports arithmetic, comparisons, conditional logic, functions and bracketed field references. [T11] [T13] [BASE] [INV] | Scalar expressions are not grouped/window calculations. Current formula execution is not freshly tested in this audit. **Kind:** verification. |
| CALC-02 · Reject invalid calculations before damaging saved state · Core | The recorded workflow validates syntax, dependencies, cycles and source rows before Apply; October 2 tested an invalid draft. [T09] [T15] [BASE] [REVIEW] [HOST] | One invalid syntax case does not cover unknown functions, cycles, dependent edits or full-analysis import atomicity. **Kind:** verification. |
| CALC-03 · Explain invalid or missing derived results · Core | Saved/draft row previews, source inputs and row failure reasons are described. [T09] [T15] [BASE] [INV] | Evidence is session/dataset-specific rather than a durable execution history. Distinguish missing input, conversion failure and calculation failure. **Kind:** capability and verification. |
| CALC-04 · Use documented functions consistent with runtime · Specific | The baseline records a shared searchable function registry and cursor insertion. [T11] [T17] [BASE] [INV] | No general group or array-expression grammar is established. Revalidate help against exports before adding more function names. **Kind:** verification. |
| CALC-05 · Edit a calculation and update every dependent consumer · Core | Dependency previews and explicit Apply are described, with protected in-use rename/delete and preserved filter thresholds. [T11] [T15] [BASE] [INV] | Saved drafts, automatic consumer rewrites and a durable edit history remain separate gaps. New chart consumers need integration proof. **Kind:** capability and verification. |
| CALC-06 · Use a consistent computed result in every view · Core | Tables resolve shared scalar columns; grouped summaries and UTC rollups reuse definitions/reducers; newer traces retain source inputs. [T11] [T15] [TABLE] [ROLL] [CHART] [CLOSE] | Shared function code is not proof of one execution or cached shared result. Cross-view arithmetic and eligible-ID agreement were waived for newer charts. **Kind:** capability and verification. |
| CALC-07 · Keep row, group and window computations semantically distinct · Core | Scalar formulas and named count/sum/average groups are different controls; calendar rollups add explicit period scope. [T11] [T16] [T17] [BASE] [CHART] | Window/rank expressions and arbitrary grouped formula composition are not established. Row sum(x,y) must not be presented as a dataset sum. **Kind:** capability and verification. |
| CALC-08 · Inspect and reuse grouped, pivot and statistical outputs · Core / architecture open | Named grouped summaries are reusable; pivot and many new chart families now expose contributors. [T11] [T13] [T15] [T16] [T17] [CHART] [INV] | Inspection is wider than reuse. Pivot outputs, density samples and modeled tables are not established as named downstream sources. **Kind:** capability and verification. |
| CALC-09 · Add regression, uncertainty and density at the intended grouping scope · Specific / now planned | Box/violin density and rectangular scatter count bins exist. PR136 adds scoped plans for regression, LOESS, hexagons and 2D contours. [T15] [T17] [CHART] [PLAN] | The merged PR explicitly changes no application code. Fits, confidence layers, marginals and contour density must remain planned-only until implementation and browser proof exist. **Kind:** capability and verification. |
| CALC-10 · Make analytical transformations deterministic and interpretable · Core | Shared numeric rules, UTC calendar arithmetic and chart-specific trace contracts improve determinism. [T15] [T18] [NUM] [ROLL] [CHART] [INV] | Stable source IDs across reload, durable source versions and a renderer-independent replay contract are not established; deterministic layout is narrower than deterministic analysis history. **Kind:** capability and verification. |
| CALC-11 · Identify and inspect scalar dependency chains in place · Core | The calculation workflow exposes markers, row inputs/results, upstream/downstream dependencies and affected consumers. [T08] [T15] [BASE] [INV] | Preserve the boundary between scalar dependency inspection and whole-chart provenance. Verify deep-chain edits in a real mounted workspace. **Kind:** verification. |

## Facets, axes, and color

| ID / outcome / intent | Current support | Remaining gap / proof |
| --- | --- | --- |
| FACET-01 · Repeat suitable views by one or two fields · Core | Wrap/grid layouts exist for the supported 2D families; current catalogue breadth is larger than facet eligibility. [T14] [T16] [INV] [BASE] | No requirement to facet every view type. Explicit-list repetition, deeper nesting and repeat outside grouping remain separate design candidates. **Kind:** parked or task-dependent capability. |
| FACET-02 · Use comparable scales across facets · Core | The baseline describes full-source domains/order; October 2 reports matching regional x/y ticks. [T14] [BASE] [REVIEW] | Proof covers one comparison, not every changed-field, empty-cell, scale type or new mode combination. **Kind:** verification. |
| FACET-03 · Choose global-coordinate versus facet-local selection · Specific | The reviewed model applies chart selection across facets and labels its scope. [T14] [BASE] [INV] | Facet-key-bounded XY selection is a separate missing option, not a bug in the approved global-coordinate default. **Kind:** parked or task-dependent capability. |
| FACET-04 · Filter by clicking facet headers · Specific | The baseline records typed wrap/grid header filters and keyboard selection. [T14] [BASE] [INV] | Do not retain an old missing-header-action claim. Verify owner identity, clear behavior and source counts after combined facet/chart selections. **Kind:** verification. |
| FACET-05 · Choose and order displayed facets without filtering rows · Specific | Ordered visibleFacetIds, paging and focus are recorded. [T14] [BASE] [INV] | Top-group selection, nested repeats and a durable pin workflow are not established. Visibility is not membership filtering. **Kind:** capability and verification. |
| FACET-06 · Keep facets readable without internal chart scrolling · Explicit preference | Paging, focus and ordered visibility are recorded as the chosen layout solution. [T14] [BASE] [REVIEW] | Current browser evidence is needed for full labels, page changes and dense/empty layouts. Absence of a scrollbar alone does not prove legibility. **Kind:** verification. |
| FACET-07 · Preserve facet identity across typed values · Core correctness | Typed tuple keys and missing-group policies are recorded, avoiding separator-splitting keys. [T14] [T15] [T16] [BASE] | Test 1 versus string 1, missing values and separator-containing labels with new mode combinations; durable row identity remains DATA-04. **Kind:** verification. |

## Scale behavior

| ID / outcome / intent | Current support | Remaining gap / proof |
| --- | --- | --- |
| SCALE-01 · Explain the population that determines a scale · Core | Full-source facet domains and additional chart traces make some scale choices inspectable. [T12] [T15] [INV] [CHART] | No uniform full/working/visible population switch is established. Preserve stable domains under own brushing and disclose exceptions. **Kind:** capability and verification. |
| SCALE-02 · Zoom a numerical axis without changing the row subset · Specific | Map viewport/camera behavior is distinct from analytical filters; common 2D brushes select rows. [T14] [INV] [CHART] [BASE] | No universal 2D axis zoom/reset contract is established. Do not confuse saved axis options or map pan with common chart zoom. **Kind:** parked or task-dependent capability. |
| SCALE-03 · Use linear, categorical, symlog and calendar scales meaningfully · Specific | The manifest now supports UTC time specifically for Line Chart calendar summaries, alongside linear, band and symlog. [T07] [T11] [T14] [T18] [COV] [CHART] [ROLL] | True log remains explicitly unsupported. Raw numeric days are not dates; calendar support must not be generalized to all date-like axes. **Kind:** capability and verification. |
| SCALE-04 · Share formats and disclose local overrides · Core | Field defaults, labels and exact filter-bound disclosure exist. [T08] [T15] [FILTER] [INV] | Uniform axis tick units, override origin and generated-versus-explicit values are not established across all 18 families and new modes. **Kind:** capability and verification. |

## Color behavior

| ID / outcome / intent | Current support | Remaining gap / proof |
| --- | --- | --- |
| COLOR-01 · Preserve category meaning across views · Core | Shared scale IDs, field bindings and editing are described; historical category keys have reviewed examples. [T08] [T14] [INV] [BASE] [REVIEW] | Line series and specialized chart color paths need fresh cross-view comparison; source-field and renamed-scale identity must be checked rather than inferred. **Kind:** capability and verification. |
| COLOR-02 · Explain every non-obvious encoding automatically · Explicit preference | Automatic and dedicated legends exist; new maps, sizes and density add more encodings. [T14] [COV] [INV] [CHART] | The manifest's universal wording exceeds one reviewed categorical legend. Numeric density/area/projection/series legends require independent checks. **Kind:** capability and verification. |
| COLOR-03 · Select or emphasize through legends · Specific | Typed categorical legend filtering is described. [T14] [INV] [BASE] | Continuous legend brushing and linked hover emphasis are not established as general contracts. A visible color ramp is not interactive numerical selection. **Kind:** capability and verification. |

## Individual charts and advanced chart ideas

| ID / outcome / intent | Current support | Remaining gap / proof |
| --- | --- | --- |
| CHART-01 · Distinguish bar glyph inputs from count and measure transforms · Core distinction | Counts, histograms, grouped count/sum/average measures, grouped series and stacks are delivered. [T11] [T18] [CHART] | Arbitrary supplied-measure glyph grammar and repeated raw labels remain broader authoring scope. A new mode is not proof of denominator correctness. **Kind:** capability and verification. |
| CHART-02 · Explore relationships and inspect selected records · Core inspection / specific extras | Scatter now has row tracing, point/range selection, bubble area and rectangular density bins. [T11] [T14] [T15] [CHART] [PLAN] | Regression/uncertainty/hexagons/marginals/contours are planned, not delivered. Overlap, size provenance and exclusion visibility need current browser proof. **Kind:** capability and verification. |
| CHART-03 · Draw lines according to data shape and time meaning · Specific | Raw lines and UTC day/week/month category series exist; calendar series support area and stacked area; Parallel Coordinates covers a distinct per-row topology. [T16] [T18] [CHART] [ROLL] | Do not claim date lines, grouped series or parallel coordinates are wholly missing. Arbitrary repeated-line/slope grammars and general layer composition remain separate. **Kind:** capability and verification. |
| CHART-04 · Compare and inspect distributions · Core / richer layers specific | Box/violin/observations/beeswarm traces now explain statistics, density inputs, exclusions and source observations. [T14] [T15] [T17] [CHART] | The old missing-box-contributor backlog is stale. Reusable density outputs and live local bandwidth editing remain narrower follow-ups. **Kind:** capability and verification. |
| CHART-05 · Inspect and reuse aggregates with correct denominators · Core / derived measures specific | Pivot contributors and reusable grouped summaries exist; newer stacks/cards/time views expose more aggregate semantics. [T11] [T13] [T15] [CHART] [INV] [BASE] | Pivot-as-source, subtotal hierarchies, percentages and prior-period calculations are not generally established. New generic charts do not close every pivot outcome. **Kind:** capability and verification. |
| CHART-06 · Coordinate 3D with the analytical workspace · Exploratory broader grammar | 3D receives filters and has saved camera/size/omission behavior; historical Lorenz proof is available as a report. [T12] [T15] [CHART] [INV] [REVIEW] | Point picking, complete data-scale labeling and per-point provenance are not established. 2D selection driving 3D is not 3D-originated selection. **Kind:** parked or task-dependent capability. |
| CHART-07 · Use non-plot views as analytical context · Core supporting views | Summary, source tables, legends, rich explanation and now Metric Card support the workflow; inline table distributions are active. [T09] [T13] [T14] [T19] [TABLE] [CHART] | Static text is not live data-bound narrative; metric all-source comparison is not a frozen baseline; every supporting view needs a clear population label. **Kind:** capability and verification. |
| CHART-08 · Draw grouped, stacked, normalized bars and areas · Exploratory examples / later delivered scope | Grouped bars, absolute/percentage stacks, area and stacked area are explicitly delivered chart modes. [T18] [CHART] | Do not list the whole family as missing. Streamgraph and generalized stacking/dodging output reuse remain unestablished, lower-priority architecture extensions. **Kind:** capability and verification. |
| CHART-09 · Represent multivariate rows and hierarchies appropriately · Exploratory | Parallel Coordinates is active and registered. [T18] [REG] [CHART] | Hierarchy-aware treemap/packing remains outside the delivered catalogue. Separate the delivered multivariate slice from uncommitted hierarchy examples. **Kind:** parked or task-dependent capability. |
| CHART-10 · Distinguish data transforms from geometry transforms · Core explainability / architecture open | Stack bounds, density-bin intervals, bubble area, map projection and parallel vertices appear in chart-specific traces/contracts. [T18] [CHART] | There is no established general inspectable geometry pipeline whose output can be substituted or reused independently of a chart renderer. **Kind:** parked or task-dependent capability. |

## Traceability, declarative specifications, and reproducibility

| ID / outcome / intent | Current support | Remaining gap / proof |
| --- | --- | --- |
| TRACE-01 · Inspect exact source contributors for a selected mark · Core | Current chart contracts extend beyond scalar/pivot/named groups to bins, distributions, scatter, time, stacks, maps, flows and ECDF. [T11] [T15] [CHART] | The old histogram/box/scatter contributor absence is stale. Trace reachability, selected mark identity, exclusions and roundtrip consistency are not freshly verified. **Kind:** capability and verification. |
| TRACE-02 · Inspect every intermediate result and reuse it where useful · Core | Named group results and many chart-specific trace stages are described. [T11] [T13] [T15] [CHART] [INV] | Broad inspection does not establish every intermediate as a named reusable table. Reduced lines, density/model outputs and general transform composition remain uneven. **Kind:** capability and verification. |
| TRACE-03 · Explain properties, defaults, scales and denominators · Core | New traces include stack bands, numeric exclusions, date bounds, projections, ECDF denominators and source inputs. [T15] [CHART] [INV] | No universal every-property provenance contract is established. Test parameter origins, own-versus-peer filtering and overridden settings instead of counting trace dialogs. **Kind:** capability and verification. |
| TRACE-04 · Connect friendly controls to an expanded specification · Candidate / now planned | Chart settings and chart-spec inspection provide bounded configuration; PR136 plans compact dashboard authoring. [T16] [T17] [PLAN] [INV] | A settings inspector is not an interchangeable source/transform/filter/scale/glyph compiler. The DSL PR is documentation-only and not runtime support. **Kind:** capability and verification. |
| TRACE-05 · Reproduce an analysis independently of the current renderer · Specific / architecture parked | Settings restore and full-analysis bundles preserve applied application state with source rows. [T15] [T16] [INV] [HOST] | No renderer-neutral scene, stable source version or headless semantic evaluation contract is established. Restoring React is not independent analytical reproduction. **Kind:** parked or task-dependent capability. |
| TRACE-06 · Reuse grouping, repetition and derived layers without manual duplication · Candidate | Facets and grouped/calendar definitions cover bounded repetition; new advanced scatter plans specify grouping/facet behavior. [T16] [T17] [PLAN] [CHART] [INV] | General explicit-list repeat, model-layer inheritance and common group-object outputs remain unresolved or planned, not delivered. **Kind:** capability and verification. |
| TRACE-07 · Keep product intent, implementation and proof synchronized · Core process | A transcript audit, feature inventory, matrix, historical review and retirement records all exist. Tests enforce useful catalogue invariants. [T10] [T20] [BASE] [INV] [COV] [COVTEST] [REVIEW] [TMP] [CLOSE] | Mixed-age documents conflict; reviews lack revision-bound artifacts in the manifest; October 2 screenshot links point to absent tmp-root files. Add a verifiable claim-to-proof chain. **Kind:** capability and verification. |

## Performance

| ID / outcome / intent | Current support | Remaining gap / proof |
| --- | --- | --- |
| PERF-01 · Keep the loaded workspace interactive · Core | Virtual rows and 10,000-row examples exist; deployed artifact contains the representative data. [T01] [T13] [TABLE] [INV] [DEPLOY] | No current load/filter/Apply/scroll latency or heap measurement. A fixture row count and a successful build are not a capacity envelope. **Kind:** verification. |
| PERF-02 · Compute once when consumers share a result · Core | Shared numeric and UTC reducers improve semantic consistency; scalar caching and named definitions are described. [T11] [T13] [T17] [NUM] [ROLL] [BASE] | A reused reducer/definition is not proof of shared execution or invalidation correctness. The baseline notes grouped consumers recompute; re-profile current paths before adding cache infrastructure. **Kind:** verification. |
| PERF-03 · Move only needed data and disclose incompleteness · Candidate / parked | One in-memory source is explicit; local examples are whole-file fetches. [T13] [INV] [HOST] | No projected/streamed server protocol or loaded-versus-total disclosure is established. Do not silently turn performance wishes into a backend rewrite. **Kind:** parked or task-dependent capability. |
| PERF-04 · Explain loading and allow long work to be stopped · Specific | The host fetch path has loading, error, retry and stale-request abort handling. [T13] [HOST] [INV] | Local parse progress/cancellation, worker execution and long calculation progress are not established. No current responsiveness measurements were possible. **Kind:** capability and verification. |
| PERF-05 · Measure representative tasks before optimizing · Core method | Repository review reports and deterministic examples give useful starting points. [T20] [INV] [DEPLOY] | No current repeatable browser performance benchmark was run here; no claim can be made about 100k or million-row usability. **Kind:** verification. |

## Errors and accessibility

| ID / outcome / intent | Current support | Remaining gap / proof |
| --- | --- | --- |
| UX-01 · Explain invalid values before they mislead a chart · Core | Shared numeric code excludes blank, boolean and nonfinite measurements; conversion/calculation errors and many chart trace exclusions exist. [T09] [T15] [NUM] [CHART] [INV] | The old no-common-numeric-policy claim is stale. Error reachability and agreement across all new consumers need browser proof. **Kind:** verification. |
| UX-02 · Distinguish empty, invalid, zero and missing results · Core | An unmatched search was historically reviewed; newer charts document valid-zero versus empty versus no-valid-number distinctions. [T06] [T07] [CHART] [REVIEW] | One empty-table case is not every chart's empty-state proof. Test date gaps, all-invalid groups, maps and normalized denominators explicitly. **Kind:** verification. |
| UX-03 · Complete real tasks with keyboard and assistive technology · Core baseline | Named actions, keyboard width control, menu handling, chip focus/highlight and Alt-Enter trace contracts exist. [T02] [T09] [T20] [FILTER] [THDR] [TABLE] [CHART] [REVIEW] | Naming alone is not full accessibility. Canvas/WebGL marks, brushing, focus return, virtual rows and screen-reader outcomes remain unverified here. **Kind:** verification. |
| UX-04 · Keep presentation useful at the supported screen size · Specific / desktop baseline | The stated workspace minimum is 1024 CSS pixels. Selected historical examples were checked at 1280/1024, with limited narrower flows. [T01] [T14] [T19] [INV] [REVIEW] | Do not infer mobile support from 390-pixel spot checks. New modes, floating inspectors, menu collisions and long labels need current desktop proof. **Kind:** verification. |

## Verified mismatches and source-derived risks

No new runtime defect was reproduced in this review or Pro's run.
The previous report records 19 repairs, R01–R19. They remain historical fixed or implemented records.
See [the complete repair table](reviews/pro-gap-analysis-2026-10-05/prior-transcript-gap-analysis.md#verified-mismatches-and-source-derived-risks).
Do not reclassify a repair as broken without a failing source or runtime example.

## Suggested order and decisive proof scenarios

Use the [priority report](reviews/pro-gap-analysis-2026-10-05/priorities.md) for the proposed order.
The [35 Pro scenarios](reviews/pro-gap-analysis-2026-10-05/original/data/browser-scenarios.json) are unexecuted proposals.
Some ask about missing or parked features. They are audit questions, not 35 existing features that must pass.
BT01 must preserve saved layouts and keep quick previews separate from chart creation.
BT22 and BT29 test edited state restore; loading a preset example does not meet that proof.

## Transcript coverage ledger

The [20-transcript ledger](reviews/pro-gap-analysis-2026-10-05/original/data/transcript-ledger.json) supplies paths, interpretation, and requirement crosswalks.
Pro's interpretations are accepted as review context. They do not create new approved scope.
The original recordings remain in [docs/transcripts](transcripts/README.md).

## Audit limits

Source checks confirmed registry breadth, header distributions, drag/menu wiring, filter-owner callbacks, and hidden-field search.
The actual TypeScript manifest was extracted and compared with Pro's transcription. All feature states and assignments match.
All original package checksum entries passed. These are document/source checks, not application tests.
No fresh render, interaction, screen-reader, download, restore, or performance claim is made.

The original package contains scripts and a deployment ZIP. They were preserved as supplied; imported scripts were not executed.
Read the [validation record](reviews/pro-gap-analysis-2026-10-05/validation.md) for commands and limits.

## Source index

[BASE]: reviews/pro-gap-analysis-2026-10-05/prior-transcript-gap-analysis.md
[INV]: application-feature-inventory.md
[CHART]: analytical-chart-coverage.md
[COV]: ../apps/demo/src/demos/coverage.ts
[COVTEST]: ../apps/demo/src/demos/coverage.test.ts
[COVUI]: ../apps/demo/src/CoverageMatrix.tsx
[HOST]: ../apps/demo/src/LandingPage.tsx
[REG]: ../packages/explorEDA/src/charts/registerAllCharts.ts
[NUM]: ../packages/explorEDA/src/lib/numeric.ts
[FILTER]: ../packages/explorEDA/src/components/ActiveFilterStatus.tsx
[PLOT]: ../packages/explorEDA/src/components/PlotManager.tsx
[ROLL]: ../packages/explorEDA/src/lib/dailyRollup.ts
[TABLE]: ../packages/explorEDA/src/components/charts/DataTable/DataTable.tsx
[THDR]: ../packages/explorEDA/src/components/charts/DataTable/DataTableHeader.tsx
[TMENU]: ../packages/explorEDA/src/components/charts/DataTable/DataTableContextMenu.tsx
[REVIEW]: reviews/2026-10-02-example-coverage.md
[PKG]: ../packages/explorEDA/package.json
[README]: ../README.md
[ARCHIVE]: transcripts/README.md
[T01]: transcripts/2026-06-25-interactive-data-table-explorer.txt
[T02]: transcripts/2026-06-25-table-column-controls.txt
[T03]: transcripts/2026-06-25-interactive-data-table-controls.txt
[T04]: transcripts/2026-06-26-interactive-data-table-rows.txt
[T05]: transcripts/2026-06-26-rich-data-inside-table-cells.txt
[T06]: transcripts/2026-06-28-table-filtering-and-distributions.txt
[T07]: transcripts/2026-06-29-date-filtering-patterns.txt
[T08]: transcripts/2026-06-29-saved-table-views-and-formatting.txt
[T09]: transcripts/2026-06-29-data-table-defaults-and-schemas.txt
[T10]: transcripts/2026-07-13-reusable-interactive-component-requirements.txt
[T11]: transcripts/2026-07-26-data-visualization-system-design.txt
[T12]: transcripts/2026-07-28-dashboarding-filtering-and-chart-defaults.txt
[T13]: transcripts/2026-07-28-data-transforms-loading-and-source-tables.txt
[T14]: transcripts/2026-07-29-faceting-and-shared-scales.txt
[T15]: transcripts/2026-08-02-visualization-traceability-and-dataflow.txt
[T16]: transcripts/2026-08-03-spec-driven-interactive-visualization.txt
[T17]: transcripts/2026-08-04-chart-specs-grouping-and-derived-layers.txt
[T18]: transcripts/2026-08-04-advanced-chart-specs-and-transforms.txt
[T19]: transcripts/2026-08-25-deterministic-ui-templating.txt
[T20]: transcripts/2026-08-27-ui-complexity-and-component-boundaries.txt
[CLOSE]: https://github.com/byronwall/explorEDA/pull/135
[PLAN]: https://github.com/byronwall/explorEDA/pull/136
[TMP]: ../tmp/
[DEPLOY]: https://github.com/byronwall/explorEDA/actions/runs/37259962552
