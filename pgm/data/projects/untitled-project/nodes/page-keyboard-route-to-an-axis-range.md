---
id: page-keyboard-route-to-an-axis-range
label: Keyboard route to an axis range
type: page
status: planned
priority: high
parent: page-input-and-accessibility-gaps
metadata:
  purpose: Reach and nudge an axis range without a mouse.
---
The axis band (`.eda-axis-strip`) is not focusable. Keyboard users reach the range editor only through the context menu on a focused axis title, and an axis without a title has no route at all.

- Let Enter on a focused tick label open the range editor.
- Consider arrow keys to nudge a focused axis (pan), with Shift for larger steps, as one undo step per key burst.

