# Schema diagram — question rounds

## Round 1 of 3: goals and stakes (2026-11-27)

Superseded on 2026-11-27 by round 1b. Byron did not answer it before W1–W4 shipped, and those changes moved several questions.

Evidence: on the CI project, the five views read 16 of 139 fields from 4 of 14 tables. All 14 queries are one-step reads.

1. **What do you open the Schema diagram for, most often?** (decides the anchor: tables or views)
   - a. To see where a chart's numbers come from (trace from views back). _Points to Option 2._
   - b. To get an overview of all the data, then pick something to use. _Points to Option 1._
   - c. To edit the model: keys, relationships, types, query steps.
   - d. About equal; I want both. _Points to Option 3._
2. **How should unused tables appear by default?**
   - a. Recommended: a compact "Not used" group of one-line table headers that expands.
   - b. Full cards, but faded and sorted last.
   - c. Hidden behind a "Show all" toggle.
3. **How should unused fields inside a used table appear?**
   - a. Recommended: fold to "+ 9 more fields"; click to expand.
   - b. Show all fields, with used fields bold and marked.
   - c. Show only used fields and keys.
4. **A query that only reads one table ("Read Coverage"): what should it draw?**
   - a. Recommended: no card; merge it into its table, with the query glyph on the table header.
   - b. Keep the card, made much smaller.
   - c. Keep it as is.
5. **Which outcome would make this "not a mess" for you?**

   - a. Recommended: at the drawer's fit size, used tables, fields and views are readable without zooming, and no line crosses more than one column gap.
   - b. Everything fits on one screen at a readable size, used or not.
   - c. Something else (describe what the good version looks like).

6. **Added after W4's answers: relationships.** You told W4 that the CI dashboards are built on relationships, but the project declares none. Runs, Jobs, and Steps share `run_id` and `job_id`. Do you mean relationships that should be declared and drawn, or tables that were joined before export? Should the diagram suggest likely links from shared key names?

Answers: _waiting for Byron, asked as plain text so he can answer by voice_

## Round 1b: goals and stakes after W1–W4 shipped (2026-11-27)

Asked as plain text so Byron can answer by voice. Questions and explanations are in the conversation. Topics:

1. The diagram's main job now that hover and the explorer exist: relating tables, a coverage map of what the dashboards use, or the full model.
2. Relationships for file sources: what "built on relationships" means for CI, and whether the diagram should suggest links from matching keys.
3. Coverage: what "which sources the dashboards cover" looks like.
4. Quieting the noise: unused tables, unused fields, and one-step Read queries.
5. Where the diagram opens: the whole project, the current analysis's slice, or one source.
6. The bar for "not a mess".

Answers: _waiting for Byron_
