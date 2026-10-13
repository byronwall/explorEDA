import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { httpProjectFiles, takeToken } from "./httpFiles";

import "exploreda/dist/ExplorEda.css";
import "./base.css";
import "./app.css";

const token = takeToken();
const files = token ? httpProjectFiles(token) : undefined;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {files ? (
      <App files={files} />
    ) : (
      <main className="app-message">
        <h1>Open the link from your terminal</h1>
        <p>
          Run <code>npx exploreda</code> in a folder and open the link it
          prints. The link carries a key that lets this page read the folder.
        </p>
      </main>
    )}
  </StrictMode>
);
