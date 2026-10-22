# Homicide is 1% of deaths and nearly half of the coverage

**Do the news outlets cover what Americans die from?** Each row is one cause of death in 2023 paired with one source: the CDC’s count of deaths, or the number of articles in The New York Times, The Washington Post, or Fox News that mentioned the cause. Fifteen causes, four sources. Rank the causes by deaths and by articles, and the two lists barely overlap.

```eda
eda query=media
outlet:cat=media.Source label="Source"
cause:cat=media.Cause label="Cause"
count:num=media.Count label="Count"
calc deaths = outlet == "Deaths" ? count : 0
calc articles = outlet == "Deaths" ? 0 : count
calc share = outlet == "Deaths" ? 100 * count / 2308565 : outlet == "The New York Times" ? 100 * count / 15421 : outlet == "The Washington Post" ? 100 * count / 11812 : 100 * count / 19407
field share label="Share of source’s total (%)" precision=1
group @by_deaths sum(deaths) by=cause
group @by_articles sum(articles) by=cause
```

## Two causes account for more than half of all deaths

Each bar is one cause’s deaths, out of 2.3 million among these fifteen. Heart disease was 29.5% of deaths and cancer 26.6%. Homicide was 0.97% of deaths, and terrorism killed 16 people in the year.

```eda
row @nb-media-coverage-1 cause group=by_deaths topN=15 title="Deaths by cause, 2023 (CDC)" x.title="Deaths"
```

## The same two causes get 7% of the articles

Each bar is the articles mentioning one cause, across the three outlets. Homicide was 47.3% of articles, and terrorism, with sixteen deaths, was 13.7%. Heart disease and cancer together were 6.7% of articles against 56.1% of deaths.

```eda
row @nb-media-coverage-2 cause group=by_articles topN=15 title="Articles mentioning each cause, 2023 (three outlets combined)" x.title="Articles"
```

## The three outlets agree on what to over-cover

Each cell is a cause’s share of that source’s total, so each column adds to 100. Read the homicide row: 0.97% of deaths, 41.9% of The New York Times’s articles, 45.9% of The Washington Post’s, and 52.4% of Fox News’s. The outlets differ by ten points on homicide and by less than two on heart disease, which sits near 2.5% in every column.

```eda
heatmap @nb-media-coverage-3 cause columnField=outlet aggregation=sum measureField=share showValues=true sortBy=data columnSortBy=data title="Share of each source’s total by cause (%)"
```

## Takeaway

Coverage tracks the unusual, not the common: the two leading killers get about one article in fifteen, and the two rarest causes in the set get three in five. The pattern is the same at the Times, the Post, and Fox, so a reader of any of them hears a picture of risk that is almost the inverse of the death certificates.

## Limits

One year, fifteen causes, three outlets, and an article counts only when it mentions the cause several times, so a cause named in passing is missed. Shares are of these fifteen causes only, not all deaths or all articles. Accidents exclude overdoses so they are not counted twice, and terrorism deaths are from the Global Terrorism Index, not the CDC.
