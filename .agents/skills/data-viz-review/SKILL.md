---
name: data-viz-review
description: Review charts, tables, faceted views, and dashboards from screenshots or rendered pages. Check visual quality, semantic correctness, and interaction clarity. Use for data-visualization critique, not source-only implementation review.
---

# Data Visualization Review

Decide whether the artifact works as a chart first. Features and controls do not compensate for an unclear visual.

## Inputs and evidence

Accept a screenshot, image, chart, table, dashboard, or running page. Review every supplied view. For a dashboard, review each view and the combined system.

Inspect the rendered visual before reading source code, configuration, DOM details, or implementation notes. Record the first-pass evidence while it is still independent. Use source review later only to confirm semantics, state, or a proposed repair. Separate visible facts from source-based inferences.

If the input cannot show a relevant state, mark that check `not applicable` or `not verified`. Do not invent behavior. Do not credit a tooltip, control, or source setting for information missing from the static visual.

## Critical gates

Fail the review when any gate blocks correct use:

- **Purpose:** A person cannot identify the subject, measure, comparison, or current scope from the visual.
- **Truth:** A scale, baseline, aggregation, encoding, missing-value treatment, or comparison materially misleads.
- **Meaning:** An essential encoding, unit, category, or derived value has no visible explanation.
- **State:** A filter, selection, rescaled domain, or other state changes the data without a visible indication.
- **Readability:** Essential content is unreadable, clipped, or indistinguishable at the supported viewport.

Name the visible evidence for each blocker. One blocker is enough for a failing verdict.

## Review rubric

Judge each applicable section as `good`, `needs work`, `poor`, or `not applicable`. Use `good` only when the visual needs no material repair in that section.

### Visual quality

- **Purpose and title:** The title states the question or claim. Subtitles, units, time range, population, and filter scope provide needed context.
- **Hierarchy and layout:** The reading order matches the analytical question. Related items stay together. Charts receive more emphasis than controls or decoration.
- **Typography and spacing:** Text has a clear hierarchy, useful density, consistent alignment, and enough space without wasting the viewport.
- **Marks and ink:** The chosen marks support the comparison. Data remains prominent. Borders, grids, backgrounds, effects, and repeated chrome earn their space.
- **Axes, scales, ticks, and grids:** Domains, baselines, direction, transforms, tick density, precision, and grid weight support honest comparison. Repeated measures use consistent scales unless a clear reason is visible.
- **Labels and annotations:** Direct labels, units, definitions, uncertainty, sample size, and notable values appear where interpretation needs them. Hover is supplementary.
- **Color and legends:** Color has one clear job, stable meanings, sufficient contrast, and a compact legend when direct labeling is not better. Do not use color alone for state or meaning.
- **Accessibility and viewport:** Text and marks remain legible at the supported size. Focus, reading order, names, contrast, and non-color cues support use. Overflow and resize behavior do not hide the result.

### Semantic correctness

- Confirm that chart family, field roles, grouping, aggregation, ordering, scale type, and units match the question.
- Check denominators, population versus visible subset, missing or invalid data, uncertainty, and transformations when they can change the conclusion.
- Treat unexplained truncation, dual axes, changing filter domains, unequal intervals, and inconsistent cross-view encodings as high-risk evidence.
- Do not infer quality from source-code coverage or configuration breadth.

### Tables

- Check whether the table supports lookup, comparison, or detail better than a chart would.
- Check useful column order, clear headers and units, honest precision, numeric alignment, compact rows, and restrained cell decoration.
- Check visible sort and filter state, matching highlights, page or row scope, overflow, truncation, and access to full values.

### Dashboard relationships

- Check the page-level question, reading sequence, chart roles, shared vocabulary, aligned time ranges, comparable scales, and stable category colors.
- Make global and local filters distinct. Show active filters and selected versus available data. Identify which view controls another view.
- Treat conflicting scales, unexplained totals, duplicated legends, and disconnected panels as system defects even if each chart works alone.

### Filters and interaction

- Review the static visual first. Then test important hover, focus, selection, brush, filter, sort, paging, reset, resize, and empty states when available.
- Keep permanent controls subordinate to the information. Prefer progressive disclosure when controls crowd the chart.
- Check immediate feedback, visible current state, clear affected scope, recovery, keyboard access, and stable meaning during updates.
- A rescaled or filtered chart must reveal that change. A saved or shared view must make its restored state understandable.

## Chart-family prompts

Use these prompts inside the same review. Do not create a separate skill for a family.

- **Categorical comparisons:** Is the baseline honest? Does ordering aid comparison? Are grouped or stacked marks necessary? Can labels and small values be read?
- **Trends:** Is time ordered with honest intervals? Are gaps visible? Are series distinguishable and directly labeled? Do comparable panels keep stable domains?
- **Distributions:** Do binning, density, quartiles, outliers, and sample size support the claimed shape? Are normalization and missing values clear?
- **Relationships:** Are both variables and units clear? Does overplotting hide density? Are groups stable? Does the design avoid implying causation?
- **Facets:** Do panels repeat one question? Are headers and order clear? Are shared versus independent scales explicit? Are panels large enough to compare?
- **Tables:** Can a person scan, compare, sort, filter, and recover full values without decoding excessive formatting?
- **Coordinated dashboards:** Do views answer one larger question? Are shared scales, colors, filters, selections, and current scope consistent and visible?

## Output

Lead with this compact structure:

1. **Verdict:** `pass`, `pass with changes`, or `fail`, followed by one sentence.
2. **Blockers:** Critical gates that failed, or `None`.
3. **Section findings:** One evidence-based line for each applicable rubric section, with its judgment.
4. **Three priority fixes:** Give exactly three. Order them by effect on correctness and comprehension, not ease.
5. **Secondary notes:** Optional and brief. Put unverified behavior here.

Name the strongest and weakest visible choices. Cite locations, text, marks, or states from the artifact. Avoid generic advice and numeric scores.

## Design basis

This rubric distills the repository transcript set, especially:

- [Dashboarding, filtering, and chart defaults](../../../docs/transcripts/2026-07-28-dashboarding-filtering-and-chart-defaults.txt)
- [Faceting and shared scales](../../../docs/transcripts/2026-07-29-faceting-and-shared-scales.txt)
- [Visualization traceability and dataflow](../../../docs/transcripts/2026-08-02-visualization-traceability-and-dataflow.txt)
- [Table filtering and distributions](../../../docs/transcripts/2026-06-28-table-filtering-and-distributions.txt)
- [Saved table views and formatting](../../../docs/transcripts/2026-06-29-saved-table-views-and-formatting.txt)
