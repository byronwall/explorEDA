import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { LandingPage } from "./LandingPage.tsx";

import "@byronwallrus/exploreda/dist/ExplorEda.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LandingPage />
    </BrowserRouter>
  </StrictMode>
);
