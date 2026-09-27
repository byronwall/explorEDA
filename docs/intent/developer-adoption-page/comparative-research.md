# Landing page research — 2026-09-23

This review looks at presentation patterns, not feature parity. These sites serve different products. Their claims do not establish explorEDA capabilities.

| System | Useful pattern | What explorEDA should take | Limit of comparison |
| --- | --- | --- | --- |
| [dc.js](https://dc-js.github.io/dc.js/) | Its home page opens with a real linked dataset, questions to ask, per-chart reset, a selected-record count, and reset all. | Lead with one question and one observable filter → other views → records sequence. Show reset in the same flow. | Linked filtering itself is already dc.js territory. Claim the workspace around it only when demonstrated. |
| [Nivo](https://nivo.rocks/) | Its first screen identifies the React/D3 product and uses chart variety as visual evidence. | State “React analysis workspace” early and show real chart output. | A wall of chart thumbnails would hide explorEDA's linked workflow. |
| [Apache ECharts](https://echarts.apache.org/en/index.html) | A clear product category, demo route, and grouped capability statements make the entry scannable. | Keep one primary try action and a clear path into the wider examples. | ECharts' scale and rendering claims are its own; do not borrow them. |
| [Vega-Lite gallery](https://vega.github.io/vega-lite/examples/) | Examples are grouped by chart task and interaction, with an explicit route to embedding guidance. | Link from the landing proof to chart-specific learning and integration. | The gallery's spec-first model differs from explorEDA's saved workspace settings. |

## Recommendation

Build the page around a single cause-and-effect proof: choose a channel in the existing order workspace, see coordinated views and matching rows change, then reset. Follow with two short paths: **Explore your data** and **Embed in React**. Show chart breadth as a small set of labeled previews or example links below that proof. Use the existing example and screenshots from the actual UI; do not add a second chart implementation to the landing page.

The old [developer adoption plan](implementation-plan.md) already captures the content order. The new work adds visual hierarchy, preview choice, responsive composition, and a link to the chart docs. The featured gesture and integration sample still need runtime verification before their copy is final.

## Claims to verify before writing copy

- The selected order example exposes the named channel action, coordinated change, record inspection, and a reliable reset.
- The displayed integration snippet mounts the public component. Its short form does not recreate the configured order dashboard.
- Any claim about performance, support, or renderer choice comes from current code and a measured or documented boundary.
