# DSL session summary

Source: [Build Scatter Plot Test Bed](https://chatgpt.com/c/6ac08186-7fb0-83ea-864e-34a7564edb4c).

## 10:54 — First DSL request

Byron requested readable compact text for chart settings, optional source mappings, display names, and a checker for agent feedback.

Three alternatives were explored: explicit field roles, controlled phrases, and positional slots. Explicit roles were recommended because relationships remain visible during review.

## 1:14 — Compact correction

Byron wanted fewer new lines and less indentation. Flat `key=value` records replaced the nested outline. Field identity and expected type moved onto one line. Detailed setting paths avoided repeated configuration scaffolding.

## 4:29 — Calculations and filters

Byron added calculation definitions and filters per chart. The final proposal used `calc`, `where.field`, optional `+` continuation lines, and optional `@` names.

The prototype checked syntax and emitted partial settings. It did not compile complete workspaces or prove native row evaluation. The recorded 275 test passes describe that historical prototype, not a compiler shipped here.

## Later product decisions

[Product decisions](product-decisions.md) supersede several research proposals. Documents now describe complete dashboards. Filters restrict their chart. Usable charts render despite unrelated errors. Export occurs on demand. JSON authoring is rejected.

The original prototypes, generated evidence, archives, and full transcript were removed to keep this PR focused. Current scope lives in the parent intent documents.
