import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { httpProjectFiles, takeToken } from "./httpFiles";
import { TeamApp } from "./team/TeamApp";
import { isTeamServer } from "./team/teamApi";

import "exploreda/dist/ExplorEda.css";
import "./base.css";
import "./app.css";

const token = takeToken();
const files = token ? httpProjectFiles(token) : undefined;

/** Without the CLI's key, this page is either on a team server or lost. */
function Start() {
  const [team, setTeam] = useState<boolean>();
  useEffect(() => {
    void isTeamServer().then(setTeam);
  }, []);
  if (team === undefined) {
    return null;
  }
  if (team) {
    return <TeamApp />;
  }
  return (
    <main className="app-message">
      <h1>Open the link from your terminal</h1>
      <p>
        Run <code>npx exploreda</code> in a folder and open the link it prints.
        The link carries a key that lets this page read the folder.
      </p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>{files ? <App files={files} /> : <Start />}</StrictMode>
);
