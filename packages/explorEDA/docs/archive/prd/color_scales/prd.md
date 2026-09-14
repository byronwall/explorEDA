# Color Scale PRD

## Main goals

- Allow creating 3 types of color scales
  - Numerical
  - Categorical
- Color scales need to be defined globally across all data
- All charts should allow a color scale to be selected

## Categorical Colors

Define a mapping of label -> color
Use a pallette of colors that can be changed - pick the next color in the pallette

## Numerical Colors

Define a mapping of value -> color using a min and max for the color scale
Allow the user to pick from a set of pallettes - use the common scales in d3

## Colors + Charts

- Row = color the bar based on the label
- Bar
  - if numeric, color the bar based on the value
  - if categorical, color the bar based on the label
- Scatter
  - color the point based on the color variable given (may not be the x or y axis)

## UI for colors

Give a popover that lists all color scales and allows the user to change them

## Other items

Allow the user to define a new color scale with their own name
When listing available color scales, include the data fields and also the custom scales.
