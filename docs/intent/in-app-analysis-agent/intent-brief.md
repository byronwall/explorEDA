---
title: "Agent inside the analysis application"
slug: "in-app-analysis-agent"
phase: intent
status: current
last_updated: "2026-09-29"
---

# Agent inside the analysis application

## My read

The integrated agent should build dashboards and views over one source dataset for now. A request such as “Please create a dashboard that explains orders” must be valid from an empty analysis. Creating and editing charts is the first priority. Useful calculation requests include net sales and gross profit. Explanations remain valuable, but they are less critical for the initial offering.

The agent needs rich context: schema, sample values, current chart definitions, and the current visuals. Relevant filters, calculations, source definitions, and project context support those inputs. A person can attach specific charts or results, but attached context is not the agent's only understanding of the analysis.

Valid changes should appear directly in the workspace, with a quick Undo. Requiring approval before users can see each change would slow repeated work. Agent-created charts remain normal runtime definitions that people can edit through existing controls.

Users can continue editing while a request runs. The agent should reconcile its result with the latest analysis before applying it. If reconciliation fails, it should make another pass to resolve the conflict. This is a preferred behavior whose detailed recovery limits still need design evidence.

The application talks to a server through a defined API. Byron can host that service. Other hosts can run their own server and use their own credentials. Users should not need a separate developer agent session for each interaction.

## What matters most

- Create a useful dashboard from scratch, then support rapid chart edits.
- Supply schema, sample values, definitions, and visual context.
- Apply changes directly and provide quick Undo.
- Reconcile results with edits made while the agent was working.
- Preserve applied analysis changes; chat history has lower value.
- Complete dashboards in under 60 seconds and small edits in about 15–20 seconds, preferably sooner.

## The intended experience

A user opens order data and asks for a dashboard. The agent receives data context and creates several useful charts and a coherent layout. The dashboard appears without an approval gate. The user edits a chart, requests another change, or uses Undo to remove an unwanted agent change.

The user can ask for a calculation such as gross profit when the available fields support it. A later explanation can use the same context, but initial success is measured by the resulting dashboard and editable views.

If the user changes a chart during the request, the agent's final result is checked against those latest edits. It adapts or makes another reconciliation pass rather than replacing the analysis with a stale snapshot.

## Boundaries

Model output still requires validation. Direct application does not authorize unrelated data deletion or arbitrary code execution. Ordinary Undo restores the previous settings checkpoint. A whole agent result can be one undoable change. Selectively removing an older agent change while retaining every later manual edit is outside the current requirement.

The server API supports Byron's hosted service and independently operated servers. Provider credentials remain server-owned. Provider and protocol details are not selected here.

Persisted charts and views matter most. Chat history, rejected drafts, and attached-context history are not first-release acceptance requirements. Explanations are secondary. The time targets concern visible useful results, not merely acknowledging a request.

## What seems settled

Dashboard creation is the first representative request. Rich schema and visual context are required. Changes apply directly with Undo. The server API is the integration boundary. Applied analysis state matters more than conversation storage.

## Current reality that matters

The package restores validated settings and emits edits. It has chart controls and calculations, but no agent service. Saved settings do not include source rows or rendered visual context. The earlier preview-and-Apply shape is superseded, as is a first proof limited to one added chart and an explanation. Current settings restore rebuilds charts, calculations, colors, and filters over retained source rows. This supports ordinary checkpoint Undo.

The [project initiative](../project-task-views/intent-brief.md) expands future context. The [runtime story](../runtime-configuration-story/intent-brief.md) gains major agent emphasis once this works.

## Settings history and concurrent responses

Settings snapshots can record meaningful edits and support ordinary Undo. A readable change-comparison view is a later possibility and is deferred from current scope. For the same source data, committed analysis settings are the checkpoint; temporary UI state is outside that promise.

Reconciliation addresses a different issue. The agent starts from settings A. The user changes them to B while it runs. The returned result must be reconciled with B before application. Capture B before applying the reconciled result C. Undo then restores B. This preserves the manual work done during the request without requiring selective history replay.

This history mechanism does not choose automatic durable saving. View and project checkpoint scopes still need clear ownership.

## Next step after confirmation

Review dashboard creation, direct edits, Undo, and concurrent human edits as one product flow. Use the stated response targets when assessing that shape.
