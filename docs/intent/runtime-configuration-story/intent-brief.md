---
title: "Runtime configuration story"
slug: "runtime-configuration-story"
phase: intent
status: current
last_updated: "2026-09-29"
---

# Runtime configuration story

## My read

The landing page should speak to developers who want to embed explorEDA in an existing analysis tool. It should also serve developers building a platform who need a configurable analysis primitive. The first visit should lead into a working example. Adding and editing charts should show the value, because those actions happen repeatedly during analysis.

Runtime configuration connects the demonstration to the integration story. A prepared dashboard is a starting point that users can change through the interface. An agent can prepare its initial settings, and a person can continue the analysis. JSON remains useful at the host boundary, but visitors should see very little of it. The product should explain configuration through a structured chart spec screen that exposes chart definitions in a readable form.

That screen is a new capability within this initiative. It should list every chart’s name, type, position, and size. Selecting a chart shows its fields, grouping, colors, scales, filters, and layout. Referenced calculations and named color scales can expand to show their current definitions. Its main purpose is inspection: users can see what drives the dashboard without reading JSON. Embedding hosts should be able to read the same current settings for their own inspector or agent. Editing from the screen is a possible extension. It must describe the same definitions used by the normal chart controls.

Agent-driven BI and visualization should become a major part of the story once integrated assistance works. Until then, the page should prove the configurable component that developers can use today.

## What matters most

- Serve developers embedding the component or building an analysis platform.
- Make exploring an example the primary action.
- Demonstrate chart creation and editing before calculation workflows.
- Show configuration through a readable chart spec screen.
- Give integrated agents major emphasis when their workflow is working.

## The intended experience

A developer opens a prepared example, adds a chart, and changes its fields or display choices. They inspect the chart spec screen and see the new chart, its position, and its settings. They can then reach the integration explanation and understand how their application supplies rows and retains analysis settings.

Someone who supplies personal data starts a fresh analysis for that data. The prepared example is the default introduction. Calculations remain part of the product, but they receive less demonstration emphasis because saved calculations often need fewer repeated changes.

## Boundaries

Keep the displayed story tied to working behavior. Host integration may expose JSON, while ordinary inspection should use structured chart details. Do not describe the proposed spec screen as shipped until it exists.

Examples should probably start fresh on return visits. This is a weak preference, not a fixed persistence policy. If example edits are retained, a clear Reset action is required. Personal data and saved analyses have separate persistence needs.

This scope includes landing presentation, the demonstration, and chart spec inspection over one source. Multiple sources are a separate initiative. It does not include an agent service or project navigation. An editable spec screen remains optional until inspection is useful. A settings change-comparison screen is deferred; it is not part of this scope.

## What seems settled

The primary audience is developers. Explore an example is the main action. Chart creation and editing supply the strongest proof. JSON visibility should be minimal. The chart spec screen includes inventory, detailed settings, and referenced definitions. Host access to the same current settings is included. Change comparison is deferred. Agent assistance becomes a major story after it works.

## Current reality that matters

The landing page already offers a live order example and React integration guidance. `Hero`, `WhyWorkspace`, and `IntegrationGuide` contain much of the current explanation. The workspace stores chart definitions and layout in settings. The proposed chart spec screen is not a current landing feature.

This refines the [earlier landing scope](../developer-adoption-page/intent-brief.md). It connects to [project views](../project-task-views/intent-brief.md) and [integrated agents](../in-app-analysis-agent/intent-brief.md).

## Next step after confirmation

Review an example journey that adds and edits charts, then inspects their definitions. Keep spec editing optional during shape review.
