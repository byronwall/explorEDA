# Portable analytical handoffs after existing exports

**Decision report · 2026-10-20 · Research only**

Repository: [byronwall/explorEDA](https://github.com/byronwall/explorEDA). Declared baseline: [`9b16d78e3ed0742ed4d5858c1939fec9e758b510`](https://github.com/byronwall/explorEDA/commit/9b16d78e3ed0742ed4d5858c1939fec9e758b510). The supplied integration branch is `codex/analysis-handoff-research-2026-10-20`; this research did not access or change that branch.

## Decision

**Keep the existing export boundary. GO for the local selection/export/undo/reopen proof, followed by a focused guide trial. NO-GO now for a new companion export, a larger analytical bundle, or a result-table pipeline.**

The strongest reason to keep the boundary is that the three recipient jobs already have different, useful destinations: an image and authored explanation for understanding a finding; native analysis or project JSON for inspection in compatible explorEDA software; and table CSV for exchanging matching record values. Source inspection does not establish that a real recipient has failed any of those tasks. A new file would create another explanation, pairing, disclosure, and maintenance obligation before its benefit is known. This is a judgment about the evidence supplied, not a claim that every future recipient will succeed.

**The one possible product-direction change is AH03:** test a single author-reviewed Markdown note beside one existing export only after a named recipient fails to understand necessary context despite the guide. Compare it with the same facts in a normal cover message. If the message works as well, retain the current boundary. A note cannot repair missing dependency tables, reverse CSV information loss, supply compatible software, or establish source freshness.

Five recommendations, **AH01–AH05**, appear below. They are proposed dispositions for Byron and Codex, not adoption or implementation approval. The existing intents explicitly put a local analytical task before expansion and keep reusable results unprioritized until an actual downstream task. [S01], [S02]

## What was established, and what was not

- **Checked source:** All 38 entries in the selected-source packet match their declared UTF-8 byte counts and SHA-256 values: 35 baseline files, two local additions, and one historical summary. The declared GitHub commit is accessible. Twelve additional source files were retrieved at that exact commit to complete relevant caller, parser, history, image-action, and DSL traces.
- **Checked external facts:** Current primary documentation for Observable Framework, Jupyter, Tableau, CSVW, Data Package/Table Schema, and DuckDB was retrieved on 2026-10-20. Their contracts are compared in `evidence-and-comparisons.md`; none is evidence of explorEDA demand.
- **Source-derived inference:** Existing export paths have deliberately different data and context boundaries. Two project dependency cases and one project local-storage case merit narrow verification. No application failure was observed.
- **Proposal:** The guide, seven-row fixture, project fixture, recipient trial, and companion gate are research outputs. Product serialization tests, application execution, browser downloads/reimports, fresh-session reopening, and recipient comprehension remain **UNRUN**.
- **No repository mutation:** Work comprised reading supplied files and public/pinned sources, writing research artifacts, and verifying those artifacts. No checkout, worktree, install, implementation, commit, PR, merge, deployment, or source-code execution occurred.

Packet authentication proves consistency with the supplied packet headers. It does not independently attest the Git origin of every packet entry. Additional fetched files were checked against their returned Git blob identifiers. The complete access and integrity record is in `evidence-and-comparisons.md`.

## Three synthetic recipient jobs

These jobs organize the comparison. They are not interviews or observed customer demand.

| Job | Best current starting point | Evidence needed before changing direction |
| --- | --- | --- |
| Explain a finding | Existing chart image or view plus the author's ordinary explanation of value, population, reference, calculation, and caveat. | A named recipient still misstates an essential fact after a focused guide; a separate note must beat the same facts in a message. |
| Reopen and inspect | Full analysis JSON for an ordinary view; project-view or full-project JSON for a project. Declare compatible software and the actual included data. | Exact rows, settings, values, dependencies, and intended scope must survive the real export/open path. A serialization or compatibility failure belongs to local trust first. |
| Reuse its rows | Table CSV for a flat exchange of matching record values. Use explicit upstream preparation when typed identity, missing-value distinctions, or a repeatable computation is required. | Name the downstream consumer and its contract. A request for rows does not establish a need to materialize grouped/model/density outputs as reusable tables. |

The operational distinctions are deliberate: **explaining** is tested by recipient answers; **faithful reopening** is tested by memberships, settings, and displayed values in declared software; **computational reproduction** requires running a declared recipe with its inputs and environment. A file can support one without establishing the others.

## Current export contract matrix

This matrix describes the inspected baseline and documented image behavior. It is not a runtime certification. “Source rows” means the rows supplied at the relevant workspace/project boundary, not necessarily an original database or upstream untransformed dataset.

| Existing path | What it preserves | What the recipient still needs or must not infer |
| --- | --- | --- |
| Chart PNG | Documented drawn chart, title/subtitle, legends, annotations, current selection and theme. Data-table images show the rows in view. [S03], [S25], [S26] | An explanation and source context unless authored into the image. No structured row dataset, restorable selection or executable calculation contract. Readable row values in an image can still disclose data. Image fidelity was not exercised. |
| Table CSV | The caller's matching rows, in table sort order, and configured field IDs; calculated values are materialized before export. It exports the matching collection, not just rendered DOM rows. [S04], [S05], [S06] | Formula expressions, labels/descriptions, display units, type declarations, reference population, filters, parameters and source identity are not encoded. Blank and native-type distinctions can be lost. |
| Workspace **Copy Data** | JSON of `state.data` through `saveRawDataToClipboard`. [S17], [S15] | It is a different action from table CSV and the raw-source analysis bundle. It uses ordinary `JSON.stringify`, carries no settings or dedicated special-value map, and is not a filtered-result export. Do not infer calculated-column materialization from the CSV path. |
| Settings JSON | Charts, formulas, field settings, linked workspace filters, independent Rows settings, layout and other saved definitions. [S14], [S15], [S16] | Rows must be supplied separately. Host/import type hints are not independently serialized as `fieldTypes`. Settings alone do not guarantee matching results on different data. |
| Ordinary full analysis JSON / demo view export | Original workspace `rawData`/`sourceRows` plus saved settings; the analysis codec preserves special source values separately. [S15], [S16], [S17], [S22] | Compatible explorEDA behavior. Source rows travel even when the chart or table is narrowed. Formula values are recomputed from saved expressions. No sender undo timeline or source freshness attestation. |
| Project **Export analysis** for one view | One selected view/query, reachable query steps, referenced relationships and endpoint source definitions/tables, filter-used parameters, bindings and settings. Included table arrays remain whole. [S18], [S19], [S20] | Query output rows and selected row keys do not crop source tables. Parameter-option and unused-binding closure cases need proof. Missing source arrays can be structurally permitted; validation alone is not dependency availability. |
| **Export project** | All provided project definitions, source tables and views, with the project file codec. [S17], [S18], [S19] | Compatible project evaluation; deliberate disclosure of all included tables and views. The file does not contain the sender's local session history, an environment lock, or cached copies of every analytical result. |
| Dashboard text / project analysis text | A readable configuration recipe, including supported formulas/settings. Generic DSL export reports omissions. The project text API also names queries/bindings. [S23], [S24] | External rows; project text additionally requires project definitions/tables. The demo's generic text action is not automatically the project text API. An empty omissions list still does not mean data or a runtime environment is bundled. |

### The scope and meaning details that change a handoff

- **Linked selection, table search, and Rows are separate.** In ordinary linked mode, a chart selection affects workspace membership. Dashboard-table `globalSearch` narrows that table. Rows begins with linked workspace rows and applies its own controls. Chart-local populations and `localSelections` are additional scopes; the proposed proof deliberately disables them. [S06], [S07], [S08], [S39], [S40], [S41]
- **Search can match a field that is not exported.** `getFilteredRows` searches all resolved fields except `__ID`, including hidden and calculated fields. CSV writes only configured columns. A recipient can receive correct rows without seeing the field responsible for the match. This is a reason to explain scope, not evidence that the exporter chose the wrong rows. [S04], [S05], [S06]
- **Values are not formula definitions.** The table resolves formula columns before export. CSV can carry `double_units = 2, 8`; native settings carry `units * 2`. Neither automatically explains why twice the units was the relevant comparison. [S05], [S14], [S16]
- **Types and missingness are format-specific.** The CSV writer emits null, undefined and empty text as empty cells; reimport maps blanks to null and infers types by column. Leading-zero and unsafe-integer identifier strings have explicit protections. Number `1` and string `"1"` still share a CSV lexeme. Mixed text can make serialized zero reimport as string `"0"`. Analysis JSON retains native scalar types and raw tokens, but reader/host type hints are distinct from saved field overrides. [S09], [S10], [S11], [S12], [S13], [S14], [S15], [S16], [S38]
- **Field descriptions and source identifiers are not presumed public.** Labels, formulas, bindings, reference data and whole lookup tables can disclose context beyond a selected chart. Choosing a smaller visible view does not establish an appropriate sharing scope. Review the actual payload and authored context for the named recipient; no access-control system is proposed. [S14], [S18], [S19]
- **Freshness is not file creation time.** `saveToStructure` writes a view `modifiedAt`; the CSV filename uses an export clock; evaluation revisions include process-local table identities. None is a source observation time or portable content checksum. Keep source identity and source-as-of unknown when the author cannot establish them. [S04], [S16], [S20]

## Ranked findings

### 1. There is no demonstrated recipient failure that earns another format

The supplied mission states that no customer demand or verified export defect is provided. The local trust and reuse intents ask for named tasks before expansion. Existing code provides both compact row exchange and richer reopening formats. The strongest current decision is to learn whether a short selection lesson resolves the problem, with deferral as a successful outcome. This is **high-confidence prioritization from the supplied evidence**, not a prediction that no one will want a companion. [S01], [S02]

### 2. Full-source and dependency-table scope is the decisive recipient risk

`SavedViewsWorkspace.exportView` uses `downloadAnalysis(sourceRows, settings, ...)` for ordinary views. `selectAnalysisProjectView` chooses dependency tables, not selected records. A recipient seeking to inspect a finding may benefit from the reference rows; an author intending to disclose only the selected records may need a deliberately prepared dataset instead. A guide must make this choice explicit. A companion does not change the payload. [S17], [S19]

### 3. The CSV boundary is narrower than the native formats, but not a newly proved defect

Tracing the actual caller disproves the tempting claim that CSV omits calculated values. Tracing the parser also prevents a generic claim that explorEDA strips every leading-zero identifier. The real limits concern missing/empty distinctions, native per-value types, field context, and the difference between record rows and analytical outputs. These are contract boundaries to test against an actual consumer. [S04], [S05], [S06], [S09], [S10], [S11], [S12], [S13], [S14], [S15], [S16]

### 4. Local proof has concrete, bounded questions to answer

The selected project-view closure does not traverse a parameter's option-only source and does not prune retained view bindings when unused parameter definitions are dropped. Validation checks those references later. **P-OPTIONS** is grounded in the existing `customer-instance` shop fixture, whose customer choices come from a source outside that query's reachable source chain. **P-BINDING** is a small valid-input construction. Their expected validation rejection remains unrun. Separately, project local storage uses ordinary JSON where project files use a special-value codec; **P-LOCAL-SPECIAL** checks that distinct route only if required by the named task. These are local-trust probes, not reasons to build a note. [S19], [S22], [S29], [S42]

### 5. Existing tests cover useful contracts, not the complete recipient journey

The reliability test covers a derived filter, formula edits, table search and restoration, but its CSV assertion calls the helper directly and restoration reuses current source data. Demo workspace tests mock the analysis component; an anchor-click assertion does not inspect download bytes. The project tests exercise a normal dependency closure, not the two edge cases above. All were read, none run. A real download and fresh-context reopen remain necessary. [S27], [S28], [S29], [S30], [S31], [S32]

### 6. Established tools clarify destinations without proving demand

Observable Framework separates a built presentation from the environment that generates its data. Jupyter separates stored outputs from execution. Tableau packages explicitly depend on compatible viewers and included resources. CSVW and Data Package formalize data interpretation; DuckDB serves relational export/import. **Inference:** those are useful destinations for richer publishing, reproducible computation or typed dataset exchange when a named task requires them. Their existence does not justify adopting their contracts inside explorEDA. [E01], [E02], [E03], [E04], [E05], [E06], [E07], [E08], [E09]

## Alternatives and comparative scores

Scores are **pretrial product judgments**, not measured results or demand evidence. Each is 1–5, higher favorable: **C** = comprehension; **R** = faithful reopening for the declared job; **A** = low author effort; **M** = low maintenance. The same existing native payload gets the same provisional reopening score under no change, guide and note. Additional prose cannot improve its serialization.

| Alternative | C / R / A / M | Disposition and tradeoff |
| --- | --- | --- |
| No change, with ordinary author explanation | 2 / 3 / 5 / 5 | Valid default and strongest maintenance choice. May already satisfy a familiar recipient; observe it fairly. |
| One focused guide and worked example | 4 / 3 / 4 / 4 | Preferred first trial after local proof. Clarifies export choice and scope without adding a format. Requires keeping one lesson/example accurate. |
| Explicit upstream preparation | 3 / 3 / 2 / 3 | Choose for a specific typed exchange or repeatable transformation. More author work, but a declared contract at the proper destination. |
| One conditional Markdown companion | 4 / 3 / 3 / 3 | NO-GO now. Potentially keeps context with the artifact; introduces paired-file drift, review and generation/copy costs. Must outperform the same cover text. |
| Larger result/provenance bundle | 3 / 2 / 1 / 1 | Reject for this mission. New packaging and interpretation obligations with no failed task demonstrating need. Existing native project JSON already bundles its defined project state. |

The guide's predicted comprehension score is a hypothesis. **If ordinary practice reaches the same comprehension outcome, no change wins on author effort and maintenance.** If ordinary practice already succeeds, there is no reason to require extra author work. If the problem is a broken reopen, neither guide nor note passes. If the recipient needs a typed downstream analytical table, compare explicit preparation at the required grain before considering reuse machinery.

## Stable recommendations

### AH01 — Prove local selection, export, undo and reopening first

- **Affected jobs:** Reopen/inspect and row reuse; prerequisite for credible explanation.
- **Evidence:** Current trust intent; actual CSV/native export chains; partial test coverage; bounded project dependency hypotheses. [S01], [S04], [S05], [S06], [S07], [S08], [S09], [S10], [S11], [S12], [S13], [S14], [S15], [S16], [S17], [S18], [S19], [S20], [S21], [S22], [S27], [S28], [S29], [S30], [S31], [S32]
- **Alternatives:** Trust existing unit tests, conduct another survey, or repair a discovered disagreement. Only the last addresses a failed named task.
- **Benefit:** Establishes whether the existing product tells one consistent story about rows and values.
- **Cost:** One small ordinary fixture and one project fixture through serialization and real application paths; targeted repairs only if a failure is reproduced. No broad certification or performance program.
- **Confidence:** High that this is the first gate; no confidence claim about unrun runtime success.
- **Falsifiable proof:** Seven source rows total 100; selected A is five rows totaling 35; searched table is two rows totaling 15 without changing linked measures. Formula edit, undo/redo, download and fresh reopen preserve the specified final state. Project-view export retains whole required tables and re-evaluates the specified output.
- **Disposition suggestion:** **GO for verification.** On any unexplained membership, value or reopen mismatch, stop handoff-feature work and classify a bounded local-trust repair. Do not count a synthetic failure as customer demand.

### AH02 — Trial one guide with the existing controls

- **Affected jobs:** Explain, reopen, reuse rows.
- **Evidence:** Different current contracts and scope rules; the existing export page names actions but does not supply this complete recipient-choice lesson. [S03], [S04], [S05], [S06], [S07], [S08], [S09], [S10], [S11], [S12], [S13], [S14], [S15], [S16], [S17], [S18], [S19], [S20], [S21], [S22], [S23], [S24]
- **Alternatives:** No change with ordinary cover text; existing field descriptions/chart annotations; direct author coaching; explicit preparation.
- **Benefit:** Reduces choosing-the-wrong-artifact and scope mistakes while preserving the product boundary.
- **Cost:** One short section in `apps/demo/src/docs/pages/export.mdx`, paired in the same milestone with a proposed `apps/demo/src/demos/analysisHandoff.ts` example and the repository's existing example/docs registration. Those paths are a proposal, not files created in the repository.
- **Confidence:** Medium that a lesson is sufficient; high that it is cheaper to discriminate than a new export.
- **Falsifiable proof:** On a real named handoff, the author selects an appropriate existing path and the recipient correctly answers value, population/reference, calculation/exclusion, source-time and reopening/disclosure questions without rescue.
- **Disposition suggestion:** **GO for a bounded guide trial after AH01.** The complete draft lesson is in `proof-plan.md`. Adopt the docs/example only if they reduce an observed confusion; retain no change if ordinary practice already works.

### AH03 — Consider one finding note only after the guide fails

- **Affected job:** Explain a finding; optionally help a recipient associate an existing file with its reopening instructions.
- **Evidence:** Context can be absent from a flat file or separated from an artifact. No recipient failure establishing the need for a separate note was supplied. [S04], [S14], [S19]
- **Alternatives:** Same facts in a cover message, chart title/subtitle or existing Markdown content; the guide; explicit preparation; another destination.
- **Benefit hypothesis:** A portable note may remain associated with a forwarded or revisited file when ordinary explanation does not.
- **Cost:** Author review and pairing with the correct unchanged payload; wording and example maintenance; stale-note checks. An automated exporter would add code, tests and a new contract and is not approved by a manual trial alone. No engineering-day estimate is claimed.
- **Confidence:** Low on demand and incremental benefit; high that its scope can be kept small.
- **Falsifiable proof:** After two comparable real handoffs expose the same essential context problem despite the guide, compare identical approved facts in a cover message and one `<export-stem>.handoff.md`. The note must remove the observed error or repeated clarification burden without increasing critical misunderstandings, exceeding an agreed preparation budget, or changing the payload.
- **Disposition suggestion:** **NO-GO now; conditional manual experiment only.** Reject if the guide succeeds, the same message is equally effective, the note is ignored, pairing becomes unreliable, or the true requirement is data restriction, a schema interpreter, automatic lineage, compatibility work or result materialization.

The proposed note has one finding, the paired filename, actual payload and selected/search scope, relevant calculation/reference/exclusion, known source identity and time with unknowns preserved, and an opening instruction. It contains no duplicate data, executable code, universal provenance schema, new package manifest, automatic claims of public safety, or compatibility guarantee. The research archive's `manifest.json` is solely a collection-integrity artifact; it is not this proposed product feature.

### AH04 — Send typed exchange and computational work to an explicit destination

- **Affected jobs:** Reuse rows and rerun an analysis beyond compatible explorEDA reopening.
- **Evidence:** CSV interpretation boundaries; native files carry source/definitions but no environment lock. External contracts provide distinct data, computation and publication destinations. [S09], [S10], [S11], [S12], [S13], [S14], [S15], [S16], [S17], [S18], [S19], [S20], [E01], [E02], [E03], [E04], [E05], [E06], [E07], [E08], [E09]
- **Alternatives:** Native analysis/project files when the recipient can inspect them; manual explanation; a new in-product schema or execution system.
- **Benefit:** Meets a specific consumer's grain, types and missing-value needs without quietly expanding the exploratory workspace into another platform.
- **Cost:** Explicit preparation and validation in the recipient's chosen tool, plus a declared input/output contract. It can be excessive for a simple explanatory handoff.
- **Confidence:** High as a routing principle; medium for any particular destination until the recipient and task are named.
- **Falsifiable proof:** The intended consumer accepts the prepared rows, retains the required distinctions and produces the expected result; author effort is recorded. If current CSV/native files already meet the job, preparation is unnecessary.
- **Disposition suggestion:** **Task-led GO, not general implementation.** Prefer a notebook for an executable method, SQL preparation for a repeated relational result, a data descriptor only for a consumer that uses it, and an authored publication tool when the job is sustained narrative delivery.

### AH05 — Keep materialized results and a larger bundle demand-gated

- **Affected job:** Repeated downstream analysis of a grouped, pivoted, modeled or density result, distinct from exchanging source records or row-level formulas.
- **Evidence:** The reuse intent explicitly remains unprioritized without a task. Existing project queries are not evidence that every chart result should become a source catalogue entry. [S02], [S18], [S20]
- **Alternatives:** Existing source calculations/query steps, a CSV exchange when it meets the job, explicit upstream aggregation, or deferral.
- **Benefit:** Avoids a second computation/refresh/lineage contract before its grain and consumer are known.
- **Cost:** A repeated task may remain manual until observed; capturing that task is cheaper than speculative infrastructure.
- **Confidence:** High in the gate; no claim about eventual demand.
- **Falsifiable proof:** Observe the same result repeatedly exported/imported, or a real second view blocked on an analytical output that current source-based operations cannot express. Record result grain, contributors, filter scope, refresh behavior and recipient. Only then compare one inspectable result table feeding one existing view.
- **Disposition suggestion:** **NO-GO for materialization or a larger bundle now.** A successful handoff note, competitor feature, open PR, synthetic example or generic request for CSV does not pass this gate.

## Unresolved product choices for Byron

| Choice | Decision still required |
| --- | --- |
| Recipient | Which actual person and task: a reader of a finding, an explorEDA inspector, or a downstream data consumer? What compatible software and working context do they have? |
| Scope | Is full-source inspection intended, or may only a declared subset travel? For projects, are whole dependency tables acceptable? This is a product/data decision before export, not something a note silently chooses. |
| Timestamp | Which fact matters: data's effective period, source acquisition/refresh, analytical execution, or export time? What is actually known? The default cannot convert a file date into source freshness. |
| Source disclosure | Which identifiers, names, field descriptions, formulas, parameter values, reference populations and source/table references may be sent to this recipient? The research makes no presumption of public safety. |
| Effort and success threshold | What author preparation and recipient clarification time is acceptable for the named job? Choose before the trial; do not invent an engineering estimate or retrofit success criteria. |
| Pairing | If a note is earned, how will the author keep it associated with the exact reviewed export after renaming or forwarding? Start with the actual filename and frozen payload; introduce a stronger association only if the task requires it. |

## GO / NO-GO rules and stopping order

1. **Research access: GO.** Owner, repository, declared commit and essential audited source are identified. The packet is authenticated. This does not certify the current default branch or a runnable environment.
2. **Local trust: pending.** Execute AH01 first. Stop at unexplained disagreement. A verified defect earns a bounded repair, not a broader handoff architecture.
3. **Existing-practice trial: GO only with a real task.** Observe a normal explanation; do not weaken it to make the guide look useful.
4. **Guide: conditional GO.** Try the complete proposed lesson after local proof. If it resolves the task, stop expansion.
5. **Companion: NO-GO now.** Require the named residual failure, repeated comparable occurrence, same-content message comparison, acceptable effort, and declared scope/time/disclosure choices. A positive manual trial earns only a scoped next decision.
6. **Result reuse and larger bundle: separate NO-GO.** Require actual repeated downstream work at a defined result grain. Neither the guide nor the companion can satisfy that demand gate.

The next useful action is the local fixture, not another survey. Preparation/freshness, missingness, relationships, rates, navigation and units remain with the supplied PR451/452/455–459 work; PR454 owns axes. Their supplied scope is respected without asserting their current merge status or interpreting an open PR as approval. The historical quantity review remains a boundary against premature metadata machinery, not an accepted export defect.

## Source links

Source labels are local to this document; AH01–AH05 are shared recommendation IDs. These references identify inspected source or current primary documentation. Source line spans are included in the evidence report; all repository links here are pinned to the declared baseline. The supplied historical summary and backlog were reviewed as packet entries, not as current repository files.

[S01]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/current-analysis-trust/intent-brief.md
[S02]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/reusable-analysis-outputs/intent-brief.md
[S03]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/export.mdx
[S04]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/DataTableToolbar.tsx
[S05]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx
[S06]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/filteredRows.ts
[S07]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/RowsView.tsx
[S08]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/definition.ts
[S09]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/readers/readTable.ts
[S10]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/readers/delimited.ts
[S11]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/readers/columns.ts
[S12]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/valueParsing.ts
[S13]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/fieldSettings.ts
[S14]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/types/SavedDataStructure.ts
[S15]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/utils/saveDataUtils.ts
[S16]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/DataLayerProvider.tsx
[S17]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/SavedViewsWorkspace.tsx
[S18]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/types/AnalysisProject.ts
[S19]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/analysis/projectFile.ts
[S20]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/analysis/evaluateProject.ts
[S21]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/savedViewsHistory.ts
[S22]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/savedViewsSession.ts
[S23]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/project/analysisText.ts
[S24]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/dsl/export.ts
[S25]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/PlotChartPanel.tsx
[S26]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/export/useChartImageExport.ts
[S27]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/providers/analysisReliability.test.tsx
[S28]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/utils/saveDataUtils.test.ts
[S29]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts
[S30]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/SavedViewsWorkspace.test.tsx
[S31]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/savedViewsHistory.test.ts
[S32]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/__tests__/DataTable.test.tsx
[S38]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/SummaryTable/utils/dataTypeDetection.ts
[S39]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/CrossfilterWrapper.ts
[S40]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/applyFilter.ts
[S41]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/chartPopulation.ts
[S42]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/fixtures/shopProject.ts
[E01]: https://observablehq.github.io/framework/deploying
[E02]: https://observablehq.github.io/framework/data-loaders
[E03]: https://nbformat.readthedocs.io/en/latest/format_description.html
[E04]: https://nbconvert.readthedocs.io/en/latest/execute_api.html
[E05]: https://help.tableau.com/current/pro/desktop/en-us/save_savework_packagedworkbooks.htm
[E06]: https://www.w3.org/TR/tabular-metadata/
[E07]: https://datapackage.org/standard/data-package/
[E08]: https://datapackage.org/standard/table-schema/
[E09]: https://duckdb.org/docs/current/sql/statements/export
