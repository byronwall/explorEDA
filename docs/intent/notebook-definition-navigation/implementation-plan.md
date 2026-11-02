# Notebook definitions, source and Return

Build a temporary Definitions inspector, source navigation with Return, precise consumer lists, and a searchable outline. Readers can inspect a measure without leaving its output, then visit its source and return.

This is a build plan for review, not approval to implement. Keep React, TypeScript, pnpm and the existing DSL. No new service is needed.

[Original assets and index](assets/pro-results/notebook-definition-design-2026-11-02/README.md) · [Research summary](../../research/notebook-definition-design-2026-11-02/README.md) · [Local decisions and evidence](decisions.md).

## M1 — Inspect definitions beside outputs

Add Definitions to chart headers and make Defines names actionable in mixed and definition-only blocks. Show Uses, accepted inputs and source excerpts in one temporary surface. Preview does not scroll or create Return history.

Extend `lib/dsl/parse.ts`, `compile.ts`, calculation `parser/semantics.ts` and `lib/notebook/compileNotebook.ts`. Retain declarations, reference roles and parser-owned UTF-16 ranges. Add a direct `lib/notebook/navigation.ts` module and `components/notebook/NotebookDefinitionInspector.tsx`. Wire header actions through `ExplorEdaNotebook.tsx` and the chart panel's existing action path.

Use final accepted settings to establish active references. Keep attempted references separate. Inspect live chart settings when source writeback is absent. Show incomplete coverage for unsupported chart adapters. Correct duplicate-calculation diagnostics as a supporting change; preserve existing skip-all behavior.

Proof: the six-block fixture compiles without diagnostics. Resolve `net → gross → revenue → Revenue`. Duplicate calculations produce no accepted provider. Test local filters, optional setting rollback and live field changes. Inspect at 1280, 783 and 390px with keyboard and pointer input. Close restores focus; preview leaves charts and filters unchanged.

Docs: add “Find a plotted field's definition” to `apps/demo/src/docs/pages/notebooks.mdx`. Register one runnable `notebook-definition-navigation` example with the original four rows and six blocks. Start responsive and focus checks here.

Risk: an incomplete extraction can falsely appear complete. Keep an explicit supported-role inventory beside typed chart adapters.

## M2 — Visit source and return safely

Add optional `id=` fence metadata and conservative session block keys. Replace ordinal fallback memory and navigation identity together. Use a small `lib/notebook/memory.ts` module. Retain identity only through unique explicit IDs, accepted local edit mapping, or unique unchanged block text. Duplicate IDs and ambiguous matches get no historical association.

Update parser, compiler, `readNotebook.ts`, renderer, `sheets.ts`, `writeBack.ts`, and source editor. Search all callers. Known host integration includes `apps/app/src/App.tsx` and `ProjectWorkspace.tsx`, which retain memory by notebook path. Update their types and package exports in this same milestone. Keep one coordinated API; the 0.x breaking API change needs a minor changeset.

Go to source reveals readable source. Edit source separately selects a verified current range. Flush pending drafts before unmount, await accepted text, then request the target sheet. Controlled hosts must acknowledge it before focus moves. Close the inspector and release its focus/scroll constraints before focusing the target. Add Return history only after success. Return resolves a logical origin, including after resize. Missing targets use a known surviving parent with an announcement.

Last working source is evaluated with current data. Its captured snippet is separate from the invalid current source. Never select synthetic appended compiler lines in the file.

Proof: insert/reorder blocks without moving fallback to another block. Test duplicate IDs, unknown rename, removed origin, delayed/ignored host acknowledgments and pending drafts. NAV-12 changes the first Revenue to 140: net `[50,60,45,50]`, West 145, all rows 205. These arithmetic values are acceptance targets, not completed navigation tests.

Docs: add “Go to source and return”, “Stable block ids”, “Controlled sheets”, and the memory migration. Extend the same example with editable/read-only source and controlled-host cases.

Risk: mistaken identity can produce a convincing wrong jump. Leave ambiguous targets unavailable.

## M3 — Show consumers, findings and composition paths

Add inverse adjacency and visited-set traversal in `navigation.ts`. Show direct consumers first, then indirect paths. Count each displayed output once. Add finding references through the existing Markdown token pass. Keep records actions separate; never nest buttons in links.

Instrument the typed composition lowerer in `lib/dsl/composition.ts`. Preserve local scale/measure/unit/mark namespaces and retained parts. Containment does not create a value dependency. Add finding metadata beside DSL compilation and `lib/notebook/findings.ts`; wire actions in `NotebookProse.tsx` and `NotebookFindings.tsx`.

Separate eligible and selected populations from chart aggregate values. The metric and bound finding each read their own measure. A chart-binding link supports navigation, not aggregate-value traversal. Keep authored alias routes separate from canonical field reads.

Proof targets: net has four direct consumers, four additional downstream nodes, and three displayed outputs. The unused calculation has none. Metric net→gross changes West 125→250; finding net stays 125. EC20 expects metric 250, selected finding 75, eligible finding 125, own-filter finding 30 and unbound finding 185. Verify those values through actual provider/registry paths before implementation acceptance.

Docs: add “What uses this definition?”, “Findings in prose” and “Composition definitions”. Extend the same runnable example with consumer paths and separate definition/records actions.

Risk: counting a whole block or chart as a value input exaggerates impact. Keep population, value, presentation and navigation relations distinct.

## M4 — Search definitions and headings

Add `NotebookDefinitionOutline.tsx` as another view of the same temporary surface. Search across sheets, headings and definitions. Include unused, invalid and shadowed declarations. Reuse the same index and navigation controller.

Proof: search duplicate headings and definitions across two notebook instances. Show “Unused” only when reference coverage is complete. Complete keyboard, pointer, source/Return and overflow checks at 1280/783/390px, both themes and both layouts. Use actual notebook container width for sections mode. The narrow sheet needs modal focus and scroll control; desktop inspection remains nonmodal.

Docs: add “Find definitions and headings” and “Unused and invalid definitions”. Complete the same example and document return fallbacks.

Risk: permanent dense navigation chrome. Keep one temporary surface. A whole-notebook graph remains Explore.

## Implementation checks

Use targeted compiler, memory and renderer tests; do not create one test per JSON field. Run `pnpm --filter exploreda check-types`. Use `pnpm dev:agent` and `pnpm shot` for browser work. Run docs checks and full `pnpm check` once before each implementation PR. Include a changeset and real UI screenshots for each user-visible library change. The research PR itself changes documentation only.
