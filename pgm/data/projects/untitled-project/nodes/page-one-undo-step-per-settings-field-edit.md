---
id: page-one-undo-step-per-settings-field-edit
label: One undo step per settings-field edit
type: page
status: planned
priority: medium
parent: page-input-and-accessibility-gaps
metadata:
  purpose: Stop settings inputs from recording one undo step per keystroke.
---
Inputs in the settings popover, such as the Labels tab's title and the Axes Min/Max fields, call `updateChart` on each keystroke. The demo records one undo step per keystroke because `onStateChange` is not coalesced.

Wrap a focused settings field in a held edit (`holdStateChanges`, as `useChartEdit` does) so one field edit is one step.

