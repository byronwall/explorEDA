# "doesn't fit" warnings give no fix or allowed values; listed bar settings (spec.upper, bins.\*) are rejected as not fitting "histogram"

- Kind: confusing
- Tool: `check`
- Sent: 2026-11-23T01:35:31.150Z

## What happened

1. `bar @x orders.amount spec.upper=100 bins.mode=width bins.width=100 bins.origin=0 facet...` returned one warning: "spec.upper=100 bins.mode=width bins.width=100 bins.origin=0 doesn't fit histogram, so bar keeps the default histogram." with no fix. reference bar lists all four settings with those exact forms, so I can't tell which is wrong or why. Same for `hist ... spec.upper=100`. 2) Settings listed with no description or values in reference (share=, scaleTo=, seriesLayout=, direction=, showQuantiles=, showOverall=, topN=, valueFormat= on the per-type page) — trying a bad value gives "direction=zzz doesn't fit direction" with no fix and no list of accepted values, so they cannot be discovered. 3) `pivot @p rows=orders.channel { value count label="Orders" }` gave "is missing a required setting, so it was skipped" without naming the setting.

## Proposed fix

Give every "doesn't fit" warning a fix naming the accepted values or shape (e.g. "direction takes above|below"), report each rejected setting separately, and name the missing required setting for pivot. In reference <type>, add a description and values for every listed setting, and explain what spec.lower/upper draw and which bins.\* must be combined.
