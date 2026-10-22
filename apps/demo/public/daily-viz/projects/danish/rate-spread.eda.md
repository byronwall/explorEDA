# Danish bonds paid 2.5 to 10.5 points more than deposits

**How much more did a Danish bond pay than a bank deposit?** Each row is one quarter from 1974 to 1987, with the bond yield and the bank deposit rate. The gap never closed: bonds paid more in every one of the 55 quarters, by 6.59 points on average, and the widest gaps came before 1981.

```eda
eda query=r
period:cat=r.period label="Quarter"
ibo_pct:num=ibo_pct label="Bond rate (%)"
ide_pct:num=ide_pct label="Deposit rate (%)"
spread_pct:num=spread_pct label="Bond minus deposit rate (points)"
date:date=r.date label="Quarter"
era:cat=r.era label="Era"
```

## Bonds peaked at 21%; deposits at 12%

Both rates climbed through the 1970s and fell after 1982, but the bond line stays well above the deposit line throughout. The bond rate peaked at 21.08% in the second quarter of 1982. The deposit rate peaked at 12.10% in the second quarter of 1980. Over the whole span the mean bond rate was 15.64% and the mean deposit rate was 9.04%.

```eda
line @nb-danish-rate-spread-chart-1 x=date y=ibo_pct,ide_pct title="Danish bond and deposit rates by quarter, 1974 to 1987" x.title="Quarter" y.title="Rate (%)"
```

## The gap peaked at 10.5 points in 1978

Subtract one line from the other and the gap becomes one distance from zero. The spread peaked at 10.50 points in the last quarter of 1978 and fell to 2.53 points in the first quarter of 1986. It never touched zero.

```eda
line @nb-danish-rate-spread-chart-2 x=date y=spread_pct title="Bond rate minus deposit rate, by quarter" x.title="Quarter" y.title="Bond minus deposit rate (points)" {
  rule y=0 "Equal rates"
  callout "1978 Q4: 10.5 points" pick=max
  callout "1986 Q1: 2.5 points" pick=min
}
```

## After 1981 the typical gap narrowed by 2.5 points

Split the quarters at 1981 and compare the boxes. The median spread from 1974 to 1980 was 7.51 points; from 1981 to 1987 it was 4.96 points. The later box also reaches lower: every spread under four points comes after 1983.

```eda
boxplot @nb-danish-rate-spread-chart-3 spread_pct color=era title="Bond minus deposit rate, by era" y.title="Bond minus deposit rate (points)"
```

## Deposits followed bonds, but not point for point

Each quarter placed by its two rates. The deposit rate rose and fell with the bond rate (correlation 0.803), but the cloud is flatter than the diagonal: a quarter with bonds near 20% had deposits near 11%, not 20%.

```eda
scatter @nb-danish-rate-spread-chart-4 x=ibo_pct y=ide_pct regression=linear title="Deposit rate against bond rate, Danish quarters 1974 to 1987" x.title="Bond rate (%)" y.title="Deposit rate (%)" {
  callout "1980 Q2: deposits 12.1%" pick=max
}
```

## Takeaway

A Danish saver who held bonds instead of deposits earned 6.6 points a year more on average, and over 10 points more at the 1978 peak. The gap narrowed after 1981 as both rates fell, but it never closed.

## Limits

Fifty-five quarters from one country, with the bond yield and deposit rate as the source recorded them. A yield gap is not a return: bonds carry price risk that deposits do not, and nothing here says which was the better investment.
