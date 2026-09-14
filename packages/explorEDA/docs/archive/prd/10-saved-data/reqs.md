# Saved Data

- Improve the saved data structure
- Need to save and restore all of:
  - Chart settings
    - Basic chart properties (id, type, title, field)
    - Layout settings (x, y, w, h)
    - Color scales and existing color settings
    - Axis settings (scale type, grid, min/max, labels)
    - Facet settings (enabled, type, variables, column count)
    - Margin settings
    - Chart-specific settings (e.g. minRowHeight for row charts)
    - Grid line settings (x/y grid line counts)
  - Calculation settings
  - Grid settings
    - Grid column count (currently 12)
    - Row height (currently 100px)
    - Container padding
    - Grid background markers
  - View metadata
    - View name
    - Version number
    - Creation/modification dates
- Ensure that clicking `copy charts` will put this whole structure on the clipboard
- Modify the main `DataLayerProvider` to accept the saved data object as a prop - restore everything

## Grid settings

- Need to create an interface to control the grid settings
  - Allow adjusting number of columns (default 12)
  - Allow adjusting row height (default 100px)
  - Allow adjusting container padding
- Need to add a small visual marker with dots to show the current grid size
  - Show grid break points in the background
  - Make it clear where charts will snap to when dragged
