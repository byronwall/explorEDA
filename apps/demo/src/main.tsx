import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
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

// Opening a project folder loads the app shell only when it's used.
const FolderPage = lazy(() => import("./folder/FolderPage"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/folder"
          element={
            <Suspense fallback={null}>
              <FolderPage />
            </Suspense>
          }
        />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
