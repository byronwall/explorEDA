**Orders: reading the population and checking the records**

One row is one synthetic order. Revenue is in USD. The source has 12 rows;
10 orders are active. The chart filters below keep active orders. A selection
stays with its own notebook chart.

```eda
field revenue as=numeric
finding @all count
finding @authored-east count where.active=true where.region=East
finding @authored-active count where.active=true
finding @authored-share share authored-east authored-active digits=1
finding @n count chart=@regions
finding @eligible count chart=@regions population=eligible
finding @mean-revenue average revenue chart=@regions digits=2
finding @total-revenue sum revenue chart=@regions digits=2
finding @share share n eligible digits=1
finding @web-mean average revenue chart=@regions where.channel=Web digits=2
finding @store-mean average revenue chart=@regions where.channel=Store digits=2
finding @channel-gap difference web-mean store-mean digits=2
finding @channel-n count chart=@channels
finding @channel-eligible count chart=@channels population=eligible
finding @channel-mean average revenue chart=@channels digits=2
finding @zero-mean average revenue where.order_id=O07 digits=2
finding @invalid-mean average revenue where.order_id=O08 digits=2
finding @empty-n count where.channel=Wholesale
finding @empty-mean average revenue where.channel=Wholesale digits=2
```

# Regions

## Active orders by region

**Author's note · All active orders, no selection.** East accounts for
4 of the 10 active orders (40%). This statement describes the original
fixture population; it is not a conclusion recalculated from a later selection.
[Show the claim's East orders](#finding:authored-east) and
[show its active-order denominator](#finding:authored-active).

The region chart selects **{{n}} of {{eligible}} active orders ({{share}})**.
Their average revenue is **${{mean-revenue}}** and their summed revenue is
**${{total-revenue}}**. [Show the average's records](#finding:mean-revenue).

```eda
row region @regions where.active=true title="Active orders by region"
```

The selected Web orders' average minus the selected Store orders' average
is **{{channel-gap}} USD**. [Show both sets of records](#finding:channel-gap).

**Source:** Synthetic orders created for the explorEDA narrow-reading design
fixture, 2 November 2026; one row per order; USD revenue. O04 has no revenue
value; O08 contains the invalid value `bad`; O07 is a valid zero.
The total source count is **{{all}}**.

# Channels and data quality

## A separate selection by channel

The channel chart selects **{{channel-n}} of {{channel-eligible}} active
orders**. Its average revenue is **${{channel-mean}}**.
[Show these records](#finding:channel-mean).

```eda
row channel @channels where.active=true title="Active orders by channel"
```

The region selection on the first sheet does not change this chart's
selection. Return to Regions to see the region selection again.

## Zero, invalid values, and no rows

- Order O07 has average revenue **${{zero-mean}}**:
  [show the valid zero](#finding:zero-mean).
- Order O08 has **{{invalid-mean}}**:
  [show its invalid input](#finding:invalid-mean).
- The Wholesale channel has **{{empty-n}} orders** and an average of
  **{{empty-mean}}**: [show its empty record set](#finding:empty-mean).

**Source and meaning:** The same 12 synthetic order records as Regions.
These three checks name source rows directly and do not follow either
chart's selection. Missing and invalid inputs remain reachable through the
finding records; they do not become zero revenue.
