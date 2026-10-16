# Nine of 48 group matches ended in a draw

**Question.** How many group matches ended level, group by group?

- **Encoding.** A waffle cell represents one group match and its color distinguishes a draw from a decisive score.
- **Ordering.** Groups alphabetically; category order remains consistent across repeats.
- **Baseline.** Counts start with no cells; the graphic is not normalized to a synthetic hundred-cell population.
- **Scale.** Equal-size cells preserve equal match weights across groups.

## What this design gives up

Goal totals and the closeness of decisive matches are lost. The cells encode match counts rather than goals or team appearances.

This is arithmetic under the declared three-points-for-a-win and one-for-a-draw rule, not a measure of match quality. It describes group-stage final scores only and says nothing about later knockout results.
