---
id: page-touch-gestures-for-in-place-editing
label: Touch gestures for in-place editing
type: page
status: planned
priority: medium
parent: page-input-and-accessibility-gaps
metadata:
  purpose: Double-tap and long-press routes to the editors on touch screens.
---
Double-tap and long-press are not handled on touch screens. Axis bands set `touch-action: pan-y` / `pan-x`, so a drag works, but the range editor and the title editor need a touch route: double-tap, or long-press for the context menu.

