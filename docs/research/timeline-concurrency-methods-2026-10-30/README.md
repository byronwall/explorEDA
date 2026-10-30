# Plan exact Timeline occupancy and conflicts

Build a concurrency strip in the existing Timeline. Use a saved finite window, half-open occupancy, and exact contributor queries.
Start with per-lane and all-row counts, durations, selection, traces, and reopen. Add occupied-lane summaries, then notebook interval findings.

- [Implementation plan](../../intent/timeline-concurrency/implementation-plan.md)
- [All eight original Pro artifacts](../../intent/timeline-concurrency/assets/pro-results/timeline-concurrency-methods-2026-10-30/README.md)
- [Local evidence and dispositions](evidence.md)
- [Pro conversation](https://chatgpt.com/c/6ae505ec-b0f4-83ea-a271-c0a84a70bed1)
- [Run record and candidate scores](run.md)

Topic score: **17/20**, Methods. Baseline: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`.
Pro finished in 23m 37s. Follow-ups: 0/1. Build is a planning disposition, not implementation approval.

The core decision is to separate simultaneous occupancy from the existing inclusive brush.
An adjacent end/start does not create a conflict. An open end needs a declared finite horizon.
Equal-count segments can have different contributors, so retain their boundaries even when drawing one continuous step.
Resolve records on demand instead of storing every active set.

The fixture gives lane A 240000 ms above one active interval and peak three.
Its five conflict witnesses are a union over time. All-lane activity has a different count and duration.
Saving an exact active-at query preserves its meaning through reordered or changed data without pretending row positions are durable identities.

Current code confirms separate own-selection, local population, facet, trace, export, and notebook boundaries.
The local plan adds explicit `filters`-array writeback checks and current-output-record labeling.
It treats Pro's module layout and performance triggers as suggestions.

Locally authored direct-cell checks passed 971 assertions across eight scenarios and the subwindow.
The supplied Python verifier remains unchanged and unexecuted locally; its 500 random checks are Pro-reported.
Existing Timeline tests passed during submission. Collection checks passed 32 ownership/notebook tests and all 74 docs tests.
No proposed feature, browser flow, performance budget, callback behavior, or persistence roundtrip is claimed tested.

Primary sources support explicit range bounds, grouped overlap counters, and the distinction from event-start concurrency:
[PostgreSQL ranges](https://www.postgresql.org/docs/current/rangetypes.html),
[Perfetto interval counters](https://perfetto.dev/docs/analysis/stdlib-docs#intervals-overlap), and
[Splunk concurrency](https://help.splunk.com/en/splunk-enterprise/search/spl-search-reference/10.6/search-commands/concurrency).

Open implementation questions concern measured acceleration and later segment snapshots.
Neither blocks the first milestone. Capacity planning, utilization, scheduling operations, and advanced notebook scope capture remain deferred.
