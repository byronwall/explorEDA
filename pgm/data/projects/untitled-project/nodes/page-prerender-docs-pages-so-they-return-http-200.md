---
id: page-prerender-docs-pages-so-they-return-http-200
label: Prerender docs pages so they return HTTP 200
type: page
status: planned
priority: high
parent: area-text-and-cli-parity
metadata:
  purpose: Docs are an SPA served via GitHub Pages 404.html (apps/demo/vite.config.ts:16-30). Every /docs/* URL, including sitemap URLs, returns 404 with an empty shell to curl, fetch tools, and crawlers. /daily already builds static pages. Verified with curl.
---
