# explorEDA working rules

- Keep this existing React library and demo in React and TypeScript.
- Use pnpm. Run `pnpm check` after a broad change.
- Read [UI defaults](docs/ui-defaults.md) before changing controls, tables, overlays, or field details.
- Use `--border` for neutral borders, `--input` for inputs, and semantic tokens for status borders.
- Do not add native `title` tooltips. Use `ActionTooltip` or the `Button` `tooltip` prop for important actions.
- Keep field names and filter state visible. Put optional actions beside or below the content.
- Prefer compact nonmodal popovers for inspection and settings. Keep the data visible during edits.
- Start new imports with summary and rows. Preserve saved layouts.
- Quick previews must not create charts or change the saved layout.
- Use the shared `FieldMetadata` component in field lists and pickers.
- Verify changed flows in the browser at wide, intermediate, and narrow widths.
- Keep existing user edits. Do not commit on `main` without an explicit request.
