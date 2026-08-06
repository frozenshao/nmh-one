import { Project } from "../types";
import {
  createProject,
  deleteProject,
  generateScheme,
  listProjects,
  saveScheme,
  saveSchemeInputs,
  updateProject,
} from "./projectStore";

type ApiResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
};

const response = (body: any, status = 200): ApiResponse => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

export async function apiFetch(path: string, options: RequestInit = {}): Promise<ApiResponse> {
  const method = (options.method || "GET").toUpperCase();
  const body = typeof options.body === "string" ? JSON.parse(options.body) : options.body || {};

  try {
    if (path === "/api/projects" && method === "GET") {
      return response(await listProjects());
    }
    if (path === "/api/projects" && method === "POST") {
      return response(await createProject(body));
    }
    if (path === "/api/generate-scheme" && method === "POST") {
      const project: Project = {
        id: body.projectId || "draft",
        name: body.projectName,
        description: body.projectDesc || "",
        creator: "System administrator",
        createdAt: "",
        expectedK: body.minimumK,
      };
      const scheme = await generateScheme(project, body);
      return response({ scheme, isOffline: true });
    }

    const schemeInputsMatch = path.match(/^\/api\/projects\/([^/]+)\/scheme-inputs$/);
    if (schemeInputsMatch && method === "PUT") {
      return response({ success: true, project: await saveSchemeInputs(schemeInputsMatch[1], body.schemeInputs) });
    }

    const schemeMatch = path.match(/^\/api\/projects\/([^/]+)\/scheme$/);
    if (schemeMatch && method === "PUT") {
      return response({ success: true, project: await saveScheme(schemeMatch[1], body.schemeData, body.schemeDocText) });
    }

    const projectMatch = path.match(/^\/api\/projects\/([^/]+)$/);
    if (projectMatch && method === "PUT") {
      return response(await updateProject(projectMatch[1], body));
    }
    if (projectMatch && method === "DELETE") {
      await deleteProject(projectMatch[1]);
      return response({ success: true });
    }

    return response({ error: "Unsupported local operation" }, 404);
  } catch (error) {
    console.error("Local project storage operation failed:", error);
    return response({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
}
