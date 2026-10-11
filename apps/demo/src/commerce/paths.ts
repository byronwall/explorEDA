/**
 * The pricing and licensing pages. The build also writes a copy of the app
 * at each path, so they load with a 200 instead of through 404.html.
 */
export const COMMERCE_PAGES = {
  "/pricing": "Pricing · explorEDA",
  "/license": "License and keys · explorEDA",
  "/legal/license": "explorEDA License",
  "/legal/commercial-license": "Commercial License Agreement · explorEDA",
  "/legal/terms": "Terms of sale · explorEDA",
  "/legal/refunds": "Refund policy · explorEDA",
  "/legal/privacy": "Privacy policy · explorEDA",
  "/security": "Security · explorEDA",
  "/support": "Support and stability · explorEDA",
} as const;

export type CommercePath = keyof typeof COMMERCE_PAGES;

export function commercePath(pathname: string): CommercePath | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path in COMMERCE_PAGES ? (path as CommercePath) : null;
}
