import React, { useState, useRef } from "react";
import { Project, ComplianceItem } from "../types";
import { apiFetch } from "../lib/apiFetch";
import { 
  ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle, Sparkles, Download, 
  ChevronRight, RefreshCw, Layers, ShieldCheck, Database, FileSpreadsheet, Image,
  Plus, Trash2
} from "lucide-react";

interface AnonymizationSchemeProps {
  project: Project;
  onBack: () => void;
  onSchemeGenerated?: () => void;
}

// Searchable single select component for Long Text Field in Table
const SearchableSingleSelect = ({
  value,
  onChange,
  options,
  placeholder = "璇烽€夋嫨瀛楁"
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const sortedOptions = [...options].sort((a, b) => a.localeCompare(b, "en"));
  const filteredOptions = sortedOptions.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 text-left flex items-center justify-between shadow-3xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <span className="truncate">{value || placeholder}</span>
        <span className="text-slate-400 ml-1 text-[9px]">鈻?/span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 left-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-40 max-h-48 overflow-y-auto p-2 space-y-2">
            <div className="flex items-center border border-slate-200 rounded px-2 py-1 bg-slate-50">
              <input
                type="text"
                placeholder="鎼滅储瀛楁..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none text-xs focus:outline-none focus:ring-0 p-1"
                onClick={(e) => e.stopPropagation()}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                >
                  鉁?                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {filteredOptions.length === 0 ? (
                <p className="text-center text-slate-400 text-[10px] py-1">鏈壘鍒板尮閰嶇殑瀛楁</p>
              ) : (
                filteredOptions.map(opt => (
                  <div
                    key={opt}
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer transition-colors text-xs font-mono text-slate-800 ${
                      value === opt ? "bg-blue-50 text-blue-800 font-semibold" : ""
                    }`}
                  >
                    {opt}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Dropdown multiselect for Split Fields in Table with fuzzy search support
const SplitFieldsMultiSelect = ({
  selected,
  onChange,
  options
}: {
  selected: string[];
  onChange: (val: string[]) => void;
  options: string[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 text-left flex items-center justify-between shadow-3xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <span className="truncate">
          {selected.length === 0 
            ? "璇烽€夋嫨鏁版嵁鏍囩" 
            : selected.length === 1 
              ? selected[0] 
              : `+${selected.length}`}
        </span>
        <span className="text-slate-400 ml-1 text-[9px]">鈻?/span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => { setIsOpen(false); setSearchQuery(""); }} />
          <div className="absolute right-0 left-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-40 p-2 space-y-2 flex flex-col max-h-60">
            {/* Search Input */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                placeholder="鎼滅储鏁版嵁鏍囩..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 font-bold text-xs"
                >
                  鉁?                </button>
              )}
            </div>
            
            {/* Options List */}
            <div className="overflow-y-auto space-y-1 max-h-40">
              {filteredOptions.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-2 font-medium">鏃犲尮閰嶉」</p>
              ) : (
                filteredOptions.map(opt => {
                  const isChecked = selected.includes(opt);
                  return (
                    <label
                      key={opt}
                      className="flex items-center space-x-2 p-1 hover:bg-slate-50 rounded cursor-pointer text-xs text-slate-700 select-none w-full"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            onChange(selected.filter(s => s !== opt));
                          } else {
                            onChange([...selected, opt]);
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function AnonymizationScheme({ project, onBack, onSchemeGenerated }: AnonymizationSchemeProps) {
  // Form States split into 3 parts
  const [csvEnabled, setCsvEnabled] = useState<boolean>(() => {
    return project.schemeInputs?.csvEnabled ?? true;
  });
  const [dicomEnabled, setDicomEnabled] = useState<boolean>(() => {
    return project.schemeInputs?.dicomEnabled ?? false;
  });
  const [imageEnabled, setImageEnabled] = useState<boolean>(() => {
    return project.schemeInputs?.imageEnabled ?? false;
  });

  const [csvCategories, setCsvCategories] = useState<Array<{
    id: string;
    name: string;
    files: Array<{ name: string, size: string }>;
    headers: string[];
    longTextFields: string[];
    longTextSplits: Record<string, string[]>;
    configs: Array<{ id: string; textField: string; splitFields: string[] }>;
  }>>(() => {
    const raw = project.schemeInputs?.csvCategories || [];
    return raw.map((cat: any) => {
      if (cat.configs) return cat;
      const fields = cat.longTextFields || [];
      const configs = fields.map((field: string) => ({
        id: "config_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        textField: field,
        splitFields: cat.longTextSplits?.[field] || []
      }));
      if (configs.length === 0) {
        configs.push({
          id: "config_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now(),
          textField: "",
          splitFields: []
        });
      }
      return {
        id: cat.id,
        name: cat.name,
        files: cat.files || [],
        headers: cat.headers || [],
        configs,
        longTextFields: cat.longTextFields || [],
        longTextSplits: cat.longTextSplits || {}
      };
    });
  });

  const [dicomCategories, setDicomCategories] = useState<Array<{
    id: string;
    name: string;
    files: Array<{ name: string, size: string }>;
  }>>(() => {
    return project.schemeInputs?.dicomCategories || [];
  });

  const [imageCategories, setImageCategories] = useState<Array<{
    id: string;
    name: string;
    files: Array<{ name: string, size: string }>;
  }>>(() => {
    return project.schemeInputs?.imageCategories || [];
  });

  // Hidden file input refs for batch uploading
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const dicomFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const [usageScenario, setUsageScenario] = useState(() => {
    return project.schemeInputs?.usageScenario || "";
  });
  const [dataScale, setDataScale] = useState(() => {
    return project.schemeInputs?.dataScale || "";
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [generatedScheme, setGeneratedScheme] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [csvSearchQueries, setCsvSearchQueries] = useState<Record<string, string>>({});
  const [csvDropdownOpen, setCsvDropdownOpen] = useState<Record<string, boolean>>({});

  // File headers simulation based on selection
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>(() => {
    return ['PatientID', 'PatientName', 'Gender', 'Age', 'AdmissionDate', 'MainDiagnosis', 'PhoneNumber', 'ZipCode'];
  });

  const [evaluationMethod, setEvaluationMethod] = useState<string>(() => {
    return project.schemeInputs?.evaluationMethod || "K鍖垮悕";
  });
  const [scenarioType, setScenarioType] = useState<string>(() => {
    return project.schemeInputs?.scenarioType || "";
  });

  // hospital infrastructure checklists (婊¤冻/寰呭畬鍠?鏃犳硶婊¤冻)
  const [envItems, setEnvItems] = useState<ComplianceItem[]>(() => {
    const defaultItems = [
      { id: "env_1", name: "1锛夎韩浠借璇侊紙澶氬洜绱犻壌鍒級", desc: "", status: "", proofFile: null },
      { id: "env_2", name: "2锛夎闂帶鍒讹紙鍔熻兘鏉冮檺+鏁版嵁鏉冮檺锛?, desc: "", status: "", proofFile: null },
      { id: "env_3", name: "3锛夊畨鍏ㄩ殧绂伙紙涓嶅悓鎺ユ敹鏂归€昏緫/鐗╃悊闅旂锛?, desc: "", status: "", proofFile: null },
      { id: "env_4", name: "4锛夊姞瀵嗕繚鎶わ紙鏁忔劅鏁版嵁鍔犲瘑瀛樺偍锛?, desc: "", status: "", proofFile: null },
      { id: "env_5", name: "5锛夊畨鍏ㄤ紶杈擄紙浼犺緭鍔犲瘑锛?, desc: "", status: "", proofFile: null },
      { id: "env_6", name: "6锛夋暟鎹攢姣侊紙浠诲姟瀹屾垚鍚庡垹闄ゅ師濮嬫暟鎹拰涓棿缁撴灉锛?, desc: "", status: "", proofFile: null },
      { id: "env_7", name: "7锛夋暟鎹槻娉勬紡", desc: "", status: "", proofFile: null },
      { id: "env_8", name: "8锛夐檮鍔犱俊鎭繚鎶わ紙鍋囧悕鍖栭檮鍔犱俊鎭殧绂诲姞瀵嗭級", desc: "", status: "", proofFile: null },
      { id: "env_9", name: "9锛夋帴鍙ｅ畨鍏?, desc: "", status: "", proofFile: null },
      { id: "env_10", name: "10锛夊畨鍏ㄥ璁?, desc: "", status: "", proofFile: null },
      { id: "env_11", name: "11锛夊鍣ㄥ寲/铏氭嫙鍖栭殧绂汇€佺幆澧冪鎺э紙闃绘柇鏀诲嚮/闃叉闈為鏈熻緭鍏ヨ緭鍑猴級銆佸畬鏁存搷浣滄棩蹇?, desc: "", status: "", proofFile: null }
    ];
    const saved = project.schemeInputs?.envItems || [];
    return defaultItems.map(item => {
      const matched = saved.find((s: any) => s.id === item.id || s.name === item.name);
      return {
        ...item,
        status: matched ? (matched.status === '绗﹀悎' ? '婊¤冻' : matched.status === '涓嶇鍚? ? '寰呭畬鍠? : matched.status) : ""
      };
    });
  });

  // Management measures checklists (婊¤冻/寰呭畬鍠?鏃犳硶婊¤冻)
  const [mgmtItems, setMgmtItems] = useState<ComplianceItem[]>(() => {
    const defaultItems = [
      // 锛?锛夋暟鎹寔鏈夋柟
      { id: "mgmt_holder_1", category: "鏁版嵁鎸佹湁鏂?, name: "1锛夋暟鎹祦閫氱鐞嗗埗搴?, desc: "", status: "", proofFile: null },
      { id: "mgmt_holder_2", category: "鏁版嵁鎸佹湁鏂?, name: "2锛夊鏍搁渶姹傛柟浣跨敤鍦烘櫙銆佺洰鐨勫拰澶勭悊娴佺▼", desc: "", status: "", proofFile: null },
      { id: "mgmt_holder_3", category: "鏁版嵁鎸佹湁鏂?, name: "3锛夊悎鍚岀害鏉燂紙鐩殑鑼冨洿/鏁版嵁淇濇姢涔夊姟/绂佹閲嶈瘑鍒?娉勯湶閫氱煡绛夛級", desc: "", status: "", proofFile: null },
      { id: "mgmt_holder_4", category: "鏁版嵁鎸佹湁鏂?, name: "4锛夋槑纭汉鍛樿亴璐ｅ苟瀹氭湡鍩硅", desc: "", status: "", proofFile: null },
      { id: "mgmt_holder_5", category: "鏁版嵁鎸佹湁鏂?, name: "5锛夌暀瀛樺尶鍚嶅寲绛栫暐銆佽鍒欏埗瀹?瀹℃牳/鏇存柊璁板綍", desc: "", status: "", proofFile: null },
      { id: "mgmt_holder_6", category: "鏁版嵁鎸佹湁鏂?, name: "6锛夊埗瀹氬簲鎬ラ妗堝苟瀹氭湡婕旂粌", desc: "", status: "", proofFile: null },
      { id: "mgmt_holder_7", category: "鏁版嵁鎸佹湁鏂?, name: "7锛夋寔缁洃鎺ч闄╋紝瀹氭湡鏇存柊绛栫暐", desc: "", status: "", proofFile: null },
      { id: "mgmt_holder_8", category: "鏁版嵁鎸佹湁鏂?, name: "8锛夊鏍搁渶姹傛柟浣跨敤鍦烘櫙銆佺洰鐨勫拰澶勭悊娴佺▼", desc: "", status: "", proofFile: null },

      // 锛?锛夋暟鎹娇鐢ㄦ柟
      { id: "mgmt_user_1", category: "鏁版嵁浣跨敤鏂?, name: "1锛夋寜鏈€灏戝鐢ㄥ師鍒欑敵璇锋暟鎹?, desc: "", status: "", proofFile: null },
      { id: "mgmt_user_2", category: "鏁版嵁浣跨敤鏂?, name: "2锛夊悎鍚岀害鏉?, desc: "", status: "", proofFile: null },
      { id: "mgmt_user_3", category: "鏁版嵁浣跨敤鏂?, name: "3锛夌姝㈤噸璇嗗埆琛屼负", desc: "", status: "", proofFile: null },
      { id: "mgmt_user_4", category: "鏁版嵁浣跨敤鏂?, name: "4锛夊鎺ヨЕ浜哄憳鍩硅骞剁缃蹭繚瀵嗗崗璁?, desc: "", status: "", proofFile: null },
      { id: "mgmt_user_5", category: "鏁版嵁浣跨敤鏂?, name: "5锛夋潈闄愮鑱岀宀楀洖鏀舵満鍒?, desc: "", status: "", proofFile: null },
      { id: "mgmt_user_6", category: "鏁版嵁浣跨敤鏂?, name: "6锛夋暟鎹娇鐢ㄧ洃鎺?, desc: "", status: "", proofFile: null },
      { id: "mgmt_user_7", category: "鏁版嵁浣跨敤鏂?, name: "7锛夋暟鎹攢姣?, desc: "", status: "", proofFile: null },

      // 锛?锛夋暟鎹繍钀ユ柟
      { id: "mgmt_operator_1", category: "鏁版嵁杩愯惀鏂?, name: "1锛夋彁渚涘苟鍏憡瀹夊叏鎶€鏈兘鍔?, desc: "", status: "", proofFile: null },
      { id: "mgmt_operator_2", category: "鏁版嵁杩愯惀鏂?, name: "2锛夊畾鏈熷畨鍏ㄨ瘎浼?, desc: "", status: "", proofFile: null },
      { id: "mgmt_operator_3", category: "鏁版嵁杩愯惀鏂?, name: "3锛変弗鏍艰闂帶鍒?, desc: "", status: "", proofFile: null },
      { id: "mgmt_operator_4", category: "鏁版嵁杩愯惀鏂?, name: "4锛夊鐩稿叧鏂规搷浣滅暀瀛樻棩蹇楀苟瀹氭湡瀹¤", desc: "", status: "", proofFile: null },
      { id: "mgmt_operator_5", category: "鏁版嵁杩愯惀鏂?, name: "5锛夊簲鎬ラ妗堟紨缁?, desc: "", status: "", proofFile: null }
    ];
    const saved = project.schemeInputs?.mgmtItems || [];
    return defaultItems.map(item => {
      const matched = saved.find((s: any) => s.id === item.id || s.name === item.name);
      return {
        ...item,
        status: matched ? (matched.status === '绗﹀悎' ? '婊¤冻' : matched.status === '涓嶇鍚? ? '寰呭畬鍠? : matched.status) : ""
      };
    });
  });

  // Table helper functions to manage configs for each CSV file category
  const addConfigRow = (catId: string) => {
    setCsvCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      const currentConfigs = cat.configs || [];
      const newConfig = {
        id: "config_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now(),
        textField: "",
        splitFields: []
      };
      const updatedConfigs = [...currentConfigs, newConfig];
      
      const validConfigs = updatedConfigs.filter(c => c.textField.trim() !== "");
      const longTextFields = validConfigs.map(c => c.textField);
      const longTextSplits: Record<string, string[]> = {};
      validConfigs.forEach(c => {
        longTextSplits[c.textField] = c.splitFields;
      });

      return {
        ...cat,
        configs: updatedConfigs,
        longTextFields,
        longTextSplits
      };
    }));
  };

  const removeConfigRow = (catId: string, configId: string) => {
    setCsvCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      const currentConfigs = cat.configs || [];
      if (currentConfigs.length <= 1) return cat;
      const updatedConfigs = currentConfigs.filter(c => c.id !== configId);

      const validConfigs = updatedConfigs.filter(c => c.textField.trim() !== "");
      const longTextFields = validConfigs.map(c => c.textField);
      const longTextSplits: Record<string, string[]> = {};
      validConfigs.forEach(c => {
        longTextSplits[c.textField] = c.splitFields;
      });

      return {
        ...cat,
        configs: updatedConfigs,
        longTextFields,
        longTextSplits
      };
    }));
  };

  const updateConfigRow = (catId: string, configId: string, updates: Partial<{ textField: string; splitFields: string[] }>) => {
    setCsvCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      const currentConfigs = cat.configs || [];
      const updatedConfigs = currentConfigs.map(c => c.id === configId ? { ...c, ...updates } : c);

      const validConfigs = updatedConfigs.filter(c => c.textField.trim() !== "");
      const longTextFields = validConfigs.map(c => c.textField);
      const longTextSplits: Record<string, string[]> = {};
      validConfigs.forEach(c => {
        longTextSplits[c.textField] = c.splitFields;
      });

      return {
        ...cat,
        configs: updatedConfigs,
        longTextFields,
        longTextSplits
      };
    }));
  };

  // Batch upload handlers for CSV, DICOM, Images
  const handleCsvBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files) as File[];
      
      filesArray.forEach((file: File) => {
        const subName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const newFile = {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB"
        };
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          let headers: string[] = ['PatientID', 'PatientName', 'Gender', 'Age', 'MainDiagnosis', 'ChiefComplaint', 'PresentIllness', 'DoctorNotes'];
          if (text) {
            const firstLine = text.split(/\r?\n/)[0];
            const parsed = firstLine.split(',')
              .map(h => h.replace(/^["']|["']$/g, '').trim())
              .filter(h => h.length > 0);
            if (parsed.length > 0) {
              headers = parsed;
            }
          }
          
          setCsvCategories(prev => {
            const id = "csv_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
            return [...prev, {
              id,
              name: subName,
              files: [newFile],
              headers: headers,
              configs: [{
                id: "config_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now(),
                textField: "",
                splitFields: []
              }],
              longTextFields: [],
              longTextSplits: {}
            }];
          });
        };
        reader.readAsText(file);
      });
      
      if (csvFileInputRef.current) csvFileInputRef.current.value = "";
    }
  };

  const handleDicomBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files) as File[];
      
      const newCats = filesArray.map((file: File) => {
        const subName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const newFile = {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB"
        };
        return {
          id: "dicom_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now(),
          name: subName,
          files: [newFile]
        };
      });
      
      setDicomCategories(prev => [...prev, ...newCats]);
      if (dicomFileInputRef.current) dicomFileInputRef.current.value = "";
    }
  };

  const handleImageBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files) as File[];
      
      const newCats = filesArray.map((file: File) => {
        const subName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const newFile = {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB"
        };
        return {
          id: "image_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now(),
          name: subName,
          files: [newFile]
        };
      });
      
      setImageCategories(prev => [...prev, ...newCats]);
      if (imageFileInputRef.current) imageFileInputRef.current.value = "";
    }
  };

  const splitOptions = [
    "鎮ｈ€呭鍚?,
    "鍖荤敓濮撳悕",
    "鍖婚櫌鍚嶇О",
    "绉戝鍚嶇О",
    "鎬у埆",
    "骞撮緞",
    "韬珮",
    "浣撻噸"
  ];

  // Pre-fill quick scenario template
  const applyScenarioTemplate = (text: string) => {
    setUsageScenario(text);
  };

  // Change compliance status (婊¤冻, 寰呭畬鍠? 鏃犳硶婊¤冻)
  const handleStatusChange = (id: string, type: "env" | "mgmt", status: string) => {
    if (type === "env") {
      setEnvItems(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, status };
        }
        return item;
      }));
    } else {
      setMgmtItems(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, status };
        }
        return item;
      }));
    }
  };

  // Validation before generating scheme
  const handleGenerateScheme = async () => {
    // 1. Validation
    const anyEnabled = csvEnabled || dicomEnabled || imageEnabled;
    if (!anyEnabled) {
      alert("鏍蜂緥鏁版嵁妯″潡锛欳SV鏂囨湰鏁版嵁銆丏ICOM褰卞儚鏁版嵁銆佸浘鐗囨暟鎹?鑷冲皯鏈変竴椤瑰繀椤婚€夋嫨銆愭湁銆戯紒");
      return;
    }

    if (csvEnabled) {
      if (csvCategories.length === 0) {
        alert("鎮ㄥ紑鍚簡CSV鏂囨湰鏁版嵁锛岃涓婁紶鑷冲皯涓€涓?.csv 鏍蜂緥鏂囦欢锛?);
        return;
      }
      const emptyCsvCat = csvCategories.find(c => !c.name || !c.name.trim());
      if (emptyCsvCat) {
        alert("CSV鏂囨湰鏁版嵁涓瓨鍦ㄧ┖瀛愬垎绫诲悕绉帮紝璇疯緭鍏ュ畬鏁达紒");
        return;
      }
    }

    if (dicomEnabled) {
      if (dicomCategories.length === 0) {
        alert("鎮ㄥ紑鍚簡DICOM褰卞儚鏁版嵁锛岃涓婁紶鑷冲皯涓€涓?.dcm 鏍蜂緥鏂囦欢锛?);
        return;
      }
      const emptyDicomCat = dicomCategories.find(c => !c.name || !c.name.trim());
      if (emptyDicomCat) {
        alert("DICOM褰卞儚鏁版嵁涓瓨鍦ㄧ┖瀛愬垎绫诲悕绉帮紝璇疯緭鍏ュ畬鏁达紒");
        return;
      }
    }

    if (imageEnabled) {
      if (imageCategories.length === 0) {
        alert("鎮ㄥ紑鍚簡鍥剧墖鏁版嵁锛岃涓婁紶鑷冲皯涓€涓尰瀛﹀浘鐗囨枃浠讹紒");
        return;
      }
      const emptyImageCat = imageCategories.find(c => !c.name || !c.name.trim());
      if (emptyImageCat) {
        alert("鍥剧墖鏁版嵁涓瓨鍦ㄧ┖瀛愬垎绫诲悕绉帮紝璇疯緭鍏ュ畬鏁达紒");
        return;
      }
    }

    if (!dataScale.trim()) {
      alert("璇疯緭鍏ユ暟鎹妯★紒");
      return;
    }

    if (!usageScenario.trim()) {
      alert("璇疯緭鍏ユ暟鎹殑浣跨敤鍦烘櫙璇存槑锛?);
      return;
    }

    if (!scenarioType) {
      alert("璇烽€夋嫨鍦烘櫙绯绘暟锛?);
      return;
    }

    // Check environment items: Required selection
    const unfilledEnv = envItems.find(item => item.status === "");
    if (unfilledEnv) {
      alert(`璇峰鐜绯绘暟璇勪及椤?[${unfilledEnv.name}] 鍋氬嚭璇勪及閫夋嫨锛乣);
      return;
    }

    // Check management items: Required selection
    const unfilledMgmt = mgmtItems.find(item => item.status === "");
    if (unfilledMgmt) {
      alert(`璇峰瀹夊叏绠＄悊鎺柦椤?[${unfilledMgmt.name}] 鍋氬嚭璇勪及閫夋嫨锛乣);
      return;
    }

    const minKVal = scenarioType === "缁勭粐鍐呴儴鍚屼竴涓簨涓氱兢鐨勬暟鎹祦閫? ? 3 :
                     scenarioType === "缁勭粐鍐呴儴璺ㄤ簨涓氱兢鐨勬暟鎹祦閫? ? 4 :
                     scenarioType === "缁勭粐澶栭儴涓ゆ柟鐨勬暟鎹祦閫? ? 5 :
                     scenarioType === "缁勭粐澶栭儴澶氭柟鐨勬暟鎹祦閫? ? 6 : 20;

    const coeffVal = scenarioType === "缁勭粐鍐呴儴鍚屼竴涓簨涓氱兢鐨勬暟鎹祦閫? ? "1/3" :
                      scenarioType === "缁勭粐鍐呴儴璺ㄤ簨涓氱兢鐨勬暟鎹祦閫? ? "1/4" :
                      scenarioType === "缁勭粐澶栭儴涓ゆ柟鐨勬暟鎹祦閫? ? "1/5" :
                      scenarioType === "缁勭粐澶栭儴澶氭柟鐨勬暟鎹祦閫? ? "1/6" : "1/20";

    // Trigger API call and Generation Screen
    setIsGenerating(true);
    setGenerationError("");

    try {
      const apiPromise = apiFetch("/api/generate-scheme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectId: project.id,
          projectName: project.name,
          projectDesc: project.description,
          csvEnabled,
          dicomEnabled,
          imageEnabled,
          csvCategories,
          dicomCategories,
          imageCategories,
          usageScenario: usageScenario,
          dataScale: dataScale,
          envAssessment: envItems.map(e => ({ name: e.name, status: e.status, desc: e.desc, hasProof: false })),
          managementMeasures: mgmtItems.map(m => ({ name: m.name, status: m.status, desc: m.desc, hasProof: false })),
          evaluationMethod,
          scenarioType,
          scenarioCoefficient: coeffVal,
          minimumK: minKVal
        })
      });

      const delayPromise = new Promise(resolve => setTimeout(resolve, 3000));

      const [response] = await Promise.all([apiPromise, delayPromise]);

      const data = await response.json();
      if (response.ok) {
        // Save the inputs to the backend to support regeneration
        try {
          await apiFetch(`/api/projects/${project.id}/scheme-inputs`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              schemeInputs: {
                csvEnabled,
                dicomEnabled,
                imageEnabled,
                csvCategories,
                dicomCategories,
                imageCategories,
                usageScenario,
                dataScale,
                envItems,
                mgmtItems,
                evaluationMethod,
                scenarioType
              }
            })
          });
          project.schemeInputs = {
            csvEnabled,
            dicomEnabled,
            imageEnabled,
            csvCategories,
            dicomCategories,
            imageCategories,
            usageScenario,
            dataScale,
            envItems,
            mgmtItems,
            evaluationMethod,
            scenarioType
          };
          // Dynamically update the project's expectedK locally as well
          project.expectedK = minKVal;

          // Clear isRegeneratingPending status as it is now successfully generated
          await apiFetch(`/api/projects/${project.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isRegeneratingPending: false })
          });
          project.isRegeneratingPending = false;
        } catch (saveErr) {
          console.error("Failed to persist scheme inputs:", saveErr);
        }

        setGeneratedScheme(data.scheme);
        setIsOffline(data.isOffline || false);
        if (data.errorMsg) {
          setGenerationError(data.errorMsg);
        }
        
        // Save scheme to project immediately so that the status is synchronized
        project.schemeDocText = data.scheme;
        
        // Directly transition to the editable scheme document view
        if (onSchemeGenerated) {
          onSchemeGenerated();
        }
      } else {
        throw new Error(data.error || "鏈嶅姟绔湪瑁呴厤鏂规鏂囨。鏃跺彂鐢熸湭鐭ュ紓甯?);
      }
    } catch (err: any) {
      setGenerationError(err.message || "杩炴帴鏈嶅姟鍣ㄨ閰嶅紩鎿庡け璐ワ紝璇烽噸璇曘€?);
      alert(err.message || "瑁呴厤鏂规鏃堕亣鍒板紓甯革紝璇锋鏌ュ悗绔湇鍔°€?);
    } finally {
      setIsGenerating(false);
    }
  };

  // Real Microsoft Word download compatibility output
  const handleDownloadWord = () => {
    if (!generatedScheme) return;
    
    // HTML conversion to bundle inside .doc
    const formattedHtml = generatedScheme
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^\s*[\*\-]\s+(.*$)/gim, '<li>$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code style="background-color:#f1f5f9;padding:2px 4px;border-radius:4px;font-family:monospace;">$1</code>')
      .replace(/\n\n/g, '<p></p>')
      .replace(/^> (.*$)/gim, '<blockquote style="border-left:4px solid #2563eb;padding-left:15px;color:#4b5563;font-style:italic;">$1</blockquote>');

    const documentHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${project.name} 鏁版嵁鍘绘爣璇嗗寲鍖垮悕鏂规</title>
        <style>
          body { font-family: "Microsoft YaHei", SimSun, sans-serif; line-height: 1.6; padding: 40px; color: #1f2937; }
          h1 { font-family: "Microsoft YaHei", SimHei; color: #1e3a8a; text-align: center; margin-bottom: 30px; font-size: 24pt; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; }
          h2 { font-family: "Microsoft YaHei", SimHei; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-top: 35px; margin-bottom: 15px; font-size: 16pt; }
          h3 { font-family: "Microsoft YaHei", SimHei; color: #1d4ed8; margin-top: 20px; margin-bottom: 10px; font-size: 12pt; }
          p { margin-bottom: 12px; font-size: 11pt; text-align: justify; }
          li { font-size: 11pt; margin-bottom: 6px; }
          blockquote { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px; margin: 15px 0; border-radius: 4px; }
          .meta-box { border: 1px solid #cbd5e1; padding: 15px; background-color: #f8fafc; margin-bottom: 30px; border-radius: 6px; }
          .footer { text-align: center; margin-top: 60px; font-size: 9pt; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="meta-box">
          <p><strong>椤圭洰鍚嶇О锛?/strong> ${project.name}</p>
          <p><strong>瀵嗙骇绛夌骇锛?/strong> 闄㈠唴鏈哄瘑 (Confidential)</p>
          <p><strong>鐗堟湰浠ｇ爜锛?/strong> V1.0.0 (姝ｅ紡鏂规)</p>
          <p><strong>鐢熸垚鏃堕棿锛?/strong> 2026骞?鏈?/p>
        </div>
        ${formattedHtml}
        <div class="footer">
          姝ゆ柟妗堢敱 鍖荤枟鍋ュ悍鏁版嵁鏅鸿兘鍖垮悕鍖栧钩鍙?渚濈収鍥藉鍘绘爣璇嗗寲鎸囧崡瑙勮寖鍒嗘瀽鐢熸垚
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + documentHtml], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `鍖荤枟鏁版嵁鍖垮悕鍖栨柟妗坃${project.name.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8" id="anonymization_scheme_container">
      {/* Hidden inputs for batch uploads */}
      <input 
        type="file" 
        ref={csvFileInputRef} 
        onChange={handleCsvBatchUpload} 
        accept=".csv" 
        multiple
        className="hidden" 
      />
      <input 
        type="file" 
        ref={dicomFileInputRef} 
        onChange={handleDicomBatchUpload} 
        accept=".dcm" 
        multiple
        className="hidden" 
      />
      <input 
        type="file" 
        ref={imageFileInputRef} 
        onChange={handleImageBatchUpload} 
        accept=".jpg,.jpeg,.png,.bmp" 
        multiple
        className="hidden" 
      />

      {/* Header breadcrumbs */}
      <div className="flex items-center justify-between mb-8 border-b-2 border-slate-900 pb-5" id="scheme_header_navigation">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 border-2 border-slate-900 hover:bg-slate-100 rounded text-slate-950 transition-colors cursor-pointer"
            title="杩斿洖椤圭洰鍒楄〃"
            id="scheme_back_btn"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span>椤圭洰绠＄悊</span>
              <ChevronRight className="w-3 h-3" />
              <span className="truncate max-w-[200px]">{project.name}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-blue-600 font-bold">鏂规鐢熸垚</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">鍖垮悕鍖栨柟妗堢敓鎴?/h1>
          </div>
        </div>

        {/* Unified Top Right Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded border border-slate-300 transition-all active:scale-98 cursor-pointer flex items-center justify-center"
          >
            <span>鍙栨秷</span>
          </button>
          <button
            type="button"
            onClick={handleGenerateScheme}
            disabled={isGenerating}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded shadow-xs transition-all active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 text-blue-100 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-100" />
            )}
            <span>{isGenerating ? "鐢熸垚涓?.." : "淇濆瓨骞剁敓鎴?}</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 relative" id="scheme_input_view">
          
          {/* Field 1: Sample Data */}
          <div className="bg-white rounded-xl shadow-xs border-2 border-slate-200 p-6" id="section_sample_data">
            <div className="mb-5">
              <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-xs inline-block"></span>
                <span>1. 鏍蜂緥鏁版嵁 <span className="text-red-500">*</span></span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                鑷冲皯閫夋嫨涓€绫绘暟鎹笂浼狅紝鑻ュ瓨鍦ㄥ涓瓙鍒嗙被鐩存帴鎵归噺涓婁紶澶氫釜鏂囦欢锛屽皢鑷姩璇嗗埆鏂囦欢鍚嶄负瀛愬垎绫诲悕绉?              </p>
            </div>

            <div className="space-y-6">
              {/* (1) CSV Text Data */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">锛?锛塁SV鏂囨湰鏁版嵁</h3>
                    <p className="text-xs text-slate-500 mt-0.5">浠呮敮鎸?csv 鏍煎紡锛屼粎鏀寔鍗晄heet锛岃嫢瀛樺湪澶氫釜瀛愬垎绫荤洿鎺ユ壒閲忎笂浼犲涓枃浠讹紝灏嗚嚜鍔ㄨ瘑鍒枃浠跺悕涓哄瓙鍒嗙被鍚嶇О</p>
                  </div>
                  <div className="flex bg-slate-100 p-0.5 rounded border border-slate-300 text-xs font-bold gap-0.5">
                    <button
                      type="button"
                      onClick={() => setCsvEnabled(true)}
                      className={`px-3 py-1 rounded transition-all cursor-pointer ${csvEnabled ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      鏈?                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCsvEnabled(false);
                      }}
                      className={`px-3 py-1 rounded transition-all cursor-pointer ${!csvEnabled ? 'bg-slate-300 text-slate-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      鏃?                    </button>
                  </div>
                </div>

                {csvEnabled && (
                  <div className="space-y-4">
                    {/* Batch Upload Area */}
                    <div 
                      onClick={() => csvFileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-xl p-6 bg-white hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    >
                      <Upload className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black text-slate-700">鐐瑰嚮鎵归噺閫夋嫨鎴栨嫋鎷藉涓?CSV 鏍煎紡鏍蜂緥鏁版嵁鏂囦欢</span>
                    </div>

                    {/* Category List in Table Form */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-3xs">
                      {csvCategories.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6 bg-white font-medium">鏆傛棤CSV鏁版嵁鍒嗙被锛岃鍦ㄤ笂鏂逛笂浼犳枃浠?/p>
                      ) : (
                        <table className="min-w-full table-fixed bg-white divide-y divide-slate-200 text-xs text-left">
                          <thead className="bg-slate-50 font-black text-slate-700 text-[11px] uppercase tracking-wider">
                            <tr>
                              <th className="px-3 py-3 text-center border-b border-r border-slate-200 w-16">搴忓彿</th>
                              <th className="px-3 py-3 border-b border-r border-slate-200 w-64">瀛愬垎绫诲悕绉?span className="text-red-500 font-bold ml-0.5">*</span></th>
                              <th className="px-3 py-3 border-b border-r border-slate-200 w-60">鏂囦欢鍚?/th>
                              <th className="px-3 py-3 border-b border-r border-slate-200 w-72">闀挎枃鏈瓧娈?/th>
                              <th className="px-3 py-3 border-b border-r border-slate-200 w-80">鏁版嵁鏍囩</th>
                              <th className="px-3 py-3 text-center border-b border-slate-200 w-24">鎿嶄綔</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150">
                            {csvCategories.map((cat, catIdx) => {
                              const configs = cat.configs || [{ id: "temp", textField: "", splitFields: [] }];
                              const rowSpan = configs.length;
                              const hasFile = cat.files && cat.files.length > 0;
                              const fileName = hasFile ? cat.files[0].name : "鏈笂浼犳枃浠?;

                              return configs.map((config, configIdx) => {
                                const isFirstRow = configIdx === 0;
                                return (
                                  <tr key={`${cat.id}-${config.id}`} className="hover:bg-slate-50/40 transition-colors">
                                    {isFirstRow && (
                                      <td className="px-3 py-3.5 text-center align-middle border-r border-slate-200 bg-slate-50/20 font-semibold font-mono" rowSpan={rowSpan}>
                                        {catIdx + 1}
                                      </td>
                                    )}
                                    {isFirstRow && (
                                      <td className="px-3 py-3.5 align-middle border-r border-slate-200 bg-white" rowSpan={rowSpan}>
                                        <div className="flex flex-col space-y-1">
                                          <div className="flex items-center space-x-1">
                                            <input
                                              type="text"
                                              required
                                              value={cat.name}
                                              onChange={(e) => {
                                                const newName = e.target.value;
                                                setCsvCategories(prev => prev.map(c => c.id === cat.id ? { ...c, name: newName } : c));
                                              }}
                                              className={`p-1.5 border rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full ${
                                                !cat.name.trim() ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-slate-250 focus:border-blue-500 bg-slate-50/30"
                                              }`}
                                              placeholder="淇敼瀛愬垎绫诲悕绉?
                                            />
                                          </div>
                                          {!cat.name.trim() && (
                                            <span className="text-[10px] text-red-500 font-semibold flex items-center gap-0.5">
                                              <AlertCircle className="w-3 h-3" />
                                              蹇呭～椤?                                            </span>
                                          )}
                                        </div>
                                      </td>
                                    )}
                                    {isFirstRow && (
                                      <td className="px-3 py-3.5 align-middle border-r border-slate-200 bg-white" rowSpan={rowSpan}>
                                        <div className="font-mono text-slate-600 break-all text-xs font-semibold leading-relaxed">
                                          {fileName}
                                        </div>
                                      </td>
                                    )}
                                    
                                    {/* Column 4: Long Text Field Dropdown with "+" and remove actions */}
                                    <td className="px-3 py-3.5 align-middle border-r border-slate-200 bg-white">
                                      <div className="flex items-center space-x-1.5">
                                        <div className="flex-1">
                                          <SearchableSingleSelect
                                            value={config.textField}
                                            options={cat.headers}
                                            onChange={(val) => updateConfigRow(cat.id, config.id, { textField: val })}
                                            placeholder="璇烽€夋嫨闀挎枃鏈瓧娈?
                                          />
                                        </div>
                                        
                                        <button
                                          type="button"
                                          onClick={() => addConfigRow(cat.id)}
                                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded transition-colors cursor-pointer shrink-0 flex items-center justify-center w-6 h-6 font-bold text-sm"
                                          title="澧炲姞琛?
                                        >
                                          +
                                        </button>

                                        {rowSpan > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => removeConfigRow(cat.id, config.id)}
                                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded transition-colors cursor-pointer shrink-0 flex items-center justify-center w-6 h-6"
                                            title="鍒犻櫎姝よ闀挎枃鏈?
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </td>

                                    {/* Column 5: Split Fields Dropdown (Multi-select) */}
                                    <td className="px-3 py-3.5 align-middle border-r border-slate-200 bg-white">
                                      <SplitFieldsMultiSelect
                                        selected={config.splitFields}
                                        options={splitOptions}
                                        onChange={(val) => updateConfigRow(cat.id, config.id, { splitFields: val })}
                                      />
                                    </td>

                                    {isFirstRow && (
                                      <td className="px-3 py-3.5 text-center align-middle border-slate-200 bg-white" rowSpan={rowSpan}>
                                        <button
                                          type="button"
                                          onClick={() => setCsvCategories(prev => prev.filter(c => c.id !== cat.id))}
                                          className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[11px] font-bold border border-red-100 transition-colors cursor-pointer"
                                        >
                                          鍒犻櫎
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                );
                              });
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* (2) DICOM Image Data */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">锛?锛塂ICOM褰卞儚鏁版嵁</h3>
                    <p className="text-xs text-slate-500 mt-0.5">浠呮敮鎸丏ICOM鏍煎紡锛岃嫢瀛樺湪澶氫釜瀛愬垎绫荤洿鎺ユ壒閲忎笂浼犲涓枃浠讹紝灏嗚嚜鍔ㄨ瘑鍒枃浠跺悕涓哄瓙鍒嗙被鍚嶇О</p>
                  </div>
                  <div className="flex bg-slate-100 p-0.5 rounded border border-slate-300 text-xs font-bold gap-0.5">
                    <button
                      type="button"
                      onClick={() => setDicomEnabled(true)}
                      className={`px-3 py-1 rounded transition-all cursor-pointer ${dicomEnabled ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      鏈?                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDicomEnabled(false);
                      }}
                      className={`px-3 py-1 rounded transition-all cursor-pointer ${!dicomEnabled ? 'bg-slate-300 text-slate-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      鏃?                    </button>
                  </div>
                </div>

                {dicomEnabled && (
                  <div className="space-y-4">
                    {/* Batch Upload Area */}
                    <div 
                      onClick={() => dicomFileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-xl p-6 bg-white hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    >
                      <Upload className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black text-slate-700">鐐瑰嚮鎵归噺閫夋嫨鎴栨嫋鎷藉涓?.dcm 鏍煎紡鍖诲褰卞儚鏂囦欢</span>
                    </div>

                    {/* Category List in Table Form */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-3xs">
                      {dicomCategories.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6 bg-white font-medium">鏆傛棤DICOM褰卞儚鍒嗙被锛岃鍦ㄤ笂鏂逛笂浼犳枃浠?/p>
                      ) : (
                        <table className="min-w-full bg-white divide-y divide-slate-200 text-xs text-left">
                          <thead className="bg-slate-50 font-black text-slate-700 text-[11px] uppercase tracking-wider">
                            <tr>
                              <th className="px-3 py-3 text-center border-b border-r border-slate-200 w-16">搴忓彿</th>
                              <th className="px-3 py-3 border-b border-r border-slate-200 w-80">瀛愬垎绫诲悕绉?span className="text-red-500 font-bold ml-0.5">*</span></th>
                              <th className="px-3 py-3 border-b border-r border-slate-200">鏂囦欢鍚?/th>
                              <th className="px-3 py-3 text-center border-b border-slate-200 w-24">鎿嶄綔</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150">
                            {dicomCategories.map((cat, catIdx) => {
                              const hasFile = cat.files && cat.files.length > 0;
                              const fileName = hasFile ? cat.files[0].name : "鏈笂浼犳枃浠?;
                              return (
                                <tr key={cat.id} className="hover:bg-slate-50/40 transition-colors">
                                  <td className="px-3 py-3.5 text-center align-middle border-r border-slate-200 bg-slate-50/20 font-semibold font-mono">
                                    {catIdx + 1}
                                  </td>
                                  <td className="px-3 py-3.5 align-middle border-r border-slate-200 bg-white">
                                    <div className="flex flex-col space-y-1">
                                      <div className="flex items-center space-x-1">
                                        <input
                                          type="text"
                                          required
                                          value={cat.name}
                                          onChange={(e) => {
                                            const newName = e.target.value;
                                            setDicomCategories(prev => prev.map(c => c.id === cat.id ? { ...c, name: newName } : c));
                                          }}
                                          className={`p-1.5 border rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full ${
                                            !cat.name.trim() ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-slate-250 focus:border-blue-500 bg-slate-50/30"
                                          }`}
                                          placeholder="淇敼瀛愬垎绫诲悕绉?
                                        />
                                      </div>
                                      {!cat.name.trim() && (
                                        <span className="text-[10px] text-red-500 font-semibold flex items-center gap-0.5">
                                          <AlertCircle className="w-3 h-3" />
                                          蹇呭～椤?                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3.5 align-middle border-r border-slate-200 bg-white">
                                    <div className="font-mono text-slate-600 break-all text-xs font-semibold leading-relaxed">
                                      {fileName}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3.5 text-center align-middle border-slate-200 bg-white">
                                    <button
                                      type="button"
                                      onClick={() => setDicomCategories(prev => prev.filter(c => c.id !== cat.id))}
                                      className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[11px] font-bold border border-red-100 transition-colors cursor-pointer"
                                    >
                                      鍒犻櫎
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* (3) Image Data */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">锛?锛夊浘鐗囨暟鎹?/h3>
                    <p className="text-xs text-slate-500 mt-0.5">鏀寔PNG/JPG/JPEG/BPM鏍煎紡锛岃嫢瀛樺湪澶氫釜瀛愬垎绫荤洿鎺ユ壒閲忎笂浼犲涓枃浠讹紝灏嗚嚜鍔ㄨ瘑鍒枃浠跺悕涓哄瓙鍒嗙被鍚嶇О</p>
                  </div>
                  <div className="flex bg-slate-100 p-0.5 rounded border border-slate-300 text-xs font-bold gap-0.5">
                    <button
                      type="button"
                      onClick={() => setImageEnabled(true)}
                      className={`px-3 py-1 rounded transition-all cursor-pointer ${imageEnabled ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      鏈?                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageEnabled(false);
                      }}
                      className={`px-3 py-1 rounded transition-all cursor-pointer ${!imageEnabled ? 'bg-slate-300 text-slate-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      鏃?                    </button>
                  </div>
                </div>

                {imageEnabled && (
                  <div className="space-y-4">
                    {/* Batch Upload Area */}
                    <div 
                      onClick={() => imageFileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-xl p-6 bg-white hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    >
                      <Upload className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black text-slate-700">鐐瑰嚮鎵归噺閫夋嫨鎴栨嫋鎷藉涓尰瀛﹀浘鐗?(.jpg/.jpeg/.png/.bmp) 鏂囦欢</span>
                    </div>

                    {/* Category List in Table Form */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-3xs">
                      {imageCategories.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6 bg-white font-medium">鏆傛棤鍥剧墖鏁版嵁鍒嗙被锛岃鍦ㄤ笂鏂逛笂浼犳枃浠?/p>
                      ) : (
                        <table className="min-w-full bg-white divide-y divide-slate-200 text-xs text-left">
                          <thead className="bg-slate-50 font-black text-slate-700 text-[11px] uppercase tracking-wider">
                            <tr>
                              <th className="px-3 py-3 text-center border-b border-r border-slate-200 w-16">搴忓彿</th>
                              <th className="px-3 py-3 border-b border-r border-slate-200 w-80">瀛愬垎绫诲悕绉?span className="text-red-500 font-bold ml-0.5">*</span></th>
                              <th className="px-3 py-3 border-b border-r border-slate-200">鏂囦欢鍚?/th>
                              <th className="px-3 py-3 text-center border-b border-slate-200 w-24">鎿嶄綔</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150">
                            {imageCategories.map((cat, catIdx) => {
                              const hasFile = cat.files && cat.files.length > 0;
                              const fileName = hasFile ? cat.files[0].name : "鏈笂浼犳枃浠?;
                              return (
                                <tr key={cat.id} className="hover:bg-slate-50/40 transition-colors">
                                  <td className="px-3 py-3.5 text-center align-middle border-r border-slate-200 bg-slate-50/20 font-semibold font-mono">
                                    {catIdx + 1}
                                  </td>
                                  <td className="px-3 py-3.5 align-middle border-r border-slate-200 bg-white">
                                    <div className="flex flex-col space-y-1">
                                      <div className="flex items-center space-x-1">
                                        <input
                                          type="text"
                                          required
                                          value={cat.name}
                                          onChange={(e) => {
                                            const newName = e.target.value;
                                            setImageCategories(prev => prev.map(c => c.id === cat.id ? { ...c, name: newName } : c));
                                          }}
                                          className={`p-1.5 border rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full ${
                                            !cat.name.trim() ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-slate-250 focus:border-blue-500 bg-slate-50/30"
                                          }`}
                                          placeholder="淇敼瀛愬垎绫诲悕绉?
                                        />
                                      </div>
                                      {!cat.name.trim() && (
                                        <span className="text-[10px] text-red-500 font-semibold flex items-center gap-0.5">
                                          <AlertCircle className="w-3 h-3" />
                                          蹇呭～椤?                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3.5 align-middle border-r border-slate-200 bg-white">
                                    <div className="font-mono text-slate-600 break-all text-xs font-semibold leading-relaxed">
                                      {fileName}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3.5 text-center align-middle border-slate-200 bg-white">
                                    <button
                                      type="button"
                                      onClick={() => setImageCategories(prev => prev.filter(c => c.id !== cat.id))}
                                      className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[11px] font-bold border border-red-100 transition-colors cursor-pointer"
                                    >
                                      鍒犻櫎
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Field 2: Data Scale */}
          <div className="bg-white rounded-xl shadow-xs border-2 border-slate-200 p-6" id="section_data_scale">
            <h2 className="text-base font-black text-slate-900 flex items-center space-x-2 mb-4">
              <span className="w-1.5 h-4 bg-blue-600 rounded-xs inline-block"></span>
              <span>2. 鏁版嵁瑙勬ā <span className="text-red-500">*</span></span>
            </h2>
            
            <input
              type="text"
              required
              value={dataScale}
              onChange={(e) => setDataScale(e.target.value)}
              placeholder="璇疯緭鍏?
              className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
              id="data_scale_input"
            />
          </div>

          {/* Field 3: Usage Scenario */}
          <div className="bg-white rounded-xl shadow-xs border-2 border-slate-200 p-6" id="section_usage_scenario">
            <h2 className="text-base font-black text-slate-900 flex items-center space-x-2 mb-4">
              <span className="w-1.5 h-4 bg-blue-600 rounded-xs inline-block"></span>
              <span>3. 浣跨敤鍦烘櫙璇存槑 <span className="text-red-500">*</span></span>
            </h2>
            
            <textarea
              value={usageScenario}
              onChange={(e) => setUsageScenario(e.target.value)}
              placeholder="渚嬪锛歺x鍖婚櫌浣滀负涓€鎵€浠x涓洪噸鐐瑰绉戠殑涓夌骇鐢茬瓑缁煎悎鍖婚櫌锛屽凡绯荤粺鎬хН绱簡瑙勬ā搴炲ぇ鐨剎x鏁版嵁闆嗐€傚尰闄㈡嫙鏍规嵁xx鍏徃鐨勯渶姹傦紝鍦ㄥ尶鍚嶅寲澶勭悊鍚庯紝鍚憍x鍏徃杩涜鍚堣娴侀€氾紝鐢ㄤ簬鍖荤枟澶фā鍨嬭兘鍔涜瘎浼颁笌浼樺寲銆?
              className="w-full h-32 p-3 bg-slate-50 border-2 border-slate-200 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none text-slate-800"
              id="usage_scenario_textarea"
            />
          </div>

          {/* Field 4: Anonymization Evaluation Method */}
          <div className="bg-white rounded-xl shadow-xs border-2 border-slate-200 p-6" id="section_evaluation_method">
            <div className="border-b-2 border-slate-100 pb-4 mb-5">
              <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-xs inline-block"></span>
                <span>4. 鍖垮悕鍖栬瘎浠锋柟寮?/span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">閫夋嫨鍏蜂綋鐨勮瘎浠锋柟寮忥紝骞堕厤缃浉搴旂殑鍙傛暟</p>
            </div>

            <div className="space-y-6">
              {/* (1) Evaluation Method */}
              <div className="border-b border-slate-100 pb-5">
                <label className="block text-sm font-bold text-slate-900 tracking-tight mb-2">
                  锛?锛夎瘎浠锋柟寮?span className="text-rose-600 ml-1 font-black">*</span>
                </label>
                <select
                  value={evaluationMethod}
                  onChange={(e) => setEvaluationMethod(e.target.value)}
                  disabled
                  className="w-full p-2.5 bg-slate-100 border-2 border-slate-200 rounded text-xs font-bold text-slate-500 focus:outline-none cursor-not-allowed"
                >
                  <option value="K鍖垮悕">k-鍖垮悕鍊?/option>
                </select>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
                  鍏蜂綋璁＄畻鍏紡锛欰 = K 脳 S 脳 E 鍏朵腑锛欰鈥斺€斿尶鍚嶅寲绋嬪害锛岃〃绀烘暟鎹泦鐨勫尶鍚嶅寲绋嬪害銆傚叾鍊煎ぇ浜庣瓑浜?1 鏃讹紝璁や负婊¤冻鍖垮悕鍖栬姹傦紱K鈥斺€旀暟鎹泦 K 鍖垮悕鍊硷紝琛ㄧず鏁版嵁闆嗙粡杩囧尶鍚嶅寲澶勭悊鍚庯紝鍏峰鐩稿悓鐨勫噯鏍囪瘑绗﹀瓧娈电粍鍚堢殑璁板綍鐨勬潯鏁扮殑鏈€灏忓€硷紱S鈥斺€斿満鏅郴鏁帮紝琛ㄧず鏁版嵁鍖垮悕鍖栧悗浣跨敤鍦烘櫙鐨勫畨鍏ㄧ郴鏁帮紝濡傞鍦板叕寮€鍏变韩銆佸彈鎺у叕寮€鍏变韩銆佸畬鍏ㄥ叕寮€鍏变韩绛夛紱E鈥斺€旂幆澧冪郴鏁帮紝琛ㄧず鏁版嵁娴侀€氭椂锛屾暟鎹祦閫氱幆澧冪殑鎶€鏈繚闅滆兘鍔涘拰绠＄悊淇濋殰鑳藉姏銆?                </p>
              </div>

              {/* (2) Scenario Coefficient */}
              <div className="border-b border-slate-100 pb-5">
                <label className="block text-sm font-bold text-slate-900 tracking-tight mb-2">
                  锛?锛夊満鏅郴鏁?span className="text-rose-600 ml-1 font-black">*</span>
                </label>
                <select
                  value={scenarioType}
                  onChange={(e) => setScenarioType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="">璇烽€夋嫨</option>
                  <option value="缁勭粐鍐呴儴鍚屼竴涓簨涓氱兢鐨勬暟鎹祦閫?>缁勭粐鍐呴儴鍚屼竴涓簨涓氱兢鐨勬暟鎹祦閫?/option>
                  <option value="缁勭粐鍐呴儴璺ㄤ簨涓氱兢鐨勬暟鎹祦閫?>缁勭粐鍐呴儴璺ㄤ簨涓氱兢鐨勬暟鎹祦閫?/option>
                  <option value="缁勭粐澶栭儴涓ゆ柟鐨勬暟鎹祦閫?>缁勭粐澶栭儴涓ゆ柟鐨勬暟鎹祦閫?/option>
                  <option value="缁勭粐澶栭儴澶氭柟鐨勬暟鎹祦閫?>缁勭粐澶栭儴澶氭柟鐨勬暟鎹祦閫?/option>
                  <option value="瀵瑰鍏紑">瀵瑰鍏紑</option>
                </select>
                <div className="mt-2 text-xs font-bold text-slate-600 flex items-center space-x-1">
                  <span>寤鸿鐨勫満鏅郴鏁?S锛?/span>
                  <span className="text-blue-600 font-black">
                    {scenarioType === "缁勭粐鍐呴儴鍚屼竴涓簨涓氱兢鐨勬暟鎹祦閫? && "1/3"}
                    {scenarioType === "缁勭粐鍐呴儴璺ㄤ簨涓氱兢鐨勬暟鎹祦閫? && "1/4"}
                    {scenarioType === "缁勭粐澶栭儴涓ゆ柟鐨勬暟鎹祦閫? && "1/5"}
                    {scenarioType === "缁勭粐澶栭儴澶氭柟鐨勬暟鎹祦閫? && "1/6"}
                    {scenarioType === "瀵瑰鍏紑" && "1/20"}
                    {!scenarioType && "-"}
                  </span>
                </div>
              </div>

              {/* (3) Environmental Coefficient - Technical Guard */}
              <div className="border-b border-slate-100 pb-5">
                <label className="block text-sm font-bold text-slate-900 tracking-tight mb-2">
                  锛?锛夌幆澧冪郴鏁?鎶€鏈繚闅滆兘鍔?span className="text-rose-600 ml-1 font-black">*</span>
                </label>
                <div className="space-y-5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {envItems.map((item) => {
                    return (
                      <div key={item.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center flex-wrap gap-1.5">
                              <span>{item.name}</span>
                            </h3>
                            {item.desc && (
                              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                            )}
                          </div>

                          {/* Options */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                            <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200 text-[11px] font-bold">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item.id, 'env', '婊¤冻')}
                                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                                  item.status === '婊¤冻' 
                                    ? 'bg-emerald-600 text-white shadow-xs' 
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                婊¤冻
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item.id, 'env', '寰呭畬鍠?)}
                                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                                  item.status === '寰呭畬鍠? 
                                    ? 'bg-amber-500 text-white shadow-xs' 
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                寰呭畬鍠?                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* (4) Environmental Coefficient - Management Guard */}
              <div className="border-b border-slate-100 pb-5">
                <label className="block text-sm font-bold text-slate-900 tracking-tight mb-2">
                  锛?锛夌幆澧冪郴鏁?绠＄悊淇濋殰鑳藉姏<span className="text-rose-600 ml-1 font-black">*</span>
                </label>
                <div className="space-y-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {["鏁版嵁鎸佹湁鏂?, "鏁版嵁浣跨敤鏂?, "鏁版嵁杩愯惀鏂?].map((categoryName) => {
                    const categoryItems = mgmtItems.filter(item => item.category === categoryName);
                    if (categoryItems.length === 0) return null;
                    return (
                      <div key={categoryName} className="space-y-3">
                        <div className="flex items-center space-x-1.5 border-b border-slate-200/60 pb-1.5 mb-2">
                          <span className="w-1 h-3 bg-blue-600 rounded-full"></span>
                          <h4 className="text-xs font-black text-blue-800">
                            {categoryName}
                          </h4>
                        </div>
                        <div className="space-y-4 pl-1">
                          {categoryItems.map((item) => {
                            return (
                              <div key={item.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                  <div className="flex-1">
                                    <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center flex-wrap gap-1.5">
                                      <span>{item.name}</span>
                                    </h3>
                                    {item.desc && (
                                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                                    )}
                                  </div>

                                  {/* Options */}
                                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                                    <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200 text-[11px] font-bold">
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(item.id, 'mgmt', '婊¤冻')}
                                        className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                                          item.status === '婊¤冻' 
                                            ? 'bg-emerald-600 text-white shadow-xs' 
                                            : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                      >
                                        婊¤冻
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(item.id, 'mgmt', '寰呭畬鍠?)}
                                        className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                                          item.status === '寰呭畬鍠? 
                                            ? 'bg-amber-500 text-white shadow-xs' 
                                            : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                      >
                                        寰呭畬鍠?                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* (5) Minimum K Value */}
              <div>
                <label className="block text-sm font-bold text-slate-900 tracking-tight mb-2">
                  锛?锛夋渶浣嶬鍊?                </label>
                <div className="flex items-center space-x-3 bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700">鏍规嵁涓婅堪濉啓鐨勫満鏅郴鏁板拰鐜绯绘暟锛屼负婊¤冻鍖垮悕鍖栬姹傦紝K-鍖垮悕鍊煎簲涓嶄綆浜庯細</p>
                  </div>
                  <div className="w-16 h-16 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-2xl font-black text-blue-600">
                      {scenarioType === "缁勭粐鍐呴儴鍚屼竴涓簨涓氱兢鐨勬暟鎹祦閫? && "3"}
                      {scenarioType === "缁勭粐鍐呴儴璺ㄤ簨涓氱兢鐨勬暟鎹祦閫? && "4"}
                      {scenarioType === "缁勭粐澶栭儴涓ゆ柟鐨勬暟鎹祦閫? && "5"}
                      {scenarioType === "缁勭粐澶栭儴澶氭柟鐨勬暟鎹祦閫? && "6"}
                      {scenarioType === "瀵瑰鍏紑" && "20"}
                      {!scenarioType && "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action generate button removed */}

      </div>

      {/* Generating Overlay Modal */}
      {isGenerating && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-4 border-slate-900 shadow-2xl max-w-lg w-full p-8 text-center">
            <div className="relative mb-6 mx-auto w-16 h-16">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">鍖垮悕鍖栨柟妗堢敓鎴愪腑</h2>
          </div>
        </div>
      )}

      {/* Success Modal Overlay */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-4 border-slate-900 shadow-2xl max-w-xl w-full p-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-black text-slate-950 tracking-tight">馃帀 鍖荤枟鏁版嵁鍖垮悕鍖栨柟妗堣閰嶆垚鍔燂紒</h2>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed max-w-md mx-auto">
              绯荤粺宸插熀浜庢垜鍥?<strong>GB/T 39725 鍖荤枟瀹夊叏鎸囧崡</strong> 鍜?<strong>GB/T 37964 鍘绘爣璇嗗寲鎸囧崡</strong> 瑁呴厤瀹屾垚浜嗛拡瀵归」鐩?<strong className="text-blue-600 font-extrabold">銆妠project.name}銆?/strong> 鐨勫悎瑙勪繚鎶ゆ柟妗堟枃妗ｏ紝骞跺凡鍚屾瀛樺叆椤圭洰璧勪骇涓€?            </p>
            
            {generationError && (
              <div className="mt-4 bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-lg p-4 text-left text-xs leading-relaxed">
                <span className="font-black text-amber-950 uppercase block mb-1">鈿狅笍 琛ュ伩鎬у悎瑙勮鏄庯細</span>
                <p className="text-amber-800 font-bold">{generationError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={onBack}
                className="py-3 px-4 border-2 border-slate-300 hover:border-slate-800 rounded font-black text-xs text-slate-700 hover:text-slate-950 uppercase tracking-wider transition-all cursor-pointer"
              >
                杩斿洖椤圭洰澶у巺
              </button>
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  if (onSchemeGenerated) onSchemeGenerated();
                }}
                className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-200 transition-all cursor-pointer animate-none"
              >
                鏌ョ湅鍖垮悕鍖栨柟妗?              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
