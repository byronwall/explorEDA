---
"exploreda": minor
---

Add `compileDocument`, which builds a complete dashboard from compact text: field aliases and type checks, calculations, one chart per line with chart-local `where.` filters, and layout. Usable charts are built even when others fail, and every skipped or changed effect comes back as a located diagnostic with a suggested fix.
