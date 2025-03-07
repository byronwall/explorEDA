import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { LandingPage } from "./components/LandingPage.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import "./index.css";
import { GlobalAlertDialog } from "./components/GlobalAlertDialog.tsx";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <GlobalAlertDialog />
      <LandingPage />
      <Toaster />
    </BrowserRouter>
  </StrictMode>
);
