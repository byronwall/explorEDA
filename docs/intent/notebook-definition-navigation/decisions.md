# Local decisions and evidence

[Original results](assets/pro-results/notebook-definition-design-2026-11-02/README.md) remain unchanged. These decisions apply to the local plan.

## Dispositions

| IDs       | Disposition | Local reason                                                                                             |
| --------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| NDN-01–05 | Build       | Add inspection using accepted compiler and live chart inputs; separate population from aggregate values. |
| NDN-06–08 | Build       | Ship block identity, fallback memory and acknowledged source/Return movement together in M2.             |
| NDN-09–11 | Build       | Reuse Markdown/composition semantics and one shared index for consumers and outline.                     |
| NDN-12    | Build       | Correct misleading duplicate-calculation copy while preserving current skip-all semantics.               |
| NDN-13    | Build       | Ship docs, example, responsive behavior and focus checks with each milestone.                            |
| NDN-14–15 | Explore     | Optional graph and host edit maps can build on the core; neither blocks it.                              |
| NDN-16    | Defer       | Permanent URLs, execution history and rename refactoring need separate scope.                            |
| NDN-17–20 | Avoid       | Separate parsing, guessed identity, trace conflation and permanent graph chrome would weaken the design. |

Build means planned work, not approval to ship.

## Current-code checks

Main remains `d3920a285f3755a8324998775deb131747e959f5` after fetch. The supplied baseline is current.

- `compileNotebook.ts`: global compilation, numeric fallback keys, appended stand-ins, and block name summaries match the report. Summary names do not establish accepted bindings.
- `dsl/compile.ts`: duplicate names enter `skippedCalcs`; final filtering excludes both declarations. The diagnostics still claim first-wins. `rewriteFormula` preserves bracketed references and rewrites bare aliases.
- `ExplorEdaNotebook.tsx`: only the active sheet mounts; controlled sheet choices await the host. Definitions-only labels are plain text. Live chart settings can differ from source without `onTextChange`.
- `NotebookSourceEditor.tsx`: 300ms debounce and unmount flush confirm the need for acknowledgment before navigation.
- `NotebookProse.tsx`: token substitution precedes text joining. Finding values use spans, including link labels. Code and link destinations stay outside substitution. Preserve the token path.
- `findings.ts`, `CrossfilterWrapper.ts`, and `MetricCard.tsx`: findings apply their own measure and selected/eligible population. Notebook `localSelections` clears chart filter dimensions; cards read eligible rows. No direct chart aggregate→finding value edge exists.
- `parseNotebook.ts` does not retain authored fence IDs. Host memory callers exist in `apps/app/src/App.tsx` and `ProjectWorkspace.tsx`; include them in M2, not a late integration phase.
- `readNotebook.ts` also exposes ordinal fallback input. M2 must update it with the renderer API. Keep public exports coordinated.

## Local verification

A temporary, locally authored Vitest probe ran the actual registered notebook compiler on the main fixture and 24 supplied source variants. All 25 cases passed their applicable chart acceptance, calculation-name and block-status assertions. This does not verify proposed graph edges or navigation. The first probe used a nonexistent calculation `name` property; it was corrected to `resultColumnName` before the passing run.

Existing compiler, sheets and findings suites added 29 passing tests: 54 total with the temporary probe. The probe remains in ignored tmp, not production tests. Pro's 145 fixture assertions and isolated source checks are attributed results; downloaded scripts were inspected but not executed.

All 16 archive entries passed unique-path, traversal, size, symlink and CRC checks. All originals match archive bytes. Both PNGs were viewed; SVGs parsed and JSON companions inspected. Their geometry and behavior remain design proposals. The flow diagram collapses composition paths and omits input-row details; use the JSON contract for exact edges.

Primary-source spot checks: [Observable minimap](https://observablehq.github.io/documentation/debugging/minimap) explicitly marks its docs old; [nbformat cell IDs](https://nbformat.readthedocs.io/en/latest/format_description.html#cell-ids) separates identity from position; [W3C modal dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) supports the narrow sheet focus contract. These are precedents, not evidence of faster tasks.

No navigation feature, browser acceptance, performance test or full feature implementation ran. Current-source and UI tests remain milestone acceptance work.
