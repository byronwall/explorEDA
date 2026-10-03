# Feature coverage matrix review — 2026-10-02

**Verdict:** Pass. The matrix explains product support, example evidence, and review status without page overflow at all three checked widths.

**Blockers:** None.

**Scope:** The Needs attention, All features, and Example usage views on the assigned demo worktree, served at `http://localhost:5187`. The full example matrix was also checked when expanded. Each view was checked after the final manifest and copy changes.

| View | 1280 × 720 | 783 × 720 | 390 × 844 |
| --- | --- | --- | --- |
| Needs attention | 1280 / pass | 783 / pass | 390 / pass |
| All features | 1280 / pass | 783 / pass | 390 / pass |
| Example usage | 1280 / pass | 783 / pass | 390 / pass |
| Expanded full matrix | 1280 / pass | 783 / pass | 390 / pass |

At each width, the document and body matched the viewport width. The expanded matrix is 960 pixels wide; its scroll region is 709 pixels wide at 783 and 316 pixels wide at 390. No page-level overflow appeared.

Keyboard proof: focus the native full-matrix disclosure and press Enter to open it. At 783 and 390, focus the scroll region and press ArrowRight; the region scrolls while the page stays in place. Tab to a far-right Lorenz assignment link and press Enter; the page opens `/?example=lorenz-3d`. A feature disclosure also opens and closes with Enter, and its product-activity link opens `/?example=product-activity`.

The Lorenz example, catalog empty-search flow, and calculation validation flow were also checked at 783 and 390 pixels. Each retained viewport-width document and body. These widths are diagnostic checks; the existing product guide sets 1024 pixels as the supported workspace minimum.

The page now states: “Feature review summarizes reviewed example evidence. Example check belongs to one feature in one example.” This matches the data model: per-example feature assignments store `shown` or `reviewed`; feature review summarizes reviewed assignments.

The matrix uses native disclosures. Details remain closed until opened. The labels distinguish product support, example evidence, feature review summaries, and per-assignment example checks.

Screenshots: [1280 px](../../tmp/coverage-matrix-1280.png), [783 px](../../tmp/coverage-matrix-783.png), [390 px](../../tmp/coverage-matrix-390.png), and [expanded matrix at 390 px](../../tmp/coverage-matrix-advanced-390.png).

**Verification:** `pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/CoverageMatrix.test.tsx` passed. The matrix and manifest checks cover feature IDs, chart registry coverage, current review wording, evidence rows, disclosure details, and example links.
