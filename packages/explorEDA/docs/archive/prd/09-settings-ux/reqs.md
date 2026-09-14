# Settings UX

- Need to improve the vertical space and layout
- Move toward a tab interface for related things:
  - Main tab = core common settings and critical settings for specific chart type
  - Axis tab = settings related to axes
  - Facet tab = settings related to faceting
  - Advanced settings tab = everything else
- Give a view that shows only the "non default" settings - focus on stuff that changed
- Make the form a little wider and allow the label to be left of the input

## Comps to include

- A `NumericInputEnter` that allows a numeric input have ENTER has been pressed.
  - Use arrow keys to change the value
  - Use `shift` + arrow keys to change the value by 10 or a prop
  - Use `cmd/ctrl` + `arrow` to change the value by 100 or a prop
