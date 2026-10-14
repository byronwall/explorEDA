---
"exploreda": minor
---

When a newer `exploreda server` needs to change the account store, it backs it up into `backups/<time>/` first, and it stops without changing anything if the upgrade fails. An older version refuses a data folder that a newer one wrote.
