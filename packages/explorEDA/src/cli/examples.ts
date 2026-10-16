/**
 * Sample projects, by the name `exploreda --example` takes: the folder under
 * the package's examples/ to copy, and the folder it is copied to.
 */
export const EXAMPLES = {
  shop: { from: "shop", to: "exploreda-example" },
  database: { from: "database", to: "exploreda-example-database" },
  forecast: { from: "forecast", to: "exploreda-example-forecast" },
} as const;
