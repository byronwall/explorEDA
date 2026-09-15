---
title: "Interactive EDA workspace — shape brief"
slug: "interactive-eda-workspace"
phase: shape
status: current
last_updated: "2026-09-14"
---

# Interactive EDA workspace — shape brief

## Recommendation

Build the first product slice around one source table, one shared field profile, and one improved data table. Keep the complete slice inside the public React package. Use the demo application as its first real consumer.

The user should load rows and immediately see what fields exist, what each field contains, and the source records. Type-aware filters should update the table and every existing chart through the current shared filter state. The workspace should expose its serializable state to the host application without owning storage.

Do not start with a new visualization grammar or a full table framework. The current summary, table, filter, and saved-state systems already contain most required seams. Strengthen these paths around one clear exploration flow first. Let this working slice reveal which broader abstractions are necessary.

## Problem and appetite

- **Problem:** A user can load data and create charts, but the first exploration loop is fragmented and under-explained.
- **Outcome:** One dataset becomes understandable and filterable before the user configures an advanced chart.
- **Appetite:** One focused vertical slice delivered through several small waves.
- **Not in this shape:** Multiple sources, joins, server loading, mobile support, a general chart grammar, or every planned table feature.

## Core shape

The application supplies one row array to the public `ExplorEda` component. It remains the source owner. The package derives one reusable field profile from those rows. That profile records each field's inferred type, null count, distinct count, range, and small distribution summary.

The package uses that profile in two views:

1. The field summary gives a compact overview and direct actions.
2. The data table renders source rows with suitable defaults and field-aware controls.

A user can inspect a field, add a simple filter, and see the active row count change. The table and current charts update through `CrossfilterWrapper`. The workspace shows active filters in one visible place and offers one reliable reset action.

The package owns live workspace state. It emits serializable state changes through a public host callback. The application decides whether and where to save them. A host can later supply saved state with the same rows and restore the workspace.

```text
application-owned rows
        ↓
public ExplorEda component
        ↓
shared field profile + workspace state
        ↓
field summary ↔ filters ↔ data table ↔ existing charts
        ↓
serializable state callback to the application
```

The first slice needs only built-in scalar values. Strings, numbers, booleans, nulls, and useful date detection are enough. Rich cells and custom renderers remain later extensions.

## Dataset pack

Use a small dataset pack as product fixtures. Each dataset must prove a different behavior.

- **Palmer Penguins:** 344 rows with numbers, categories, small groups, and missing values. It is useful for first-time exploration.
- **UCI red wine quality:** 1,599 rows with numeric distributions, correlations, outliers, and a discrete result.
- **Synthetic shop operations:** About 500 deterministic order rows with dates, categories, booleans, nulls, seasonality, skew, and designed outliers.
- **Existing Lorenz fixture:** Keep it for linked selection, faceting, and dense-chart checks.

Do not make the current large random files the primary examples. They are useful for performance checks, but they have weak stories. Their unseeded generation also makes defects harder to reproduce.

The synthetic fixture should use a fixed seed and a few simple patterns. For example, discounts can reduce margin, winter can lift one category, and one region can have slower delivery. These relationships make the tool pleasant to explore without making the generator complex.

## Current fit

- **Reuse:** `DataLayerProvider`, `CrossfilterWrapper`, summary statistics utilities, `DataTable`, shared filter types, saved-data validation, and chart registration.
- **Add:** One shared field-profile model, clear active-filter status, table controls based on field type, and a public state-change callback.
- **Avoid or replace:** Duplicate type detection inside separate views, table-only interpretations of shared filters, and documentation for features that do not exist.

The public package boundary already exists. The demo imports `ExplorEda` from the package entry point. No package extraction or second implementation is needed.

## How to make this go better

- **Prove the consumer boundary in the demo.** Use only the public package entry point. An internal import means the package API is missing something.
- **Create one field profile.** Summary, table, filters, and chart defaults should not infer the same field differently.
- **Keep storage outside the package.** Emit workspace state and let the host store it. This preserves reuse without adding a storage framework.
- **Improve one field type at a time.** Prove numeric filters first, then categories, text, and dates. Each step leaves a useful table.
- **Measure before adding virtualization.** Current pagination is enough until a representative dataset shows a real rendering problem.
- **Test only durable logic.** Keep small checks for profiling, filter behavior, and state serialization. Verify the user flow in the demo.
- **Give each dataset one job.** Use small real datasets for discovery and the synthetic fixture for controlled edge cases.

## First proof

- **Question:** Can the public package turn one arbitrary dataset into a clear, stateful exploration loop without application-specific code?
- **Proof:** Load Palmer Penguins and the synthetic shop fixture through the demo. Show the field summary and source table by default. Apply one numeric range filter and one categorical filter.
- **Observe:** The summary, table, and one existing chart agree on field types, active filters, and remaining rows. The host receives restorable workspace state.
- **Pass / fail:** Pass when the flow uses only the public package API and reload restores the same analysis. Fail if the application must recreate package controls or derive separate metadata.
- **Deliberately excludes:** Multiple tables, remote data, saved-view management, rich cells, grouping, virtual scrolling, and new advanced charts.

## Rabbit holes and no-gos

- Do not design a universal data-source adapter before one in-memory source works well.
- Do not replace every chart setting with a new grammar during this slice.
- Do not add TanStack Table, AG Grid, or another table engine without a measured gap.
- Do not build a custom cell-renderer plug-in system before built-in scalar rendering is good.
- Do not add controlled and uncontrolled state modes together. Add the smallest host persistence seam that works.
- Do not preserve the old package API when a simpler breaking shape is better.
- Do not build a dataset catalog, download service, or generator framework for these fixtures.

## Serious alternative

The application could own the new summary and table flow, with package extraction later. This would make early application work slightly faster. It would also create two data models or force a later extraction across stateful controls. The repository already has a working public package boundary, so this alternative saves little and creates predictable rework.

## Plan handoff

Plan one vertical path before completing every table feature. Start with the dataset fixtures, shared field profile, and default summary-plus-table workspace. Then add one type-aware filter, visible filter state, and host state emission. Keep advanced table controls and chart grammar work provisional until the first flow exposes a concrete need.
