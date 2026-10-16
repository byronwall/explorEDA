# Long strikes without crushing the short ones

**Question.** How many strikes ran past two months, and how long did the longest last?

- **Encoding.** Each strike is one swarmed dot on a logarithmic duration scale, separated by the declared production-context split.
- **Ordering.** Context labels alphabetically; within-row vertical displacement has no data meaning.
- **Baseline.** A log scale has no zero. Every duration is positive and retained.
- **Scale.** Shared log day scale, so equal horizontal distances represent ratios rather than day differences.

## What this design gives up

The spacing no longer communicates additive days. Group separation is descriptive, not an estimate of a production effect.

The sample contains selected manufacturing strikes, not all labor disputes. Durations describe completed recorded events and should not be interpreted as a forecast for a current dispute.
