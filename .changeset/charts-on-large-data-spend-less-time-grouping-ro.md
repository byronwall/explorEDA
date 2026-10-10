---
"exploreda": patch
---

Charts on large data spend less time grouping rows by category: category keys for numbers and booleans are built directly, and string keys are reused instead of serialized for every row.
