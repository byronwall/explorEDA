---
"exploreda": patch
---

Filtering is much faster in workspaces whose host passes `onStateChange` snapshots back as `savedData`, such as `ExplorEdaProject`: the echoed snapshot no longer rebuilds every chart. Date filters on line charts no longer slow down with the square of the row count.
