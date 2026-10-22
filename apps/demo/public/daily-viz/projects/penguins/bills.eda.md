# Bill depth separates the species that body mass cannot

**Which measurement tells the three penguin species apart?** Each row is one penguin measured near Palmer Station, Antarctica, from 2007 to 2009, with its bill length, bill depth, flipper length, and body mass. Weight separates Gentoos from the rest and nothing else. The bill does the whole job, once you know to look at it one species at a time.

```eda
eda query=penguins
species:cat=penguins.species label="Species"
bill_length:num=penguins.bill_length_mm label="Bill length (mm)"
bill_depth:num=penguins.bill_depth_mm label="Bill depth (mm)"
flipper:num=penguins.flipper_length_mm label="Flipper length (mm)"
mass:num=penguins.body_mass_g label="Body mass (g)"
sex:cat=penguins.sex label="Sex"
```

## Pooled, longer bills look shallower

Each dot is one bird. Fit a line through all of them and it slopes down: across all 342 measured birds, bill length and bill depth have a correlation of -0.235. A longer bill seems to come with a shallower one.

```eda
scatter @nb-penguins-bills-1 x=bill_length y=bill_depth regression=linear title="Bill depth against bill length, all species pooled" x.title="Bill length (mm)" y.title="Bill depth (mm)"
```

## Within each species, the slope flips

Color the same dots by species and the three clouds separate, each with its own upward slope. Within Adélies the correlation is 0.391, within Chinstraps 0.654, and within Gentoos 0.643. The pooled line ran downhill only because Gentoos have long, shallow bills and sit below the other two clouds.

```eda
scatter @nb-penguins-bills-2 x=bill_length y=bill_depth color=species regression=linear title="Bill depth against bill length, one fit per species" x.title="Bill length (mm)" y.title="Bill depth (mm)" {
  rule y=17 "Gentoos below, others above"
}
```

## Two cuts on the bill sort nearly every bird

A horizontal cut at a depth of 17 mm takes out the Gentoos: the deepest Gentoo bill is 17.3 mm, and 85.4% of the other two species sit above 17. A vertical cut at a length of 44 mm then splits the rest: 96.7% of Adélie bills are under 44 mm, and 91.2% of Chinstrap bills are 44 mm or longer. Each cell counts birds, and the off-diagonal cells are the handful the two cuts misplace.

```eda
calc bill_cell = bill_depth == null ? "No bill" : bill_depth <= 17 ? "Shallow (≤17 mm)" : bill_length < 44 ? "Deep, short (<44 mm)" : "Deep, long (≥44 mm)"
field bill_cell label="Bill rule"
heatmap @nb-penguins-bills-3 species columnField=bill_cell aggregation=count showValues=true sortBy=label columnSortBy=label title="Birds by species and the two-cut bill rule"
```

## Weight cannot do this

Each box is one species’ body mass. Gentoos are heavier than everyone; Adélies and Chinstraps are not distinguishable by weight. Adélies average 3,701 g and Chinstraps 3,733 g, and 89.7% of Chinstraps weigh within the middle 80% of Adélies.

```eda
boxplot @nb-penguins-bills-4 mass color=species title="Body mass by species (g)" y.title="Body mass (g)"
```

## Takeaway

A pooled fit answers a question nobody asked. The Palmer penguins show the reversal cleanly: the relationship between bill length and depth is positive in every species and negative overall, because the species differ more than the birds within them. The same bill measurements classify the three species with two straight cuts, which body mass never could.

## Limits

344 birds from three islands over three seasons; two have no bill measurements and eleven no recorded sex. Males have longer and deeper bills in every species, so the within-species slopes partly reflect sex. The two cuts are chosen by eye on this sample, not fitted, and would misclassify some birds elsewhere.
