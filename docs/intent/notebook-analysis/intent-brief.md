---
title: "Notebook analysis with synchronized definitions"
slug: "notebook-analysis"
phase: intent
status: current
last_updated: "2026-10-10"
---

# Notebook analysis with synchronized definitions

## My read

Make an analysis readable as a notebook, with explanatory text, calculation blocks, and graphics interleaved in a deliberate order. The reader should be able to follow the question, the calculation, and its result as one continuous analysis. Byron's reference is an experience that feels closer to Observable than a page organized only as a dashboard grid.

Use explorEDA's dashboard language to define queries, calculations, and the visuals they produce. Keep the resulting graphs editable through the application's controls. When someone changes a graph, save the corresponding change back into the text that defines its block. Editing that text must also update the result. These are two ways to work on the same analysis.

The notebook should be another coherent view into explorEDA's existing capabilities. Data, calculations, chart behavior, and saved work should retain their meaning when presented this way. The likely author is someone investigating data and explaining their reasoning; the first audience and task remain open.

This request establishes the direction. It leaves the first release size, execution rules, and supported edits open. “Notebook” describes the desired experience here; it does not yet select a general programming runtime.

## What matters most

- Put explanation beside the calculation and result it describes.
- Make graphical edits persist in the defining text, without a separate manual export step.
- Keep notebook behavior consistent with the rest of the application.
- Preserve the meaning of the analysis through text edits, graphical edits, and reopening saved work.

## The intended experience

An author writes a question, adds a block that calculates profit and plots it against revenue, then explains the result below. They change a chart field or setting through the graph's controls. The matching block reflects that change. They edit the calculation text and see the updated result in the same sequence. Reopening the analysis restores both its explanation and its editable definitions.

This is an illustrative flow. Profit, revenue, and this chart choice are examples, not required initial content. The timing of execution remains undecided.

## Boundaries

Use the existing dashboard language as the starting point. Do not assume it already expresses every query or result the notebook will need.

Observable is an experience reference, not a requirement to copy its syntax, runtime, hosting, or collaboration model. Arbitrary JavaScript, external kernels, and remote execution are not established requirements.

The notebook adds a way to work with the application. Replacing dashboards, adding new chart families, and building a general query engine are outside the confirmed intent. Live values inside prose and reusable intermediate tables remain related possibilities with separate intent documents.

## What seems settled

The output interleaves text and graphics. Definitions use the dashboard language. Graphical edits write back to those definitions. The notebook belongs within the application's existing analysis model.

The document format, block syntax, execution controls, and exact relationship to saved dashboard views remain unselected. Capturing this intent does not start implementation.

## Current reality that matters

[Dashboard text](../../../packages/explorEDA/README.md#dashboard-text) already supports calculations, chart declarations, chart-local filters, and multiple saved views. It compiles complete dashboard settings and exports settings back to text. That provides a starting point, but does not establish continuous synchronization with authored notebook blocks.

The existing [Markdown panel](../../application-feature-inventory.md#markdown--explanation-panel) saves rich-text content. It is not an execution system. [Data-bound narrative](../data-bound-narrative/intent-brief.md) concerns values inside explanations. [Reusable analysis outputs](../reusable-analysis-outputs/intent-brief.md) concerns feeding one result into another view. Neither capability is automatically required by this request.

## Ten questions to define scope

1. **First task:** Who will author and read the first notebook, and what real analysis should they complete?
2. **First release:** What is the smallest useful version: prose, definition blocks, and one chart, or tables and summary values too?
3. **Query scope:** Are current dashboard declarations enough initially, or must blocks produce named results that later blocks can use?
4. **Execution:** Should changes run automatically, require running one block, or require running the whole notebook?
5. **Shared state:** Should calculations and interactive filters affect the whole notebook, only later blocks, or explicitly linked blocks?
6. **Graphical edits:** Which edits must write back first: fields, chart type, aggregation, filters, axis settings, or visual styling?
7. **Text preservation:** Must graph edits preserve comments, formatting, and declaration order, or is regenerated equivalent text acceptable?
8. **View relationship:** Is the notebook another presentation of the same saved dashboard, or a separate document that reuses its analysis objects?
9. **Invalid drafts:** While block text is invalid, should the last valid graph remain editable, and how should users reconcile those edits?
10. **Saved output:** Is reopening an editable notebook enough initially, or must users also share or export a readable, self-contained result?

## Next step after confirmation

Use these answers to select one initial workflow and define what must survive an edit in each direction. Then shape the smallest demonstration that proves that behavior. Keep execution mechanics and broader notebook features provisional until that scope is clear.
