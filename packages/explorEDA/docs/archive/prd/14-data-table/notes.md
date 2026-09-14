# Data Table Notes

- Settings, columns, `type` is probably not needed - determine at runtime
- Need to implement row selection
- Settings are done on their own tab - likely want integrated into main tab - can keep comp
- Need to get data via the `useGetLiveData`? -- add a better note about this
- Multiple data table comps are accessing data via hooks - should this go via props instead?
- Table is expecting there to be `selectedRows` -- should this live in the comp?
- ColumnHeader is not being used?
- Selected rows needs some help
- Settings need to update to reflect current object - some fields were removed
- Pagination is mostly ignored with grouping... should limit total row count; not total group count
- If no groupBy, do not group into an `undefined` group
- Need to use the height and force an overflow
- Had to disable row selection since it triggered infinite re-render
- Multiselect does not reorder when dragging
- Likely need to add a NatSort or sort as numbers when numeric
- DataTableSettings lists all the column fields - not needed, doesn't work
- Global search does not seem to be working
- Filter button should be a popover so there's no layout shift

## Test related

- Need to update cursorrules to reflect using vitest instead of jest
- Need to add imports for vitest
