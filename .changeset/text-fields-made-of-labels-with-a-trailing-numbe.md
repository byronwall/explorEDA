---
"exploreda": patch
---

Text fields made of labels with a trailing number, such as "Depot 2" or "Route 7", are now detected as categorical instead of datetime. ISO dates, slash dates like 1/15/2025, and month-name dates such as "Jan 15 2025" still detect as datetime.
