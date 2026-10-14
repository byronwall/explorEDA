---
"exploreda": minor
---

Read JSON Lines (`.jsonl`, `.ndjson`) files. JSON integers past 2^53 now keep their digits as text, arrays stay together as JSON text in one field instead of numbered columns, and a JSON object whose one array holds the records opens those records.
