# M1 cold-agent proof (2026-11-22)

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

The agent also wanted computed values (a group's rows or a metric) to write prose that cites numbers and to confirm a rate.

The agent's own reports of these problems are in [output/feedback/](output/feedback/), written through `submit_feedback`.

## Decision

Whole-file writes are enough. Neither run stalled on DSL syntax: run 1 needed no fixes, and run 2's extra rounds came from checker semantics and message quality, not from writing whole files. Finer edit tools (`add_chart`, `set_setting`) stay below the cut line for M3.

Before or with M3, work on the checker's messages instead:

- Give every "doesn't fit" and "missing a required setting" problem a fix that names the accepted values or the missing setting.
- Scope definitions to the view's query, or say plainly why a shared definition fails, at its real line.
- Consider a small value preview (each group's first rows, each metric's value) in `check` results. This is closer to `describe` in M3 than to chart images.
