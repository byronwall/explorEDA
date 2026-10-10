# Direct user request — October 6, 2026

> And one more: scatter plot matrix where we have the scatter plots off diagonal and some sort of distrbituion on-diagonal. Create an intent doc for that one too

The matrix layout is explicit. The distribution type is unspecified. This request creates planning artifacts; it does not start implementation.

## Follow-up — October 6, 2026

The user said there should be about 5–10 fields per side. They aim for about 100 ms of brush feedback, and about 500 ms is acceptable. They shared three R `ggpairs` screenshots, saying they were imagining "something like this image" with "some ability to configure options":

1. The iris data colored by species. It has scatter cells below the diagonal and group-filled densities on it. The upper triangle shows correlation text: an overall Pearson r with significance stars, then one r per species in that species' color.
2. Five plain numeric fields, with scatter below, density on the diagonal, and correlation above.
3. Mixed fields from the tips data. It shows box plots, bar and mosaic panels, and a contour cell, with densities on the diagonal.

## Follow-up — categorical support

> We need support for categorical. Scatters need to support all data types. We can do a bandwidth/jitter option but it would also be good to support a more intentional version like the box plot or other
