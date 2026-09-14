# Color Legend Requirements

## Overview

The color legend component will provide visual representation and interaction capabilities for both numerical (continuous) and categorical (discrete) color scales used in the visualization system.

## Requirements

### Core Functionality

- Must support both numerical (continuous) and categorical (discrete) color scales
- Must dynamically update when color scale properties change
- Must handle undefined/missing color scales gracefully
- Must maintain consistency with the color scale types defined in `ColorScaleTypes.ts`

### Numerical Color Scale Legend

- Display a continuous gradient representing the color scale
- Show min and max values at the ends of the gradient
- Support all D3 interpolation methods currently in use (Viridis, Inferno, Magma, etc.)
- Allow users to update min/max values through direct input
- Display the current color scale name

### Categorical Color Scale Legend

- Display discrete color blocks for each category
- Show category labels next to their corresponding colors
- Support reordering of categories
- Allow users to modify individual category colors
- Handle overflow when there are many categories
- Display the current palette name

### Interaction Requirements

- Click to select/focus a color scale
- Hover states for interactive elements
- Clear visual indication of the currently selected scale
- Ability to remove/delete a color scale
- Option to create a new color scale

### Visual Design

- Compact yet readable layout
- Clear visual hierarchy
- Consistent styling with existing shadcn/ui components
- Responsive design that works in the sidebar
- Clear distinction between numerical and categorical legends

## Outstanding Questions

1. Should we allow users to change the interpolation method/palette directly from the legend?
2. How should we handle very long category names in the categorical legend?
3. Do we need to support custom tick marks for numerical scales?
4. Should we provide a way to copy/duplicate color scales?
5. How should we handle color blind accessibility considerations?
