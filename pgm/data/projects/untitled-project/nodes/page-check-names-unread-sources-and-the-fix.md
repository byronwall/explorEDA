---
id: page-check-names-unread-sources-and-the-fix
label: check names unread sources and the fix
type: page
status: needs-review
priority: high
parent: area-text-and-cli-parity
metadata:
  implementation: "Fixed in https://github.com/byronwall/explorEDA/pull/615 (stack on #609), not merged yet."
  purpose: "check prints 'is not a field ... fix: Fields: .' with an empty list. The real cause ('hasn't been read from its database yet', folder.ts:170) only shows in project output. Tasks 2, 5, 7."
---
