# Seventeen Seattle contractors, each typed more than one way

**How often does one Seattle contractor show up under different spellings?** Every Seattle building permit names its contractor in a free-text box, so the same firm can arrive as `J A S DESIGN BUILD INC`, `JAS DESIGN BUILD, INC.`, and `J.A.S. DESIGN BUILD INC`. Each row here is one permit. Seventeen firms with at least 15 permits each appear under two or three spellings; a category mapping merges each firm's spellings into one name, and the counts move.

```eda
eda query=split
typed:cat=permits.Contractor label="Contractor as typed"
firm:cat=firm label="Firm"
spelling:cat=spelling label="Spelling"
```

## As typed, one firm looks like several smaller ones

Across 2014 through 2019, 9,498 building permits name a contractor. The seventeen firms filed 454 of them. Each bar below is one spelling, exactly as typed, so a firm's permits are scattered across bars that sit far apart in the ranking.

```eda
row @nb-seattle-permits-contractor-spellings-1 typed topN=40 title="Permits by name as typed, 2014–2019" x.title="Permits"
```

## Merged, each firm counts once

The mapping lists every spelling it merges, one by one, so nothing joins a firm by accident. J A S Design Build filed 36 permits under its most common spelling, and two other spellings hold the rest. Counting all three spellings, it filed 42. BNBuilders filed 15 permits as B N BUILDERS INC, and the rest as BNBUILDERS INC or BNBuilders Inc. Counting all three of its spellings, BNBuilders filed 23.

```eda
row @nb-seattle-permits-contractor-spellings-2 firm topN=17 title="Permits by firm, spellings merged" x.title="Permits"
```

## Punctuation splits more names than case does

Across the seventeen firms, 14.1% of permits use a spelling other than the firm's most common one. Only a few of those differ by letter case alone, such as `Turner Construction Company`, which Ignore case in Map categories would suggest. Most differ by a comma, a period, or the spaces between initials, like `B N BUILDERS INC` and `BNBUILDERS INC`, and only a person reading the names can say they belong together.

```eda
row @nb-seattle-permits-contractor-spellings-3 firm topN=17 where.spelling="Another spelling" title="Permits under a less common spelling" x.title="Permits"
```

## Takeaway

A ranking of contractors by raw name undercounts every firm whose name gets typed more than one way. Merging seventeen firms' spellings with an explicit list fixes their counts without guessing about anyone else.

## Limits

The mapping covers only firms with at least 15 permits and more than one spelling; smaller firms keep their spellings as typed. It merges only names that match once case and punctuation are set aside, so a firm that changed its name, or two firms with similar names, are not joined. The data is a 2014–2019 extract of a dataset the city updates daily.
