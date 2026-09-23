# explorEDA working rules

- Keep this existing React library and demo in React and TypeScript.
- Use pnpm. Run `pnpm check` after a broad change.
- Read [UI defaults](docs/ui-defaults.md) before changing controls, tables, overlays, or field details.
- Use `--border` for neutral borders, `--input` for inputs, and semantic tokens for status borders.
- Never add a `title` attribute or SVG `<title>` element to rendered UI. Both create native hover tooltips.
- Use `aria-label` or visible text for accessible names. Use `ActionTooltip` or the `Button` `tooltip` prop only when hover help is needed.
- Run `pnpm check:ui`; it rejects native tooltip sources in TSX.
- Keep field names and filter state visible. Put optional actions beside or below the content.
- Prefer compact nonmodal popovers for inspection and settings. Keep the data visible during edits.
- Start new imports with summary and rows. Preserve saved layouts.
- Quick previews must not create charts or change the saved layout.
- Use the shared `FieldMetadata` component in field lists and pickers.
- Verify changed flows in the browser at wide, intermediate, and narrow widths.
- Keep existing user edits. Do not commit on `main` without an explicit request.
