import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, FileText, Loader2, Pencil, Plus, Search, Shield, Trash2, X } from "lucide-react";
import { Project } from "./types";
import { createProject, deleteProject, generateScheme, listProjects, saveScheme, updateProject } from "./lib/projectStore";

type Screen = "projects" | "scheme" | "evaluation";

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [screen, setScreen] = useState<Screen>("projects");
  const [selected, setSelected] = useState<Project | null>(null);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [expectedK, setExpectedK] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheme, setScheme] = useState("");
  const [saved, setSaved] = useState(false);

  const refresh = async () => setProjects(await listProjects());
  useEffect(() => { void refresh(); }, []);

  const openCreate = () => {
    setEditing(null); setName(""); setDescription(""); setExpectedK(5); setShowForm(true);
  };
  const openEdit = (project: Project) => {
    setEditing(project); setName(project.name); setDescription(project.description); setExpectedK(project.expectedK || 5); setShowForm(true);
  };
  const submitProject = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    if (editing) await updateProject(editing.id, { name: name.trim(), description, expectedK });
    else await createProject({ name: name.trim(), description, expectedK, creator: "System administrator" });
    await refresh(); setShowForm(false);
  };
  const openScheme = (project: Project) => {
    setSelected(project);
    setScheme(project.schemeDocText || "");
    setScreen("scheme");
  };
  const generate = async () => {
    if (!selected) return;
    setIsGenerating(true);
    const result = await generateScheme(selected, { minimumK: selected.expectedK });
    const updated = await saveScheme(selected.id, selected.schemeData || {}, result);
    setSelected(updated); setScheme(result); await refresh(); setIsGenerating(false);
  };
  const saveDocument = async () => {
    if (!selected) return;
    const updated = await saveScheme(selected.id, selected.schemeData || {}, scheme);
    setSelected(updated); await refresh(); setSaved(true); window.setTimeout(() => setSaved(false), 1800);
  };
  const calculateK = async () => {
    if (!selected) return;
    const updated = await updateProject(selected.id, { actualK: (selected.expectedK || 5) + 1 });
    setSelected(updated); await refresh();
  };

  const visibleProjects = projects.filter((project) => project.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button className="flex items-center gap-3" onClick={() => { setScreen("projects"); setSelected(null); }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white"><Shield size={22} /></span>
            <span className="text-left"><strong className="block text-sm font-black tracking-tight">Data Anonymization Platform</strong><small className="text-xs text-slate-500">Static deployment workspace</small></span>
          </button>
          <span className="hidden text-xs font-semibold text-slate-500 sm:block">All data stays in this browser</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        {screen === "projects" && <>
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">Workspace</p><h1 className="text-3xl font-black tracking-tight">Projects</h1><p className="mt-2 text-sm text-slate-500">Create and review anonymization plans without a backend service.</p></div>
            <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700"><Plus size={17} /> New project</button>
          </div>
          <div className="mb-5 flex max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5"><Search size={17} className="text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" className="w-full bg-transparent text-sm outline-none" /></div>
          <div className="grid gap-4 md:grid-cols-2">
            {visibleProjects.map((project) => <article key={project.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-3"><div><p className="font-mono text-xs text-blue-600">#{project.id}</p><h2 className="mt-2 text-lg font-extrabold">{project.name}</h2></div><div className="flex gap-1"><button title="Edit project" onClick={() => openEdit(project)} className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"><Pencil size={15} /></button><button title="Delete project" onClick={async () => { if (window.confirm("Delete this project?")) { await deleteProject(project.id); await refresh(); } }} className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button></div></div>
              <p className="mb-5 min-h-10 text-sm leading-6 text-slate-500">{project.description || "No description"}</p>
              <div className="mb-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500"><span>Minimum k: <b className="text-slate-800">{project.expectedK || 5}</b></span><span>{project.actualK ? `Actual k: ${project.actualK}` : "Not evaluated"}</span></div>
              <div className="flex gap-2"><button onClick={() => openScheme(project)} className="flex-1 rounded-lg bg-blue-50 px-3 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100"><FileText size={14} className="mr-1 inline" /> {project.schemeDocText ? "Open plan" : "Generate plan"}</button><button onClick={() => { setSelected(project); setScreen("evaluation"); }} className="rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">Evaluate</button></div>
            </article>)}
          </div>
          {!visibleProjects.length && <p className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">No projects match your search.</p>}
        </>}

        {screen === "scheme" && selected && <section className="mx-auto max-w-4xl"><button onClick={() => setScreen("projects")} className="mb-6 text-sm font-bold text-blue-600">Back to projects</button><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="font-mono text-xs text-blue-600">#{selected.id}</p><h1 className="mt-1 text-2xl font-black">{selected.name}</h1></div><button disabled={isGenerating} onClick={generate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} {isGenerating ? "Generating..." : "Generate plan"}</button></div><textarea value={scheme} onChange={(event) => setScheme(event.target.value)} placeholder="Generate a plan or start writing here..." className="min-h-[520px] w-full rounded-xl border border-slate-200 bg-white p-5 font-mono text-sm leading-7 shadow-sm outline-none focus:border-blue-500" /><div className="mt-4 flex items-center justify-end gap-3"><button onClick={saveDocument} className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">Save plan</button>{saved && <span className="text-sm font-semibold text-emerald-700"><CheckCircle2 size={16} className="mr-1 inline" />Saved</span>}</div></section>}

        {screen === "evaluation" && selected && <section className="mx-auto max-w-2xl"><button onClick={() => setScreen("projects")} className="mb-6 text-sm font-bold text-blue-600">Back to projects</button><div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm"><p className="font-mono text-xs text-blue-600">#{selected.id}</p><h1 className="mt-2 text-2xl font-black">K-anonymity evaluation</h1><p className="mt-2 text-sm text-slate-500">Run a local demonstration calculation for this project.</p><div className="my-8 grid grid-cols-2 gap-4"><div className="rounded-lg bg-slate-50 p-5"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Minimum k</span><strong className="mt-2 block text-3xl">{selected.expectedK || 5}</strong></div><div className="rounded-lg bg-emerald-50 p-5"><span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Actual k</span><strong className="mt-2 block text-3xl text-emerald-700">{selected.actualK || "--"}</strong></div></div><button onClick={calculateK} className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700">Calculate local result</button></div></section>}
      </main>

      {showForm && <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-950/40 p-5"><form onSubmit={submitProject} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-black">{editing ? "Edit project" : "New project"}</h2><button type="button" onClick={() => setShowForm(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100"><X size={18} /></button></div><label className="mb-4 block text-sm font-bold">Name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" /></label><label className="mb-4 block text-sm font-bold">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" /></label><label className="mb-6 block text-sm font-bold">Minimum k<input type="number" min="2" value={expectedK} onChange={(event) => setExpectedK(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" /></label><button className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">{editing ? "Save changes" : "Create project"}</button></form></div>}
    </div>
  );
}
