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
For the demo overhaul, assume multi-table support lands before implementation starts.
This assumption does not certify support in the current checkout.

## Evidence on Hand

Existing Wine analysis: `src/demos/examples.ts`, example `wine-chemistry`.
Imported dataset research: `../../docs/intent/demo-overhaul/support/dataset-research.md`.
The research proposes analyses; their findings still require computation.

## Product Principles

- Show analytical power through high-quality completed examples.
- Make the exposed app features easy to find alongside each dataset's subject.
- Let people inspect and change prepared analyses without a tutorial or required sequence.
- Prefer fewer excellent catalogue entries over many similar examples.
- Keep the route to using personal data clear.
