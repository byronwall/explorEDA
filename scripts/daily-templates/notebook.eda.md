# {{title}}

One short paragraph: why someone would ask "{{question}}", and what the charts below will show them. Name the population and its grain in plain words.

```eda
eda query={{query}}
TODO_field:num={{query}}.TODO_field label="Readable name (unit)"
```

## A claim the first chart supports

Say what to look at in the chart, not what the chart is.

```eda
line @{{id}}-1 x=TODO y=TODO title="A short, specific title"
```

**Finding.** Type a finding from catalog.json here exactly as `pnpm daily check` computes it.

## A second view that changes the reading

```eda
hist @{{id}}-2 TODO title="A short, specific title"
```

## Takeaway

Two or three sentences a reader should leave with.

## Limits

What this data cannot say: coverage, grain, sample, units.
