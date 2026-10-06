# Retained language design notes

These notes preserve the useful research conclusions. The parent [feature view](../detailed-shaping.md) defines current product scope.

## Everyday grammar

Prefer explicit roles: `scatter x=revenue y=margin`. Flat pairs avoid repeated indentation. Optional `+` lines wrap a declaration. Quoted values protect spaces and punctuation. Exact spelling remains provisional.

Use aliases for authoring, exact names for data binding, and labels for display. An expected type checks a contract. Conversion needs an explicit request. A label must not change field identity.

## Calculations

`calc profit=revenue-cost` creates a row-level field. A metric such as `metric sum=profit` aggregates rows. These are different operations.

Resolve calculation dependencies rather than requiring declaration order. Diagnose cycles and field-name collisions. Preserve the native expression engine’s value semantics. Never rewrite aliases inside quoted strings by simple text replacement.

Percent formatting changes display, not the stored value. Missing or invalid values must not silently become zero. Report affected rows and give examples when evaluation fails.

## Filters and empty values

A quoted category containing a comma is one value. An unquoted comma-separated selection can describe several values. Preserve the distinction between missing, empty text, empty selections, and omitted settings.

Chart-local restrictions are confirmed. The earlier linked-filter-only proposal is superseded. A failed restriction cannot silently become a broader chart.

## Complete dashboard meaning

Use app defaults for omitted settings. Charts without names must work. Optional names aid reference, but the document is not a patch to prior dashboard state.

Native settings remain authoritative after application. Export current settings on demand. Source-text comments and original formatting do not need continuous synchronization.

## Detailed settings

Flat property paths reach every setting. Records in a list are written by index, empty lists and objects use `[]=` and `{}=`, and `unset` restores a default. Quoted segments hold literal keys. JSON escapes from the prototype are rejected.

Every native setting remains the eventual coverage goal. Partial rendering must identify unsupported effects rather than imply full support.

## Checking and repair

Expose locations, causes, suggestions, and available fields/settings. Continue with independent usable declarations. Identify unavailable charts, substituted defaults, skipped effects, and row failures.

The historical prototype’s strict success boundary does not define current application behavior. Keep failed source repairable and report whether the result is complete.

## Example and references

[Dashboard example](dashboard-example.eda) preserves the final research spelling. Its `where` declarations must follow the new chart-local requirement. It is an illustration, not a runnable acceptance test.

[Source references](references.md) identify the repository contracts inspected during the research. Their pinned revision is historical.
