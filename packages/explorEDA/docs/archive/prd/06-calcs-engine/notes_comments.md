# Notes and comments

- Swap any for datum
- Review `keyword` for ohm - looks not used
- How does the registry interact with the parser + calculator?
  - The registry seems like it will be deleted -- not clear what it's purpose was
- Need to think through how to handle vector vs. scalar calcs
  - basically all calcs will run row wise eventually... except those that must process an entire column at once
  - teh current `Context` is trying to split data from variables - likely want getter funcs instead
  - Remove the non-vectorized calcs - do not want to produce scalars right now
- Need better organization around calc defs -- cannot all be in one big file
- Need to review coverage and find all of the dead code - clean it out
- Need to go clean up the data flows - they're not performant
- Put some icons in the available fields helper - if it stays
- Allow the expression field to be a quick text edit instead of opening the whole menu
- Calcs should be case insensitive by default with name lookups

## Maybe

- Add calculated fields to the summary table - give a calc icon

## More ideas

- Allow the calcs to be edited as a large text blob - use Monaco and add editor support
- Also show an interface for quickly editing/updating things
- Provide a calc summary as a comp that can be placed in the grid
