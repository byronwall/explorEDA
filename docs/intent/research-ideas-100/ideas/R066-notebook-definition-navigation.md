# R066 — Navigate notebook explanations through their shared definitions

- ID: R066
- Category: Notebooks and narrative
- Priority: 83
- Kind: new-direction
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A notebook's reading order is intentionally different from its definition order. `compileNotebook` compiles shared definitions across blocks, records calculation and alias names per block, and preserves file-line diagnostics. `NotebookBlockView` already shows a small Defines line for a definition-only block. The research opportunity is helping a reader answer where a plotted measure came from and which other outputs depend on it. This is a navigation question over existing definitions, not a proposal for a general dependency engine or a replacement of the calculated-field trace already present elsewhere.

Compare lightweight links from a chart's used fields to their defining notebook blocks with an optional document outline listing definitions and their consumers. Inline links keep the explanation near the result but can clutter a chart header. An outline supports large notebooks but adds a second navigation surface. A third alternative is a better authoring convention: named definition sections and explicit prose links. Observable Framework's documentation illustrates order-independent reactive references, offering a useful comparison for the reader's mental model; explorEDA should retain its constrained DSL and React implementation.

The first experiment uses a six-block notebook with two shared calculations, an alias, a definition placed after its first use, and one unused definition. Ask readers to locate the origin of a metric, identify the outputs affected by a proposed edit, and return to the chart they were reading. Acceptance requires correct definition and consumer identification without inspecting generated settings, and a stable return location after source text changes. Reject a visual graph if the simple links or prose convention perform as well, or if the available compiler metadata cannot identify dependencies without a separate parser.

Notebook-analysis delivered synchronized definitions and left broader reusable results outside its first release. This candidate stays within the shipped definition model and does not assume named intermediate tables are available. The smallest API cost is exposing source locations already known during compile; maintaining an independent graph would be a warning sign. Confidence is medium because the need rises with notebook length, which this packet does not quantify. It earns its place by investigating a low-cost way to make agent-authored and human-authored notebooks reviewable without requiring readers to understand every implementation detail.

## References

- `packages/explorEDA/src/lib/notebook/compileNotebook.ts` — `compileNotebook`, `NotebookBlockResult`, `NotebookChart`. Compile results retain block names and chart declaration locations.
- `packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx` — `NotebookBlockView`. Definition-only blocks already display their declared names.
- `packages/explorEDA/src/lib/notebook/compileNotebook.test.ts` — `shares definitions across blocks in any order`. Order-free definitions are a tested existing capability.
- `docs/intent/notebook-analysis/intent-brief.md` — related intent; status and overlap are discussed above.
- [Observable Framework: Reactivity](https://observablehq.github.io/framework/reactivity) — primary source accessed 2026-10-20; used only for the comparison described above.
