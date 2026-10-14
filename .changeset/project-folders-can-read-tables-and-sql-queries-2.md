---
"exploreda": minor
---

Project folders can read tables and SQL queries from PostgreSQL. Add a `driver=postgres` connection; the app asks for its password once and keeps it outside the project, or reads it from `EXPLOREDA_<NAME>_PASSWORD`. Each read runs in a read-only transaction.
