---
id: page-propose-relationships-from-foreign-keys-and-key-names
label: Propose relationships from foreign keys and key names
type: page
status: needs-review
priority: high
parent: area-combine-tables-without-sql
metadata:
  implementation: "Fixed in https://github.com/byronwall/explorEDA/pull/625 (stack on #609), not merged yet."
  purpose: No relation suggestions exist. Read FKs per driver (SQLite PRAGMA foreign_key_list, information_schema elsewhere), match *_sk/*_id names, check value overlap, show match counts. TPC-DS has no FKs, so name matching matters.
---
