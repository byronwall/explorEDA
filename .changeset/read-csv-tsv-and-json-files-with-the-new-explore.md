---
"exploreda": minor
---

Read CSV, TSV, and JSON files with the new `exploreda/readers` entry (`readTableFile`, `readTableText`), and pass their declared types to `ExplorEda` through the new `fieldTypes` prop. Type detection now keeps values that a number would change, such as `0012` or integers past 2^53, as text, and project sources detect fields and types from every row instead of the first 500.
