# Exact decimal measures and rounding — Methods

https://github.com/byronwall/explorEDA

Baseline: `d3920a285f3755a8324998775deb131747e959f5` (refreshed `origin/main`).
Branch: `codex/decimal-measures-methods-2026-11-01`.
Mode: Methods. Date: November 1, 2026.

## Mission

What exact-decimal measure capability should explorEDA build for ledger reconciliation, and which representation and rounding rules make it correct?

Design a usable path from decimal source text through row calculations, grouped measures, exact comparisons, record tracing, and saved notebook results.
An analyst must be able to reconcile invoice lines, discounts, tax, and totals under a declared rounding rule.
Return a buildable plan with exact expected results, rather than an audit of floating-point behavior.

Act as a numerical software designer who has shipped browser analytics and decimal financial calculations.
Compare strong alternatives candidly. Byron is the demand; no outside customer, failed lesson, or usability study is required.
Do not end at “keep binary floating point” or “prepare all exact totals elsewhere.”
Ordinary approximate measurements can retain their present behavior. Choose a bounded, explicit decimal capability that adds useful work inside explorEDA.

## Access check

Confirm you can read the complete attached source packet, including its baseline and file boundaries.
It supplies complete files from the baseline plus two clearly marked prior research summaries from separate refs.
If a decisive file is unavailable from both packet and repository, stop and name the smallest missing input.
Do not claim repository access you lack. Related research is a proposal, never an implemented dependency.

## Present facts and reading route

Read at minimum these packet files, then trace their connections:

1. `AGENTS.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, `docs/ui-defaults.md`, `docs/research/DIRECTION.md`, and the root and package README files.
2. `docs/intent/research-ideas-100/ideas/R037-decimal-precision-contract.md` and `docs/intent/reusable-analysis-metrics/intent-brief.md`.
3. `packages/explorEDA/src/lib/valueParsing.ts`, `lib/fieldSettings.ts`, `types/ChartTypes.ts`, `types/AnalysisProject.ts`, and their supplied tests.
4. `lib/calculations/engine/Calculator.ts`, `functions/registry.ts`, `parser/semantics.ts`, `types.ts`, the calculation manager, and the supplied engine tests.
5. `lib/aggregates.ts`, `components/charts/MetricCard/metricCardPlan.ts`, `measureInputs.ts`, and Pivot Table's reducer.
6. `lib/analysis/evaluateProject.ts`, `projectFile.ts`, worker protocol and evaluation hook, project CSV reader, table reader and delimited/typed-column readers.
7. `utils/saveDataUtils.ts`, `types/SavedDataStructure.ts`, `lib/project/analysisText.ts`, `lib/project/writeFolder.ts`, notebook compiler/reader/findings, and the supplied docs catalogue/examples files.
8. Prior numeric-preparation and quantity-calculation research summaries in the final packet section. Their earlier deferrals do not decide this mission.

Locally checked facts: `datum` and `AnalysisScalar` have scalar unions without decimal objects or BigInt.
The calculator uses JavaScript numeric operators and rejects non-finite results.
Shared grouped reduction sums numbers directly; entity-aware summaries select one measure per agreeing entity.
Field precision and currency are display settings, not an arithmetic contract.
The folder CSV reader calls `Number(text)` before later analysis. A text value already converted to a number can lose original digits.
The project serializer has special-value encoding but no decimal or BigInt contract.
These observations identify boundaries; you must inspect them before choosing the design.

## Ranked questions

### 1. Choose the representation and arithmetic contract

Compare binary64 with explicit tolerances and compensated sums, declared-scale integers, a coefficient-plus-scale decimal representation, rational intermediates, and browser decimal libraries.
Distinguish exact input, exact operations, correctly rounded operations, and approximate plotting.
Use primary sources for ECMAScript numeric/JSON behavior, decimal algorithms, current decimal libraries, and systems such as DuckDB or PostgreSQL.
Choose the smallest representation that supports useful row arithmetic AND grouped reconciliation inside explorEDA.
Decide whether it is an explicit measure mode, typed derived field, query operation, or another coherent boundary.
If a new scalar type is necessary, justify every boundary it crosses. If strings or scaled integers suffice, explain how they retain semantic type and avoid accidental numeric coercion.

Specify accepted input grammar and scale preservation, canonical equality, ordering, hash keys, signed zero, exponent notation, leading zeros, very large coefficients, missing/invalid input, and limits.
Decide how a native JavaScript number enters this path: accepting its shortest decimal spelling cannot recover the original text.
Do not silently reinterpret existing numeric values as original exact decimal source values.

### 2. Set rounding and calculation rules that reconcile

Define addition, subtraction, multiplication, division, comparisons, sum, average, min/max, and percent/rate calculations.
Define output scale, tie handling for positive AND negative values, overflow/precision limits, divide by zero, and non-terminating division.
Compare round-each-line with round-at-total; neither may be hidden inside display formatting.
Decide whether allocation of a rounded total to lines belongs in the first capability or later; if included, define deterministic remainder handling and stable ties.
Separate arithmetic scale, business rounding, and display precision. Name any operation deliberately outside the exact path.
Explain mixed exact/approximate operands and entity-grain equality without broad automatic coercion.

### 3. Prove the method with portable exact cases

Supply machine-readable fixtures with decimal strings and exact expected outputs, error cases, rounding rules, memberships, and counts.
Include repeated `0.1`, `0.1 + 0.2`, cancellation of large-plus-small values, values beyond safe integers, mixed scales, `1.005`, `2.675`, positive/negative halfway cases, `1/3`, `1/8`, tax and discount ordering, refunds, zero, blanks, invalid text, and entity duplicates/conflicts.
Include line-rounded and total-rounded examples whose totals differ, plus one grouped/subtotal and filtered-population reconciliation.
Use independent exact rational or integer reasoning to derive outputs. Do not label a value exact because one decimal library printed it.
Explain sum/average regrouping, order sensitivity, and scale-sensitive versus numeric equality.
Include an example where the source reader already lost digits and the correct response refuses to invent them.
If you provide verifier code, it is a companion for inspection; local agents will not execute downloaded programs.

### 4. Close the analytical and persistence paths

Describe the analyst's complete flow: declare or create an exact amount, preview inputs and exclusions, calculate lines, summarize and reconcile, inspect original contributors, save, reopen, and refresh.
Define exact filters and sorting separately from numeric chart projection. Approximate coordinates must not decide exact membership or erase exact trace values.
Choose useful initial surfaces: Rows, grouped query results, metric cards, pivot tables, charts, notebook values. State each milestone's support honestly.
Every milestone must form a complete usable loop. Include all adapters needed by its promise, not just the pure decimal helper.
Trace calculation manager/provider, query evaluator, workers, serialization/validation, Dashboard text, folder reads/writes, notebook bindings/findings, host callbacks, CSV, and restore.
Do not propose an all-chart migration merely because some surfaces need a conversion boundary.
Preserve source text and decimal interpretation through save/reopen and refresh. Reject unsupported exports explicitly before losing information.

### 5. Recommend implementation stages and tradeoffs

Name files/modules, public APIs and saved shapes, dependency/license/bundle implications, exact acceptance tests, likely performance costs, and risks.
Use React and TypeScript in this existing library and demo, with pnpm. No framework conversion.
Each user-visible stage names its docs page/section AND runnable example in that same stage.
Plan meaningful tests; do not add a generic validation, migration, transaction, or plugin framework.
The owner is one personal developer, with one server/client/version. No legacy compatibility machinery without concrete need.
Do not make unbuilt numeric-preparation, quantity, reusable-output, or refresh plans mandatory prerequisites.
Give a narrow integration seam where those proposals may later meet.

## Evidence and scope

Cite repository paths and symbols for current behavior. Cite current primary sources with direct URLs for decisive external claims.
Keep facts, deductions, product policies, and proposals distinct. Mark unverified benchmark or library claims.
This is exact decimal analytics and reconciliation, not bookkeeping software, tax compliance advice, currency exchange, or a general arbitrary-precision CAS.
Do not audit unrelated robustness or require outside demand. Numerical findings that require fixes belong beside the capability plan.
Codex will check decisive claims and make all repository changes. Do not commit, push, or deploy.

## Deliverables

Attach and link the complete files in the final response:

1. `report.md`: decision first, ranked answers, comparison of representations, numerical contract, rejected alternatives, primary sources, and uncertainties.
2. `implementation-plan.md`: shippable milestones with modules, APIs, exact tests, docs section, runnable example, and main risk.
3. `recommendations.md`: stable IDs and Build / Explore / Defer / Avoid dispositions with one-line reasons.
4. `decimal-fixtures.json`: exact input/output/error and reconciliation fixtures under the chosen written rules.
5. Any diagram, code companion, or data needed to understand or apply the result. A ZIP is optional; do not create source-packet receipts or hash manifests.

End with access status, files read, what you checked versus proposed, download links, and open questions.
