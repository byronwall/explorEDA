---
title: "Retention observation window"
slug: "retention-observation-window"
phase: intent
status: current
last_updated: "2026-10-23"
---

# Retention observation window

## My read

[Retention](../../../apps/demo/src/docs/pages/retention.mdx) shipped with blank future periods, a hatched final period, traces, and entity selection. A research review on 2026-10-21 kept the event-snapshot contract: retention reads events and never infers how long collection ran, because a quiet period and missing collection produce the same rows. That review found two narrow issues worth checking. It approved no new feature.

## What matters most

1. **The partial-period rule doesn't match the docs.** The partial flag rounds the latest timestamp up to the end of its UTC date. So daily cells are never marked partial, and weekly and monthly cells lose the mark on their last day. Either fix the rule or state the exception on the retention page.
2. **The All row mixes in partial cells without saying so.** All pools every cohort that has reached a period, including partial cells, and has no partial cue or trace for that. In an eight-row fixture, leaving partial cells out changes Week 1 from 2/3 to 1/2. Decide between disclosing this and excluding partial cells, but only after someone actually misreads a summary.

## Boundaries

- Keep the event-snapshot contract. Don't infer continuous collection, add zero events, or quietly change the All denominator.
- No observation-end setting until a task supplies authoritative coverage. A single end date can't express interior gaps or unequal coverage per entity.
- No coverage engine and no survival model.

## What seems settled

Retention's shipped behavior stays as it is: blank future periods, a hatched final period, an All row over the cohorts that have reached each period, and the trace. Both items are checks against that behavior, not new features.

## Next step after confirmation

Check issue 1 against the retention plan code with an eight-row fixture, then fix the code or the docs.
