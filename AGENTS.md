# explorEDA working rules

- Keep this existing React library and demo in React and TypeScript.
- Use pnpm. Run `pnpm check` after a broad change.
- Read [UI defaults](docs/ui-defaults.md) before changing controls, tables, overlays, or field details.
- Use `--border` for neutral borders, `--input` for inputs, and semantic tokens for status borders.
- Never add a `title` attribute or SVG `<title>` element to rendered UI. Both create native hover tooltips.
- Use `aria-label` or visible text for accessible names. Use `ActionTooltip` or the `Button` `tooltip` prop only when hover help is needed.
- Give every control whose effect is not obvious from its visible text a real tooltip that explains it: toggles, short or abbreviated labels, icon buttons, and options that differ subtly, such as Core and Full. Use `ActionTooltip` or the `Button` `tooltip` prop so it opens on hover and keyboard focus. Never fall back to a `title` attribute.
- Run `pnpm check:ui`; it rejects native tooltip sources in TSX.
- Keep user-facing copy about the product. Put internal caveats, release gaps, known bugs, and to-dos in a `.tickets/` ticket or GitHub issue, not on the page, in the UI, or in example comments. Default to tickets unless user says otherwise.
- Keep field names and filter state visible. Put optional actions beside or below the content.
- Prefer compact nonmodal popovers for inspection and settings. Keep the data visible during edits.
- Start new imports with summary and rows. Preserve saved layouts.
- Quick previews must not create charts or change the saved layout.
- Use the shared `FieldMetadata` component in field lists and pickers.
- Verify changed flows in the browser at wide, intermediate, and narrow widths.
- Keep existing user edits. Do not commit on `main` without an explicit request.

## Changesets

- Every PR that changes what `exploreda` users get (anything under `packages/explorEDA` except tests, or its build output) includes a changeset. Write it yourself; nobody adds them later.
- Run `pnpm changeset:add <patch|minor|major> "summary"`. It writes `.changeset/<slug>.md` without prompts. Do not run the interactive `pnpm changeset`.
- Pick `patch` for fixes and polish, `minor` for new features or options, and `major` only when Byron asks for a breaking release. While the version is 0.x, a breaking API change is `minor`.
- Write the summary for package users: what they can now do or what now behaves differently, in one or two plain sentences. It goes straight into the changelog.
- One changeset per PR is usual. Edit it when the PR's scope changes instead of adding another.
- Skip it for demo-only, docs-only, test-only, or tooling-only PRs.
- Never run `changeset version` or `changeset publish`, and never edit versions or `CHANGELOG.md` by hand. The Release workflow does that through the "Version Packages" PR.
- Follow [the release steps](README.md#release). Use `release.yml` on `main` with npm trusted publishing. Do not add `NPM_TOKEN`.
- Run release checks on Node 24. Preserve Node's `AbortController` and `AbortSignal` in the demo test environment.
- Confirm the npm version, `latest` tag, provenance, and GitHub release after publishing. Check npm before retrying a partial failure.
