# Recommendations: quantity meaning after unit formatting

Research date: **2026-10-20**  
Repository: <https://github.com/byronwall/explorEDA>  
Selected implementation baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Decision and status

**Research access GO; feature adoption NO-GO.** Five substantive recommendations follow, with stable identifiers **QS01–QS05**. They propose research direction and authoring guidance. None authorizes or implements a new product capability.

The source packet's 38 entries passed byte/SHA-256 verification. Exact-ref connected reads confirmed current provider, inspector, daily loader, trace, and table-export boundaries. The existing source has display units, descriptions, explicit formulas, and scientific examples. No observed repeated task has rejected these controls, and no wrong-unit defect is established. The next local action remains the existing selection/export/undo/reopen trust proof; the sole bounded quantity candidate is a lesson and example after that proof.

Evidence labels used here: **R** = inspected repository source; **E** = official external documentation or metrology; **I** = inference; **P** = proposed policy/proof. All repository behavior statements are source-level findings. Application tests, author trials, browser interactions, history/restore/export execution, and third-party quantity software remain **unrun**. Independent arithmetic checks are described separately in `proof-plan.md` and do not establish application correctness.

| ID | Suggested disposition | Affected task |
| --- | --- | --- |
| QS01 | Adopt the existing proof order | Trust selected rows, measures, export, undo, and reopen. |
| QS02 | Investigate one lesson using current controls | Explain and author an explicit scientific transformation. |
| QS03 | Adopt explicit derivation as review guidance | Preserve input values and name a derived quantity's reference and grain. |
| QS04 | Defer one additional metadata property | Carry repeated reference context when existing descriptions demonstrably fail. |
| QS05 | Defer a quantity engine; reject inference and silent reinterpretation | Check declared conversions only after a real recurring task justifies the cost. |

## QS01 — Keep local trust as the first proof

**Suggestion: ADOPT the priority; proof execution remains proposed.**

### Task and evidence

- **Affected task:** select one category; compare a bar, card, and exported rows; inspect source members and valid numeric contributors; undo, redo, and reopen the same analysis.
- **R:** `docs/intent/current-analysis-trust/intent-brief.md` names this sequence and says to stop at the first disagreement. The supplied local quantity queue and historical navigation summary preserve the same priority. They do not report a fresh runtime pass. [R1] [^L1] [^H1]
- **R:** the store methods `saveToStructure`, `saveAnalysisToStructure`, and `restoreAnalysisFromStructure` in `providers/DataLayerProvider.tsx` carry settings/formulas and rebuild runtime data. `DataTableToolbar.tsx` exports `toTableCsv`, which serializes the table's provided rows. These paths identify what to inspect, not proof that the full workflow agrees. [R2] [R3]
- **E:** no external scientific fact decides this priority. It follows from the existing product intent and the absence of current interaction evidence.

### Benefit, cost, and alternatives

- **I — benefit:** establishes a credible basis for interpreting any later quantity comparison. A metadata change cannot compensate for unexplained selection or restore disagreement.
- **Cost:** one small local workload, actual interaction, captured membership and values, and a reproducible save/export receipt. Broaden only if the first sequence passes or a concrete failure requires diagnosis.
- **Alternative:** begin the scientific lesson immediately. Reject that order while the existing trust question remains unresolved; otherwise errors could be assigned to quantity semantics without evidence.
- **Confidence:** high in the priority from the supplied intent; no confidence claim about unrun runtime acceptance.

### Falsifiable proof and rejection condition

Use the proposed M0 fixture: one selected category has three source members, two numeric contributors, sum `12`, and mean `6`. Verify IDs as well as values. A mismatch in membership, contributors, undo state, or reopened result fails the proof and creates a bounded trust finding. A pass closes that small trust question; it does not certify every chart or prove feature demand. Stop immediately on unexplained disagreement.

### Exact proposed destinations

- **Intent:** `docs/intent/current-analysis-trust/intent-brief.md`, existing **Next step after confirmation**.
- **Proof record:** `docs/research/quantity-semantics-2026-10-20/proof-plan.md`, proposed **M0: local trust remains first**.
- **Docs/example:** M0 itself changes no user-facing behavior. If a real defect leads to a repair, its implementation milestone must identify the actual affected docs section and existing example before work begins; an unknown defect is not a reason to invent that scope now. The quantity lesson's concrete docs/example pair belongs to QS02.

## QS02 — Try one current-controls lesson before adding a feature

**Suggestion: INVESTIGATE one bounded lesson and example after QS01; do not assume it is necessary.**

### Task and evidence

- **Affected task:** an author makes a separately named derived field, explains its scientific reference, checks values and contributors, and reopens or exports the result for an identified purpose.
- **R:** `FieldSettings` already supports label, description, unit, format, precision, and parsing controls. `FieldInspector` exposes Description and Unit suffix and displays the applied description. `FieldMetadata` uses formatted ranges but does not include the authored description in its compact summary. These are specific surfaces to compare. [R4] [R5]
- **R:** `CalculationManager`, `Calculator`, and the parser support explicit formulas and row traces. The generic `fields.mdx` and `calculated-fields.mdx` introduce discovery and formulas but do not teach this complete scientific distinction. The Nile, CO₂, and Niño examples already explain their own meanings and should be reused or linked, not rewritten as missing capability. [R6] [R7] [R8]
- **E:** JMP's Units and Formula properties document a comparable separation between display and calculation. That supports the plausibility of the boundary, not the effectiveness of this proposed lesson. [E1]

### Benefit, cost, and alternatives

- **I — benefit:** may reduce ambiguity with the current public surface and expose whether the actual problem is discoverability, calculation effort, or handoff context.
- **Cost:** two short docs sections, one focused existing-controls demo, ordinary example registration, and one author comparison. Existing scientific prose should supply context rather than adding another broad tutorial series.
- **Alternatives:** defer everything when there is no actual task; use explicit upstream preparation when a reference population is best defined there. Both remain legitimate outcomes.
- **Confidence:** high that the controls exist; moderate that the lesson is the smallest useful experiment; low/unmeasured confidence in author benefit until tried.

### Falsifiable comparator

Agree on one real task before teaching. Compare unaided current controls, the same controls after the lesson, and explicit upstream preparation. Use synthetic F1–F6 fixtures to verify the oracle, then observe the real task separately. Record correct quantities, labels/reference explanations, membership, exported values, errors, author actions, and elapsed author effort. No elapsed time has been measured here.

Reject the lesson as unnecessary if current explanations already suffice. Reject it as sufficient if the same named task repeatedly fails after teaching and the failure is localized and reproducible. A proposed research threshold is two independent real task instances or sessions, subject to Byron's review; two synthetic examples do not establish demand. A successful lesson leaves feature adoption **NO-GO**.

### Exact proposed destinations — one milestone

- **Intent:** `docs/intent/scientific-multivariate-analysis/intent-brief.md`, proposed **Quantity meaning** subsection, retaining the expansion gate.
- **Docs:** `apps/demo/src/docs/pages/fields.mdx`, proposed **Units, stored values, and scientific reference**; `apps/demo/src/docs/pages/calculated-fields.mdx`, proposed **Explicit scientific transformations**.
- **Example:** new proposed `apps/demo/src/demos/quantityMeaning.ts`; register through `apps/demo/src/demos/examples.ts`, `apps/demo/src/demos/coverage.ts`, and `apps/demo/src/docs/live/examples.ts` as required by the existing agent guide. This is one demo with focused fixture states, not a new notebook product or chart family.
- **Reuse:** link the existing Nile `flow-boundary`, CO₂ `seasonal-centering`, and Niño `observed-range` pieces where their scientific explanations answer the lesson's question.

Documentation, the example, and its proposed acceptance checks belong to **M1 together**. Stop after that bounded candidate and review the result. [R9]

## QS03 — Preserve source numbers and derive explicitly

**Suggestion: ADOPT as proposed authoring/review guidance, with scientific choices remaining explicit. No automatic propagation is proposed.**

### Task and evidence

- **Affected task:** change numeric representation or reference without confusing a label edit with a calculation, and preserve enough information to inspect the result later.
- **R:** unit-only changes take the provider's display branch; parsing settings take a different branch. The calculator receives scalar inputs, not field-unit contracts. Query `calculateFrame` precedes downstream workspace parsing, while dashboard formulas follow that parsing. The query `aggregateFrame` provides count/sum/average across rows; registry `avg` is within one row. [R2] [R4] [R6] [R10]
- **R:** the corpus already supplies annual centers and climatology as explicit inputs. The inspected daily loader does not read the scientific sidecars. The table CSV route emits identifiers and unformatted values without their descriptions; an analysis save retains settings and formula definitions. [R3] [R8] [R11]
- **E:** BIPM distinguishes quantity kind from dimension. NIST's temperature definitions distinguish readings from intervals. These facts constrain an honest derivation; they cannot choose an author's reference population. [E2] [E3]

### Proposed boundary and propagation rules

Keep the original field, write a new result field, and give it an explicit label and description. Describe the source unit/basis, transformation, row grain, reference field or population, and missing-value rule. The description can be ordinary authored text; this is not a required structured schema.

- **Scale:** a declared scale factor can produce a new numeric representation. A suffix edit leaves the numeric value alone.
- **Affine/difference:** decide whether a field is a temperature reading, difference, anomaly, or interval width before choosing the formula. Do not copy a reading's offset behavior onto a difference.
- **Aggregation:** a count has count semantics; a mean needs a population and weights; a sum needs an additive quantity and non-overlapping membership. Min/max endpoints differ in role from their width. Products and ratios need an authored equation and basis. Equal labels do not settle any of these.
- **Reference:** a prepared annual center remains that declared reference when the chart is filtered unless the author intentionally chooses a different calculation. A recomputed selected-row center is a different estimand, not an invisible display preference.
- **Missing/invalid:** guard null explicitly, retain valid zero and signed values, and inspect calculation errors. Unknown units/bases remain unresolved. A physical-domain restriction requires its own authored rationale.
- **Handoff:** examine the actual required export. Current CSV preserves numbers rather than explanations. Compare explicit field identifiers and a saved analysis/settings handoff before asking for richer export metadata. Provider `rawData` may already be evaluated query output, so do not describe an analysis save as necessarily preserving all original source files.

### Benefit, cost, alternatives, and confidence

- **I — benefit:** makes numeric changes, inputs, and scientific interpretation inspectable without a new engine.
- **Cost:** author-maintained formulas and prose; possible repetition across views; upstream reference preparation when a row formula cannot calculate the required grouping.
- **Alternatives:** reproducible upstream preparation is preferable when normalization, grouping, reference selection, or shared data ownership belongs there. Current query calculation/aggregation can be compared when its actual contract fits. Do not introduce an adapter or external service.
- **Confidence:** high in source mechanics and arithmetic distinctions; conditional in scientific validity because declarations, coverage, weighting, and reference choice remain author responsibilities.

### Falsifiable proof and rejection condition

Use F1–F6 in the proof plan. The current-controls result must match independent numbers and declared meanings, preserve source fields, identify correct contributors, and retain its formula/settings on reopen. The application checks remain unrun. Reject a formula for wrong numbers, wrong reference, dropped zero, fabricated missing values, or unexplained incompatible declarations. Reject this manual workflow as sufficient only if a real repeated task still fails after QS02; do not turn a synthetic trap into feature demand.

### Exact proposed destinations

- **Intent:** `docs/intent/scientific-multivariate-analysis/intent-brief.md`, proposed **Quantity meaning / author responsibilities**.
- **Docs/example:** the QS02 M1 sections and `apps/demo/src/demos/quantityMeaning.ts`, in that same milestone.
- **Existing ownership:** reference `docs/intent/reusable-analysis-metrics/intent-brief.md` for grouped denominator/population questions. Do not repeat the completed rates survey or move its decisions into a unit-format setting.

## QS04 — Defer an extra metadata property until it beats `description`

**Suggestion: DEFER.** A possible `referenceNote?: string` is a deliberately small comparator, not an approved schema or feature milestone.

### Task and evidence

- **Affected task:** repeatedly carry or recover a field's reference meaning across a named view/reopen/handoff workflow.
- **R:** `FieldSettings.description` already persists, has Dashboard text support, and is editable in `FieldInspector`. Its compact-list visibility differs from its inspector visibility. `FieldDefinition` and corpus sidecars are different contracts; adding a string to one would not automatically propagate through the others. [R4] [R5] [R11] [R12]
- **E:** xarray/pint-xarray explicitly separate arbitrary metadata from quantity-backed data. A descriptive field is not enforced arithmetic. [E4]

### Benefit, cost, and alternatives

- **I — possible benefit:** a dedicated note could be more consistently located if repeated observations establish that the existing description is inadequate.
- **Cost:** another author decision, duplicate/conflicting prose, editor space, validation, saved state, Dashboard text, export policy, and docs/example maintenance. A single TypeScript property would not cover those obligations. `exportParts.fieldLines` records unmapped settings as omitted. [R12]
- **Alternative:** improve the use or presentation of existing `description`, name a reference column explicitly, or keep reference construction upstream. Compare those first. A new per-field string cannot represent arbitrary row-dependent references by itself.
- **Confidence:** high that an extra field is unjustified now; low that this particular field would solve a future task. No evidence establishes a defect in current description visibility.

### Falsifiable proof and rejection condition

Only reopen after QS02 produces a repeated, localized context-recovery failure. Compare existing description with one descriptive-note mockup on the same task. Numeric values, filter membership, formulas, and saved meaning must agree. Reject the addition if it duplicates description without improving the predeclared task, if the task actually needs a per-row reference, or if the requirement is automatic dimensional rejection. Do not reinterpret the note as a scientific certification flag.

### Exact proposed destinations if reopened

- **Intent:** the existing scientific intent's proposed **Quantity meaning / deferred metadata alternative** subsection.
- **Potential implementation seam, not a patch:** `packages/explorEDA/src/lib/fieldSettings.ts`, the existing field inspector, `utils/saveDataUtils.ts`, and `lib/dsl/{settingKeys,compile,export}.ts` would need review. Project-wide ingestion and adapters remain excluded.
- **Docs/example gate:** extend the same QS02 docs sections and `apps/demo/src/demos/quantityMeaning.ts` in any future user-visible milestone. No separate implementation milestone is opened by this recommendation.

## QS05 — Defer conversion/checking machinery and reject automatic meaning inference

**Suggestion: DEFER an integrated conversion/checking feature. REJECT automatic unit/basis inference and silent reinterpretation of stored values for this cycle.**

### Task and evidence

- **Affected task:** repeatedly prevent or perform declared compatible-unit arithmetic beyond what an explicit formula/preparation workflow can reliably handle.
- **R:** the selected calculator, provider, query fields, saved settings, and table export have separate scalar/display contracts. None of the inspected paths supplies a dimensional model to calculation evaluation. The supplied examples illustrate reference distinctions that scale conversion alone cannot resolve. [R2] [R4] [R6] [R8] [R10]
- **E:** Pint documents quantity arithmetic and explicit offset/delta behavior. That is a useful distinct capability, but a unit library does not know whether a CO₂ residual's reference is the intended one. Tableau's formatting documentation likewise illustrates presentation rather than a scientific declaration. [E5] [E6]

### Benefit, cost, and alternatives

- **I — potential benefit:** declared dimensional mismatches and repeated conversion formulas could become checkable if a real task justifies that boundary.
- **Cost:** quantity representation, a unit vocabulary, parser errors, affine/difference choices, aggregation rules, filtering behavior, persistence, explicit conversion intent, and export interpretation. For this React/TypeScript and pnpm project, importing a Python quantity workflow would introduce a separate runtime boundary; it is not proposed. No performance or implementation-cost estimate was measured.
- **Alternatives:** current row formulas and labels; explicit upstream conversion with provenance; the QS02 lesson; complete deferral. These are substantive alternatives, not interim steps toward a predetermined engine.
- **Confidence:** high in the present NO-GO; uncertain future value until a repeated task and a failing comparator exist.

### Falsifiable adoption gate and rejection conditions

Require a named repeated task that rejects the taught current controls, explicit scientific declarations, an independent numeric oracle, and a bounded implementation proposal that preserves source values and explanations. Reject adoption when the basis is unknown, same-unit fields have different unresolved references, incompatible declarations cannot be explained, saved numbers would change silently, or the smallest design requires a broad engine.

No conversion should be inferred merely from suffixes such as `ppm`, a currency code, or a field name. No blanket propagation from source label to output label is acceptable: addition, aggregation, temperature offsets/differences, and changed references have distinct meanings. Proposed scientific defaults require human review rather than being settled by library convenience.

### Exact proposed destinations

- **Intent:** `docs/intent/scientific-multivariate-analysis/intent-brief.md`, proposed **Quantity meaning / deferred engine and adoption gate**.
- **Docs/example obligation if ever reopened:** the QS02 docs sections and the same bounded example must accompany the first user-visible conversion behavior. No roadmap beyond the present lesson is committed.
- **Queue:** `docs/research/quantity-semantics-2026-10-20/research-queue.md`, mark this survey complete and reopen only on discriminating task evidence. Preserve PR454's ownership of time-series axes and the prior research proof gates.

## Decisions retained for human review

The actual recurring task, acceptable author effort, declaration ownership, fixed versus recomputed reference population, upstream versus workspace calculation, and necessary export context remain open. The proposed comparator recurrence threshold is a research design choice for review. No feature GO follows from research access GO, successful synthetic arithmetic, current official documentation, or the existence of a unit library.

## Evidence references

All repository links use the exact selected commit. Source inspection occurred 2026-10-20. The supplied local/historical references are identified separately; their PR status is inherited context, not a new survey.

[R1]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/current-analysis-trust/intent-brief.md
[R2]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/DataLayerProvider.tsx
[R3]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/DataTableToolbar.tsx
[R4]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/fieldSettings.ts
[R5]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/SummaryTable/components/FieldInspector.tsx
[R6]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/calculations/CalculationState.ts
[R7]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/calculated-fields.mdx
[R8]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/public/daily-viz/projects/co2/seasonal-centering.eda.md
[R9]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/agent-guide.md
[R10]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/analysis/evaluateProject.ts
[R11]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/daily/corpus.ts
[R12]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/dsl/export.ts

- **R1:** local trust intent, especially **Next step after confirmation**.
- **R2:** provider `updateFieldSettings` 770–864 and save/restore 1304–1396. In a project view, [ExplorEdaProject.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/ExplorEdaProject.tsx) 135–146/397–403 supplies evaluated rows.
- **R3:** `toTableCsv` 169–177; [DataTable.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx) 46–62/151–158 materializes calculated columns and passes filtered rows.
- **R4–R5:** `FieldSettings`, formatter/parsing separation, and inspector controls; [FieldMetadata.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/FieldMetadata.tsx) 169–175 defines the narrower compact summary.
- **R6:** `CalculationManager`; companion source: [Calculator.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/calculations/engine/Calculator.ts), [functions/registry.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/calculations/functions/registry.ts), [parser/semantics.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/calculations/parser/semantics.ts). These establish row expressions, guards, registry scope, and literal syntax.
- **R7:** calculated-fields docs; also [fields.mdx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/fields.mdx).
- **R8:** CO₂ notebook; also [CO₂ fields.json](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/public/daily-viz/projects/co2/fields.json), [Niño fields.json](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/public/daily-viz/projects/elnino/fields.json), [Niño observed-range.design.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/public/daily-viz/projects/elnino/observed-range.design.md), and [Nile flow-boundary.eda](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/public/daily-viz/projects/nile/flow-boundary.eda).
- **R9:** example registration, docs, browser and verification guidance; [AGENTS.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/AGENTS.md) requires docs/example scope in a user-visible milestone.
- **R10:** `sourceFrame`, `calculateFrame`, `aggregateFrame`; [AnalysisProject.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/types/AnalysisProject.ts) defines project fields and stage grain. [Reusable rates intent](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/reusable-analysis-metrics/intent-brief.md) retains denominator ownership.
- **R11:** `loadDailyEntry` 115–171; inspected daily-site path, not a claim about every CLI/host consumer.
- **R12:** `exportParts.fieldLines` 343–379; companion [SavedDataStructure.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/types/SavedDataStructure.ts), [saveDataUtils.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/utils/saveDataUtils.ts), [settingKeys.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/dsl/settingKeys.ts), and [compile.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/dsl/compile.ts) establish persistence/text obligations.

[^L1]: supplied local addition `docs/research/quantity-semantics-2026-10-20/research-queue.md`, SHA-256 `c1882623d794eeafb3ff715bdbeb1a8007561f8d4a2b8205c86125fc078e236a`; no immutable baseline link asserted.
[^H1]: supplied historical context at `3d1ffebb`, `docs/research/task-navigation-2026-10-20/README.md`, SHA-256 `b007f56fe1e6245241d6660ee3e69284fa3eb94c8bde138862470d520fc72336`; not current runtime evidence.

### External primary sources

All checked **2026-10-20**; none executed. Source dates below identify documentation, not observed installations.

[E1]: https://www.jmp.com/support/help/en/19.2/jmp/properties-that-control-the-display-of-columns.shtml
[E2]: https://jcgm.bipm.org/vim/en/1.2.html
[E3]: https://www.nist.gov/pml/owm/si-units-temperature
[E4]: https://pint-xarray.readthedocs.io/en/stable/creation.html
[E5]: https://pint.readthedocs.io/en/stable/user/nonmult.html
[E6]: https://help.tableau.com/current/pro/desktop/en-us/formatting_specific_numbers.htm

- **E1:** JMP 19.2 Units display; [Formula property](https://www.jmp.com/support/help/en/19.2/jmp/basic-column-properties.shtml). Both pages dated 2026-01-13.
- **E2:** JCGM VIM3 §1.2, note 2, quantity kind versus dimension; annotation 2013-12-03.
- **E3:** NIST SI Units – Temperature, updated 2026-06-17. Conversion definitions only; fixtures are independently derived.
- **E4:** pint-xarray stable guide, explicit wrapping and persistence; no tested release pinned. [xarray attributes](https://docs.xarray.dev/en/latest/user-guide/data-structures.html), updated 2026-10-20, establish the ordinary metadata boundary.
- **E5:** Pint stable temperature documentation; rendered build label `0.1.dev50+gaf817a609`, no installed version asserted.
- **E6:** Tableau current formatting documentation; page publication date not visible in retrieval. No claim that all other Tableau conversion capabilities were surveyed.
