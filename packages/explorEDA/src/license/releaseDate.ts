declare const __EXPLOREDA_RELEASE_DATE__: string | undefined;

/**
 * The date this build was released. The package build stamps it; running
 * from source counts as released today.
 */
export const RELEASE_DATE =
  typeof __EXPLOREDA_RELEASE_DATE__ === "string"
    ? __EXPLOREDA_RELEASE_DATE__
    : new Date().toISOString().slice(0, 10);
