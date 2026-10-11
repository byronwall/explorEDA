import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { setLicenseKey } from "exploreda/license";
import { LandingPage } from "./LandingPage";

import "exploreda/dist/ExplorEda.css";
import "./index.css";

// The deployed site sets its own key at build time; see
// docs/intent/commercial-license/for-byron.md.
setLicenseKey(import.meta.env.VITE_EXPLOREDA_LICENSE_KEY);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LandingPage />
    </BrowserRouter>
  </StrictMode>
);
