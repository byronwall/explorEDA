# Explicit numeric preparation: Design mission

https://github.com/byronwall/explorEDA

Ref: `9d64a021e35d312887b1bc848e307f42b6c3091f` (origin/main, October 26, 2026).
Mode: Design, with an exact parsing and numeric representation contract.

What should explorEDA build so analysts can turn locale-formatted numeric text into usable measurements,
check every changed or rejected value, and save the interpretation for later data loads?
Recommend a coherent feature and staged implementation plan.

Act as a data preparation designer with experience in analytical tools and numeric parsing.
Compare strong tools, state tradeoffs, and reject weak options. Byron wants this capability.
Do not require outside demand or a usability study. DIRECTION.md overrides older demand gates.

## Access check and reading route

Confirm access to this ref or the attached packet. The packet contains complete files from that ref.
If decisive input is missing from both, stop and name the smallest missing input.
Read at minimum:

1. `AGENTS.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, `docs/ui-defaults.md`, and `docs/research/DIRECTION.md`.
2. `docs/intent/research-ideas-100/ideas/R030-locale-numeric-conversion.md`.
3. `packages/explorEDA/src/lib/valueParsing.ts`, `fieldSettings.ts`, their tests, and field type detection.
4. `packages/explorEDA/src/components/SummaryTable/components/FieldInspector.tsx` and its tests.
5. `packages/explorEDA/src/providers/DataLayerProvider.tsx`, field settings provider tests,
   saved validation, Dashboard text compiler/exporter/settings, and saved types supplied.
6. Project evaluation, folder writeback, worker protocol, and notebook files supplied.
7. Fields/load-data/calculated-fields docs, live examples, and demo example registration supplied.

## Current facts and boundaries

Keep this existing React and TypeScript library and demo in React. Use pnpm.
`parseNumber` rejects blanks, booleans, and radix prefixes, but otherwise uses JavaScript Number.
`isExactNumberText` is stricter: leading-zero identifiers and unsafe plain integers stay text during inference.
Explicit numeric conversion uses `parseNumber`, so inference and deliberate conversion have different contracts.
Field settings include type, date preset, null tokens, display format, precision, unit, and currency.
No numeric input convention is saved. Display percent uses Intl formatting; it does not parse percent text.
The provider preserves rawData and applies conversion before calculations and runtime profiles.
The conversion preview counts valid, missing, and failed rows. It uses raw rows rather than chart filters.
Check these claims against the packet before choosing the design.

Open research PRs for reusable category mappings (#523), wide-to-long preparation (#518),
ordered differences (#525), and join keys (#527) are unbuilt proposals. Do not require them.
Design the smallest coherent ownership boundary on current code. A prepared workspace value is not
automatically a project source value or a relationship endpoint; check those actual paths.

## Ranked questions

1. What feature should we build? Compare explicit input presets, a declarative grammar,
   source-level preparation, workspace field conversion, and upstream preparation.
   Compare current primary documentation for tools such as Power Query, readr, DuckDB, and OpenRefine.
   Choose the initial user flow, settings ownership, raw-value preservation, and later-data behavior.
   Give a useful first milestone; avoid an answer limited to documentation or keeping current behavior.
2. What exact language does each supported input convention accept? Decide decimal and grouping marks,
   grouping widths, regular/NBSP/narrow-NBSP spaces, signs, accounting parentheses, exponents,
   leading zeros, ASCII versus other digits, currency symbols, trailing text, and mixed conventions.
   Address `1,234`, `1.234`, `1,234.50`, `1.234,50`, `12,34,567.89`, `1 234,50`,
   `1\u00a0234,50`, `1\u202f234,50`, `(1,234.50)`, `12%`, `0012`, `9007199254740993`,
   `1e309`, `1e-400`, NaN, Infinity, signed zero, native numbers, booleans, blanks, and configured null tokens.
   Distinguish percent input from display percent and ordinary measurements from identifier conversion.
   State intentional rounding, overflow/underflow policy, and exact expected outputs or rejection reasons.
   Do not silently detect a convention or strip arbitrary punctuation.
3. What does the analyst see and do? Design compact controls and before/after inspection,
   counts and representative cases beyond the first eight rows, ambiguity between successful interpretations,
   exact failing records, draft versus Apply, Reset/Cancel, keyboard access, and narrow screens.
   Separate raw text, parsed number, and display formatting. Explain what happens to filters,
   selections, calculations, charts, and exports when Apply changes interpretation.
4. What changes in the API, saved model, evaluation, and lifecycle? Name code paths for preview/Apply parity,
   calculations, type profiles, filters, saved JSON, Dashboard text, undo, host echoes, folder save/reopen,
   notebook views, source refresh, and worker evaluation where relevant. Identify the minimum boundary
   the first milestone can deliver completely. Do not invent a second parser in chart consumers.
5. What is the implementation plan? Give independently shippable milestones with concrete files,
   exact test tables, interaction acceptance checks, docs page and runnable example in each feature milestone,
   and the main risk. Include a discriminating fixture with stable IDs, typed numeric and textual values,
   ambiguous inputs, percent scale, failures, missing values, and repeated refreshes.
   Identify which decisions require a prototype and which can be implemented directly.

## Evidence and scope

Cite repository paths and symbols for source claims. Cite current primary sources with URLs for external claims.
Keep facts, inferences, and proposals distinct. State missing or conflicting evidence.
Favor a strong capability with staged delivery. Avoid generic platforms, inferred locales,
automatic unit or currency exchange, an internationalization rewrite, framework migration, and paid services.
No outside demand gate. No mixed-version compatibility layer without a demonstrated requirement.
Keep automatic inference conservative; explicit user choices can have a different documented contract.
Codex will review the result against current code and make all repository changes.

## Deliverables

Attach two Markdown files, with links in the final response. One ZIP containing them is welcome.
Do not save files to Library as a prerequisite for an ordinary download.

1. `numeric-preparation-report.md`: start with the decision, then answer each ranked question with sources.
   Give stable recommendation IDs and Build, Explore, Defer, or Avoid dispositions with one-line reasons.
2. `implementation-plan.md`: milestones in order, files/modules, exact expected fixtures and values,
   docs page, runnable example, acceptance checks, and main risk for each milestone.

Finish with access status, files read, what was checked versus proposed, download links, and open questions.
If attachments are unavailable, include the complete content inline. No receipts or hash manifests are needed.
