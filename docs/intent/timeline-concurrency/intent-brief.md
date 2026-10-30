# Measure Timeline occupancy and exact conflicts

An analyst can see overlapping interval bars today. They cannot measure simultaneous occupancy or conflict duration from those bars.
Add an opt-in analysis to the existing Timeline. Keep the source records and exact calculation available together.

The requested outcome is a finite-window analysis with exact counts, elapsed durations, and current contributing records.
Distinguish a conflict within one lane from activity across several lanes.
Retain inclusive brush selection as a separate record operation.

The [implementation plan](implementation-plan.md) defines three increments with docs, examples, and acceptance values.
The [Methods summary](../../research/timeline-concurrency-methods-2026-10-30/README.md) records the decision and checks.
All eight [original Pro artifacts](assets/pro-results/timeline-concurrency-methods-2026-10-30/README.md) remain unchanged.

Status: planned. Build dispositions do not approve implementation.
Booking edits, recurrence, utilization, resource optimization, and live derived datasets are outside this initiative.
