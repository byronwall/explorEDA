# Build notebook Definitions, source and Return

Build one temporary inspector for a plotted field's definition, source jumps with Return, precise consumer lists, and a searchable outline. Readers can follow a measure across blocks and sheets without losing their place.

[Implementation plan](../../intent/notebook-definition-navigation/implementation-plan.md) · [Decisions and evidence](../../intent/notebook-definition-navigation/decisions.md) · [All 16 original Pro assets](../../intent/notebook-definition-navigation/assets/pro-results/notebook-definition-design-2026-11-02/README.md) · [Pro conversation](https://chatgpt.com/c/6ae7fa12-b5c8-83e9-8403-d04a09672571).

R066 scored **16/20**: capability 4, Pro advantage 4, buildable 4, momentum 4. The run used Design, one message and no follow-up. Pro worked for 29m 36s.

The existing compiler shares definitions across blocks. It lacks source identity and resolved consumer metadata. Add those through existing parser and compiler paths. Use accepted settings rather than summary labels. Replace ordinal fallback memory with block identity when source navigation ships. Keep live chart inputs separate from authored text.

A finding follows its chart population and reads its own measure. Changing the example card from net to gross yields 250; the net finding remains 125. These values define acceptance; the proposed navigation is not implemented.

Four milestones: definition peek; keyed source and Return; consumers/findings/composition; searchable outline. Each includes its docs section, the same runnable example, and responsive keyboard checks. Optional graphs and host edit maps remain Explore. Permanent history, durable URLs and rename refactoring remain deferred.

Local checks ran the actual compiler on the main fixture plus 24 source variants. All 25 cases passed applicable accepted-chart, calculation and status assertions. Existing notebook suites passed another 29 tests. The original diagrams were inspected. Pro's supplied verification is preserved and attributed separately. No feature/browser/performance acceptance is claimed.

Review the proposed M2 memory API and conservative identity limits. Defaults are sufficient to start M1 after implementation approval. No further Pro message is needed. This research PR does not implement the feature.
