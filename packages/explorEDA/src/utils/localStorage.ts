import type { SavedProject } from "@/providers/DataLayerProvider";

const PROJECTS_KEY = "data-viz-projects";

export function saveProjects(projects: SavedProject[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function loadProjects(): SavedProject[] {
  const projectsJson = localStorage.getItem(PROJECTS_KEY);
  if (!projectsJson) {
    return [];
  }
  try {
    const projects: unknown = JSON.parse(projectsJson);
    if (!Array.isArray(projects)) {
      return [];
    }

    return projects.filter((project): project is SavedProject => {
      if (!project || typeof project !== "object") {
        return false;
      }
      const candidate = project as Record<string, unknown>;
      return (
        candidate.version === 1 &&
        typeof candidate.name === "string" &&
        typeof candidate.sourceDataPath === "string" &&
        typeof candidate.isSaved === "boolean" &&
        Array.isArray(candidate.views)
      );
    });
  } catch {
    return [];
  }
}

export function saveProject(project: SavedProject): void {
  const projects = loadProjects();
  const existingIndex = projects.findIndex(
    (p) => p.sourceDataPath === project.sourceDataPath
  );

  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }

  saveProjects(projects);
}

export function deleteProject(sourceDataPath: string): void {
  const projects = loadProjects();
  const filteredProjects = projects.filter(
    (p) => p.sourceDataPath !== sourceDataPath
  );
  saveProjects(filteredProjects);
}
