# Build reusable source-owned join keys

Plan named key definitions with exact match review. Ship text preparation first, integer identifiers second, and typed composites third.
The [implementation plan](../../intent/join-key-preparation/implementation-plan.md) names files, fixtures, docs, examples, and acceptance checks.
This is an unbuilt proposal. Build means included in the plan, not approved to ship.

Topic score: 18/20: capability 5, Pro advantage 5, buildable 4, momentum 4.
[Pro conversation](https://chatgpt.com/c/6ade5df0-561c-83e9-ba33-402c8fd09cb7), Design, October 25; no follow-up.
Read the [run record](run.md) for collection and validation.

Source ownership solves both endpoints. Current query calculations run over their input frame, while joins index raw target tables.
Prepared keys remain separate from source fields and entity identity. Default raw relationships retain strict typed memberships.
Review must show removed pairs as well as added pairs, original records, collisions, duplicates, and multiplication.
In the fixture, strict and trim both produce nine pairs, but expanded sums differ: 540 versus 450.

Review against current origin/main `95832bd4` confirms evaluator, preview, inspection, binding, schema, worker, and persistence seams.
The graph currently assumes raw fields; notebook writeback owns charts; the full demo supports projects but inline docs examples do not.
Local review makes two scope corrections:

- Expire exact selections and inspection after reevaluation/reopen in prepared-key queries, including stable IDs.
  Use one applied generation; omit Pro's per-key source-array maps and store action tracking.
- Forward existing folder availability evidence to review. Keep current empty-array placeholders instead of changing folder representation.

| Recommendation | Local disposition and reason                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| JK-01          | Build source-owned definitions; both endpoints can reuse them.                                       |
| JK-02          | Build one matcher across preview, evaluation, and inspection.                                        |
| JK-03          | Build explicit trim, NFC, ASCII lowercase in a fixed order.                                          |
| JK-04          | Build typed eligibility; failed keys never match each other.                                         |
| JK-05          | Build exact deltas and record evidence, with full counts and paged display.                          |
| JK-06          | Build bounded source-occurrence evidence for repeated aliases.                                       |
| JK-07          | Build matched-cardinality review; keep lookup and expansion distinct.                                |
| JK-08          | Build complete persistence/worker lifecycle with the simpler selection and availability rules above. |
| JK-09          | Build decimal safe-integer identifiers in M2; conversion is explicit.                                |
| JK-10          | Build ordered typed composites in M3; avoid separator collisions.                                    |
| JK-11          | Build docs, runnable examples, and accessible three-width flows in each milestone.                   |
| JK-12          | Build an integrated measurement probe before caches or limits.                                       |
| JK-13          | Explore manual typed exceptions separately; category mappings remain unbuilt.                        |
| JK-14          | Explore broader Unicode casing/compatibility rules separately.                                       |
| JK-15          | Defer query-output endpoints and preparation graphs; they add dependencies and grain rules.          |
| JK-16          | Avoid implicit coercion, fuzzy repair, automatic merging, and concatenated tuples.                   |

Independent local arithmetic confirms fixture pairs, deltas, totals, reverse traversal, reorder, refresh, filters, and composites.
Nine string/numeric probes pass. Existing evaluator/relationship/text, folder/notebook, and docs checks pass; see the run record.
These checks do not prove the unbuilt feature, browser flow, persistence integration, or product performance.
Pro's reference timings are omitted from the plan's acceptance evidence. Originals remain under ignored tmp/.

Spot-checked primary sources support the comparison:
[Tableau](https://help.tableau.com/current/prep/en-us/prep_combine.htm) exposes included/excluded records;
[Power Query](https://learn.microsoft.com/en-us/power-query/merge-queries-overview) supports ordered column pairs;
[Polars](https://docs.pola.rs/api/python/stable/reference/dataframe/api/polars.DataFrame.join.html) separates null matching and uniqueness validation;
[Unicode](https://www.unicode.org/reports/tr15/) distinguishes canonical and compatibility normalization.
Source-owned keys and matched-multiplicity cardinality are local design choices, not copied product guarantees.

Open questions: later manual exception precedence, broader casing, and measured performance policy.
None blocks M1. No outside-demand gate or next topic is assigned.
