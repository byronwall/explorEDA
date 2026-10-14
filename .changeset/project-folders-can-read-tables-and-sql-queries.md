---
"exploreda": minor
---

Project folders can read tables and SQL queries from SQLite databases. Add a `connection` line and point a source at it with `db=` and `table=` or `sql=`. Each source is read on request into a snapshot the project opens from, and `npx exploreda --example database` opens a sample.
