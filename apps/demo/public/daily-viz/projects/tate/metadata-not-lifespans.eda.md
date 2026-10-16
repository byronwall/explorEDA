# A museum's birth and death years don't always describe a person

**What can go wrong when catalogue dates are read as lifespans?** Each row is one artist-catalogue record in the first 60 alphabetic records.

```eda
eda query=r
catalogue_id:num=r.catalogue_id label="Tate catalogue id"
name:cat=r.name label="Name"
birth_year:num=r.birth_year label="Birth year"
death_year:num=r.death_year label="Death year"
date_span:num=r.date_span label="Years between dates"
entity:cat=r.entity label="Entity"
death_status:cat=r.death_status label="Death status"
```

## 1. Birth-year coverage of the alphabetic prefix

The prefix is selected by catalogue ordering, not time or random sampling. Its birth-year distribution cannot describe Tate’s whole collection.

```eda
hist @nb-tate-metadata-not-lifespans-chart-1 birth_year bins=16 title="Birth-year coverage of the alphabetic prefix" x.title="Birth year" y.title="Rows"
```

## 2. Recorded versus blank death-year fields

The labels describe the old metadata, not current living status. Both types remain in the full row population.

```eda
row @nb-tate-metadata-not-lifespans-chart-2 death_status title="Recorded versus blank death-year fields" x.title="Rows"
```

**Finding.** The largest recorded date span in this prefix was 138 years; it belongs to the explicit family entity.

## 3. Date span against birth year, with the family distinguished

The span is a subtraction of date fields. Color identifies the explicitly named family entry without assuming that every other catalogue record is necessarily a single-person biography.

```eda
scatter @nb-tate-metadata-not-lifespans-chart-3 x=birth_year y=date_span color=entity title="Date span against birth year, with the family distinguished" x.title="Birth year" y.title="Years between dates"
```

## 4. Inspect long spans rather than deleting them

Only paired dates contribute. A long interval is a prompt to inspect entity semantics; it is not automatically a bad numeric measurement.

```eda
hist @nb-tate-metadata-not-lifespans-chart-4 date_span bins=15 title="Inspect long spans rather than deleting them" x.title="Years between dates" y.title="Rows"
```

**Finding.** Blank death-year fields represent 31.67% of this archive prefix.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-tate-metadata-not-lifespans-records catalogue_id,name,birth_year,death_year,date_span,entity,death_status title="Records behind this comparison"
```

## Takeaway

An implausible-looking span can expose a mismatch between the analytical unit and the catalogue entity. Preserve the record and explain the mismatch instead of silently clipping it or inventing a death date.

## Limits

This is the first sixty alphabetically ordered records in Tate’s October 2014 archive, not a representative artist sample. A blank death year is not evidence that someone is alive today. The explicit Alken Family entry is not one person.
