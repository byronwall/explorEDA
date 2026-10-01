---
title: "Agent inside the analysis application — shape brief"
slug: "in-app-analysis-agent"
phase: shape
status: current
last_updated: "2026-09-29"
---

# Agent inside the analysis application — shape brief

## Recommendation

Shape the first integrated agent around single-source dashboard creation from an empty analysis, followed by fast chart edits. Supply rich schema, sample, configuration, and visual context. Apply valid changes immediately and provide Undo. Use a server API that Byron can host or another developer can serve with their own credentials.

Keep the charts and saved view definitions as the durable output. Conversation storage is secondary. A review gate is no longer the recommended default. Use settings checkpoints for ordinary Undo. Applying a response based on old settings is a separate reconciliation concern.

## Problem and appetite

- **Problem:** External drafts require separate setup and do not provide a fast, contextual dashboard-building loop.
- **Outcome:** A user requests a dashboard, sees editable charts, and iterates directly with Undo available.
- **Appetite:** Dashboard creation, chart edits, and useful calculations through one server API.
- **Boundary:** Explanations and chat history receive lower priority.

## Core shape

The application sends a request with source schema, sample values, current chart definitions, and current visuals. It includes relevant filters and calculations. User attachments emphasize parts of that context rather than providing the only context. The server returns validated analysis changes for the runtime configuration model.

Before application, compare the result with the latest analysis. Reconcile overlapping human changes. If that fails, request another pass with current context. Valid changes appear immediately. Capture the current settings immediately before application. Undo restores that checkpoint. Treat a completed dashboard generation as one change.

A new-dashboard request can add several charts and a layout. The same path supports smaller changes and calculation definitions. Preserve existing work unless replacing it is part of the request. Show useful progress during work, but do not count progress as meeting the response target.

Byron's service and independently hosted services implement the same application-facing API. The server owns model credentials. The host retains the resulting charts and views through its normal persistence path.

## Current fit

Reuse chart definitions, settings validation, calculations, field metadata, and normal editing operations. Whole-settings restore supports ordinary Undo over the same source data. The current public restore input suppresses its state callback, so host-owned history must update its own current checkpoint when it performs Undo. A public restore helper may improve convenience later, but a mutation-command framework is not required. Visual context and source samples are additional context surfaces. The server API still needs shaping; selecting a model is deferred.

## How to make this go better

- **Use the real primary request.** Creating an orders dashboard tests chart selection and layout beyond one chart addition.
- **Include visual context.** Definitions alone do not show what the current charts actually look like.
- **Reconcile before applying.** A result must respect edits made after the request began.
- **Use ordinary settings history.** Capture coherent changes and group one dashboard response into one checkpoint.
- **Judge complete results against time targets.** Target under 60 seconds for dashboards and 15–20 seconds for small edits.

## Snapshot example

The agent starts from A. The user changes a chart, producing B. Reconcile the agent's result with B, capture B, and apply C. Undo restores B. If the user then makes another edit D, normal Undo steps through C and then B. Removing only the older agent change while keeping D would be selective Undo, which is deferred.

History snapshots reuse the saved format. A change-comparison UI is deferred and is not required for Undo. Do not add an operation log solely to make ordinary Undo possible. Multiple sources and lookups are a separate [initiative](../multi-source-analysis/shape-brief.md).

## First proof

- **Question:** Can users build and revise a dashboard through direct agent changes while retaining control?
- **Proof:** A reviewed request flow for an orders dashboard, a small edit, Undo, and a concurrent human edit.
- **Observe:** Output contains ordinary editable charts. Undo is clear. A stale response reconciles with current work. Server-backed timing is measured when execution is authorized.
- **Decision rule:** Keep the shape if it creates a useful dashboard, preserves human work, and supports the stated time budgets.

## Rabbit holes and no-gos

Do not reinstate approval before each ordinary chart change. Do not make chat history the primary persisted output. Do not reduce context to settings or attachments alone. Do not erase intervening user work when applying a stale response. Selective Undo of an older change is deferred. Do not claim a prepared response proves model quality or latency.

## Plan handoff

Intent and shape only. Review the direct-apply, reconciliation, and Undo flow before implementation planning.

## Weakest or least-clear parts

Rich context may compete with the response budgets, especially for large data or visuals. The useful dashboard criterion must include suitable charts and layout, not a chart count. Reconciliation retries may exceed the time target; failure must leave current work intact and allow another request. Review chronological Undo checkpoints. A timestamp-only change should not become a visible edit. Grouping a chart drag or one agent response must produce understandable history steps.

## Most likely bad outcome

A technically valid agent creates weak dashboards slowly, or applies a stale result that overwrites edits made during the request.
