import { Project } from "../types";

const STORAGE_KEY = "nmh-anonymization-projects";

const initialProjects: Project[] = [
  {
    id: "p1",
    name: "Clinical research data anonymization project",
    description: "A demonstration project for anonymizing clinical research records and imaging data.",
    creator: "System administrator",
    createdAt: "2026-06-18 10:24",
    updatedAt: "2026-07-20 01:15",
    expectedK: 5,
    schemeData: {},
  },
  {
    id: "p2",
    name: "Cardiology AI training data project",
    description: "Prepare anonymized clinical data for model training.",
    creator: "System administrator",
    createdAt: "2026-07-02 14:15",
    expectedK: 10,
  },
];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

function getProjects(): Project[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.warn("Unable to read locally saved projects:", error);
  }

  const projects = clone(initialProjects);
  saveProjects(projects);
  return projects;
}

function saveProjects(projects: Project[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function timestamp() {
  return new Date().toISOString().replace("T", " ").slice(0, 16);
}

function findProject(id: string) {
  const projects = getProjects();
  const project = projects.find((item) => item.id === id);
  if (!project) throw new Error("Project not found");
  return { projects, project };
}

export async function listProjects() {
  return clone(getProjects());
}

export async function createProject(input: Pick<Project, "name" | "description"> & Partial<Pick<Project, "creator" | "expectedK">>) {
  const projects = getProjects();
  const project: Project = {
    id: `p_${Date.now()}`,
    name: input.name,
    description: input.description || "",
    creator: input.creator || "System administrator",
    createdAt: timestamp(),
    expectedK: input.expectedK ?? 5,
  };
  projects.push(project);
  saveProjects(projects);
  return clone(project);
}

export async function updateProject(id: string, changes: Partial<Project>) {
  const { projects, project } = findProject(id);
  Object.assign(project, changes, { updatedAt: timestamp() });
  saveProjects(projects);
  return clone(project);
}

export async function deleteProject(id: string) {
  const projects = getProjects().filter((project) => project.id !== id);
  saveProjects(projects);
}

export async function saveScheme(id: string, schemeData: unknown, schemeDocText: string) {
  return updateProject(id, { schemeData, schemeDocText });
}

export async function saveSchemeInputs(id: string, schemeInputs: unknown) {
  const { projects, project } = findProject(id);
  const now = timestamp();
  const versions = project.versions ? clone(project.versions) : [];

  if (!versions.some((version) => version.version === "v1.0")) {
    versions.push({
      version: "v1.0",
      name: "Initial version",
      updatedAt: project.createdAt,
      schemeInputs: clone(project.schemeInputs || schemeInputs),
    });
  }

  const currentVersion = versions.find((version) => version.version === "v1.1");
  if (currentVersion) {
    currentVersion.updatedAt = now;
    currentVersion.schemeInputs = clone(schemeInputs);
  } else {
    versions.push({ version: "v1.1", name: "Latest version", updatedAt: now, schemeInputs: clone(schemeInputs) });
  }

  Object.assign(project, { schemeInputs, versions, updatedAt: now });
  saveProjects(projects);
  return clone(project);
}

export async function generateScheme(project: Project, details: { usageScenario?: string; evaluationMethod?: string; minimumK?: number }) {
  const usage = details.usageScenario || "approved clinical research";
  const method = details.evaluationMethod || "K-anonymity";
  const minimumK = details.minimumK || project.expectedK || 5;
  return `# ${project.name} Data Anonymization Plan\n\n## 1. Project scope\n${project.description || "This project covers approved clinical research data."}\n\n## 2. Data usage\nThe anonymized data is limited to ${usage}. Access is restricted to authorized personnel and recorded in an audit log.\n\n## 3. Protection measures\nDirect identifiers are removed or replaced with pseudonymous values. Quasi-identifiers are generalized and dates are shifted consistently per subject.\n\n## 4. Quality assessment\nThe data will be assessed using ${method}. Each released equivalence class must satisfy k >= ${minimumK}.\n\n## 5. Release controls\nData is released only after compliance review and the release record is retained.`;
}
