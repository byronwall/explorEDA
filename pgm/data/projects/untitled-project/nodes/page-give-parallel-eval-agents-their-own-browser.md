---
id: page-give-parallel-eval-agents-their-own-browser
label: Give parallel eval agents their own browser
type: page
status: needs-review
parent: area-eval-process
metadata:
  implementation: "The db-ux-eval skill (PR #609) limits runs to 2 browser agents at a time and the brief tells agents to report a tabs_create failure. Separate browser contexts per agent are not built."
  purpose: Tasks 7 and 8 lost their tab to another agent and hit the tab cap. Limit to 2 browser agents, or give each a separate Playwright context.
---
