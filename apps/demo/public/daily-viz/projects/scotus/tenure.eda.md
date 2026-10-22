# Death no longer ends a Supreme Court term

**How long do justices serve, and how do their terms end?** Each row is one term on the Supreme Court, 121 terms from John Jay in 1789 to the nine justices sitting today, with the oath date, the years served, and how the term ended. Terms have stretched to a quarter-century, and the way they close has changed completely.

```eda
eda query=justices
surname:cat=scotus.Surname label="Justice"
start_year:num=start_year label="Year of oath"
years:num="scotus.Years served" label="Years served"
status:cat=status label="Status"
era:cat=era label="Era of appointment"
end_era:cat=end_era label="Era the term ended"
ended:cat=ended label="How the term ended"
party:cat=scotus.Party label="Appointing party"
```

## Terms grew from seven years to twenty-three

Each dot is one term, placed at the year of the oath. The founders’ appointees left fast: justices sworn in before 1800 served a median of 7.3 years. Justices sworn in from 1950 to 1999 whose terms have ended served a median of 22.7 years. The longest term, William O. Douglas’s, ran 36.6 years.

```eda
scatter @nb-scotus-tenure-1 x=start_year y=years color=ended title="Years served by year of oath, every term since 1789" x.title="Year of oath" y.title="Years served" {
  callout "Douglas, 36.6 years" pick=max
}
```

## The middle of the twentieth century was the dip

Each box is the completed terms that began in one era. The 1900–1949 appointees served the shortest terms since the founding, a median of 11.3 years; the generation after them served twice as long. The nine sitting justices are left out, and five of them have already passed the 1900–1949 median.

```eda
boxplot @nb-scotus-tenure-2 years color=era where.status=Completed title="Years served by era of appointment, completed terms" y.title="Years served"
```

## Retirement replaced death

Each cell counts terms that ended in one era, by how they ended. Of the terms that ended before 1900, 65.3% ended with the justice’s death. Of those that have ended since 1950, 16.7% did, and 73.3% ended in retirement. Five justices have died in office since 1950: Vinson, Jackson, Rehnquist, Scalia, and Ginsburg.

```eda
heatmap @nb-scotus-tenure-3 end_era columnField=ended aggregation=count showValues=true sortBy=data columnSortBy=count title="Completed terms by era and how they ended" where.status=Completed
```

## Republican presidents have filled most seats since 1950

Each bar is an era of appointment, split by the appointing president’s party. The two parties split the first half of the twentieth century evenly. Since 1950, Republican presidents have appointed 21 justices and Democratic presidents 9.

```eda
bar @nb-scotus-tenure-4 era seriesField=party title="Terms by era of appointment and appointing party" y.title="Terms" x.title="Era of appointment"
```

## Takeaway

A seat on the court now turns over about once a generation, and the justice chooses when. Longer lives and the norm of retiring under a president of the appointing party turned a vacancy from an accident of mortality into a decision, which is why the timing of retirements, not deaths, now decides the court’s balance.

## Limits

One row is one term, so the two justices who moved from associate to chief justice count twice, and the nine sitting justices have no end date and are excluded from every tenure figure. Party is the appointing president’s, and parties before 1854 do not map onto today’s. The source is a Wikipedia list, compiled from the court’s own records.
