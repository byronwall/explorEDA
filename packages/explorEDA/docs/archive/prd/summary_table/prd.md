# Summary Table PRD

## Main goals

- Create an initial summary of the data when loaded
- For large data sets, sample the data to 1000 rows
- Determine if the data is numeric or categorical
- For numeric data, determine the min, max, mean, median, standard deviation
- For categorical data, determine the unique values
- Display this summary in a table
- Give a clean icon for numerical vs. categorical data
- If the data only has a single unique value - show an icon for that
- If the data contains nulls or undefined or NaNs - show an icon for that

## UI

- The summary table should render initially and be the main view for creating new charts
- Add buttons to create a row, bar or scatter plot for the data
  - If scatter, default to plotting as Y with the \_ID column as X
- If sampled, show a message to the user that the data is sampled -- offer to process another 1000 rows (or allow user to process up to X% of the data)
