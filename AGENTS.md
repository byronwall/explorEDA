# explorEDA working rules

- Start with the [agent guide](docs/agent-guide.md): where code lives, the commands that work, and known traps.
- Keep this existing React library and demo in React and TypeScript.
- Use pnpm. Run `pnpm check` after a broad change; see [Verifying changes](#verifying-changes).
- Read [UI defaults](docs/ui-defaults.md) before changing controls, tables, overlays, or field details.
- Use `--border` for neutral borders, `--input` for inputs, and semantic tokens for status borders.
- Never add a `title` attribute or SVG `<title>` element to rendered UI. Both create native hover tooltips.
- Use `aria-label` or visible text for accessible names. Use `ActionTooltip` or the `Button` `tooltip` prop only when hover help is needed.
- Give every control whose effect is not obvious from its visible text a real tooltip that explains it: toggles, short or abbreviated labels, icon buttons, and options that differ subtly, such as Core and Full. Use `ActionTooltip` or the `Button` `tooltip` prop so it opens on hover and keyboard focus. Never fall back to a `title` attribute.
- Run `pnpm check:ui`; it rejects native tooltip sources in TSX.
- Keep user-facing copy about the product. Put internal caveats, release gaps, known bugs, and to-dos in the owning intent doc under `docs/intent/` or a GitHub issue, not on the page, in the UI, or in example comments.
- Keep field names and filter state visible. Put optional actions beside or below the content.
- Prefer compact nonmodal popovers for inspection and settings. Keep the data visible during edits.
- In charts, a click on a mark selects it and a click on empty plot space clears that chart's filters. Marginals, legends, and overlays use the main marks' color encoding and visual treatment. See [UI defaults](docs/ui-defaults.md).
- Do not put "Inspect" buttons (Inspect records, Inspect point, Inspect bar, and the like) on charts or cards. Reach a chart trace by Alt-click or Alt-Enter on the mark, or from the trace control in the chart header.
- Start new imports with summary and rows. Preserve saved layouts.
- Quick previews must not create charts or change the saved layout.
- Use the shared `FieldMetadata` component in field lists and pickers.
- Verify changed flows in the browser at wide, intermediate, and narrow widths.
- Keep existing user edits. Do not commit on `main` without an explicit request.

## Verifying changes

- The demo dev server and demo tests run the library from source. Do not build the library to see a change; `pnpm --filter demo dev` picks it up. Set `EXPLOREDA_DIST=1` only to try the built package.
- While working, run targeted tests (`pnpm --filter exploreda exec vitest run <files>`) and `pnpm --filter exploreda check-types`.
- Run `pnpm check` once, before opening a PR. It builds the package, so never run it from several worktrees at the same time.

## Pull requests

- Include screenshots in the PR description for every visible fix or UI change.
- Upload them with `gh pr create --attach` or `gh pr edit --attach`. Repeat the flag for each image and add alt text after `#`, as in `--attach 'tmp/shot.png#Rows drawer at 390px'`.
- To place an image beside the change it shows, reference the local file in the body, such as `![alt](./shot.png)`, and attach the same path. `gh` rewrites the reference to the uploaded URL.
- Keep screenshots under `tmp/`. Do not commit them, and do not push them to a separate assets branch.

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
