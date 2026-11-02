# Build an ordered analysis reader

Add an opt-in reader for saved workspaces and notebooks. Keep chart panels and analytical state. Make scope visible, open exact supporting records, and return to the same chart or sentence.

[Reviewed implementation plan](../../intent/narrow-analysis-reading/implementation-plan.md) · [Decisions and checks](../../intent/narrow-analysis-reading/decisions.md) · [All original Pro assets](../../intent/narrow-analysis-reading/assets/pro-results/narrow-reading-design-2026-11-02/README.md) · [Conversation](https://chatgpt.com/c/6ae84fbd-aa30-83e9-9d2d-f8e03355d424)

R063 Design scored16/20: capability4, Pro advantage4, buildable4, momentum4. See [run record](run.md) for alternatives. Pro finished in29m39s; no follow-up.

Build in four steps: workspace reader and interaction policy; complete evidence and return; native notebook reading; saved author groups. Each step includes docs and a runnable example. Build NAR01–16, Explore17–18, Defer19, Avoid20. These are planning decisions, not implementation approval.

The existing narrow grid protects geometry but does not establish reading order or disable all authoring. Existing readOnly also blocks selection. Contributor paging retains full inputs; generic previews stop at100. Notebook owner selections stay independent. Two averages can both equal200 while their evidence contains four or two records.

The local native probe and existing tests passed32 tests. Compilation produced two expected warnings for deliberate empty predicates; the plan records them. All15 supplied arithmetic populations were checked through native reducers. No browser, provider-callback, focus, paging or performance acceptance was performed. All12 Pro result files are preserved byte-for-byte, including the original reports, mockup, fixtures, type sketch and verifier programs. Downloaded programs were not executed.

Primary references include [Tableau Stories](https://help.tableau.com/current/pro/desktop/en-us/story_create.htm), [Power BI focus](https://learn.microsoft.com/en-us/power-bi/explore-reports/mobile/mobile-apps-view-phone-report), and [WAI dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). The decisions page records the spot checks; the original report contains the full source list.

Remaining implementation questions: choose the manual-filter seam, verify logical target resolution after focus, choose display-only row labels, and settle explicit Dashboard-text group export behavior. None requires another Pro run before M1.
