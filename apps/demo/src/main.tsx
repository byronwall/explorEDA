import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { registerMapLibre } from "exploreda";
import { LandingPage } from "./LandingPage";

import "exploreda/dist/ExplorEda.css";
import "./index.css";

// Street maps are optional. Loading MapLibre after the page keeps it out of
// the first bundle; point maps pick it up when it arrives.
void Promise.all([
  import("maplibre-gl"),
  import("maplibre-gl/dist/maplibre-gl.css"),
]).then(([maplibre]) => registerMapLibre(maplibre));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LandingPage />
    </BrowserRouter>
  </StrictMode>
);
