---
id: page-drop-the-legacy-axis-min-max-placeholder
label: Drop the legacy axis min/max placeholder
type: page
status: planned
priority: low
parent: page-cleanup-and-retirement
metadata:
  purpose: Stop writing the unused axis min/max placeholder.
---
`DEFAULT_AXIS_SETTINGS` writes `min: 0, max: 100` into every axis. No renderer reads them, and #204 marks them `@deprecated`, because limits live under `limits`. In a future major release, stop writing the keys and strip them on restore.

