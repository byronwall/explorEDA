# Calculation inspection and editing

Updated: 2026-09-19.

## Product decisions

Formula edits have a live preview and an explicit Apply action. Dependency inspection uses a readable tree, with downstream calculations and affected views. These choices came from the product questions for this pass.

The interface follows three transcript themes:

- Keep controls close to their result. [Saved views and formatting](transcripts/2026-06-29-saved-table-views-and-formatting.txt) describes editing beside the displayed value.
- Trace transformations back to source values. [Visualization traceability](transcripts/2026-08-02-visualization-traceability-and-dataflow.txt) asks to inspect each step and its inputs.
- Reuse calculated outputs. The [calculation discussion](../packages/explorEDA/docs/archive/prd/06-calcs-engine/transcript.md) describes using one result in another calculation.

This pass applies those ideas to scalar calculated fields. It does not add grouped transforms or a general dataflow graph.

## Workflow

An ƒx marker identifies calculated fields in chart headers, table headers, Summary, and field selectors. Hover or click to inspect a formula. Table values also open the inspector for that specific row.

Choose **Inspect chain & edit** to open the editor without changing workspace modes. The editor shows:

- A multiline formula and live validation against all loaded rows.
- Input values, saved results, draft results, and row errors.
- A selectable dependency tree with values for the selected row.
- Downstream calculations and affected views.
- Searchable source/derived fields and function insertion at the cursor.

Apply changes updates dependent calculations and views. Existing filters stay active. Ctrl+Enter or Command+Enter applies a valid draft. Invalid formulas cannot be applied.

Drafts survive changing chain steps and closing the editor during the current workspace session. **Discard draft** returns to the saved formula. Drafts are not included in workspace serialization. Reloading or replacing the dataset clears them.

## Persistence boundary

Runtime calculations use parsed expression trees. The persistence boundary stores formula text:

```ts
{
  resultColumnName: "Net sales",
  expression: '["Gross sales"] - ["Discount amount"]',
}
```

The package parses and validates that string during restore. It does not persist an AST and has no compatibility layer for an older AST-shaped calculation format. The primary `SavedDataStructure` restores formulas and Rows settings against current host data, and rejects nonfinite filter values. The secondary `SavedAnalysisStructure` also includes raw rows, preserves undefined and nonfinite values with tagged special values, and is parsed with `parseSavedAnalysis` when rows must travel with the analysis. Durable storage remains the host's responsibility.

## Example

Open `?example=calculated-orders` in the demo. It uses 10,000 synthetic shop orders, 16 source fields, 14 calculated fields, and 14 panels.

The main chain is Gross sales → Discount amount → Net sales → Contribution → Contribution rate. Other fields demonstrate missing-value guards, minimum/maximum clamps, sums, averages, comparisons, logic, conditional labels, UTC month formatting, and quarter extraction.

Change the Discount rate cap from 25% to 10%. Inspect the draft results, then Apply. Net sales, contribution, order bands, target gaps, and their views use the revised values.

Service score and Risk points are illustrative business rules. Their formulas show the exact checks and weights. Target gap measures percentage points below a 45% contribution target. The example has 4,145 orders below that target.

## Verification

The combined checks pass 174 package tests, 11 demo tests, builds, type checks, and the lean bundle check. Browser status is recorded in the [gap audit's single evidence paragraph](transcript-gap-analysis.md#audit-limits).

The editor integration test checks in-place inspection, chain navigation, preserved drafts, explicit Apply, dependent updates, and rejection of invalid changes. The full workspace checks include the previous calculation, filter, category, export, and restore tests.

Earlier browser checks cover both 1280×800 and 1024×768 desktop layouts. They cover hover cards, chain navigation, row inspection, field/function insertion, draft recovery, Apply, and focus return. They do not certify the current chart, restore, or pivot implementation.

Changing the discount cap to 10% changes row 4 net sales from 625.504 to 703.692 after Apply. The browser shows the revised inputs and result.

Browser evidence is saved under `/tmp/exploreda-calculation-ux/`. Mobile, screen readers, complete keyboard operation, and full-table scroll performance remain untested.
