# Renderer-neutral annotation model — research companion

Prepared 2026-10-01. This is a proposed reference contract, not a shipped annotation
standard, chart adapter, browser editor, runtime JSON validator, or collaboration
backend. The model deliberately excludes vendor objects and executable callbacks.

## Files
- `annotation-model.ts`: version 1.0.0 types, edit events/operations, transient state,
  and a minimal coordinate adapter contract.
- `examples.ts`: typed examples of a datum-bound mixed-coordinate callout, a
  data-value range band, a normalized freehand stroke, and a label-move transaction.
- `examples.json`: generated JSON envelope containing `document` and
  `exampleTransaction`. Only `document` has the AnnotationDocument shape.

## Verification performed
`tsc --strict --target ES2022 --module commonjs --noEmit` accepted the two TypeScript
files. The JSON was emitted from those typed examples and parsed back. Sample
cross-reference invariants were checked. This does not validate arbitrary inbound
JSON and is not a browser or library compatibility test.

## Coordinate conventions
- `axis` uses a semantic axis ID, not an axis array index. The adapter supplies the
  actual current scale, projection, orientation, band position, and facet bounds.
- `plot-fraction`: top-left of the plot is (0,0), bottom-right is (1,1). Fractions
  may be outside that interval; clipping is a separate policy.
- `view-css-px`: top-left of the entire chart view is (0,0), y increases downwards.
- Label offsets and visual dimensions are CSS pixels. They do not grow with the
  data scale or device-pixel ratio. Export must choose a logical viewport/scale.
- Datum anchors follow stable row keys and field bindings, not a saved coordinate.
  Their snapshot is an explicitly stale fallback, never an automatic reattachment.
- Continuous freehand axis coordinates use numbers or epoch milliseconds. V1 does
  not pretend that categorical stroke coordinates are stable data identities.
- A facet key identifies data (for example region=West), not the third panel.

## Invariants a production runtime validator must enforce
Validate the document against generated JSON Schema or an equivalent runtime
schema, then validate cross-field invariants:
1. Unique IDs; annotation map key equals record ID; order references each existing
   annotation exactly once; anchor/asset/dataset/view/axis references exist.
2. All numeric values are finite; opacity/pressure are within [0,1]; visual sizes
   are nonnegative; arrays have sensible limits; timestamps are canonical RFC3339.
3. Geometry references have the required cardinality and compatible scopes/axes.
   Highlight targets yield regions; image content refers to an image asset; labels
   contain text; freehand axes are continuous. Cross-view lines need an explicit
   cross-view adapter rather than an accidental projection.
4. Row keys match the configured dataset key fields. Log-domain values are valid.
5. Resolver IDs/versions are allowlisted. No arbitrary functions, HTML, SVG code,
   DOM/canvas objects, or unsafe URLs are accepted in document JSON.
6. The schema major version is supported. Migrations are pure, versioned, tested,
   and do not change document revision, adapter version, and schema version as if
   these were one concept.

## Production policies outside the type contract
- Use an authoritative semantic document plus vendor-projected render state.
  Keep editor selection, hover, draft gestures, guides, and auto-layout caches out
  of persistent document snapshots.
- Gesture begin/preview/commit/cancel is separate from server writes. One gesture
  commits one transaction. Build inverses against the changed fields, not an entire
  shared document. Full production commands also need reorder/lock/policy/asset
  updates; the supplied operation union illustrates the core edit boundary only.
- On concurrent edits, choose CRDT/OT field granularity deliberately. Treat an
  anchor tuple atomically; merge independent properties; use tombstones for delete.
  Actor-local undo must not restore an old snapshot over a collaborator's edits.
- Server authorization is independent of the UI `locked` flag. Validate asset
  permissions, remote data access, resolver execution, and document ownership.
- Save canonical snapshots plus an optional operation log. Separate schema version,
  document revision, dataset revision, and adapter/library versions.
- Distinguish filtered, offscreen, deleted, unavailable, invalid-value, missing-axis,
  and missing-facet states. Never silently attach a deleted key to the nearest row.
- Reproject on zoom, layout, resize, filter, data refresh, axis changes, and export.
  Export the semantic JSON as a sidecar when editability or provenance matters.
- Accessibility needs a DOM annotation list, meaningful reading order, focus
  restoration, keyboard commands, and a non-drag single-pointer alternative such
  as coordinate forms. A canvas chart's own accessibility does not cover its editor.

## Build example
```sh
tsc --strict --target ES2022 --module commonjs --outDir build annotation-model.ts examples.ts
node build/examples.js > examples.json
```
