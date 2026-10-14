# Coding standards

Check a diff against these before opening a PR, and when reviewing one. `pnpm check:ui` already enforces the mechanical ones (marked _checked_); the rest are judgement calls. [UI defaults](docs/ui-defaults.md) has the detail behind each UI rule.

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

## Tests

- Time limits come from `@repo/test-config`. No timeout in a single test or config.
