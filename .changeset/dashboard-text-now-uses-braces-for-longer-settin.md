---
"exploreda": minor
---

Dashboard text now uses braces for longer settings: a line ending in { opens a body that } closes, and spacing never changes meaning, so pasted text reads the same. A layout block places charts one band per line (5: size size species island, or bill:7 mass:5), and charts go by their field when they have no @name. Views are written as view "Name" { … }, dashboard and theme take plain values (dashboard "Sales", theme newsprint), formatDsl and exploreda-dsl fmt indent by brace depth, and + continuation lines are gone.
