# Compact config authoring

## My read

Byron wants agents, and sometimes humans, to create explorEDA dashboards quickly from readable text. Creation is the primary job. People normally use existing settings controls after creation. The DSL is an entry point into the app, rather than a continuously watched view of settings.

A document describes the final dashboard. Applying it replaces the dashboard configuration instead of merging a diff. Omitted settings use app defaults. Old charts and settings do not survive merely because the document omits them. Source rows remain host-supplied; replacing configuration does not replace the dataset.

The language must be terse for common charts and expressive for uncommon settings. Use flat pairs and readable property paths. Do not require JSON for complex values, imports into the authoring workflow, or exported DSL. Native saved settings can retain their existing internal representation.

## What matters most

- Prioritize agent generation, checking, repair, and quick creation.
- Describe the final dashboard with app defaults for omitted settings.
- Work without explicit chart names, while allowing names when useful.
- Render usable parts despite errors and report every broken part clearly.
- Make row calculations and chart-local filters part of creation.
- Reach detailed settings without a JSON escape block.
- Export current native settings to DSL on demand.

## The experience or behavior you appear to want

An agent obtains source fields and sample values, writes a document, and checks it. A person or host brings that text into the app. A paste-started editor is a useful provisional route. File input is possible, but no particular file workflow is settled.

The app renders the usable dashboard and shows actionable diagnostics. Users can inspect a failed declaration, identify the problem, and fix it. After creation they use normal chart settings. They request a DSL export when they want to share or reuse the current dashboard. Continuous preservation of source comments and formatting is not required.

Optional source contracts map aliases to native names, expected types, and labels. Omit the mapping when names already match. Charts need no explicit names for ordinary creation. Optional names support clear references without making identity a typing burden.

## Boundaries

The document configures the existing app. Reuse native calculations and saved settings as runtime authority. Do not build another expression evaluator or require multiple source arrays. Aliases and labels must not silently change type or binding.

A declared chart filter restricts that chart’s population for now. It must not silently become a linked workspace filter. Existing interactive brushing and linked selections remain separate behavior. Independent configured populations require real native support, rather than a DSL-only interpretation. Global filters are a proposed main-app extension; their scope and controls need a later shape.

“Basically never fail” means recover where possible and keep useful results visible. It does not mean evaluate invalid expressions or silently discard constraints. Formula failures must identify affected rows and consequences. A chart with unresolved fields or population rules needs a clear unavailable state. Independent charts should still render. If nothing can render, keep a repairable document and explicit failure explanation.

## What seems settled

The flat direction supersedes mandatory indentation. Calculations, chart-local filters, optional source mappings, full-setting access, and actionable checking remain core scope. Users accept verbose property paths and setting names. JSON authoring is rejected.

The complete-document model supersedes patch-oriented creation. Recoverable rendering supersedes all-or-nothing acceptance. On-demand export supersedes continuous UI-to-text synchronization. Explicit chart IDs remain optional.

## Possibilities, not decisions

A compact paste editor can provide entry, checking, and repair without becoming the ordinary settings editor. Files can use the same compiler later. Global filters should be considered as a main-app feature, then exposed in the DSL. These are proposals rather than fixed first-release interfaces.

Anonymous IDs, array syntax, and diagnostic presentation are reversible design choices. Keep source locations for repair and preserve missing, empty, and omitted values without JSON. Reusable edit commands are lower priority than complete-document creation.

## Current reality that matters

The historical prototype reported 275 passing tests, but emitted partial patches rather than complete rendered workspaces. Only its useful design notes and examples are retained under `support/`. Its JSON escape syntax, linked filter assumptions, and strict success boundary are superseded by these answers. Native chart filtering currently participates in Crossfilter dimensions; chart-local population restrictions need a separate proof. Existing defaults, formula evaluation, save validation, and normal controls remain useful foundations.

## Next step after confirmation

Use the revised [shape](shape-brief.md) and [plan](implementation-plan.md). Prove a pasted creation document with two independent chart populations and one deliberate failure. Render usable charts, show actionable warnings, and export the resulting workspace without JSON authoring.
