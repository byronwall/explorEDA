# Scatter reference material

The current [feature scope](../detailed-shaping.md) and product answers define the intended additions. These links are research starting points, not chosen dependencies.

- [Original Pro session](https://chatgpt.com/c/6ac08186-7fb0-83ea-864e-34a7564edb4c): scatter investigation and subsequent DSL exploration.
- [D3 density contours](https://d3js.org/d3-contour/density): density estimation, bandwidth, contour thresholds, and coordinate units.
- [D3 hexbin](https://github.com/d3/d3-hexbin): hexagonal count geometry and membership.
- [NIST Hotelling T²](https://www.itl.nist.gov/div898/handbook/pmc/section5/pmc543.htm): a separate reference for mean-region inference.
- [Covariance ellipse example](https://matplotlib.org/stable/gallery/statistics/confidence_ellipse.html): geometric background; verify statistical interpretation separately.
- [Covariance and Mahalanobis comparison](https://scikit-learn.org/stable/auto_examples/covariance/plot_mahalanobis_distances.html): background for later robust-distance proposals.

Linear, polynomial, and LOESS conventions need dedicated primary references before implementation. Required density scope includes contours and filled regions. Ellipse, distance, and mean-region material does not make those methods committed package scope.
