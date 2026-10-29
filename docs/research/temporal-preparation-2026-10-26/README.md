# Build explicit temporal preparation

Build civil dates, exact instants, and declared epochs in UTC, then authored zones, then month labels.
Keep primitive strings with authoritative temporal metadata. Preserve raw records and separate failure statuses.
The [implementation plan](../../intent/temporal-preparation/implementation-plan.md) defines three complete releases.
This is Design research, scored **18/20**, not a shipped feature.

[Pro conversation](https://chatgpt.com/c/6adfb029-0c10-83ea-ac83-9822ac4f9edf).
Pro completed after 21m44s. Both full reports were collected and read; no follow-up was needed.
Originals remain under ignored `tmp/`; no archive, receipt, or original is committed.

## Findings checked locally

Baseline and refreshed origin/main: `9d64a021e35d312887b1bc848e307f42b6c3091f`.

- `valueParsing.ts` reads offset-free text as UTC and month labels as their first day.
  `fieldSettings.ts` converts datetime text to ISO; explicit epoch input needs a new contract.
- `timeSeriesPlan.ts` already uses `allIds` for stable domains. The old date intent's moving-axis claim is stale.
- Query source/lookup/expand project raw values. Readers flatten `row.data` and lose field metadata.
  Prepared meaning must cross these boundaries without repeating the source recipe.
- `CalculationManager.executeCalculation` caches each dependency before its consumer.
  Normalize prepared outputs there and match `traceRow`; `Calculator` currently compares primitive values.
- `FieldInspector.tsx` already owns draft settings, preview, all-failure review, and Apply.
  Extend it. `writeBackSettings` currently handles chart edits, not general shared interpretation.
- `saveDataUtils.ts` validates existing settings but needs explicit validation for the new shapes.
  Compiler/export setting vocabulary must also change. A nested object alone will not round-trip.
- Data-only prop updates currently reset through `setData`. Preserve that contract; add explicit same-source refresh.
- Project entity keys differ from workspace row selection. `carryRowSelections` remaps by serialized content.
  It does not provide generic durable identity; special raw values can collide under JSON serialization.

Local review therefore removes automatic data-prop reinterpretation, a general source-key API,
an owner registry, and a speculative recipe-version scheme.
Clear exact selections after refresh when record identity cannot be proved; host echo must not revive them.
Preserving current opt-in field behavior does not require multiple runtime/version engines.

Independent locally authored arithmetic confirmed offset equivalence, decimal epochs, supported instant limits,
UTC/Indianapolis memberships, gaps/folds, 23/25-hour days, week/month lengths, refresh, and St. John's date reversal.
These are oracle checks, not execution of the proposed feature or proof of its performance.

## Local dispositions

Build means included in the plan, not approved to ship.

| Pro ID | Local disposition | Reason                                                                                                   |
| ------ | ----------------- | -------------------------------------------------------------------------------------------------------- |
| TP-001 | Build             | Canonical scalars plus metadata fit existing row and save contracts. Reuse existing origins.             |
| TP-002 | Build             | Civil dates need zone-independent meaning.                                                               |
| TP-003 | Build             | Exact millisecond instants need explicit precision rejection.                                            |
| TP-004 | Build             | Authored epoch units remove magnitude guessing.                                                          |
| TP-005 | Build             | Extend existing full-source preview and failure review with atomic Apply.                                |
| TP-006 | Build             | Typed predicates keep calendar labels separate from instant ranges.                                      |
| TP-007 | Build             | Share projected-date membership and exact contributors; preserve current domains.                        |
| TP-008 | Build             | Prepare at source/calculation ownership before dependent evaluation.                                     |
| TP-009 | Build             | Complete JSON/text/folder/notebook/sheet round trips in each milestone.                                  |
| TP-010 | Build, narrowed   | Explicit refresh; conservative exact-selection invalidation. Keep prop reset behavior.                   |
| TP-011 | Build             | Separate source, display, and grouping zones; reject gaps and unresolved folds.                          |
| TP-012 | Build             | One private pinned Temporal adapter for named zones; verify release/API when implementing.               |
| TP-013 | Build             | Month labels retain monthly grain without invented daily events.                                         |
| TP-014 | Build             | Finite consumer inventory, exact fixtures, docs/examples, keyboard and three-width acceptance.           |
| TP-015 | Build, narrowed   | Existing fields remain unchanged until explicit Apply; no general compatibility framework.               |
| TP-016 | Defer             | Frozen canonical/rules exports are a separate portability feature.                                       |
| TP-017 | Explore           | Measure dependency and preparation cost before adding optimization machinery.                            |
| TP-018 | Defer             | Schedules, unresolved wall-time fields, custom calendars, duration algebra, and estimators are separate. |
| TP-019 | Defer             | Submillisecond public storage expands the row contract beyond this feature.                              |
| TP-020 | Avoid             | Reject hidden guessing, shifting, row deduplication, and public per-cell temporal objects.               |
| TP-021 | Avoid             | No outside-demand gate or unrelated research dependency.                                                 |
| TP-022 | Build             | Report observable runtime provenance honestly; a package pin does not freeze zone rules.                 |

## Sources and remaining checks

[Temporal ambiguity](https://tc39.es/proposal-temporal/docs/timezone.html) supports explicit gap/fold handling.
[ZonedDateTime](https://tc39.es/proposal-temporal/docs/zoneddatetime.html) documents repeated day starts.
Its St. John's example supports the need for projected-date predicates rather than one assumed UTC interval.
[PostgreSQL](https://www.postgresql.org/docs/current/datatype-datetime.html) separates dates, timestamps, and stored instants.
The [polyfill](https://github.com/js-temporal/temporal-polyfill) supports a private imported adapter.
These decisive primary sources were checked locally. The choice of scalar metadata remains a design inference.

Implementation must finish the finite consumer inventory, source/folder edit routing, grammar spelling,
calculation operand metadata, and measured M2 cost. None requires an outside-demand study.
Browser flows, exact refresh identity, new parser behavior, and dependency performance remain unproved.
The current test and review record is in [run.md](run.md).

## Preserved Pro result materials

[Complete original Pro artifacts](../../intent/temporal-preparation/assets/pro-results/temporal-preparation-2026-10-26/ASSET_INDEX.md) are preserved under the intent entry. ZIP containers remain local.
