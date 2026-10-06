# Validation record

Review date: 2026-10-05. Source revision: `362db58082df9c1b57c2305a49823a1dae385081`.
The source matches Pro's pinned revision. This change affects documentation and imported review artifacts only.

## Passed checks

- The source ZIP contains 58 files. Every extracted file matches its ZIP entry byte for byte.
- Every entry in `original/SHA256SUMS.txt` matches its extracted file.
- The current gap report and reconciliation ledger each contain all 92 original IDs exactly once.
- The unchanged prior report retains R01–R19, the historical audit limits, and the transcript ledger.
- All 52 feature IDs and support states match the actual TypeScript declarations.
- All 19 example IDs and all 182 feature/example assignments match those declarations.
- There are 37 historical reviewed assignments. No new assignment is promoted to reviewed.
- The coverage reconciliation comments on all 52 features, all 19 examples, and all 25 proposed outcome dimensions.
- New review documents use valid local file targets. Source reference labels resolve to local files or pinned source URLs.

Manifest extraction used the TypeScript parser already installed in the saved project checkout.
It extracted only the two literal declaration arrays from this worktree's `coverage.ts`.
It did not run the application or Pro's imported scripts.
The [snapshot](manifest-snapshot.json) retains actual labels and evidence notes omitted from Pro's condensed exports.

## Source checks

| Finding | Source checked | Result |
| --- | --- | --- |
| Registry breadth | `packages/explorEDA/src/charts/registerAllCharts.ts` | 18 active registrations. |
| Header distributions | `DataTable.tsx` and `DataTable/definition.ts` | Always present in Rows; on by default in table charts; table setting can disable them. |
| Table controls | `DataTableHeader.tsx` and `DataTableContextMenu.tsx` | Drag wiring, resize, Reset width, and Clear sort exist. Header sorting remains a two-state gesture. |
| Filter owner | `ActiveFilterStatus.tsx` and `PlotManager.tsx` | Navigation and highlight callbacks are wired in Charts and Rows. |
| Search scope | `DataTable/filteredRows.ts` | Searches resolved row fields except `__ID`, including hidden source fields. |
| Row identity | `providers/lib/dataLayerState.ts` | `__ID` is assigned from the row index. |
| Review model | `coverage.ts` and `CoverageMatrix.tsx` | Any historical reviewed assignment qualifies a feature. Stored report/date/evidence is not presented in detail. |
| Waivers | `docs/analytical-chart-coverage.md` | Cross-view comparisons and browser restores were waived at retirement. |

## Checks not completed

`pnpm --config.verify-deps-before-run=false check` failed before application validation.
The UI checker could not import TypeScript because this worktree has no complete dependency installation.
The shell used Node `22.21.1`, not the required release-check Node 24.
An earlier `pnpm exec node` triggered automatic dependency installation, which hit DNS `ENOTFOUND` for the registry.
That attempt was stopped. No dependency manifest or lockfile changed.
These are environment/setup failures, not failed product assertions.

No new application browser, screen-reader, performance, CSV download, or restore test ran in this reconciliation.
Pro also completed zero application browser tests. Its screenshots show blocked navigation only.
The browser ZIP download succeeded; a waiting download-event call timed out, but the downloaded file and its contents were verified.

The repository build and manifest are unchanged. No changeset is needed for this documentation-only work.
No PR, push, deployment, or initiative lifecycle change was made.
