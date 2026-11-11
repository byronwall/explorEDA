---
id: note-grid-lines-draw-on-top-of-marks
label: Grid lines draw on top of marks
type: note
status: implemented
priority: high
parent: area-1-work-now
metadata:
  implementation: Canvas scatter points paint over an SVG grid underneath (fdbk-1111/rendering).
  purpose: Render grid lines (including the symlog grid line hit targets) below the marks in every chart. Seen on 'Revenue and margin per order' scatter.
images:
  - id: 9cd98601-6764-4bc0-b379-0d9d581147df
    src: /api/projects/untitled-project/images/note-grid-lines-draw-on-top-of-marks/9cd98601-6764-4bc0-b379-0d9d581147df.png
    filename: 9cd98601-6764-4bc0-b379-0d9d581147df.png
    originalName: 002.png
    mimeType: image/png
    size: 23456
    createdAt: 2026-11-11T19:42:01.415Z
  - id: 24674b8b-fbd5-4c27-8098-bc403e96b0a7
    src: /api/projects/untitled-project/images/note-grid-lines-draw-on-top-of-marks/24674b8b-fbd5-4c27-8098-bc403e96b0a7.png
    filename: 24674b8b-fbd5-4c27-8098-bc403e96b0a7.png
    originalName: 008.png
    mimeType: image/png
    size: 69641
    createdAt: 2026-11-11T19:42:01.415Z
---

## What to do

Render grid lines (including the symlog grid line hit targets) below the marks in every chart. Seen on 'Revenue and margin per order' scatter.

## Source

> There's a grid line that's sneaking on top of the rendered points... We want the grid lines to go below.

- Page: https://exploreda.dev/examples/shop-operations
- Marks: #2 @ 1:06, #8 @ 2:58
- Recording: /Users/byronwall/Movies/ContextRecorder/2026-11-11_14-13-10/session.md
