import React, { useState, useEffect } from "react";
import { Project, ViewState, UploadState } from "../types";
import { apiFetch } from "../lib/apiFetch";
import { 
  Plus, Search, FolderKanban, User, Calendar, Settings2, Trash2, 
  FileText, Play, ShieldCheck, Edit3, X, HelpCircle, Loader2, Sparkles, Check, Upload, Sliders
} from "lucide-react";

interface ProjectListProps {
  onSelectAction: (project: Project, action: ViewState, initialStep?: 1 | 2) => void;
  projectUploadStates?: { [projectId: string]: UploadState };
}

export default function ProjectList({ onSelectAction, projectUploadStates = {} }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  
  // Form values
  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [expectedKInput, setExpectedKInput] = useState<number>(5);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Load projects from API
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects by Name
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add new project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      alert("璇疯緭鍏ラ」鐩悕绉?);
      return;
    }

    try {
      const response = await apiFetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          description: descInput,
          expectedK: expectedKInput,
          creator: "鍒樻檽鏁忥紙椤圭洰鍚堣閮ㄧ粡鐞嗭級" // default realistic toB creator
        })
      });

      if (response.ok) {
        await fetchProjects();
        setIsAddModalOpen(false);
        setNameInput("");
        setDescInput("");
        setExpectedKInput(5);
      } else {
        alert("鏂板椤圭洰澶辫触锛岃閲嶈瘯");
      }
    } catch (err) {
      console.error(err);
      alert("鏂板椤圭洰寮傚父");
    }
  };

  // Open Edit modal
  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setNameInput(project.name);
    setDescInput(project.description);
    setExpectedKInput(project.expectedK || 5);
    setIsEditModalOpen(true);
  };

  // Edit project handler
  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    if (!nameInput.trim()) {
      alert("椤圭洰鍚嶇О涓嶈兘涓虹┖");
      return;
    }

    try {
      const response = await apiFetch(`/api/projects/${editingProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          description: descInput,
          expectedK: expectedKInput
        })
      });

      if (response.ok) {
        await fetchProjects();
        setIsEditModalOpen(false);
        setEditingProject(null);
        setNameInput("");
        setDescInput("");
        setExpectedKInput(5);
      } else {
        alert("缂栬緫椤圭洰澶辫触");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete project
  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`纭畾瑕佹案涔呭垹闄ゅ幓鏍囪瘑椤圭洰 [${name}] 鍚楋紵姝ゆ搷浣滀笉鍙€嗐€俙)) {
      return;
    }

    try {
      const response = await apiFetch(`/api/projects/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        await fetchProjects();
      } else {
        alert("鍒犻櫎椤圭洰澶辫触");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8" id="project_list_container">
      
      {/* Search and action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm" id="project_search_bar_row">
        {/* Search Field */}
        <div className="flex items-center space-x-2 flex-1 max-w-lg">
          <span className="text-xs font-black text-slate-700 whitespace-nowrap">椤圭洰鍚嶇О锛?/span>
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="璇疯緭鍏ラ」鐩悕绉?
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded text-xs font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
              id="search_project_input"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            setNameInput("");
            setDescInput("");
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white px-6 py-3 rounded text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-200/80 transition-all"
          id="add_project_trigger_btn"
        >
          <Plus className="w-4.5 h-4.5 stroke-[3px]" />
          <span>鏂板椤圭洰</span>
        </button>
      </div>

      {/* Grid view of projects */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24" id="project_list_loader">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-500 mt-3 font-black uppercase tracking-wider">姝ｅ湪璇诲彇鍖垮悕鍖栭」鐩?..</span>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="project_cards_grid">
           {filteredProjects.map((project, index) => {
             const isSchemeCompleted = !!(project.schemeDocText || project.schemeData) && !project.isRegeneratingPending;
             const isUploadCompleted = !!(projectUploadStates[project.id]?.isCompleted || (project.id === 'p1' && !project.isRegeneratingPending));
             const isConfigCompleted = !!(projectUploadStates[project.id]?.isConfigCompleted || (project.id === 'p1' && !project.isRegeneratingPending));
             const isTaskClickable = isUploadCompleted && isConfigCompleted;
             return (
               <div 
                 key={project.id} 
                 className="bg-white rounded-xl border-2 border-slate-200 hover:border-blue-600 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                 id={`project_card_${project.id}`}
               >
                 {/* Header metadata */}
                 <div className="p-6">
                   <div className="flex items-start justify-between">
                     <div className="flex items-center space-x-1.5">
                       <div className="flex items-center space-x-1.5 text-[10px] text-blue-600 font-black uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                         <FolderKanban className="w-3.5 h-3.5" />
                         <span># {project.id}</span>
                       </div>
                       {project.expectedK !== undefined && isSchemeCompleted && (
                         <div className="flex items-center space-x-1 text-[10px] text-purple-600 font-black bg-purple-50 px-2.5 py-1 rounded border border-purple-100" title="鏈€浣?K-Anonymity 瀹夊叏闃堝€?>
                           <span>鏈€浣巏鍊? {project.expectedK}</span>
                         </div>
                       )}
                       {project.actualK !== undefined && (
                         <div className="flex items-center space-x-1 text-[10px] text-emerald-600 font-black bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100" title="瀹為檯 K-Anonymity 瀹夊叏鍊?>
                           <span>瀹為檯K鍊? {project.actualK}</span>
                         </div>
                       )}
                     </div>
                     
                      {/* Small Action edit/delete icons on top */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openEditModal(project)}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-950 transition-colors"
                          title="缂栬緫"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setIsDeleteAlertOpen(true)}
                          className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors"
                          title="鍒犻櫎椤圭洰"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                   </div>
 
                   <h3 className="font-black text-slate-900 mt-4 text-lg leading-snug group-hover:text-blue-600 transition-colors tracking-tight">
                     {project.name}
                   </h3>
                   
                   <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                     {project.description || "鏆傛棤鍏蜂綋鎻忚堪璇存槑銆?}
                   </p>
 
 
 
                   {/* Sub audit indicators */}
                   <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-bold">
                     <div className="flex items-center space-x-2">
                       <User className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                       <span className="truncate text-slate-600" title={project.creator}>{project.creator}</span>
                     </div>
                     <div className="flex items-center space-x-2 justify-end">
                       <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                       <span className="text-slate-600">{project.createdAt}</span>
                     </div>
                   </div>
                 </div>
 
                 {/* Action operations shelf - Single row with 4 buttons and NO icons */}
                 <div className="bg-slate-50 border-t border-slate-200 px-3 py-3.5 grid grid-cols-4 gap-1.5" id={`action_shelf_${project.id}`}>
                   {/* 1. 鏂规鐢熸垚 */}
                   <button
                     onClick={() => onSelectAction(project, isSchemeCompleted ? 'scheme-doc' : 'scheme')}
                     className={`py-2 px-1 rounded text-[10px] md:text-[11px] font-black uppercase tracking-wider shadow-xs transition-all cursor-pointer border text-center flex items-center justify-center gap-1 ${
                       isSchemeCompleted 
                         ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                         : "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                     }`}
                     id={`action_scheme_${project.id}`}
                   >
                     {isSchemeCompleted && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 stroke-[3px]" />}
                     <span>鏂规鐢熸垚</span>
                   </button>
 
                   {/* 2. 鏁版嵁涓婁紶 */}
                   <button
                     disabled={!isSchemeCompleted}
                     onClick={() => onSelectAction(project, 'processing', 1)}
                     className={`py-2 px-1 rounded text-[10px] md:text-[11px] font-black uppercase tracking-wider shadow-xs transition-all border text-center flex items-center justify-center gap-1 ${
                       !isSchemeCompleted
                         ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                         : "bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200 cursor-pointer"
                     }`}
                     id={`action_upload_${project.id}`}
                   >
                     {isUploadCompleted && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 stroke-[3px]" />}
                     <span>鏁版嵁涓婁紶</span>
                   </button>
 
                   {/* 3. 鍖垮悕鍖栫瓥鐣?*/}
                   <button
                     disabled={!isSchemeCompleted}
                     onClick={() => onSelectAction(project, 'processing', 2)}
                     className={`py-2 px-1 rounded text-[10px] md:text-[11px] font-black uppercase tracking-wider shadow-xs transition-all border text-center flex items-center justify-center gap-1 ${
                       !isSchemeCompleted
                         ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                         : "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200 cursor-pointer"
                     }`}
                     id={`action_config_${project.id}`}
                   >
                     {isConfigCompleted && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 stroke-[3px]" />}
                     <span>鍖垮悕鍖栫瓥鐣?/span>
                   </button>
 
                   {/* 4. 鍖垮悕鍖栦换鍔?*/}
                   <button
                     disabled={!isTaskClickable}
                     onClick={() => onSelectAction(project, 'evaluation')}
                     className={`py-2 px-1 rounded text-[10px] md:text-[11px] font-black uppercase tracking-wider shadow-xs transition-all border text-center flex items-center justify-center gap-1 ${
                       !isTaskClickable
                         ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                         : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 cursor-pointer"
                     }`}
                     id={`action_evaluate_${project.id}`}
                   >
                     {isTaskClickable && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3px]" />}
                     <span>鍖垮悕鍖栦换鍔?/span>
                   </button>
                 </div>
               </div>
             );
           })}
        </div>
      ) : (
        /* Empty project library state */
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center max-w-xl mx-auto shadow-xs" id="projects_empty_container">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-800 text-base">鍘绘爣璇嗛」鐩簱涓虹┖</h3>
          <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
            褰撳墠鏆傛湭寤虹珛鍚堣椤圭洰銆傝鐐瑰嚮鍙充笂鏂光€滄柊澧為」鐩€濊緭鍏ュ師濮嬭棰樿祫浜у拰椤圭洰璇存槑銆?          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-5 inline-flex items-center space-x-1.5 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>鏂板棣栦釜鍚堣椤圭洰</span>
          </button>
        </div>
      )}

      {/* MODAL 1: ADD PROJECT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add_project_modal">
          <div className="bg-white rounded-xl border-2 border-slate-950 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b-2 border-slate-950">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4.5 h-4.5 text-blue-400" />
                <h3 className="font-black text-sm uppercase tracking-wider">鏂板</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddProject} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">椤圭洰鍚嶇О <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="璇疯緭鍏?
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
                  id="project_name_input"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">椤圭洰璇存槑</label>
                <textarea
                  placeholder="璇疯緭鍏?
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="w-full h-32 p-3 bg-slate-50 border-2 border-slate-200 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none text-slate-800"
                  id="project_desc_input"
                />
              </div>

              {/* Modal buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded border-2 border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 uppercase tracking-wider transition-all"
                >
                  鍙栨秷
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all"
                  id="add_project_submit"
                >
                  纭畾鏂板
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PROJECT */}
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="edit_project_modal">
          <div className="bg-white rounded-xl border-2 border-slate-950 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b-2 border-slate-950">
              <div className="flex items-center space-x-2">
                <Settings2 className="w-4.5 h-4.5 text-blue-400" />
                <h3 className="font-black text-sm uppercase tracking-wider">缂栬緫</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleEditProject} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">椤圭洰鍚嶇О</label>
                <input
                  type="text"
                  disabled
                  value={nameInput}
                  className="w-full p-3 bg-slate-100 border-2 border-slate-200 rounded text-xs font-bold cursor-not-allowed text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">椤圭洰璇存槑</label>
                <textarea
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="w-full h-32 p-3 bg-slate-50 border-2 border-slate-200 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none text-slate-800"
                />
              </div>

              {/* Modal buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded border-2 border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 uppercase tracking-wider transition-all"
                >
                  鍙栨秷
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all"
                >
                  淇濆瓨淇敼
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE EXPLANATION NOTICE */}
      {isDeleteAlertOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="delete_project_alert_modal">
          <div className="bg-white rounded-xl border-2 border-slate-950 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b-2 border-slate-950">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4.5 h-4.5 text-amber-400" />
                <h3 className="font-black text-sm uppercase tracking-wider">绯荤粺鎻愮ず</h3>
              </div>
              <button 
                onClick={() => setIsDeleteAlertOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-500 shrink-0 border border-amber-200">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-relaxed">
                    鐢变簬鍘熷瀷鐨勬暟鎹棶棰橈紝姝ゆ寜閽笉鍋氫氦浜掍粎鍋氳鏄庯紝鍏蜂綋璇存槑璇﹁PRD瀵瑰簲鍐呭
                  </p>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeleteAlertOpen(false)}
                  className="px-6 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  鎴戠煡閬撲簡
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
