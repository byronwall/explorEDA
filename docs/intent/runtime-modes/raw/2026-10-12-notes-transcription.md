# Notebook pages, 2026-10-12 — transcription

Source photos: `2026-10-12-runtime-modes-page1.jpg`, `2026-10-12-eda-modes-page2.jpg`. Handwriting readings marked `[?]` are uncertain.

## Page 1 — EDA: runtime "modes"

Diagram, two groups:

- **Local:** `CLI → files`; `Browser → files`
- **Server:** `Public → files` | `Private → DBs, storage`

Unify app [?] state for config & settings

- Embedded component: dev handles all
- "Hosted" app: currently demo → becomes standalone app

Need to store:

- config and **user** data → "multi-user system!"
- project/workspace files — on disk
- data source info — in DB
- common schema info
- notebooks or standalone results

Modes

- CLI + stays in repo: project based, like Jupyter books [?]
  - (sketch: CLI pointing at several stacked project folders)
  - runs in different folders → maybe global config
  - `npx exploreda`
- For general users → runs a local server
- Boxed: "Does CLI support databases yet?"

## Page 2 — EDA modes

Browser only: exploreda.dev

- Files API for data sources + config?
- No public storage mechanism
- Maybe a playground with data in URL? (or maybe store with magic link)
- Goal is minimal admin — want to make it easy to test or get ad hoc analysis
- No DB sources — file/CSV only

Self hosted = Docker Compose

- Multi-user
- Global config stored in volume or similar
- Allow DB connections for loading data
  - Full server running to send data back & forth
- Analyses & config stored
- Imagine this is used within a company for 1–10 authors with 10–100 viewers

Paid hosted = per-tenant Docker/Kube

- Multi-user + full enterprise
- SSO
- Integrate with data sources + DB (Google Drive / Excel?)
- Assume horizontal scaling to any size as needed
- (Comes later, once other options are working)

## Chat request accompanying the photos

Use these as intent for the modes the app should work in. Create an initiative for the hosting modes; it somewhat replaces the current commercialization initiative and may run in parallel, since that one was about commercializing the React component. A separate initiative is needed for a proper app with users, login, and config. Create as many initiatives as needed, then ask many questions to set scope and splits.
