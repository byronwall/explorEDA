# Relationship discovery: proof plan

**Status: independent fixture arithmetic completed; every product, author, browser, performance, persistence, and integration check below is proposed.**

Research date: 2026-10-19. Source basis: the authorized selected-text snapshot for `byronwall/explorEDA`, declared baseline `9b16d78e3ed0742ed4d5858c1939fec9e758b510`. This packet is source evidence, not a runnable checkout. No repository files were changed and no implementation is approved by this plan.

Access is a **qualified GO for this source-based research** under the prompt's explicit fallback authorization. GitHub tree/raw retrieval of the exact baseline failed. Although the prompt says a per-file SHA-256 manifest exists, none is present in the attachment. Locally computed receipt fingerprints do not independently authenticate the declared commit. The target branch `codex/relationship-discovery-research-2026-10-19` is for later Codex integration; it was not created here. Runtime or implementation approval remains NO-GO pending the evidence below.

## 1. Decision this proof can change

The current mixed-type matrix already supplies shape, Pearson coefficients, group colors, and traces. First test whether one teaching example plus current controls suffices to choose and inspect a useful pair. Only investigate a small numeric-pair handoff if the author repeatedly chooses the right pair and population but then loses time reconstructing it in a detailed scatter. A successful synthetic fixture establishes arithmetic and understandable examples; it establishes no user demand.

Keep four task stages separate in observation notes:

1. **Find:** identify a pair relevant to a stated question.
2. **Population:** identify eligible rows, valid pairs, exclusions, and any selected subset.
3. **Shape:** inspect the point pattern and color groups before trusting one coefficient.
4. **Open:** carry an already chosen pair into the existing detailed scatter and paired summary.

The fixture below can falsify statistical claims at stages 2–3. Author observation must establish a real obstacle at stage 1 or 4. A faster handoff cannot by itself show that discovery improved.

## 2. Completed checks and their limits

- **Completed:** read the foundation files before matrix and scatter source; read the relevant chart docs after source. The selected source inspected for this proof includes `ScatterMatrix/definition.ts`, `matrixPlan.ts`, `matrixTrace.ts`, relevant renderer and existing-test sections, `ScatterPlot/pairedSummary.ts`, `ScatterPlot/definition.ts`, and `lib/valueParsing.ts`.
- **Completed:** ran independent Python standard-library calculations using exact rational arithmetic for centered sums, average ranks for ties, sample covariance, and record-ID set operations. Explicit assertions checked the fixture size, linear/U/reversal/constant values, sparse pair membership, and leverage results. These calculations import no explorEDA code.
- **Completed:** retrieved current primary documentation listed in section 10. External product behavior is source-described; no vendor application was operated.
- **Not performed:** `vitest`, typechecking, `pnpm check`, demo builds, browser interaction, screenshots, benchmark measurements, author tasks, API or save/restore integration, selection/export/undo/reopen proof, PR creation, merge, or deployment.

The local selection/export/undo/reopen trust journey remains first in the queue. Run the proposed author and runtime work only after that existing priority is satisfied and Codex has the exact runnable baseline.

The complete source-read audit covered all 25 requested repository excerpts and both local research additions. Sixteen existing matrix planner/trace test cases were inspected as text; none ran. Independent arithmetic covered 13 pair/population cases plus the identifier counterexamples below. No elapsed time in this research is a product performance measurement.

## 3. One exact 12-row fixture

Use the two tables as one table joined by the unique `record_id`. `null` denotes an actual missing value. Every non-null measurement is a numeric value, not a numeric-looking category. Set `constant = 7` in every row. All values are synthetic; none represents author behavior or domain evidence.

The dataset has a record key and ten candidate matrix fields: `group`, `x`, `linear`, `curve`, `rev_x`, `rev_y`, `constant`, `sparse_a`, `sparse_b`, `leverage_y`. Exclude `record_id` from the matrix. The ten-field limit is respected even when every candidate is selected. For the teaching example, begin with only six fields: `x`, `linear`, `curve`, `rev_x`, `rev_y`, `group`; use `group` as Color. Swap to the sparse and leverage fields for the bounded diagnostic steps. A crowded ten-field starting view is unnecessary.

| record_id | group | x | linear | curve |
|---|---|---:|---:|---:|
| r01 | A | -5 | -9 | 25 |
| r02 | A | -4 | -7 | 16 |
| r03 | A | -3 | -5 | 9 |
| r04 | A | -2 | -3 | 4 |
| r05 | A | -1 | -1 | 1 |
| r06 | A | 0 | 1 | 0 |
| r07 | B | 1 | 3 | 1 |
| r08 | B | 2 | 5 | 4 |
| r09 | B | 3 | 7 | 9 |
| r10 | B | 4 | 9 | 16 |
| r11 | B | 5 | 11 | 25 |
| r12 | B | 30 | 61 | null |

| record_id | rev_x | rev_y | sparse_a | sparse_b | leverage_y |
|---|---:|---:|---:|---:|---:|
| r01 | -8 | 3 | 1 | 10 | 25 |
| r02 | -7 | 4 | 2 | 20 | 16 |
| r03 | -6 | 5 | 3 | 30 | 9 |
| r04 | -5 | 6 | 4 | 40 | 4 |
| r05 | -4 | 7 | 5 | null | 1 |
| r06 | -3 | 8 | 6 | null | 0 |
| r07 | 3 | -8 | 7 | null | 1 |
| r08 | 4 | -7 | 8 | null | 4 |
| r09 | 5 | -6 | null | 90 | 9 |
| r10 | 6 | -5 | null | 100 | 16 |
| r11 | 7 | -4 | null | null | 25 |
| r12 | 8 | -3 | null | null | 900 |

Define the exact record sets:

- `ALL = {r01,r02,r03,r04,r05,r06,r07,r08,r09,r10,r11,r12}`.
- `CORE = {r01,r02,r03,r04,r05,r06,r07,r08,r09,r10,r11}`.
- `A = {r01,r02,r03,r04,r05,r06}`; `B = {r07,r08,r09,r10,r11,r12}`.
- `SPARSE = {r01,r02,r03,r04}`.

`record_id` is the assertion key. At runtime, resolve the app's internal source IDs to these record keys; do not assume a one-based or zero-based `__ID` convention from this specification.

### 3.1 Exact coefficients and populations

For paired finite measurements, define `Sxx = Σ(x−mean(x))²`, `Syy = Σ(y−mean(y))²`, `Sxy = Σ(x−mean(x))(y−mean(y))`, and `r = Sxy/√(Sxx Syy)`. Spearman `ρ` here is Pearson correlation of average ranks, with ranks recalculated on that pair's valid population. The independent calculations use this definition; the current matrix displays Pearson, not Spearman. [S1, S2]

| Pair and population | Computed expectation | What the example establishes |
|---|---|---|
| `x × linear`, `ALL`, n=12 | `r = ρ = +1`; `linear = 2x+1` | Positive linear case with an exact reference. |
| `x × curve`, `CORE`, n=11 | `r = ρ = 0` exactly; `curve = x²` | A clear U shape can have zero Pearson and zero Spearman. `r12` has valid X but missing curve. |
| `rev_x × rev_y`, `ALL`, n=12 | `r = −164/199 ≈ −0.8241206030`; `ρ = −73/143 ≈ −0.5104895105` | The pooled direction differs from both groups. |
| Same pair, `A`, n=6 | `r = ρ = +1`; `rev_y = rev_x+11` | Color group A has a positive direction. |
| Same pair, `B`, n=6 | `r = ρ = +1`; `rev_y = rev_x−11` | Color group B also has a positive direction. |
| `x × constant`, `ALL`, n=12 | `r` and `ρ` undefined; Y spread is zero | Twelve valid pairs do not make correlation defined. Show an unavailable statistic, never zero. |
| `sparse_a × sparse_b`, `SPARSE`, n=4 | `r = ρ = +1`; eligible rows remain `ALL` absent filters | The coefficient uses four pairs, not either field's individual valid count. |
| `x × leverage_y`, `ALL`, n=12 | `r = √(2970375/3370403) ≈ 0.9387819356`; `ρ = √(198/3653) ≈ 0.2328132851` | One high-leverage record can dominate the linear summary. |
| Same pair, external scope `CORE`, n=11 | `r = ρ = 0` exactly | Excluding `r12` changes the population and the descriptor. It is a sensitivity comparison, not permission to delete the record. |

The algebra is independently reviewable:

- Linear: `(Sxx,Syy,Sxy) = (935,3740,1870)`, means `(5/2,6)`. Sample covariance is `[[85,170],[170,340]]`.
- U shape: `(110,858,0)`, means `(0,10)`; rank sums are `(110,215/2,0)`. Symmetry cancels the cross-products for both methods. Sample covariance is `[[11,0],[0,429/5]]`.
- Reversal pooled: `(398,398,−328)`, means `(0,0)`. Each group has `(35/2,35/2,35/2)`; group means are `(−11/2,11/2)` and `(11/2,−11/2)`.
- Sparse pair: `(5,500,50)`, means `(5/2,25)`; sample covariance is `[[5/3,50/3],[50/3,500/3]]`.
- Leverage full: `(935,2180849/3,24475)`, means `(5/2,505/6)`. Rank sums are `(143,281/2,33)`. Removing `r12` gives the U-shape moments above.

Use exact ID-set equality and absolute coefficient tolerance `1e−12` in future numeric fixture assertions. Rounded display text may use existing formatting; never assert that a rounded label is the underlying value.

### 3.2 Missing populations: independently missing versus exclusion order

For `sparse_a` as X and `sparse_b` as Y with all twelve eligible rows:

- X contributes finite values at `{r01,r02,r03,r04,r05,r06,r07,r08}`: eight numeric contributors.
- Y contributes finite values at `{r01,r02,r03,r04,r09,r10}`: six numeric contributors.
- Both contribute at `SPARSE`: four valid pairs.
- X is missing at `{r09,r10,r11,r12}`; Y is independently missing at `{r05,r06,r07,r08,r11,r12}`; both are missing at `{r11,r12}`.

Current source contains two different counts. `matrixTrace.ts:resolveMatrixTrace` reports independent missing marginals `[4,6]`. `pairedSummary.ts:pairedStats` counts X exclusions first, then Y exclusions only among rows with valid X; its priority counts are `[4,4]`, and `pairs + missingX + missingY = 4+4+4 = 12`. Swapping the axes leaves pair IDs and `r` unchanged but changes the summary's priority counts to `[6,2]`. Do not label these as interchangeable missing marginals. This source finding is an audit target, not a product-runtime observation or an automatic declaration of a bug.

### 3.3 Zero, one, and two pairs

Apply these as external record scopes to the sparse pair; do not rewrite source rows.

| External eligible set | Exact valid-pair set | Expected current source behavior |
|---|---|---|
| `{r05,r09,r11}` | `{}` | Matrix n=0 and no `r`; scatter no paired mean/spread/correlation. Matrix missing `[2,2]`; scatter priority exclusions `[2,1]`. |
| `{r01}` | `{r01}` | Matrix n=1 and no `r`; scatter means `(1,10)`, no spread/correlation. |
| `{r01,r02}` | `{r01,r02}` | Matrix n=2 and no `r`; scatter `r=+1`, means `(3/2,15)`, covariance `[[1/2,5],[5,50]]`. |

`matrixPlan.ts:pearson` requires at least three pairs, whereas `pairedSummary.ts:pairedStats` permits correlation with two nonconstant pairs. Two-pair Pearson is algebraically ±1 [S1]. Decide and document the intended availability threshold before presenting a matrix-to-scatter action as numerical continuity. Do not silently change either threshold in a navigation patch.

### 3.4 Filters, selection, color, and scale bounds

These are proposed product assertions using computed sets; they have not been run in the app.

1. With `x × leverage_y`, external scope `ALL`, and no matrix-owned selection, expect matrix n=12 and `r≈0.9387819356`.
2. Set the matrix's own selection to `CORE`. `planMatrixLayout` keeps the same live population and coefficient; `planMatrixSelection` selects eleven rows. Expect matrix selected count 11 of 12, cell n=12, and unchanged `r`. The hypothesis that a linked scatter receives this selection as another chart's filter needs integration verification. Conditional on its receiving exactly `CORE`, its arithmetic expectation is eleven pairs with `r=0`. Record both populations; do not claim identical charts must always display identical coefficients.
3. Clear the matrix-owned selection and apply an external filter limiting the matrix's live IDs to `CORE`. Expect matrix n=11, `r=0`. Domains planned from all source rows remain anchored to the complete source.
4. In the detailed scatter with `ALL` eligible, set the X viewport bounds to `[-5,5]`. Expected geometric offscreen set is `{r12}`. The proposed invariant is that the analysis population remains twelve valid pairs and its full-population descriptor is unchanged. README establishes that bounds are not filters; the missing downstream summary integration and unrun runtime prevent claiming this summary behavior as a completed check.
5. With `rev_x × rev_y` and Color=`group`, assert exact memberships `A` and `B`, each n=6 and `r=+1`, alongside pooled n=12 and negative `r`. Group-specific pair counts are proof requirements, not a claim that the current matrix visibly displays each count.
6. On a coefficient cell, confirm existing behavior before adding an action: ordinary pointer interaction follows the empty-space selection-clear path; Alt-click/Alt-Enter traces. Matrix filter replacement preserves filters outside selected matrix fields and `__ID`. Any future handoff must leave the intended selection and trace gestures coherent.

A numeric-pair handoff proof must name source and destination populations. With no matrix-owned selection, require exact pair-set continuity. With one present, explicitly test the intended linked-filter scope; the current source matrix and destination scatter can legitimately have different `n`. Stop if the prototype hides that difference.

The linked-Scatter behavior in step 2 is an **integration hypothesis to test**, not a verified runtime fact: `useGetLiveData.ts`, the data provider, and the downstream Scatter plan are absent. In the first conditional navigation prototype, restrict the supported action to true numeric pairs with no source-owned filters and no facet scope, and no preexisting target filters. Do not silently clear filters or flatten a facet to satisfy that restriction. If the actual author task needs those contexts, inspect their source and agree a precise population policy before proceeding; a restricted prototype cannot establish broader value.

For a future handoff, choose X from the source cell's column and Y from its row. The current manual comparator may reuse an author-chosen Scatter; the prototype should first use existing chart creation without inventing a generic reuse policy. Record how a second activation and return to the matrix behave. New-tab versus existing-tab reuse, target replacement, and undo/save semantics are unresolved local product choices, not implemented behavior.

Date/numeric cells are outside the first proposed handoff proof. The matrix converts date values through `timestampOf`, while the paired numeric summary reads through `finiteNumber`; the broader scatter date path was not established by this packet. A separate source audit must establish compatible date semantics before adding dates to the navigation contract. This is not new time-series axis work.

### 3.5 Category cardinality and cross-method counterexamples

These are completed independent arithmetic on the same 12 records, not proposed new app statistics or observed product results.

- Treat `record_id` as a nominal category solely for this counterexample. Each category contains one observation, so each category mean of `x` equals that observation. Between-category sum of squares equals total sum of squares, 935, and within-category sum of squares is zero. Thus the in-sample ratio `eta²(record_id → x) = 935/935 = 1`. A unique identifier can therefore receive a perfect category/numeric score without answering a useful domain question. [S4, S5]
- The raw 12-by-2 contingency table of `record_id × group` has one count per row and column totals 6 and 6. Each expected cell is 1/2; each of the 24 cells contributes 1/2 to chi-square, so `chi² = 12`. Raw `V = sqrt(12 / (12 × min(11,1))) = 1`. This is a descriptive arithmetic result; the sparse expected cells supply no basis for an asymptotic significance claim. [S6]
- The current matrix's supplied 20-category test expects twelve displayed bands including `Other`. That is a source assertion, not an executed check. A future mixed association would need to declare whether it used raw typed categories or folded display bands. The absent band implementation prevents specifying its tie-order membership beyond supplied assertions.

Pearson, Spearman, eta squared, and Cramér's V summarize different structures and lack a universal common ordering. The fixture's nine numeric candidate fields have 36 unordered numeric pairs; all ten mixed candidate fields have 45 unordered pairs. A scan of these synthetic pairs does not establish real demand for ranking, and selecting a large score from the scan is not independent confirmation. No significance engine or causal claim is proposed.

## 4. Current-controls comparator and one teaching example

### Comparator A: current matrix plus a short lesson

Use current triangle settings: numeric points below, correlation above, mixed points/boxes, categorical shares/tiles, and a distribution diagonal. Keep the field list to six initially. Use existing field reorder controls, Color=`group`, cell/row trace, linked filters, and existing detailed scatter settings. Do not supply a new ranked list or hide the point triangle during the comparator.

For a separate coefficient-readability subtask, give current controls their strongest configuration: select a numeric subset, set upper numeric cells to **Corr**, lower numeric cells to **Blank**, and continuous diagonals to **Name**. Return to a point triangle for shape interpretation. This existing option must be tried before treating a separate compact coefficient view as necessary.

Teaching task: **“Find a relationship worth inspecting even when its Pearson coefficient is near zero. Then find a pair whose pooled direction differs from both color groups. Explain each population and open the chosen pair in a detailed scatter.”** Expected fixture evidence is the U pair and reversal pair above. In the diagnostic continuation, explain why the sparse pair uses four rows and why hiding `r12` with scale bounds differs from filtering it.

The lesson ends with a practical sequence: inspect the point pattern, compare pooled and colored groups, inspect the valid-pair population, then open detail. Its primary lesson is already supported by scatter-plot practice [S3]; it does not teach that a coefficient gives a causal explanation.

### Comparator B: only if handoff friction remains

For a bounded prototype, start each comparison after the author has named the pair and intended population. Compare the current X/Y setup path with one explicit numeric-pair-to-scatter action. Keep the lesson, dataset, pair, color intent, and filter scope identical. Measure intentional actions, wrong-axis corrections, completion time, and population explanations. Attribute improvements only to opening detail; report no discovery benefit without a separate finding task.

Prototype invocation is a proposed design question. Do not repurpose ordinary coefficient clicks before resolving their existing clear-selection behavior. Do not commit to public settings or a persisted API merely to stage the comparison.

## 5. Proposed author acceptance and stop gates

These gates are pragmatic personal-project decision rules, not a statistically powered user study.

- **Before any new UI:** after the local trust journey, ask the author to name one real question, supply the lesson, and observe up to three relevant pair-to-detail transitions in one session on author-chosen data. Record the shortlist, pair choice, intended population, attempts, and whether difficulty is finding, population, shape, or opening. If no task can be named, stop with demand unconfirmed. A second session is needed only to establish recurrence before expanding UI. The synthetic example is training and correctness evidence only.
- **Stop with docs/example:** if the author makes a defensible pair choice, explains its population, and opens detail without recurring friction after the lesson, reject further UI for this cycle. A matrix that already answers the task is positive evidence for stopping.
- **Investigate handoff:** proceed only if at least two transitions show an already identified numeric pair followed by repeated X/Y reconstruction, at least three avoidable deliberate interactions, or a recurring wrong-axis correction, and the author identifies that work as disruptive on a repeated task. Confirm recurrence in a second session before implementation review. This criterion establishes an opening problem, not a ranking problem.
- **Accept a handoff proposal for implementation review:** on three matched tasks with order alternated, reduce median opening actions by at least two, have no wrong field/population/color results, and obtain the author's specific intention to use it for a named next task. Time is secondary because the tiny sample and learning effects are substantial.
- **Disprove handoff value:** stop if the author still cannot choose a pair, uses the existing detail controls comfortably, does not reuse the action, or cannot explain the source/destination population. Return to the identified problem without broadening into ranking.
- **Keep coefficient-only and ranking routes deferred:** a larger field count or attractive synthetic score alone does not reopen them. Require repeated evidence that a known field shortlist cannot be scanned effectively and that the existing points/groups comparator fails the actual author task. A mixed-method universal ranking remains rejected even if a numeric shortlist is later justified.

## 6. Proposed runtime acceptance and stop gates

All runtime gates require a runnable checkout verified at the baseline. The selected packet cannot satisfy them.

- **Correctness:** exact record sets match section 3; numeric outputs meet the declared tolerance. Constant, zero, one, and two-pair states are distinguishable. Parser checks use the current centralized numeric/date rules. A displayed unavailable correlation cannot masquerade as zero.
- **Population continuity:** verify external filters, matrix-owned selection, the `r12` viewport case, swapped sparse axes, pooled/grouped counts, and any chosen handoff population contract. No silent coefficient recomputation on an undisclosed subset.
- **Interaction:** verify ordinary selection/clear, Alt-click, keyboard trace, and focus behavior at 1280, 783, and 390 px, using real inputs. For a future explicit handoff, verify the chosen pair orientation and return path. Use the repo's browser workflow, not inferred screenshots.
- **History and context:** if a handoff is justified, record the source field order, color, filters, and scroll/focus state before and after opening. Verify repeated activation, target filters, one intentional undo step for creation, redo, and save/reopen under the existing history contract. Keep these focused handoff checks distinct from the broader local trust journey that remains first. A task that needs uninspected cross-tab or facet semantics cannot pass by assuming them.
- **Bounded performance:** only if code changes, compare baseline and candidate on the same browser and device at ten fields and 10,000 numeric rows; test an external filter update, a matrix brush, and the new action. Use five warmed repetitions per operation as a provisional screening budget, without claiming that this establishes tail latency or broad capacity. Report raw measurements and medians. Investigate a repeatable regression exceeding the larger of 20% or 50 ms; choose a larger dataset only if actual author data requires it. This is a proposed screening gate, not a claimed response-time target.
- **Scope:** no new statistical engine, ranking service, general metrics framework, automatic p-value, causal claim, adapter, imputation workflow, or time-axis project. A need for any of these stops this handoff proof and requires a separate decision.

The selected existing tests are evidence that cases have been authored, not that they pass at runtime here. Inspect and extend the relevant current tests when a change is approved; do not build a second fixture-test framework for this research deliverable.

The provisional 10,000-row performance workload and regression threshold require agreement against the actual author device/browser/data target before execution. If source brush scheduling is touched, include a bounded check immediately below and above the existing 20,000-live-row scheduling boundary. If it is not touched, do not add that test solely for coverage. No benchmark or author proof has been completed.

## 7. Proposed documentation and example scope

- `apps/demo/src/docs/pages/scatter-matrix.mdx`: extend the existing page with a short “Choose a pair” sequence, pooled-versus-color explanation, valid-pair population language, weak-coefficient/visible-shape example, and the difference between matrix selection and external filters. Document a handoff only if implemented.
- `apps/demo/src/docs/pages/scatter.mdx`: link from the matrix guidance to existing detailed scatter controls; clarify paired summary population and viewport bounds where that is needed for the example.
- `apps/demo/src/docs/pages/trace.mdx`: change only if exact matrix row/cell trace gestures or population terminology need a cross-reference. Avoid duplicating a generic trace guide.
- Proposed live example ID: `relationship-shapes`, using the fixture above and one matrix plus detailed scatter. The agent guide identifies `apps/demo/src/docs/live/examples.ts` as the example/steps registry and `apps/demo/src/demos/examples.ts` plus coverage as demo registration. Those registry files are absent from the selected packet. Their current shapes must be inspected locally; no registry entry is claimed to exist or have been authored.
- Require the example and corresponding docs in the same milestone. User-facing copy teaches product behavior; internal thresholds, gaps, and research decisions belong in the relationship intent/research files.

## 8. Proposed local run sheet

The following commands are **not executed results**. Run only in Codex's verified runnable checkout, scoped to the eventual change. Research output does not authorize implementation, a PR, or any external write.

```bash
# Verify current matrix behavior and any focused change.
pnpm --filter exploreda exec vitest run src/components/charts/ScatterMatrix/matrixPlan.test.ts
pnpm --filter exploreda check-types

# If a demo example is added, verify its coverage and serialized settings.
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts

# If docs/example scope changes, verify links, registration, and rendered steps.
pnpm --filter demo docs:check
pnpm --filter demo build
pnpm --filter demo docs:verify -g '/docs/scatter-matrix$'

# If scatter.mdx or trace.mdx also changes, include its rendered page checks.
# Run this expanded scope instead of the preceding single-page command.
pnpm --filter demo docs:verify -g '/docs/(scatter-matrix|scatter|trace)$'

# Before the later review PR, run once from one worktree.
pnpm check
```

Do not run package commands against this selected-text packet or treat a successful independent arithmetic script as one of these gates.

## 9. Stop conditions and smallest unblocks

- Exact source identity or core files unavailable: obtain the authorized baseline source before continuing that source claim.
- Current controls have not been tried after a teaching example: author observation is the unblock; more feature research is not.
- Population or date handoff semantics are unresolved: inspect the exact source paths and agree the numeric population contract before a prototype can pass.
- Runtime proof unavailable: retain proposed status. Obtain the runnable baseline and use the bounded run sheet.
- Author task succeeds with current controls: stop product expansion for this cycle; keep only the useful docs/example work and source-truth corrections.

## 10. Evidence references

### Repository evidence

All repository references describe inspected selected source at the declared baseline; they are not browser observations.

- `packages/explorEDA/src/components/charts/ScatterMatrix/definition.ts`: cell types, defaults, field limit constants.
- `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.ts`: `continuousValue`, `pearson`, `pairedCorrelation`, `planGroups`, `planMatrixLayout`, `planMatrixSelection`, `withSelectedBars`, `replaceSelection`.
- `packages/explorEDA/src/components/charts/ScatterMatrix/matrixTrace.ts`: `resolveMatrixTrace` and independent missing marginals.
- `packages/explorEDA/src/components/charts/ScatterMatrix/ScatterMatrix.tsx`: coefficient/label pointer handling, selection/trace controls, correlation renderer.
- `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.test.ts`: existing authored Pearson, selection, grouping, category, and trace tests; not executed.
- `packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts`: `pairedStats`, `planPairedSummary`.
- `packages/explorEDA/src/lib/valueParsing.ts`: `finiteNumber`, `timestampOf` and centralized exclusion rules.
- `AGENTS.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, `README.md`, both supplied package manifests: repository workflow, docs/example registry guidance, bounds semantics, and current package context.
- Existing docs read last: `apps/demo/src/docs/pages/scatter-matrix.mdx`, `scatter.mdx`, and `trace.mdx`.

### Current primary statistical sources

- **S1:** [SciPy `pearsonr`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.pearsonr.html), live documentation served as SciPy v1.18.0; accessed 2026-10-19. Used for the linear coefficient definition, constant-input unavailability, the two-pair boundary, and zero correlation despite nonlinear dependence. No SciPy runtime was needed or claimed.
- **S2:** [SciPy `spearmanr`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html), served as SciPy v1.18.0; accessed 2026-10-19. Used for its monotonic-association meaning. Spearman calculations in this document are independent fixture arithmetic, not a proposal that the app already supports it.
- **S3:** [NIST/SEMATECH, Scatter Plot](https://www.itl.nist.gov/div898/handbook/eda/section3/scatterp.htm), accessed 2026-10-19. Used for inspecting nonlinear patterns, outliers, and conditioning on a third variable; association does not establish a causal explanation.
- **S4:** [JMP 19.2, Effect Tests](https://www.jmp.com/support/help/en/19.2/jmp/effect-tests.shtml), published 2026-01-13, accessed 2026-10-19. Defines eta squared as effect sum of squares divided by total sum of squares.
- **S5:** [NIST/SEMATECH, One-way ANOVA overview](https://www.itl.nist.gov/div898/handbook/prc/section4/prc431.htm), accessed 2026-10-19. Provides the between/within/total sum-of-squares decomposition used in the identifier counterexample.
- **S6:** [SciPy v1.18.0, contingency association](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.contingency.association.html), accessed 2026-10-19. Documents nominal-table association measures; the raw V counterexample is independently calculated here.

The exact fixture results and gates are respectively completed independent calculations and explicitly proposed decision rules. Neither is evidence of completed product acceptance.
