---
title: "MCP server for agent-driven analysis — shape brief"
slug: "mcp-server"
phase: shape
status: current
last_updated: "2026-10-13"
---

# MCP server — what we are adding

**Outcome:** An agent connected over MCP builds and revises explorEDA analyses in a project folder, and it gets checked, actionable feedback on every change.

**Primary flow:** add `exploreda mcp` to the agent once → open the folder → add data or `.eda` files → write or edit an analysis → read the check result → fix → the open tab shows the views.

## Feature scope

```text
exploreda MCP
├── PLANNED ADDITIONS
│   ├── MCP endpoint on the running `exploreda` server (HTTP, localhost only)
│   │   ├── the server writes .exploreda/server.json (port, key; git-ignored)
│   │   ├── `exploreda mcp` helper: one fixed agent config line; it reads that
│   │   │   file and relays to the running server, starting one if none runs
│   │   └── same folder rules as the app: relative paths, writes stay inside
│   ├── Kickoff tools
│   │   ├── add data: copy a local CSV or JSON file in, write rows given as text,
│   │   │   or fetch a CSV or JSON URL into the folder
│   │   └── add or replace an .eda file (project text or an analysis)
│   ├── Feedback tools (the existing exploreda-dsl, as tools)
│   │   ├── check: parse and build text against the project's data, without saving
│   │   │   └── each problem with its line, message, and suggested fix
│   │   ├── fields: names, types, and example values per source
│   │   ├── reference: the grammar, or one chart type's settings
│   │   └── describe: the built views, with chart counts, row counts, and problems
│   ├── Editing tools: read, write, rename, and delete analyses; format text
│   │   ├── every write returns the check result, so check-and-fix is one loop
│   │   └── a write fails if the file changed since the agent read it
│   └── Live app: writes reach the open tab through the existing file watching
├── EVALUATE BEFORE COMMITTING
│   └── Edit tools finer than whole-file writes (add chart, set one setting)
└── LATER POSSIBILITIES
    ├── Chart images for the agent, ideally rendered headless (important; see below)
    ├── Live tab control: active view, selection, hover
    ├── Database sources, once database-adapters lands
    └── MCP for the demo or the self-hosted server
```

## Behavior

| Situation                                              | Expected result                                                                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| The agent writes an analysis with errors               | It saves, and the tool result lists each problem with its line and fix. The app opens it with the same problems shown.         |
| The folder has data but no project text                | `fields` works on the data files. The first write creates the project text, as the app's first save does.                      |
| A person edits the same analysis while the agent works | The agent's write fails if the file changed since the agent read it. The result tells the agent to read the file again.        |
| No browser tab is open                                 | Every tool still works. The server loads the checker on the first tool call.                                                   |
| The server restarts with a new port and key            | The helper rereads `server.json`; the agent config does not change.                                                            |
| The agent fetches a URL                                | The file is saved into the folder, and its source records where it came from. Oversized or non-CSV/JSON responses are refused. |

## Examples

Proposed tool names, not final:

```text
add_data   { path: "data/orders.csv", from: "/Users/me/Downloads/orders.csv" }
fields     { source: "orders" }
write_eda  { path: "returns.eda", text: "eda query=orders\nhist orders.region ..." }
  → { saved: true, views: 2, problems: [{ line: 4, message: "Unknown field returnedAt", fix: "Did you mean returned_at?" }] }
```

## Decisions and boundaries

**Appetite:** A launch-quality MCP endpoint on the `exploreda` server, covering the kickoff, feedback, and editing tools, with a docs page and an example agent session. Saved state is the launch definition of "control anything."

**Key decision:** Make project files the control surface first. Charts, settings, filters, calculations, sources, and joins are already `.eda` text, and the checks already run in Node. Files give parity with saved work, a `git diff` trail, and live updates without a browser bridge. Selection and hover would need a bridge, so they wait.

**Images:** Not at launch, but important: seeing its charts will likely help an agent most after the check loop. This is the main trigger for [headless chart rendering](../headless-chart-rendering/intent-brief.md).

**Boundary:** No model, prompts, or credentials in explorEDA. The MCP endpoint keeps the server's guards: localhost only, the run's key, and writes inside the folder. The server loads the `exploreda-dsl` bundle on the first tool call, so plain `npx exploreda` starts as fast as today. The component and the demo are unchanged.

**First proof:** **Try:** Serve `check`, `fields`, `reference`, and a whole-file `write_eda` as MCP tools from the running server over the shop example. Give a cold agent with no explorEDA docs a CSV and a request for a dashboard. **Observe:** Whether it reaches a fully built analysis using only tool results, how many check-fix rounds it needs, and which problems lacked a usable fix. **Decide:** If it gets there within about five rounds, build out the rest of the tools on this file loop. If it stalls on DSL syntax, put finer edit tools (add chart, set setting) ahead of whole-file writes.

See the [intent brief](intent-brief.md).
