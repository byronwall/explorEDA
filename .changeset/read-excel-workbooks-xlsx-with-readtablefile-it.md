---
"exploreda": minor
---

Read Excel workbooks (`.xlsx`) with `readTableFile`. It reads the largest sheet, or the one `sheet` names, starting at the header row below any title rows; `table.sheets` lists every sheet with its size. Formulas read as their saved results, and the workbook reader loads only when a workbook is read.
