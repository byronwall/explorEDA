# Big firms invest more, but a firm's good year is a weaker signal

**Does a firm invest more in a year its market value rises?** Each row is one firm-year: eleven large American companies from 1935 to 1954, with gross investment and market value in millions of 1947 dollars. Across the panel the answer looks like a resounding yes. Within one firm, from one year to the next, it is a quieter yes, and for some firms no answer at all.

```eda
eda query=r
invest:num=r.invest label="Investment ($M, 1947)"
value:num=r.value label="Market value ($M, 1947)"
firm:cat=r.firm label="Firm"
year:num=r.year label="Year"
invest_change:num=r.invest_change label="Change in investment ($M, 1947)"
value_change:num=r.value_change label="Change in market value ($M, 1947)"
```

## Across firms, size explains most of it

Each point is one firm-year, colored by firm, with a fitted line per firm. Across firm-year levels, market value and investment had correlation 0.862, but most of that is General Motors sitting far up and to the right of everyone else: its mean market value was $4,334 million, against $71 million for Diamond Match. The other ten firms crowd the bottom-left corner.

```eda
scatter @nb-grunfeld-within-firm-chart-1 x=value y=invest color=firm opacity=0.7 regression=linear title="Investment against market value, one point per firm-year" x.title="Market value ($M, 1947)" y.title="Investment ($M, 1947)"
```

## Within a firm, the link is two-thirds as strong

Replace each firm-year with its change from the firm's previous year. Size drops out, and what remains is whether a firm that gained value invested more. Across within-firm annual changes, the correlation was 0.562. The cloud leans the right way, but it is a cloud.

```eda
scatter @nb-grunfeld-within-firm-chart-2 x=value_change y=invest_change regression=linear title="Change in investment against change in market value, firm-years 1936 to 1954" x.title="Change in market value ($M, 1947)" y.title="Change in investment ($M, 1947)" {
  rule x=0
  rule y=0 "No change in investment"
}
```

## IBM tracked its value; Diamond Match ignored it

Two firms, each on its own axes. Inside IBM, market value and investment had correlation 0.975: twenty years on a line. Inside Diamond Match, the correlation was -0.096, a cloud with no lean at all. The pooled 0.86 is an average over eleven firms that range from lockstep to no relationship.

```eda
scatter @nb-grunfeld-within-firm-chart-3 x=value y=invest regression=linear where.firm=IBM title="IBM: investment against market value, 1935 to 1954" x.title="Market value ($M, 1947)" y.title="Investment ($M, 1947)"
```

```eda
scatter @nb-grunfeld-within-firm-chart-4 x=value y=invest regression=linear where.firm="Diamond Match" title="Diamond Match: investment against market value, 1935 to 1954" x.title="Market value ($M, 1947)" y.title="Investment ($M, 1947)"
```

## Takeaway

Bigger firms invest more; that is the 0.86. Whether a firm's good year brings more investment is a different question, and the answer varies by firm from 0.98 to below zero. A pooled correlation on panel data answers the between question while sounding like the within one.

## Limits

Eleven firms chosen in 1958 for a regression textbook, not a sample of industry. Twenty years per firm give each within-firm correlation only nineteen changes. The dollars are deflated to 1947 but not adjusted for the firms' very different capital stocks.
