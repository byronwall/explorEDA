# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The demo serves analysts who might use explorEDA as a tool or library.
Developers are a secondary audience. The demo is not an educational product.

## Product Purpose

Show the results of a complete analysis and the power of the working tool.
Success means visitors want to bring their own CSV files and explore them.

## Operating Context

Visitors inspect prepared analyses, select records, change views, and inspect source evidence.
The existing application also accepts user data and provides an editable workspace.

## Capabilities and Constraints

Use React and TypeScript in the existing application.
Keep the current compact workspace conventions in `../../docs/ui-defaults.md`.
Related tables use the package's project API (`ExplorEdaProject`), as in the shop example.

## Evidence on Hand

Existing Wine analysis: `src/demos/examples.ts`, example `wine-chemistry`.
Curated catalogue: `src/demos/examples.ts`, with analyses in `src/demos/analyses/`.
Dataset sources and preparation: `public/datasets/README.md`.
Dataset research and reserve candidates: `../../docs/research/demo-datasets/README.md`.
Unused research proposals still require computation before they become findings.

## Product Principles

- Show analytical power through high-quality completed examples.
- Make the exposed app features easy to find alongside each dataset's subject.
- Let people inspect and change prepared analyses without a tutorial or required sequence.
- Prefer fewer excellent catalogue entries over many similar examples.
- Keep the route to using personal data clear.
