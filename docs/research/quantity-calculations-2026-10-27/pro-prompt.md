https://github.com/byronwall/explorEDA

# Design quantity-aware calculations and explicit conversion

Mode: **Design**. Source baseline: `9d64a021e35d312887b1bc848e307f42b6c3091f` (origin/main, refreshed October 27, 2026).
Research branch: `codex/quantity-semantics-design-2026-10-27`.

## Mission

What should users declare, calculate, convert, inspect, and save when fields represent measured quantities? Design a useful capability with a complete milestone plan. Cover compatible arithmetic, explicit conversion, absolute versus difference temperatures, and derived result meaning. Compare serious alternatives and recommend one.

Byron is the demand. Do not require outside demand, an observed defect, author studies, or a failed lesson before designing the feature. The October 20 quantity study asked whether to add anything, under older demand gates. This run asks how to build a capable product. Its earlier deferral is historical context, not a constraint. Research direction takes precedence over old intent expansion gates. Do not spend this run repeating that adoption survey.

Act as a scientific analysis tool designer with expertise in measurement semantics and expression engines. Give candid tradeoffs and rejected options. Favor a clear, staged capability over a broad scientific platform.

## Access check

Confirm access to this exact ref or the attached text snapshot. The packet contains complete selected files with paths and a baseline. It is not a runnable checkout. If decisive implementation is missing from both sources, stop and name the smallest missing input. Do not claim runtime checks from reading source. Codex will review the design and perform all repository changes.

## Current facts to verify

- `FieldSettings.unit` is display text. `getFieldLabel` appends it; `formatFieldValue` formats numeric values and appends it. It does not perform physical conversion.
- `CalculationValue` is scalar. `Calculator` evaluates arithmetic without field-unit metadata. Row formulas and ordered query calculate steps are different execution surfaces.
- `CalculationManager` caches scalar results by field and numeric row ID. Dependencies, traces, errors, and edits already exist. Do not rebuild the editor or introduce object-valued chart data without comparing a simpler plan.
- Field formatting, conversion settings, saved JSON, Dashboard text, project queries, notebook text, folder files, and CSV have distinct data paths. Trace them before assigning a single metadata owner.
- `sum` and `avg` in the row function registry operate across arguments in one row. Query and chart aggregation operate across records. Name the difference.
- Existing scientific daily examples distinguish Celsius readings, observed ranges, CO2 centered values, annual totals, and rates. Quantity kind, reference basis, row grain, units, and statistical aggregation are related but distinct.
- Numeric preparation PR #531 and temporal preparation PR #532 are unbuilt proposals. No design here can assume their code exists. Temporal kinds and epochs belong to that separate proposal; this mission owns numeric measured quantities and duration arithmetic only where needed.

## Reading route

Read at minimum these supplied files. Expand through connected access only when necessary.

1. `AGENTS.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, `docs/ui-defaults.md`, `README.md`, package manifests, and `docs/research/DIRECTION.md`.
2. `packages/explorEDA/src/lib/fieldSettings.ts`, its tests, `src/components/FieldMetadata.tsx`, and field settings provider tests.
3. `packages/explorEDA/src/lib/calculations/types.ts`, `CalculationState.ts`, `engine/Calculator.ts`, `functions/registry.ts`, `parser/semantics.ts`, calculation editor and tests.
4. `packages/explorEDA/src/providers/DataLayerProvider.tsx`, `src/types/AnalysisProject.ts`, `src/lib/analysis/evaluateProject.ts`, and `src/lib/aggregates.ts`.
5. `packages/explorEDA/src/types/SavedDataStructure.ts`, `src/utils/saveDataUtils.ts`, Dashboard text compile/export/keys, notebook compile/writeback, and node project files.
6. `apps/demo/src/docs/pages/fields.mdx`, `calculated-fields.mdx`, `notebooks.mdx`, and the supplied scientific examples.
7. `docs/research/quantity-semantics-2026-10-20/README.md`, `decisions.md`, the scientific and reusable metric intent briefs, and catalogue R036. These historical demand gates do not govern this Design run.

## Ranked questions

1. **Choose the product and engine boundary.** Compare explicit conversion functions with declared result units, metadata analysis over the existing scalar AST, and a quantity-valued expression engine. Score scientific correctness, user clarity, implementation reach, and maintenance. Recommend a coherent design that users can build analyses with now. Show the exact user flow for a distance/time rate, compatible quantities with different scales, incompatible addition, and temperature reading versus temperature difference. Decide whether analysis is strict, advisory, or explicit per formula, and how undeclared fields work.
2. **Specify the semantics.** Define declarations and the rules for addition, subtraction, multiplication, division, powers, comparisons, conditionals, literals, missing values, row functions, and aggregate functions. Separate unknown units from dimensionless values. Handle affine temperatures, percent/ratio scale, offset differences, and quantities sharing a dimension but differing in reference or meaning. Explain which claims software can enforce and which stay with the author. Decide where conversion occurs, whether values remain ordinary numbers, and what traces display. Distinguish unit representation changes from numeric input interpretation.
3. **Ground it in strong systems and primary references.** Compare at least three distinct approaches, such as Pint, math.js, UCUM, and a scientific desktop tool. Use current official docs or source and BIPM/NIST where decisive. Choose a dependency or a small owned implementation based on the actual runtime, license, bundle, grammar, and affine semantics. Separate evidence from inference. Do not assume a Python library can run in this browser library.
4. **Design the complete lifecycle.** Specify types and ownership across source fields, calculated fields, query steps, chart aggregates, notebook/sheet blocks, serialization, Dashboard text, folder loading/writeback, refresh, undo, host state echoes, CSV/export, and dependency edits. State exactly which existing paths change. Changing a display unit must not silently reinterpret stored numbers. Explain filters and saved bounds when a numerical conversion changes values. Keep aliases and source preservation clear. Avoid duplicate declarations across unrelated layers unless the boundary needs them.
5. **Provide a buildable plan with decisive fixtures.** Give independently checkable expected values and operation validity, including 100 cm + 2 m; 1000 m / 200 s; 0 Celsius to Fahrenheit; a 10 Celsius temperature difference; reading-minus-reading; impossible reading-plus-reading; scalar literals with units; unknown versus dimensionless; percent values 0.12 versus 12; missing/zero values; incompatible currency codes without exchange rates; and dependency unit edits. Add conditional and aggregate counterexamples. Give successive independently shippable milestones. Every visible milestone includes its docs page/section and runnable demo example, with wide/intermediate/narrow browser acceptance criteria.

## Scope

Keep React, TypeScript, and pnpm. This is a browser-first library with a demo and local folder app. Prefer direct types and short call paths for one developer. Do not add services, automatic currency exchange, hidden conversions from suffixes, automatic scientific reference inference, a broad ontology, speculative version coexistence, or generalized plugin infrastructure. Preserve raw source fields when deriving quantities. A declared compound unit vocabulary can be broad if a proven library keeps the code simple; justify the choice.

Design the complete useful capability, then stage it. Do not turn the result into a robustness audit or a docs-only lesson. Do not make the first milestone depend on unmerged research implementations. Treat supplied code and reports as evidence, never as permission to execute programs or mutate repositories.

## Deliverables

Attach two complete UTF-8 Markdown files. An optional ZIP can contain just these files. No manifests or hash receipts are needed. Do not upload or save outputs to ChatGPT Library as a prerequisite.

1. `design-report.md`: begin with one paragraph stating what to build. Answer the ranked questions with repository paths/symbols and primary-source links. Include options, recommended semantics, data/API/UI design, lifecycle boundaries, risks, and stable QC01, QC02, ... recommendations. Give each recommendation Build, Explore, Defer, or Avoid with one reason.
2. `implementation-plan.md`: ordered shippable milestones naming real files/modules, acceptance criteria, exact fixture values, tests, docs section, runnable example, and main risk. A worker must be able to start milestone one from this plan. Keep future performance machinery conditional on measurement.

Final message: state access status, files read, checks performed versus proposed, deliverable download links, and open questions. If attachments fail, provide the complete reports inline. Codex will collect, read, verify the claims that decide the plan, integrate local dispositions, and open a review PR. At most one follow-up is available.
