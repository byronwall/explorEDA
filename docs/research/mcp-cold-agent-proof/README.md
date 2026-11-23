# MCP cold-agent proof (2026-11-22)

These runs proved the MCP server in `packages/explorEDA/src/mcp/`. Runs 1 and 2 used milestone 1's four tools over HTTP. Runs 3 and 4 used every tool through `exploreda mcp` from the packed tarball. Agent docs: [Agents](../../../apps/demo/src/docs/pages/agents.mdx).

## Milestone 1 (runs 1 and 2)

The question: can an agent with no explorEDA docs build a dashboard from tool results alone?

## Setup

- `node packages/explorEDA/dist/cli/exploreda.js --example --no-open --port 4939`, built from this branch. It copies the shop example and serves `/mcp`.
- A Claude Code agent (`claude -p`, model `claude-fable-5-2`), started in an empty folder with only the exploreda MCP server:

  ```sh
  claude -p "$(cat prompt.txt)" --mcp-config mcp.json --strict-mcp-config \
    --tools "" --allowedTools mcp__exploreda --setting-sources "" \
    --output-format stream-json --verbose
  ```

  `mcp.json` is `{"mcpServers":{"exploreda":{"type":"http","url":"http://127.0.0.1:4939/mcp","headers":{"Authorization":"Bearer <key>"}}}}`, with the key from the printed link.

- `--tools ""` removes every built-in tool, so the agent could not read files or the repository. `--setting-sources ""` skips every CLAUDE.md.

Claude Code accepted the JSON-only responses (no server-sent stream) and listed all five tools.

## Results

| Run                      | Request                                                                                              | Calls | Check-and-fix rounds                                       | Outcome                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| [1](run-1-transcript.md) | Orders overview: revenue by channel and region, orders over time, order sizes                        | 3     | 0. The first `write_eda` came back complete.               | 8 charts, complete                                               |
| [2](run-2-transcript.md) | Product mix across items and orders, a top-N list, a "large order" share per channel, and a notebook | 23    | 6 for the dashboard (5 checks, 1 save), 2 for the notebook | 6 charts + a 1-chart notebook, both complete; 3 feedback reports |

The saved files are in [output/](output/). The app, opened after the runs, listed and built every saved file. Live reload of the open tab was not checked here; that is M3. Screenshots are in the PR.

## Problems whose fix did not help (run 2)

1. **Definitions are checked against every view's query.** An analysis whose views chart two queries can't hold a `calc` or `group` that only one query can resolve. The fixes pointed at the other query ("Did you mean order.channel?"), so fixing one view broke the other. The agent moved the rate chart to the notebook, where each block's query is separate.
2. **"The calculations could not run: Unknown field: orders.amount"** was reported at 1:1 with no fix.
3. **"group needs by=, and a field to measure"** gave an example the agent had already followed; the real cause was problem 1.
4. **"spec.upper=100 bins.mode=width … doesn't fit histogram"** gave no fix, though `reference bar` lists each setting. Other "doesn't fit" warnings (`direction=`, `share=`) don't list the accepted values.
5. **"pivot is missing a required setting"** doesn't name the setting.

"Complete" didn't mean readable. In the app, run 2's dashboard has two cards titled "Composition", a small category chart, and customer bars with no names. `check` can't see layout, so this supports chart images for agents ([headless chart rendering](../../intent/headless-chart-rendering/intent-brief.md)).

The agent also wanted computed values (a group's rows or a metric) to write prose that cites numbers and to confirm a rate.

The agent's own reports of these problems are in [output/feedback/](output/feedback/), written through `submit_feedback`.

## Decision

Whole-file writes are enough. Neither run stalled on DSL syntax: run 1 needed no fixes, and run 2's extra rounds came from checker semantics and message quality, not from writing whole files. Finer edit tools (`add_chart`, `set_setting`) stay below the cut line for M3.

Before or with M3, work on the checker's messages instead:

- Give every "doesn't fit" and "missing a required setting" problem a fix that names the accepted values or the missing setting.
- Scope definitions to the view's query, or say plainly why a shared definition fails, at its real line.
- Consider a small value preview (each group's first rows, each metric's value) in `check` results. This is closer to `describe` in M3 than to chart images.

## Launch (runs 3 and 4)

Both agents connected with one config line, `node <tarball>/dist/cli/exploreda.js mcp <folder>`, with no other tools.

| Run                      | Request                                                                     | Calls                                                   | Check-and-fix rounds                               | Outcome                                        |
| ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------- |
| [3](run-3-transcript.md) | An empty folder: fetch the shop orders CSV by URL, then an orders dashboard | 6 (`add_data`, `reference` ×3, `write_eda`, `describe`) | 0                                                  | 6 charts, complete in 15 s                     |
| [4](run-4-transcript.md) | Run 2's request again, with every tool                                      | 25                                                      | 5 for the dashboard (run 2: 6), 1 for the notebook | Both complete in 2 min 20 s; 1 feedback report |

- In run 3, an app tab that was open on the empty folder before the agent started showed the dashboard without a reload.
- In run 4, the agent changed `exploreda.eda` with the version from `read_eda` to test an idea, then restored it. The final file matched the original byte for byte.
- The first try at these runs stalled for 40 minutes. `write_eda` of a new file failed in the packed command, because the command and the tools bundle each had their own copy of the file error class. The reply had no request ID, so the agent's client waited for its own 30-minute timeout. The fix answers every failure as the call's tool error, and the relay stops a call after two minutes. The CLI smoke now saves a new file over stdio.
- Run 4 again hit the main gap from run 2: alias, calc, and group lines reach every view, so one file can't hold definitions for views on two queries. Its messages now name that rule. Scoping definitions per view is not built.
- Run 3 found that `describe` named charts by internal type (`bar` for `hist`). It now uses the word the text starts the chart with.

The run 4 files and feedback report are in [output-m5/](output-m5/).
