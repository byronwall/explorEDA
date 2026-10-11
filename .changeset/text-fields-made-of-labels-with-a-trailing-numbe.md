---
"exploreda": patch
---

Fields are typed more reliably. Labels with a trailing number, such as "Depot 2" or "Route 7", and hex-style codes such as "0x1A" now stay categorical instead of reading as dates or numbers. Impossible dates such as 2025-02-30 are no longer accepted, and "TRUE"/"FALSE" columns are detected as boolean. Dates without a time zone, including slash dates like 1/15/2025 and month-name dates like "Jan 15 2025", now read as UTC everywhere, so field details, filters, and daily bins agree in every time zone.
