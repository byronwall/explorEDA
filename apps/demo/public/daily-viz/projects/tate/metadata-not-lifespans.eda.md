# A museum catalogue date span is not always a person’s lifespan

**Reader question.** What goes wrong when birth and death fields are treated as complete biographies?

**Population.** one artist-catalogue record in the first 60 alphabetic records. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
catalogue_id:num=r.catalogue_id label="Catalogue id (original Tate catalogue identifier)"
name:cat=r.name label="Name"
birth_year:num=r.birth_year label="Birth year (year in October 2014 archive)"
death_year:num=r.death_year label="Death year (year in October 2014 archive)"
date_span:num=r.date_span label="Date span (source units; see dictionary)"
entity:cat=r.entity label="Entity"
death_status:cat=r.death_status label="Death status"
birth_century:cat=r.birth_century label="Birth century"
```

## 1. Birth-year coverage of the alphabetic prefix

The prefix is selected by catalogue ordering, not time or random sampling. Its birth-year distribution cannot describe Tate’s whole collection.

```eda
hist @nb-tate-metadata-not-lifespans-chart-1 birth_year bins=16 title="Birth-year coverage of the alphabetic prefix" x.title="Birth year (year in October 2014 archive)" y.title="Source rows"
```

## 2. Recorded versus blank death-year fields

The labels describe the old metadata, not current living status. Both types remain in the full row population.

```eda
row @nb-tate-metadata-not-lifespans-chart-2 death_status title="Recorded versus blank death-year fields" x.title="Source rows"
```

**Computed finding.** The largest recorded date span in this prefix was 138 years; it belongs to the explicit family entity. This calculation uses 41 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-tate-metadata-not-lifespans.json).

## 3. Date span against birth year, with the family distinguished

The span is a subtraction of supplied date fields. Color identifies the explicitly named family entry without assuming that every other catalogue record is necessarily a single-person biography.

```eda
scatter @nb-tate-metadata-not-lifespans-chart-3 x=birth_year y=date_span color=entity title="Date span against birth year, with the family distinguished" x.title="Birth year (year in October 2014 archive)" y.title="Date span (source units; see dictionary)"
```

## 4. Inspect long spans rather than deleting them

Only paired dates contribute. A long interval is a prompt to inspect entity semantics; it is not automatically a bad numeric measurement.

```eda
hist @nb-tate-metadata-not-lifespans-chart-4 date_span bins=15 title="Inspect long spans rather than deleting them" x.title="Date span (source units; see dictionary)" y.title="Source rows"
```

**Computed finding.** Blank death-year fields represent 31.67% of this archive prefix. This calculation uses 60 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-tate-metadata-not-lifespans.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-tate-metadata-not-lifespans-records catalogue_id,name,birth_year,death_year,date_span,entity,death_status title="Records behind this comparison"
```

## What the comparison supports

An implausible-looking span can expose a mismatch between the analytical unit and the catalogue entity. Preserve the record and explain the mismatch instead of silently clipping it or inventing a death date.

## Limits

This is the first sixty alphabetically ordered records in Tate’s October 2014 archive, not a representative artist sample. A blank death year is not evidence that someone is alive today. The explicit Alken Family entry is not one person.

## Source and preparation

Tate; October 2014 collection metadata archive; CC0 1.0 Universal. Historical source version: Git blob 7a47fe57205af5bb5ea57bae760540f7fe781853

Data credit and license: [tate provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/tate.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-tate-metadata-not-lifespans.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** catalogue_id: original Tate catalogue identifier; birth_year: year in October 2014 archive; death_year: year in October 2014 archive; date_span: years between two catalogue dates; not necessarily a lifespan.
