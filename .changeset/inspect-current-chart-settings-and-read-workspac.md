---
"exploreda": minor
---

Pass a ref to `ExplorEda` and call `ref.current.getSettings()` to read the current workspace settings at any time, including right after mount without `savedData`. A new Chart spec tab in workspace settings shows what each chart saves: its fields, place in the grid, filters, settings as a list or copyable JSON, and the calculations, color scales, and grouped summaries it references.
