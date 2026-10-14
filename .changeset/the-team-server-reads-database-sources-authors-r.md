---
"exploreda": minor
---

The team server reads database sources: authors read and refresh them, viewers see the last read without querying the database, admins enter connection passwords (kept in exploreda.db), and authors can upload SQLite files. Upgrading migrates the account store to schema 2 with a backup, and a failed upgrade now rolls back every pending migration.
