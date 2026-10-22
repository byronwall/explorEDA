# On the Titanic, sex mattered more than class

**Who survived the Titanic?** Each row is one of the 1,309 passengers on the ship's list, with class, sex, age, and fate. Crew are not included.

```eda
eda query=titanic
class:cat=titanic.Class label="Class"
sex:cat=titanic.Sex label="Sex"
fate:cat=titanic.Fate label="Fate"
age:num=titanic.Age label="Age"
age_group:cat="titanic.Age group" label="Age group"
calc survived = fate == "Survived" ? 1 : 0
```

## Follow every passenger from class to fate

Each band is a group of passengers flowing from their class, through their sex, to their fate. 72.7% of women survived and 19.1% of men. The widest band into "Died" comes from third-class men: 493 of them boarded, and 418 died.

```eda
sankey @nb-titanic-class-and-sex-1 title="Class, then sex, then fate" {
  stages[]=class,sex,fate nodeOrder=label
}
```

## The survival rate in every cell

Each cell is the share of that group who survived. Read down a column for class: 61.9% of first-class passengers survived, 43.0% of second, and 25.5% of third. Read across a row for sex, which is the larger effect: 49.1% of third-class women survived, against 34.1% of first-class men.

```eda
pivot @nb-titanic-class-and-sex-2 title="Share who survived, by class and sex" {
  rows=titanic.Class columns=titanic.Sex
  value avg(survived) label="Survived (share)"
}
```

## Ages were missing more often than not, in third class

Age is blank for 263 passengers, mostly in third class, so any age comparison leans on first- and second-class records.

```eda
bar @nb-titanic-class-and-sex-3 age_group color=class title="Passengers by age group and class" y.title=Passengers {
  seriesField=class
}
```

## Takeaway

"Women and children first" shows up plainly: a first-class man was less likely to survive than a third-class woman. Class mattered too, but less than sex.

## Limits

This is the passenger list only; nearly 900 crew are not in it. Fate is recorded for every passenger, but age is not.
