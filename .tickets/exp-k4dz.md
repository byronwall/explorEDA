---
id: exp-k4dz
status: open
deps: []
links: []
created: 2026-09-26T19:45:00Z
type: feature
priority: 3
assignee: Byron Wall
tags: [field-inspection, dates]
---

# Align date bins in field inspection to calendar units

## Outcome and Why

The field inspector's Values tab bins dates into equal time widths from the first to the last date. Bin edges therefore fall mid-month or mid-day, and the hover readout names partial periods. Bins that follow days, weeks, months, or years would read the way people think about dates.

## Scope

Own date binning in `packages/explorEDA/src/lib/fieldDistribution.ts` and the date label format in `FieldInspector.tsx`. Choose the calendar unit from the date span (UTC), keep shared bins for all rows and rows after chart filters, and keep counts equal to the field profile. Coordinate with calendar filtering and time axes (gap analysis rank 4) so the units match.
