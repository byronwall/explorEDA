## Major work remaining

### Core data viz

- Axis related settings and renderings - really need control over axes, labelling automatically, etc
- Improve handling of times stamps
- Add a filter summary + filter controller
- Top level filter + steps = ability to quickly segment data and work on slices -- almost like a `slice` comp

### Annoying visual problems

- Get full alignment between the react grid handles, background grid, and the panel borders
- Need to add just a bit of padding between the various containers - not too much, but enough to keep the content from hitting the edge of the panel

### Axis and margins

- Need to come up with default margins for each chart type - ensure these are switched when the chart is created or type is switched

### Packaging and usages

- Split out the chart components, so that the charting portion can be rented on its own with just data as props make it so that users can use it without needing all of the cross filter machinery still show a setting button that way they can self configure the chart

### Docs and help

- Add a README to the `explorEDA` package so that it appears in the npm page
- Write up the motivation for the project
- Create a full doc site with helper images - add to the demo site somehow
- Create some videos showing usage

## Nice to haves

- Add GPS maps + data display
  - Figure out how to do chloropleth maps
- Add supporting for multiple data sources and relationships
- Add data isolation + "fork" modes - create tabbed interfaces for these
- Create a SPLOM comp that renders scatter plot matrices
- Add a UMAP or TSNE comp that shows clusters from embeddings
- Global color themes
- `Tree map` view

## Small problems

### Chart Visualization and Rendering

- Scatter plot needs to allow new drag filter on off-click if already brushed
- Charts are all missing consistent gridlines
- Clicking on a numerical bar chart should filter by the width of the bar
- Bar chart needs a bunch of visual tweaks
  - Give option to render label on top of bar (instead of to left; affects the axis def)
  - Set a max length on that label
  - Allow ordering by label
  - Allow keeping 0 count items in display to avoid layout shift when filtering
  - Click on `others` to double height of chart
- Scatter points need to render on top of gridlines
- Do not attempt to render points and bars that are not visible due to axis limits
- Decide if it is worth allowing the y categories to be globally shared in Row charts w/ facets
- Row chart should give a warning about missing field instead of rendering undefined - maybe give a drop down immediately
- Row chart should allow clicking anywhere on bar or label to filter - use pointer cursor - give a visual indicator of the filter in case base is small (bold + funnel)
- Put the `clear all filters` button in the main toolbar - make it icon only

### Data Display and Formatting

- Bools should be shown as `true`/`false` not `1`/`0`
- Verify that null detection is working correctly
- Need to build chart title from data fields

### Summary and Pivot Table

- Debounce the slider on the summary table to prevent too many re-renders
- Show the total row count somewhere on the summary table
- Add filtering to the summary table
- Pivot table - implement filtering and sorting
- Summary table causes a render with each column? Do them all in one shot if possible - check time and then RAF to continue
- Need to wire up the "details" view for the pivot table
- Integrate the data summary info into the field chooser drop downs - show icon for field (maybe a count, etc)

### Calculations and Filtering

- Calculation def should describe the available fields created by the calc - default is just producing the calc name - regression would generate estimate, residual, etc. need to declare in advance so drop down menus show what is possible
- A `Region` calc that allows building a 2D mapping and creating regions of assignment
- "Filter to calc" - convert a filter to a calc that segments the data
- Conditional formatting - allow for background regions to appear in charts if some condition is met?

### Settings and Configuration

- Need to implement the full suite of control for axis limits - scatter defaults to all available global data
- Settings that need wired up:
  - Label title overrides
  - Grid lines - tick counts
  - Axis limits
  - Need to hide certain axis settings that cannot be easily changed

### Related to Data Table

- Should include option to filter only the component or to filter the entire crossfilter context
- Global search seems to not work - does it search all fields? or just those involved in the display
- Add highlighter when using the global search or other filters
- Show filter as a row below the header - add option to change type
- Add a popover for quick access to advanced filtering options

## Color scales

- Color fields should use a `ColorSelector` that is based on existing fields and user defined color scales
- Allow user to convert or create an ordinal scale from a numeric field

## Line chart - future ideas

- Zoom and pan support
- Allow creating a sub-chart by brushing a region - create the new chart below the current one with new axes
- Brush selection for time range
- Multiple y-axes support - start with a right axis - will expand in the future to allow multiple y-axes
- Crosshair on hover

### Random

- Lorenz bar chart for Run ID is missing a bar?
- Animate the `update charts` button - make it smaller too
- Row chart min and max bar sizes don't seem to be working
- Pivot table needs supports for sorting and filtering
- Remove the `ChartTypes` array - infer completely from the registry
- Consider tracking the mouse pos on the scale? -- implement across all charts
- Need an axis label for the x and y axis - this should be handled globally - the chart settings should be an override - pass in the field for each chart
- Sort the fields by name in the `FieldSelector`
- Sort the `add chart` menu by chart name
- Add ability to track the mouse position in the chart on the axes - give a small red line
- Add support for reading and processing parquet files
- Add support for reading and processing xlsx files
- Bar chart nearly always breaks when a different chart is filtered
- Random scatter plot fails to render on the basic numbers example
- Creating a blank scatter plot fails with length error
- Grid line settings should move to the axis tab and be available on a variety of chart types
- Plot margins are ignored on the LineChart - check to see if this is true for other charts
