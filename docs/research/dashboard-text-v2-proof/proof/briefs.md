# Six dashboard briefs for the cold-agent authoring test

Write each dashboard as dashboard text using only `reference-v0.md`. Each brief names its dataset and fields.

## 1. Penguin field notes (multi-view)

**Fields:** species, island, bill_length_mm, bill_depth_mm, flipper_length_mm, body_mass_g, sex, year

Species colors: Adelie #3479a8, Chinstrap #c77a45, Gentoo #4b9688. Give the four measurements readable labels with units.

**Charts:**

- A scatter of flipper length against body mass, colored by species.
- A scatter of bill length against bill depth, colored by species.
- Row charts of species (colored) and of island.
- A box plot of body mass by species.
- A histogram of flipper length.
- A table of every field.
- Parallel coordinates of the four measurements plus island, colored by species.

**Views:**

- **Penguin field notes:** everything. The first band has the body-size scatter on half the width, with species and island on a quarter each. The second band has bill scatter, box plot, and histogram in thirds. Then the table, then parallel coordinates.
- **Gentoo on Biscoe:** the species and island rows (selecting Gentoo and Biscoe), the body-size scatter, and the table.
- **Field report,** in the newsprint theme: the body-size scatter at 7 columns beside species at 5, with bill scatter and box plot below in the same 7/5 split. Every chart gets a headline-style title and a subtitle. Body size also gets a source note: "Palmer Station LTER; Gorman, Williams and Fraser (2014)".

## 2. From orders to contribution

**Fields:** Order, Order Date, Region, Channel, Category, Product, Customer Segment, Units, Unit Price, Discount, Revenue, Cost, Margin, Fulfilled, Returned, Delivery Days

**Calculations:**

- Discount rate: Discount clamped to 0–0.25, with null treated as 0.
- Gross sales: Units × Unit Price.
- Discount amount.
- Net sales.
- Contribution: Net sales − Cost.
- Contribution rate: a percentage of net sales.
- Order band: Large ≥ 500, Standard ≥ 100, otherwise Small.
- Order month (formatted `%Y-%m`) and Order quarter.

**Charts:**

- A markdown intro explaining the chain.
- A symlog-symlog scatter of net sales against contribution.
- Rows by order band.
- A histogram of contribution rate.
- A line of net sales by Order, faceted by quarter in 2 columns, with no legend.
- A pivot of sum of net sales and sum of contribution by order month.
- A table tracing the calculation columns.

Lay it out sensibly.

## 3. The changing nature of middle-class jobs (composition)

**Fields:** Group, Group order, Group change, Occupation, Year, Jobs per 1000, Women share, Women minus men

**Graphic:** one composition, 704 tall.

- Title: "The Changing Nature of Middle-Class Jobs", size 26. Add a subtitle and a source footnote at the bottom.
- A unit repeated by Group in a 5-column grid with gap 46, ordered by max Group order, limit 10. Each frame is 120×180 with an axis.
  - Each frame draws a path per Occupation from Year to Jobs per 1000. The path is colored by a diverging scale on "Women minus men": blue #1a8fd0 to red #e3173b, gray #b9b9b9 center, max 100, labeled "Share of women minus share of men, points".
  - Points mark the ends.
  - The Year axis shows end ticks only, with no zero and no nice rounding. The jobs axis is capped at 85.
  - Each frame's label shows max Group change as "+N jobs" or "−N jobs".
- A legend for the paths at 620,130, laid out in a row.
- Leader notes for "Registered nurses" on Professionals and "Secretaries" on Admin support.

Below the composition, add a row chart by Group and a histogram of Women share, side by side.

## 4. Forecast fan (composition)

**Fields:** Measure, Period, Year, Kind, Central, P10, P20, P30, P40, P60, P70, P80, P90

**Graphic:** a composition 540 tall.

- Title: "Two measures, three years ahead". Add a subtitle and a footnote.
- A unit repeated by Measure in 2 columns with gap 72. Each frame is 380×300.
  - Four nested bands from Year: P10–P90, P20–P80, P30–P70, and P40–P60. All use #1f4e8c, at opacity .12, .16, .20, and .26.
  - A central path.
  - A vertical rule at 2025 labeled "Projection" that shades after it.
  - A horizontal 2% rule shown only for "GDP growth".
  - The y scale is per instance and labeled Percent.
  - Each frame's label shows the last Central value by Year.
- A legend listing the central path and the four intervals with custom labels.

Below it, add a line of Central by Year (8 columns) and a row chart of Kind (4 columns).

## 5. Speed, conversion, and trial volume (annotations)

**Fields:** Day, Phase, Visitors, Returning visitors, Trials, Conversion (%), Response time (ms)

**Charts:**

- A bubble scatter: Response time against Conversion, sized by Trials with a maximum radius of 20, at opacity .5, colored by Phase (Baseline #3479a8, Release #c77a45, Follow-up #4b9688). It's 8 columns wide and 6 tall, with these annotations:
  - A callout on day 31: "Day 31: slowest response".
  - A target line at conversion 4%.
  - A line at mean response time.
  - An ellipse over response 275–345 and conversion 4.1–5.15: "Fast, high-converting days".
- Beside it, a metric of total Trials above a row chart of Phase.

## 6. Shop overview

**Fields:** as in brief 2.

**Charts:**

- Three metrics across the top: order count, total Revenue, and average Revenue. Revenue is formatted as USD currency.
- Revenue by Region as rows, colored by Region.
- A histogram of Delivery Days with 24 bins.
- A weekly line of Revenue by Order Date, split by Channel as a stacked area, with a band for the summer sale from 2024-06-01 to 2024-08-31.
- A table of Order, Order Date, Region, Channel, and Revenue.
- A workspace filter limiting everything to the West and East regions.
