# A source-rate spread, with the subtraction made explicit

**Question.** How did the gap between Danish bond and deposit rates move from 1974 to 1987?

- **Encoding.** A single path encodes bond rate minus deposit rate, with each quarter marked.
- **Ordering.** Calendar-quarter order.
- **Baseline.** Zero means equal source rates.
- **Scale.** Linear source fractions, not silently formatted as percentages or currency.

## What this design gives up

The two source levels are removed by subtraction. The companion notebook retains them and explains the historical scope.

The displayed rates are historical source fractions, not current quoted products. A spread is not a total investment return, and the observations support no recommendation about present borrowing or investing.
