import React, { useState, useEffect } from "react";
import { Project, UploadState, FieldConfig } from "../types";
import { apiFetch } from "../lib/apiFetch";
import { 
  ArrowLeft, Play, BarChart2, X, Loader2, Sparkles, Plus, Search, 
  Server, Clock, AlertTriangle, CheckCircle2, Power, Eye, Settings2, 
  ShieldCheck, HelpCircle, Info, Cpu
} from "lucide-react";
import { STANDARD_CSV_FIELDS, STANDARD_DICOM_FIELDS } from "../lib/constants";
import { DICOM_TAGS, ANONYMIZATION_FIELDS } from "./EditableSchemeForm";

interface AnonymizationEvaluationProps {
  project: Project;
  onBack: () => void;
  uploadState?: UploadState;
  onUpdateProject?: (updated: Project) => void;
}

interface TaskItem {
  id: string;
  name: string;
  modality: 'CSV 缁撴瀯鍖栨枃鏈暟鎹? | 'DICOM 褰卞儚鏁版嵁';
  status: '绛夊緟鎵ц' | '鎵ц涓? | '宸插畬鎴? | '寮傚父涓柇' | '鎵嬪姩缁撴潫';
  servers: string[];
  startTime: string;
  endTime: string;
  createdAt: string;
  total: number;
  success: number;
  failure: number;
  progress?: number;
  duration?: string;
}

const SERVERS = [
  "鏈嶅姟鍣?A (鐟為噾鍖婚櫌 HIS 鏁版嵁搴?",
  "鏈嶅姟鍣?B (鐟為噾鍖婚櫌 PACS 褰卞儚瀛樺偍)",
  "鏈嶅姟鍣?C (寮犳睙鍘绘爣璇嗙鐮斾腑蹇冧簯)"
];

export default function AnonymizationEvaluation({ project, onBack, uploadState, onUpdateProject }: AnonymizationEvaluationProps) {
  const getFieldStatsData = (fieldName: string, fieldNameZh: string) => {
    if (fieldName === "age" || fieldNameZh === "灏辫瘖骞撮緞") {
      return {
        fieldName: "age",
        name: "灏辫瘖骞撮緞",
        total: 5612,
        data: [
          { value: "60-64宀?, count: 800, freq: "14.3%" },
          { value: "65-69宀?, count: 750, freq: "13.4%" },
          { value: "70-74宀?, count: 700, freq: "12.5%" },
          { value: "55-59宀?, count: 650, freq: "11.6%" },
          { value: "50-54宀?, count: 550, freq: "9.8%" },
          { value: "75-79宀?, count: 500, freq: "8.9%" },
          { value: "45-49宀?, count: 450, freq: "8.0%" },
          { value: "40-44宀?, count: 350, freq: "6.2%" },
          { value: "80-84宀?, count: 250, freq: "4.4%" },
          { value: "35-39宀?, count: 200, freq: "3.6%" },
          { value: "30-34宀?, count: 150, freq: "2.7%" },
          { value: "25-29宀?, count: 100, freq: "1.8%" },
          { value: "85-89宀?, count: 50, freq: "0.9%" },
          { value: "20-24宀?, count: 40, freq: "0.7%" },
          { value: "90宀佸強浠ヤ笂", count: 30, freq: "0.5%" },
          { value: "15-19宀?, count: 20, freq: "0.3%" },
          { value: "10-14宀?, count: 12, freq: "0.2%" },
          { value: "5-9宀?, count: 6, freq: "0.1%" },
          { value: "0-4宀?, count: 4, freq: "0.1%" }
        ]
      };
    } else {
      return {
        fieldName: fieldName,
        name: fieldNameZh,
        total: 1390,
        data: [
          { value: "鐗瑰緛鍊?A", count: 208, freq: "15.0%" },
          { value: "鐗瑰緛鍊?B", count: 188, freq: "13.5%" },
          { value: "鐗瑰緛鍊?C", count: 177, freq: "12.7%" },
          { value: "鐗瑰緛鍊?D", count: 167, freq: "12.0%" },
          { value: "鐗瑰緛鍊?E", count: 156, freq: "11.2%" },
          { value: "鐗瑰緛鍊?F", count: 145, fontNormal: true, freq: "10.4%" },
          { value: "鐗瑰緛鍊?G", count: 125, freq: "9.0%" },
          { value: "鐗瑰緛鍊?H", count: 104, freq: "7.5%" },
          { value: "鐗瑰緛鍊?I", count: 63, freq: "4.5%" },
          { value: "鐗瑰緛鍊?J", count: 31, freq: "2.2%" },
          { value: "鐗瑰緛鍊?K", count: 11, freq: "0.8%" },
          { value: "鐗瑰緛鍊?L", count: 7, freq: "0.5%" },
          { value: "鐗瑰緛鍊?M", count: 4, freq: "0.3%" },
          { value: "鐗瑰緛鍊?N", count: 3, freq: "0.2%" },
          { value: "鐗瑰緛鍊?O", count: 3, freq: "0.2%" }
        ]
      };
    }
  };

  // Task list state initialized with realistic seed tasks
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "TASK-1002",
      name: "20260715-001",
      modality: "DICOM 褰卞儚鏁版嵁",
      status: "鎵ц涓?,
      servers: ["鏈嶅姟鍣?A (鐟為噾鍖婚櫌 HIS 鏁版嵁搴?", "鏈嶅姟鍣?B (鐟為噾鍖婚櫌 PACS 褰卞儚瀛樺偍)"],
      startTime: "2026-07-15 03:00:00",
      endTime: "-",
      createdAt: "2026-07-15 02:50:00",
      total: 1000,
      success: 650,
      failure: 0,
      progress: 65,
      duration: "1h56min"
    },
    {
      id: "TASK-1003",
      name: "20260714-004",
      modality: "CSV 缁撴瀯鍖栨枃鏈暟鎹?,
      status: "鍚姩涓?,
      servers: ["鏈嶅姟鍣?C (寮犳睙鍘绘爣璇嗙鐮斾腑蹇冧簯)"],
      startTime: "2026-07-14 18:30:00",
      endTime: "-",
      createdAt: "2026-07-14 18:00:00",
      total: 1000,
      success: 0,
      failure: 0,
      duration: "-"
    },
    {
      id: "TASK-1004",
      name: "20260714-003",
      modality: "DICOM 褰卞儚鏁版嵁",
      status: "寮傚父涓柇",
      servers: ["鏈嶅姟鍣?B (鐟為噾鍖婚櫌 PACS 褰卞儚瀛樺偍)"],
      startTime: "2026-07-14 16:30:00",
      endTime: "2026-07-14 16:31:12",
      createdAt: "2026-07-14 16:00:00",
      total: 1000,
      success: 420,
      failure: 15,
      duration: "1min"
    },
    {
      id: "TASK-1005",
      name: "20260714-002",
      modality: "CSV 缁撴瀯鍖栨枃鏈暟鎹?,
      status: "鎵嬪姩缁撴潫",
      servers: ["鏈嶅姟鍣?A (鐟為噾鍖婚櫌 HIS 鏁版嵁搴?"],
      startTime: "2026-07-14 11:15:00",
      endTime: "2026-07-14 11:15:30",
      createdAt: "2026-07-14 11:10:00",
      total: 1000,
      success: 230,
      failure: 0,
      duration: "30min"
    },
    {
      id: "TASK-1001",
      name: "20260714-001",
      modality: "CSV 缁撴瀯鍖栨枃鏈暟鎹?,
      status: "宸插畬鎴?,
      servers: ["鏈嶅姟鍣?A (鐟為噾鍖婚櫌 HIS 鏁版嵁搴?"],
      startTime: "2026-07-14 10:00:00",
      endTime: "2026-07-14 10:50:00",
      createdAt: "2026-07-14 09:55:00",
      total: 1000,
      success: 995,
      failure: 5,
      duration: "50min"
    }
  ]);

  // UI state
  const [statusFilter, setStatusFilter] = useState("鍏ㄩ儴");
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TaskItem | null>(null);
  const [policyChangedAlertOpen, setPolicyChangedAlertOpen] = useState(false);

  // K-value calculation state for tasks
  const [taskKCalcStates, setTaskKCalcStates] = useState<{[taskId: string]: {
    status: 'idle' | 'calculating' | 'completed' | 'interrupted';
    progress: number;
    result?: number;
  }}>({});

  // Rerun confirmation task state
  const [rerunConfirmTask, setRerunConfirmTask] = useState<TaskItem | null>(null);

  // Scheduled datetime state
  const [scheduledDateTime, setScheduledDateTime] = useState("");

  const getTaskDuration = (task: TaskItem): string => {
    if (task.duration) return task.duration;
    if (task.id === 'TASK-1001') return '50min';
    if (task.id === 'TASK-1002') return '1h56min';
    if (task.id === 'TASK-1003') return '-';
    if (task.id === 'TASK-1004') return '1min';
    if (task.id === 'TASK-1005') return '30min';
    if (task.status === '绛夊緟鎵ц') return '-';
    return '1min';
  };

  // Keep a ref to store active intervals for K-value calculations
  const kCalcIntervals = React.useRef<{[taskId: string]: any}>({});

  const handleStartKCalc = (taskId: string) => {
    // Clear any existing interval
    if (kCalcIntervals.current[taskId]) {
      clearInterval(kCalcIntervals.current[taskId]);
    }

    setTaskKCalcStates(prev => ({
      ...prev,
      [taskId]: { status: 'calculating', progress: 0 }
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(kCalcIntervals.current[taskId]);
        const kResult = taskId === 'TASK-1001' ? 8 : (taskId === 'TASK-1004' ? 5 : 12);
        setTaskKCalcStates(prev => ({
          ...prev,
          [taskId]: { status: 'completed', progress: 100, result: kResult }
        }));
      } else {
        setTaskKCalcStates(prev => ({
          ...prev,
          [taskId]: { status: 'calculating', progress }
        }));
      }
    }, 300);

    kCalcIntervals.current[taskId] = interval;
  };

  const handleInterruptKCalc = (taskId: string) => {
    if (kCalcIntervals.current[taskId]) {
      clearInterval(kCalcIntervals.current[taskId]);
    }
    setTaskKCalcStates(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], status: 'interrupted' }
    }));
  };

  const handleRerunTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: '鎵ц涓?,
          progress: 0,
          success: 0,
          failure: 0,
          startTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          endTime: '-',
          duration: '1min'
        };
      }
      return t;
    }));
    setRerunConfirmTask(null);
  };

  useEffect(() => {
    return () => {
      Object.values(kCalcIntervals.current).forEach(clearInterval);
    };
  }, []);

  // States for Task Details Table
  const [detailRows, setDetailRows] = useState([
    {
      modality: "CSV鏂囨湰鏁版嵁",
      category: "浣忛櫌淇℃伅",
      total: "5,612",
      success: "5,612",
      failure: "0",
      status: "宸插畬鎴? as const,
      duration: "1h5m",
      dataSource: "浣忛櫌淇℃伅鏁版嵁缁堢増"
    },
    {
      modality: "CSV鏂囨湰鏁版嵁",
      category: "妫€鏌ヤ俊鎭?,
      total: "1,390",
      success: "1,370",
      failure: "20",
      status: "宸插畬鎴? as const,
      duration: "46min",
      dataSource: "妫€鏌ヤ俊鎭暟鎹粓鐗?
    },
    {
      modality: "CSV鏂囨湰鏁版嵁",
      category: "妫€楠屼俊鎭?,
      total: "2,432",
      success: "2,432",
      failure: "0",
      status: "寮傚父涓柇" as const,
      duration: "15m",
      dataSource: "妫€楠屼俊鎭暟鎹粓鐗?
    },
    {
      modality: "DICOM褰卞儚鏁版嵁",
      category: "-",
      total: "8,677",
      success: "546",
      failure: "50",
      status: "杩涜涓? as const,
      progress: 34,
      duration: "1h56min",
      dataSource: "bysy/djienf/rerrr"
    },
    {
      modality: "鍥剧墖鏁版嵁",
      category: "闂ㄨ瘖灏辫瘖璁板綍",
      total: "1,348",
      success: "42",
      failure: "23",
      status: "杩涜涓? as const,
      progress: 12,
      duration: "1h56min",
      dataSource: "bysy/djienf/bfgfg/drerre"
    },
    {
      modality: "鍥剧墖鏁版嵁",
      category: "闂ㄨ瘖鍖诲槺",
      total: "2,348",
      success: "342",
      failure: "0",
      status: "杩涜涓? as const,
      progress: 45,
      duration: "1h56min",
      dataSource: "bysy/gferer/fbnbn"
    }
  ]);

  // Timer to increment progress on '杩涜涓? items of detailRows
  useEffect(() => {
    const timer = setInterval(() => {
      setDetailRows(prev => prev.map(row => {
        if (row.status === "杩涜涓? && row.progress !== undefined && row.progress < 100) {
          const nextProgress = Math.min(row.progress + 1, 99);
          const totalNum = parseInt(row.total.replace(/,/g, '')) || 0;
          const failureNum = parseInt(row.failure.replace(/,/g, '')) || 0;
          // Dynamically compute success based on progress percentage
          const nextSuccess = Math.round((totalNum - failureNum) * (nextProgress / 100));
          return {
            ...row,
            progress: nextProgress,
            success: nextSuccess.toLocaleString()
          };
        }
        return row;
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const [viewingRuleRow, setViewingRuleRow] = useState<any | null>(null);
  const [dimensionStatsModal, setDimensionStatsModal] = useState<any | null>(null);
  const [failureDetailsModal, setFailureDetailsModal] = useState<any | null>(null);
  const [selectedFailureReasonIdx, setSelectedFailureReasonIdx] = useState<number>(0);
  const [taskNotSupportedAlertOpen, setTaskNotSupportedAlertOpen] = useState(false);
  const [stopTaskConfirm, setStopTaskConfirm] = useState<TaskItem | null>(null);
  const [viewingKCalculatedStats, setViewingKCalculatedStats] = useState<{
    fieldName: string;
    name: string;
    total: number;
    data: { value: string; count: number; freq: string }[];
  } | null>(null);
  const [kCalculatedStatsPage, setKCalculatedStatsPage] = useState(1);

  // States for K-value calculation
  const [isKCalcModalOpen, setIsKCalcModalOpen] = useState(false);
  const [selectedCsvTaskIdForK, setSelectedCsvTaskIdForK] = useState(project.kTasks?.csvTaskId || "");
  const [selectedDicomTaskIdForK, setSelectedDicomTaskIdForK] = useState(project.kTasks?.dicomTaskId || "");
  const [isCalculatingK, setIsCalculatingK] = useState(false);

  // Global K-value calculation state next to "鍒涘缓浠诲姟" button
  const [globalKCalcState, setGlobalKCalcState] = useState<'idle' | 'calculating' | 'completed'>('idle');
  const [globalKValue, setGlobalKValue] = useState<number | null>(null);
  const [showReadOnlyMapping, setShowReadOnlyMapping] = useState(false);

  // Sync state with selected project if it changes
  useEffect(() => {
    setSelectedCsvTaskIdForK(project.kTasks?.csvTaskId || "");
    setSelectedDicomTaskIdForK(project.kTasks?.dicomTaskId || "");
  }, [project]);

  // New task form state
  const [newTaskName, setNewTaskName] = useState("");
  const [newModality, setNewModality] = useState<'CSV 缁撴瀯鍖栨枃鏈暟鎹? | 'DICOM 褰卞儚鏁版嵁'>('CSV 缁撴瀯鍖栨枃鏈暟鎹?);
  const [newSelectedServers, setNewSelectedServers] = useState<string[]>([]);
  const [newTimeMode, setNewTimeMode] = useState<'immediate' | 'scheduled'>('immediate');
  
  // Datetime states for scheduled run
  const [schedYear, setSchedYear] = useState("2026");
  const [schedMonth, setSchedMonth] = useState("07");
  const [schedDay, setSchedDay] = useState("15");
  const [schedHour, setSchedHour] = useState("12");
  const [schedMinute, setSchedMinute] = useState("00");
  const [schedSecond, setSchedSecond] = useState("00");

  // Interaction Column states for details view
  const [executionState, setExecutionState] = useState<{ [fieldId: string]: { status: 'idle' | 'running' | 'completed', progress: number, interval?: number } }>({});
  const [intervalPromptField, setIntervalPromptField] = useState<{ id: string, name: string, isDicom: boolean } | null>(null);
  const [tempInterval, setTempInterval] = useState(10);
  const [statsViewField, setStatsViewField] = useState<{ id: string, name: string, fieldType: 'text' | 'num', interval?: number, isDicom: boolean } | null>(null);

  // Automatically progress simulated "鎵ц涓? tasks
  useEffect(() => {
    const timer = setInterval(() => {
      setTasks(prevTasks => {
        let changed = false;
        const nextTasks = prevTasks.map(task => {
          if (task.status === '鎵ц涓? && task.id !== 'TASK-1002') {
            changed = true;
            const currentProgress = task.progress !== undefined ? task.progress : 0;
            if (currentProgress < 100) {
              const step = Math.floor(Math.random() * 12) + 8;
              const nextProgress = Math.min(100, currentProgress + step);
              const isCompleted = nextProgress === 100;
              
              // simulated counts
              const totalAmount = task.total || 1000;
              const successAmt = Math.round(totalAmount * (nextProgress / 100));
              const failureAmt = isCompleted ? (task.id === 'TASK-1004' ? 15 : 0) : 0;

              return {
                ...task,
                progress: isCompleted ? undefined : nextProgress,
                status: isCompleted ? '宸插畬鎴? : '鎵ц涓?,
                success: successAmt,
                failure: failureAmt,
                endTime: isCompleted ? new Date().toISOString().replace('T', ' ').substring(0, 19) : task.endTime
              };
            }
          }
          return task;
        });
        return changed ? nextTasks : prevTasks;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // Filter tasks by status filter
  const filteredTasks = tasks.filter(task => {
    if (statusFilter === '鍏ㄩ儴') return true;
    if (statusFilter === '杩涜涓?) return task.status === '鎵ц涓?;
    return task.status === statusFilter;
  });

  // Toggle server selection
  const handleToggleServer = (srv: string) => {
    setNewSelectedServers(prev => 
      prev.includes(srv) ? prev.filter(s => s !== srv) : [...prev, srv]
    );
  };

  // Launch task handler
  const handleLaunchTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) {
      alert("璇疯緭鍏ヤ换鍔″悕绉?);
      return;
    }
    
    // Default server if none is specified or hidden from form
    let serversToUse = newSelectedServers;
    if (serversToUse.length === 0) {
      serversToUse = [SERVERS[0]];
    }

    const taskId = `TASK-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    let scheduledTimeStr = "-";
    let initStatus: TaskItem['status'] = '鎵ц涓?;
    
    if (newTimeMode === 'scheduled') {
      scheduledTimeStr = scheduledDateTime ? scheduledDateTime.replace('T', ' ') + ':00' : nowStr;
      initStatus = '绛夊緟鎵ц';
    }

    const newTask: TaskItem = {
      id: taskId,
      name: newTaskName.trim(),
      modality: newModality || 'CSV 缁撴瀯鍖栨枃鏈暟鎹?,
      status: initStatus,
      servers: serversToUse,
      startTime: initStatus === '鎵ц涓? ? nowStr : "-",
      endTime: "-",
      createdAt: nowStr,
      total: 1000,
      success: 0,
      failure: 0,
      progress: initStatus === '鎵ц涓? ? 0 : undefined,
      duration: initStatus === '鎵ц涓? ? '1min' : '-'
    };

    setTasks(prev => [newTask, ...prev]);
    setIsLaunchModalOpen(false);

    // reset form
    setNewTaskName("");
    setNewModality("CSV 缁撴瀯鍖栨枃鏈暟鎹?);
    setNewSelectedServers([SERVERS[0]]);
    setNewTimeMode("immediate");
    setScheduledDateTime("");
  };

  // Immediate execute action
  const handleStartTaskImmediately = (taskId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: '鎵ц涓?,
          startTime: nowStr,
          progress: 0,
          success: 0,
          failure: 0
        };
      }
      return t;
    }));
  };

  // Handle K-value calculation submission
  const handleCalculateK = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCsvTaskIdForK && !selectedDicomTaskIdForK) {
      alert("璇烽€夋嫨鑷冲皯涓€涓凡瀹屾垚鐨勫幓鏍囪瘑浠诲姟浠ヨ绠梜鍊?);
      return;
    }

    setIsCalculatingK(true);

    // Simulate 1.5 seconds calculation time
    setTimeout(async () => {
      // Create a deterministic yet realistic K-value
      const expectedK = project.expectedK || 5;
      const mockActualK = expectedK + Math.floor(Math.random() * 4) + 1;

      try {
        const response = await apiFetch(`/api/projects/${project.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actualK: mockActualK,
            kTasks: {
              csvTaskId: selectedCsvTaskIdForK || undefined,
              dicomTaskId: selectedDicomTaskIdForK || undefined
            }
          })
        });

        if (response.ok) {
          const updatedProject = await response.json();
          if (onUpdateProject) {
            onUpdateProject(updatedProject);
          }
          setIsKCalcModalOpen(false);
        } else {
          alert("璁＄畻k鍊煎け璐ワ紝璇烽噸璇?);
        }
      } catch (err) {
        console.error("Failed to compute and save actualK:", err);
        alert("璁＄畻k鍊煎嚭鐜板紓甯?);
      } finally {
        setIsCalculatingK(false);
      }
    }, 1500);
  };

  // Stop executing action
  const handleStopTask = (taskId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: '鎵嬪姩缁撴潫',
          endTime: nowStr,
          progress: undefined
        };
      }
      return t;
    }));
  };

  // Fields mapping for the selected task details page
  const getDetailFields = (): any[] => {
    if (!selectedTaskForDetail) return [];
    if (selectedTaskForDetail.modality === 'CSV 缁撴瀯鍖栨枃鏈暟鎹?) {
      return (uploadState && uploadState.parsedCSVFields && uploadState.parsedCSVFields.length > 0)
        ? uploadState.parsedCSVFields
        : STANDARD_CSV_FIELDS;
    } else {
      return (uploadState && uploadState.parsedDICOMFields && uploadState.parsedDICOMFields.length > 0)
        ? uploadState.parsedDICOMFields
        : STANDARD_DICOM_FIELDS;
    }
  };

  // Details Column execution simulation
  const handleStartExecution = (fieldId: string, fieldChineseName: string, fieldType: 'text' | 'num', isDicom: boolean, intervalValue?: number) => {
    setExecutionState(prev => ({
      ...prev,
      [fieldId]: { status: 'running', progress: 0, interval: intervalValue }
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setExecutionState(prev => ({
          ...prev,
          [fieldId]: { status: 'completed', progress: 100, interval: intervalValue }
        }));
      } else {
        setExecutionState(prev => ({
          ...prev,
          [fieldId]: { status: 'running', progress, interval: intervalValue }
        }));
      }
    }, 400);
  };

  const handleCancelExecution = (fieldId: string) => {
    setExecutionState(prev => ({
      ...prev,
      [fieldId]: { status: 'idle', progress: 0 }
    }));
  };

  // Simulated Distribution Statistics data generator
  const getFieldStatistics = (fieldId: string, fieldName: string, fieldType: 'text' | 'num', interval?: number) => {
    if (fieldType === 'num') {
      const step = interval || 10;
      return [
        { value: `0 - ${step}`, count: 420, pct: 42 },
        { value: `${step} - ${step * 2}`, count: 310, pct: 31 },
        { value: `${step * 2} - ${step * 3}`, count: 180, pct: 18 },
        { value: `${step * 3} - ${step * 4}`, count: 70, pct: 7 },
        { value: `> ${step * 4}`, count: 20, pct: 2 },
      ];
    }

    if (fieldName.includes("鎬у埆") || fieldId.includes("gender")) {
      return [
        { value: "鐢?(Male)", count: 540, pct: 54 },
        { value: "濂?(Female)", count: 460, pct: 46 },
      ];
    }
    if (fieldName.includes("鍖荤枟鏈烘瀯") || fieldName.includes("institution")) {
      return [
        { value: "鐟為噾鎬婚櫌", count: 780, pct: 78 },
        { value: "鍗㈡咕鍒嗛櫌", count: 150, pct: 15 },
        { value: "涓存腐鍒嗛櫌", count: 70, pct: 7 },
      ];
    }
    // Generic fallback text fields
    return [
      { value: "绫诲瀷 / 鍒嗙被鍊?A", count: 500, pct: 50 },
      { value: "绫诲瀷 / 鍒嗙被鍊?B", count: 350, pct: 35 },
      { value: "绫诲瀷 / 鍒嗙被鍊?C", count: 150, pct: 15 },
    ];
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8" id="anonymization_tasks_workspace">
      
      {!selectedTaskForDetail ? (
        /* ================= MAIN TASK LIST VIEW ================= */
        <div className="space-y-6">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded text-slate-600 border-2 border-slate-200 hover:border-slate-400 transition-all cursor-pointer"
                title="杩斿洖椤圭洰鍒楄〃"
              >
                <ArrowLeft className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
              <div>
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>椤圭洰绠＄悊</span>
                  <span className="text-slate-300">/</span>
                  <span className="truncate max-w-[200px]">{project.name}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-blue-600 font-black">鍖垮悕鍖栦换鍔?/span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">鍖垮悕鍖栦换鍔?/h1>
              </div>
            </div>
          </div>

          {/* Filter condition and Launch task button bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            {/* Filter Dropdown */}
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
              <span className="text-slate-500 font-bold shrink-0">浠诲姟鐘舵€侊細</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800 cursor-pointer min-w-[120px]"
              >
                <option value="鍏ㄩ儴">鍏ㄩ儴</option>
                <option value="鍚姩涓?>鍚姩涓?/option>
                <option value="杩涜涓?>杩涜涓?/option>
                <option value="寮傚父涓柇">寮傚父涓柇</option>
                <option value="鎵嬪姩缁撴潫">鎵嬪姩缁撴潫</option>
                <option value="宸插畬鎴?>宸插畬鎴?/option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              {/* Display "璁＄畻涓? during loading */}
              {globalKCalcState === 'calculating' && (
                <span className="flex items-center space-x-1 px-3.5 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-black animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  <span>璁＄畻涓?/span>
                </span>
              )}

              {/* Display K-value after calculation completed */}
              {globalKCalcState === 'completed' && globalKValue !== null && (
                <span className="inline-flex items-center px-3.5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-black">
                  k鍊? {globalKValue}
                </span>
              )}

              {/* "璁＄畻k鍊? Button */}
              {globalKCalcState !== 'calculating' && (
                <button
                  onClick={() => {
                    setGlobalKCalcState('calculating');
                    setTimeout(() => {
                      setGlobalKCalcState('completed');
                      setGlobalKValue(8);
                    }, 2000);
                  }}
                  className="flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded text-xs font-black uppercase tracking-wider transition-colors border border-slate-300 shadow-2xs cursor-pointer"
                >
                  <span>璁＄畻k鍊?/span>
                </button>
              )}

              {/* Launch Task Button */}
              <button
                onClick={() => {
                  setIsLaunchModalOpen(true);
                }}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded text-xs font-black uppercase tracking-wider shadow-md shadow-blue-200/50 transition-colors cursor-pointer border-0"
              >
                <Plus className="w-4 h-4 stroke-[3px]" />
                <span>鍒涘缓浠诲姟</span>
              </button>
            </div>
          </div>

          {/* Table List of Tasks */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                    <th className="py-4.5 px-5">浠诲姟鍚嶇О</th>
                    <th className="py-4.5 px-4 text-center">浠诲姟鐘舵€?/th>
                    <th className="py-4.5 px-4 text-center">浠诲姟鎯呭喌 (鎬?鎴愬姛/澶辫触)</th>
                    <th className="py-4.5 px-4">浠诲姟寮€濮?~ 缁撴潫鏃堕棿</th>
                    <th className="py-4.5 px-4 text-center">鑰楁椂</th>
                    <th className="py-4.5 px-5 text-center">鎿嶄綔</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => {
                      const isLatestTask = tasks[0] && task.id === tasks[0].id;
                      return (
                        <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Task name & ID */}
                          <td className="py-4 px-5">
                            <div className="font-black text-slate-900">{task.name}</div>
                          </td>

                          {/* Status badge with animated progression if running */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                                task.status === '宸插畬鎴? ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                task.status === '鎵ц涓? ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                task.status === '鍚姩涓? ? 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse' :
                                task.status === '绛夊緟鎵ц' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                task.status === '寮傚父涓柇' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                'bg-slate-100 text-slate-600 border-slate-300'
                              }`}>
                                {(task.status === '鎵ц涓? || task.status === '鍚姩涓?) && <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-600 mr-0.5" />}
                                <span>{task.status === '鎵ц涓? ? '杩涜涓? : task.status}</span>
                              </span>
                              {task.status === '鎵ц涓? && task.progress !== undefined && task.id !== 'TASK-1002' && (
                                <div className="w-24 mt-1">
                                  <div className="flex justify-between text-[9px] text-slate-400 font-bold mb-0.5">
                                    <span>杩涘害</span>
                                    <span>{task.progress}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden border border-slate-200">
                                    <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${task.progress}%` }}></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>



                          {/* Situation counts, formatted differently by data modality */}
                          <td className="py-4 px-4">
                            {task.status === '鍚姩涓? ? null : (() => {
                              const total = task.total || 1000;
                              const success = task.success || 0;
                              const failure = task.failure || 0;

                              const csv_ratio = 0.5;
                              const dicom_ratio = 0.3;

                              const csv_total = Math.round(total * csv_ratio);
                              const csv_failure = Math.min(csv_total, Math.round(failure * csv_ratio));
                              const progressPercent = total > 0 ? (success / total) : 0;
                              const csv_success = Math.min(csv_total - csv_failure, Math.round(csv_total * progressPercent));

                              const dicom_total = Math.round(total * dicom_ratio);
                              const dicom_failure = Math.min(dicom_total, Math.round(failure * dicom_ratio));
                              const dicom_success = Math.min(dicom_total - dicom_failure, Math.round(dicom_total * progressPercent));

                              const image_total = Math.max(0, total - csv_total - dicom_total);
                              const image_failure = Math.min(image_total, Math.max(0, failure - csv_failure - dicom_failure));
                              const image_success = Math.min(image_total - image_failure, Math.max(0, success - csv_success - dicom_success));

                              const csv_pct = csv_total > 0 ? Math.round((csv_success / csv_total) * 100) : 0;
                              const dicom_pct = dicom_total > 0 ? Math.round((dicom_success / dicom_total) * 100) : 0;
                              const image_pct = image_total > 0 ? Math.round((image_success / image_total) * 100) : 0;

                              return (
                                <div className="flex flex-col space-y-1.5 font-bold text-[11px] leading-tight text-slate-700 min-w-[220px]">
                                  {/* CSV */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-500 font-medium">CSV锛?/span>
                                    <span className="font-mono text-slate-900">
                                      {csv_total}/{csv_success}/{csv_failure}
                                      <span className="text-blue-600 ml-1 font-black">锛坽csv_pct}%锛?/span>
                                    </span>
                                  </div>
                                  {/* DICOM */}
                                  <div className="flex items-center justify-between border-t border-slate-100 pt-1">
                                    <span className="text-slate-500 font-medium">DICOM锛?/span>
                                    <span className="font-mono text-slate-900">
                                      {dicom_total}/{dicom_success}/{dicom_failure}
                                      <span className="text-indigo-600 ml-1 font-black">锛坽dicom_pct}%锛?/span>
                                    </span>
                                  </div>
                                  {/* Image */}
                                  <div className="flex items-center justify-between border-t border-slate-100 pt-1">
                                    <span className="text-slate-500 font-medium">鍥剧墖锛?/span>
                                    <span className="font-mono text-slate-900">
                                      {image_total}/{image_success}/{image_failure}
                                      <span className="text-violet-600 ml-1 font-black">锛坽image_pct}%锛?/span>
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          </td>

                          {/* Start~End time */}
                          <td className="py-4 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            <div>濮? {task.startTime}</div>
                            {task.status !== '鍚姩涓? && task.status !== '鎵ц涓? && task.endTime && task.endTime !== '-' && (
                              <div className="mt-1 text-slate-400">缁? {task.endTime}</div>
                            )}
                          </td>

                          {/* Duration column */}
                          <td className="py-4 px-4 font-mono text-[11px] text-slate-600 text-center whitespace-nowrap">
                            {getTaskDuration(task)}
                          </td>

                          {/* Action buttons matching status rules */}
                          <td className="py-4 px-5 text-center">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                              {/* Rerun Failed if conditions are met: latest task, completed, has failures */}
                              {((isLatestTask && task.status === '宸插畬鎴? && task.failure > 0) || task.name === '20260714-001') && (
                                <button
                                  onClick={() => {
                                    if (task.name === '20260714-001') {
                                      setTaskNotSupportedAlertOpen(true);
                                    } else {
                                      setRerunConfirmTask(task);
                                    }
                                  }}
                                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded text-[10px] shadow-2xs transition-all cursor-pointer border-0"
                                >
                                  <span>澶辫触閲嶈窇</span>
                                </button>
                              )}

                              {/* 鍚姩涓? 鏄剧ず銆愮粨鏉熶换鍔°€?*/}
                              {task.status === '鍚姩涓? && (
                                <button
                                  onClick={() => setStopTaskConfirm(task)}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black rounded text-[10px] border border-rose-200 transition-colors cursor-pointer"
                                >
                                  <span>缁撴潫浠诲姟</span>
                                </button>
                              )}

                              {/* 绛夊緟鎵ц: 鏄剧ず銆愮珛鍗虫墽琛屻€?*/}
                              {task.status === '绛夊緟鎵ц' && (
                                <button
                                  onClick={() => handleStartTaskImmediately(task.id)}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded text-[10px] shadow-2xs transition-colors cursor-pointer border-0"
                                >
                                  <span>绔嬪嵆鎵ц</span>
                                </button>
                              )}

                              {/* 鎵ц涓? 鏄剧ず銆愮粨鏉熶换鍔°€佽鎯呫€?*/}
                              {task.status === '鎵ц涓? && (
                                <>
                                  <button
                                    onClick={() => setStopTaskConfirm(task)}
                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black rounded text-[10px] border border-rose-200 transition-colors cursor-pointer"
                                  >
                                    <span>缁撴潫浠诲姟</span>
                                  </button>
                                  <button
                                    onClick={() => setSelectedTaskForDetail(task)}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded text-[10px] border border-slate-300 transition-colors cursor-pointer"
                                  >
                                    <span>璇︽儏</span>
                                  </button>
                                </>
                              )}

                              {/* 宸插畬鎴? 鏄剧ず銆愯鎯呫€?*/}
                              {task.status === '宸插畬鎴? && (
                                <button
                                  onClick={() => setSelectedTaskForDetail(task)}
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black rounded text-[10px] border border-blue-200 transition-colors cursor-pointer"
                                >
                                  <span>璇︽儏</span>
                                </button>
                              )}

                              {/* 寮傚父涓柇: 鏄剧ず銆愮珛鍗虫墽琛屻€佺粨鏉熶换鍔°€佽鎯呫€?*/}
                              {task.status === '寮傚父涓柇' && (
                                <>
                                  {task.id === 'TASK-1004' ? (
                                    <button
                                      onClick={() => setTaskNotSupportedAlertOpen(true)}
                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded text-[10px] shadow-2xs transition-colors cursor-pointer border-0"
                                    >
                                      <span>缁х画鎵ц</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleStartTaskImmediately(task.id)}
                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded text-[10px] shadow-2xs transition-colors cursor-pointer border-0"
                                    >
                                      <span>绔嬪嵆鎵ц</span>
                                    </button>
                                  )}

                                  {task.id !== 'TASK-1004' && (
                                    <button
                                      onClick={() => setStopTaskConfirm(task)}
                                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black rounded text-[10px] border border-rose-200 transition-colors cursor-pointer"
                                    >
                                      <span>缁撴潫浠诲姟</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => setSelectedTaskForDetail(task)}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded text-[10px] border border-slate-300 transition-colors cursor-pointer"
                                  >
                                    <span>璇︽儏</span>
                                  </button>
                                </>
                              )}

                              {/* 鎵嬪姩缁撴潫: 鏄剧ず銆愯鎯呫€?涓嶆樉绀虹珛鍗虫墽琛? */}
                              {task.status === '鎵嬪姩缁撴潫' && (
                                <button
                                  onClick={() => setSelectedTaskForDetail(task)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded text-[10px] border border-slate-300 transition-colors cursor-pointer"
                                >
                                  <span>璇︽儏</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium bg-slate-50/50">
                        鏈尮閰嶅埌绗﹀悎鏉′欢鐨勪换鍔″悕绉般€?                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ================= TASK DETAIL SUBPAGE VIEW ================= */
        <div className="space-y-6 animate-fade-in">
          {/* Header & Back row */}
          <div className="flex items-center space-x-3 border-b border-slate-200 pb-5">
            <button 
              onClick={() => setSelectedTaskForDetail(null)}
              className="p-2 hover:bg-slate-100 rounded text-slate-600 border-2 border-slate-200 hover:border-slate-400 transition-all cursor-pointer"
              title="杩斿洖鍖垮悕鍖栦换鍔″垪琛?
            >
              <ArrowLeft className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>
            <div>
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>椤圭洰绠＄悊</span>
                <span className="text-slate-300">/</span>
                <span>鍖垮悕鍖栦换鍔?/span>
                <span className="text-slate-300">/</span>
                <span className="text-blue-600 font-black">浠诲姟璇︽儏</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                浠诲姟璇︽儏
              </h1>
            </div>
          </div>

          {/* Above Panel Summary display */}
          <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-950 p-6 shadow-md relative overflow-hidden flex flex-col space-y-5">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-44 h-44 bg-slate-800/40 rounded-full blur-2xl"></div>
            
            {/* Row 1: Task Name + Status, and Task ID */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">浠诲姟鍚嶇О</span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-base font-black text-white tracking-tight leading-snug">
                    {selectedTaskForDetail.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    selectedTaskForDetail.status === '宸插畬鎴? ? 'bg-emerald-600 text-white' :
                    selectedTaskForDetail.status === '鎵ц涓? ? 'bg-blue-600 text-white' :
                    selectedTaskForDetail.status === '绛夊緟鎵ц' ? 'bg-amber-600 text-white' :
                    selectedTaskForDetail.status === '寮傚父涓柇' ? 'bg-rose-600 text-white' :
                    'bg-slate-600 text-white'
                  }`}>
                    {selectedTaskForDetail.status === '鎵ц涓? ? '杩涜涓? : selectedTaskForDetail.status}
                  </span>
                </div>
              </div>
              <div className="md:text-right shrink-0">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">浠诲姟ID</span>
                <span className="text-xs font-mono text-blue-400 font-black tracking-wider block mt-1">{selectedTaskForDetail.id}</span>
              </div>
            </div>

            {/* Row 2: Created Time, and execution times + duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-bold text-slate-300">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">鍒涘缓鏃堕棿</span>
                <span className="text-sm font-mono text-slate-200 mt-1 block">
                  {selectedTaskForDetail.createdAt || "2026-07-14 09:55:00"}
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">鎵ц鏃堕棿鍙婅€楁椂</span>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 mt-1">
                  <div className="text-xs font-mono text-slate-400">濮? {selectedTaskForDetail.startTime}</div>
                  <div className="text-xs font-mono text-slate-400">缁? {selectedTaskForDetail.endTime}</div>
                  <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 whitespace-nowrap self-start sm:self-auto sm:ml-2">
                    鑰楁椂: {selectedTaskForDetail.duration || "1h56m"}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">鏁版嵁瀛樺偍浣嶇疆</span>
                <span className="text-sm font-mono text-slate-200 mt-1 block">
                  bysy/niminghua/jieguo
                </span>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                    <th className="py-4 px-5">鏁版嵁妯℃€?/th>
                    <th className="py-4 px-4">鍒嗙被</th>
                    <th className="py-4 px-4 text-center">鎬绘暟</th>
                    <th className="py-4 px-4 text-center">鎴愬姛鏁?/th>
                    <th className="py-4 px-4 text-center">澶辫触鏁?/th>
                    <th className="py-4 px-4 text-center">鐘舵€?/th>
                    <th className="py-4 px-4 text-center">鑰楁椂</th>
                    <th className="py-4 px-5 text-center">鍖垮悕鍖栫瓥鐣?/th>
                    <th className="py-4 px-5 text-center">鏁版嵁鏉ユ簮</th>
                    <th className="py-4 px-5 text-center">鎶ラ敊淇℃伅</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {(() => {
                    const status = selectedTaskForDetail.status;
                    let filteredRows = [...detailRows];
                    if (status === '宸插畬鎴?) {
                      filteredRows = detailRows.filter(row => row.status === '宸插畬鎴?);
                    } else if (status === '寮傚父涓柇') {
                      filteredRows = detailRows.filter(row => row.status === '宸插畬鎴? || row.status === '寮傚父涓柇');
                    } else if (status === '鎵嬪姩缁撴潫') {
                      filteredRows = detailRows.map(row => ({
                        ...row,
                        status: row.status === '杩涜涓? ? '鎵嬪姩缁撴潫' as const : row.status
                      }));
                    }
                    return filteredRows.map((row, idx) => {
                      const isMedia = row.modality === "DICOM褰卞儚鏁版嵁" || row.modality === "鍥剧墖鏁版嵁";
                      const hasFailures = parseInt(row.failure.replace(/,/g, '')) > 0;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                          {/* 鏁版嵁妯℃€?*/}
                          <td className="py-4 px-5 text-slate-900 font-black">{row.modality}</td>

                          {/* 鍒嗙被 */}
                          <td className="py-4 px-4 text-slate-500 font-medium">{row.category}</td>

                          {/* 鎬绘暟 */}
                          <td className="py-4 px-4 text-center font-mono">
                            {isMedia ? (
                              <button
                                onClick={() => setDimensionStatsModal(row)}
                                className="text-blue-600 hover:text-blue-800 underline font-black cursor-pointer bg-transparent border-0"
                              >
                                {row.total}
                              </button>
                            ) : (
                              <span>{row.total}</span>
                            )}
                          </td>

                          {/* 鎴愬姛鏁?*/}
                          <td className="py-4 px-4 text-center font-mono text-emerald-600">{row.success}</td>

                          {/* 澶辫触鏁?*/}
                          <td className="py-4 px-4 text-center font-mono">
                            {hasFailures ? (
                              <button
                                onClick={() => {
                                  setSelectedFailureReasonIdx(0);
                                  setFailureDetailsModal(row);
                                }}
                                className="text-rose-600 hover:text-rose-800 underline font-black cursor-pointer bg-transparent border-0"
                              >
                                {row.failure}
                              </button>
                            ) : (
                              <span className="text-slate-400">{row.failure}</span>
                            )}
                          </td>

                          {/* 鐘舵€?*/}
                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-black border ${
                                row.status === '宸插畬鎴? ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                row.status === '杩涜涓? ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                row.status === '寮傚父涓柇' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                row.status === '鎵嬪姩缁撴潫' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                                'bg-slate-100 text-slate-600 border-slate-300'
                              }`}>
                                {row.status === '杩涜涓? && <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-600 shrink-0" />}
                                <span>{row.status}</span>
                              </span>
                              {row.status === '杩涜涓? && row.progress !== undefined && (
                                <div className="w-20 mt-1">
                                  <div className="flex justify-between text-[8px] text-slate-400 font-bold mb-0.5">
                                    <span>杩涘害</span>
                                    <span>{row.progress}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-0.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${row.progress}%` }}></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 鑰楁椂 */}
                          <td className="py-4 px-4 text-center font-mono text-slate-500">{row.duration}</td>

                          {/* 鍖垮悕鍖栫瓥鐣?*/}
                          <td className="py-4 px-5 text-center">
                            <button
                              onClick={() => setViewingRuleRow(row)}
                              className="text-blue-600 hover:text-blue-800 font-black cursor-pointer bg-transparent border-0"
                            >
                              鏌ョ湅
                            </button>
                          </td>

                          {/* 鏁版嵁鏉ユ簮 */}
                          <td className="py-4 px-5 text-center text-slate-500 font-medium">
                            {row.dataSource || "-"}
                          </td>

                          {/* 鎶ラ敊淇℃伅 */}
                          <td className="py-4 px-5 text-center font-bold text-rose-600">
                            {row.status === '寮傚父涓柇' ? '杩炴帴涓昏妭鐐硅秴鏃讹紝浼犺緭寮傚父涓柇 (閿欒鐮? 504)' : '-'}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: LAUNCH NEW TASK ================= */}
      {isLaunchModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="launch_task_modal">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-lg w-full overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm uppercase tracking-wider">鍒涘缓浠诲姟</h3>
              </div>
              <button 
                onClick={() => setIsLaunchModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-left">
              <div className="text-slate-700 text-sm font-bold leading-relaxed">
                鏈」鐩笅瀛樺湪杩涜涓殑浠诲姟锛屾棤娉曞啀娆″垱寤轰换鍔★紝鎮ㄥ彲浠ョ瓑寰呬换鍔℃墽琛屽畬鎴愭垨鎵嬪姩缁撴潫浠诲姟鍚庡啀娆″垱寤轰换鍔?              </div>

              {/* Action buttons */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLaunchModalOpen(false)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-950 text-white text-xs font-black rounded uppercase tracking-wider transition-colors border-0 cursor-pointer"
                >
                  鍏抽棴
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= POLICY CHANGED ALERT MODAL ================= */}
      {policyChangedAlertOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="policy_changed_alert_modal">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-md w-full overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
                <h3 className="font-black text-sm uppercase tracking-wider">鎻愮ず</h3>
              </div>
              <button 
                onClick={() => setPolicyChangedAlertOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-6 space-y-4 text-left">
              <div className="text-slate-700 text-sm font-bold leading-relaxed">
                鍖垮悕鍖栫瓥鐣ュ瓨鍦ㄥ彉鏇达紝鏃犳硶鎵ц褰撳墠浠诲姟锛岃閲嶆柊鍒涘缓浠诲姟
              </div>
            </div>
            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 flex justify-end">
              <button
                onClick={() => setPolicyChangedAlertOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-950 text-white text-xs font-black rounded uppercase tracking-wider transition-colors cursor-pointer border-0"
              >
                鍏抽棴
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TASK NOT SUPPORTED ALERT MODAL ================= */}
      {taskNotSupportedAlertOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="task_not_supported_alert_modal">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-md w-full overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
                <h3 className="font-black text-sm uppercase tracking-wider">鎻愮ず</h3>
              </div>
              <button 
                onClick={() => setTaskNotSupportedAlertOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-6 space-y-4 text-left">
              <div className="text-slate-700 text-sm font-bold leading-relaxed">
                鏈」鐩笅宸插瓨鍦ㄦ柊鐨勪换鍔★紝鏆備笉鏀寔鍦ㄥ綋鍓嶄换鍔′笂鎵ц鎿嶄綔
              </div>
            </div>
            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 flex justify-end">
              <button
                onClick={() => setTaskNotSupportedAlertOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-950 text-white text-xs font-black rounded uppercase tracking-wider transition-colors cursor-pointer border-0"
              >
                鍏抽棴
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STOP TASK CONFIRMATION MODAL ================= */}
      {stopTaskConfirm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="stop_task_confirm_modal">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-md w-full overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
                <h3 className="font-black text-sm uppercase tracking-wider">纭缁撴潫浠诲姟</h3>
              </div>
              <button 
                onClick={() => setStopTaskConfirm(null)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-6 space-y-4 text-left">
              <div className="text-slate-700 text-sm font-bold leading-relaxed">
                鏄惁纭缁撴潫{stopTaskConfirm.name}浠诲姟锛?              </div>
            </div>
            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 flex justify-end space-x-2">
              <button
                onClick={() => setStopTaskConfirm(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black rounded uppercase tracking-wider transition-colors cursor-pointer border-0"
              >
                鍙栨秷
              </button>
              <button
                onClick={() => {
                  handleStopTask(stopTaskConfirm.id);
                  setStopTaskConfirm(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded uppercase tracking-wider transition-colors cursor-pointer border-0"
              >
                纭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW STATS MODAL (鏌ョ湅缁熻寮圭獥) ================= */}
      {viewingKCalculatedStats && (() => {
        const stats = viewingKCalculatedStats;
        const totalCount = stats.total;
        const itemsPerPage = 10;
        const totalPages = Math.ceil(stats.data.length / itemsPerPage);
        const startIndex = (kCalculatedStatsPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = stats.data.slice(startIndex, endIndex);

        return (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-[60] p-4 animate-fade-in" id="k_calculated_stats_modal">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-2xl w-full overflow-hidden animate-scale-up flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <BarChart2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-black text-sm uppercase tracking-wider">
                    缁熻缁撴灉-{stats.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setViewingKCalculatedStats(null)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 overflow-y-auto text-left flex-1">
                <div className="text-xs font-bold text-slate-700">
                  鎬绘暟锛歿totalCount.toLocaleString()} 
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-5">瀛楁鍊?/th>
                        <th className="py-3 px-4 text-center">鍑虹幇娆℃暟</th>
                        <th className="py-3 px-4 text-center">鍑虹幇棰戠巼</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {currentItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-5 text-slate-900 font-normal">{item.value}</td>
                          <td className="py-3 px-4 text-center font-mono text-slate-600">{item.count.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center font-mono text-emerald-600">{item.freq}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
                    <span>
                      绗?{kCalculatedStatsPage} / {totalPages} 椤?                    </span>
                    <div className="flex space-x-1">
                      <button
                        disabled={kCalculatedStatsPage === 1}
                        onClick={() => setKCalculatedStatsPage(prev => Math.max(1, prev - 1))}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-600 text-xs font-bold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        涓婁竴椤?                      </button>
                      <button
                        disabled={kCalculatedStatsPage === totalPages}
                        onClick={() => setKCalculatedStatsPage(prev => Math.min(totalPages, prev + 1))}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-600 text-xs font-bold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        涓嬩竴椤?                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
                <button 
                  onClick={() => setViewingKCalculatedStats(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-xs rounded-xl cursor-pointer transition-colors border-0"
                >
                  鍏抽棴
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= MODAL: K-VALUE CALCULATION ================= */}
      {isKCalcModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="k_calc_modal">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-lg w-full overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="font-black text-sm uppercase tracking-wider">
                  {project.actualK !== undefined ? '淇敼k鍊艰绠椾换鍔?& 閲嶆柊璁＄畻' : '璁＄畻瀹為檯k鍊?}
                </h3>
              </div>
              <button 
                onClick={() => setIsKCalcModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
                disabled={isCalculatingK}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {isCalculatingK ? (
              <div className="p-12 flex flex-col items-center justify-center space-y-4 text-center">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  姝ｅ湪璇诲彇宸插畬鎴愮殑鍘绘爣璇嗘暟鎹泦...
                </p>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed max-w-xs">
                  绯荤粺姝ｅ湪骞惰瀵归€夊畾鐨勭粨鏋勫寲鏂囨湰绛変环绫讳笌褰卞儚鍘绘爣缁撴灉杩涜瀹夊叏閲嶅彔鍒嗘瀽涓庨噸鏍囪瘑姒傜巼鐭╅樀纰版挒锛岃€楁椂绾﹂渶鏁扮...
                </p>
              </div>
            ) : (
              <form onSubmit={handleCalculateK} className="p-6 space-y-5 text-left">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">椤圭洰瀹夊叏瀹氱骇鍩哄噯</div>
                  <div className="text-xs font-bold text-slate-700 flex justify-between items-center">
                    <span>棰勬湡 K-Anonymity 瀹夊叏鍊?</span>
                    <span className="text-purple-600 font-black bg-purple-50 px-2.5 py-1 rounded border border-purple-100">
                      棰勬湡k鍊?= {project.expectedK || 5}
                    </span>
                  </div>
                  {project.actualK !== undefined && (
                    <div className="text-xs font-bold text-slate-700 flex justify-between items-center mt-2 pt-2 border-t border-slate-200/60">
                      <span>褰撳墠宸茶绠楀疄闄?k 鍊?</span>
                      <span className="text-emerald-600 font-black bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
                        瀹為檯k鍊?= {project.actualK}
                      </span>
                    </div>
                  )}
                </div>

                {/* CSV Modality Task Selector */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    CSV 缁撴瀯鍖栨枃鏈暟鎹?浠诲姟閫夋嫨 (宸插畬鎴?
                  </label>
                  {tasks.filter(t => t.modality === 'CSV 缁撴瀯鍖栨枃鏈暟鎹? && t.status === '宸插畬鎴?).length > 0 ? (
                    <select
                      value={selectedCsvTaskIdForK}
                      onChange={(e) => setSelectedCsvTaskIdForK(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 cursor-pointer"
                    >
                      <option value="">-- 涓嶉€夋嫨 (鏈璁＄畻涓嶅悎骞舵妯℃€? --</option>
                      {tasks
                        .filter(t => t.modality === 'CSV 缁撴瀯鍖栨枃鏈暟鎹? && t.status === '宸插畬鎴?)
                        .map(t => (
                          <option key={t.id} value={t.id}>
                            [{t.id}] {t.name} (瀹屾垚鏃堕棿: {t.endTime || t.createdAt})
                          </option>
                        ))
                      }
                    </select>
                  ) : (
                    <div className="p-3 bg-amber-50/50 border border-amber-100 text-amber-700 text-xs font-bold rounded-lg flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>鏆傛棤宸插畬鎴愮殑 CSV 缁撴瀯鍖栨枃鏈换鍔°€傝鍏堝彂璧峰苟瀹屾垚璇ョ被鍨嬬殑浠诲姟銆?/span>
                    </div>
                  )}
                </div>

                {/* DICOM Modality Task Selector */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    DICOM 褰卞儚鏁版嵁 浠诲姟閫夋嫨 (宸插畬鎴?
                  </label>
                  {tasks.filter(t => t.modality === 'DICOM 褰卞儚鏁版嵁' && t.status === '宸插畬鎴?).length > 0 ? (
                    <select
                      value={selectedDicomTaskIdForK}
                      onChange={(e) => setSelectedDicomTaskIdForK(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 cursor-pointer"
                    >
                      <option value="">-- 涓嶉€夋嫨 (鏈璁＄畻涓嶅悎骞舵妯℃€? --</option>
                      {tasks
                        .filter(t => t.modality === 'DICOM 褰卞儚鏁版嵁' && t.status === '宸插畬鎴?)
                        .map(t => (
                          <option key={t.id} value={t.id}>
                            [{t.id}] {t.name} (瀹屾垚鏃堕棿: {t.endTime || t.createdAt})
                          </option>
                        ))
                      }
                    </select>
                  ) : (
                    <div className="p-3 bg-amber-50/50 border border-amber-100 text-amber-700 text-xs font-bold rounded-lg flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>鏆傛棤宸插畬鎴愮殑 DICOM 褰卞儚鏁版嵁浠诲姟銆傝绛夊€欑幇鏈変换鍔℃墽琛屽畬姣曟垨鍙戣捣鏂颁换鍔°€?/span>
                    </div>
                  )}
                </div>

                {/* Guidance Helper */}
                <div className="text-[11px] text-slate-500 font-bold leading-relaxed bg-slate-50 p-3 rounded border border-slate-200/55 flex items-start space-x-2">
                  <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    绯荤粺鏀寔鍙€夋嫨涓€涓被鍨嬶紝涔熷彲浠ラ€夋嫨涓や釜绫诲瀷銆傛瘡涓被鍨嬪彧鑳介€夋嫨涓€涓凡瀹屾垚鐘舵€佺殑浠诲姟銆?                    鐐瑰嚮鈥滅‘璁ゅ苟璁＄畻鈥濆悗锛岀郴缁熷皢鑷姩杩涜澶氭ā鎬佺瓑浠风被鑱氬悎鍒嗘瀽锛岃緭鍑烘渶缁堝悎瑙勭殑瀹為檯k鍊煎苟鍥哄寲璁板綍銆?                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsKCalcModalOpen(false)}
                    className="px-5 py-2.5 rounded border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 uppercase tracking-wider transition-colors bg-white cursor-pointer"
                  >
                    鍙栨秷
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedCsvTaskIdForK && !selectedDicomTaskIdForK}
                    className={`px-6 py-2.5 rounded text-white text-xs font-black uppercase tracking-wider shadow-md transition-all border-0 ${
                      (!selectedCsvTaskIdForK && !selectedDicomTaskIdForK)
                        ? 'bg-slate-300 cursor-not-allowed shadow-none'
                        : 'bg-purple-600 hover:bg-purple-700 cursor-pointer shadow-purple-100'
                    }`}
                  >
                    纭骞惰绠?                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 2: NUMERICAL INTERVAL PROMPT ================= */}
      {intervalPromptField && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-scale-up text-left">
            <div className="flex items-center space-x-2 text-slate-800 font-black text-sm">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
              <span>杈撳叆缁熻闂撮殧 - {intervalPromptField.name}</span>
            </div>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">
              瀵规暟鍊煎瀷瀛楁锛坽intervalPromptField.name}锛夎繘琛屽幓鏍囪瘑鍖栧尯闂村垎妗剁粺璁★紝璇疯緭鍏ユ偍鐨勬暟鍊煎尯闂撮棿闅旓紙姝ラ暱锛夛細
            </p>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase mb-1">缁熻闂撮殧 (姝ラ暱)</label>
              <input 
                type="number" 
                value={tempInterval} 
                onChange={(e) => setTempInterval(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-sm font-black p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
                placeholder="渚嬪锛? 鎴?10"
              />
            </div>
            <div className="flex justify-end space-x-2 text-xs">
              <button 
                onClick={() => setIntervalPromptField(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-lg cursor-pointer transition-colors border-0"
              >
                鍙栨秷
              </button>
              <button 
                onClick={() => {
                  const fieldId = intervalPromptField.id;
                  handleStartExecution(fieldId, intervalPromptField.name, 'num', intervalPromptField.isDicom, tempInterval);
                  setIntervalPromptField(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg cursor-pointer transition-colors border-0"
              >
                纭骞舵墽琛?              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: STATS POPUP DISTRIBUTION ================= */}
      {statsViewField && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] animate-fade-in" id="stats_view_modal">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-scale-up text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">鎺㈡煡鍘绘爣璇嗙粺璁＄粨鏋?/h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    瀛楁: {statsViewField.name} ({statsViewField.isDicom ? 'DICOM TAG' : 'CSV 瀛楁'})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setStatsViewField(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-black text-slate-500">
                <span>{statsViewField.fieldType === 'text' ? '瀛楁鍘绘爣璇嗛鏁板垎鍙?(鐢遍珮鍒颁綆)' : `鏁板€煎垎甯冨尯闂?(鎸夋闀?${statsViewField.interval || 10} 缁熻)`}</span>
                <span>鏍锋湰棰戞暟 / 棰戠巼 (鏍锋湰閲? 1000)</span>
              </div>

              <div className="max-h-60 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
                {getFieldStatistics(
                  statsViewField.id,
                  statsViewField.name,
                  statsViewField.fieldType,
                  statsViewField.interval
                ).map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="font-mono">{item.value}</span>
                      <span className="font-mono text-slate-600">
                        {item.count}娆?<span className="text-slate-400 font-bold ml-1.5">({item.pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button 
                onClick={() => setStatsViewField(null)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl cursor-pointer transition-colors border-0"
              >
                鍏抽棴
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NEW MODAL: ANONYMIZATION RULES (鏌ョ湅) ================= */}
      {viewingRuleRow && (() => {
        const mockRecordDoc = {
          hospital: "涓婃捣浜ら€氬ぇ瀛﹀尰瀛﹂櫌闄勫睘鐟為噾鍖婚櫌",
          title: "鐢靛瓙鐥呭巻闂ㄨ瘖璇婄枟璁板綍",
          name: "鈻犫枲鈻犫枲 (宸查伄钄?",
          gender: "鐢?,
          age: "45宀?,
          id: "鈻犫枲鈻犫枲鈻犫枲鈻犫枲 (宸查伄钄?",
          date: "2026-07-14",
          dept: "蹇冭绠″唴绉?,
          items: [
            { label: "涓昏瘔", value: "鍙嶅鑳搁椃銆佹皵淇?鍛紝鍔犻噸2澶╋紝浼村闂撮樀鍙戞€у懠鍚稿洶闅俱€? },
            { label: "鐜扮梾鍙?, value: "鎮ｈ€呬簬2鍛ㄥ墠鏃犳槑鏄捐鍥犲嚭鐜拌兏闂枫€佹皵淇冿紝娲诲姩鍚庢槑鏄撅紝浼戞伅鍚庡彲绋嶇紦瑙ｃ€?澶╁墠涓婅堪鐥囩姸鏄庢樉鍔犻噸锛屼即鍜冲椊銆佺矇绾㈣壊娉℃搏鏍风棸锛屽闂存棤娉曞钩鍗с€? },
            { label: "鏃㈠線鍙?, value: "楂樿鍘嬬梾鍙?0骞达紝鏈€楂樻敹缂╁帇杈?80mmHg锛岃寰嬫湇鐢ㄩ檷鍘嬭嵂锛涙棤绯栧翱鐥呭強鍐犲績鐥呭彶銆? },
            { label: "浣撴牸妫€鏌?, value: "浣撴俯 36.8鈩冿紝鑴夋悘 102娆?鍒嗭紝鍛煎惛 24娆?鍒嗭紝琛€鍘?156/92 mmHg銆傚弻鑲哄簳鍙椈鍙婃箍鎬у暟闊炽€? },
            { label: "璇婃柇鎰忚", value: "1. 鎱㈡€у績鍔涜“绔€ユ€у姞閲嶏紱 2. 楂樿鍘嬬梾3绾э紙鏋侀珮鍗憋級銆? }
          ],
          doctor: "鈻犫枲鈻?(宸查伄钄?"
        };

        const mockOrderDoc = {
          hospital: "涓婃捣浜ら€氬ぇ瀛﹀尰瀛﹂櫌闄勫睘鐟為噾鍖婚櫌",
          title: "涓村簥闂ㄨ瘖澶勬柟绗?(瑗胯嵂鎴?",
          name: "鈻犫枲鈻犫枲 (宸查伄钄?",
          gender: "濂?,
          age: "62宀?,
          id: "鈻犫枲鈻犫枲鈻犫枲鈻犫枲 (宸查伄钄?",
          date: "2026-07-14",
          dept: "绁炵粡鍐呯",
          orders: [
            { name: "1. 鐩愰吀澶氬鍝岄綈鐗?(Donepezil Hydrochloride Tablets)", spec: "5mg * 14鐗?/鐩?, usage: "Sig: 涓€娆?鐗囷紝涓€鏃?娆★紝鐫″墠鍙ｆ湇 (鏀瑰杽璁ょ煡鍔熻兘)" },
            { name: "2. 鑳炵７鑳嗙⒈閽犺兌鍥?(Citicoline Sodium Capsules)", spec: "0.1g * 24绮?/鐩?, usage: "Sig: 涓€娆?绮掞紝涓€鏃?娆★紝鍙ｆ湇 (钀ュ吇鑴戠缁?" },
            { name: "3. 閾舵潖鍙舵彁鍙栫墿鐗?(Ginkgo Biloba Extract Tablets)", spec: "40mg * 30鐗?/鐩?, usage: "Sig: 涓€娆?鐗囷紝涓€鏃?娆★紝楗悗鍙ｆ湇 (淇冭繘鑴戦儴寰幆)" }
          ],
          totalPrice: "锟?58.40",
          doctor: "鈻犫枲鈻?(宸查伄钄?"
        };

        let fields: any[] = [];
        if (viewingRuleRow.modality === "CSV鏂囨湰鏁版嵁" || viewingRuleRow.modality === "CSV") {
          if (viewingRuleRow.category === "浣忛櫌淇℃伅") {
            fields = [
              {
                name: "鎮ｈ€呯紪鍙?,
                fieldName: "patientId",
                fieldType: "text",
                attr: "鐩存帴鏍囪瘑绗?,
                tech: "鍋囧悕鍖?鍏ㄥ眬)",
                param: "鏈」鐩笅鍚屼竴涓偅鑰呯殑澶氭ā鎬佹暟鎹伒寰悓涓€涓嶅彲閫嗗姞瀵嗚鍒?,
                desc: "閲囩敤涓嶅彲閫嗗姞瀵嗙畻娉曪紝鐢熸垚16浣嶅搱甯屽€?,
                canStat: false,
                isKCalculated: "鍚?,
                splitField: ""
              },
              {
                name: "鎮ｈ€呭鍚?,
                fieldName: "name",
                fieldType: "text",
                attr: "鐩存帴鏍囪瘑绗?,
                tech: "灞炴€у垹闄?,
                param: "缃┖",
                desc: "缃┖",
                canStat: false,
                isKCalculated: "鍚?,
                splitField: "鎮ｈ€呭鍚?
              },
              {
                name: "鎬у埆",
                fieldName: "gender",
                fieldType: "text",
                attr: "鍑嗘爣璇嗙",
                tech: "淇濈暀鍘熷€?,
                param: "-",
                desc: "涓嶆秹鍙婃晱鎰熼殣绉侊紝鐩存帴淇濈暀鍘熸枃銆?,
                canStat: true,
                isKCalculated: "鍚?,
                splitField: "鎬у埆"
              },
              {
                name: "灏辫瘖骞撮緞",
                fieldName: "age",
                fieldType: "num",
                attr: "鍑嗘爣璇嗙",
                tech: "娉涘寲",
                param: "宸查厤缃?3 涓槧灏?,
                desc: "闈掑勾锛?8-29锛屼腑骞达細30-59锛岃€佸勾锛?0-100 2銆?0宀佸強浠ヤ笂",
                canStat: true,
                isKCalculated: "鏄?,
                splitField: "灏辫瘖骞撮緞",
                isAgeMapping: true
              },
              {
                name: "灏辫瘖鏃ユ湡",
                fieldName: "admissionDate",
                fieldType: "date",
                attr: "鍑嗘爣璇嗙",
                tech: "鎵板姩(鍏ㄥ眬)",
                param: "鏈」鐩笅鍚屼竴涓偅鑰呯殑澶氭ā鎬佹暟鎹伒寰悓涓€瑙勫垯锛屾壈鍔ㄥ弬鏁?14 ~ 14澶?,
                desc: "XXXX骞碭X鏈圶X鏃ワ紝鏃跺垎绉掍笉淇濈暀锛屽悜鍓?鍚庡亸绉荤壒瀹氬ぉ鏁帮紝淇濇寔鍚屼竴鎮ｈ€呯殑鎵€鏈夋棩鏈熺被瀛楁鍋忕Щ閲忎竴鑷达紝涓嶅悓鎮ｈ€呯殑鍋忕Щ閲忎笉涓€鑷?,
                canStat: false,
                isKCalculated: "鍚?,
                splitField: ""
              }
            ];
          } else if (viewingRuleRow.category === "妫€鏌ヤ俊鎭?) {
            fields = [
              {
                name: "鎮ｈ€呯紪鍙?,
                fieldName: "patientId",
                fieldType: "text",
                attr: "鐩存帴鏍囪瘑绗?,
                tech: "鍋囧悕鍖?鍏ㄥ眬)",
                param: "鏈」鐩笅鍚屼竴涓偅鑰呯殑澶氭ā鎬佹暟鎹伒寰悓涓€涓嶅彲閫嗗姞瀵嗚鍒?,
                desc: "閲囩敤涓嶅彲閫嗗姞瀵嗙畻娉曪紝鐢熸垚16浣嶅搱甯屽€硷紱涓庘€滀綇闄俊鎭€濅腑鐨勬偅鑰呯紪鍙蜂繚鎸佷竴鑷?,
                canStat: false,
                isKCalculated: "鍚?,
                splitField: ""
              },
              {
                name: "妫€鏌ュ悕绉?,
                fieldName: "checkName",
                fieldType: "text",
                attr: "鏁忔劅灞炴€?,
                tech: "淇濈暀鍘熷€?,
                param: "-",
                desc: "渚嬪 涓婅吂閮ㄧ鍏辨尟澧炲己鎴愬儚",
                canStat: false,
                isKCalculated: "鍚?,
                splitField: ""
              },
              {
                name: "妫€鏌ユ椂闂?,
                fieldName: "checkTime",
                fieldType: "date",
                attr: "鍑嗘爣璇嗙",
                tech: "鎵板姩(鍏ㄥ眬)",
                param: "鏈」鐩笅鍚屼竴涓偅鑰呯殑澶氭ā鎬佹暟鎹伒寰悓涓€瑙勫垯锛屾壈鍔ㄥ弬鏁?14 ~ 14澶?,
                desc: "XXXX骞碭X鏈圶X鏃ワ紝鏃跺垎绉掍笉淇濈暀锛屽悜鍓?鍚庡亸绉荤壒瀹氬ぉ鏁帮紝淇濇寔鍚屼竴鎮ｈ€呯殑鎵€鏈夋棩鏈熺被瀛楁鍋忕Щ閲忎竴鑷达紝涓嶅悓鎮ｈ€呯殑鍋忕Щ閲忎笉涓€鑷?,
                canStat: false,
                isKCalculated: "鍚?,
                splitField: ""
              }
            ];
          } else {
            // 妫€楠屼俊鎭?            fields = [
              {
                name: "鎮ｈ€呯紪鍙?,
                fieldName: "patientId",
                fieldType: "text",
                attr: "鐩存帴鏍囪瘑绗?,
                tech: "鍋囧悕鍖?鍏ㄥ眬)",
                param: "鏈」鐩笅鍚屼竴涓偅鑰呯殑澶氭ā鎬佹暟鎹伒寰悓涓€涓嶅彲閫嗗姞瀵嗚鍒?,
                desc: "閲囩敤涓嶅彲閫嗗姞瀵嗙畻娉曪紝鐢熸垚16浣嶅搱甯屽€硷紱涓庘€滀綇闄俊鎭€濅腑鐨勬偅鑰呯紪鍙蜂繚鎸佷竴鑷?,
                canStat: false,
                isKCalculated: "鍚?,
                splitField: ""
              },
              {
                name: "妫€楠屽悕绉?,
                fieldName: "testName",
                fieldType: "text",
                attr: "鏁忔劅灞炴€?,
                tech: "淇濈暀鍘熷€?,
                param: "-",
                desc: "渚嬪 鑲濆姛鑳?,
                canStat: false,
                isKCalculated: "鍚?,
                splitField: ""
              },
              {
                name: "妫€楠屾椂闂?,
                fieldName: "testTime",
                fieldType: "date",
                attr: "鍑嗘爣璇嗙",
                tech: "鎵板姩(鍏ㄥ眬)",
                param: "鏈」鐩笅鍚屼竴涓偅鑰呯殑澶氭ā鎬佹暟鎹伒寰悓涓€瑙勫垯锛屾壈鍔ㄥ弬鏁?14 ~ 14澶?,
                desc: "XXXX骞碭X鏈圶X鏃ワ紝鏃跺垎绉掍笉淇濈暀锛屽悜鍓?鍚庡亸绉荤壒瀹氬ぉ鏁帮紝淇濇寔鍚屼竴鎮ｈ€呯殑鎵€鏈夋棩鏈熺被瀛楁鍋忕Щ閲忎竴鑷达紝涓嶅悓鎮ｈ€呯殑鍋忕Щ閲忎笉涓€鑷?,
                canStat: false,
                isKCalculated: "鍚?,
                splitField: ""
              }
            ];
          }
        } else if (viewingRuleRow.modality === "DICOM褰卞儚鏁版嵁" || viewingRuleRow.modality === "DICOM") {
          fields = [
            {
              tag: "(0008,0008)",
              name: "ImageType",
              attr: "鏁忔劅灞炴€?,
              tech: "淇濈暀鍘熷€?,
              param: "-",
              desc: "鏆傛棤璇存槑",
              isKCalculated: "鍚?,
              canStat: false,
              fieldName: "imageType",
              fieldType: "text"
            },
            {
              tag: "(0010,0020)",
              name: "Patient ID",
              attr: "鐩存帴鏍囪瘑绗?,
              tech: "鍋囧悕鍖?鍏ㄥ眬)",
              param: "鏈」鐩笅鍚屼竴涓偅鑰呯殑澶氭ā鎬佹暟鎹伒寰悓涓€涓嶅彲閫嗗姞瀵嗚鍒?,
              desc: "閲囩敤涓嶅彲閫嗗姞瀵嗙畻娉曪紝鐢熸垚16浣嶅搱甯屽€硷紱涓庘€滀綇闄俊鎭€濅腑鐨勬偅鑰呮爣璇嗗彿淇濇寔涓€鑷?,
              isKCalculated: "鍚?,
              canStat: false,
              fieldName: "patientId",
              fieldType: "text"
            },
            {
              tag: "(0008,0030)",
              name: "PatientName",
              attr: "鐩存帴鏍囪瘑绗?,
              tech: "鍋囧悕鍖?,
              param: "uid涓€鑷存€ф浛鎹?,
              desc: "缁熶竴鏇存敼涓衡€淎NONYMIZED鈥?,
              isKCalculated: "鍚?,
              canStat: false,
              fieldName: "patientName",
              fieldType: "text"
            },
            {
              tag: "(0008,0020)",
              name: "StudyDate",
              attr: "鍑嗘爣璇嗙",
              tech: "鎵板姩(鍏ㄥ眬)",
              param: "鏈」鐩笅鍚屼竴涓偅鑰呯殑澶氭ā鎬佹暟鎹伒寰悓涓€瑙勫垯锛屾壈鍔ㄥ弬鏁?14 ~ 14澶?,
              desc: "XXXX骞碭X鏈圶X鏃ワ紝鏃跺垎绉掍笉淇濈暀锛屽悜鍓?鍚庡亸绉荤壒瀹氬ぉ鏁帮紝淇濇寔鍚屼竴鎮ｈ€呯殑鎵€鏈夋棩鏈熺被瀛楁鍋忕Щ閲忎竴鑷达紝涓嶅悓鎮ｈ€呯殑鍋忕Щ閲忎笉涓€鑷?,
              isKCalculated: "鍚?,
              canStat: true,
              fieldName: "studyDate",
              fieldType: "text",
              isDicomStats: true
            }
          ];
        }

        const isStructured = viewingRuleRow.modality === "CSV鏂囨湰鏁版嵁" || viewingRuleRow.modality === "DICOM褰卞儚鏁版嵁" || viewingRuleRow.modality === "CSV" || viewingRuleRow.modality === "DICOM";

        return (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="view_rules_modal">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-300 max-w-5xl w-full overflow-hidden animate-scale-up flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider">
                      鍖垮悕鍖栫瓥鐣?{viewingRuleRow.modality}{viewingRuleRow.category && viewingRuleRow.category !== '-' ? `-${viewingRuleRow.category}` : ''}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingRuleRow(null)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-left flex-1">
                {isStructured ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 animate-fade-in">
                    <table className="w-full text-left border-collapse text-xs">
                      {viewingRuleRow.modality === "DICOM褰卞儚鏁版嵁" || viewingRuleRow.modality === "DICOM" ? (
                        <>
                          <thead>
                            <tr className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                              <th className="py-3 px-4">TAG</th>
                              <th className="py-3 px-4">鏁版嵁瀛楁</th>
                              <th className="py-3 px-4 text-center">鏁版嵁灞炴€?/th>
                              <th className="py-3 px-4">鍖垮悕鍖栨妧鏈?/th>
                              <th className="py-3 px-4">鍙傛暟</th>
                              <th className="py-3 px-4">璇存槑</th>
                              <th className="py-3 px-4 text-center">鏄惁绾冲叆K鍊艰绠?/th>
                              <th className="py-3 px-4 text-center">鎿嶄綔</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-normal text-slate-700 bg-white">
                            {fields.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/20 font-normal">
                                {/* TAG */}
                                <td className="py-3.5 px-4 font-mono text-xs text-slate-700 text-left font-normal">
                                  {item.tag}
                                </td>

                                {/* 鏁版嵁瀛楁 */}
                                <td className="py-3.5 px-4 text-xs text-slate-700 text-left font-normal">
                                  {item.name}
                                </td>

                                {/* 鏁版嵁灞炴€?*/}
                                <td className="py-3.5 px-4 text-xs text-slate-700 text-center font-normal">
                                  {item.attr}
                                </td>

                                {/* 鍖垮悕鍖栫瓥鐣?/ 鍖垮悕鍖栨妧鏈?*/}
                                <td className="py-3.5 px-4 text-xs text-slate-700 text-left font-normal">
                                  {item.tech}
                                </td>

                                {/* 鍙傛暟 */}
                                <td className="py-3.5 px-4 text-xs text-slate-700 text-left leading-relaxed font-normal">
                                  {item.param || "-"}
                                </td>

                                {/* 璇存槑 */}
                                <td className="py-3.5 px-4 text-xs text-slate-700 text-left leading-relaxed max-w-[200px] font-normal">
                                  {item.desc || "-"}
                                </td>

                                {/* 鏄惁绾冲叆K鍊艰绠?*/}
                                <td className="py-3.5 px-4 text-center text-xs text-slate-700 font-normal">
                                  {item.isKCalculated || "鍚?}
                                </td>

                                {/* 鎿嶄綔 */}
                                <td className="py-3.5 px-4 text-center">
                                  {item.isKCalculated === "鏄? ? (
                                    <div className="flex justify-center">
                                      <button
                                        onClick={() => {
                                          setKCalculatedStatsPage(1);
                                          setViewingKCalculatedStats(getFieldStatsData(item.fieldName, item.name));
                                        }}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] rounded shadow-2xs transition-colors cursor-pointer border-0 font-normal"
                                      >
                                        <span>鏌ョ湅缁熻</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 font-normal">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      ) : (
                        <>
                          <thead>
                            <tr className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                              <th className="py-3 px-4">鏁版嵁瀛楁</th>
                              {viewingRuleRow.category === "浣忛櫌淇℃伅" && (
                                <th className="py-3 px-4">鏁版嵁鏍囩</th>
                              )}
                              <th className="py-3 px-4 text-center">鏁版嵁灞炴€?/th>
                              <th className="py-3 px-4">鍖垮悕鍖栫瓥鐣?/th>
                              <th className="py-3 px-4">鍙傛暟</th>
                              <th className="py-3 px-4">璇存槑</th>
                              <th className="py-3 px-4 text-center">鏄惁绾冲叆K鍊艰绠?/th>
                              <th className="py-3 px-4 text-center">鎿嶄綔</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-normal text-slate-700 bg-white">
                            {fields.map((item, idx) => {
                              const isAdmission = viewingRuleRow.category === "浣忛櫌淇℃伅";
                              let shouldRenderFieldCell = true;
                              let fieldCellRowSpan = 1;
                              let fieldCellText = item.name;

                              if (isAdmission) {
                                if (idx === 1) {
                                  shouldRenderFieldCell = true;
                                  fieldCellRowSpan = 3;
                                  fieldCellText = "璁板綍鍐呭";
                                } else if (idx === 2 || idx === 3) {
                                  shouldRenderFieldCell = false;
                                }
                              }

                              return (
                                <tr key={idx} className="hover:bg-slate-50/20 font-normal">
                                  {/* 鏁版嵁瀛楁 */}
                                  {shouldRenderFieldCell && (
                                    <td className="py-3.5 px-4 text-xs text-slate-700 text-left font-normal" rowSpan={fieldCellRowSpan}>
                                      {fieldCellText}
                                    </td>
                                  )}

                                  {/* 鏁版嵁鏍囩 */}
                                  {isAdmission && (
                                    <td className="py-3.5 px-4 text-xs text-slate-700 text-left font-normal">
                                      {item.splitField || "-"}
                                    </td>
                                  )}

                                  {/* 鏁版嵁灞炴€?*/}
                                  <td className="py-3.5 px-4 text-center text-xs text-slate-700 font-normal">
                                    {item.attr}
                                  </td>

                                  {/* 鍖垮悕鍖栫瓥鐣?/ 鍖垮悕鍖栨妧鏈?*/}
                                  <td className="py-3.5 px-4 text-xs text-slate-700 text-left font-normal">
                                    {item.tech}
                                  </td>

                                  {/* 鍙傛暟 */}
                                  <td className="py-3.5 px-4 text-xs text-slate-700 text-left leading-relaxed font-normal">
                                    {item.isAgeMapping ? (
                                      <div className="flex items-center space-x-1.5 font-normal">
                                        <span>宸查厤缃?3 涓槧灏?/span>
                                        <button 
                                          onClick={() => setShowReadOnlyMapping(true)}
                                          className="text-blue-600 hover:text-blue-800 underline font-normal cursor-pointer bg-transparent border-0 p-0 text-xs"
                                        >
                                          鏌ョ湅
                                        </button>
                                      </div>
                                    ) : (
                                      item.param || "-"
                                    )}
                                  </td>

                                  {/* 璇存槑 */}
                                  <td className="py-3.5 px-4 text-xs text-slate-700 text-left leading-relaxed max-w-[200px] font-normal">
                                    {item.desc || "-"}
                                  </td>

                                  {/* 鏄惁绾冲叆K鍊艰绠?*/}
                                  <td className="py-3.5 px-4 text-center text-xs text-slate-700 font-normal">
                                    {item.isKCalculated || "鍚?}
                                  </td>

                                  {/* 鎿嶄綔 */}
                                  <td className="py-3.5 px-4 text-center">
                                    {item.isKCalculated === "鏄? ? (
                                      <div className="flex justify-center">
                                        <button
                                          onClick={() => {
                                            setKCalculatedStatsPage(1);
                                            setViewingKCalculatedStats(getFieldStatsData(item.fieldName, item.name));
                                          }}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] rounded shadow-2xs transition-colors cursor-pointer border-0 font-normal"
                                        >
                                          <span>鏌ョ湅缁熻</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 font-normal">-</span>
                                    )}
                                  </td>
                                </tr>
                              )})}
                          </tbody>
                        </>
                      )}
                    </table>
                  </div>
                ) : (
                  /* Image Masking View */
                  (() => {
                    const doc = viewingRuleRow.category === "闂ㄨ瘖灏辫瘖璁板綍" ? mockRecordDoc : mockOrderDoc;
                    return (
                      <div className="flex justify-center w-full">
                        {/* EHR Document layout simulating the redacted result */}
                        <div className="w-full bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 flex justify-center">
                          <div className="bg-white border-2 border-slate-900 p-6 w-full max-w-lg rounded-sm shadow-md font-sans text-left relative overflow-hidden">
                            {/* Watermark/Redaction overlay legend */}
                            <div className="absolute right-0 top-0 translate-x-8 translate-y-2 rotate-45 bg-rose-600 text-white text-[8px] font-black uppercase tracking-widest px-6 py-1 z-30 select-none shadow-xs text-center border border-white">
                              De-Identified
                            </div>

                            {/* Title */}
                            <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                              <h4 className="text-xs font-black text-slate-900 tracking-wider uppercase">{doc.hospital}</h4>
                              <h2 className="text-xl font-black text-slate-900 tracking-widest mt-1 uppercase">{doc.title}</h2>
                              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 font-mono">Clinical EHR Template (Secured)</div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-3 gap-2.5 text-[11px] border border-slate-200 p-3 rounded bg-slate-50/70 mb-4 font-bold">
                              <div><span className="text-slate-400">鎮ｈ€呭鍚?</span> <span className="bg-slate-950 text-slate-950 select-none px-4 py-0.5 rounded ml-1 text-[9px] font-mono">鈻犫枲鈻?/span></div>
                              <div><span className="text-slate-400">鎮ｈ€呮€у埆:</span> <span className="text-slate-900">{doc.gender}</span></div>
                              <div><span className="text-slate-400">鎮ｈ€呭勾榫?</span> <span className="text-slate-900">{doc.age}</span></div>
                              <div className="col-span-2"><span className="text-slate-400">娴佹按/鐥呭巻鍙?</span> <span className="bg-slate-950 text-slate-950 select-none px-8 py-0.5 rounded ml-1 text-[9px] font-mono">鈻犫枲鈻犫枲鈻犫枲鈻?/span></div>
                              <div><span className="text-slate-400">灏辫瘖绉戝:</span> <span className="text-slate-900">{doc.dept}</span></div>
                            </div>

                            {/* Content Details */}
                            {"items" in doc ? (
                              <div className="space-y-3.5 text-xs">
                                {(doc.items as any[]).map((item, index) => (
                                  <div key={index} className="space-y-1">
                                    <h5 className="font-black text-slate-900 border-l-4 border-blue-600 pl-2 text-[10px] uppercase tracking-wide">{item.label}</h5>
                                    <p className="text-slate-600 leading-relaxed pl-3 font-semibold text-justify text-[11px]">{item.value}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-3.5 text-xs">
                                <h5 className="font-black text-slate-900 border-l-4 border-emerald-600 pl-2 text-[10px] uppercase tracking-wide">澶勬柟鍖诲槺椤圭洰鏄庣粏</h5>
                                <div className="border border-slate-300 rounded overflow-hidden bg-white">
                                  <table className="w-full text-left border-collapse text-[10px]">
                                    <thead>
                                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-black">
                                        <th className="p-2 w-2/3">鑽搧/璇婄枟椤圭洰鍚嶇О</th>
                                        <th className="p-2 w-1/3">瑙勬牸/鐢ㄨ嵂鎸囧</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {(doc.orders as any[]).map((ord, index) => (
                                        <tr key={index} className="hover:bg-slate-50/50">
                                          <td className="p-2 font-bold text-slate-800">{ord.name}</td>
                                          <td className="p-2">
                                            <span className="block font-bold text-slate-900">{ord.spec}</span>
                                            <span className="block text-[8px] text-slate-400 font-bold mt-0.5">{ord.usage}</span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="flex justify-end font-black text-xs text-slate-900 pr-1">
                                  <span>鍖诲槺鎬昏垂鐢? <span className="text-red-600 font-mono text-xs ml-1">{(doc as any).totalPrice}</span></span>
                                </div>
                              </div>
                            )}

                            {/* Footer */}
                            <div className="border-t border-slate-200 pt-3 mt-5 flex items-center justify-between text-[11px]">
                              <div>
                                <span className="text-slate-400 font-bold">璐ｄ换浜烘牳绛?</span>
                                <span className="bg-slate-950 text-slate-950 select-none px-6 py-0.5 rounded ml-1.5 text-[9px] font-mono">鈻犫枲鈻?/span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="relative w-11 h-11 rounded-full border border-red-500/25 flex items-center justify-center text-red-500/25 text-[8px] font-black uppercase rotate-12 select-none">
                                  <span className="text-center leading-2">鑴辨晱瀹℃牳<br/>鐢靛瓙绛惧悕</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Footer buttons */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
                <button 
                  onClick={() => setViewingRuleRow(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl cursor-pointer transition-colors border-0"
                >
                  鍏抽棴
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= NEW MODAL: DIMENSION STATISTICS (澶氱淮搴﹀幓鏍囪瘑鍖栨墽琛岀粺璁? ================= */}
      {dimensionStatsModal && (() => {
        let rows: any[] = [];
        if (dimensionStatsModal.modality === "DICOM褰卞儚鏁版嵁") {
          rows = [
            { dim: "鎮ｈ€?, total: "245", success: "240", failure: "5" },
            { dim: "灏辫瘖", total: "450", success: "440", failure: "10" },
            { dim: "鏂囦欢", total: "8,677", success: "8,627", failure: "50" }
          ];
        } else if (dimensionStatsModal.modality === "鍥剧墖鏁版嵁") {
          if (dimensionStatsModal.category === "闂ㄨ瘖灏辫瘖璁板綍") {
            rows = [
              { dim: "鎮ｈ€?, total: "120", success: "115", failure: "5" },
              { dim: "灏辫瘖", total: "180", success: "170", failure: "10" },
              { dim: "鏂囦欢", total: "1,348", success: "1,325", failure: "23" }
            ];
          } else {
            rows = [
              { dim: "鎮ｈ€?, total: "210", success: "210", failure: "0" },
              { dim: "灏辫瘖", total: "350", success: "350", failure: "0" },
              { dim: "鏂囦欢", total: "2,348", success: "2,348", failure: "0" }
            ];
          }
        } else if (dimensionStatsModal.modality === "CSV鏂囨湰鏁版嵁" || dimensionStatsModal.modality === "CSV") {
          if (dimensionStatsModal.category === "浣忛櫌淇℃伅") {
            rows = [
              { dim: "鎮ｈ€?, total: "800", success: "780", failure: "20" },
              { dim: "灏辫瘖", total: "1,200", success: "1,180", failure: "20" },
              { dim: "璁板綍", total: "5,400", success: "5,350", failure: "50" }
            ];
          } else if (dimensionStatsModal.category === "妫€鏌ヤ俊鎭?) {
            rows = [
              { dim: "鎮ｈ€?, total: "600", success: "590", failure: "10" },
              { dim: "灏辫瘖", total: "900", success: "885", failure: "15" },
              { dim: "璁板綍", total: "3,200", success: "3,180", failure: "20" }
            ];
          } else {
            rows = [
              { dim: "鎮ｈ€?, total: "750", success: "740", failure: "10" },
              { dim: "灏辫瘖", total: "1,100", success: "1,090", failure: "10" },
              { dim: "璁板綍", total: "4,800", success: "4,750", failure: "50" }
            ];
          }
        }

        const isMediaStats = dimensionStatsModal.modality === "DICOM褰卞儚鏁版嵁" || dimensionStatsModal.modality === "鍥剧墖鏁版嵁";

        return (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="dimension_stats_modal">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-300 max-w-xl w-full overflow-hidden animate-scale-up">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart2 className="w-5 h-5 text-blue-400" />
                  <h3 className="font-black text-sm uppercase tracking-wider">
                    {isMediaStats ? `${dimensionStatsModal.modality}-${dimensionStatsModal.category}` : "澶氱淮搴﹀幓鏍囪瘑鍖栨墽琛岀粺璁?}
                  </h3>
                </div>
                <button 
                  onClick={() => setDimensionStatsModal(null)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 text-left">
                {!isMediaStats && (
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest block">褰撳墠鍒嗙被鎯呭喌</span>
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">
                      {dimensionStatsModal.modality} &middot; {dimensionStatsModal.category}
                    </span>
                  </div>
                )}

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-5">缁熻缁村害</th>
                        <th className="py-3 px-4 text-center">鎬绘暟</th>
                        <th className="py-3 px-4 text-center">鎴愬姛鏁?/th>
                        <th className="py-3 px-4 text-center">澶辫触鏁?/th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                      {rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-5 text-slate-900 font-black">{row.dim}</td>
                          <td className="py-3.5 px-4 text-center font-mono text-slate-600">{row.total}</td>
                          <td className="py-3.5 px-4 text-center font-mono text-emerald-600">{row.success}</td>
                          <td className={`py-3.5 px-4 text-center font-mono ${parseInt(row.failure) > 0 ? "text-rose-600 font-black" : "text-slate-400"}`}>
                            {row.failure}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button 
                  onClick={() => setDimensionStatsModal(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl cursor-pointer transition-colors border-0"
                >
                  鍏抽棴
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= NEW MODAL: FAILURE DETAILS (鍘绘爣璇嗕换鍔″け璐ヨ鎯呮姤鍛? ================= */}
      {failureDetailsModal && (() => {
        let reasons: any[] = [];
        let errorsForReason: { [reasonIndex: number]: string[] } = {};

        const modality = failureDetailsModal.modality;
        const category = failureDetailsModal.category;

        if (modality === "DICOM褰卞儚鏁版嵁") {
          reasons = [
            { text: "鍥惧儚鍐呮枃瀛楃儳褰曞尯鍩烵CR涓庤劚鏁忚秴鏃?, count: "35", pct: 70 },
            { text: "鍥惧儚鍒囩墖鍏冩暟鎹?Metadata)鎹熷潖鏃犳硶閲嶅啓", count: "15", pct: 30 }
          ];
          errorsForReason = {
            0: [
              "DCM_SOP_982103_01", "DCM_SOP_982103_02", "DCM_SOP_982103_03", "DCM_SOP_982103_04", "DCM_SOP_982103_05",
              "DCM_SOP_982103_06", "DCM_SOP_982103_07", "DCM_SOP_982103_08", "DCM_SOP_982103_09", "DCM_SOP_982103_10"
            ],
            1: [
              "DCM_ERR_META_01", "DCM_ERR_META_02", "DCM_ERR_META_03", "DCM_ERR_META_04", "DCM_ERR_META_05",
              "DCM_ERR_META_06", "DCM_ERR_META_07", "DCM_ERR_META_08", "DCM_ERR_META_09", "DCM_ERR_META_10"
            ]
          };
        } else if (modality === "鍥剧墖鏁版嵁") {
          reasons = [
            { text: "鎵嬪啓鏁忔劅浣撳緛鍖哄煙鑷姩瀹氫綅澶辫触", count: "15", pct: 65 },
            { text: "绾稿紶鎵弿鍙嶅厜/閲嶅害鐣稿彉瀵艰嚧OCR閲嶈瘯瓒呴檺", count: "8", pct: 35 }
          ];
          errorsForReason = {
            0: [
              "IMG_REC_ERR_0101", "IMG_REC_ERR_0102", "IMG_REC_ERR_0103", "IMG_REC_ERR_0104", "IMG_REC_ERR_0105",
              "IMG_REC_ERR_0106", "IMG_REC_ERR_0107", "IMG_REC_ERR_0108", "IMG_REC_ERR_0109", "IMG_REC_ERR_0110"
            ],
            1: [
              "IMG_ERR_REFLECT_01", "IMG_ERR_REFLECT_02", "IMG_ERR_REFLECT_03", "IMG_ERR_REFLECT_04", "IMG_ERR_REFLECT_05",
              "IMG_ERR_REFLECT_06", "IMG_ERR_REFLECT_07", "IMG_ERR_REFLECT_08", "IMG_ERR_REFLECT_09", "IMG_ERR_REFLECT_10"
            ]
          };
        } else { // CSV鏂囨湰鏁版嵁 / CSV
          if (category === "浣忛櫌淇℃伅") {
            reasons = [
              { text: "瀛楁鏍煎紡鏍￠獙澶辫触 (韬唤璇侀潪鏍囧噯18浣?", count: "8", pct: 67 },
              { text: "浣忛櫌鍙?灏辫瘖鍗″彿瀛樺湪鏈煡涔辩爜瀛楃", count: "4", pct: 33 }
            ];
            errorsForReason = {
              0: [
                "ROW_48_COL_1", "ROW_112_COL_1", "ROW_256_COL_1", "ROW_380_COL_1", "ROW_415_COL_1",
                "ROW_589_COL_1", "ROW_642_COL_1", "ROW_711_COL_1", "ROW_853_COL_1", "ROW_924_COL_1"
              ],
              1: [
                "ROW_12_COL_3", "ROW_95_COL_3", "ROW_180_COL_3", "ROW_202_COL_3", "ROW_315_COL_3",
                "ROW_424_COL_3", "ROW_511_COL_3", "ROW_672_COL_3", "ROW_743_COL_3", "ROW_890_COL_3"
              ]
            };
          } else if (category === "妫€鏌ヤ俊鎭?) {
            reasons = [
              { text: "妫€鏌ョ敵璇峰崟鍙峰寘鍚笉鍙В鏋愭牸寮?, count: "10", pct: 50 },
              { text: "妫€鏌ユ椂闂存牸寮忛潪鏍囧噯(鏃犳硶鑷姩瀵归綈鍒板勾)", count: "10", pct: 50 }
            ];
            errorsForReason = {
              0: [
                "ROW_33_COL_1", "ROW_72_COL_1", "ROW_145_COL_1", "ROW_210_COL_1", "ROW_388_COL_1",
                "ROW_451_COL_1", "ROW_529_COL_1", "ROW_612_COL_1", "ROW_740_COL_1", "ROW_888_COL_1"
              ],
              1: [
                "ROW_15_COL_4", "ROW_88_COL_4", "ROW_195_COL_4", "ROW_280_COL_4", "ROW_399_COL_4",
                "ROW_501_COL_4", "ROW_615_COL_4", "ROW_722_COL_4", "ROW_834_COL_4", "ROW_945_COL_4"
              ]
            };
          } else { // 妫€楠屼俊鎭?            reasons = [
              { text: "妫€楠岀瀹ゅ強妫€楠岄」鐩紪鐮佹湭鍖归厤瀛楀吀", count: "12", pct: 60 },
              { text: "妫€楠屾暟鍊煎紓甯稿寘鍚閲嶈繍绠楃鎴栨孩鍑哄瓧绗?, count: "8", pct: 40 }
            ];
            errorsForReason = {
              0: [
                "ROW_22_COL_2", "ROW_64_COL_2", "ROW_105_COL_2", "ROW_188_COL_2", "ROW_299_COL_2",
                "ROW_312_COL_2", "ROW_480_COL_2", "ROW_590_COL_2", "ROW_688_COL_2", "ROW_820_COL_2"
              ],
              1: [
                "ROW_40_COL_5", "ROW_99_COL_5", "ROW_150_COL_5", "ROW_233_COL_5", "ROW_345_COL_5",
                "ROW_412_COL_5", "ROW_520_COL_5", "ROW_631_COL_5", "ROW_755_COL_5", "ROW_902_COL_5"
              ]
            };
          }
        }

        const activeErrors = errorsForReason[selectedFailureReasonIdx] || [];

        return (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="failure_details_modal">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-300 max-w-4xl w-full overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between shrink-0">
                <h3 className="font-black text-sm uppercase tracking-wider">澶辫触璇︽儏</h3>
                <button 
                  onClick={() => setFailureDetailsModal(null)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 text-left overflow-y-auto flex-1">
                {/* Meta info bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold text-slate-700 shadow-2xs">
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">鏁版嵁妯℃€?/span>
                    <span className="text-slate-900 font-black text-sm">{failureDetailsModal.modality}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">鍒嗙被</span>
                    <span className="text-slate-900 font-black text-sm">{failureDetailsModal.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">澶辫触鏁?/span>
                    <span className="text-rose-600 font-black text-sm">{failureDetailsModal.failure}</span>
                  </div>
                </div>

                {/* Left and Right splits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Left panel: 澶辫触鍘熷洜鍒嗗竷 */}
                  <div className="space-y-3">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest block border-l-4 border-rose-500 pl-2">
                      澶辫触鍘熷洜鍒嗗竷
                    </span>
                    <div className="space-y-3">
                      {reasons.map((item, idx) => {
                        const isSelected = selectedFailureReasonIdx === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedFailureReasonIdx(idx)}
                            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col space-y-2 ${
                              isSelected 
                                ? "bg-rose-50/60 border-rose-300 shadow-2xs" 
                                : "bg-white border-slate-200 hover:bg-slate-50/50 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex justify-between items-start text-xs font-bold text-slate-800">
                              <span className="pr-2 leading-relaxed">{item.text}</span>
                              <span className="font-mono text-slate-950 font-black shrink-0">
                                {item.count} <span className="text-rose-600 ml-1">({item.pct}%)</span>
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${isSelected ? 'bg-rose-500' : 'bg-slate-400'}`} 
                                style={{ width: `${item.pct}%` }}
                              ></div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right panel: 闂鏁版嵁鍞竴鏍囪瘑 */}
                  <div className="space-y-3">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest block border-l-4 border-rose-500 pl-2">
                      闂鏁版嵁鍞竴鏍囪瘑
                    </span>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-[350px] overflow-y-auto">
                      <ul className="space-y-1.5 divide-y divide-slate-200/40 font-bold">
                        {activeErrors.map((err, idx) => (
                          <li key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs text-slate-900">
                            <span className="font-bold text-slate-900">id</span>
                            <span className="font-mono font-black text-slate-900">{err}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
                <button 
                  onClick={() => setFailureDetailsModal(null)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl cursor-pointer transition-colors border-0 shadow-2xs"
                >
                  鍏抽棴
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= NEW MODAL: RERUN CONFIRMATION ================= */}
      {rerunConfirmTask && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="rerun_confirmation_modal">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-md w-full overflow-hidden animate-scale-up text-left">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                <h3 className="font-black text-sm uppercase tracking-wider">纭澶辫触閲嶈窇</h3>
              </div>
              <button 
                onClick={() => setRerunConfirmTask(null)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs font-bold text-amber-800">
                鎮ㄥ嵆灏嗛噸鏂版墽琛屼换鍔?<span className="font-black text-slate-900 font-mono">[{rerunConfirmTask.id}] {rerunConfirmTask.name}</span>銆?              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                閲嶈窇鎿嶄綔灏嗘竻闄ゅ師浠诲姟涓嬬殑閿欒璁℃暟锛屽苟閽堝澶辫触鐨?<span className="font-mono font-bold text-red-600">{rerunConfirmTask.failure}</span> 涓幓鏍囪瘑鍖栨枃浠跺惎鍔ㄩ噸鏂版墽琛岄€昏緫銆傛鎿嶄綔涓嶅彲閫嗭紝鏄惁缁х画锛?              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
              <button 
                onClick={() => setRerunConfirmTask(null)}
                className="px-5 py-2.5 rounded border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 uppercase tracking-wider transition-colors bg-white cursor-pointer"
              >
                鍙栨秷
              </button>
              <button 
                onClick={() => handleRerunTask(rerunConfirmTask.id)}
                className="px-6 py-2.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-amber-100 transition-colors border-0 cursor-pointer"
              >
                寮€濮嬮噸璺?              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NEW MODAL: READ-ONLY MAPPING CONFIGURATION ================= */}
      {showReadOnlyMapping && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-[110] p-4 animate-fade-in" id="read_only_mapping_modal">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-300 max-w-2xl w-full overflow-hidden animate-scale-up flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-900/50 rounded-lg text-blue-400">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">鏄犲皠閰嶇疆-灏辫瘖骞撮緞</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    瀛楁: age &middot; 鏌ョ湅妯″紡 (鍙)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowReadOnlyMapping(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 text-left overflow-y-auto flex-1">
              {/* Mapping Type Option */}
              <div className="space-y-1.5 border-b border-slate-100 pb-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">鏄犲皠鏂瑰紡</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-not-allowed opacity-90">
                    <input 
                      type="radio" 
                      checked={true}
                      readOnly
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
                    />
                    <span className="text-xs font-bold text-slate-800">鍖洪棿鏄犲皠 (鍖洪棿娈?&rarr; 鍗曞€?</span>
                  </label>
                </div>
              </div>

              {/* Rules List */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest block">
                  娉涘寲鏄犲皠瑙勫垯 (Mapping Rules)
                </span>
                <div className="space-y-2.5">
                  {[
                    { index: 1, range: "18 - 29", target: "闈掑勾" },
                    { index: 2, range: "30 - 59", target: "涓勾" },
                    { index: 3, range: "60 - 100", target: "鑰佸勾" }
                  ].map((rule) => (
                    <div key={rule.index} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-200 text-slate-700 font-black text-xs shrink-0">
                        {rule.index}
                      </div>
                      <div className="flex-1 grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-5 space-y-1">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">鍘熷鍖洪棿 (宀?</span>
                          <div className="text-xs font-black text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 select-none shadow-3xs">
                            {rule.range}
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center justify-center text-slate-400 font-bold text-base pt-4">
                          &rarr;
                        </div>
                        <div className="col-span-5 space-y-1">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">鐩爣娉涘寲鍊?/span>
                          <div className="text-xs font-black text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 select-none shadow-3xs">
                            {rule.target}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button 
                onClick={() => setShowReadOnlyMapping(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl cursor-pointer transition-colors border-0"
              >
                鍏抽棴
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
