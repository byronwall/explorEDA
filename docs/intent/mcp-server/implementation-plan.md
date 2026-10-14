---
title: "MCP server for agent-driven analysis — implementation plan"
slug: "mcp-server"
phase: plan
status: draft
last_updated: "2026-10-13"
---

# MCP server — implementation plan

## Plan at a glance

The plan builds outward from the check loop. The main uncertainty is not MCP plumbing. It is whether an agent with no explorEDA docs can reach a fully built analysis from tool results alone. So the first milestone serves just four tools (`check`, `fields`, `reference`, `write_eda`) from the running server and puts a cold agent in front of them. Everything after it depends on that answer.

The main pushback is on reuse. `exploreda-dsl` already does the checking, but it is a command-line program that prints text and runs on import. The MCP tools should not parse its output or start it as a child process. They should call a shared tool module that returns structured results, and the CLI becomes a thin printer over that module. That module is built as a separate bundle that the server imports on the first tool call. The `exploreda` bin stays free of chart code, and `npx exploreda` starts as fast as it does today.

The second pushback is a trap in the current server. The Node file adapter suppresses watch events for its own writes, so the open tab does not reload after a save the app made itself. MCP writes go through the same adapter, so they would be silently invisible to the tab. Milestone 3 fixes this by broadcasting agent writes explicitly. It is called out here because it would look like a working feature in tests and fail in use.

Connection comes after the tools are proven. Milestone 1 uses a hand-copied address and key, and milestone 2 adds the discovery file and the `exploreda mcp` relay. Data kickoff, URL fetch included, comes after the editing tools, because adding data is only useful once the agent can act on it. Each milestone leaves `npx exploreda` working unchanged for anyone who never connects an agent.

## Implementation strategy

- **First proof:** a cold agent connected to `/mcp` on a running `exploreda --example` builds a dashboard from the shop data using only tool results.
- **Primary seam:** `src/mcp/tools.ts`, which holds tool functions over `ProjectFiles` that return structured results. The MCP endpoint, the relay, and the `exploreda-dsl` printer all call it.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/mcp` runs the tools against `memoryProjectFiles`. `pnpm --filter app dev` with `EXPLOREDA_FOLDER` serves `/mcp` through the Vite middleware.
- **Local dependencies:** `memoryProjectFiles` with `editOutside` and `refuse` for conflict and refusal cases, a local HTTP fixture server for URL fetch, and temp directories for the Node adapter and `server.json`.
- **Live confirmation:** a real agent session (Claude Code) against the packed tarball, and an MCP round trip added to `cli-smoke.yml` on all three operating systems.
- **Rollout and rollback:** the endpoint answers only with the run's key. If no agent connects, nothing loads. Withdraw the feature by removing the `/mcp` route and the `mcp` subcommand; projects and the app are unaffected.

### Material dependency proof strategy

The MCP protocol is the one external contract. Agents differ in how strictly they follow it.

```text
tool functions over memoryProjectFiles (M1)
    → /mcp JSON-RPC handler tested in-process (M1)
    → one real agent over HTTP with a pasted key (M1 proof)
    → stdio relay with a real agent and a fixed config line (M2)
    → packed-tarball MCP round trip on three OSes (M5)
```

## Milestone 1: A cold agent builds a dashboard through four tools

This answers the shape's main question with the least code. It excludes discovery, conflict guards, rename and delete, and data upload. The shop example already has data.

- **Change — shared tool module `src/mcp/tools.ts`**
  - `check({ path?, text })`, `fields({ source? })`, `reference({ chartType? })`, and `writeEda({ path, text })`. Each takes a `ProjectFiles` and returns JSON: views, chart counts, and problems with `line`, `column`, `severity`, `message`, and `fix`.
  - `check` builds the text against the project's data through `readProjectFolder`, with the given text swapped in for that path, and writes nothing.
  - `writeEda` saves and then returns the same result as `check`.
  - `exploredaDsl.ts` is refactored to print from these functions. Its existing output and exit codes are unchanged, and its tests still pass.
- **Change — the checker bundle:** a fourth tsup entry, `dist/cli/exploreda-tools.js`, that bundles the chart definitions and exports the tool module. The `exploreda` bin dynamic-imports it on the first `/mcp` call. A test asserts that the `exploreda` bundle contains no chart code.
- **Change — `/mcp` route in `src/server/handler.ts`:** Streamable HTTP on the same port, behind the same `Host` and token checks. It answers `initialize`, `tools/list`, and `tools/call` with JSON responses.
- **Spike — SDK or a small hand-written handler**
  - Decision required: bundle `@modelcontextprotocol/sdk`, or write the four JSON-RPC methods directly.
  - Evidence to gather: the bundled size added to the `exploreda` bin, and whether Claude Code and one other client accept a JSON-only (non-SSE) response. Check the current Streamable HTTP spec and the SDK's Node transport against `node:http`.
  - Fallback: the hand-written handler. The server already avoids runtime dependencies.
- **Change — the cold-agent run:** connect Claude Code with `claude mcp add --transport http` and the printed key. Ask it for a returns dashboard on the shop orders. Record the transcript, the number of check-fix rounds, and every problem whose `fix` did not help, in `raw/proof/`.
- **Docs and example:** none public yet. The proof notes are the record.

### Desired end state

- The tool functions are covered by tests over memory files, including a broken analysis and an unknown chart type.
- `exploreda-dsl check` output is byte-identical to the current output on the demo analyses.
- The proof is recorded with a decision: whole-file writes are enough, or finer edit tools move up into M3.

## Milestone 2: One fixed config line connects any agent

This turns a hand-pasted, per-run key into setup an agent does once.

- **Change — discovery file:** on start, the server writes `.exploreda/server.json` with the port, key, process ID, and version. It also writes a `.exploreda/.gitignore` that ignores `server.json`, and it removes `server.json` on a clean shutdown. The app's file list and the folder codec skip `server.json`.
- **Change — `exploreda mcp [folder]`:** a stdio MCP server that relays each JSON-RPC message to `/mcp`, using the key from `server.json`. If the file is missing or its process is gone, the relay starts the server in-process with `--no-open` and prints the app link to stderr. On a connection error, it rereads the file once, so a restarted server is picked up.
- **Change — the security check:** `server.json` is created readable by the owner only (0600 on macOS and Linux). A test confirms that a stale key gets 403 and the relay recovers.
- **Docs:** a new section on the `project-folders` docs page (or a new "Agents" page) with the one config line for Claude Code, Cursor, and a generic `mcpServers` JSON block.

### Desired end state

- An agent configured once with `exploreda mcp` keeps working across `exploreda` restarts and port changes.
- With no server running, the agent's first call starts one, and the person can open the printed link.
- Neither `git status` nor the app's file list shows `server.json`.

## Milestone 3: The agent edits a project the way a person does

This completes the "saved state via files" scope and makes agent writes visible in the open tab.

- **Change — editing tools:** `project` (layout, sources, analyses, and data files), `read_eda` (text plus a `version` content hash), `rename_eda`, `delete_eda`, `format`, and `describe` (every view's charts, row counts, and problems, as `exploreda-dsl project --json` reports them, without the tables).
- **Change — stale-write guard:** `write_eda`, `rename_eda`, and `delete_eda` take the `version` from `read_eda`. A mismatch is refused with the current version and a short instruction to read the file again. A new file needs no version, and writing an existing path without one is refused.
- **Change — live tab updates:** writes made through MCP call the handler's `broadcast` directly, because the Node adapter's echo suppression hides them. A test with two event-stream listeners confirms the tab sees the change.
- **Change — project text from the agent:** writing `exploreda.eda`, or `.exploreda/project.eda` in the hidden layout, follows the app's first-save rules. A test covers an empty folder followed by one write.
- **Spike — finer edit tools (only if M1 says so)**
  - Decision required: whether `add_chart` and `set_setting` ship here.
  - Evidence to gather: the M1 problems list.
  - Fallback: whole-file writes only. Finer tools go below the cut line.
- **Docs and example:** a tool reference table on the Agents docs section. Each row gives a tool, its inputs, and an example result.

### Desired end state

- An agent writes an analysis and the open tab shows it within about a second. The screenshots cover wide, intermediate, and narrow widths.
- A person's edit between the agent's read and its write makes that write fail, and the person's edit stays on disk.
- `git diff` after an agent session shows only `.eda` and data changes.

## Milestone 4: The agent starts a project from data

This adds the kickoff half of the intent: local files, inline rows, and URLs.

- **Change — `add_data` tool:** one of `from` (an absolute local path, copied into the folder), `rows` (CSV text or a JSON array, written as a file), or `url` (fetched). It takes a target `path` inside the folder and returns the result of `fields` for the new file.
- **Change — URL fetch:** Node `fetch`, `http` and `https` only, with a size limit matching the project's limit of about 100 MB. CSV or JSON is checked by content type or by parsing. Redirects are capped. The project text records the address as a comment on the source line, for example `# fetched from <url> on <date>`. This proposal needs no grammar change.
- **Change — tests:** a local fixture HTTP server covering an oversized response, an HTML page, a redirect loop, and a slow response with a timeout.
- **Docs and example:** an Agents docs section on starting a project, plus a short example session that goes from a CSV URL to a dashboard.

### Desired end state

- From an empty folder, an agent adds a CSV by URL, writes an analysis, and the tab shows working views.
- Refusals name the reason (size, type, or network) and leave no partial file.

## Milestone 5: Launch-ready

- **Change — three-OS smoke:** `cli-smoke.yml` runs `exploreda mcp --example` from the packed tarball. It sends `initialize` and `tools/call check` over stdio and asserts a complete result.
- **Change — a real agent session** against the tarball, recorded as the docs example. The cold-agent run from M1 is repeated with every tool, and its round count is compared.
- **Change — docs and README:** the Agents page is finished, linked from the README quickstart and from `exploreda --help`. The startup banner mentions `exploreda mcp`.
- **Change — changeset:** `minor`, for example: "Agents can now connect to a project with `exploreda mcp` to add data, write and check analyses, and see the results in the open app."

### Desired end state

- The smoke run is green on macOS, Linux, and Windows.
- The docs and the README tell a new user how to connect an agent in one step.

## Open decisions and spikes

- **SDK or hand-written handler (M1):** decided by bundle size and client compatibility, with the hand-written handler as the fallback.
- **Finer edit tools (M3):** decided by the M1 proof's problem list, with whole-file writes only as the fallback.

## Below the cut line

- Chart images for the agent. These are important, and they are the main trigger for [headless chart rendering](../headless-chart-rendering/intent-brief.md).
- Live tab control: active view, selection, and hover.
- Database sources through MCP, after `database-adapters` lands.
- MCP for the demo or the self-hosted server.
- Progress notifications, resources, and prompts. At launch, MCP offers tools only.
