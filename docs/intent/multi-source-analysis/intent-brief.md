---
title: "Multiple sources and lookups"
slug: "multi-source-analysis"
phase: intent
status: current
last_updated: "2026-09-29"
---

# Multiple sources and lookups

## My read

explorEDA should eventually work with several source tables inside an analysis project. Products, orders, and customers are the motivating example. Users should keep those datasets distinct and use lookups to bring related information into an analysis. The tables may have different row counts. Their relationships should help users answer questions without disguising which records a chart counts.

This is a separate initiative. The landing, task-view, and integrated-agent scopes remain single-source for now. Multiple-source support can be shaped independently without making those useful workflows wait for a new data model.

The durable goal is understandable related-data analysis. An order chart might use a customer's segment or a product's category through a lookup. A project might also support a customer-focused view that includes customers with no orders. That latter experience is a possible extension; the user has not selected different underlying populations within one dashboard.

The user explicitly chose lookups for combining tables. That does not settle arbitrary joins, a query language, or automatic filtering across relationships. The first shape should explain what a lookup contributes and what happens when there is no match or more than one possible match. It should preserve the existing analysis engine where one working dataset is enough.

## What matters most

- Keep source tables and their field meanings identifiable.
- Combine related tables through explicit lookups.
- Make each chart's record population and count understandable.
- Preserve reusable field-based filters and project definitions.
- Extend current runtime configuration rather than create a parallel dashboard engine.

## The intended experience

A user registers orders and customers as distinct sources. They choose orders as the base of a task view. They define a lookup from an order's customer key to the customer table and select fields such as segment or region. The resulting analysis still counts order rows, now with customer attributes available for charts and filters.

They can later add product fields through another lookup. A readable definition shows the base source, matching fields, and resulting columns. A missing match stays explainable. A source field change reaches views using the shared definition.

A customer-focused view could instead use customers as its base source. This illustrates why source identity matters even when several views ultimately feed one row array each into the current chart engine.

## Boundaries

Current single-source workflows remain valid without this capability. The new source model must not force every existing chart to implement its own lookup logic.

Lookups must identify their source, key fields, and output fields. Fields with the same name in different tables must remain distinguishable. Missing or repeated matches must not silently multiply order counts or sales totals.

Cross-source filtering and several populations within one dashboard are open product choices. Server-side loading, database execution, general joins, and distributed queries are not settled requirements. The initial proof can use small local tables.

## What seems settled

Multiple sources are a separate project scope. Products, orders, and customers remain its example. Lookups are the selected way to combine tables. Tables can have different lengths. Current initiatives stay single-source until this work is explicitly taken up.

## Current reality that matters

`ExplorEda` accepts one row array. The provider profiles one dataset and prepares calculations, columns, and Crossfilter state over it. Chart filters belong to chart instances, and Rows filters have local scope. The saved settings model has no source collection or cross-table lookup definition.

A lookup result that yields one working dataset can reuse current charts. The separate [task views initiative](../project-task-views/intent-brief.md) should provide view identity and shared definition ownership before multi-source relationships need to extend them.

## Remaining product choices

A later decision must establish whether charts with different base populations coexist within one view. A related decision must establish whether selecting a record restricts other sources through relationships. Neither choice is assumed by the lookup requirement.

## Next step after confirmation

Review orders enriched by customer and product lookups. Show matched, missing, and ambiguous keys and compare the resulting row count with the base source.
