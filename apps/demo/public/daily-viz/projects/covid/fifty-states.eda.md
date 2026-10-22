# The winter wave began in the Dakotas; Omicron needed one month for all 51

**Which states peaked first in each Covid wave?** Two or three sentences: why anyone would ask, the unit of analysis in plain words (each row is one …), and where the piece is going. Lead with the answer's shape.

```eda
eda query=tiles
TODO_field:num=tiles.TODO_field label="Readable name (unit)"
```

## A claim the first chart proves

Say what to look at and give the number. Weave a finding from catalog.json into this paragraph, exactly as `pnpm daily check` computes it: The median TODO was 0.0 units.

```eda
line @nb-covid-fifty-states-1 x=TODO y=TODO title="What is drawn, with population and unit" y.title="Unit" {
  rule y=0 "Name the reference"
}
```

## The comparison that makes the point

Two populations, side by side, with the difference stated as a number.

```eda
boxplot @nb-covid-fifty-states-2 TODO color=TODO_group title="Measure by group, population" y.title="Unit"
```

## Takeaway

The answer in one sentence, then what it changes about how to hear the headline number.

## Limits

Two or three sentences: grain, coverage, sample, vintage, the denominator that is missing.
