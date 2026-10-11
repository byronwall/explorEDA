---
id: page-dragging-the-annotation-around-does-not-update-until-release
label: Dragging the annotation around does not update until release
type: page
status: implemented
parent: page-driving-shifts
metadata:
  implementation: Dragging an anchored annotation or a guide label now re-resolves the scene with the moved offset, so the ring stays on 2008 and the leader follows the text live.
images:
  - id: 096ed67d-7214-460e-982a-7bfede80de0d
    src: /api/projects/untitled-project/images/page-dragging-the-annotation-around-does-not-update-until-release/096ed67d-7214-460e-982a-7bfede80de0d.png
    filename: 096ed67d-7214-460e-982a-7bfede80de0d.png
    originalName: image.png
    mimeType: image/png
    size: 57224
    createdAt: 2026-10-11T01:38:33.945Z
---
Looks odd, since the target point is not fixed to 2008, instead it floats and re-anchors on release.
