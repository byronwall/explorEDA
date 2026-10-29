# Build explicit, saved numeric preparation

Add numeric input conventions to workspace field settings, with complete conversion review and retained refresh.
Then add percent/accounting input and an ordered query preparation step.
[Implementation plan](../../intent/numeric-preparation/implementation-plan.md).
[Pro conversation](https://chatgpt.com/c/6adf55b2-0884-83e9-947e-c0913a71d939).
Topic score: 17/20, Design. This is a build proposal, not shipped behavior.

## Findings and local checks

Current conversion preserves raw rows and feeds calculations. Its input language has no explicit grouping or decimal convention.
The numeric setting must join both conversion triggers and provider semantic-change detection.
Current data-prop replacement calls reset-oriented setData. Durable refresh requires a deliberate API change.
Project queries and relationship indexes precede workspace conversion; a separate query step belongs later.
Notebook writeback handles charts. It calls the host before refusing an unsupported edit, so zero-callback rejection needs preflight.
Dashboard export shares the first view's field settings. Folder analysisFileText ignores its omissions list.
Block numeric interpretation loss at those boundaries; keep the task scoped to this feature.
DataTable CSV already uses resolved runtime/calculated rows. Preserve that path instead of adding another export parser.

Local review also checked saved validation, raw special-value encoding, calculation dependencies, field compatibility,
DSL precedence, selection helpers, notebook ownership, folder export, and explicit browser-project registration.
The positional selection helper uses JSON content signatures. That cannot prove identity for this fixture's special values.
Clear unprovable positional selections on refresh; do not introduce a general identity system in this feature.

## Recommendation dispositions

| ID    | Local disposition | Reason                                                                                                  |
| ----- | ----------------- | ------------------------------------------------------------------------------------------------------- |
| NP-01 | Build             | Workspace input settings are the existing reversible conversion boundary.                               |
| NP-02 | Build             | Finite syntax presets are understandable and testable without locale guessing.                          |
| NP-03 | Build             | Explicit range/rounding policies prevent silent text precision loss; native values remain measurements. |
| NP-04 | Build             | Full counts and exact records reveal failures and successful alternative meanings.                      |
| NP-05 | Build, M2         | Percent, accounting, and two grouping forms extend one converter.                                       |
| NP-06 | Build             | Clear dependent predicates atomically; retain unrelated state and same-row membership.                  |
| NP-07 | Build             | JSON/text/folder/notebook persistence belongs with the first visible feature.                           |
| NP-08 | Build             | Refresh reapplies recipes to fresh raw input, while explicit imports reset.                             |
| NP-09 | Build, M3         | Ordered query preparation adds a measurement without changing source identity.                          |
| NP-10 | Explore           | Measure audit scheduling and compact layout before adding execution infrastructure.                     |
| NP-11 | Defer             | Exact-decimal output, custom grammars, currencies, and other digit systems need separate design.        |
| NP-12 | Avoid             | Guessing, fallback parsing, and punctuation stripping hide changes in meaning.                          |
| NP-13 | Defer             | Relationship-key normalization and global source preparation have different identity requirements.      |
| NP-14 | Build             | Each milestone includes docs, example, exact tests, and lifecycle acceptance.                           |

Local changes narrow speculative machinery: reuse the existing field setter/store lifecycle, keep preflight internal,
and add workers only after measurement. Preserve existing CSV behavior and clear unsupported positional identity.
The 20-digit and safe-integer limits are chosen product policies, not claims that every larger value loses precision.

## Sources and remaining questions

[Power Query](https://learn.microsoft.com/en-us/powerquery-m/table-transformcolumntypes) supports explicit culture during column conversion.
[readr](https://readr.tidyverse.org/reference/parse_number.html) extracts numeric text and ignores surrounding material.
These support explicit interpretation while illustrating why extraction must not define our whole-value grammar.
[ECMAScript RoundMVResult](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-roundmvresult) establishes the 20-significant-digit rounding boundary.
[OpenRefine history](https://openrefine.org/docs/manual/running) supplies a comparison for reusable operations and undo.
Primary-source spot checks support the decision; no competitor runtime benchmark was performed.

Open implementation questions are audit scheduling, 390 px layout, and the smallest internal field-preflight integration.
The plan chooses defaults. None requires outside demand or another Pro message.
Original reports stay under ignored tmp; the conversation is the source record. No follow-up was needed.

Validation evidence and completion state are in the [run record](run.md).
The proposed parser, UI, persistence, and refresh acceptance tests have not run because this PR implements no feature code.

## Preserved Pro result materials

[Complete original Pro artifacts](../../intent/numeric-preparation/assets/pro-results/numeric-preparation-2026-10-26/ASSET_INDEX.md) are preserved under the intent entry. ZIP containers remain local.
