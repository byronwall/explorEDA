# Two catalogue dates do not necessarily make a lifespan — design and analytical contract

**Question.** What goes wrong when birth and death fields are treated as complete biographies?

**Encoding.** A swarmed dot row compares recorded date spans while separating the explicitly named family entity.
**Ordering.** Entity labels alphabetically; source records are not ranked as human lifespans.
**Baseline.** Zero is no difference between the supplied dates, not an inferred age at death.
**Scale.** Shared linear year-span scale. Missing spans do not become zero-valued dots.

## Fixed-snapshot findings

The largest recorded date span in this prefix was 138 years; it belongs to the explicit family entity. Eligible rows: 41; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-tate-catalogue-span.json).

Blank death-year fields represent 31.67% of this archive prefix. Eligible rows: 60; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-tate-catalogue-span.json).

## What this design gives up

The prefix is not representative. A blank death field supplies no current living-status information, and catalogue entities are not necessarily individuals.

This is the first sixty alphabetically ordered records in Tate’s October 2014 archive, not a representative artist sample. A blank death year is not evidence that someone is alive today. The explicit Alken Family entry is not one person.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

Tate collection metadata, October 2014 archive; first 60 records; CC0 1.0.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](../../evidence/fields/tate.json).
