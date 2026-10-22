---
"exploreda": minor
---

A notebook with two or more `#` headings reads as a book of sheets: each heading starts a sheet, shown as a tab and read one at a time, with the text before the first heading as the lede above them. Sheets share the notebook's rows and definitions. `ExplorEdaNotebook` takes `sheet` and `onSheetChange` so a host can keep the open sheet in the address, and `notebookSheets()` splits a parsed notebook the same way. In the sections layout, a lede followed only by a block of field definitions now spans the page instead of the 300 px text column.
