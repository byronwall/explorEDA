---
"exploreda": patch
---

Axis tick labels are more reliable: a crowded axis keeps its baseline label, a symlog axis inside one decade still shows ticks, neighbouring ticks never share a label, compact labels use one notation ($8K beside $10K) and never widen with a field precision, long value labels no longer get cut off at the left margin, a band Y axis thins labels it cannot fit, values that round to zero read 0 instead of -0, a log or symlog axis pans one pixel at a time, and a color legend whose values do not fit on its line keeps the rest behind a "+N more" disclosure instead of hiding them.
