# In the Tate's catalogue, the Alken family lived 138 years

**What happens when a museum's artist dates are read as lifespans?** Each row is one of the first 60 records, alphabetically, in Tate's 2014 artist catalogue, with its birth year, death year, and the years between them. For 59 of them that gap is a life. For one it is a family business that outlived three generations.

```eda
eda query=r
name:cat=r.name label="Name"
birth_year:num=r.birth_year label="Birth year"
death_year:num=r.death_year label="Death year"
date_span:num=r.date_span label="Years between dates"
entity:cat=r.entity label="Record"
death_status:cat=r.death_status label="Death year"
birth_century:cat=r.birth_century label="Born in"
```

## One record spans 138 years

Each dot is one record with both dates, placed by birth year and the span to its death year. The dots sit in a band from the forties to the nineties, as lifespans do, except one far above it. The largest span in these records is 138 years, and it belongs to the Alken Family, a line of sporting painters catalogued as one artist from 1756 to 1894. The median span is 69 years.

```eda
scatter @nb-tate-metadata-not-lifespans-chart-1 x=birth_year y=date_span color=entity title="Years between birth and death dates, by birth year" x.title="Birth year" y.title="Years between dates" where.date_span=0.. {
  callout "Alken Family, 1756 to 1894" pick=max offset=-60,24
}
```

## Only two spans pass a century

Each bar counts records by their span. Of the 41 records with both dates, 2 run past 100 years. One is the Alken family; the other is the sculptor Julian Phelps Allan, who was born in 1892 and died in 1996 at 104. The histogram's centre is where a working artist's life ends: 7 spans reach 90 or more, and only 1 falls short of 40.

```eda
hist @nb-tate-metadata-not-lifespans-chart-2 date_span bins=12 title="Records by years between dates" x.title="Years between dates" y.title="Records" {
  rule x=100 "One century"
}
```

## The longest spans, named

The table lists the records with the longest spans first. The family entry heads it; below it are long-lived individuals whose dates are exactly what they look like.

```eda
table @nb-tate-metadata-not-lifespans-chart-3 name,birth_year,death_year,date_span,entity sortBy=r.date_span sortDirection=desc where.date_span=0.. title="Records by span, longest first"
```

## A third of death years are blank, all for artists born after 1927

Each bar counts records by birth century, split by whether the death year is filled. 31.67% of the 60 records have no death year, and the earliest birth year among them is 1927. The blanks are concentrated among artists who were alive, or recently dead, when the catalogue was made; nobody born before 1900 lacks one.

```eda
bar @nb-tate-metadata-not-lifespans-chart-4 birth_century seriesField=death_status seriesLayout=stacked color=death_status categoryOrder=label title="Records by birth century and whether a death year is recorded" x.title="Born in" y.title="Records"
```

## Takeaway

A span of 138 years is not a data error to clip; it is the catalogue telling you that one of its "artists" is a family. Read the dates as biography and 59 of 60 records cooperate. The sixtieth is why the entity type is worth a column of its own.

## Limits

Sixty records from the front of the alphabet in a 2014 snapshot: not a sample of the collection, and not current. A blank death year says the field was empty when the file was made, not that the artist is alive. Only the Alken family is flagged as a non-person; other collective entries, if any, are not marked.
