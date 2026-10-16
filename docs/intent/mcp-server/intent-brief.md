---
title: "MCP server for agent-driven analysis"
slug: "mcp-server"
phase: intent
status: current
last_updated: "2026-10-13"
---

# MCP server for agent-driven analysis

## My read

Now that `npx exploreda` turns a folder into a project of text files, you want an outside agent, such as Claude Code or another MCP client, to work in that project with the same reach a person has. The agent should be able to start from nothing: hand over data, or hand over `.eda` files it wrote. Then it builds and changes views, and the result is ordinary explorEDA work that a person can open, read, and keep editing.

The second half matters as much as the first. The server should tell the agent useful things back: whether its DSL parses and builds, what each problem is and how to fix it, what fields the data has, what a chart type accepts, and what the built views contain. A cold agent writing `.eda` text needs a tight check-and-fix loop. Without it, the agent guesses and the person cleans up.

"Control anything the user can control" is the ambition. I read it as a direction for coverage rather than a demand that every pointer gesture gets a tool on day one. The durable outcome is that nothing an agent needs for real analysis work is reachable only by clicking.

This is distinct from the [in-app analysis agent](../in-app-analysis-agent/intent-brief.md). That initiative puts a model inside the app with server-held credentials. This one exposes explorEDA to an agent the user already runs, with no model or credentials in explorEDA.

## What matters most

- An agent can start a project from data files or from `.eda` text and get working views.
- DSL feedback that an agent can act on: parse and build problems with locations and fixes, field lists, and the chart reference.
- Whatever the agent makes is ordinary project text, readable and editable by a person.
- Coverage grows toward parity with what a user can do in the app.

## The experience you appear to want

A user runs explorEDA with MCP enabled and connects their agent. They say, "Here is `orders.csv`; build me a dashboard on returns." The agent adds the data, reads the fields, writes an analysis, and checks it. It fixes the two problems the check reports and checks again. Then it reports which views were built. The user's open browser tab shows the new analysis as it lands. The user drags a chart, and the agent can see that change on its next look.

## Boundaries

### Must be true

- Agent output is the same project text a person produces. There is no separate agent format.
- The local server's security model holds: localhost only, a per-run key, and writes confined to the project folder.
- A person's edits made while the agent works are not silently lost.

### Must be avoided

- Building a model, prompts, or credential handling into explorEDA. That belongs to the in-app agent.
- A second, agent-only path that drifts from what the app does.
- Making the component or the demo depend on MCP.

## What seems settled

- It builds on the local CLI project folder and its server (`local-cli-projects`).
- DSL v2, `exploreda-dsl check`/`fields`/`reference`/`project`, and the folder codec already exist and run in Node.
- Kickoff is by data upload (local files, inline rows, or a URL) or `.eda` upload. Database sources join once `database-adapters` lands.
- The agent connects to the running `exploreda` server over HTTP, so it works in the session the person has open.
- "Control anything" means saved state, through files, at launch. Live tab state comes later.
- Concurrent edits: a write fails if the file changed since the agent read it.
- Launch without chart images, but images are important. They are the strongest trigger for headless rendering.

## Possibilities, not decisions

- Tools that mirror `exploreda-dsl` subcommands.
- A bridge into the open browser tab for live state: selection, filters, the active view, and screenshots.
- Returning chart images so the agent can see its work.

## Current reality that matters

- The server is a guarded file server. The folder codec and chart compiler run in the browser, but `exploreda-dsl` already runs them in Node.
- The server already pushes file changes to the app over server-sent events, and the app reloads changed analyses. An agent that writes files gets live updates in the app for free.
- Live UI state, such as selection, hover, and the open tab, exists only in the browser.
- Headless chart images are a [seed](../headless-chart-rendering/intent-brief.md), not built.

## What still needs your input

How an agent gets the run's address and key, and whether checks run in the server or the open tab. See the shape brief.

## Next step after confirmation

Settle the questions, update the [shape brief](shape-brief.md), then plan.
