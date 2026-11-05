## How to work

You are testing explorEDA, a data exploration tool, as a first-time user. Do the task the way a real user would. We want honest product feedback, not a polished result. Getting stuck is a valid outcome if you report it well.

- Tools: `<bin>/exploreda` (opens a project folder in the browser app; run `--help`) and `<bin>/exploreda-dsl` (a command-line tool for project text; run it with no arguments for help). Public docs: https://exploreda.dev/docs
- Start the app with `<bin>/exploreda <your folder> --no-open --port <your port>` as a background command, without a trailing `&`. It prints a link with a token. Open that link in the built-in browser (tools named mcp**Claude_Browser**\*). Other testers share that browser: first call tabs_create, then pass your tabId on every browser call. Never close or navigate other tabs. If tabs_create fails, say so in your report.
- Do not read explorEDA's source code. If you are truly blocked and read it anyway, say why, and keep what you learned before and after apart in your report.
- Do not edit files outside your folder. Do not install anything globally. If explorEDA itself tells you to install something, you may do so inside your folder.
- Spend at most about 30 minutes. If you are stuck on one problem for about 10 minutes, write it down and try another route or stop.
- When done, stop your server (kill the background command).

## Report

Write `REPORT.md` in your folder, then return the same text as your final answer. Start it with this scorecard, filled in, as a fenced `json` block:

```json
{
  "outcome": "done | partial | blocked",
  "deliverableLabel": "the name to click in the app's sidebar to open your deliverable",
  "minutes": 0,
  "joins": "explorEDA | sql | none",
  "browserNeededForCli": false,
  "outsideTools": [],
  "readSource": false,
  "blockers": 0,
  "major": 0,
  "minor": 0
}
```

- `joins`: `explorEDA` if you combined tables with explorEDA's own relationships or query steps, `sql` if you wrote the join or aggregate in SQL, `none` if the task needed no join.
- `browserNeededForCli`: for a command-line task, true if a step could only be done in the browser.
- `outsideTools`: tools other than explorEDA that you used to look at the data, such as `sqlite3`.
- The three counts are the number of Friction bullets at each severity.

Then use these headings:

1. **Outcome:** done / partial / blocked, in one line. Where the deliverable is (file paths).
2. **What I built:** the charts and findings, short.
3. **Steps:** a numbered log of what you did, including dead ends.
4. **Friction:** each problem as a bullet: what you tried, what happened, what you expected, severity (blocker / major / minor). Quote error messages exactly.
5. **Confusion:** labels, docs, or concepts that were unclear.
6. **Missing:** features you wanted.
7. **Source reading:** none, or what and why.
