# Children first, in first and second class

**Did age and the price of a ticket change who survived the Titanic?** Each row is one of the 1,309 passengers on the ship’s list, with class, sex, age where recorded, and the fare paid. “Women and children first” held for the women. For the children, it depended on the deck.

```eda
eda query=passengers
class:cat=titanic.Class label="Class"
sex:cat=titanic.Sex label="Sex"
fate:cat=titanic.Fate label="Fate"
age:num=titanic.Age label="Age"
fare:num=titanic.Fare label="Fare (£)"
age_group:cat="titanic.Age group" label="Age group"
age_band:cat=age_band label="Age band"
survived:num=survived label="Survived (1 or 0)"
field survived precision=2
```

## Children survived in first and second class, and drowned in third

Each cell is the share of that group who survived. The top two rows read the same: 86.7% of first-class children survived, and 87.9% of second-class children. In third class, 36.8% of children survived, a lower rate than first-class adults, 62.5% of whom lived.

```eda
heatmap @nb-titanic-age-and-fare-1 class columnField=age_group aggregation=average measureField=survived showValues=true sortBy=label columnSortBy=label title="Share who survived, by class and age group"
```

## Being a boy helped; being a girl did not

Each cell is survival by age band within sex. For males the line falls off a cliff at thirteen: 54.0% of boys under 13 survived, and 9.7% of males aged 13 to 19. For females the youngest band is the lowest: 61.4% of girls under 13 survived, against 79.1% of women in their thirties, because most of the girls were in third class.

```eda
heatmap @nb-titanic-age-and-fare-2 age_band columnField=sex aggregation=average measureField=survived showValues=true sortBy=label columnSortBy=label title="Share who survived, by age band and sex (passengers with a recorded age)"
```

## A first-class ticket cost seven times a third-class one

Each box is one class’s fares. The median first-class fare was £60.00, the median third-class fare £8.05. The axis stops at £300; four passengers in the Cardeza party paid £512.33 each, the highest fare on the list. 17 passengers paid nothing, mostly employees of the shipping line.

```eda
boxplot @nb-titanic-age-and-fare-3 fare color=class title="Fare by class (£)" y.title="Fare (£)" y.max=300
```

## Takeaway

The order of the lifeboats was sex first, then class, then age. A child’s chances were set by the deck the family slept on, and a boy’s by whether he was old enough to be counted a man. The fare bought the deck.

## Limits

Age is blank for 263 passengers, most in third class, so the age cells lean on the upper decks. Fares are per ticket, and a family ticket covered several people, which inflates the top of each box. Crew are not in the list.
