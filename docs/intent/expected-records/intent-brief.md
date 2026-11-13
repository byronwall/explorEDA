---
title: "Find records that should exist but do not"
slug: "expected-records"
phase: plan
status: current
last_updated: "2026-11-12"
---

# Find records that should exist but do not

This initiative holds the unbuilt half of the retired `missingness-and-expected-records` initiative. Joint missingness shipped and retired on 2026-11-12; its closure record is the `missingness-and-expected-records` entry in [the initiative history](../../initiative-history.json), and its behavior is on the [Joint missingness page](../../../apps/demo/src/docs/pages/joint-missingness.mdx).

The draft implementation plan is in open PR #579 (`codex/expected-records-design-2026-10-31`). That PR wrote it into the old folder. Move it here before you build.

## My read

An analyst sometimes needs to know which records are absent, not only which values are blank. A store that sent no report for a day, a patient with no visit in a due week, or a sensor with no reading for an hour has no row to inspect. A missing cell belongs to a row that exists. An absent record needs an independent reason to expect it.

The durable outcome is a defensible absence claim. The analyst supplies an explicit expected set, such as a key table or a bounded schedule. explorEDA compares it with the actual rows on typed matching keys. It shows which expectations matched, which are absent, which actual rows were not expected, and which keys were excluded on purpose. Each count leads back to its evidence rows.

Joint missingness already separates blank values from zero and false. This work adds the other condition from the original intent: records that are absent. It needs a different denominator, the expected set, so it is its own analysis and not a mode of the missingness chart.

## What matters most

- Require an explicit expected set for every missing-record claim.
- Keep absent, unexpected, excluded, and invalid keys separate and inspectable.
- Never treat a failed, missing, or partial input as proof of absence.

## The intended experience

Choose an expected table and an actual table, and pair their key fields. See one row per key with its state. Select the absent keys and see the expected rows that created each one. Add an exclusion with a reason, and see coverage change. Keep a coverage finding in a notebook, and see it recount when either input changes.

## Boundaries

Do not infer expected records from observed category combinations. A store closed on Sundays must not get missing Sunday records because other stores have them. Do not fill zeros, impute, match fuzzily, or grade data quality. A general join builder, a rules engine, and ingestion monitoring are outside this work. A zero, null, or invalid measurement on a valid key still counts as present.

## What seems settled

Matching keys are ordered typed tuples, so numeric 1 and text "1" differ. One distinct expected key is one obligation. Coverage is matched required keys divided by valid required keys. An empty actual table that loaded can establish absence. A file that failed to load cannot. The PR #579 plan stages the work as an exact core and inspector, a saved two-input analysis, notebook findings, then bounded date schedules.

## Current reality that matters

`sourceReferences` and `lookupFrame` report missing or ambiguous identities for related tables. They are inputs to this work, not an expected-record workflow. Folder reads use empty arrays for failed reads, so read state must travel with the rows before reconciliation trusts an empty input.

## Next step after confirmation

Rebase PR #579 so its plan and assets land in this folder. Then review the plan and start its first milestone.
