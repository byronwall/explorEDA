# Coding standards

Check a diff against these before opening a PR, and when reviewing one. `pnpm check:ui` already enforces the mechanical ones (marked _checked_); the rest are judgement calls. [UI defaults](docs/ui-defaults.md) has the detail behind each UI rule, and the [agent guide](docs/agent-guide.md) has the map and commands.

## UI

- **Borders:** `--border` for neutral borders, `--input` for inputs, semantic tokens for status borders. _Checked._
- **No native tooltips:** never a `title` attribute or SVG `<title>` element in rendered UI. _Checked._
- **Accessible names** come from `aria-label` or visible text, not hover text.
- **Real tooltips** go on every control whose effect is not obvious from its visible text: toggles, short or abbreviated labels, icon buttons, and options that differ subtly, such as Core and Full. Use `ActionTooltip` or the `Button` `tooltip` prop, so it opens on hover and keyboard focus.
- **No Inspect buttons on charts or cards** (Inspect records, Inspect point, Inspect bar). Records are reached by Alt-click or Alt-Enter on a mark, or the trace control in the chart header. _Checked for mark-level labels._
- **Chart clicks:** a click on a mark selects it; a click on empty plot space clears that chart's filters. Marginals, legends, and overlays use the main marks' color encoding and visual treatment.
- **Keep data and state visible:** field names and filter state stay on screen. Optional actions sit beside or below the content. Inspection and settings use compact nonmodal popovers, so the data stays visible during edits.
- **Field lists and pickers** use the shared `FieldMetadata` component.
- **Imports** start with summary and rows. Saved layouts are preserved.
- **Quick previews** never create charts or change the saved layout.

## Copy

- User-facing copy is about the product. Internal caveats, release gaps, known bugs, and to-dos go in the owning intent doc under `docs/intent/` or a GitHub issue, not on the page, in the UI, or in example comments.

## Data

- Raw row values are read only through `src/lib/valueParsing.ts`. No `Date.parse`, `new Date(text)`, or `Number(value)` on row data. _`Date.parse` is checked._

## Settings and state

- **Never change settings in place.** Make a new object for the part you change: `{ ...chart, xAxis: { ...chart.xAxis, grid: true } }`. The defaults in `src/utils/defaultSettings.ts` are frozen, and a new chart shares their nested objects, so an in-place edit throws.
- **Chart settings change through `updateChart`**, the one write path in `DataLayerProvider`. A continuous edit, such as typing or dragging, goes through `useChartEdit` or `holdStateChanges`, so it is one undo step.
- **A shared constant holds no mutable state.** An object or array that many callers spread or read is frozen, or every caller gets a fresh copy.

## Code that runs per row or per value

Rows reach 27,000 and more, and a table or axis formats every value it shows. In these paths:

- **Do per-step work once, outside the loop:** field ids, lookups, parsed expressions, `fieldGetter` calls, and regular expressions. A chart's filter function calls `fieldGetter` before it returns the row test.
- **Touch only the fields you need.** Don't copy a whole row into a `Map` or a new object to read two fields.
- **Reuse `Intl` formatters.** Making an `Intl.NumberFormat` or `Intl.DateTimeFormat` costs far more than using one. Go through `formatFieldValue`, which caches them by options, or keep one at module level.
- **Measure before and after.** Profile a hot path ([Performance checks](docs/performance-checks.md), or `--cpu-prof` for a test) and put the numbers in the PR.

## Tests

- **Few tests, each protecting behavior.** Test what a user or caller can see. Don't write a test that only repeats the implementation or its internal structure.
- **The file extension picks the environment.** A `.test.ts` file runs in Node with no DOM; a test that needs the DOM is a `.test.tsx` file, even without JSX.
- **A test never changes shared state in place:** module-level objects, registered definitions, chart defaults, or globals. In the library's `unit` group, files share modules within a worker, so a leak breaks another file's test. Restore what you patch in `afterEach`.
- **Import the narrowest module.** A test that needs one chart's plan imports that plan, not `registerAllCharts` or the package entry; importing costs more than most tests run.
- **Wait for an event, not a time.** No fixed sleeps. Use `findBy*`, `waitFor`, or the event the code emits. Don't render lazy pages one by one in a loop; see [Where the time goes](docs/agent-guide.md#where-the-time-goes).
- **Time limits come from `@repo/test-config`.** No timeout in a single test or config, and no worker count in a config.
