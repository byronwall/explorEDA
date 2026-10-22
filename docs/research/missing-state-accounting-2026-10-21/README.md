# Reconcile missing values across analysis stages

Retain the current category and measurement rules. Explain each count with its population, value stage, type, and operation.
Defer a shared diagnostic classifier. Reject a universal state model and automatic cleaning for this scope.

This completes the synthesis for catalogue [R026](../../intent/research-ideas-100/ideas/R026-missing-state-accounting.md), priority 1.
The [Pro decision](https://chatgpt.com/c/6ad8b665-4f54-83ea-9741-6cee79983faa) supplies six recommendations.
The [local decisions](decisions.md) and [evidence review](evidence.md) state what was independently checked.

## What the counts mean

The twelve native rows include an absent property, explicit undefined, null, blanks, NA, bad text, Infinity, zero, false, numeric text, and an invalid date.
A raw numeric profile has two finite measurements, five missing measurements, and five excluded values.
Numeric conversion with NA reports two valid inputs, six recognized missing inputs, and four failures.
After Apply, the profile has two finite values and ten missing values. Both stages conserve twelve rows.
Failures already belong to effective missingness; do not add them again.
Categorical blanks remain categories. Zero remains a measurement. False remains a distinct value.

## Bounded findings for review

Four locally authored probes passed against the repository source. They reproduced three narrow boundaries:

- MS02: the categorical profile has three nullish rows; the missing predicate matches five, including two blank strings.
- MS03: a token-only preview under host `fieldTypes={{x: "number"}}` reports categorical 8/4/0. Apply uses numeric conversion and leaves two finite values.
- MS04: batch identity returns successful missing for an absent property; its row trace reports `Undefined variable: x`. Explicit undefined is the passing control.

MS02 confirms helper membership and the source callback route. It does not claim an executed browser click.
MS03 includes a rendered provider probe. MS04 uses the real expression parser and calculation manager.
The probes are characterization evidence, not intended regression contracts for incorrect behavior.
See [probe source](local-probe.test.tsx) and [results](local-probe-results.txt).

## Next actions

Review each repair separately. Keep missing-filter semantics and preserved category values explicit.
Any visible repair must include its docs page and runnable example in the same milestone.
The proposed destinations are `fields.mdx`, `summary.mdx`, and `calculated-fields.mdx`; the proof report names the example flows.
No application repair, docs-site lesson, or runnable example is implemented by this research PR.
Browser, author, filtered-hook, export, history, restore, and performance proofs remain unrun.

The [continuing queue](research-queue.md) uses existing catalogue IDs. R043 is the next eligible broad study.
R008 and the overlapping R011 survey remain complete. Reuse their findings instead of repeating them.
