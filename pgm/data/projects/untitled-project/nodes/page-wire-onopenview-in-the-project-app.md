---
id: page-wire-onopenview-in-the-project-app
label: Wire onOpenView in the project app
type: page
status: planned
priority: high
parent: area-combine-tables-without-sql
metadata:
  purpose: apps/app ProjectWorkspace.tsx:573-583 omits onOpenView, so 'New query from this table' (SchemaStepEditors.tsx:414) and expand (QueryRelationshipBuilder.tsx:75) never show. Only the demo passes it. Task 4.
---
