# Indexed to 1935, IBM's investment grew fastest; General Motors ranked fourth

**Which firm grew its investment fastest?** Each row is one firm-year: eleven large American companies from 1935 to 1954, with gross investment in millions of 1947 dollars. In dollars the answer is General Motors and nothing else is visible. Set each firm's 1935 investment to 100 and a different order appears, with IBM on top.

```eda
eda query=r
invest:num=r.invest label="Investment ($M, 1947)"
firm:cat=r.firm label="Firm"
year:num=r.year label="Year"
invest_index:num=r.invest_index label="Investment (1935 = 100)"
```

## In dollars, General Motors is the chart

One line per firm. General Motors' investment reached $1,486.7 million in 1954, and US Steel is the only other firm that leaves the floor. Diamond Match's investment never passed $6.5 million; on this axis its twenty years are a flat line at zero.

```eda
line @nb-grunfeld-indexing-firms-chart-1 x=year y=invest color=firm title="Investment by year, one line per firm" x.title="Year" y.title="Investment ($M, 1947)"
```

## Indexed to 1935, IBM leads at 667

Divide every firm's investment by its own 1935 figure. IBM's index reached 666.6 in 1954, General Electric's 572.8, and Westinghouse touched the panel's high of 696.67 in 1953 before falling back. General Motors' index peaked at 468.1: fourth. Goodyear grew least, ending 1954 at 185.3.

```eda
line @nb-grunfeld-indexing-firms-chart-2 x=year y=invest_index color=firm title="Investment indexed to each firm's 1935 level, one line per firm" x.title="Year" y.title="Investment (1935 = 100)" {
  rule y=100 "1935 level"
  callout "Westinghouse 1953: 697" pick=max
}
```

## Where each firm stood in 1954

The last year of the panel, one bar per firm. Ten of the eleven firms more than doubled their 1935 investment, and three more than quintupled it; only Goodyear fell short of doubling. The median firm-year index across the whole panel was 183.91, so a typical firm in a typical year was investing nearly twice what it did in 1935.

```eda
group @end sum(invest_index) by=firm
row @nb-grunfeld-indexing-firms-chart-3 firm group=end where.year=1954 topN=11 title="Investment index in 1954, by firm (1935 = 100)" x.title="Investment (1935 = 100)"
```

## Takeaway

In dollars General Motors invested more than the other ten firms combined in most years. In growth from its own 1935 base it ranked fourth, behind IBM, General Electric, and Westinghouse. The index answers "who grew" and the dollars answer "who spent"; they rank the same firms differently.

## Limits

Eleven firms chosen for a 1958 textbook, with 1935 as the base year only because the panel starts there. A firm that invested little in 1935 gets a flattering index, and a firm with a big 1935 program gets a modest one.
