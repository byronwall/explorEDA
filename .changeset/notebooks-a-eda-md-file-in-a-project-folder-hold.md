---
"exploreda": minor
---

Notebooks: a `.eda.md` file in a project folder holds Markdown prose with `eda` blocks of dashboard text. `readNotebookText`, `compileNotebook`, and `writeBackChart` build it and write chart edits back as minimal text changes, and `exploreda-dsl check`, `fmt`, and `project` accept notebooks. Axis ranges on date axes now read and write ISO dates, such as `x.min=2021-02-07`.
