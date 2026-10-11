---
"exploreda": minor
---

Add license keys. Pass `licenseKey` to `ExplorEda` or `ExplorEdaProject`, or call `setLicenseKey` from the new `exploreda/license` entry. Without a valid key everything still works and the status bar shows a small notice. Workspace settings has a License tab, and `npx exploreda license check` checks a key in CI.
