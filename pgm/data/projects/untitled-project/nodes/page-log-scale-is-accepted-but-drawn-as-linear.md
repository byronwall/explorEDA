---
id: page-log-scale-is-accepted-but-drawn-as-linear
label: Log scale is accepted but drawn as linear
type: page
status: planned
priority: medium
parent: page-axis-limits-on-more-chart-families
metadata:
  purpose: x.scale=log and saved scaleType log silently draw a linear axis.
---
**Bug:** `scale=log` is accepted everywhere but drawn as a linear scale, with no warning.

- Dashboard text accepts it: `x.scale=log`, or the flat path `xAxis.scaleType=log`. The allowed list in `packages/explorEDA/src/lib/dsl/compile.ts` (the `axis` key handler) is `linear, log, symlog, time, band`.
- Saved-data validation accepts it (`isAxis` in `src/utils/saveDataUtils.ts`), and `AxisSettings.scaleType` declares it.
- `numericScale()` in `components/charts/Axis/numericScale.ts` returns symlog for `symlog` and linear for everything else, so `log`, `time`, and `band` all draw linear.
- The Axes tab then shows **Linear** selected and the axis title gets no scale note, so the user can't tell their setting was ignored.
- Only ECDF has a real log option (`logX`, with its own `scaleLog`).

Fix options, decided with the axis-domain-controls initiative (`docs/intent/axis-domain-controls/intent-brief.md`, which says not to map log to symlog silently and to report nonpositive values):

1. **Short term:** reject `log` (and `time`/`band` on numeric axes) in dashboard text with a diagnostic that suggests `symlog`. On restore, map the saved value to linear and report it, rather than storing a setting no chart honors.
2. **Real support:** implement a true log scale in `numericScale`. Values ≤ 0 need an explicit omission or rejection policy, and excluded rows must stay visible in traces. Offer it in the Axes tab beside Linear and Symlog, and make `axisDrag.ts` move log axes in log space, as it does for symlog.

Done when no saved or typed scale is silently replaced by another.

Found while correcting docs in #209, which also changed the docs' `xAxis.scaleType=log` examples to `symlog`.

