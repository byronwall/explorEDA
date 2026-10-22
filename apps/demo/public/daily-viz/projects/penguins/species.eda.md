# Gentoo penguins outweigh their neighbors by more than a kilogram

**How different are the three Palmer Archipelago penguin species?** Each row is one penguin measured near Palmer Station, Antarctica, from 2007 to 2009.

```eda
eda query=penguins
species:cat=penguins.species label="Species"
island:cat=penguins.island label="Island"
bill_length:num=penguins.bill_length_mm label="Bill length (mm)"
bill_depth:num=penguins.bill_depth_mm label="Bill depth (mm)"
flipper:num=penguins.flipper_length_mm label="Flipper length (mm)"
mass:num=penguins.body_mass_g label="Body mass (g)"
sex:cat=penguins.sex label="Sex"
```

## Every measurement at a glance

The summary profiles each field: its range, its typical value, and how many birds are missing it.

```eda
summary @nb-penguins-species-1 title="Every field, one row per penguin"
```

## Not every species lives on every island

Gentoo penguins appear only on Biscoe and Chinstraps only on Dream; Adélies live on all three islands. Any island comparison is partly a species comparison.

```eda
pivot @nb-penguins-species-2 title="Penguins by species and island" {
  rows=penguins.species columns=penguins.island
  value count(penguins.species) label=Penguins
}
```

## Longer flippers, heavier birds

Across all three species, flipper length tracks body mass closely: flipper length and body mass had correlation 0.871, and the fitted line gains about 50 g per millimeter of flipper. Gentoos sit apart at the top right. The heaviest bird weighed 6,300 g, a male Gentoo from Biscoe.

```eda
scatter @nb-penguins-species-3 x=flipper y=mass color=species regression=linear title="Flipper length and body mass" x.title="Flipper length (mm)" y.title="Body mass (g)" {
  callout "Heaviest: 6.3 kg male Gentoo" pick=max offset=-60,30
}
```

## Gentoos weigh a kilogram more

The boxes barely overlap. Gentoo penguins averaged 5,076 g. Adélie penguins averaged 3,701 g, and Chinstrap penguins averaged 3,733 g, so the two smaller species are within 32 g of each other while Gentoos carry 1.4 kg more.

```eda
boxplot @nb-penguins-species-4 mass color=species title="Body mass by species" y.title="Body mass (g)"
```

## Takeaway

Adélie and Chinstrap penguins are close in weight; Gentoos are heaviest and have the longest flippers, though Chinstraps have the longest bills. Because each species keeps to its own islands, separate species from place before comparing islands.

## Limits

344 birds from three seasons, with 11 of unrecorded sex. Body mass changes through the breeding season, and birds were weighed at different stages.
