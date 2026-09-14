# Overall Product Description

The goal of this project is to create a web app that allows for highly interactive and dynamic data visualizations.

## Core Functionalities

- Drop a CSV file and see a preview of the data
- Allow multiple data sources to be used at once
- Provide for merging and joining data sources
- Provide a layer of calculations and transformations to the data
- Create common charts of data
- Allow for interactive exploration of data via filtering, slicing, dicing, and drilling

## Common chart interface

- Use a grid layout with drag/drop and resizing of charts
- A common set of color scales that can be used across all charts
- A common set of name mappings that can be used across all charts

## Common chart features

All charts should have the following features:

- A powerful set of drag/drop options and other small buttons to quickly change the chart type or data
- A popup for settings that offerings configuring every imaginable aspect of the chart
- The ability to create "facets" that allow for small multiples of the same chart
- Ability to select what data is used for the color of the chart

## Specific charts

### Row chart

- A row chart displays the count of records in each group for categorical data
- The chart is a bar chart with the count of records on the X axis and the group on the Y axis
- The chart is sorted by max count by default
  - Allow for sorting by the label instead
- Clicking on a row will select that row
- If colored, the color scale is based on the labels of the rows
- Rendered to SVG

### Bar chart

- A bar chart displays the count of records in each bin for numerical data
- The chart is a bar chart with the count of records on the Y axis and the bin on the X axis
- Clicking on a bar will select that bin
- Dragging or brushing on the chart will select the corresponding bins
- If colored, the color scale is based on an arbitrary piece of data for the row
  - If the same as the label, the color scales becomes a legend of sorts
  - If different, the color scale turns the bar chart into a stacked bar chart
- Rendered to SVG

### Scatter plot

- A scatter plot displays the relationship between two numerical variables
- The chart is a scatter plot with the first variable on the X axis and the second variable on the Y axis
- Clicking on a point will select that point
- Dragging or brushing on the chart will select the corresponding points
- Rendered to canvas for performance
- Allow for scales to be set for the X and Y axes that are numeric or categorical for both
- If colored, the color scale is based on an arbitrary piece of data for the row - this changes the color of the points

### Data table

- A data table displays all the data in a grid
- The table is sortable by any column
- The table is filterable by any column
- The table is drillable by any column
- The table is rendered to DOM elements like `<table>`
- The user is able to select the data that is displayed in the table

### Pivot Table

- A pivot table displays the data in a grid
- The core settings are
  - Pivot fields - the fields to pivot on
  - Pivot values
    - The fields to display in the cells
    - The aggregation function to use for the cells
- The pivot table is rendered to DOM elements like `<table>`
- The user is able to select the data that is displayed in the table
