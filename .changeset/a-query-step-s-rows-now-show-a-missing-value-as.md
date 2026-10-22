---
"exploreda": patch
---

A query step's rows now show a missing value as a small centered `null`, like other tables, instead of a dash. A database refresh whose connection fails to close after the new snapshot is written now reports success, and a read error is no longer hidden by a close error.
