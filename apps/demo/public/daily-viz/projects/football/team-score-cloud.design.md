# Scoring and conceding form different group-stage profiles

**Question.** Which teams scored a lot, conceded little, or both?

- **Encoding.** One team is one point positioned by goals for and against, with group membership encoded by color.
- **Ordering.** No line connects teams; listing order has no measured meaning.
- **Baseline.** Both goal counts use zero baselines.
- **Scale.** Shared linear goal-count scales. Equal scores can overlap and remain separate source records.

## What this design gives up

Opponent strength, match sequence, and advancement tie-break rules are not encoded. Points are not independent because teams share matches.

Teams faced different opponents, and the small group-stage schedule is not a strength-adjusted experiment. No advancement ranking is inferred because all tie-break procedures are outside this analysis.
