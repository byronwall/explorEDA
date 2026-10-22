---
"exploreda": patch
---

When new `data` arrives with the same `savedData`, a saved row selection now follows its records to their new positions. A filter whose record is gone, changed, or repeated is dropped, so it never selects a different row in that record's old place.
