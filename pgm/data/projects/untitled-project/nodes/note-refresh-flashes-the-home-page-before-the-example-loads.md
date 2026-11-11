---
id: note-refresh-flashes-the-home-page-before-the-example-loads
label: Refresh flashes the home page before the example loads
type: note
status: implemented
priority: high
parent: area-1-work-now
metadata:
  implementation: An example URL shows a blank loading area, not the home page, while data loads (fdbk-1111/demo-shell).
  purpose: On refresh of an example page, show a loading state. Do not render the home page first. Check if this is an SSR or route-fallback issue.
images:
  - id: 2f6f1adc-809d-41d2-8d21-8a9d6ac4171e
    src: /api/projects/untitled-project/images/note-refresh-flashes-the-home-page-before-the-example-loads/2f6f1adc-809d-41d2-8d21-8a9d6ac4171e.jpg
    filename: 2f6f1adc-809d-41d2-8d21-8a9d6ac4171e.jpg
    originalName: 001.jpg
    mimeType: image/jpeg
    size: 153350
    createdAt: 2026-11-11T19:41:58.196Z
---

## What to do

On refresh of an example page, show a loading state. Do not render the home page first. Check if this is an SSR or route-fallback issue.

## Source

> I refresh the page, I do not like how it kicks over to the home page briefly... it just shows a loading screen and does not flash the home screen.

- Page: https://exploreda.dev/examples/shop-operations
- Marks: #1 @ 0:26
- Recording: /Users/byronwall/Movies/ContextRecorder/2026-11-11_14-13-10/session.md
