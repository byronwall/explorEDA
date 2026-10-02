---
title: "Runtime configuration story — shape brief"
slug: "runtime-configuration-story"
phase: shape
status: current
last_updated: "2026-10-01"
---

# Runtime configuration story — shape brief

## Recommendation

Use the existing live example as the primary entry for developers evaluating the component. Demonstrate adding and editing charts. Provide chart inventory, detailed settings, and expandable referenced definitions in a readable chart spec screen. Expose the same current settings to embedding hosts. Keep JSON in optional integration detail.

The spec screen expands this initiative beyond copy changes. Its first useful form is an inspector of the same definitions that drive the charts. Editing can follow if it adds value beyond the existing chart controls. Give integrated agents major emphasis after their dashboard workflow works.

## Problem and appetite

- **Problem:** Prepared dashboards obscure repeated runtime chart creation and editing. JSON is a poor inspection surface for users.
- **Outcome:** Developers can try the component and inspect how configuration drives it.
- **Appetite:** A focused landing journey plus structured chart spec inspection.
- **Boundary:** Spec editing is optional; agent and project services belong to their own initiatives.

## Core shape

The first screen identifies an embeddable analysis component and invites visitors to explore an example. The example lets them add and edit charts through normal controls. A chart spec screen lists all chart definitions, positions, and configuration in readable sections. Details identify the chart and field names clearly.

The screen reads the current configuration, including recent user edits. It does not maintain a second set of definitions. If editing is included later, it must use the same operations as the ordinary chart controls.

The integration section connects the demonstration to host-owned data and saved settings. Visitors who supply their own data start a fresh analysis. Example visits default provisionally to a fresh state. If edits are retained, Reset restores the original example.

## Current fit

Reuse the live example, Chart details editor, saved settings, layout state, and integration explanation. The example already has Reset. The package should supply chart spec inspection so an embedding host can expose it too. Its placement and public entry need later review. The current edit callback does not supply initial settings. A demo-only explanation would not satisfy the product need for inspecting the current analysis.

## Included inspection capabilities

1. **Chart inventory:** List every chart’s name, type, position, and size.
2. **Chart details:** Select a chart to inspect its fields, grouping, colors, scales, filters, and layout.
3. **Referenced definitions:** Expand a calculated field or named color scale to see the definition currently used.
4. **Host access:** Let an embedding application read the same current settings for its own inspector or agent.

Host access includes the initial analysis and subsequent edits. The existing saved-settings getter supplies configuration; the public boundary needs a focused way to obtain it. Data schema, samples, and rendered visuals remain additional agent context.

Change comparison between settings snapshots is deferred. Snapshot Undo can proceed without a comparison screen.

## How to make this go better

- **Prove repeated chart work.** Show adding and editing a chart before spending equal attention on calculations.
- **Read the real definitions.** Keep the spec screen synchronized with current chart settings and positions.
- **Start with inspection.** Settle readable detail before adding another editor.
- **Keep the example recoverable.** Provide a clear route back to the original prepared state.

## First proof

- **Question:** Can a developer understand the component's runtime configuration through chart work and readable specifications?
- **Proof:** A reviewed journey with chart creation, editing, and a complete spec screen.
- **Observe:** Inventory and details match current charts and positions. Referenced definitions resolve correctly. A host reads the same settings initially and after edits. Integration remains easy to find.
- **Decision rule:** Keep the shape if visitors can explain how the configuration drives what they see without reading JSON.

## Rabbit holes and no-gos

Do not create a separate spec format or duplicate settings state. Keep change-comparison UI below the current cut. Do not give calculation editing equal demonstration time by default. Avoid untested agent claims. Do not treat example persistence as a requirement for personal data storage.

## Plan handoff

The [implementation plan](implementation-plan.md) starts with the readable chart spec screen. Host settings access and the example journey follow.

## Weakest or least-clear parts

The readable spec screen is new scope. A partial summary that omits positions or configuration would miss its purpose. Spec editing is a possibility, not an acceptance requirement. Example persistence remains a reversible choice with a reset requirement if retained.

## Most likely bad outcome

A polished landing page shows fixed examples and a JSON dump, while developers still cannot see how users create and revise charts.
