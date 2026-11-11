---
id: note-rule-no-instruction-or-summary-text-in-chart-footers
label: "RULE: No instruction or summary text in chart footers"
type: note
status: needs-review
priority: high
parent: area-2-cross-cutting-rules-confirm-scope
metadata:
  purpose: "Scope: does this remove ALL footer text (also data facts like '673 rows in 12 lanes · 3 with no end' and 'Showing 673 of 673 rows'), or only instructions and interaction hints? You liked the heatmap 'No rows' text and 'Show all twelve'. Where should interaction hints go, if anywhere (tooltip, shortcut sheet, nowhere)?"
images:
  - id: 57ef15c3-cd6c-4b9d-9314-e871bdc6e739
    src: /api/projects/untitled-project/images/note-rule-no-instruction-or-summary-text-in-chart-footers/57ef15c3-cd6c-4b9d-9314-e871bdc6e739.png
    filename: 57ef15c3-cd6c-4b9d-9314-e871bdc6e739.png
    originalName: 017.png
    mimeType: image/png
    size: 21046
    createdAt: 2026-11-11T19:42:37.508Z
  - id: 4e515fd3-1a39-49a3-aa57-645bdfab5884
    src: /api/projects/untitled-project/images/note-rule-no-instruction-or-summary-text-in-chart-footers/4e515fd3-1a39-49a3-aa57-645bdfab5884.png
    filename: 4e515fd3-1a39-49a3-aa57-645bdfab5884.png
    originalName: 027.png
    mimeType: image/png
    size: 19701
    createdAt: 2026-11-11T19:42:37.508Z
  - id: 10e2383f-77b5-4d01-b23e-9ab6e078f91c
    src: /api/projects/untitled-project/images/note-rule-no-instruction-or-summary-text-in-chart-footers/10e2383f-77b5-4d01-b23e-9ab6e078f91c.jpg
    filename: 10e2383f-77b5-4d01-b23e-9ab6e078f91c.jpg
    originalName: 032.jpg
    mimeType: image/jpeg
    size: 161652
    createdAt: 2026-11-11T19:42:37.508Z
  - id: 5725b579-ac7e-43f9-89bf-1939062d1ebe
    src: /api/projects/untitled-project/images/note-rule-no-instruction-or-summary-text-in-chart-footers/5725b579-ac7e-43f9-89bf-1939062d1ebe.png
    filename: 5725b579-ac7e-43f9-89bf-1939062d1ebe.png
    originalName: 035.png
    mimeType: image/png
    size: 24363
    createdAt: 2026-11-11T19:42:37.508Z
  - id: 952766e3-8090-48d7-8872-be5a9c7a4742
    src: /api/projects/untitled-project/images/note-rule-no-instruction-or-summary-text-in-chart-footers/952766e3-8090-48d7-8872-be5a9c7a4742.jpg
    filename: 952766e3-8090-48d7-8872-be5a9c7a4742.jpg
    originalName: 036.jpg
    mimeType: image/jpeg
    size: 164801
    createdAt: 2026-11-11T19:42:37.508Z
  - id: b63b771c-b99d-4ce8-9c2a-b9d75979393e
    src: /api/projects/untitled-project/images/note-rule-no-instruction-or-summary-text-in-chart-footers/b63b771c-b99d-4ce8-9c2a-b9d75979393e.jpg
    filename: b63b771c-b99d-4ce8-9c2a-b9d75979393e.jpg
    originalName: 037.jpg
    mimeType: image/jpeg
    size: 162382
    createdAt: 2026-11-11T19:42:37.508Z
  - id: 62331285-3070-4685-aae7-796f8906ae37
    src: /api/projects/untitled-project/images/note-rule-no-instruction-or-summary-text-in-chart-footers/62331285-3070-4685-aae7-796f8906ae37.jpg
    filename: 62331285-3070-4685-aae7-796f8906ae37.jpg
    originalName: 039.jpg
    mimeType: image/jpeg
    size: 178104
    createdAt: 2026-11-11T19:42:37.508Z
  - id: 5d418621-e46d-45b3-916f-f2ad7367e0bf
    src: /api/projects/untitled-project/images/note-rule-no-instruction-or-summary-text-in-chart-footers/5d418621-e46d-45b3-916f-f2ad7367e0bf.jpg
    filename: 5d418621-e46d-45b3-916f-f2ad7367e0bf.jpg
    originalName: 040.jpg
    mimeType: image/jpeg
    size: 178028
    createdAt: 2026-11-11T19:42:37.508Z
---

## What to do

Remove footer lines such as '12 category series pairs', 'Missing periods are gaps/zero', 'Click groups to select · Alt-click to inspect · medians', 'Click rows or labels to select a category', 'Drag across time to select · click a bar'.

## Question for Byron

Scope: does this remove ALL footer text (also data facts like '673 rows in 12 lanes · 3 with no end' and 'Showing 673 of 673 rows'), or only instructions and interaction hints? You liked the heatmap 'No rows' text and 'Show all twelve'. Where should interaction hints go, if anywhere (tooltip, shortcut sheet, nowhere)?

## Source

> We should not have instructional text on the chart. That's just gross.

- Page: https://exploreda.dev/docs/bar (also /docs/line, /docs/boxplot, /docs/ecdf, /docs/heatmap, /examples/message-log-heatmap)
- Marks: #17 @ 5:56, #27 @ 8:54, #32 @ 10:08, #35 @ 10:53, #36 @ 10:56, #37 @ 11:18, #39 @ 12:24, #40 @ 12:26
- Recording: /Users/byronwall/Movies/ContextRecorder/2026-11-11_14-13-10/session.md
