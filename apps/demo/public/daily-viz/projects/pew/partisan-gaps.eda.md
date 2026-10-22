# Republicans name faith three times as often as Democrats

**Where do the parties differ on what makes life meaningful?** Pew asked Americans in 2021 what gives their life meaning, in their own words, and coded the answers. Each row here is one of the seven topics where Republicans and Democrats answered most differently, with the share of each party that mentioned it. The gaps are small in points and large in proportion.

```eda
eda query=gaps
topic:cat=pew.Topic label="Topic"
republicans:num=republicans label="Republicans (%)"
democrats:num=democrats label="Democrats (%)"
gap:num=gap label="Republican minus Democratic (points)"
leans:cat=leans label="Who names it more"
group @by_gap sum(gap) by=topic
```

## Faith is the widest gap, and it runs one way

Each bar is the Republican share minus the Democratic share. Faith is the only topic with a double-digit gap: Republicans lead by 14 points. The gap on hobbies and recreation is -6 points, the largest Democratic lead. Republicans lead on 2 of the seven topics.

```eda
row @nb-pew-partisan-gaps-1 topic group=by_gap title="Republican share minus Democratic share, by topic (points)" x.title="Points" {
  rule x=0 "No gap"
}
```

## Small shares, large ratios

Each line joins a topic’s Democratic share to its Republican share. The lines cross because the two parties lead on different things. On faith, 22% of Republicans mentioned it and 8% of Democrats did, close to three to one. On hobbies and recreation, 13% of Democrats and 7% of Republicans.

```eda
parallel @nb-pew-partisan-gaps-2 democrats,republicans color=leans title="Share of each party mentioning the topic (%)"
```

## The seven topics, with both shares

The rows behind the chart, sorted by the gap. No topic was mentioned by more than a quarter of either party: these are the fringes of what people said, and the fringes are where the parties part.

```eda
table @nb-pew-partisan-gaps-3 topic,democrats,republicans,gap title="Topics where the parties differ most" sortBy=gap sortDirection=desc
```

## Takeaway

Republicans are more likely to find meaning in faith and in freedom; Democrats in hobbies, health, nature, pets, and the pandemic. Every gap is under 15 points, so the two parties mostly say the same things, family and friends above all, and differ at the edges.

## Limits

Seven topics chosen by the gap, not the full coded list, so the agreement on family, career, and material well-being is outside this table. Shares are of respondents who volunteered the topic in an open answer, which rewards what comes to mind first. The transcription follows a published chart, not the microdata.
