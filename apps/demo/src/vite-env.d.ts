/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** License key for the demo's own workspaces. */
  readonly VITE_EXPLOREDA_LICENSE_KEY?: string;
}

interface ImportMetaEnv {
  /** License service origin, such as https://license.exploreda.dev. */
  readonly VITE_LICENSE_SERVICE_URL?: string;
  /** Paddle client-side token; checkout opens only when it is set. */
  readonly VITE_PADDLE_CLIENT_TOKEN?: string;
  readonly VITE_PADDLE_ENV?: "sandbox" | "production";
  readonly VITE_PADDLE_PRICE_COMMERCIAL?: string;
  readonly VITE_PADDLE_PRICE_OEM?: string;
  /** Cloudflare Turnstile site key for the request forms. */
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}
