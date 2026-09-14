# Chart facetting requirements

- Assume every chart type supports a mode where you can face it by grid or by wrapping
- Grid requires 2 variables, one for row and one for column
- Wrap requires 1 variable, use the row variable field
  - If row, supply the number of columns to render

Core facet logic:

- Take the raw data and split it into multiple charts for the unique values of the variable
- Need to pass a set of IDs into the chart that are the "active facet" - also need to pass in all IDs in case that's needed
- Determine the facet membership outside of the chart - chart deals with visuals

How to facet:

- Each unique value of the facet variable should get a new chart
- Render a header above the chart that shows the facet value

When facetted:

- Charts need to be aware of each other's axis limits - default is for all charts to look the same
- Chart will render into a smaller space
- A component above the chart will take care of creating the DOM for facets
  - Use a table for layout for grid - use the top and left for the facet header
  - For wrap, use the row variable field for the facet header, put it above the chart - use DIVs instead of a table
- Vast majority of other chart settings should be the same as if not facetted - for now, just the axis is different

Global axis considerations:

- Need a hook with context that allows the chart to broadcast its axis limits - global hook should keep track of the most extreme limits
- the other charts should have logic to use those limits if they are most extreme
- Individual charts can choose to adopt their own limit if they want to

Size and overflow thoughts

- Each chart gets decide how to render in its box
- Most charts should choose to fit in their box
- Some of the more DOM charts may overflow (like the pivot table)
