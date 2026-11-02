# Notebook definition navigation — recommendation dispositions

**Decision:** build the capability in M1–M4 of [implementation-plan.md](implementation-plan.md). All entries below are design recommendations against baseline `d3920a285f3755a8324998775deb131747e959f5`, not implemented changes. Stable ids are intended for Codex review and integration. The user request supplies demand; no entry imposes an outside-demand gate.

**Disposition meanings:** Build enters the proposed implementation; Explore is useful optional investigation after the core path is useful; Defer is deliberately outside this delivery; Avoid is a rejected implementation or interaction approach.

## Build

### NDN-01 — Inline entry points and one focused inspector

**Disposition: Build · M1 entry points/Uses; M3 Used by**

Add a chart-header Definitions action, actionable Defines names in chartless and mixed blocks, and one temporary inspector with Uses/Used by. Keep source movement explicit. This makes an output's origin discoverable while preserving the notebook's reading surface and existing plot gestures.

- Acceptance: net-total → net → gross → revenue → Revenue can be explored without changing filters, sheets or return-history depth.
- Basis: `ExplorEdaNotebook.tsx::NotebookBlockView` currently shows only plain Defines text in its chartless early-return branch; [Observable classic minimap](https://observablehq.github.io/documentation/debugging/minimap) and [marimo dataflow](https://docs.marimo.io/guides/editor_features/dataflow/) support focused dependency exploration as precedents.
- Risk: excessive inline chrome. Keep the chart action compact and the relationship detail in the temporary surface.

### NDN-02 — Retain semantic metadata in the existing compiler

**Disposition: Build · M1, completed M3**

Expose declarations, typed reference occurrences, accepted bindings, source origins and dependency projections on `NotebookCompileResult.navigation`. Extend existing parse/semantics/lowering paths; do not infer bindings from strings in rendered output.

- Acceptance: exact alias/canonical paths, forward references, filter roles and source ranges match the fixture contract.
- Basis: `compile.ts` already owns alias maps, parsed calculation dependencies and `resolveField`; `parse.ts` owns the source tokens; `semantics.ts::getDependencies` owns formula semantics.
- Risk: item spans and ignored settings are lost before metadata capture. Capture early, commit effective records only after acceptance.

### NDN-03 — Final accepted settings are the effective truth

**Disposition: Build · M1/M3**

Separate attempted/ignored references from effective edges. Join metadata to final `settings.charts`, successful calculations/findings and retained composition parts. The graph must not resurrect rejected outputs.

- Acceptance: a failed local filter, rolled-back optional setting and dropped composition mark have no ordinary active consumer edge.
- Basis: `compile.ts` can roll back path settings and clear final charts after validation; composition lowering can retain only part of the source.
- Risk: build-summary arrays look authoritative but can disagree with accepted settings.

### NDN-04 — Distinguish current output from authored source

**Disposition: Build · M1**

Resolve current supported chart inputs from accepted DataLayer settings with the same typed resolver. A runtime-only setting can point to a source definition without pretending that the setting itself was written in the notebook. Show “Changed on this page” when appropriate.

- Acceptance: a source-read-only chart changed from net to gross shows current measure gross and value 250; its source remains `sum(net)`.
- Basis: `ExplorEdaNotebookProps.onTextChange` and `handleStateChange` permit chart changes without source writeback; `NotebookBlockView` draws live settings.
- Risk: stale source metadata misidentifies the plotted measure. Unsupported external chart adapters must show incomplete coverage explicitly.

### NDN-05 — Separate population dependencies from chart values

**Disposition: Build · M1 population foundation; M3 findings**

Represent chart eligible/selected populations as small metadata endpoints. A bound finding consumes a population and its own measure. Keep chart-binding navigation separate from value-impact traversal.

- Acceptance: changing net-total's aggregate net→gross changes 125→250, while the net finding remains 125. In notebook mode the card consumes eligible rows; its selected finding additionally applies the card's selection.
- Basis: `findings.ts::evaluateFinding`; exact-ref `chartPopulation.ts`, `MetricCard/definition.ts`, `MetricCard.tsx`, and `CrossfilterWrapper.ts`.
- Risk: an untyped chart→finding edge creates false transitive consumers.

### NDN-06 — Optional authored block IDs with conservative session mapping

**Disposition: Build · M2**

Capture optional `id=` in EDA fence information. Give unannotated blocks opaque session identity only through a known edit map or a unique unchanged-text match. Duplicate ids invalidate stable matching for both occurrences.

- Acceptance: moving `id=net` preserves its source/fallback association; ambiguous duplicated unkeyed blocks receive no guessed relocation.
- Basis: baseline `parseNotebook` exposes ordinal/line positions only. [Notebook Kit](https://observablehq.github.io/notebook-kit/kit) and [nbformat](https://nbformat.readthedocs.io/en/latest/format_description.html#cell-ids) provide identity precedents.
- Risk: users may assume any source edit preserves identity. Document the explicit-id and session limits.

### NDN-07 — Key fallback memory and navigation together

**Disposition: Build · M2**

Replace ordinal `lastValid` once with `memory?: MutableRefObject<NotebookMemory>` and `createNotebookMemory(documentKey)`. Migrate real call sites together. Store captured source and its location provenance with the block key.

- Acceptance: inserted/reordered fences never make one block display another block's remembered source. A document switch clears history, pending requests and fallback associations.
- Basis: `useNotebookResult` and `NotebookCompileOptions.lastValid` use current block indices; `compileNotebook::build` appends stand-in text.
- Risk: this changes a public API. Use a coordinated version and appropriate changeset; do not leave a permanent two-format compatibility layer.

### NDN-08 — Acknowledged source jumps and explicit Return

**Disposition: Build · M2**

Flush pending source drafts, await accepted text, re-resolve, request any sheet change, await the controlled prop and target DOM, then commit history and focus. Return restores a logical origin and relative offset, with a named fallback if the origin was removed.

- Acceptance: delayed/ignored callbacks cause no premature scroll, focus or return-history entry. A successful cross-sheet round trip restores the invoking chart action.
- Basis: `NotebookSourceEditor` has a 300ms debounce; `NotebookColumn` obeys controlled sheet state and unmounts inactive sheets. Jupyter's [LSP extension](https://github.com/jupyter-lsp/jupyterlab-lsp/blob/main/README.md) provides a jump-back precedent.
- Risk: unmount flush races, transformed source acknowledgments and detached elements. Make the transaction cancellable and latest-request-wins.

### NDN-09 — Safe finding-value and records navigation

**Disposition: Build · M3**

Reuse the Markdown token pipeline to record prose occurrences. Add definition actions to standalone values; keep records links and any values inside their labels as a single interactive control. Offer a separate definition action from records.

- Acceptance: code, escaped braces and link destinations remain literal; no nested buttons/anchors; live updates preserve focus.
- Basis: `NotebookProse` and `NotebookFindings` already implement token substitution and records focus restoration.
- Risk: naive string replacement can damage Markdown semantics or create inaccessible nested controls.

### NDN-10 — Scoped composition references and precise output roll-ups

**Disposition: Build · M3**

Index scales, local measures, units, marks and supported related parts beside `lowerComposition`. Keep local namespaces distinct, record retained parts only, and collapse multiple paths to one displayed output when counting consumers.

- Acceptance: local scale `net` and global calculation `net` remain distinct; a point's x scale is not a raw field; an unused local measure does not influence the chart merely through containment.
- Basis: exact-ref `composition.ts::resolveRef`, `assignIds`, `keepDrawableParts`, and composition validation/types.
- Risk: copied field strings are not alias-normalized at baseline. Do not change semantics implicitly while building navigation.

### NDN-11 — Searchable outline in the same temporary surface

**Disposition: Build · M4**

Group headings and definitions by sheet with source states and a labeled search. Include unused, shadowed and invalid definitions, including those in blocks without charts. Reuse the same index and target controller.

- Acceptance: same-title headings remain separate; unused shows zero active consumers only with complete coverage; invalid definitions remain discoverable.
- Basis: `notebookSections`/`sheets.ts`; [JupyterLab TOC](https://jupyterlab.readthedocs.io/en/stable/user/toc.html) supports document navigation but does not supply semantic consumer lookup.
- Risk: a second navigation model can disagree with the inspector. There should be one index and one temporary surface.

### NDN-12 — Correct duplicate-calculation copy while protecting actual behavior

**Disposition: Build · M1 supporting correction**

Add an exact assertion on accepted calculations and consumers, and correct both misleading first-wins diagnostics. Preserve the baseline skip-all effective behavior unless a separately explicit language change is chosen.

- Acceptance: duplicate delta has no active provider, even if one block's diagnostic status remains `ok`.
- Basis: `compile.ts` adds the name to `skippedCalcs`; its final filter removes all entries with that name. The existing duplicate test checks only diagnostics/status.
- Risk: treating copy as semantics would make the new navigation confidently wrong.

### NDN-13 — Responsive/focus behavior and documentation ship with each milestone

**Disposition: Build · M1–M4**

Use the 1280/783/390px acceptance contracts from the start. Keep charts visible on desktop, protect focus on the full-width narrow sheet, and add the `notebooks.mdx` section and runnable six-block example with each visible capability.

- Acceptance: actual implementation checks record keyboard/pointer behavior, source overflow and focus return; none is inferred from this report's mockups.
- Basis: `AGENTS.md`, UI defaults and [W3C modal dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
- Risk: postponing integration would leave nominal compiler support unusable for readers.

## Explore

### NDN-14 — A focused graph or optional overview after the core ships

**Disposition: Explore · after M4; no delivery gate**

If an overview is useful, reuse the existing metadata and show selected-node paths first, with an accessible list alternative. Do not introduce another dependency extractor.

The [HILDA 2023 study](https://faculty.cs.niu.edu/~dakoop/pubs/brown-hilda-dependency.pdf) did not establish significant time/accuracy superiority between its graph and minimap. Any claim that this inspector is faster would require actual evaluation. The current decision rests on product scope, screen space and explanation of edge roles.

### NDN-15 — Host-provided edit maps for stronger external-editor continuity

**Disposition: Explore · optional extension**

A concrete host with rich text-edit transactions could supply mappings across arbitrary external edits. The default remains explicit block ids plus conservative session matching. This extension is not necessary for the requested six-block workflow and should not become a generic collaboration/provenance subsystem.

## Defer

### NDN-16 — Durable share URLs, full execution history and rename refactoring

**Disposition: Defer**

Do not promise permanent links to anonymous source occurrences across reloads or versions. Do not add automatic “rename all references,” historical output replay or persisted navigation stacks to this mission. Each needs a separate storage/host or language contract. Current source navigation and session Return are useful without them.

## Avoid

### NDN-17 — Independent parsing or a new reactive engine

**Disposition: Avoid**

No parallel DSL/formula parser, heuristic grep graph, reactive scheduler, dependency service, language server or graph database. Existing compiler semantics and the current local React/TypeScript architecture supply the correct integration points.

### NDN-18 — Positional identity and guessed repairs

**Disposition: Avoid**

Never persist block indices, line numbers, random expression UUIDs, generated part positions or heading slugs as universal identity. Never redirect a missing definition to a nearby line or similarly named node without a reliable mapping. An unavailable target with a useful current-source fallback is preferable to a plausible wrong source.

### NDN-19 — Conflating definition navigation with value tracing

**Disposition: Avoid**

Preserve Alt-click/Alt-Enter value tracing and finding record inspection. Static possible dependencies include unexecuted branches; definition navigation cannot claim exact row provenance or historical execution causality. It has no dependency on unmerged research PR507.

### NDN-20 — Permanent graph chrome, gesture conflicts and nested controls

**Disposition: Avoid**

Do not add an always-open dependency sidebar, default full graph, plot Inspect button, global shortcut that overrides browser Back, or interactive finding value nested inside a records link. Use one temporary surface, existing keyboard patterns and explicit Return.

## Handoff

The design and fixtures are complete. The implementation plan maps Build recommendations to cumulative milestones, and the acceptance companions define the required results. Verify implementation against the current checkout while preserving these originals and their pinned-baseline evidence. No repository changes, commits, PRs, hosting or infrastructure were performed in this design run.
