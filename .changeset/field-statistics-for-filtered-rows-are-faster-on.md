---
"exploreda": patch
---

Filter changes on large data spend much less time recomputing field statistics. Data tables profile only their own columns, and numeric statistics read each value once.
