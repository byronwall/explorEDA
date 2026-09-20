# Transcript trust repair pass

Date: 2026-09-18. Based on the [gap analysis](transcript-gap-analysis.md).

## Approved scope

The product review selected five concerns: calculations, derived values, filter scope/reset, typed categories, and comparable facets.

| Concern                 | Result                                                                                                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Calculation correctness | Arithmetic, comparisons, logic, conditional branches, and UTC date functions share one evaluator. Validation checks source rows. Valid results remain available beside inspectable row errors. |
| Derived values          | Tables, search, sorting, filters, summaries, and CSV use calculated values. Formula edits retain thresholds and rebuild filters. Invalid edits preserve the old definition.                    |
| Scope and reset         | Counts identify chart or table scope. Clear all filters clears chart filters, dashboard searches, and local Rows filters/search.                                                               |
| Category identity       | Category actions retain source types. Number `1`, text `"1"`, booleans, and missing values remain distinct where applicable. Facet keys preserve both values and types.                        |
| Comparable facets       | The five supported 2D families use full-source domains and category order. The facet header states that selections apply across all facets.                                                    |

Field insertion uses bracketed quoted references, such as `["Order Date"]`. This supports spaces, punctuation, and reserved names. Quoted text without brackets remains a literal.

Save/reopen was not added to the five. The recorded future preference is exact recovery of imported rows, analysis, filters, and searches. This pass repairs the existing package restore order only.

## Representative sample

Open `?example=shop-10000` in the demo. It contains **10,000 rows, 16 fields, and 15 panels**. One panel contains four regional line facets. The fixed-seed synthetic data includes dates, booleans, categories, missing values, and outliers.

- [CSV fixture](../apps/demo/public/datasets/shop-10000.csv)
- [Generation instructions](../apps/demo/public/datasets/README.md#shop-operations-10000-rows)
- [Dashboard settings](../apps/demo/src/demos/dashboardSettings.ts)

## Verification

These results describe the 2026-09-18 repair pass. See the [fresh reconciliation](transcript-gap-analysis.md) for later editor work, review fixes, and current checks.

`pnpm check` passes package/demo builds, type checks, 156 package tests, and 10 demo tests.

Focused checks cover formula edits under a retained threshold, restore ordering, partial failures, invalid replacements, typed category selections, and sorted CSV values. CSV headers and cells with commas and quotes have checked escaping. Date checks also pass under `TZ=America/Indiana/Indianapolis`.

Independent browser verification used a 1280×720 desktop viewport. The stable production preview emitted no console warnings or errors. The first development-server run reported HMR reload messages during rebuilds.

| Browser workflow                     | Observed result                                                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Open the sample                      | All 10,000 rows loaded. The first development run became interactive in about 2.5 seconds.            |
| Select Home; reset                   | 3,334 rows selected; reset restored 10,000.                                                           |
| Add `Revenue * 2`                    | Validation passed for all rows. Source 63.8 produced 127.6.                                           |
| Filter the derived field at ≥1000    | Numeric controls selected 2,211 Rows.                                                                 |
| Edit the formula to `Revenue * 3`    | The ≥1000 threshold remained active and selected 3,574 Rows.                                          |
| Add `10 / Discount`                  | 2,595 failed rows; preview showed missing-value and division-by-zero reasons alongside valid results. |
| Search Rows for Desk Lamp; reset     | 1,667 rows matched; reset cleared the search and restored 10,000.                                     |
| Compare regional facets; brush North | Axes matched. The shared Order range selected 2,851 rows across facets.                               |
| Validate comparison and conditional  | `Revenue > 100` and `if Revenue > 100 then 1 else 0` passed.                                          |

A separate CSV scan confirmed the 2,211, 3,574, and 2,595 counts above.

The browser pass found two defects during implementation: text controls on calculated numeric fields, and unparseable spaced field insertion. Both received fixes and passed browser re-verification. `extractDateComponent(["Order Date"], "year")` validated all 10,000 rows. Preview rows 0–9 returned 2024. A quoted `"Order Date"` literal remained text. Final console logs were empty.

Browser screenshots and the detailed session report are in `/tmp/exploreda-browser-proof/`. The UI detector reported no findings.

## Limits

The browser download event did not arrive, so browser CSV file contents remain unverified. The CSV construction and ordered values have automated checks. A mixed-type JSON import was not completed in the browser; rendered category actions and typed facet grouping have tests.

This sample is not a general performance guarantee. No device sweep, heap profile, long-session test, or screen-reader audit was run. Facet field-change combinations have source review, not a complete browser matrix.

Later approved source work addresses line ordering, observed box whiskers, table width retention, pivot cell errors, and pivot contributor inspection. Browser evidence for those changes is tracked in the [gap audit's single evidence paragraph](transcript-gap-analysis.md#audit-limits). Beeswarm geometry, 3D behavior, durable host/server persistence, and reusable transform tables remain separate work.
