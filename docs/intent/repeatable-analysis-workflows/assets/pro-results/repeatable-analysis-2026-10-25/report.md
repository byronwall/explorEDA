# Build repeatable, parameterized local investigations

## Decision

**Choose reusable local investigations as explorEDA’s primary workflow. Build a query-bound, parameterized notebook first.** Byron should be able to open a question, choose an entity and period, inspect the resulting charts and records, save that question as a named notebook, and reopen it after the source files change. The useful result is an ordinary local project containing readable analysis text and the data needed to revisit it.

The leading capability is **one existing project query feeding one notebook, with explicit typed inputs saved in the notebook text and evaluated against the project’s current data**. Keep charts, prose, source inspection, and the applied population together. Add an in-app route to create another named case after the first complete text-authored journey works. Do not introduce a Recipe object, a run database, or a new execution engine.

This is a product choice for Byron, a developer and the primary analyst. It does not depend on commercial growth, outside customers, telemetry, or a demand study. The benefit is a personally useful, repeatable analytical tool. The competitive hypothesis is that a compact combination of visual authoring, readable text, visible scope, and record-level inspection will suit his recurring investigations better than repeatedly wiring a custom notebook application.

**This capability is proposed.** The supplied baseline already saves queries, view bindings, charts, and notebook text. What it does not connect is notebook parameter input, current query evaluation, and query evidence. A generic recipe catalogue would largely rename what exists.

### Five decisions at a glance

| Rank / ID | Capability bet | Disposition and reason |
| --- | --- | --- |
| 1 / **RA01** | Parameterized local investigation notebooks | **Build.** Complete the missing input → query → notebook → inspection → saved return loop. |
| 2 / **RA02** | Live descriptive findings attached to an explicit chart owner | **Build next, selecting #507.** Make supported values in prose follow the investigation without inventing a second calculation contract. |
| 3 / **RA03** | Saved evidence with a bounded recipient inspection mode | **Explore.** A valuable extension of the completed investigation, but preserving a past result requires a separate capture contract. |
| 4 / **RA04** | Explicit overview-to-detail navigation and, later, paired cases | **Explore.** Reuse a question from a selected entity while preserving the caller and making destination scope explicit. |
| 5 / **RA05** | One reusable descriptive rate or analytical result across consumers | **Explore.** Useful for a named calculation whose meaning must agree in a card and grouped view; keep it narrower than a semantic layer. |

Start RA01 now. No open proposal is a prerequisite to its first milestone. RA02 is the best already-researched addition after it.

## 1. Evidence, access, and the product boundary

### What was inspected

The complete prompt, all **35 baseline files**, and all **eight separately marked unbuilt proposal summaries** were read. Omitted decisive notebook, parameter, query-inspection, and app-lifecycle modules were read through connected GitHub at the exact supplied baseline:

`95832bd473884aeae23453af0888b4ca5187820d`.

The packet labels that baseline October 25, 2026; the user-facing research session is October 24 in America/Indianapolis. This report uses the supplied revision, not an assumed newer main. Primary documentation was checked during this session. The complete file inventory is at the end.

Three evidence categories apply throughout:

- **Source fact:** behavior established by the supplied code/docs or additional code at the pinned revision.
- **Proposal / product judgment:** the recommended workflow, ownership changes, prioritization, milestones, and rough effort.
- **Unverified:** mounted UI behavior, new-feature tests, accessibility conformance, capacity, latency, comparative usability, and recipient experience. No running-product review was performed.

Independent arithmetic checked the illustrative request fixture. That is evidence for its expected memberships and values, not acceptance of an unbuilt notebook feature. Test results mentioned inside earlier proposal summaries belong to those earlier reviews; they were not rerun here.

### Give each surface one job

| Surface | Current evidence | Recommended responsibility |
| --- | --- | --- |
| React package | Hosts supply rows or projects and own persistence, navigation, and callbacks. | Keep it storage-neutral. Supply a small project-aware notebook component and reusable input/evidence behavior. |
| Local folder app | Reads project and analysis text, owns working notebook text, watches files, and queues saves. | **Own the complete primary journey:** open, edit inputs, inspect, save, create a named case, and reopen. |
| Demo workspace | Owns saved views, project checkpoints, undo, and history. | Demonstrate and verify components; do not mistake its history system for folder-app persistence. |
| Published daily pages | Have a separate corpus, layout, and finding-verification workflow. | Serve as examples and authored delivery; do not make their publishing pipeline the storage owner of personal investigations. |

Sources: `README.md`; `packages/explorEDA/README.md`; `apps/app/src/ProjectWorkspace.tsx`; `apps/app/src/saver.ts::FolderSaver`; `apps/demo/src/SavedViewsWorkspace.tsx::capture/captureProject`; `docs/daily-viz.md`. The supplied code includes team-related surfaces, but this strategy requires no new accounts, hosting service, or tenancy model.

### The current capability is stronger than the older intents imply

The following facts decide the plan:

1. **Queries and typed inputs already exist.** `AnalysisProject.parameters`, `FilterStep.parameterId`, and `AnalysisView.bindings` supply a useful model. `analysisText.ts::analysisViewQueries` reads bindings on saved `view` headers; `exportAnalysisText` writes them back. Source and lookup/expand/calculate/filter/aggregate stages already exist. General reusable ordered-window operations do not. [C01][C02][C03]

2. **Notebooks do not currently apply those inputs.** `readNotebook.ts::namedQuery` extracts a query ID, and `readNotebookText` calls `evaluateAnalysisQuery(project, tables, query.id, {})`. It maps results to `row.data`, losing the returned evaluation’s lineage and diagnostics at that boundary. `ProjectWorkspace` then renders the notebook using `notebook.result.rows` from folder loading. This is the principal missing connection. [C04][C05]

3. **Notebook sheets are one analysis, not multiple runs.** `compileNotebook` compiles definitions across all blocks; `notebookSheets` splits reading. `ExplorEdaNotebook` enables `localSelections`. A chart brush therefore does not define the population of every other chart or sheet. [C06][C12][C13]

4. **Notebook write-back deliberately excludes transient selections.** `writeBack.ts::skippedKey` omits `select.*`, and `textPart` removes chart filters/layout from the comparison used to write authored settings. Authored restrictions such as `where.*` remain meaningful text. Changing an input needs an explicit notebook text operation, not an assumption that brush write-back saves it. [C07]

5. **“Frozen” on a broken notebook block is not historical evidence.** `compileNotebook` substitutes the last valid block text and recompiles it against the supplied current rows. It does not preserve historical input data or output. [C12]

6. **Saving is host-specific.** `FolderSaver` delays writes and reports failure; it is not the demo’s undo stack. Its `flush()` resolves after writes whose errors are caught and reported through `SaveState`; resolution alone is not proof that every file saved. `App` preserves selection through its own watcher reload but does not provide durable last-open notebook/sheet restoration across an entire new session. [C08][C10][C11]

7. **Source references are useful but have distinct meanings.** Valid unique source keys give semantic row keys; missing/duplicate keys can fall back to positions. Direct `sourceRows`, broader `contributors`, and per-measure ledgers are not interchangeable. Query `counts.excluded` is the final stage’s exclusion count, not every loss in the whole pipeline. These distinctions should guide the new inspection labels rather than trigger a general robustness project. [C03][C09]

8. **A notebook without a text-change callback is not a complete read-only product.** It loses editing/persistence affordances but its chart component still accepts interaction, and its props have no `readOnly` flag. Native project sharing, controlled read-only viewing, and immutable evidence are three different promises. [C06]

The old demand gates in the three intent briefs and R049/R041 do not veto new capability. `docs/research/DIRECTION.md` explicitly supersedes them. Their useful technical distinctions remain relevant.

## 2. Choose the user and the repeated job

### Primary analyst and scenario

The primary analyst is Byron, working alone on local CSV/JSON extracts or already-supported project sources. A representative question is:

> For this service and this period, what does request duration look like, which measurements are absent or invalid, and which requests account for the pattern?

He should be able to ask the same question for another service or period without copying calculations across unrelated dashboards. When a source export is corrected or extended, he should reopen the saved question and see a fresh result with its current scope.

This scenario is a strategic example, not a claim about a production dataset or an observed user failure. Its descriptive methods are already available: count, average, table, and ordinary charts. It avoids needing a statistical-method feature before proving the workflow.

The repeated job has five durable parts:

- **Input:** project source files and an explicit query defining a row.
- **Question:** typed service/from/until inputs plus the notebook’s authored restrictions.
- **Investigation:** charts, current query rows, and relevant source records.
- **Result:** an editable notebook whose supported charts recompute, with authored interpretation beside them.
- **Return:** reopen the same named question against the folder’s current sources; deliberately preserve a separate data copy when an earlier state matters.

### Compare the three plausible directions

| Direction | Complete job it would prioritize | Decision |
| --- | --- | --- |
| **Reusable local investigations** | Load related data, prepare a query, apply a question’s inputs, inspect exceptions, save a coherent analysis, revisit after updates. | **Choose.** It connects recent project and notebook work into a bounded personal workflow with one known host. |
| **Interactive narrative delivery** | Author a story, publish an interactive page, let recipients explore it, update or preserve the published result. | **Secondary outcome.** Valuable, but the first product would compete directly with mature publishing workflows and need reader/capture rules immediately. |
| **Embedded analysis workspace** | A developer embeds exploration into an application and implements its storage, routing, identity, and result handoff. | **Retain as an architectural strength.** It leaves the complete analytical job to each host, so it is a weaker organizing priority for this small project. |

The local choice does not abandon embedding or polished prose. It chooses where the workflow is completed and tested. One folder app can demonstrate the same package components that hosts may later embed.

### The advantage is a combination, and remains a hypothesis

explorEDA can plausibly be attractive when a reusable descriptive investigation fits its supported query and chart model:

- Visual chart edits and readable text describe the same authored notebook.
- The question’s inputs and applied row population stay visible.
- A result can lead directly to the relevant current records.
- The saved form stays in the same local project used to prepare and inspect data.
- A subsequent visit begins with the question already assembled.

These are product judgments. No comparative time saving or lower learning cost has been measured. If the question requires extensive custom statistical code, a bespoke public interactive, or complex preparation, another tool may be the better recommendation.

## 3. Strong alternatives on the same job

The comparison uses the same service/period investigation, including source update and handoff. It compares documented workflows rather than chart counts. Primary sources were used throughout.

### Compact comparison

| Tool | Sequence from data to repeatable result | Strategic consequence |
| --- | --- | --- |
| **Observable Framework / Notebooks 2.0** | Load files or query data; write transformations and reactive inputs; connect plots and prose; deliberately refresh prepared data; build/share a notebook or static site. | Strong alternative for developer-authored interaction. Local files, reactivity, and saved query data are already competing capabilities. |
| **Quarto with Jupyter or R** | Prepare data in code; declare parameters; calculate charts and inline prose; rerender for a new period; deliver HTML/PDF or an interactive OJS document. | Strong alternative for programmable analysis and repeated reports. It is not limited to static output. |
| **JMP** | Import data; record preparation and analysis; inspect reports; save/rerun a workflow; package it with data or export supported interactive HTML. | Especially strong for repeatable statistical/engineering investigations. Workflow recording and portable delivery are incumbent strengths. |
| **Orange** | Connect File, selection, plotting, and table widgets; inspect selected cases; save the workflow; reload data; add report sections with recoverable workflow states. | A direct visual investigation competitor, not merely a preparation utility. |
| **Power Query in Excel** | Connect sources; record transformations; bind typed parameters; inspect stages; load to Excel reports; refresh; share the workbook or query definition. | Repeated data preparation is parity. Keep an upstream route for tasks its transformations already solve. |

### Observable: serious overlap, including local workflows

For this question, an Observable author can load request data, define service/date inputs, derive a filtered table, and make charts and prose depend on it. Framework evaluates downstream code from variable dependencies. Its loaders produce build-time data snapshots; runtime loading is also possible. A static build is a delivery option, with data refresh governed by its preparation and cache choices. [W01][W02]

The current Notebooks 2.0 documentation matters to this strategy. It describes a human-readable local notebook format, Observable Desktop, Notebook Kit’s static build/Vite integration, and cached database query results with deliberate refresh. The site still calls this a **Technology Preview**. Do not collapse Framework and Notebook Kit into one implementation, or dismiss the preview because an older comparison assumed Observable meant cloud-only notebooks. [W03][W04][W05]

**Where explorEDA can try to win:** productize common chart editing, scoped record inspection, and saved question inputs so Byron does not have to assemble that particular interaction in JavaScript each time. That is an integration hypothesis.

**Where parity is enough:** local readable files, reactive values, parameters, and ordinary exports.

**Where Observable should remain the recommendation:** bespoke interactions, custom visualization logic, and public interactive stories whose design merits application code. It also remains a credible developer-owned local notebook option.

### Quarto/Jupyter: parameterized computation and publishing already form a complete workflow

A Quarto analysis can read and prepare request data in Python or R, declare service/period parameters, compute summaries, and insert calculated values into prose. The same source can be rendered with new parameter values from the command line or a parameter file. Quarto also supports reactive Observable JavaScript and can pass prepared Python/R data into that browser-side layer. It would be inaccurate to portray the competitor as a collection of static charts. [W06][W07][W08]

Its execution contract is explicit. `freeze: auto` governs reexecution during project renders based on source-file changes; the documentation warns that changed input data needs appropriate rerendering. Rendering an existing Jupyter notebook does not execute its cells by default unless execution is requested. These are workflow distinctions, not evidence that Quarto cannot handle refresh. [W09]

**Where explorEDA can try to win:** a bounded direct-manipulation loop for ordinary descriptive questions, with the supported query scope and record route supplied by the product.

**Where parity is enough:** saving parameters and calculating descriptive values.

**Where Quarto should remain the recommendation:** substantial Python/R analysis, programmable methods, batch generation, publication formatting, and multi-format documents. Do not recreate a language kernel or general notebook execution environment.

### JMP: the strongest challenge for engineering-style repeatability

JMP’s Workflow Builder documents recording preparation and analytical actions, rerunning a workflow, saving a `.jmpflow`, and packaging it with associated data. Its official example includes formula preparation, a summary table, a plot, replay, and a shareable workflow package. Reference management supports replacing source tables or columns. This is close to the entire proposed repeatable-investigation job. [W10][W11]

For a browser recipient, JMP exports interactive HTML with embedded data and a documented subset of JMP interactions. Unsupported features can remain static. That is a stronger delivery story than a PNG, while still being different from rerunning an arbitrary JMP analysis in a browser. The claims here use the retrieved 19.2 documentation; newer 20.0 help encountered during research was marked draft. [W12]

**Where explorEDA can try to win:** a narrowly tailored, text-and-visual investigation in Byron’s existing React/local-file project.

**Where parity is enough:** repeatable inputs, clear data scope, and a native project handoff.

**Where JMP should remain the recommendation:** work that depends on its statistical platforms, established engineering methods, or an existing JMP workflow. The unbuilt histogram and residual-inspection plans do not make explorEDA a general replacement for that suite.

### Orange: visual preparation, inspection, and recoverable reports

Orange’s documented workflow can load a file, filter rows, show a plot, and pass selected points to a Data Table. Its one-way widget connections make data flow explicit. A service/period question can be represented as a saved graph with selected-case inspection downstream. [W13]

The `.ows` file saves workflow structure and settings, but not the input data; data must accompany the workflow. Orange’s report feature can save HTML, PDF, or `.report`. The native report can restore the workflow state associated with a report section. Therefore, “save the steps and return to the explanation” is already a strong competing capability. This does not establish that every report format captures all historical input bytes. [W14][W15]

**Where explorEDA can try to win:** make the written question and its editable charts the principal reading surface, with compact scope and source inspection.

**Where parity is enough:** selected-row access and saved preparation definitions.

**Where Orange should remain the recommendation:** visual processing/modeling pipelines and investigations where multiple processing branches are the central abstraction. Building a general graph editor would divert this project from its narrower advantage.

### Power Query: preparation and refresh should often remain upstream

In Excel, Power Query records transformation steps while leaving the source unchanged, and applies those steps again on refresh. Parameters supply reusable typed values for transformations and functions. The output then feeds the worksheet/Data Model and Excel’s reporting surfaces. Query management distinguishes duplicate and referenced queries; a connection export can preserve query definitions and transformation steps. [W16][W17][W18]

For the request investigation, it can prepare the service/period table and refresh it repeatedly. Excel or Power BI supplies the reporting layer; Power Query alone is not the entire visualization product. Platform-specific connector support was not compared, and no Windows/Mac/Web parity claim is made.

**Where explorEDA can try to win:** combine prepared rows, visible question scope, authored prose, and interactive evidence inspection in one dedicated analysis surface.

**Where parity is enough:** saved steps, parameter controls, and refreshed data.

**Where Power Query should remain the recommendation:** recurring cleaning and combination that already fits a spreadsheet/BI workflow. Importing its prepared output is a valid explorEDA input, not a strategic failure.

### Mosaic: a useful architectural comparator, not the next product direction

Mosaic provides coordinated clients and selections with explicit combination rules, including client-specific omission for crossfiltering. It is highly relevant when a developer wants to build an embedded linked-view application. The host still decides how its application’s question, persistence, and handoff work. [W19][W20]

Reuse the earlier Mosaic research as a source of selection ideas. Replacing explorEDA’s provider and query evaluator would not, by itself, finish the local investigation. No comparative scale or latency claim is needed to make that decision.

### What must be better, and what does not need to be unique

The choice of explorEDA should rest on the completed workflow’s fit: can Byron use a saved question, manipulate its supported charts, inspect relevant records, revise the explanation, and return without rebuilding the surrounding application? The first example and acceptance journey should demonstrate that sequence.

It does not need novel parameter syntax, more connectors than Power Query, more methods than JMP, more visual programming than Orange, or more custom interaction than Observable. Those are explicit concessions, not future requirements disguised as a roadmap.

## 4. Rank the five capability bets

Scores use DIRECTION.md’s four 1–5 dimensions: capability gained, value of deeper Pro research, buildability, and momentum from current work. They are ordinal product judgments, not empirical measurements or an ROI model. RA03 wins the tie with RA04 because it completes the result’s handoff.

| Bet | Capability / Pro / Buildability / Momentum | Total |
| --- | --- | --- |
| RA01: parameterized investigation notebook | 5 / 5 / 5 / 5 | 20 |
| RA02: named live findings, selecting #507 | 5 / 2 / 5 / 5 | 17 |
| RA03: captured evidence and recipient inspection | 4 / 5 / 2 / 4 | 15 |
| RA04: explicit detail navigation / paired cases | 4 / 4 / 3 / 4 | 15 |
| RA05: one reusable rate or analytical result | 4 / 5 / 2 / 3 | 14 |

RA02’s lower new-research score reflects that its design has already been done. It is an attractive implementation bet, not a reason to repeat the same Pro mission.

### RA01 — Build parameterized investigation notebooks

**New possibility.** Use the same notebook question for checkout this week, search this week, and checkout next week; save named inputs and revisit after corrected exports. All sheets share the same applied query result, while each chart retains its own local interaction.

**Fit and building blocks.** Reuse `AnalysisParameter`, the query evaluator, typed view-binding conventions, `useAnalysisEvaluation`, notebook compilation/write-back, and folder persistence. Add semantic notebook binding support, a project-aware rendering wrapper, coherent current scope, and a direct current-evidence route.

**Cost and dependencies.** Medium integration work, approximately 3–5 focused engineer-weeks across the two milestones in the implementation plan. That is a rough judgment for one developer including docs and verification, not a schedule promise. No new statistical method or open planning PR is required.

**Main risk.** A UI that changes a label to the new inputs while charts or source references still belong to the old evaluation. Keep applied inputs, rows, and evidence coherent.

**Follow-up.** Codex can plan and implement the first boundary now. A future Design run is useful only for expanding beyond one query population or adding durable captured evidence; it is not a prerequisite.

### RA02 — Build live findings next by selecting #507

**New possibility.** A short descriptive value in prose follows an explicitly named chart’s local selection, and the reader can inspect the inputs behind it. For example, after selecting a duration range, a named finding can display the selected request count and mean.

**Fit and building blocks.** This composes with the chosen notebook journey. The supplied #507 summary already chooses named definitions, owner-local selection semantics, existing reducers, and count/average before broader comparisons. Adopt that plan instead of inventing inline arbitrary expressions.

**Cost and dependencies.** A separate, already staged feature with notebook/compiler integration. It depends on its own planned resolver and evidence work, not on a universal measure system. RA01 helps establish the query population, but #507 can also ship on the existing notebook path. #519’s first contributor comparison milestone is an optional subsequent inspection aid.

**Main risk.** Treating all surrounding prose as verified, or using a chart’s source/eligible set as though it already includes its local selected predicate. Preserve #507’s explicit ownership and population distinctions.

**Suggested integration Design question.** How should a live finding show the notebook’s applied query inputs and its owner chart’s additional scope without duplicating state or changing notebook local-selection defaults? Do not rerun the count/average or selection-method mission.

### RA03 — Explore saved evidence and bounded recipient inspection

**New possibility.** Preserve the particular result discussed in a review, including its inputs, definition, and described population, and let a recipient inspect that saved result even after the working sources change.

**Fit and building blocks.** This is the natural delivery extension of the chosen workflow. Current native files and copied data provide a first editable handoff. Deliberately captured historical evidence requires more than parameter values, runtime row IDs, or an image.

**Cost and dependencies.** Potentially medium-to-large because capture ownership, the included data, source references, read-only behavior, and refresh semantics must agree. Do not make that work a dependency of RA01. #507 explicitly defers durable capture; #519 retains temporary, generation-bound comparisons and does not supply this format.

**Main risk.** A file that appears to be an old result but silently recomputes against new data, or can no longer resolve the records it claims to describe.

**Suggested Design question.** For one saved finding and its containing notebook, what is the smallest captured input/evaluation scope that permits complete supported inspection, and which recipient actions operate only on that captured copy? Compare an ordinary copied native project with one focused evidence attachment before inventing an archive store.

### RA04 — Explore explicit detail navigation, then paired cases

**New possibility.** From a service overview, open an existing investigation with a typed service key and an explicitly mapped period; return to the overview without losing its committed state. A later comparison can show two named input cases against the same source generation.

**Fit and building blocks.** Reuse saved queries, bindings, existing host callbacks, and ordinary notebook paths. A selected service can launch a question; it is not necessarily the clicked mark’s exact contributing population.

**Cost and dependencies.** Medium host/navigation work. RA01 gives it a useful destination. A first source-to-destination mapping can be small; a general connection editor and simultaneous side-by-side results are larger and should not be bundled into the first cut.

**Main risk.** Implicitly inheriting every filter, overwriting an existing case, or showing sheets with different populations even though sheets currently share one dataset.

**Suggested Design question.** For one overview and one investigation, choose destination-owned restrictions plus explicit service/from/until mapping, a named-instance policy, and return behavior. Compare that with a two-case view only after the single destination works. No automatic filter inheritance is proposed.

### RA05 — Explore one reusable rate/result, not a universal analytical layer

**New possibility.** Define one ratio of additive totals, such as errors divided by recorded requests from daily summaries, and use the same meaning in a card and grouped comparison. Or expose one well-defined derived result where its row grain is useful downstream.

**Fit and building blocks.** Existing project aggregates and scalar calculations already cover fixed-grain summaries and some ratios. The new remainder would be shared, scope-aware meaning across consumers, not merely giving a saved aggregate a name.

**Cost and dependencies.** Medium method-and-integration work for a bounded two-consumer contract; large if it grows into a general measure/result catalogue. RA01 does not need it.

**Main risk.** Averaging subgroup rates, treating generated curve points as independent observations, or silently changing numerator/denominator eligibility across views.

**Suggested Methods/Design question.** For one specified ratio-of-sums, define row grain, numerator and denominator populations, zero/missing behavior, grouping/filter order, and exact contributor evidence for two consumers. Existing query preparation remains a viable boundary. Its lower priority is a scope/fit decision, not an outside-demand gate.

## 5. Make the leading bet concrete

### Compare three viable product boundaries

| Boundary | What ships | Assessment |
| --- | --- | --- |
| A. Recipe launcher over saved views | List and name existing queries/views/notebooks; open the current separate surfaces. | Too little capability gain. Most saving already exists, and the notebook input/evidence gap remains. |
| **B. One query-bound notebook with saved inputs** | Typed inputs, current evaluation, explicit scope, record inspection, text persistence, named live cases, native project handoff. | **Choose.** A complete bounded job that reuses existing ownership. |
| C. Universal analysis application and publication package | Multiple populations, arbitrary output reuse, historical captures, reader permissions, cross-case routing, and public publishing. | Too much coupled design for the first build. Several parts are worthwhile later, separately. |

“Complete” in Boundary B means a useful current-data analysis can be reopened and handed to another analyst with its source files. It does not promise immutable historical evidence or a standalone browser-only report.

### Ownership and lifetime

| Item | Owner / persisted form | Meaning on reopen |
| --- | --- | --- |
| Sources, relationships, query steps, parameter definitions | Existing project text and source files | The current preparation definition over current inputs. |
| Notebook query ID and literal bindings | One explicit `eda` declaration in `.eda.md` — **new semantics** | The same question is evaluated again. |
| Prose, chart definitions, aliases, calculations, authored restrictions | Existing notebook text | Authored analysis; static prose stays authored. |
| Applied result and source references | Current `AnalysisEvaluation`, in memory | Recomputed; not a stored historical result. |
| Input drafts | Local editor state | Not a saved question until applied. |
| Clicks and brushes | Chart-local runtime state | Not automatically a saved notebook population. |
| A named copied notebook | Another ordinary `.eda.md`, same project/query | A separate editable question with its own inputs; still live on current sources. |
| Copied project plus its actual data files | Recipient’s independent folder | A reusable working copy; unchanged copied inputs retain their as-copied values. |

Do not add a parallel JSON definition that duplicates notebook inputs. Do not promote “case” into a new database entity. It is user-facing shorthand for a named notebook file.

### One realistic investigation

The example uses request records with a unique `requestId`, a service ID, a canonical `YYYY-MM-DD` date, and a duration in milliseconds. The query filters service equality, an inclusive start, and an exclusive end. It does not compute rolling windows or infer a time zone.

1. **Open the project and notebook.** Byron selects “Checkout request review.” The top line identifies the query, “rows are requests,” the applied service and interval, and the current query row count. Three compact inputs show Checkout, October 1, and “Before October 8.”

2. **Read the analysis.** A count card describes all requests in scope; an average-duration card describes valid numeric duration inputs. A table exposes the records, and an ordinary plot can show the pattern. Two sheets can separate overview and exceptions, but both read this same query result.

3. **Change the question.** In a compact Inputs popover, he changes the service or period, then applies the complete valid tuple. This is a proposed transaction for query inputs; ordinary chart settings continue their existing live-edit behavior. Invalid drafts do not rewrite the file or relabel the old result.

4. **Inspect the result.** A chart trace uses the existing header/Alt-click route. The new wrapper connects it to the current query result and source references. For the single-source fixture, each query row resolves to the corresponding original request. A separate query/stage view can show the entire query population.

5. **Explore locally.** Filter the request table’s `requestId` column to `r06`. The table shows that record while the separate count and mean cards remain 6 and 200 ms, and the saved service/date inputs remain unchanged. Clear the table filter before continuing. Brushing an optional duration plot follows the same local-selection boundary. A saved authored restriction is intentional text with visible scope. RA02 can later bind a finding specifically to that local selection. The proposed wrapper clears transient selections and current traces when a new input/source context completes; authored restrictions remain.

6. **Write an interpretation.** A paragraph might say “Review the missing and nonnumeric durations before drawing a performance conclusion.” It stays ordinary prose. If he types “The mean is 200 ms,” that sentence does not silently become a verified or updating calculation.

7. **Save and reopen.** The notebook text contains the applied bindings and authored edits. After the app is closed and reopened, selecting that file reruns the query with the same inputs. Choosing a sheet is reading/navigation state, not an alternative population.

8. **Return after corrected source data.** The folder reloads from its existing source-change path. The notebook reevaluates from the current project and tables. A pending result retains its own applied scope, or waits; old evidence is never resolved against new source arrays. Once complete, the new values and current records replace the old ones.

9. **Save another case.** In milestone 2, “Save another case” captures the current working notebook text, confirms that all working text that navigation would discard has saved, creates a copy under a new name, and opens it after creation succeeds. A save failure blocks this action and retains the original working text and error. Byron then changes and applies the copy’s inputs. The original file’s committed inputs stay intact through this route. These are two questions over current data, not historical runs. Their prose/charts are separate copies, while the query definition remains shared.

10. **Hand off a useful result.** Save the notebook and project, then copy the folder with its referenced local input files. The recipient opens the named notebook using the same explorEDA version and can inspect the copied query population and records. The recipient receives an editable native analysis; no new published service is required.

### Exact expected values

The implementation plan includes every fixture row. The important expectations are:

| State | Query population and finite duration contributors | Values |
| --- | --- | --- |
| Initial checkout, Oct 1 ≤ date < Oct 8 | Six requests: r02, r03, r04, r05, r06, r09. Four finite durations: r02, r03, r06, r09. | Sum 800 ms; mean 200 ms. |
| After r03 changes from 200 to 400 and r10 is appended with 300 ms | Seven requests; five finite durations. r04 remains missing and r05 remains nonnumeric. | Sum 1,300 ms; mean 260 ms. |
| Search, same interval | r07 only. | One request; mean 1,000 ms. |
| Unmatched service, same interval | No request rows. | Count zero; average unavailable, with schema and authored charts retained. |

The zero-duration r09 is a valid measurement. The October 8 record r08 is outside the half-open interval. The initial nine request records become ten after the append. Reordering valid uniquely keyed inputs does not change the fixture’s membership set or arithmetic. Preserve the duration field as unconverted raw input in the example: an explicit numeric field conversion would collapse null and nonnumeric text into undefined, losing their distinct chart-level exclusion reasons. The plan makes this a runtime acceptance check.

These numbers were checked independently. The proposed mounted controls, query reevaluation, trace mapping, saves, and reopen behavior remain implementation acceptance work.

### What stays live, what is saved, and what can be frozen

- **Live:** query output, ordinary charts, and their current evidence respond to applied inputs and the source data currently loaded by the host.
- **Saved:** the query definition, notebook text, literal inputs, authored chart settings, and any intentional text restrictions.
- **Transient:** invalid drafts, ordinary local brushes, open inspectors, and ordinary runtime evaluation generations.
- **Held during an edit/error:** last valid notebook block text or a previous completed query result, visibly identified by its actual inputs. This is editing continuity, not archival evidence.
- **Preserved by an ordinary copy:** the actual input bytes and analysis definition in the copied folder, if the copy is left unchanged. This preserves the as-copied inputs for reopening with the same version, not an immutable product-level capture.
- **Not yet supplied:** a durable captured finding with a formal historical membership contract, version-independent replay, or an enforced browser reader. Those belong to RA03.

The recipient can inspect the full copied inputs that were included, not just the filtered result. A folder with absolute external paths, missing files, or live dependencies is not automatically portable. The first worked example uses only relative local JSON files. A PNG remains a picture of a chart; it cannot provide the underlying records or rerun the question.

## 6. A buildable first plan

The separate implementation plan supplies exact modules, fixture data, acceptance checks, docs sections, and a runnable example. Its two milestones are independently useful.

### M1 — Run, inspect, save, and reopen a parameterized notebook

A notebook authored in text names one existing project query and typed bindings. The local app evaluates it with current data, offers compact inputs, keeps applied scope coherent, and exposes current query/source evidence. Parameter changes patch only the target declaration. Empty valid results retain declared schema. The named file saves and reopens correctly.

This milestone includes a complete request-review example and its update fixture, not just a binding parser or a new component in isolation. It requires no open proposal.

### M2 — Create notebooks and save another named case in the app

Add a small new-notebook action over an existing query and an explicit copy action using the current working text. The host confirms successful saving of text that navigation would discard and then awaits creation success before navigation; a failed save retains the original workspace. This requires a narrow save acknowledgment rather than reuse of `flush()` as proof of success. Persist only convenient host navigation state, such as last-open path/sheet, if added; it must not override the notebook’s saved inputs. Include the native folder handoff example and failure/read-only checks.

The new notebook can start from a minimal authored skeleton and existing supported charts. A general template gallery, query wizard, or cross-project schema mapping is outside this milestone.

### Effort and stopping condition

Budget **roughly 3–5 focused engineer-weeks** for both milestones, with M1 the larger portion. The main uncertainty is integrating query evidence and empty-result schema without disturbing text write-back. This is an engineering estimate, not measured velocity or a delivery commitment.

The leading capability is complete when Byron can perform the request-review journey from a saved example, apply another input tuple, inspect current records, reopen after a source correction, and give a native copy to the same app version without pretending that an old sentence or image is live evidence. Stop expanding RA01 there; add RA02 as a separate capability.

## 7. Use the open plans selectively

All eight summaries are unbuilt plans. Their earlier validation does not establish runtime APIs at this baseline.

| Open proposal | Relationship to the chosen workflow |
| --- | --- |
| **#507 — live findings** | Best next capability. Optional for RA01; required only for computed prose tied to an explicit owner. Reuse its staged design. |
| **#514 — weighted distributions** | Optional when observations carry meaningful weights. The request example needs ordinary count/average only. |
| **#517 — engineering histograms** | Optional for a later specification-compliance investigation. Do not add specification limits merely to showcase an open plan. |
| **#518 — wide-to-long** | Optional for repeated measurements supplied in wide columns. Coordinate its declared-schema/empty-result seam; do not wait for its unpivot operation. |
| **#519 — contributor comparison** | Optional aid to explain why two current values differ. Its same-generation temporary captures do not supply saved evidence. |
| **#520 — held-fit diagnostics** | Optional for a model-investigation notebook. Its later saved recipes must use the eventual agreed ownership, but it does not block ordinary descriptive analysis. |
| **#521 — rolling windows** | Optional calendar-chart enhancement. It is chart-local and does not implement reusable lag/difference query preparation. |
| **#523 — category mappings** | Optional preparation for inconsistent labels. Coordinate current notebook reevaluation and folder-save seams; do not require the map operation first. |

The strategic contribution is the complete job these capabilities can inhabit. It is not “implement all eight” or a redesign of any individual proposal.

## 8. Recommendations and stop list

These stable IDs supplement the five ranked capability bets. “Build” means recommended implementation scope; no application change is made by this report.

| ID | Disposition | Recommendation and one-line reason |
| --- | --- | --- |
| **RA06** | **Build** | Make the local folder app the primary workflow owner while keeping package storage/routes host-owned. |
| **RA07** | **Build** | Keep query inputs, applied result, row meaning, and current evidence visibly coherent; this makes the new question usable. |
| **RA08** | **Build** | Finish a native project-and-data handoff in the example; a usable reopening path need not wait for public publishing. |
| **RA09** | **Defer** | Let engineering histograms, weighting, rolling windows, and residual diagnostics arrive as separate specialist capabilities. |
| **RA10** | **Defer** | Keep R049 ordered predecessor differences and R041 join-key preparation separate; neither is needed for the first repeated question. |
| **RA11** | **Avoid** | Do not add a recipe registry, universal semantic layer, general result graph, or replacement execution engine. |
| **RA12** | **Avoid** | Do not silently inherit filters, reinterpret sheets as different datasets, or persist runtime row positions as historical evidence. |
| **RA13** | **Defer** | Treat public narrative publishing and an independently hosted reader as later delivery choices, not the primary direction. |
| **RA14** | **Avoid** | Do not require outside demand, telemetry, a study, commercial infrastructure, or an audit before building the selected capability. |
| **RA15** | **Build** | Ship RA01’s first complete journey independently of all eight open planning PRs. |
| **RA16** | **Avoid** | Never represent ordinary prose, last-valid block text, settings-only export, or PNG output as verified reusable evidence. |

R049’s ordered predecessor relationship and #521’s calendar rolling summary answer different questions. If R049 is pursued later, its Methods question must specify partition, order, ties, missing values, and whether filtering happens before or after predecessor selection. R041 needs an explicit match/collision contract; category mapping must not silently become join-key normalization.

## 9. What Codex can decide now, and what merits another Pro run

### Ready for Codex now

- Choose the proposed query-bound notebook wrapper and canonical notebook binding declaration.
- Reuse the existing parameter model, scalar codec, validation, evaluator, worker, and host saver.
- Add the narrow declared-schema path for valid empty results.
- Connect current result-row evidence to the existing query inspection surfaces.
- Implement the two milestones with the exact fixture and docs/example contract.
- Recheck integration seams against the checkout Codex will actually change; newer code may have addressed a seam.

There is no missing decisive source input and no research gate for M1. The supplied code and additional pinned files are sufficient to choose a useful plan.

### Subsequent Pro questions

- **RA02:** a narrow integration review only if the applied notebook scope and #507’s owner scope cannot be composed cleanly.
- **RA03:** a Design run for captured inputs/evidence, permitted reader interactions, and refresh behavior.
- **RA04:** a Design run choosing explicit context mapping, destination-instance reuse, and return/paired-case behavior.
- **RA05:** a Methods/Design run for one rate/result’s exact populations, grain, and cross-consumer meaning.

### Unresolved choices that do not block the first build

- Whether the later evidence artifact includes an entire portable project or a smaller captured result with sufficient supplying inputs.
- Whether overview-to-detail reuses one destination case or creates another named case.
- Which specialist plan follows live findings for Byron’s next chosen analysis.
- Concrete measured capacity limits and any resulting optimizations; no thresholds are asserted here.

The first boundary itself is chosen: one query population per notebook; typed literal inputs in notebook text; current-data reevaluation; chart-local transient selection; ordinary native reopening and handoff.

## 10. Primary-source references

These references support the specific external workflow claims above. Product preferences and effort bands are judgments, not conclusions supplied by the vendors.

### External sources

- **W01 — Observable Framework reactivity:** https://observablehq.github.io/framework/reactivity
- **W02 — Observable Framework data loaders:** https://observablehq.github.io/framework/data-loaders
- **W03 — Observable Notebooks 2.0 overview, explicitly a technology preview:** https://observablehq.github.io/notebook-kit/
- **W04 — Observable Notebook Kit format, CLI, and integration:** https://observablehq.github.io/notebook-kit/kit
- **W05 — Observable Notebook Kit database queries, snapshots, and refresh:** https://observablehq.github.io/notebook-kit/databases
- **W06 — Quarto computational parameters:** https://quarto.org/docs/computations/parameters.html
- **W07 — Quarto inline code:** https://quarto.org/docs/computations/inline-code.html
- **W08 — Quarto Observable JS and prepared data:** https://quarto.org/docs/interactive/ojs/ and https://quarto.org/docs/interactive/ojs/data-sources.html
- **W09 — Quarto execution, freeze, and notebook execution defaults:** https://quarto.org/docs/projects/code-execution.html
- **W10 — JMP 19.2 workflow example and packaged handoff:** https://www.jmp.com/support/help/en/19.2/jmp/example-of-capturing-a-jmp-workflow.shtml
- **W11 — JMP 19.2 Workflow Builder and reference replacement:** https://www.jmp.com/support/help/en/19.2/jmp/workflow-builder.shtml and https://www.jmp.com/support/help/en/19.2/jmp/workflow-builder-reference-manager.shtml
- **W12 — JMP 19.2 interactive HTML capabilities and limits:** https://www.jmp.com/support/help/en/19.2/jmp/publish-reports-as-interactive-html.shtml
- **W13 — Orange connected workflows and selected-data inspection:** https://orange3.readthedocs.io/projects/orange-visual-programming/en/latest/building-workflows/index.html
- **W14 — Orange workflow/settings versus data:** https://orangedatamining.com/blog/orange-essentials-saving-and-sharing-workflows/
- **W15 — Orange report formats and section workflow recovery:** https://orange3.readthedocs.io/projects/orange-visual-programming/en/latest/report/index.html
- **W16 — Power Query in Excel, preparation and refresh:** https://support.microsoft.com/en-us/excel/about-power-query-in-excel
- **W17 — Power Query typed reusable parameters:** https://learn.microsoft.com/en-us/power-query/power-query-query-parameters
- **W18 — Excel query management, duplicate/reference, and connection export:** https://support.microsoft.com/en-us/excel/manage-queries-power-query
- **W19 — Mosaic selection resolution:** https://idl.uw.edu/mosaic/api/core/selection.html
- **W20 — Mosaic architecture:** https://idl.uw.edu/mosaic/what-is-mosaic/

### Pinned code references used for decisive claims

- **C01:** `packages/explorEDA/src/types/AnalysisProject.ts` — parameters, views, stages, and result references.
- **C02:** `packages/explorEDA/src/lib/project/analysisText.ts` — `analysisViewQueries`, `bindValue`, `exportAnalysisText`.
- **C03:** `packages/explorEDA/src/lib/analysis/evaluateProject.ts` — `evaluateAnalysisQuery`, `filterFrame`, `aggregateFrame`, source references.
- **C04:** `packages/explorEDA/src/lib/notebook/readNotebook.ts` — `namedQuery`, `readNotebookText`.
- **C05:** `apps/app/src/ProjectWorkspace.tsx`, `projectActions.ts`, `saver.ts`, and `App.tsx` — working text, lifecycle, and save ownership.
- **C06:** `ExplorEdaNotebook.tsx`, `compileNotebook.ts`, `sheets.ts` — notebook rendering, compilation, and shared sheet scope.
- **C07:** `packages/explorEDA/src/lib/notebook/writeBack.ts` — `skippedKey`, `textPart`, `writeBackSettings`.
- **C08:** `apps/demo/src/SavedViewsWorkspace.tsx` — demo checkpoint and history ownership.
- **C09:** `ExplorEdaProject.tsx`, `AnalysisChartContext.tsx`, `ProjectQueryPanel.tsx`, `QueryStageRows.tsx`, and `useAnalysisEvaluation.ts` — applied scope and current evidence.

Every code link below uses the pinned baseline rather than moving main.

## 11. Access status, complete file inventory, and handoff

**Access: GO.** All supplied files were available. Connected GitHub supplied the decisive omitted code. This is access for a Strategy decision, not proof that the proposed feature runs.

### All 35 complete baseline files read

~~~text
AGENTS.md
docs/research/DIRECTION.md
docs/agent-guide.md
docs/ui-defaults.md
CODING_STANDARDS.md
README.md
packages/explorEDA/README.md
package.json
apps/demo/src/docs/pages/notebooks.mdx
apps/demo/src/docs/pages/project-folders.mdx
apps/demo/src/docs/pages/export.mdx
apps/demo/src/docs/pages/views-and-history.mdx
apps/demo/src/docs/pages/developers.mdx
docs/daily-viz.md
packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx
packages/explorEDA/src/lib/notebook/compileNotebook.ts
packages/explorEDA/src/lib/notebook/sheets.ts
packages/explorEDA/src/lib/notebook/writeBack.ts
packages/explorEDA/src/lib/notebook/compileNotebook.test.ts
packages/explorEDA/src/lib/notebook/sheets.test.ts
packages/explorEDA/src/types/AnalysisProject.ts
packages/explorEDA/src/types/SavedDataStructure.ts
packages/explorEDA/src/components/ExplorEdaProject.tsx
packages/explorEDA/src/lib/analysis/evaluateProject.ts
packages/explorEDA/src/lib/project/folder.ts
packages/explorEDA/src/lib/project/folder.test.ts
apps/app/src/ProjectWorkspace.tsx
apps/app/src/projectActions.ts
apps/app/src/saver.ts
apps/demo/src/SavedViewsWorkspace.tsx
docs/intent/parameterized-task-navigation/intent-brief.md
docs/intent/reusable-analysis-outputs/intent-brief.md
docs/intent/reusable-analysis-metrics/intent-brief.md
docs/intent/research-ideas-100/ideas/R049-ordered-difference-transforms.md
docs/intent/research-ideas-100/ideas/R041-join-key-preparation.md
~~~

### All eight complete, separately marked unbuilt proposal summaries read

~~~text
docs/research/live-findings-2026-10-22/README.md
docs/research/weighted-distributions-2026-10-23/README.md
docs/research/engineering-histograms-2026-10-23/README.md
docs/research/wide-long-2026-10-23/README.md
docs/research/contributor-comparison-2026-10-24/README.md
docs/research/regression-diagnostics-2026-10-24/README.md
docs/research/rolling-windows-2026-10-24/README.md
docs/research/category-mappings-2026-10-24/README.md
~~~

### Additional pinned GitHub files read completely

~~~text
packages/explorEDA/src/lib/notebook/readNotebook.ts
packages/explorEDA/src/lib/project/analysisText.ts
packages/explorEDA/src/lib/project/writeFolder.ts
packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts
packages/explorEDA/src/components/project/ProjectQueryPanel.tsx
packages/explorEDA/src/components/project/QueryParameters.tsx
packages/explorEDA/src/components/project/parameterBindings.ts
packages/explorEDA/src/components/project/QueryStageRows.tsx
packages/explorEDA/src/components/AnalysisChartContext.tsx
packages/explorEDA/src/components/charts/DataTable/DataTable.tsx
packages/explorEDA/src/components/charts/DataTable/definition.ts
packages/explorEDA/src/components/charts/DataTable/filteredRows.ts
packages/explorEDA/src/lib/valueParsing.ts
packages/explorEDA/src/lib/project/tables.ts
apps/app/src/App.tsx
packages/explorEDA/package.json
apps/app/package.json
~~~

Targeted portions of `packages/explorEDA/src/lib/dsl/compile.ts` were also inspected, including compile options, the `eda` declaration path, and metric/table syntax. Targeted portions of `lib/dsl/project.ts` established project/query syntax, and `lib/fieldSettings.ts` established numeric-conversion behavior. Complete reads of those three additional files are not claimed.

**Checked facts:** source ownership, absent notebook bindings at the baseline, current query/selection/write-back behavior, official competitor mechanisms, and independent fixture arithmetic.

**Proposals:** RA01–RA16 dispositions, the new notebook semantics, modules, controls, current-evidence integration, milestone acceptance, and effort bands. Application tests and browser acceptance remain for Codex.

**Deliverables:** this complete `report.md` and the companion `implementation-plan.md`; the final response provides direct downloads and a ZIP containing exactly those two reports. No manifests, hashes, receipts, or extra report variants are included.

**Unresolved:** later historical-capture format, later navigation/paired-case policy, and implementation measurements. None blocks the selected first build. No code was changed, committed, pushed, merged, deployed, or provisioned.

[W01]: https://observablehq.github.io/framework/reactivity
[W02]: https://observablehq.github.io/framework/data-loaders
[W03]: https://observablehq.github.io/notebook-kit/
[W04]: https://observablehq.github.io/notebook-kit/kit
[W05]: https://observablehq.github.io/notebook-kit/databases
[W06]: https://quarto.org/docs/computations/parameters.html
[W07]: https://quarto.org/docs/computations/inline-code.html
[W08]: https://quarto.org/docs/interactive/ojs/data-sources.html
[W09]: https://quarto.org/docs/projects/code-execution.html
[W10]: https://www.jmp.com/support/help/en/19.2/jmp/example-of-capturing-a-jmp-workflow.shtml
[W11]: https://www.jmp.com/support/help/en/19.2/jmp/workflow-builder-reference-manager.shtml
[W12]: https://www.jmp.com/support/help/en/19.2/jmp/publish-reports-as-interactive-html.shtml
[W13]: https://orange3.readthedocs.io/projects/orange-visual-programming/en/latest/building-workflows/index.html
[W14]: https://orangedatamining.com/blog/orange-essentials-saving-and-sharing-workflows/
[W15]: https://orange3.readthedocs.io/projects/orange-visual-programming/en/latest/report/index.html
[W16]: https://support.microsoft.com/en-us/excel/about-power-query-in-excel
[W17]: https://learn.microsoft.com/en-us/power-query/power-query-query-parameters
[W18]: https://support.microsoft.com/en-us/excel/manage-queries-power-query
[W19]: https://idl.uw.edu/mosaic/api/core/selection.html
[W20]: https://idl.uw.edu/mosaic/what-is-mosaic/
[C01]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/types/AnalysisProject.ts
[C02]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/project/analysisText.ts
[C03]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/evaluateProject.ts
[C04]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/readNotebook.ts
[C05]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/app/src/ProjectWorkspace.tsx
[C06]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx
[C07]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/writeBack.ts
[C08]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/SavedViewsWorkspace.tsx
[C09]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/ExplorEdaProject.tsx
[C10]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/app/src/App.tsx
[C11]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/app/src/saver.ts
[C12]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/compileNotebook.ts
[C13]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/sheets.ts

