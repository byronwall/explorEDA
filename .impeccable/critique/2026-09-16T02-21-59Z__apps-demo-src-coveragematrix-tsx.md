---
target: coverage page IA and usability
total_score: 18
max_score: 32
na_heuristics: 5,9
p0_count: 0
p1_count: 4
timestamp: 2026-09-16T02-21-59Z
slug: apps-demo-src-coveragematrix-tsx
---
# Coverage page IA and usability critique

Method: dual-agent (A: `/root/ia_assessment_a` · B: `/root/ia_assessment_b`)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 3 | Totals are visible, but current work is not the dominant view. |
| 2 | Match system / real world | 3 | Terms are plain, but feature review and example review blur together. |
| 3 | User control and freedom | 2 | Users can switch views, but cannot focus on gaps or unreviewed items. |
| 4 | Consistency and standards | 3 | Table and status patterns are consistent; similar symbols carry different meanings. |
| 5 | Error prevention | n/a | This is a read-only surface. |
| 6 | Recognition rather than recall | 3 | Sticky labels help, but wide scrolling still requires memory. |
| 7 | Flexibility and efficiency | 1 | No gap-first filter, search, sort, or compact work queue exists. |
| 8 | Aesthetic and minimalist design | 1 | Repetition and negative cells bury the useful signals. |
| 9 | Error recovery | n/a | No error-producing task appears here. |
| 10 | Help and documentation | 2 | The legend exists, but the review contract and state relationships remain unclear. |
| **Total** |  | **18/32** | **Acceptable structure; poor information retrieval.** |

## Design Specificity Verdict

The content is specific to explorEDA, but the composition is a generic admin inventory. The product-specific opportunity is an exception-first coverage view: gaps, missing proof, and unfinished reviews should define the page. The current layout treats every record as equally important.

The deterministic detector scanned `CoverageMatrix.tsx`, `coverage.ts`, and `LandingPage.tsx`. It found one `border-accent-on-rounded` warning on the loading spinner in `LandingPage.tsx`. That is a false positive because the element is an intentional circular spinner, not a rounded card. The detector found no matrix-specific issues. Browser evidence found the important problems that static rules missed.

No visual overlay was created. The browser surface did not expose mutable script injection. Screenshots, DOM snapshots, geometry, computed styles, and controlled scrolling supplied the visual evidence.

## Overall Impression

The two-view split is directionally correct. The page still answers “What exists?” before “What needs attention?” The largest opportunity is to turn the default view into a compact work queue, then disclose the full catalog and matrix only when a user asks for them.

## What's Working

- The page uses semantic tables, clear headings, symbols plus text, and direct evidence links.
- Component review and example usage are now distinct concepts.
- The example matrix keeps row and column context with working sticky headers.

## Priority Issues

### [P1] The default is an inventory instead of a work queue

**Why it matters:** The page announces 16 open gaps, then requires a 4,876-pixel scan across all 38 features.

**Fix:** Default to “Needs attention.” Show known gaps, unreviewed support, and missing examples. Put the complete catalog behind “All features.”

**Suggested command:** `/impeccable distill`

### [P1] Repetition consumes most of the component view

**Why it matters:** Eleven tables repeat headers and empty phrases such as “None recorded” and “None declared.” The useful facts receive the same weight as placeholders.

**Fix:** Use one grouped table. Keep family divider rows. Combine implementation and review into one compact status. Hide descriptions and long notes until expansion. Use a dash for empty values.

**Suggested command:** `/impeccable layout`

### [P1] The example matrix gives absence the same weight as evidence

**Why it matters:** The matrix contains 392 “Not used” cells and only 26 “Shown” cells. About 94% of the visible status content is negative.

**Fix:** Default to a sparse positive-coverage list. Group examples under each feature, or features under each example. Retain the complete matrix only as an advanced comparison view. Leave negative cells blank.

**Suggested command:** `/impeccable distill`

### [P1] Negative matrix cells create a keyboard trap

**Why it matters:** The matrix has 433 focus targets. Most are links for “Not used,” which do not provide useful evidence.

**Fix:** Link only positive coverage. Make negative cells empty and noninteractive. Add one feature or example focus control if the full matrix remains.

**Suggested command:** `/impeccable audit`

### [P2] Review semantics are unclear

**Why it matters:** “Reviewed” refers both to a feature and to an example-feature pairing. Green checks also represent support. Users cannot infer the contract.

**Fix:** Use distinct terms: “Implemented,” “Feature reviewed,” and “Example checked.” Define them in one sentence. Use distinct symbols.

**Suggested command:** `/impeccable clarify`

## Cognitive Load

Seven of eight checks fail. Grouping is the only clear pass. The interface lacks a single focus, compact chunks, dominant hierarchy, progressive disclosure, and a low-memory comparison path. The full matrix exposes 418 status cells and 433 focus targets.

## Persona Red Flags

**Alex, power user:** Alex sees the gap total but cannot filter to gaps. Finding the next task requires scanning the whole page.

**Sam, keyboard or screen-reader user:** Semantic markup is strong, but Sam must traverse hundreds of low-value “Not used” links.

**Jordan, first-time user:** Jordan sees “0 of 38 reviewed” beside many green support checks without an explanation of the difference or the next action.

## Minor Observations

- “Feature coverage” and “Component and feature review” partially repeat each other.
- “Scroll inside the table” documents a layout cost instead of reducing it.
- Long example names create uneven headers.
- On a 1,920-pixel viewport, the matrix still hides about 202 pixels while leaving 320 pixels of outer margin.
- At 390 pixels, the sticky feature column consumes almost the entire matrix viewport.

## Questions to Consider

- Is this page primarily a catalog or a queue of work?
- If every “Not used” cell disappeared, would any decision become harder?
- Should the first screen show 38 features or the 16 gaps?
- Would grouping by status serve review work better than grouping by feature family?

## Recommended Actions

1. **`/impeccable distill`:** Make “Needs attention” the default and remove repeated empty content.
2. **`/impeccable layout`:** Replace family tables with one compact grouped list and progressive row details.
3. **`/impeccable clarify`:** Separate implementation, feature review, and example-check terms.
4. **`/impeccable audit`:** Remove focus from negative cells and recheck keyboard traversal.
5. **`/impeccable polish`:** Finish density, sticky behavior, and wide-screen use after the IA holds.
