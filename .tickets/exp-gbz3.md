---
id: exp-gbz3
status: open
deps: []
links: []
created: 2026-10-06T01:48:03Z
type: feature
priority: 3
assignee: saved_views
tags: [saved-views]
---
# Show who made each history step in shared sessions

The History timeline already renders an optional author (initial avatar and name) on each step, and HistoryEntry has an author field. Nothing sets it yet because sessions are local to one browser. When sessions sync between people, stamp author on each checkpoint in pushCheckpoint and decide which metadata belongs beside it in the expanded view (for example the device or a comment).

## Acceptance Criteria

- New checkpoints record the signed-in user's name.
- Compact timeline shows the name in the meta line; the expanded view shows it with the time.
- Steps without an author still render as they do now.

