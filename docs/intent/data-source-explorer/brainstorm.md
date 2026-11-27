---
title: "Explore a data source: three approaches"
slug: "data-source-explorer"
phase: brainstorm
status: draft
last_updated: "2026-11-27"
---

# Three approaches

## A. Source profile page

A click on a source replaces the main pane with a read-only page for that table. One row per column shows its type, missing count, distinct count, a small distribution, and its top values. A paged row table sits below it. Each column has "Chart this", which creates an analysis.

- **Easier:** reading a strange table quickly. The page is calm and has no workspace controls.
- **Catch:** it is a dead end. Clicking `failure` does not narrow anything, so "which repos fail most?" needs a new analysis.
- **Best fit:** the main job is "what is in this table?"

## B. Scratch workspace (current lean)

A click opens an unsaved workspace on that source. It starts as the package already starts unsaved data: Summary, the source table, and one distribution. Every chart filters the others, so clicking `failure` narrows everything to 847 runs. "Save as analysis" writes the `.eda` file. Leaving without saving discards it.

- **Easier:** almost all of this exists. It is the same engine as analyses, so the numbers agree.
- **Catch:** it looks like an analysis, so the line between "looking" and "authoring" is thin. The opening layout needs care to read as a profile, not a dashboard.
- **Best fit:** the main job is "find something, then keep it".

## C. Linked drill-down across tables

Rows are the main view. A key value is a link: a click on a run's `run_id` opens its jobs, and a job opens its steps. A breadcrumb shows the path, such as Runs › run 40667415592 › 6 jobs › 41 steps. Filtered sets follow the link, so 847 failed runs lead to the jobs and steps of those runs.

- **Easier:** questions that cross tables, such as "which steps fail in the runs that fail?". This is the strongest "drill in".
- **Catch:** the CI project declares 0 relationships. Links must be drafted (`proposeLinks`) and accepted first. This is also the most new UI.
- **Best fit:** raw relational data where the question lives in the joins.

## Contrast

A answers "what is it", B answers "what is in it, and is it worth keeping", and C answers "how does it connect". B reuses the most and can grow C's key links later. A's per-column profile can be B's opening layout. My lean is B with A's profile as the first thing you see. C waits until relationships exist in real projects.
