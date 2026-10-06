---
title: "Project and task views"
slug: "project-task-views"
phase: intent
status: current
last_updated: "2026-10-05"
---

# Project and task views

## My read

The first useful result is several saved views on tabs over the same source data. A view means chart definitions and filters, including the layout and settings needed to show those charts. Switching tabs must retain each view's analysis. Users can create another view or duplicate one to start a different investigation.

The earlier shape combined two jobs: retaining separate analyses and navigating from an overview to parameterized detail. Saved tabs solve the immediate job. Parameterized navigation moves to a [separate follow-up](../parameterized-task-navigation/intent-brief.md). It can build on saved tabs later.

Edits save automatically. Byron wants all client state persisted to local storage, ideally including the source required to reopen the analysis. This replaces the previous undecided save policy. Persisting only chart settings would fall short if a refresh loses the source, filters, or active tab. Source data should be stored once for the project, rather than in every view or history checkpoint.

Automatic saving needs reliable Undo and a timeline slider for visiting earlier states. The timeline must distinguish changes to chart definitions and layout from changes to filters. An edit can affect both. The distinction describes what changed; it does not yet require separate timelines or selective replay of filter edits.

## What matters most

- Create and switch saved tabs over one source.
- Preserve each view's chart definitions, layout, and filters.
- Save meaningful client state automatically to local storage.
- Recover earlier states through Undo and a timeline with clear change categories.
- Prove retention before adding detail navigation.

## The intended experience

A user opens an order dataset and names a view Sales. They add charts and select September. They duplicate the tab as Returns, then change its charts and filters. Switching back restores Sales with its own September selection. Neither view receives the other's local filters.

After a refresh, the same tabs, active view, settings, filters, and retained history return. The source also returns when local storage can hold the supported dataset. A save failure must be visible; the app must not claim that unsaved work is retained.

The user walks backward through edits. Timeline entries explain whether charts, filters, or shared settings changed. The implementation previews earlier project settings before an explicit restore. It retains 50 checkpoints without copying source rows. Larger source sizes still need measured proof.

## Boundaries

One source supplies all tabs. Multiple sources and lookups remain in their [own initiative](../multi-source-analysis/intent-brief.md). Server storage and account features are outside this first shape.

Parameterized detail views, connection authoring, and filter inheritance move to the navigation follow-up. Side-by-side comparison remains later work. A library of named reusable filters also stays below the first cut line; retaining ordinary view filters comes first. The initial implementation reuses chart filter controls and the Rows filter panel. A dedicated filter collection remains follow-up work.

Shared field definitions and color scales retain one current project value. Earlier feedback preferred immediate updates across dependent views. A historical project state may restore an earlier shared value; active views must not keep conflicting copies. The implementation also shares calculations, grouped definitions, and geometry assets across views.

All client state means meaningful serializable analysis and session state. Hover state and incomplete pointer gestures are proposed exclusions. They do not represent completed work.

## What seems settled

Tabs, one source, chart definitions plus filters per view, automatic local saving, Undo, and categorized time travel are required. Detail-filter inheritance is unresolved and does not block this initiative. Duplication remains useful without comparison or navigation machinery.

## Current reality that matters

The package accepts one row array and one saved settings object. Its state callback and restore path provide a useful seam. Saved settings already include charts, calculations, colors, field settings, Rows settings, and grouped definitions. The full analysis format includes rows. The demo host now adds named tabs, automatic local saving, and categorized history around these package seams. The package API remains unchanged.

## Next step after confirmation

Review the saved-tabs PR after completed browser acceptance. Measure larger imports before expanding the storage promise. Parameterized navigation remains a separate initiative.
