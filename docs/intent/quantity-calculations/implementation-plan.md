# Checked quantities and explicit conversion

Build an explicit Quantity mode over the existing calculation tree. Keep row values numeric. Let authors declare measurements, combine compatible values, create converted fields, inspect the conversions, and save the definitions.

This is a proposed plan for review, not approval to ship. It follows [the research decision](../../research/quantity-calculations-2026-10-27/README.md) and [local dispositions](../../research/quantity-calculations-2026-10-27/decisions.md). Baseline: `9d64a021e35d312887b1bc848e307f42b6c3091f`; refreshed main still matches. Numeric and temporal preparation proposals are not dependencies.

## Contract

- An absent quantity declaration means unknown. Explicit unit `1` means dimensionless. A display suffix never establishes either.
- Source declarations describe existing numbers. Changing a declaration does not multiply the source values.
- Conversion creates a new field. Its numbers change; the original field and its numeric bounds keep their meaning.
- Existing formulas remain Scalar. Quantity mode checks every intermediate operation and both conditional branches.
- Compile conversion steps once against the existing AST. Execute scalar operations through the existing evaluator.
- Cache each result in its saved output representation. Dependents read that representation exactly once.
- Separate physical units, temperature roles, author meaning, record grain, population, and statistic.
- Reject invalid local Apply operations atomically. External invalid definitions remain repairable, with affected outputs unavailable.
- Preserve numeric CSV. Complete analysis export retains declarations; CSV alone does not.

## Types and ownership

Add a shared declaration with `unit`, required `role`, and optional `meaning.kind`/`meaning.reference`. Roles are Linear, Temperature reading, and Temperature difference. Meaning keys are exact author assertions, not an ontology.

Use `quantity?: QuantityDeclaration` on standalone raw field settings and project source fields. A checked calculation has `quantity?: { result?: QuantityDeclaration }`. Presence selects checking. Accept a numeric output only after saving its inferred/chosen result contract. Boolean/text outputs need no numeric contract.

| Field or result              | Owner                                                           |
| ---------------------------- | --------------------------------------------------------------- |
| Standalone input             | `FieldSettings.quantity`                                        |
| Project source               | `FieldDefinition.quantity`                                      |
| Local calculation            | `CalculationDefinition` and `SavedCalculation`                  |
| Query calculation            | `CalculateStep`                                                 |
| Reusable query aggregate     | Its `AggregateMeasure` output contract                          |
| Project view                 | Readonly inherited environment, with an edit route to its owner |
| Local notebook definition    | Its one EDA declaration across blocks/sheets                    |
| Standalone exported snapshot | Materialized declarations for the exported input columns        |

Pass resolved quantities and validity through the provider and evaluation fields. Do not save a second inherited map in view settings. Do not persist dimension vectors, compiled plans, AST UUIDs, or caches.

Pin the complete output contract when a reusable result is applied. Editing its formula may preserve the contract. Changing representation or meaning creates another result identity. This avoids an incomplete scan of filters, bins, annotations, saved ranges, and external consumers.

Correcting a source interpretation is a separate explicit action. Preview source bounds and transitive results. A source bound retains its numeric coordinates under the new interpretation. A dependent bound retains its pinned output unit. On first typing, accept newly typed reusable aggregate contracts in the same owning project transaction.

Do not silently pin missing contracts during loading. Preserve external text, show the inferred contract, and offer explicit acceptance. A blocked field must not become ordinary null: predicates including `neq` and `is-null` must not admit its rows. Mark the affected analysis unavailable rather than report a factual zero count.

## Semantic rules

Use an owned finite unit table and conventional unit-string grammar: explicit multiplication, division, parentheses, integer powers. Start with `1`, `%`, `ppm`, metric lengths, fixed durations, mass/volume, SI base/derived units, and explicit currency codes. No automatic prefixes, suffix inference, dynamic row units, or runtime registry. `d` is 86,400 seconds; month/year are calendar concepts outside this feature.

Use `qty(value,"m")`, `temp(value,"degC")`, `delta(value,"degC")`, and `convert(value,"km/h")`. Constructors accept a numeric constant expression or one unknown numeric field. They cannot relabel an already declared quantity. Unit arguments are static strings. Reject normalized pure-temperature disguises such as `qty(1,"K*s/s")`.

| Operation                              | Quantity behavior                                                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Linear addition/subtraction/comparison | Require compatible dimensions and no explicit meaning conflict; convert operands into one representation.                                   |
| Products/division                      | Combine dimensions/scales; choose a deterministic compound representation.                                                                  |
| Dimensional power                      | Require a constant integer exponent.                                                                                                        |
| Bare numbers                           | Dimensionless, including zero. A length plus bare zero is invalid.                                                                          |
| Conditional                            | Require a Boolean condition; check both branches; convert the selected branch into one fixed representation. Null can represent missing.    |
| Unknown input                          | Allow missingness tests and argument counts; reject magnitude arithmetic until declared.                                                    |
| Row functions                          | Normalize arguments; retain their current missing-value and argument-count behavior. Unsupported function signatures fail in Quantity mode. |
| Record reducers                        | Keep current populations, exclusions, and entity-conflict rules; compute an output descriptor for the statistic.                            |

Equal declared kind/reference keys support comparability; absent keys leave meaning unchecked. Subtraction clears a shared reference when it creates a contrast. Reading plus difference preserves the reading's reference. Products generally clear meaning; an untagged dimensionless coefficient can preserve the measured operand's meaning. An output assertion cannot override a known contradictory tag.

Temperature readings are coordinates; differences are intervals. Reading minus reading yields a difference. Reading plus/minus difference yields a reading. Reading plus reading fails; a reading mean is valid. Reading multiplication/division/powers remain outside this bounded product policy, including Kelvin readings. This restriction is not a universal thermodynamic law.

Convert readings with corresponding anchors `0 °C`, `32 °F`, and `273.15 K`. Differences use scale only. Keep same-unit conversion an identity. Subtract same-coordinate readings before introducing an offset. After dimension cancellation, a pure-temperature result has Difference role. Retain binary64 finite-value checks; comparison equality does not gain a hidden tolerance.

Percent has scale 0.01. Both `0.12 [1]` and `12 [%]` represent the same ratio. Apply percent display once. Currency codes are distinct dimensions; only an explicit authored exchange-factor field can relate them.

## M1 — Linear quantities, traces, and standalone persistence

**Outcome:** declare fields, calculate rates and compatible sums, create converted fields, inspect steps, and reopen standalone JSON/text.

Start with new modules under `packages/explorEDA/src/lib/quantities/`: shared types, a finite resolver, AST analysis, reducer output rules, and codecs. Keep the modules small; combine them where clear. No new expression language or quantity objects in rows.

Change these existing boundaries:

- `lib/calculations/{CalculationState.ts,types.ts,engine/Calculator.ts,functions/registry.ts}`: optional checked plan, dependency compilation, projected scalar caches, errors, and conversion evidence in traces.
- `providers/DataLayerProvider.tsx`: both saved/runtime calculation converters, candidate Apply, whole-cache invalidation, refreshed predicates/profiles, and one state callback. Do not use the display-only field-settings branch for semantic edits.
- `lib/fieldSettings.ts`: declaration validation and result-aware formatting, separate from raw parsing.
- `components/SummaryTable/components/FieldInspector.tsx`, `components/schema/SchemaInspector.tsx`, and calculation editor/form: reuse current drafts and previews. Include quantity declarations and environment changes in preview dependencies.
- `types/SavedDataStructure.ts`, `utils/saveDataUtils.ts`, and `lib/dsl/{parse.ts,compile.ts,export.ts,settingKeys.ts}`: explicit nested codecs, alias resolution, special-value preservation, and contract validation.

Extend calculation heads before the expression separator, for example `calc speed check=quantity resultUnit="m/s" resultRole=linear = distance / elapsed`. Add source declaration keys such as `quantityUnit=cm quantityRole=linear`. Current standalone `parseCalc` needs a parser change; generic field export does not serialize new nested objects automatically.

Install linear statistic descriptors across actual reducer bodies and their wrappers in M1. Shared `lib/aggregates.ts` alone is insufficient. Include Pivot, Metric Card, daily rollups, Calendar, Line, Bar/series Bar, Heatmap, Map, Donut, Waterfall, and Composition. Donut/Waterfall synthetic `measure` fields need explicit metadata. Search call sites of grouped reductions and private reducers before declaring coverage complete.

Counts use `1`; ordinary linear summaries and standard deviation retain the input unit; variance squares it; shares are dimensionless. Preserve Pivot's existing count-suffix handling. Reject unsupported quantity transformations explicitly. Guard Composition horizon transformations for declared quantities until their subtraction/relative semantics are implemented. Keep their untyped behavior.

M1 tests cover conversion factors, nested conversion, incompatible intermediates, branch joining, unknown values, percent, currency, stale previews, atomic rejection, traces, settings/analysis JSON, and Dashboard text. Compare preview, batch, trace, and restored results. Save no plans or random AST IDs. Until definition writeback lands, notebook quantity edits stay readonly or use source text.

**Docs/example:** add sections to `fields.mdx`, `calculated-fields.mdx`, and `dashboard-text.mdx`. Add a distance/rate example under `apps/demo/src/demos/`, registered in examples, coverage, and docs live examples. Include percent and incompatible-input cases.

**Main risk:** a path keeps a unit label but loses checking or numeric conversion. Acceptance requires matching values and descriptors at each boundary.

## M2 — Temperatures and aggregate meanings

**Outcome:** distinguish readings/differences and inspect correct means, dispersion, and comparison deltas.

Extend the same resolver/compiler and controls with K/degC/degF and explicit interval atoms. Add anchored conversions, role-aware operators, valid reading means, and normalized temperature checks.

Extend all M1 reducer adapters. Pivot mean/median/min/max retain Reading role; population standard deviation becomes Difference; variance uses squared interval units. Reading sums fail. Metric headline and baseline subtraction need separate descriptors. Composition first/last/quartiles retain the input role; differences produce intervals; reading relative-change values and colors are unavailable. Do not reject valid quartiles because an optional change color is unsupported.

Check legality before stacking, shares, Other grouping, and zero fill. Fields sharing one positional scale, including Composition band/span and Waterfall state inputs, need compatible meanings and identical numeric representations. Require explicit converted fields rather than plot raw centimetres on a metre scale.

Tests cover the temperature/statistic rows below and existing Pivot/Composition/Metric planner tests. Preserve Pivot's population estimator and all contributor rules. Unit correctness does not choose weighting or population.

**Docs/example:** extend field/calculation, Pivot, and Metric Card docs; document Composition difference/change behavior. Add a temperature-sensor example with reading means, ranges, and a comparison trace. Include a standalone observed-range example before project support.

**Main risk:** a private reducer formats a difference or squared unit as the source reading. Each typed path must carry a tested descriptor or an explicit unavailable result.

## M3 — Project queries, parameters, and folder owners

**Outcome:** declare source quantities once, preserve them through aliases and query stages, and save their actual owners.

Extend `types/AnalysisProject.ts` and `lib/analysis/evaluateProject.ts`: source/evaluation fields, checked calculate steps, pinned aggregate outputs, and optional numeric parameter quantities. Compile each step outside the row loop. Keep `rowUnit` as record grain. Validate semantics before testing filters.

Inline numeric bounds use the target field's stored coordinates. Declared parameter magnitudes convert into that representation; incompatible or unknown physical parameters fail. Keep joins/group keys based on existing identity, with no hidden unit conversion.

Extend project text codecs, including parameter allowed-key lists. Carry each query's own environment through `lib/project/analysisText.ts`, notebook readers, `ExplorEdaProject.tsx`, and the daily loader. Current project view reporting strips inherited primitive settings using identity comparisons; keep resolved quantity metadata outside that overlay.

Extend `lib/project/{folder.ts,writeFolder.ts}` at existing owner boundaries. Preserve declared versus inferred schema. Factor the app's project-definition commit path from its view-specific wrapper; do not manufacture a view to edit a source. Keep `node/projectFiles.ts` as generic byte I/O and watch logic.

Tests cover source → alias → calculate → aggregate → filter, aggregate → calculate, empty sources, source corrections, contract acceptance, two queries sharing field names, typed parameter text/folder round-trips, and view saves with no copied source declaration.

**Docs/example:** extend project-folder and Dashboard text docs. Add trips with mean row speed `20 m/s` versus pooled `25 m/s`, a lookup alias, and a typed threshold. Add the project-backed scientific example through the daily loader. Until M4 supplies standalone snapshots, expose native project export and magnitude-only CSV without claiming inherited settings are portable alone.

**Main risk:** a row-only adapter drops quantity metadata or writes duplicate declarations to each view.

## M4 — Notebook writeback, refresh, undo, and portable export

**Outcome:** edit the one owning notebook definition, update all sheets, and reopen a complete standalone analysis.

Extend `lib/notebook/{readNotebook.ts,compileNotebook.ts,writeBack.ts,sheets.ts}` and `components/notebook/ExplorEdaNotebook.tsx`. Write field/calculation tokens as well as chart edits. Preserve prose/comments and unambiguous aliases. Recompile the candidate document and verify the intended definition before reporting success. Do not wait for file-watch echoes after an own write.

Add a source-owner route for inherited declarations. Without a host editor, show the owner as readonly. The app must reevaluate the current query after a project edit; cached notebook rows cannot pair with a new quantity environment. Recheck last-valid text under the current environment. Include accepted definition changes in the notebook's saved-state fast path.

Use existing host history and state holds. Test data-only refresh, definition-only refresh, both together, matching host echoes, source removal, and undo/redo. Do not add a quantity-specific history engine or row identity promise.

Standalone analysis export materializes declarations for its exported input columns, which may already be query outputs. Preserve local formulas as definitions. Reopen without the project and prove value/descriptor equality. Preserve raw special values. Keep live view saves free from inherited copies.

Table CSV keeps native headers, resolved scalar magnitudes, and its selected rows/columns. It carries no declarations. Explain that stored ratio `0.12` and percentage magnitude `12` export differently despite identical percent display. Offer complete analysis JSON for metadata-preserving handoff.

**Docs/example:** extend notebook, export, and history docs. Add a two-sheet measured-quantities notebook with a declaration in the later block, owner editing, refresh/undo, CSV, and standalone reopen.

**Main risk:** old values appear under new units, or an exported analysis depends on a missing project.

## Decisive acceptance fixtures

These are mathematical expectations and proposed application tests. Independent local arithmetic supports the numbers; the feature is not implemented.

| Input or operation                                      | Expected                                                                                       |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `100 cm + 2 m`                                          | `300 cm`, or `3 m` in a chosen output contract                                                 |
| `1000 m / 200 s`                                        | `5 m/s`; converted field `18 km/h`                                                             |
| `convert(1 m, cm) / 2 m`                                | Ratio `0.5`, not `50`                                                                          |
| `0.12 [1]`, `12 [%]`, `0.12 [%]`                        | Ratios `0.12`, `0.12`, `0.0012`                                                                |
| `12 % × 200 m`                                          | `24 m`                                                                                         |
| `0 °C` reading to °F; `10 Δ°C` to Δ°F                   | `32 °F`; `18 Δ°F`                                                                              |
| `20 °C − 10 °C`; reading + reading                      | `10 Δ°C`; static error                                                                         |
| `10 Δ°C + 68 °F`; mean of `0 °C, 212 °F`                | `86 °F`; `50 °C`                                                                               |
| Same-unit tiny difference `0.000000000001 °C − 0 °C`    | Preserve the native difference without a Kelvin round trip                                     |
| `0,10 °C` readings                                      | Mean `5 °C`, population variance `25 Δ°C²`, standard deviation `5 Δ°C`, count `2`; sum invalid |
| `32,50 °F` readings                                     | Mean `41 °F`, variance `81 Δ°F²`, standard deviation `9 Δ°F`                                   |
| Trips `1000 m/100 s`, `9000 m/300 s`                    | Mean speed `20 m/s`; pooled rate `25 m/s`                                                      |
| Groups `0` and `10,10,10 m`                             | Pooled mean `7.5 m`, not mean-of-means `5 m`                                                   |
| `undefined,null,0,10 m`                                 | Numeric sum `10`, mean `5`; zero contributes                                                   |
| Distance `1000 cm`, duration `200 s`, result pinned m/s | `0.05`; source correction to m gives `5`, raw `1000` stays                                     |
| Sum pinned cm, source `1000 cm` corrected to m          | Result changes from `1000 cm` to `100000 cm`                                                   |
| Typed parameter `18 km/h`                               | Same boundary as `5 m/s`; seconds parameter fails                                              |
| USD plus EUR; declared EUR × USD/EUR rate               | First fails; `10 × 1.2` yields `12 USD`                                                        |
| Length versus duration in an unused branch              | Static error; two compatible branches project to one representation                            |
| Length versus bare zero; length versus null             | First invalid; second nullable length                                                          |

Use exact integer assertions where applicable and stated binary64 tolerances for conversions/statistics. Do not redefine formula equality with test tolerances.

## Verification and scope

Each milestone includes docs, a runnable example, and real pointer/keyboard checks at 1280, 783, and 390 pixels. Keep field names, scope, diagnostics, and Apply reachable. Preserve contained table scrolling and current narrow-screen grid behavior. Include light/dark state and invalid drafts.

Run focused quantity/calculation/provider tests during M1/M2, then the named project/folder/notebook/export tests as their milestones land. Add demo coverage and Dashboard round-trip checks when examples change. Use repository time limits. Run `pnpm check`, `pnpm check:pr`, and a package changeset before each implementation PR. Take screenshots with `pnpm shot` and attach them with `gh`.

Defer large unit catalogues, thermodynamic equations, logarithmic units, uncertainty, calendar arithmetic, and in-place consumer migration. Explore a narrow math.js adapter only if vocabulary needs it. Measure latency before adding workers or incremental invalidation. Avoid hidden inference, automatic exchange/reference services, new sidecars, and object-valued chart cells.

## Preserved Pro result materials

[Original Pro reports and artifacts for #533](assets/pro-results/quantity-calculations-2026-10-27/ASSET_INDEX.md)

All extracted result materials are preserved without ZIP containers. Original bytes and attribution are unchanged.
