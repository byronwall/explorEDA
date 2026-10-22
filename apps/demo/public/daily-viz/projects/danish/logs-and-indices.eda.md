# Danish real money grew 47% in 13 years; real income, 16%

**Do real money and real income move together?** Each row is one Danish quarter from 1974 to 1987, with the logs of real money and real income from a classic cointegration dataset, rebased here so that both start at 100 in the first quarter of 1974. In levels the two series look married. Quarter by quarter, they barely speak.

```eda
eda query=r
period:cat=r.period label="Quarter"
lrm:num=r.lrm label="Log real money"
lry:num=r.lry label="Log real income"
date:date=r.date label="Quarter"
money_index:num=r.money_index label="Real money (1974 Q1 = 100)"
income_index:num=r.income_index label="Real income (1974 Q1 = 100)"
dmoney:num=r.dmoney label="Real money, quarterly log change"
dincome:num=r.dincome label="Real income, quarterly log change"
```

## The two indices parted ways in 1984

For ten years the lines cross and recross within a few points of each other. From 1984 real money climbs away: by the third quarter of 1987 the real money index stood at 146.63, while the real income index stood at 115.86. Real money peaked at 155.72 in the second quarter of 1986.

```eda
line @nb-danish-logs-and-indices-chart-1 x=date y=money_index,income_index title="Real money and real income, indexed to 1974 Q1" x.title="Quarter" y.title="Index (1974 Q1 = 100)" {
  rule x=1984-01-01 "Money pulls ahead"
}
```

## In levels, the two are tightly correlated

Each point is one quarter, placed by its log real income and log real money. The cloud leans up and to the right: logged real money and logged real income had correlation 0.868. Much of that is the shared climb after 1984, when both rose together.

```eda
scatter @nb-danish-logs-and-indices-chart-2 x=lry y=lrm regression=linear title="Log real money against log real income, Danish quarters 1974 to 1987" x.title="Log real income" y.title="Log real money"
```

## Quarter to quarter, the link is faint

Replace each quarter's level with its change from the quarter before. The cloud rounds out: the quarterly log changes had correlation 0.490. In 55.6% of quarters, real money and real income moved in the same direction, barely better than a coin toss.

```eda
scatter @nb-danish-logs-and-indices-chart-3 x=dincome y=dmoney regression=linear title="Quarterly log changes in real money and real income" x.title="Real income, quarterly log change" y.title="Real money, quarterly log change" {
  rule x=0 "No change in income"
  rule y=0 "No change in money"
}
```

## Takeaway

Danish real money and real income rose together because both rose, and real money rose three times as far. The levels correlation of 0.87 is mostly that shared trend; the quarterly correlation of 0.49 is what the two series have to say to each other.

## Limits

Fifty-five quarters from one country, taken from a textbook dataset and already logged at the source. Indices describe growth from 1974, not amounts of money. A first difference removes the trend but not the dependence between neighboring quarters.
