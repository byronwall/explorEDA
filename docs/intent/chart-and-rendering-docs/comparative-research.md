# Chart documentation research — 2026-09-23

| System | Useful documentation pattern | Decision for explorEDA |
| --- | --- | --- |
| [Nivo bar page](https://nivo.rocks/bar/) | One chart page combines a live chart, code/data view, property search, grouped controls, action logs, recipes, and rendering variants. | Start each page with an example and concise field, interaction, and setting guidance. Link deeper recipes later. Do not build a general property playground first. |
| [ECharts handbook](https://echarts.apache.org/handbook/en/get-started/) and [pie guide](https://echarts.apache.org/handbook/en/how-to/chart-types/pie/basic-pie/) | A short first chart lesson sits beside chart-specific guides and a separate configuration reference. | Separate task guidance from complete option details. Give a runnable path before listing settings. |
| [dc.js examples](https://dc-js.github.io/dc.js/examples/) | Small examples cover chart types and specific linked-filter behaviors. Its [filter docs](https://dc-js.github.io/dc.js/docs/html/filters.html) explain shared semantics. | Keep chart pages concrete; explain cross-chart filter scope once in the rendering/system guide and link back. |
| [Vega-Lite gallery](https://vega.github.io/vega-lite/examples/) and [spec overview](https://vega.github.io/vega-lite/docs/) | Gallery entries are grouped by visual task; the spec reference explains the common model. | Offer a chart index by analytical task, plus one shared guide to data flow, rendering, settings, and filters. |
| [Observable Plot marks](https://observablehq.com/plot/features/marks) | Mark documentation explains composition separately from examples. | Explain current chart composition and rendering boundaries without implying explorEDA has a general mark grammar. |

## Content standard

Each chart page should answer: **When should I use it? What fields does it need? What does it compute? What can I select? How do other filters affect it? What settings matter? What are its limits?** Include one screenshot or live example, an exact demo link, and the public integration boundary where relevant. The shared rendering guide should explain source rows → effective fields → filter scopes → chart data and settings → drawing/interaction → saved configuration. Name SVG, Canvas, Three.js, and tables only where current code uses them.

The current [feature inventory](../../application-feature-inventory.md) is a strong source draft. It is long, internal, and partly time-sensitive. Use it to seed pages, then check each statement against the running example and current implementation. The [traceability inventory](../../application-feature-inventory.md#traceability-and-reproducibility) records scatter and bar paths. Do not present them as a finished general renderer.
