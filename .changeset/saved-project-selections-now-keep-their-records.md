---
"exploreda": patch
---

Saved project selections now keep their records in workspace and chart-local filters, not only chart and Rows filters, and a workspace filter on a field the query lacks now holds the settings back like other filters. Expanded query rows get distinct keys even when source keys contain colons, and a source key ending in `:row:N` is read as a key, not a row position. Selections saved on expanded rows by earlier versions report as unresolved.
