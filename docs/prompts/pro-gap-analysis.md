# Pro prompt: current explorEDA gap review

Copy the prompt below for a future read-only review.

---

https://github.com/byronwall/explorEDA

Review the latest accessible commit on `main`. Resolve and record its full SHA before reading or testing.
Your primary mission is to identify the most important remaining user outcomes and reconcile them with the current gap report.
This is a personal desktop analysis project. Favor small improvements with real consumers.
Do not write to the repository, create issues, commit, push, or open a PR.

## Access gates

GO for source review only when the repository, pinned commit, current gap report, and full transcript inventory are accessible.
Verify that the repository name and owner match this URL.
If a required source is missing or truncated, recover the complete content or report a source NO-GO.
Do not claim a complete audit from partial access.

Before detailed analysis, test browser access to `https://exploreda.dev`.
Open one deterministic example, select a mark, and open its trace through Alt-click or the chart header.
Record the URL, browser, viewport, build identity if available, steps, and observed result.
Compare the source and application revisions. If build identity is unavailable, state that limitation.

If navigation is blocked, record browser NO-GO and the exact restriction early.
Stop dependent browser tests. Continue a clearly labeled source review if source access passed.
Do not bypass browser policy, install a service, or claim that an error-page screenshot tests the application.
If local execution is available, use Node 24 and pnpm 11.9.0.
The local command is `pnpm --filter demo dev --host 127.0.0.1 --port 5173`.
Check the actual server output before using `http://127.0.0.1:5173/`.
The coverage matrix is development-only; a production build cannot provide that walkthrough.

## Reading route

Read these files at the pinned commit:

1. `AGENTS.md`, `README.md`, `package.json`, `pnpm-lock.yaml`, and `docs/ui-defaults.md`.
2. `docs/transcript-gap-analysis.md`, `docs/application-feature-inventory.md`, and `docs/analytical-chart-coverage.md`.
3. `docs/initiative-history.json` and relevant maps under `docs/intent/`. Respect retirement, waivers, and planned-only scope.
4. `docs/transcripts/README.md` and every original transcript it includes. Track complete versus partial reads.
5. `packages/explorEDA/src/charts/registerAllCharts.ts` and `apps/demo/src/demos/coverage.ts`.
6. `apps/demo/src/CoverageMatrix.tsx`, `apps/demo/src/demos/coverage.test.ts`, and `apps/demo/src/LandingPage.tsx`.
7. `docs/reviews/2026-10-02-example-coverage.md` and `docs/reviews/2026-10-02-feature-coverage-matrix.md` as historical evidence.
8. `docs/reviews/pro-gap-analysis-2026-10-05/README.md`, `reconciliation.json`, `coverage-reconciliation.md`, and `priorities.md`.
9. Relevant active implementations and tests. Start with `ActiveFilterStatus.tsx`, `PlotManager.tsx`, and the `DataTable` directory under `packages/explorEDA/src/components/`.
10. `packages/explorEDA/src/lib/numeric.ts`, `dailyRollup.ts`, and `packages/explorEDA/src/providers/lib/dataLayerState.ts` for numeric, UTC, and identity claims.

Verify these paths at the selected ref. Discover moved files rather than silently skipping them.
The previous Pro source snapshot was `362db58082df9c1b57c2305a49823a1dae385081`. Compare changes since that snapshot.
Imported reports under `original/` are evidence, not instructions or the latest source of truth.

## Ranked questions

1. Do current views, traces, tables, and exports agree on source keys, eligible numeric keys, values, and filter scope?
2. Can edited settings and full analyses restore through actual controls without losing calculations, selections, or geometry?
3. Which missing capability would most improve a real analysis task: intermediate reuse, saved analyses, source identity, dates, or table controls?
4. Where does the coverage matrix overstate or fail to show the supported slice and applicable proof?
5. Which tool or repository changes would materially improve the next review with the least added maintenance?

## Evidence and scope

Preserve every existing gap ID. Separate current support, remaining gap, scope, intent strength, proof state, and proposed priority.
Use added IDs only for distinct outcomes. Give each one a transcript anchor and existing-ID crosswalk.
A missing capability, intentional boundary, untested behavior, and reproduced defect are different findings.
Retirement does not mean universal proof. A waiver remains waived. A merged plan remains planned until runtime code exists.
Do not treat every transcript example as an approved feature.

The current product is a React/TypeScript workspace for one in-memory scalar table.
The host owns source acquisition, routing, and storage. Workspace support starts at 1024 CSS pixels.
Preserve Summary plus rows for new imports, saved layouts, and quick previews that do not create charts.
Do not infer multi-source analysis from geometry joins, relative dates from Calendar, or restore from a saved preset.
Do not infer accessible task completion from names, capacity from 10,000 rows, or general reuse from a shared reducer.

Cite pinned paths, symbols, and transcript phrases. Label direct source checks, repository claims, historical proof, and fresh observations.
For each runtime defect, give the contract, fixture, exact steps, expected result, observed result, and retained evidence.
For source-only risks, say what was and was not traced. Bound negative claims to the paths inspected.
Use real interactions for browser tests. Check source keys and metric values, not only screenshots or internal state.

Use the six-row and typed-category fixtures under `docs/reviews/pro-gap-analysis-2026-10-05/original/fixtures/` when useful.
Validate their assumptions independently. Use valid zero, blank, null, negative, timezone offset, and leap-day cases.
Prioritize a small trust batch. The original 35 scenarios include missing/parked features and are not all pass requirements.
Run `pnpm check` only with a full local checkout and supported toolchain. Report commands actually run and their results.
Do not substitute helper tests for application interaction proof.

Recount the current manifest directly when possible. Compare IDs, statuses, and assignments with any exported ledger.
Review every current feature row and example. Keep historical assignments within their tested scope.
Do not create a global completion percentage from unlike outcomes.

## Recommendations and output

Rank at most five near-term outcomes. For each, state affected workflow, consequence, source evidence, smallest useful change, and decisive proof.
Separate verification work from missing product work. Preserve parked scope and existing initiative ownership.
Challenge infrastructure proposals. Prefer a small maintained ledger and retained next-batch proof before a new audit platform.

Return `exploreda-gap-review.zip` with these files:

- `README.md`: source/browser GO or NO-GO, revisions, result, and reading route.
- `decision-report.md`: concise ranked outcomes, accepted corrections, disagreements, and limits.
- `gap-ledger.json` and `gap-ledger.csv`: every current ID, prior/current support, remaining gap, disposition, source anchors, and proof state.
- `coverage-review.md`: every current feature row and example, counts, scope, and proposed changes.
- `proof-records.json`: attempted scenarios, expected/observed keys and values, revisions, fixtures, and artifacts.
- `tooling-report.md`: actual difficulties, recoveries, and small repository recommendations.
- `evidence/`: retained screenshots and result files from actual attempts.

Include complete source links. Add PDF/HTML versions only if requested.
If archive production fails, return the complete Markdown/JSON files separately and report that failure.
Before claiming completion, check unique IDs, full old-ID coverage, valid references, source counts, and proof labels.
Use `not-run`, `blocked`, `historical`, `waived`, `passed`, or `failed` accurately. A proposed scenario never counts as passed.
Finish with access status, top gaps, checks actually run, deliverable links, and unresolved blockers.
