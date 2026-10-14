---
"exploreda": minor
---

Chart edits in a notebook now save to its `.eda.md` text: `ExplorEdaNotebook` takes `onTextChange`, and `writeBackSettings` changes only the settings that were edited, leaving comments and other lines as written. Line series written with a field alias, such as `series actual`, now apply, and changing a table, line, or scatter chart to another type keeps its main field.
